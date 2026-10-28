const openai = require('./openaiClient');
const {
  ALLOWED_CATEGORIES,
  ALLOWED_PRIORITIES,
  buildClassificationPrompt,
} = require('./promptBuilder');

/**
 * Deterministic heuristic fallback classifier.
 * Used when OpenAI API is unavailable, rate-limited, times out, or returns invalid JSON.
 * Ensures ticket creation NEVER fails.
 */
function heuristicClassify({ subject = '', description = '' }) {
  const text = `${subject} ${description}`.toLowerCase();

  let category = 'General Inquiry';
  let priority = 'Medium';
  let reason = 'Classified via rule-based heuristic triage.';

  // 1. ISBN & Metadata
  if (text.includes('isbn') || text.includes('barcode') || text.includes('metadata') || text.includes('wrong title')) {
    category = 'ISBN & Metadata Issues';
    priority = text.includes('different') || text.includes('wrong') || text.includes('error') ? 'Critical' : 'High';
    reason = 'Query involves book ISBN registration or metadata discrepancy.';
    return { category, priority, reason };
  }

  // 2. Royalty & Payments
  if (
    text.includes('royalt') ||
    text.includes('payout') ||
    text.includes('payment') ||
    text.includes('earning') ||
    text.includes('statement') ||
    text.includes('bank') ||
    text.includes('threshold') ||
    text.includes('q1') ||
    text.includes('q2') ||
    text.includes('q3') ||
    text.includes('q4')
  ) {
    category = 'Royalty & Payments';
    if (text.includes('not received') || text.includes('haven\'t received') || text.includes('months') || text.includes('overdue') || text.includes('missing')) {
      priority = text.includes('6 months') || text.includes('never') ? 'Critical' : 'High';
    } else {
      priority = 'Medium';
    }
    reason = 'Query relates to author royalties, payout timelines, or financial statement reconciliation.';
    return { category, priority, reason };
  }

  // 3. Printing & Quality
  if (
    text.includes('print') ||
    text.includes('quality') ||
    text.includes('paperback') ||
    text.includes('binding') ||
    text.includes('blurry') ||
    text.includes('defect') ||
    text.includes('damaged') ||
    text.includes('copies') ||
    text.includes('author copies')
  ) {
    category = 'Printing & Quality';
    priority = text.includes('damaged') || text.includes('terrible') || text.includes('defect') ? 'High' : 'Medium';
    reason = 'Query concerns physical printing quality, binding, or shipment condition.';
    return { category, priority, reason };
  }

  // 4. Distribution & Availability
  if (
    text.includes('amazon') ||
    text.includes('flipkart') ||
    text.includes('unavailable') ||
    text.includes('out of stock') ||
    text.includes('listing') ||
    text.includes('distribution') ||
    text.includes('not showing')
  ) {
    category = 'Distribution & Availability';
    priority = text.includes('unavailable') || text.includes('out of stock') ? 'High' : 'Medium';
    reason = 'Query relates to online channel listing availability or inventory synchronization.';
    return { category, priority, reason };
  }

  // 5. Book Status & Production Updates
  if (
    text.includes('status') ||
    text.includes('production') ||
    text.includes('typesetting') ||
    text.includes('cover design') ||
    text.includes('proofreading') ||
    text.includes('manuscript') ||
    text.includes('when will') ||
    text.includes('progress') ||
    text.includes('delayed')
  ) {
    category = 'Book Status & Production Updates';
    priority = text.includes('weeks') || text.includes('delayed') ? 'High' : 'Medium';
    reason = 'Query requests an update on manuscript production lifecycle stages.';
    return { category, priority, reason };
  }

  // 6. General
  if (text.includes('bio') || text.includes('marketing') || text.includes('question') || text.includes('hi') || text.includes('hello')) {
    category = 'General Inquiry';
    priority = 'Low';
    reason = 'Standard general query or author profile question.';
    return { category, priority, reason };
  }

  return { category, priority, reason };
}

/**
 * Classifies a ticket using LLM, with graceful heuristic fallback.
 */
async function classifyTicket({ subject, description, bookTitle }) {
  if (!openai) {
    console.log('ℹ️ OpenAI client not configured, using heuristic classification fallback.');
    return heuristicClassify({ subject, description });
  }

  try {
    const prompt = buildClassificationPrompt({ subject, description, bookTitle });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('Empty response from AI classification');
    }

    const parsed = JSON.parse(content);

    // Validate category
    const validCategory = ALLOWED_CATEGORIES.includes(parsed.category)
      ? parsed.category
      : heuristicClassify({ subject, description }).category;

    // Validate priority
    const validPriority = ALLOWED_PRIORITIES.includes(parsed.priority)
      ? parsed.priority
      : heuristicClassify({ subject, description }).priority;

    return {
      category: validCategory,
      priority: validPriority,
      reason: parsed.reason || 'AI automated triage based on BookLeaf policies.',
    };
  } catch (err) {
    console.warn(`⚠️ AI Classification error (${err.message}). Engaging heuristic fallback.`);
    return heuristicClassify({ subject, description });
  }
}

module.exports = {
  classifyTicket,
  heuristicClassify,
};
