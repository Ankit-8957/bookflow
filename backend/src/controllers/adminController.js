const adminService = require('../services/adminService');
const { successResponse } = require('../utils/apiResponse');

exports.getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getAdminMetrics();
    return successResponse(res, stats);
  } catch (err) {
    next(err);
  }
};

exports.getAllTickets = async (req, res, next) => {
  try {
    const tickets = await adminService.getQueue(req.query);
    return successResponse(res, tickets);
  } catch (err) {
    next(err);
  }
};

exports.getTicketById = async (req, res, next) => {
  try {
    const ticket = await adminService.getTicketById(req.params.id);
    return successResponse(res, ticket);
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const updated = await adminService.updateTicketStatus(req.params.id, req.body.status);
    return successResponse(res, updated, 'Ticket status updated');
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const updated = await adminService.updateTicketCategory(req.params.id, req.body.category);
    return successResponse(res, updated, 'Ticket category updated');
  } catch (err) {
    next(err);
  }
};

exports.updatePriority = async (req, res, next) => {
  try {
    const updated = await adminService.updateTicketPriority(req.params.id, req.body.priority);
    return successResponse(res, updated, 'Ticket priority updated');
  } catch (err) {
    next(err);
  }
};

exports.assignTicket = async (req, res, next) => {
  try {
    const updated = await adminService.assignTicket(req.params.id, req.user);
    return successResponse(res, updated, 'Ticket assigned to you');
  } catch (err) {
    next(err);
  }
};

exports.addInternalNote = async (req, res, next) => {
  try {
    const note = await adminService.addNote(req.params.id, req.user, req.body.note);
    return successResponse(res, note, 'Internal note added', 201);
  } catch (err) {
    next(err);
  }
};

exports.sendReply = async (req, res, next) => {
  try {
    const text = req.body.message || req.body.response;
    const reply = await adminService.addResponse(req.params.id, req.user, text);
    return successResponse(res, reply, 'Response sent to author', 201);
  } catch (err) {
    next(err);
  }
};

exports.generateAiDraft = async (req, res, next) => {
  try {
    const draft = await adminService.generateAiDraft(req.params.id, req.body.tone);
    return successResponse(res, { draft });
  } catch (err) {
    next(err);
  }
};
