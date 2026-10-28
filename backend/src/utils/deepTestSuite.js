const http = require('http');
const mongoose = require('mongoose');
const app = require('../app');
const connectDB = require('../config/db');
const { User, Book, Ticket } = require('../models');
const { classifyTicket } = require('../ai/classificationService');
const { generateDraftResponse } = require('../ai/responseService');
const openai = require('../ai/openaiClient');

async function runDeepTestSuite() {
  console.log('===============================================================');
  console.log('🧪 BOOKLEAF PORTAL: DEEP VERIFICATION & SECURITY TEST SUITE');
  console.log('===============================================================\n');

  await connectDB();

  const server = http.createServer(app);
  const testPort = 5088;
  await new Promise((resolve) => server.listen(testPort, resolve));
  const baseUrl = `http://localhost:${testPort}/api`;

  let createdTestTicketId = null;

  async function apiRequest(endpoint, { method = 'GET', body, headers = {} } = {}) {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, headers: res.headers, data: json };
  }

  const results = [];

  function recordTest(name, passed, detail = '') {
    results.push({ name, passed, detail });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} | ${name} ${detail ? `(${detail})` : ''}`);
  }

  try {
    // -------------------------------------------------------------------------
    // SECTION 1: AUTHENTICATION DEEP TESTS
    // -------------------------------------------------------------------------
    console.log('\n--- SECTION 1: AUTHENTICATION DEEP TESTS ---');

    // 1.1 Author valid login
    const authorRes = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: 'priya.sharma@email.com', password: 'author123' },
    });
    const authorToken = authorRes.data?.data?.token;
    const authorId = authorRes.data?.data?.user?.id;
    recordTest(
      'Valid author login succeeds',
      authorRes.status === 200 && !!authorToken && !authorRes.data?.data?.user?.passwordHash,
      `Status ${authorRes.status}, user: ${authorRes.data?.data?.user?.name}`
    );

    // 1.2 Admin valid login
    const adminRes = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: 'admin@bookleaf.com', password: 'admin123' },
    });
    const adminToken = adminRes.data?.data?.token;
    recordTest(
      'Valid admin login succeeds',
      adminRes.status === 200 && !!adminToken && adminRes.data?.data?.user?.role === 'ADMIN',
      `Status ${adminRes.status}`
    );

    // 1.3 Incorrect password rejected
    const badPass = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: 'priya.sharma@email.com', password: 'wrongpassword' },
    });
    recordTest(
      'Incorrect password rejected with 401',
      badPass.status === 401,
      `Expected 401, got ${badPass.status}`
    );

    // 1.4 Nonexistent email rejected
    const noEmail = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: 'doesnotexist@bookleaf.com', password: 'password123' },
    });
    recordTest(
      'Nonexistent email rejected with 401',
      noEmail.status === 401,
      `Expected 401, got ${noEmail.status}`
    );

    // 1.5 Missing fields rejected
    const emptyCreds = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: '', password: '' },
    });
    recordTest(
      'Empty credentials rejected with 400',
      emptyCreds.status === 400,
      `Expected 400, got ${emptyCreds.status}`
    );

    // 1.6 Invalid email format rejected
    const badEmailFormat = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: 'notanemail', password: 'password123' },
    });
    recordTest(
      'Invalid email format rejected with 400',
      badEmailFormat.status === 400,
      `Expected 400, got ${badEmailFormat.status}`
    );

    // 1.7 Malformed JWT rejected
    const badTokenRes = await apiRequest('/auth/me', {
      headers: { Authorization: 'Bearer invalid.token.payload' },
    });
    recordTest(
      'Malformed JWT rejected with 401',
      badTokenRes.status === 401,
      `Expected 401, got ${badTokenRes.status}`
    );

    // 1.8 Unauthenticated access rejected
    const unauthRes = await apiRequest('/books/my');
    recordTest(
      'Unauthenticated request rejected with 401',
      unauthRes.status === 401,
      `Expected 401, got ${unauthRes.status}`
    );

    // 1.9 Cookie-based authentication check
    const cookieHeader = authorRes.headers.get('set-cookie');
    recordTest(
      'HTTP-only cookie set on login',
      !!cookieHeader && cookieHeader.includes('bookleaf_token'),
      `Cookie flag: ${cookieHeader ? 'Set-Cookie present' : 'None'}`
    );

    // 1.10 Logout clears session
    const logoutRes = await apiRequest('/auth/logout', { method: 'POST' });
    recordTest(
      'Logout endpoint clears cookie and returns 200',
      logoutRes.status === 200,
      `Status ${logoutRes.status}`
    );

    // -------------------------------------------------------------------------
    // SECTION 2: ROLE-BASED ACCESS CONTROL & ISOLATION
    // -------------------------------------------------------------------------
    console.log('\n--- SECTION 2: RBAC & DATA ISOLATION TESTS ---');

    // 2.1 Author blocked from /api/admin/dashboard
    const authorAdminDash = await apiRequest('/admin/dashboard', {
      headers: { Authorization: `Bearer ${authorToken}` },
    });
    recordTest(
      'Author blocked from /api/admin/dashboard (403)',
      authorAdminDash.status === 403,
      `Expected 403, got ${authorAdminDash.status}`
    );

    // 2.2 Author blocked from /api/admin/tickets
    const authorAdminTickets = await apiRequest('/admin/tickets', {
      headers: { Authorization: `Bearer ${authorToken}` },
    });
    recordTest(
      'Author blocked from /api/admin/tickets (403)',
      authorAdminTickets.status === 403,
      `Expected 403, got ${authorAdminTickets.status}`
    );

    // 2.3 Author blocked from generating AI drafts
    const authorAiDraft = await apiRequest('/admin/tickets/any-id/ai-draft', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authorToken}` },
      body: { tone: 'empathetic' },
    });
    recordTest(
      'Author blocked from admin AI draft endpoint (403)',
      authorAiDraft.status === 403,
      `Expected 403, got ${authorAiDraft.status}`
    );

    // 2.4 Rohit (Author 2) login
    const rohitRes = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: 'rohit.kapoor@email.com', password: 'author123' },
    });
    const rohitToken = rohitRes.data?.data?.token;

    // 2.5 Multi-tenant book isolation
    const priyaBooks = await apiRequest('/books/my', {
      headers: { Authorization: `Bearer ${authorToken}` },
    });
    const rohitBooks = await apiRequest('/books/my', {
      headers: { Authorization: `Bearer ${rohitToken}` },
    });
    const priyaBookIds = (priyaBooks.data?.data || []).map((b) => b.bookId);
    const rohitBookIds = (rohitBooks.data?.data || []).map((b) => b.bookId);
    const hasOverlap = priyaBookIds.some((id) => rohitBookIds.includes(id));
    recordTest(
      'Author book catalog strict multi-tenant isolation',
      !hasOverlap && priyaBookIds.length > 0 && rohitBookIds.length > 0,
      `Priya books: [${priyaBookIds.join(', ')}], Rohit books: [${rohitBookIds.join(', ')}]`
    );

    // 2.6 Author blocked from attaching another author's book
    const crossBookAttempt = await apiRequest('/tickets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authorToken}` },
      body: {
        subject: 'Inquiry on book that is not mine',
        description: 'Trying to link Rohit book to Priya ticket',
        bookId: rohitBookIds[0],
      },
    });
    recordTest(
      'Author blocked from linking another author\'s book to ticket (403)',
      crossBookAttempt.status === 403,
      `Expected 403, got ${crossBookAttempt.status}`
    );

    // -------------------------------------------------------------------------
    // SECTION 3: TICKET LIFECYCLE & VALIDATION
    // -------------------------------------------------------------------------
    console.log('\n--- SECTION 3: TICKET LIFECYCLE & VALIDATION ---');

    // 3.1 Missing subject rejected
    const noSubject = await apiRequest('/tickets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authorToken}` },
      body: { subject: '', description: 'Some description' },
    });
    recordTest(
      'Ticket without subject rejected with 400',
      noSubject.status === 400,
      `Expected 400, got ${noSubject.status}`
    );

    // 3.2 Missing description rejected
    const noDesc = await apiRequest('/tickets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authorToken}` },
      body: { subject: 'Some subject', description: '' },
    });
    recordTest(
      'Ticket without description rejected with 400',
      noDesc.status === 400,
      `Expected 400, got ${noDesc.status}`
    );

    // 3.3 Valid ticket creation with general / account level
    const validTicketRes = await apiRequest('/tickets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authorToken}` },
      body: {
        subject: 'General author profile update request [TEST SUITE]',
        description: 'Hello BookLeaf team, I would like to verify how to link my updated bank account for the next payout cycle.',
        bookId: null,
      },
    });
    const createdTicket = validTicketRes.data?.data;
    if (createdTicket) {
      createdTestTicketId = createdTicket._id;
    }
    recordTest(
      'Valid ticket created and persisted in MongoDB',
      validTicketRes.status === 201 && !!createdTicket?._id,
      `Ticket #${createdTicket?.ticketNumber}, Category: ${createdTicket?.category}, Priority: ${createdTicket?.priority}`
    );

    // 3.4 Cross-author ticket read attempt blocked
    const crossTicketRead = await apiRequest(`/tickets/${createdTestTicketId}`, {
      headers: { Authorization: `Bearer ${rohitToken}` },
    });
    recordTest(
      'Author B blocked from viewing Author A ticket (403)',
      crossTicketRead.status === 403,
      `Expected 403, got ${crossTicketRead.status}`
    );

    // 3.5 Author views own ticket
    const authorTicketView = await apiRequest(`/tickets/${createdTestTicketId}`, {
      headers: { Authorization: `Bearer ${authorToken}` },
    });
    recordTest(
      'Author views own ticket details successfully (200)',
      authorTicketView.status === 200 && authorTicketView.data?.data?._id === createdTestTicketId,
      `Status: ${authorTicketView.status}`
    );

    // 3.6 Author adds follow-up message
    const authorMsgRes = await apiRequest(`/tickets/${createdTestTicketId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authorToken}` },
      body: { message: 'Here is an additional detail regarding my IFSC code.' },
    });
    recordTest(
      'Author appends message to ticket conversation (201)',
      authorMsgRes.status === 201 && authorMsgRes.data?.data?.senderRole === 'AUTHOR',
      `Message ID: ${authorMsgRes.data?.data?.id}`
    );

    // -------------------------------------------------------------------------
    // SECTION 4: ADMIN OPERATIONS & INTERNAL NOTES
    // -------------------------------------------------------------------------
    console.log('\n--- SECTION 4: ADMIN OPERATIONS & INTERNAL NOTES ---');

    // 4.1 Admin views ticket in queue
    const adminQueueRes = await apiRequest('/admin/tickets', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const queueContainsTicket = (adminQueueRes.data?.data || []).some(
      (t) => t._id === createdTestTicketId
    );
    recordTest(
      'Admin views ticket queue containing new ticket (200)',
      adminQueueRes.status === 200 && queueContainsTicket,
      `Total queue tickets: ${adminQueueRes.data?.data?.length}`
    );

    // 4.2 Admin adds internal note
    const addNoteRes = await apiRequest(`/admin/tickets/${createdTestTicketId}/notes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { note: 'CONFIDENTIAL STAFF NOTE: Verified accounts portal. Author bank account updated.' },
    });
    recordTest(
      'Admin adds private internal staff note (201)',
      addNoteRes.status === 201,
      `Note ID: ${addNoteRes.data?.data?.id}`
    );

    // 4.3 Verify internal note is NEVER visible to author
    const authorCheckNotes = await apiRequest(`/tickets/${createdTestTicketId}`, {
      headers: { Authorization: `Bearer ${authorToken}` },
    });
    recordTest(
      'SECURITY: Internal staff notes are completely hidden from author view',
      !authorCheckNotes.data?.data?.internalNotes,
      `internalNotes present: ${!!authorCheckNotes.data?.data?.internalNotes}`
    );

    // 4.4 Admin changes status, priority, and category overrides
    const patchStatus = await apiRequest(`/admin/tickets/${createdTestTicketId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'In Progress' },
    });
    const patchPriority = await apiRequest(`/admin/tickets/${createdTestTicketId}/priority`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { priority: 'High' },
    });
    const patchCategory = await apiRequest(`/admin/tickets/${createdTestTicketId}/category`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { category: 'Royalty & Payments' },
    });
    recordTest(
      'Admin overrides status, priority, and category (200)',
      patchStatus.status === 200 && patchPriority.status === 200 && patchCategory.status === 200,
      `Status: ${patchStatus.data?.data?.status}, Priority: ${patchPriority.data?.data?.priority}, Category: ${patchCategory.data?.data?.category}`
    );

    // 4.5 Admin assigns ticket to self
    const assignRes = await apiRequest(`/admin/tickets/${createdTestTicketId}/assign`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    recordTest(
      'Admin assigns ticket to self (200)',
      assignRes.status === 200 && assignRes.data?.data?.assignedTo?.name === 'Sarah Connor (Admin)',
      `Assigned: ${assignRes.data?.data?.assignedTo?.name}`
    );

    // 4.6 Admin sends official reply to author
    const replyRes = await apiRequest(`/admin/tickets/${createdTestTicketId}/replies`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { message: 'Dear Priya, we have verified your linked bank details. Everything is set for the upcoming quarterly payout cycle.' },
    });
    recordTest(
      'Admin sends official support reply to author (201)',
      replyRes.status === 201,
      `Message: "${replyRes.data?.data?.text?.slice(0, 40)}..."`
    );

    // 4.7 Author verifies receiving admin reply
    const authorUpdatedView = await apiRequest(`/tickets/${createdTestTicketId}`, {
      headers: { Authorization: `Bearer ${authorToken}` },
    });
    const latestMsg = authorUpdatedView.data?.data?.messages?.slice(-1)[0];
    recordTest(
      'Author sees official admin reply in conversation thread',
      latestMsg?.senderRole === 'ADMIN' && latestMsg?.text?.includes('verified your linked bank details'),
      `Latest message role: ${latestMsg?.senderRole}`
    );

    // -------------------------------------------------------------------------
    // SECTION 5: REAL OPENAI API & KNOWLEDGE BASE VERIFICATION
    // -------------------------------------------------------------------------
    console.log('\n--- SECTION 5: REAL OPENAI API & KNOWLEDGE BASE VERIFICATION ---');

    console.log('Testing live OpenAI classification call...');
    let openAiCallAttempted = false;
    let openAiErrorMessage = null;
    let classificationResult = null;

    try {
      openAiCallAttempted = !!openai;
      classificationResult = await classifyTicket({
        subject: 'My ISBN on Amazon UK is showing another author book',
        description: 'Urgent metadata issue: when readers click my paperback, another title opens up.',
        bookTitle: 'Whispers of the Ganges',
      });
    } catch (e) {
      openAiErrorMessage = e.message;
    }

    recordTest(
      'AI Classification triage returns valid BookLeaf category & priority',
      classificationResult?.category === 'ISBN & Metadata Issues' &&
        (classificationResult?.priority === 'Critical' || classificationResult?.priority === 'High'),
      `Category: "${classificationResult?.category}", Priority: "${classificationResult?.priority}", Reason: "${classificationResult?.reason}"`
    );

    console.log('Testing live AI draft generation call...');
    let draftResult = null;
    try {
      draftResult = await generateDraftResponse({
        ticket: {
          ticketNumber: 'TCK-TEST',
          subject: 'Author copies have misaligned pages and blurry print',
          category: 'Printing & Quality',
          priority: 'High',
          description: 'Pages 10 to 25 are completely blurry and binding is broken.',
          messages: [{ senderRole: 'AUTHOR', text: 'Pages 10 to 25 are completely blurry and binding is broken.' }],
        },
        author: { name: 'Priya Sharma' },
        book: { title: 'Whispers of the Ganges', isbn: '978-93-5XXXX-01-1', mrp: 399 },
        tone: 'empathetic',
      });
    } catch (e) {
      openAiErrorMessage = e.message;
    }

    const draftContainsPolicy =
      draftResult &&
      (draftResult.includes('reprint') || draftResult.includes('photo') || draftResult.includes('Quality Guarantee')) &&
      !draftResult.includes('As an AI');

    recordTest(
      'AI Draft follows BookLeaf Knowledge Base policy (free reprint / photo verification)',
      draftContainsPolicy,
      `Draft sample: "${draftResult ? draftResult.slice(0, 100).replace(/\n/g, ' ') : ''}..."`
    );

    // Clean up ONLY the test ticket we created
    if (createdTestTicketId) {
      await Ticket.findByIdAndDelete(createdTestTicketId);
      console.log(`\n🧹 Cleaned up isolated test ticket ${createdTestTicketId}. Pre-existing data preserved.`);
    }

    // Print Summary
    const totalPassed = results.filter((r) => r.passed).length;
    console.log('\n===============================================================');
    console.log(`TEST SUMMARY: ${totalPassed} / ${results.length} TESTS PASSED`);
    console.log('===============================================================\n');

    server.close();
    process.exit(totalPassed === results.length ? 0 : 1);
  } catch (err) {
    console.error('Fatal test error:', err);
    if (createdTestTicketId) {
      await Ticket.findByIdAndDelete(createdTestTicketId);
    }
    server.close();
    process.exit(1);
  }
}

runDeepTestSuite();
