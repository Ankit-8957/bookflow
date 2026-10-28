const ticketService = require('../services/ticketService');
const { successResponse } = require('../utils/apiResponse');

exports.createTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.createTicket(req.user, req.body);
    return successResponse(res, ticket, 'Ticket raised successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.getTickets = async (req, res, next) => {
  try {
    const tickets = await ticketService.getTicketsForUser(req.user);
    return successResponse(res, tickets);
  } catch (err) {
    next(err);
  }
};

exports.getTicketById = async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id, req.user);
    return successResponse(res, ticket);
  } catch (err) {
    next(err);
  }
};

exports.addMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const msg = await ticketService.addMessage(req.params.id, req.user, message);
    return successResponse(res, msg, 'Message sent', 201);
  } catch (err) {
    next(err);
  }
};
