import api from './api';

export const authorService = {
  getDashboardStats: async () => {
    const res = await api.get('/author/dashboard');
    return res.data?.data || res.data;
  },
  getBooks: async () => {
    const res = await api.get('/books/my');
    return res.data?.data || res.data;
  },
  getTickets: async () => {
    const res = await api.get('/tickets/my');
    return res.data?.data || res.data;
  },
  createTicket: async (ticketData) => {
    const res = await api.post('/tickets', ticketData);
    return res.data?.data || res.data;
  },
  getTicketById: async (id) => {
    const res = await api.get(`/tickets/${id}`);
    return res.data?.data || res.data;
  },
  sendMessage: async (ticketId, message) => {
    const res = await api.post(`/tickets/${ticketId}/messages`, { message });
    return res.data?.data || res.data;
  },
};
