import api from './api';

export const adminService = {
  getDashboardMetrics: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data?.data || res.data;
  },
  getAllTickets: async (filters = {}) => {
    const res = await api.get('/admin/tickets', { params: filters });
    return res.data?.data || res.data;
  },
  getTicketById: async (id) => {
    const res = await api.get(`/admin/tickets/${id}`);
    return res.data?.data || res.data;
  },
  updateTicketStatus: async (ticketId, status) => {
    const res = await api.patch(`/admin/tickets/${ticketId}/status`, { status });
    return res.data?.data || res.data;
  },
  updateTicketCategory: async (ticketId, category) => {
    const res = await api.patch(`/admin/tickets/${ticketId}/category`, { category });
    return res.data?.data || res.data;
  },
  updateTicketPriority: async (ticketId, priority) => {
    const res = await api.patch(`/admin/tickets/${ticketId}/priority`, { priority });
    return res.data?.data || res.data;
  },
  assignTicket: async (ticketId) => {
    const res = await api.post(`/admin/tickets/${ticketId}/assign`);
    return res.data?.data || res.data;
  },
  addInternalNote: async (ticketId, note) => {
    const res = await api.post(`/admin/tickets/${ticketId}/notes`, { note });
    return res.data?.data || res.data;
  },
  sendReply: async (ticketId, message) => {
    const res = await api.post(`/admin/tickets/${ticketId}/replies`, { message });
    return res.data?.data || res.data;
  },
  generateAiDraft: async (ticketId, tone) => {
    const res = await api.post(`/admin/tickets/${ticketId}/ai-draft`, { tone });
    return res.data?.data || res.data;
  },
};
