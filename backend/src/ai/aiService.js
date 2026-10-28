const { classifyTicket } = require('./classificationService');
const { generateDraftResponse } = require('./responseService');

exports.classifyTicket = async (ticketData) => {
  return classifyTicket(ticketData);
};

exports.generateTicketResponse = async ({ ticket, author, book, tone }) => {
  return generateDraftResponse({ ticket, author, book, tone });
};
