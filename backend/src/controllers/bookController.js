const bookService = require('../services/bookService');
const { successResponse } = require('../utils/apiResponse');

exports.getMyBooks = async (req, res, next) => {
  try {
    const books = await bookService.getBooksByAuthor(req.user);
    return successResponse(res, books);
  } catch (err) {
    next(err);
  }
};

exports.getAllBooks = async (req, res, next) => {
  try {
    const books = req.user.role === 'ADMIN'
      ? await bookService.getAllBooks()
      : await bookService.getBooksByAuthor(req.user);
    return successResponse(res, books);
  } catch (err) {
    next(err);
  }
};

exports.getBookById = async (req, res, next) => {
  try {
    const book = await bookService.getBookById(req.params.id, req.user);
    return successResponse(res, book);
  } catch (err) {
    next(err);
  }
};
