const http = require('http');
const app = require('../app');
const connectDB = require('../config/db');

async function testHttpSuite() {
  console.log('🚀 Running Full HTTP REST Integration & Security Test Suite...\n');
  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  const baseUrl = 'http://localhost:5099/api';

  async function request(endpoint, options = {}) {
    const url = `${baseUrl}${endpoint}`;
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  }

  try {
    // 1. Health check
    console.log('1. Health Check');
    const health = await request('/health');
    if (health.status !== 200) throw new Error('Health check failed');
    console.log('   ✓ Health check status:', health.status);

    // 2. Author Login
    console.log('2. Author Login (Priya Sharma)');
    const authorLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'priya.sharma@email.com', password: 'author123' },
    });
    if (authorLogin.status !== 200) throw new Error('Author login failed');
    const authorToken = authorLogin.data.data.token;
    console.log('   ✓ Author logged in, token received');

    // 3. Author Profile
    console.log('3. Verify /auth/me for author');
    const me = await request('/auth/me', {
      headers: { Authorization: `Bearer ${authorToken}` },
    });
    if (me.status !== 200 || me.data.data.role !== 'AUTHOR') throw new Error('Auth me check failed');
    console.log('   ✓ Verified author profile:', me.data.data.name);

    // 4. Author Books
    console.log('4. Author GET /books/my');
    const booksRes = await request('/books/my', {
      headers: { Authorization: `Bearer ${authorToken}` },
    });
    if (booksRes.status !== 200 || !booksRes.data.data.length) throw new Error('Failed to get author books');
    console.log(`   ✓ Retrieved ${booksRes.data.data.length} books for author`);

    // 5. Author Dashboard
    console.log('5. Author GET /author/dashboard');
    const dashRes = await request('/author/dashboard', {
      headers: { Authorization: `Bearer ${authorToken}` },
    });
    if (dashRes.status !== 200) throw new Error('Author dashboard failed');
    console.log('   ✓ Dashboard stats: Total copies sold:', dashRes.data.data.totalCopiesSold, 'Pending royalties: ₹' + dashRes.data.data.royaltyPending);

    // 6. Author Creates Ticket
    console.log('6. Author POST /tickets');
    const createRes = await request('/tickets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authorToken}` },
      body: {
        subject: 'Amazon India Paperback quality issues with blurry text',
        description: 'Received defective copies where chapters 2 and 3 have faded, blurry text and binding is coming loose. Please arrange replacement copies.',
        bookId: booksRes.data.data[0].bookId,
      },
    });
    if (createRes.status !== 201) throw new Error('Ticket creation failed');
    const createdTicket = createRes.data.data;
    console.log(`   ✓ Ticket created: #${createdTicket.ticketNumber} [Predicted Category: ${createdTicket.category}, Priority: ${createdTicket.priority}]`);

    // 7. Author GET /tickets/my
    console.log('7. Author GET /tickets/my');
    const myTicketsRes = await request('/tickets/my', {
      headers: { Authorization: `Bearer ${authorToken}` },
    });
    if (myTicketsRes.status !== 200 || !myTicketsRes.data.data.length) throw new Error('My tickets failed');
    console.log(`   ✓ Author sees ${myTicketsRes.data.data.length} tickets in personal list`);

    // 8. Admin Login
    console.log('8. Admin Login (Sarah Connor)');
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'admin@bookleaf.com', password: 'admin123' },
    });
    if (adminLogin.status !== 200) throw new Error('Admin login failed');
    const adminToken = adminLogin.data.data.token;
    console.log('   ✓ Admin logged in');

    // 9. Admin Dashboard
    console.log('9. Admin GET /admin/dashboard');
    const adminDash = await request('/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (adminDash.status !== 200) throw new Error('Admin dashboard failed');
    console.log(`   ✓ Operational Metrics: Total=${adminDash.data.data.totalTickets}, Open=${adminDash.data.data.openTickets}, Critical/High=${adminDash.data.data.criticalHighTickets}`);

    // 10. Admin Ticket Queue with Filters
    console.log('10. Admin GET /admin/tickets');
    const queueRes = await request('/admin/tickets?priority=High', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (queueRes.status !== 200) throw new Error('Admin queue failed');
    console.log(`   ✓ Filtered queue returned ${queueRes.data.data.length} High priority tickets`);

    // 11. Admin AI Draft
    console.log('11. Admin POST /admin/tickets/:id/ai-draft');
    const draftRes = await request(`/admin/tickets/${createdTicket._id}/ai-draft`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { tone: 'empathetic' },
    });
    if (draftRes.status !== 200 || !draftRes.data.data.draft) throw new Error('AI draft generation failed');
    console.log('   ✓ AI Draft generated:\n' + draftRes.data.data.draft.split('\n').slice(0, 5).join('\n') + '...');

    // 12. Admin Adds Internal Note
    console.log('12. Admin POST /admin/tickets/:id/notes');
    const noteRes = await request(`/admin/tickets/${createdTicket._id}/notes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { note: 'Delhi press batch #409 audited. Replacement copies scheduled.' },
    });
    if (noteRes.status !== 201) throw new Error('Add internal note failed');
    console.log('   ✓ Internal note added by admin');

    // 13. Admin Sends Response
    console.log('13. Admin POST /admin/tickets/:id/replies');
    const replyRes = await request(`/admin/tickets/${createdTicket._id}/replies`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { message: 'Dear Priya, we apologize for the print defect. Under our Quality Guarantee, we have initiated a free reprint that will dispatch within 5–7 business days.' },
    });
    if (replyRes.status !== 201) throw new Error('Send reply failed');
    console.log('   ✓ Official reply sent to author');

    // 14. Admin Overrides Category, Priority, and Status
    console.log('14. Admin PATCH status, category, priority');
    const statusRes = await request(`/admin/tickets/${createdTicket._id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'In Progress' },
    });
    const priorityRes = await request(`/admin/tickets/${createdTicket._id}/priority`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { priority: 'Critical' },
    });
    if (statusRes.status !== 200 || priorityRes.status !== 200) throw new Error('Admin override failed');
    console.log('   ✓ Status & Priority updated to In Progress and Critical');

    // 15. Security & Isolation Check: Author views ticket
    console.log('15. Author views ticket (Security Check)');
    const authorView = await request(`/tickets/${createdTicket._id}`, {
      headers: { Authorization: `Bearer ${authorToken}` },
    });
    if (authorView.status !== 200) throw new Error('Author cannot view own ticket');
    if (authorView.data.data.internalNotes) throw new Error('SECURITY VIOLATION: Internal notes leaked to author!');
    console.log('   ✓ Author received reply. Internal notes successfully hidden!');

    // 16. Security Check: Author blocked from admin endpoints
    console.log('16. Author RBAC Check: Calling /api/admin/tickets as author');
    const forbiddenRes = await request('/admin/tickets', {
      headers: { Authorization: `Bearer ${authorToken}` },
    });
    if (forbiddenRes.status !== 403) throw new Error(`RBAC failed! Expected 403, got ${forbiddenRes.status}`);
    console.log('   ✓ Author access to /api/admin/tickets blocked (403 Forbidden)');

    // 17. Security Check: Author A blocked from Author B ticket
    console.log('17. Multi-tenant Author Isolation Check');
    const rohitLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'rohit.kapoor@email.com', password: 'author123' },
    });
    const rohitToken = rohitLogin.data.data.token;
    const rohitAttemptPriyaTicket = await request(`/tickets/${createdTicket._id}`, {
      headers: { Authorization: `Bearer ${rohitToken}` },
    });
    if (rohitAttemptPriyaTicket.status !== 403) throw new Error(`Author isolation failed! Expected 403, got ${rohitAttemptPriyaTicket.status}`);
    console.log('   ✓ Cross-author ticket access correctly blocked (403 Forbidden)');

    // Cleanup test ticket
    if (createdTicket && createdTicket._id) {
      const Ticket = require('../models/Ticket');
      await Ticket.deleteOne({ _id: createdTicket._id });
      console.log('   ✓ Cleaned up test ticket:', createdTicket._id);
    }

    console.log('\n==================================================');
    console.log('🎉 ALL 17 HTTP REST, RBAC & SECURITY TESTS PASSED!');
    console.log('==================================================\n');

    server.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ HTTP Test Failure:', err.message);
    server.close();
    process.exit(1);
  }
}

testHttpSuite();
