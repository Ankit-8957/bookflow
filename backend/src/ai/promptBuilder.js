const { getCategoryKnowledge, BOOKLEAF_KNOWLEDGE } = require('./knowledgeBase');

const ALLOWED_CATEGORIES = [
  'Royalty & Payments',
  'ISBN & Metadata Issues',
  'Printing & Quality',
  'Distribution & Availability',
  'Book Status & Production Updates',
  'General Inquiry',
];

const ALLOWED_PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

/**
 * Builds the structured prompt for automated ticket classification and priority scoring.
 */
function buildClassificationPrompt({ subject, description, bookTitle }) {
  return `You are an automated support ticket triage specialist for BookLeaf Publishing.
Your task is to analyze an incoming author support query and categorize it into exactly ONE category and ONE priority level.

ALLOWED CATEGORIES:
1. "Royalty & Payments" (e.g. payout delays, royalty calculation, statement clarification, bank transfer)
2. "ISBN & Metadata Issues" (e.g. wrong ISBN on Amazon/Flipkart, title/author typo on retail platform, barcode issues)
3. "Printing & Quality" (e.g. damaged copies, blurry print, binding defects, defective author copies)
4. "Distribution & Availability" (e.g. book showing "out of stock" or "currently unavailable" on Amazon/Flipkart)
5. "Book Status & Production Updates" (e.g. manuscript in typesetting/cover design, publication delays, proofs)
6. "General Inquiry" (e.g. updating author bio, marketing questions, general questions)

PRIORITY CRITERIA:
- "Critical": Urgent issues causing severe author distress or listing failures (e.g., mismatched ISBN, royalties overdue >6 months, completely broken book listing).
- "High": Significant financial or physical issues (e.g., royalty missing for a quarter, entire shipment defective, listing unavailable after launch).
- "Medium": Standard operational inquiries (e.g., routine production status check, clarification on statement, delivery question).
- "Low": Minor informational queries (e.g., author bio update, general future marketing questions).

TICKET DETAILS:
- Subject: ${subject}
- Description: ${description}
${bookTitle ? `- Associated Book: ${bookTitle}` : '- Associated Book: General / Account Level'}

OUTPUT REQUIREMENTS:
Respond ONLY with a valid JSON object matching this exact schema:
{
  "category": "<one of the 6 allowed categories>",
  "priority": "<one of Critical, High, Medium, Low>",
  "reason": "<1-2 sentence brief rationale for the triage decision>"
}`;
}

/**
 * Builds the prompt for generating an AI draft response based on the BookLeaf Knowledge Base and ticket context.
 */
function buildDraftPrompt({ ticket, author, book, tone = 'empathetic' }) {
  const categoryKnowledge = getCategoryKnowledge(ticket.category);
  const toneRules = BOOKLEAF_KNOWLEDGE.toneGuidelines.principles.join('\n- ');

  let contextDetails = '';
  if (author) {
    contextDetails += `\nAUTHOR CONTEXT:\n- Name: ${author.name || ticket.authorName}\n- Email: ${author.email || ticket.authorEmail}`;
  }
  if (book) {
    contextDetails += `\nBOOK CONTEXT:\n- Title: "${book.title}"\n- ISBN: ${book.isbn}\n- Status: ${book.status}\n- MRP: ₹${book.mrp}\n- Royalty Pending: ₹${book.royaltyPending}\n- Royalty Paid: ₹${book.royaltyPaid}\n- Copies Sold: ${book.totalCopiesSold}`;
  }

  const conversationHistory = (ticket.messages || [])
    .map((m) => `[${m.senderRole}]: ${m.text}`)
    .join('\n');

  return `You are a dedicated, senior Author Support Specialist at BookLeaf Publishing.
Write an authentic, human, empathetic, and accurate support reply to the author regarding their ticket.

DESIRED TONE: ${tone} (Options: empathetic, professional, concise)

${contextDetails}

TICKET DETAILS:
- Ticket ID: ${ticket.ticketNumber || ticket.id}
- Subject: ${ticket.subject}
- Category: ${ticket.category}
- Priority: ${ticket.priority}

CONVERSATION / INQUIRY:
${conversationHistory || ticket.description}

OFFICIAL BOOKLEAF POLICIES & KNOWLEDGE BASE:
${categoryKnowledge}

COMMUNICATION PRINCIPLES TO FOLLOW:
- ${toneRules}
- Write directly as BookLeaf Publishing Support. NEVER state "As an AI..." or "I am an artificial assistant".
- Acknowledge their situation first.
- If there is a delay or issue on BookLeaf's side, acknowledge responsibility warmly without defensiveness.
- Mention specific policies, realistic turnaround windows (e.g. 24–48 hours for stock sync, 5–7 business days for reprints, 45 days post-quarter for royalties).
- Always end with a clear next step for the author and our team.
- Provide a clean greeting and sign-off ("Warm regards,\nBookLeaf Author Support Team").`;
}

module.exports = {
  ALLOWED_CATEGORIES,
  ALLOWED_PRIORITIES,
  buildClassificationPrompt,
  buildDraftPrompt,
};
