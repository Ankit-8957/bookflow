const { Book, Ticket, User } = require('../models');
const AppError = require('../utils/AppError');

exports.getAuthorDashboard = async (user) => {
  if (!user) {
    throw new AppError('Unauthorized', 401);
  }

  const bookQuery = user.authorId
    ? { $or: [{ authorId: user.authorId }, { userId: user._id }] }
    : { userId: user._id };

  const books = await Book.find(bookQuery);

  const publishedBooksCount = books.filter((b) =>
    (b.status || '').toLowerCase().includes('published')
  ).length;

  const totalCopiesSold = books.reduce((sum, b) => sum + (b.totalCopiesSold || 0), 0);
  const totalRoyaltyEarned = books.reduce((sum, b) => sum + (b.totalRoyaltyEarned || 0), 0);
  const royaltyPaid = books.reduce((sum, b) => sum + (b.royaltyPaid || 0), 0);
  const royaltyPending = books.reduce((sum, b) => sum + (b.royaltyPending || 0), 0);

  const ticketQuery = user.authorId
    ? { $or: [{ authorId: user.authorId }, { userId: user._id }], status: { $in: ['Open', 'In Progress'] } }
    : { userId: user._id, status: { $in: ['Open', 'In Progress'] } };

  const activeTicketsCount = await Ticket.countDocuments(ticketQuery);

  return {
    publishedBooksCount,
    totalBooksCount: books.length,
    totalCopiesSold,
    totalRoyaltyEarned,
    royaltyPaid,
    royaltyPending,
    activeTicketsCount,
  };
};

exports.getAuthorProfile = async (user) => {
  const profile = await User.findById(user._id).select('-passwordHash');
  if (!profile) {
    throw new AppError('Author not found', 404);
  }

  return {
    id: profile._id,
    authorId: profile.authorId || null,
    name: profile.name,
    email: profile.email,
    phone: profile.phone || '',
    city: profile.city || '',
    joinedDate: profile.joinedDate || profile.createdAt,
  };
};
