const openai = require('./openaiClient');
const { buildDraftPrompt } = require('./promptBuilder');

/**
 * High-quality fallback response generator matching BookLeaf guidelines.
 * Used when OpenAI API is offline or unconfigured.
 */
function generateFallbackResponse({ ticket, author, book }) {
  const authorName = (author && author.name) || ticket.authorName || 'Author';
  const category = ticket.category || 'General Inquiry';
  const bookTitle = (book && book.title) || ticket.bookTitle || '';

  if (category === 'Royalty & Payments') {
    return `Dear ${authorName},

Thank you for contacting BookLeaf Author Support regarding your royalty inquiry${bookTitle ? ` for "${bookTitle}"` : ''}.

At BookLeaf Publishing, royalties are calculated on an 80/20 net profit split at the conclusion of each calendar quarter and disbursed within 45 days. Our minimum payout threshold is ₹1,000; any balance below this rolls over to the subsequent payout cycle.

${book ? `Current record summary for your title:\n- Total copies sold: ${book.totalCopiesSold}\n- Total royalties earned: ₹${book.totalRoyaltyEarned}\n- Royalty paid: ₹${book.royaltyPaid}\n- Royalty pending: ₹${book.royaltyPending}\n` : ''}
We have flagged your account with our accounts team to verify your linked bank details and confirm the transfer status. Our team will follow up within 24–48 hours with a definitive update.

Warm regards,
BookLeaf Author Support Team`;
  }

  if (category === 'ISBN & Metadata Issues') {
    return `Dear ${authorName},

Thank you for bringing this ISBN and metadata discrepancy to our attention${bookTitle ? ` regarding "${bookTitle}"` : ''}.

We treat ISBN accuracy as a high-priority matter. Every title published through BookLeaf receives a unique registered ISBN under our publisher imprint. We have escalated this directly to our production and distribution feeds team to rectify the listing on retailer channels.

We are actively investigating the metadata feed with our retail partners and will resolve this within 48 hours. No further action is required from your side at this moment.

Warm regards,
BookLeaf Author Support Team`;
  }

  if (category === 'Printing & Quality') {
    return `Dear ${authorName},

We sincerely apologize for the quality issue you experienced with your author copies${bookTitle ? ` of "${bookTitle}"` : ''}. BookLeaf takes immense pride in print standards, and we regret that your copies did not meet expectations.

Under our Quality Guarantee policy, BookLeaf arranges a free reprint for defective copies. To initiate the replacement order immediately, could you please share a few clear photos showing:
1. The defect (binding, print alignment, or color issue)
2. The copyright/ISBN page
3. The back cover barcode

Once verified by our printing team in Delhi, replacement copies will be dispatched within 5–7 business days.

Warm regards,
BookLeaf Author Support Team`;
  }

  if (category === 'Distribution & Availability') {
    return `Dear ${authorName},

Thank you for reaching out regarding the availability of "${bookTitle || 'your book'}" on retail channels.

When a published book displays as "Currently Unavailable" or "Out of Stock" on Amazon or Flipkart, it is typically an inventory feed synchronization delay between platform catalogs.

We have initiated an expedited catalog re-sync with our distribution partners. Listings typically refresh and reflect live inventory within 24 to 48 hours. We will monitor the listing and update you as soon as stock displays accurately.

Warm regards,
BookLeaf Author Support Team`;
  }

  if (category === 'Book Status & Production Updates') {
    return `Dear ${authorName},

Thank you for checking in on the production progress of "${bookTitle || 'your book'}".

Our standard production workflow advances systematically: Manuscript Received → Editing → Cover Design → Typesetting → Proofreading → ISBN Assignment → Printing → Distribution Setup → Live.

${book ? `Your book is currently listed in status: "${book.status}".` : 'Your project is progressing through our editorial workflow.'}
Our production team is reviewing the current stage proofs to ensure full alignment with our publishing standards. You will receive an updated status and draft files for your review within 2–3 business days.

Warm regards,
BookLeaf Author Support Team`;
  }

  // Default / General
  return `Dear ${authorName},

Thank you for reaching out to BookLeaf Author Support regarding "${ticket.subject}".

We have received your query and reviewed your account details. A member of our editorial support team is looking into the specifics of your request and will provide full details within 24 business hours.

If you have any supplementary details to add, please feel free to reply directly to this thread.

Warm regards,
BookLeaf Author Support Team`;
}

/**
 * Generates an AI draft response using OpenAI or fallback.
 */
async function generateDraftResponse({ ticket, author, book, tone = 'empathetic' }) {
  if (!openai) {
    console.log('ℹ️ OpenAI client not configured, using localized BookLeaf knowledge base draft generator.');
    return generateFallbackResponse({ ticket, author, book });
  }

  try {
    const prompt = buildDraftPrompt({ ticket, author, book, tone });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 500,
    });

    const draft = completion.choices[0]?.message?.content?.trim();
    if (!draft) {
      throw new Error('Empty response from OpenAI');
    }

    return draft;
  } catch (err) {
    console.warn(`⚠️ OpenAI draft generation error (${err.message}). Using policy fallback draft.`);
    return generateFallbackResponse({ ticket, author, book });
  }
}

module.exports = {
  generateDraftResponse,
  generateFallbackResponse,
};
