import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Required for sending/receiving HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkApiHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;