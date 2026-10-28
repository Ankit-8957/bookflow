const { Ticket, Book } = require('../models');
const { classifyTicket } = require('../ai/classificationService');
const { getIO } = require('../config/socket');
const AppError = require('../utils/AppError');

/**
 * Creates a ticket:
 * 1. Saves to MongoDB first
 * 2. Attempts AI classification & priority scoring
 * 3. Updates ticket with AI triage results
 * 4. Gracefully recovers if AI fails
 * 5. Emits real-time notification
 */
exports.createTicket = async (user, { subject, description, bookId }) => {
  if (!subject || !subject.trim()) {
    throw new AppError('Ticket subject is required', 400);
  }
  if (subject.trim().length > 250) {
    throw new AppError('Ticket subject cannot exceed 250 characters', 400);
  }
  if (!description || !description.trim()) {
    throw new AppError('Ticket description is required', 400);
  }
  if (description.trim().length > 10000) {
    throw new AppError('Ticket description cannot exceed 10000 characters', 400);
  }

  // Find book info if provided
  let bookTitle = null;
  let resolvedBookId = null;

  if (bookId && bookId !== 'GENERAL' && bookId !== '') {
    const isObj = typeof bookId === 'string' && bookId.match(/^[0-9a-fA-F]{24}$/);
    const book = await Book.findOne({
      $or: [{ _id: isObj ? bookId : null }, { bookId }],
    });
    if (!book) {
      throw new AppError('The selected book could not be found', 404);
    }
    if (user.role !== 'ADMIN') {
      const isOwner =
        (book.userId && book.userId.toString() === user._id.toString()) ||
        (user.authorId && book.authorId === user.authorId);
      if (!isOwner) {
        throw new AppError('Access denied: You can only raise tickets for books in your own catalog', 403);
      }
    }
    resolvedBookId = book.bookId;
    bookTitle = book.title;
  }

  // Generate unique human-readable ticket number (e.g. TCK-1045)
  const count = await Ticket.countDocuments();
  const ticketNumber = `TCK-${1001 + count}`;

  const initialMessage = {
    senderId: user._id.toString(),
    senderName: user.name,
    senderRole: 'AUTHOR',
    text: description.trim(),
    createdAt: new Date(),
  };

  // Step 1: Save ticket to MongoDB FIRST with default safe fallback values
  const ticket = await Ticket.create({
    ticketNumber,
    authorId: user.authorId || user._id.toString(),
    userId: user._id,
    authorName: user.name,
    authorEmail: user.email,
    bookId: resolvedBookId,
    bookTitle,
    subject: subject.trim(),
    description: description.trim(),
    category: 'General Inquiry',
    priority: 'Medium',
    status: 'Open',
    messages: [initialMessage],
    internalNotes: [],
  });

  // Step 2 & 3: Attempt AI classification & priority determination
  try {
    const aiResult = await classifyTicket({
      subject: ticket.subject,
      description: ticket.description,
      bookTitle,
    });

    if (aiResult) {
      ticket.category = aiResult.category || ticket.category;
      ticket.priority = aiResult.priority || ticket.priority;
      ticket.aiCategory = aiResult.category;
      ticket.aiPriority = aiResult.priority;
      ticket.aiReason = aiResult.reason;
      await ticket.save();
    }
  } catch (aiErr) {
    // Graceful recovery: log warning, keep ticket intact
    console.warn(`⚠️ AI classification could not complete for ticket ${ticketNumber}: ${aiErr.message}`);
  }

  // Step 4: Emit real-time notification to admin queue
  try {
    const io = getIO();
    io.emit('ticket_created', ticket);
  } catch (socketErr) {
    // Socket emit error does not block REST response
  }

  return ticket;
};

/**
 * Retrieves tickets for a user.
 * If user is AUTHOR:
 * - Only returns tickets belonging to them
 * - Completely strips internalNotes
 */
exports.getTicketsForUser = async (user) => {
  if (!user) {
    throw new AppError('Unauthorized', 401);
  }

  if (user.role === 'ADMIN') {
    return Ticket.find().sort({ createdAt: -1 });
  }

  const query = user.authorId
    ? { $or: [{ authorId: user.authorId }, { userId: user._id }] }
    : { userId: user._id };

  // Exclude internalNotes for authors
  const tickets = await Ticket.find(query).select('-internalNotes').sort({ createdAt: -1 });
  return tickets;
};

/**
 * Retrieves a single ticket by ID.
 * Enforces strict authorization and strips internalNotes for authors.
 */
exports.getTicketById = async (id, user) => {
  const isObjectId = typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: id } : { ticketNumber: id };

  const ticket = await Ticket.findOne(query);
  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  if (user.role !== 'ADMIN') {
    const isOwner =
      ticket.userId.toString() === user._id.toString() ||
      (user.authorId && ticket.authorId === user.authorId);

    if (!isOwner) {
      throw new AppError('Access denied: You cannot access another author\'s ticket.', 403);
    }

    // Strip internal notes for author
    const ticketObj = ticket.toObject();
    delete ticketObj.internalNotes;
    return ticketObj;
  }

  return ticket;
};

/**
 * Adds a message to a ticket conversation.
 */
exports.addMessage = async (id, user, text) => {
  if (!text || !text.trim()) {
    throw new AppError('Message text is required', 400);
  }

  const isObjectId = typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: id } : { ticketNumber: id };

  const ticket = await Ticket.findOne(query);
  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  // Authorization check for authors
  if (user.role !== 'ADMIN') {
    const isOwner =
      ticket.userId.toString() === user._id.toString() ||
      (user.authorId && ticket.authorId === user.authorId);

    if (!isOwner) {
      throw new AppError('Access denied: You cannot send messages on this ticket.', 403);
    }

    // If author responds on a resolved ticket, re-open it
    if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
      ticket.status = 'In Progress';
    }
  }

  const message = {
    senderId: user._id.toString(),
    senderName: user.name,
    senderRole: user.role,
    text: text.trim(),
    createdAt: new Date(),
  };

  ticket.messages.push(message);
  await ticket.save();

  // Real-time broadcast
  try {
    const io = getIO();
    io.to(`ticket:${ticket._id}`).emit('new_message', message);
    io.to(`ticket:${ticket.ticketNumber}`).emit('new_message', message);
    io.emit('ticket_updated', ticket);
  } catch (err) {
    // Socket emit fallback
  }

  return message;
};
