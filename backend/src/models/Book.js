const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    bookId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    authorId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    isbn: {
      type: String,
      required: true,
      trim: true,
    },
    genre: {
      type: String,
      default: 'General',
    },
    publicationDate: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'Published & Live',
    },
    mrp: {
      type: Number,
      default: 0,
    },
    authorRoyaltyPerCopy: {
      type: Number,
      default: 0,
    },
    totalCopiesSold: {
      type: Number,
      default: 0,
    },
    totalRoyaltyEarned: {
      type: Number,
      default: 0,
    },
    royaltyPaid: {
      type: Number,
      default: 0,
    },
    royaltyPending: {
      type: Number,
      default: 0,
    },
    lastRoyaltyPayoutDate: {
      type: String,
      default: null,
    },
    printPartner: {
      type: String,
      default: 'In-House',
    },
    availableOn: {
      type: [String],
      default: ['BookLeaf Store'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Book', bookSchema);
