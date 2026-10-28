const { Book } = require('../models');
const AppError = require('../utils/AppError');

exports.getBooksByAuthor = async (user) => {
  if (!user) {
    throw new AppError('User not authenticated', 401);
  }

  const query = {};
  if (user.role !== 'ADMIN') {
    if (user.authorId) {
      query.$or = [{ authorId: user.authorId }, { userId: user._id }];
    } else {
      query.userId = user._id;
    }
  }

  return Book.find(query).sort({ createdAt: -1 });
};

exports.getAllBooks = async () => {
  return Book.find().sort({ createdAt: -1 });
};

exports.getBookById = async (id, user) => {
  const isObjectId = typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: id } : { bookId: id };

  const book = await Book.findOne(query);
  if (!book) {
    throw new AppError('Book not found', 404);
  }

  if (user && user.role !== 'ADMIN') {
    const isOwner =
      (book.userId && book.userId.toString() === user._id.toString()) ||
      (user.authorId && book.authorId === user.authorId);

    if (!isOwner) {
      throw new AppError('Unauthorized access to book details', 403);
    }
  }

  return book;
};
