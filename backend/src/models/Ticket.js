const mongoose = require('mongoose');

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

const messageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true,
  },
  senderName: {
    type: String,
    default: 'User',
  },
  senderRole: {
    type: String,
    enum: ['AUTHOR', 'ADMIN', 'author', 'admin'],
    required: true,
    set: (v) => (v ? String(v).toUpperCase() : v),
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const internalNoteSchema = new mongoose.Schema({
  adminId: {
    type: String,
    required: true,
  },
  adminName: {
    type: String,
    default: 'Admin',
  },
  note: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    authorId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorEmail: {
      type: String,
      required: true,
    },
    bookId: {
      type: String,
      default: null,
    },
    bookTitle: {
      type: String,
      default: null,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'Royalty & Payments',
        'ISBN & Metadata Issues',
        'Printing & Quality',
        'Distribution & Availability',
        'Book Status & Production Updates',
        'General Inquiry',
      ],
      default: 'General Inquiry',
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
      set: normalizePriority,
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
      set: normalizeStatus,
    },
    aiCategory: {
      type: String,
      default: null,
    },
    aiPriority: {
      type: String,
      default: null,
    },
    aiReason: {
      type: String,
      default: null,
    },
    assignedTo: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      name: { type: String, default: null },
      email: { type: String, default: null },
    },
    messages: [messageSchema],
    internalNotes: [internalNoteSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Ticket', ticketSchema);
