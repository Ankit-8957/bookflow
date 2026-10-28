/**
 * BookLeaf Publishing Knowledge Base
 * Official operational policies, turnaround times, and communication guidelines.
 */

const BOOKLEAF_KNOWLEDGE = {
  company: {
    name: 'BookLeaf Publishing',
    operations: 'Self-publishing company operating in India and the United States.',
    packages: [
      'Standard Free package (zero upfront cost, self-publishing essentials)',
      'Bestseller Breakthrough (premium package with enhanced marketing, premium distribution, and editorial add-ons)',
    ],
    facilities:
      'In-house printing facility and main logistics warehouse located in Delhi. Print partners include Repro India and Epitome Books for regional and international fulfillment.',
    services:
      'Cover design, typesetting, proofreading, ISBN assignment, printing, multi-channel distribution, and quarterly royalty management.',
  },

  royalties: {
    split: '80/20 royalty split — 80% of net profit goes to the author, 20% to BookLeaf Publishing.',
    netProfitFormula:
      'Net Profit = Maximum Retail Price (MRP) - Printing Cost - Platform Commission (Amazon/Flipkart) - Shipping Charges.',
    cycle: 'Royalties are calculated quarterly (Q1 ending Mar 31, Q2 ending Jun 30, Q3 ending Sep 30, Q4 ending Dec 31).',
    payoutWindow: 'Royalties are disbursed within 45 days after the end of each calendar quarter.',
    threshold:
      'Minimum payout threshold is ₹1,000. If an author accumulated less than ₹1,000 in a quarter, the amount automatically rolls over to the next quarter.',
    method: 'Direct bank transfer (NEFT/RTGS/IMPS) to the bank account linked in the author dashboard.',
    breakdown:
      'Authors can view a line-by-line royalty breakdown per platform in their portal. International sales (Amazon US/UK, IngramSpark) may report with a 30 to 45 day reconciliation cycle.',
  },

  isbn: {
    policy:
      'Every book published through BookLeaf receives a unique, registered ISBN assigned under BookLeaf Publishing publisher imprint.',
    ownImprint:
      'If an author wishes to publish under their own imprint, they must independently procure their ISBN and provide the allotment certificate.',
    discrepancyOrError:
      'ISBN errors (wrong title linked on retailer platforms, barcode misprints, duplicate listing) are classified as CRITICAL / HIGH priority and escalated immediately to the production & metadata team with a 48-hour resolution guarantee.',
  },

  printing: {
    facility: 'In-house printing facility in Delhi, supported by Repro India and Epitome Books.',
    turnaround: 'Standard print turnaround is 5 to 7 business days from order confirmation or proof sign-off.',
    qualityGuarantee:
      'If an author reports physical defects (misaligned pages, binding failure, blurry text or images, color inconsistency), BookLeaf arranges a free reprint after quick photo verification.',
    verificationProcess:
      'The author is requested to email or upload clear photos of the defect, ISBN page, and barcode. Once verified, free reprints dispatch within 5–7 business days.',
  },

  distribution: {
    channels: ['Amazon India', 'Flipkart', 'Amazon US', 'Amazon UK', 'BookLeaf Store'],
    newListingTimeline:
      'New titles typically go live across primary e-commerce platforms within 7 to 10 business days following publication completion.',
    stockSync:
      'If a published book displays as "Currently Unavailable" or "Out of Stock" on Amazon or Flipkart, it is usually a periodic stock sync lag. BookLeaf support initiates an expedited distributor catalog re-sync within 24 to 48 hours.',
  },

  production: {
    pipeline: [
      'Manuscript Received',
      'Editing (if opted)',
      'Cover Design',
      'Typesetting',
      'Proofreading',
      'ISBN Assignment',
      'Printing',
      'Distribution Setup',
      'Published & Live',
    ],
    delays:
      'Typical bottlenecks occur during Cover Design (awaiting author approval of concepts) and Proofreading (author revision cycles).',
    tracking: 'Authors receive automated stage updates as their manuscript progresses.',
  },

  toneGuidelines: {
    principles: [
      'Empathetic and professional: Authors are partners, not support tickets.',
      'Acknowledge the author concern first before offering technical explanations.',
      'Be specific: cite actual numbers, dates, ISBNs, and financial figures when available.',
      'Own mistakes directly: If BookLeaf caused a delay or discrepancy, apologize sincerely without corporate deflection.',
      'Realistic timelines: Provide precise investigation timelines (e.g. "within 24–48 hours" or "5–7 business days") rather than vague promises.',
      'Clear next step: Always conclude with an actionable next step for the author or the support team.',
      'Do not invent policies or make unsupported guarantees.',
    ],
  },
};

/**
 * Returns tailored context for prompt injection based on category to optimize token cost.
 */
function getCategoryKnowledge(category = '') {
  const cat = (category || '').toLowerCase();

  if (cat.includes('royalt') || cat.includes('payment')) {
    return `ROYALTY POLICIES:\n- ${BOOKLEAF_KNOWLEDGE.royalties.split}\n- ${BOOKLEAF_KNOWLEDGE.royalties.netProfitFormula}\n- ${BOOKLEAF_KNOWLEDGE.royalties.cycle}\n- ${BOOKLEAF_KNOWLEDGE.royalties.payoutWindow}\n- ${BOOKLEAF_KNOWLEDGE.royalties.threshold}\n- ${BOOKLEAF_KNOWLEDGE.royalties.method}\n- ${BOOKLEAF_KNOWLEDGE.royalties.breakdown}`;
  }

  if (cat.includes('isbn') || cat.includes('metadata')) {
    return `ISBN & METADATA POLICIES:\n- ${BOOKLEAF_KNOWLEDGE.isbn.policy}\n- ${BOOKLEAF_KNOWLEDGE.isbn.ownImprint}\n- ${BOOKLEAF_KNOWLEDGE.isbn.discrepancyOrError}`;
  }

  if (cat.includes('print') || cat.includes('quality')) {
    return `PRINTING & QUALITY POLICIES:\n- ${BOOKLEAF_KNOWLEDGE.printing.turnaround}\n- ${BOOKLEAF_KNOWLEDGE.printing.qualityGuarantee}\n- ${BOOKLEAF_KNOWLEDGE.printing.verificationProcess}\n- In-house Delhi press & Repro India / Epitome Books.`;
  }

  if (cat.includes('distribut') || cat.includes('availab')) {
    return `DISTRIBUTION & AVAILABILITY POLICIES:\n- Channels: ${BOOKLEAF_KNOWLEDGE.distribution.channels.join(', ')}\n- ${BOOKLEAF_KNOWLEDGE.distribution.newListingTimeline}\n- ${BOOKLEAF_KNOWLEDGE.distribution.stockSync}`;
  }

  if (cat.includes('status') || cat.includes('production')) {
    return `PRODUCTION STAGES:\n- Pipeline: ${BOOKLEAF_KNOWLEDGE.production.pipeline.join(' → ')}\n- ${BOOKLEAF_KNOWLEDGE.production.delays}`;
  }

  // General Inquiry: compact overview
  return `BOOKLEAF OVERVIEW & POLICIES:\n- ${BOOKLEAF_KNOWLEDGE.company.operations}\n- Royalty: 80/20 net profit, quarterly within 45 days, min threshold ₹1,000.\n- Printing: 5-7 business days, free reprint on defects.\n- Distribution: Amazon India, Flipkart, Amazon US/UK, BookLeaf Store (7-10 days live, 24-48h stock re-sync).\n- ISBN: Unique registered imprint.`;
}

module.exports = {
  BOOKLEAF_KNOWLEDGE,
  getCategoryKnowledge,
};
