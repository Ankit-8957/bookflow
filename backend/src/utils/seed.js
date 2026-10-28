const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const connectDB = require('../config/db');
const { User, Book, Ticket } = require('../models');
const dataset = require('../../data/bookleaf_dataset_full.json');

async function seedDatabase() {
  console.log('🌱 Connecting to MongoDB for seeding...');
  await connectDB();

  console.log('🧹 Clearing existing collections...');
  await User.deleteMany({});
  await Book.deleteMany({});
  await Ticket.deleteMany({});

  const defaultAuthorPassword = await bcrypt.hash('author123', 10);
  const defaultAdminPassword = await bcrypt.hash('admin123', 10);

  // 1. Create Admin User
  const adminUser = await User.create({
    name: 'Sarah Connor (Admin)',
    email: 'admin@bookleaf.com',
    passwordHash: defaultAdminPassword,
    role: 'ADMIN',
    city: 'Delhi',
    phone: '+91-98111-22334',
  });
  console.log(`✅ Admin account created: ${adminUser.email} / admin123`);

  // 2. Create Authors and Books from Dataset
  const authorUsers = [];
  const createdBooks = [];

  for (const authorData of dataset.authors) {
    const authorUser = await User.create({
      name: authorData.name,
      email: authorData.email.toLowerCase(),
      passwordHash: defaultAuthorPassword,
      role: 'AUTHOR',
      authorId: authorData.author_id,
      phone: authorData.phone,
      city: authorData.city,
      joinedDate: authorData.joined_date ? new Date(authorData.joined_date) : new Date(),
    });

    authorUsers.push(authorUser);

    for (const bookData of authorData.books) {
      const book = await Book.create({
        bookId: bookData.book_id,
        authorId: authorData.author_id,
        userId: authorUser._id,
        title: bookData.title,
        isbn: bookData.isbn,
        genre: bookData.genre,
        publicationDate: bookData.publication_date,
        status: bookData.status,
        mrp: bookData.mrp || 0,
        authorRoyaltyPerCopy: bookData.author_royalty_per_copy || 0,
        totalCopiesSold: bookData.total_copies_sold || 0,
        totalRoyaltyEarned: bookData.total_royalty_earned || 0,
        royaltyPaid: bookData.royalty_paid || 0,
        royaltyPending: bookData.royalty_pending || 0,
        lastRoyaltyPayoutDate: bookData.last_royalty_payout_date || null,
        printPartner: bookData.print_partner || 'In-House',
        availableOn: bookData.available_on || ['BookLeaf Store'],
      });
      createdBooks.push(book);
    }
  }

  console.log(`✅ Seeded ${authorUsers.length} Authors and ${createdBooks.length} Books.`);

  // 3. Create Seed Tickets Covering Real-World Publishing Scenarios & Edge Cases
  const priya = authorUsers.find((u) => u.authorId === 'AUTH001');
  const rohit = authorUsers.find((u) => u.authorId === 'AUTH002');
  const ananya = authorUsers.find((u) => u.authorId === 'AUTH003');
  const vikram = authorUsers.find((u) => u.authorId === 'AUTH004');

  const priyaBook = createdBooks.find((b) => b.bookId === 'BK001');
  const rohitBook = createdBooks.find((b) => b.bookId === 'BK004');
  const ananyaBook = createdBooks.find((b) => b.bookId === 'BK005');
  const vikramBook = createdBooks.find((b) => b.bookId === 'BK007');

  const sampleTickets = [
    {
      ticketNumber: 'TCK-1001',
      authorId: priya.authorId,
      userId: priya._id,
      authorName: priya.name,
      authorEmail: priya.email,
      bookId: priyaBook.bookId,
      bookTitle: priyaBook.title,
      subject: 'Royalty statement clarification for Q3 payout',
      description:
        'I noticed my Q3 royalty statement did not include the Amazon UK paperbacks for "Whispers of the Ganges". Could you please confirm if those have reconciled?',
      category: 'Royalty & Payments',
      priority: 'High',
      status: 'Open',
      aiCategory: 'Royalty & Payments',
      aiPriority: 'High',
      aiReason: 'Author requests clarification on missing international royalty reconciliation for Q3.',
      messages: [
        {
          senderId: priya._id.toString(),
          senderName: priya.name,
          senderRole: 'AUTHOR',
          text: 'I noticed my Q3 royalty statement did not include the Amazon UK paperbacks for "Whispers of the Ganges". Could you please confirm if those have reconciled?',
          createdAt: new Date(Date.now() - 3600000 * 4),
        },
      ],
      internalNotes: [
        {
          adminId: adminUser._id.toString(),
          adminName: 'Sarah Connor',
          note: 'Checked IngramSpark logs. International quarterly feed for UK reconciles on 28th.',
          createdAt: new Date(Date.now() - 3600000 * 3),
        },
      ],
    },
    {
      ticketNumber: 'TCK-1002',
      authorId: rohit.authorId,
      userId: rohit._id,
      authorName: rohit.name,
      authorEmail: rohit.email,
      bookId: rohitBook.bookId,
      bookTitle: rohitBook.title,
      subject: 'Urgent: ISBN discrepancy on Amazon India listing',
      description:
        'Amazon India is showing a different ISBN number for "Startup Sutra" than the one printed on my physical copies. Readers are complaining about wrong metadata.',
      category: 'ISBN & Metadata Issues',
      priority: 'Critical',
      status: 'In Progress',
      aiCategory: 'ISBN & Metadata Issues',
      aiPriority: 'Critical',
      aiReason: 'Severe metadata error on a live marketplace affecting catalog integrity.',
      assignedTo: {
        userId: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
      },
      messages: [
        {
          senderId: rohit._id.toString(),
          senderName: rohit.name,
          senderRole: 'AUTHOR',
          text: 'Amazon India is showing a different ISBN number for "Startup Sutra" than the one printed on my physical copies. Readers are complaining about wrong metadata.',
          createdAt: new Date(Date.now() - 86400000),
        },
        {
          senderId: adminUser._id.toString(),
          senderName: 'Sarah Connor',
          senderRole: 'ADMIN',
          text: 'Hi Rohit, thank you for alerting us immediately. We have logged this critical discrepancy with our production & distribution feeds team. A manual catalog update has been pushed to Amazon IN and should reflect within 24–48 hours.',
          createdAt: new Date(Date.now() - 3600000 * 20),
        },
      ],
      internalNotes: [
        {
          adminId: adminUser._id.toString(),
          adminName: 'Sarah Connor',
          note: 'Escalated to Repro metadata team. Amazon flat file re-uploaded with correct ISBN 978-93-5XXXX-04-2.',
          createdAt: new Date(Date.now() - 3600000 * 21),
        },
      ],
    },
    {
      ticketNumber: 'TCK-1003',
      authorId: ananya.authorId,
      userId: ananya._id,
      authorName: ananya.name,
      authorEmail: ananya.email,
      bookId: ananyaBook.bookId,
      bookTitle: ananyaBook.title,
      subject: 'Author copies received with misaligned binding',
      description:
        'I received the 10 author copies of "Between Two Temples" today. The cover spine is slightly misaligned and pages 45-52 have blurry ink. Can I request a reprint?',
      category: 'Printing & Quality',
      priority: 'High',
      status: 'Open',
      aiCategory: 'Printing & Quality',
      aiPriority: 'High',
      aiReason: 'Physical defect reported on author shipment requiring verification and reprint.',
      messages: [
        {
          senderId: ananya._id.toString(),
          senderName: ananya.name,
          senderRole: 'AUTHOR',
          text: 'I received the 10 author copies of "Between Two Temples" today. The cover spine is slightly misaligned and pages 45-52 have blurry ink. Can I request a reprint?',
          createdAt: new Date(Date.now() - 3600000 * 12),
        },
      ],
      internalNotes: [],
    },
    {
      ticketNumber: 'TCK-1004',
      authorId: vikram.authorId,
      userId: vikram._id,
      authorName: vikram.name,
      authorEmail: vikram.email,
      bookId: null,
      bookTitle: null,
      subject: 'Updating author bio and website link on author profile',
      description:
        'Hi BookLeaf team, I recently launched a personal blog and would like to update my author bio and social links displayed on the BookLeaf Store.',
      category: 'General Inquiry',
      priority: 'Low',
      status: 'Resolved',
      aiCategory: 'General Inquiry',
      aiPriority: 'Low',
      aiReason: 'Informational bio and metadata update inquiry.',
      assignedTo: {
        userId: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
      },
      messages: [
        {
          senderId: vikram._id.toString(),
          senderName: vikram.name,
          senderRole: 'AUTHOR',
          text: 'Hi BookLeaf team, I recently launched a personal blog and would like to update my author bio and social links displayed on the BookLeaf Store.',
          createdAt: new Date(Date.now() - 86400000 * 3),
        },
        {
          senderId: adminUser._id.toString(),
          senderName: 'Sarah Connor',
          senderRole: 'ADMIN',
          text: 'Hello Vikram, we have updated your author bio and website across the BookLeaf Store! Please allow 24 hours for local caching to clear. Best wishes with your new blog!',
          createdAt: new Date(Date.now() - 86400000 * 2),
        },
      ],
      internalNotes: [
        {
          adminId: adminUser._id.toString(),
          adminName: 'Sarah Connor',
          note: 'Store CMS updated with new bio and link.',
          createdAt: new Date(Date.now() - 86400000 * 2),
        },
      ],
    },
  ];

  for (const t of sampleTickets) {
    await Ticket.create(t);
  }

  console.log(`✅ Seeded ${sampleTickets.length} Initial Support Tickets.`);
  console.log('🎉 Database seeding completed successfully!');
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
