const { Ticket, Book, User } = require('../models');
const { generateTicketResponse } = require('../ai/aiService');
const { getIO } = require('../config/socket');
const AppError = require('../utils/AppError');

// Priority weight map for database sorting
const PRIORITY_WEIGHTS = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

const normalizeStatus = (val) => {
  if (!val) return 'Open';
  const s = String(val).trim().toLowerCase().replace(/[^a-z]/g, '');
  if (s === 'open') return 'Open';
  if (s === 'inprogress') return 'In Progress';
  if (s === 'resolved') return 'Resolved';
  if (s === 'closed') return 'Closed';
  return val;
};

const normalizePriority = (val) => {
  if (!val) return 'Medium';
  const p = String(val).trim().toLowerCase();
  if (p === 'critical' || p === 'urgent') return 'Critical';
  if (p === 'high') return 'High';
  if (p === 'medium') return 'Medium';
  if (p === 'low') return 'Low';
  return val;
};

/**
 * Returns operational metrics across all tickets.
 */
exports.getAdminMetrics = async () => {
  const [total, open, inProgress, resolved, closed, unassigned, criticalHigh] = await Promise.all([
    Ticket.countDocuments(),
    Ticket.countDocuments({ status: 'Open' }),
    Ticket.countDocuments({ status: 'In Progress' }),
    Ticket.countDocuments({ status: 'Resolved' }),
    Ticket.countDocuments({ status: 'Closed' }),
    Ticket.countDocuments({ 'assignedTo.userId': null, status: { $ne: 'Closed' } }),
    Ticket.countDocuments({ priority: { $in: ['Critical', 'High'] }, status: { $ne: 'Closed' } }),
  ]);

  return {
    totalTickets: total,
    openTickets: open,
    inProgressTickets: inProgress,
    resolvedTickets: resolved,
    closedTickets: closed,
    unassignedTickets: unassigned,
    criticalHighTickets: criticalHigh,
  };
};

/**
 * Retrieves the ticket queue with multi-dimensional filtering and prioritized sorting.
 */
exports.getQueue = async (filters = {}) => {
  const query = {};

  if (filters.status && filters.status !== 'ALL') {
    query.status = normalizeStatus(filters.status);
  }

  if (filters.category && filters.category !== 'ALL') {
    query.category = filters.category;
  }

  if (filters.priority && filters.priority !== 'ALL') {
    query.priority = normalizePriority(filters.priority);
  }

  if (filters.date) {
    const startDate = new Date(filters.date);
    const endDate = new Date(filters.date);
    endDate.setDate(endDate.getDate() + 1);
    query.createdAt = { $gte: startDate, $lt: endDate };
  }

  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim();
    query.$or = [
      { ticketNumber: { $regex: q, $options: 'i' } },
      { subject: { $regex: q, $options: 'i' } },
      { authorName: { $regex: q, $options: 'i' } },
      { authorEmail: { $regex: q, $options: 'i' } },
    ];
  }

  const tickets = await Ticket.find(query).lean();

  // Sort: Critical first -> High -> Medium -> Low, then oldest unresolved first
  return tickets.sort((a, b) => {
    // Unresolved tickets come before Closed/Resolved
    const isUnresolvedA = a.status === 'Open' || a.status === 'In Progress' ? 1 : 0;
    const isUnresolvedB = b.status === 'Open' || b.status === 'In Progress' ? 1 : 0;
    if (isUnresolvedA !== isUnresolvedB) {
      return isUnresolvedB - isUnresolvedA;
    }

    // Priority ordering
    const weightA = PRIORITY_WEIGHTS[a.priority] || 0;
    const weightB = PRIORITY_WEIGHTS[b.priority] || 0;
    if (weightA !== weightB) {
      return weightB - weightA;
    }

    // Oldest first for unresolved tickets to prevent SLAs from expiring
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
};

/**
 * Retrieves single ticket with full admin context including internalNotes.
 */
exports.getTicketById = async (id) => {
  const isObjectId = id && typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: id } : { ticketNumber: id };

  const ticket = await Ticket.findOne(query);
  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  return ticket;
};

/**
 * Updates ticket status.
 */
exports.updateTicketStatus = async (ticketId, status) => {
  const normalized = normalizeStatus(status);
  const allowed = ['Open', 'In Progress', 'Resolved', 'Closed'];
  if (!allowed.includes(normalized)) {
    throw new AppError(`Invalid status. Allowed values: ${allowed.join(', ')}`, 400);
  }

  const isObjectId = ticketId && typeof ticketId === 'string' && ticketId.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: ticketId } : { ticketNumber: ticketId };

  const ticket = await Ticket.findOneAndUpdate(
    query,
    { status: normalized },
    { returnDocument: 'after' }
  );

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  // Real-time broadcast
  try {
    const io = getIO();
    io.to(`ticket:${ticket._id}`).emit('ticket_updated', ticket);
    io.to(`ticket:${ticket.ticketNumber}`).emit('ticket_updated', ticket);
    io.emit('ticket_updated', ticket);
  } catch (err) {}

  return ticket;
};

/**
 * Updates ticket category (manual admin override).
 */
exports.updateTicketCategory = async (ticketId, category) => {
  const isObjectId = ticketId && typeof ticketId === 'string' && ticketId.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: ticketId } : { ticketNumber: ticketId };

  const ticket = await Ticket.findOneAndUpdate(
    query,
    { category },
    { returnDocument: 'after' }
  );

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  try {
    const io = getIO();
    io.to(`ticket:${ticket._id}`).emit('ticket_updated', ticket);
    io.emit('ticket_updated', ticket);
  } catch (err) {}

  return ticket;
};

/**
 * Updates ticket priority (manual admin override).
 */
exports.updateTicketPriority = async (ticketId, priority) => {
  const normalized = normalizePriority(priority);
  const allowed = ['Critical', 'High', 'Medium', 'Low'];
  if (!allowed.includes(normalized)) {
    throw new AppError(`Invalid priority. Allowed values: ${allowed.join(', ')}`, 400);
  }

  const isObjectId = ticketId && typeof ticketId === 'string' && ticketId.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: ticketId } : { ticketNumber: ticketId };

  const ticket = await Ticket.findOneAndUpdate(
    query,
    { priority: normalized },
    { returnDocument: 'after' }
  );

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  try {
    const io = getIO();
    io.to(`ticket:${ticket._id}`).emit('ticket_updated', ticket);
    io.emit('ticket_updated', ticket);
  } catch (err) {}

  return ticket;
};

/**
 * Assigns ticket to an admin specialist.
 */
exports.assignTicket = async (ticketId, adminUser) => {
  const isObjectId = ticketId && typeof ticketId === 'string' && ticketId.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: ticketId } : { ticketNumber: ticketId };

  const ticket = await Ticket.findOneAndUpdate(
    query,
    {
      assignedTo: {
        userId: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
      },
      status: 'In Progress',
    },
    { returnDocument: 'after' }
  );

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  try {
    const io = getIO();
    io.to(`ticket:${ticket._id}`).emit('ticket_updated', ticket);
    io.emit('ticket_updated', ticket);
  } catch (err) {}

  return ticket;
};

/**
 * Adds private internal staff note (never visible to authors).
 */
exports.addNote = async (ticketId, adminUser, noteText) => {
  if (!noteText || !noteText.trim()) {
    throw new AppError('Note text cannot be empty', 400);
  }

  const isObjectId = ticketId && typeof ticketId === 'string' && ticketId.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: ticketId } : { ticketNumber: ticketId };

  const ticket = await Ticket.findOne(query);
  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  const note = {
    adminId: adminUser._id.toString(),
    adminName: adminUser.name,
    note: noteText.trim(),
    createdAt: new Date(),
  };

  ticket.internalNotes.push(note);
  await ticket.save();

  try {
    const io = getIO();
    io.to(`ticket:${ticket._id}`).emit('ticket_updated', ticket);
  } catch (err) {}

  return note;
};

/**
 * Sends official support response to the author.
 */
exports.addResponse = async (ticketId, adminUser, responseText) => {
  if (!responseText || !responseText.trim()) {
    throw new AppError('Response text cannot be empty', 400);
  }

  const isObjectId = ticketId && typeof ticketId === 'string' && ticketId.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: ticketId } : { ticketNumber: ticketId };

  const ticket = await Ticket.findOne(query);
  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  const message = {
    senderId: adminUser._id.toString(),
    senderName: adminUser.name,
    senderRole: 'ADMIN',
    text: responseText.trim(),
    createdAt: new Date(),
  };

  ticket.messages.push(message);
  // If still Open, advance status to In Progress
  if (ticket.status === 'Open') {
    ticket.status = 'In Progress';
  }
  await ticket.save();

  try {
    const io = getIO();
    io.to(`ticket:${ticket._id}`).emit('new_message', message);
    io.to(`ticket:${ticket.ticketNumber}`).emit('new_message', message);
    io.emit('ticket_updated', ticket);
  } catch (err) {}

  return message;
};

/**
 * Generates contextual AI draft response using Knowledge Base.
 */
exports.generateAiDraft = async (ticketId, tone = 'empathetic') => {
  const isObjectId = ticketId && typeof ticketId === 'string' && ticketId.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: ticketId } : { ticketNumber: ticketId };

  const ticket = await Ticket.findOne(query);
  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  const [author, book] = await Promise.all([
    User.findById(ticket.userId),
    ticket.bookId ? Book.findOne({ bookId: ticket.bookId }) : null,
  ]);

  const draft = await generateTicketResponse({
    ticket,
    author,
    book,
    tone,
  });

  return draft;
};
