import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export function getErrorMessage(err) {
  if (err.response?.data?.error) return err.response.data.error;
  if (err.message) return err.message;
  return 'An unexpected error occurred';
}

export const walletApi = {
  list: () => api.get('/wallets').then((r) => r.data),
  create: (name, emoji) => api.post('/wallets', { name, emoji }).then((r) => r.data),
  get: (address) => api.get(`/wallets/${address}`).then((r) => r.data),
};

export const transactionApi = {
  list: () => api.get('/transactions').then((r) => r.data),
  mempool: () => api.get('/transactions/mempool').then((r) => r.data),
  create: (tx) => api.post('/transactions', tx).then((r) => r.data),
  remove: (id) => api.delete(`/transactions/${id}`).then((r) => r.data),
};

export const blockApi = {
  list: () => api.get('/blocks').then((r) => r.data),
  get: (index) => api.get(`/blocks/${index}`).then((r) => r.data),
  mine: (data) => api.post('/blocks/mine', data).then((r) => r.data),
};

export const chainApi = {
  validate: () => api.get('/chain/validate').then((r) => r.data),
  status: () => api.get('/chain/status').then((r) => r.data),
  reset: (data) => api.post('/chain/reset', data).then((r) => r.data),
  tamper: (data) => api.post('/chain/tamper', data).then((r) => r.data),
  repair: () => api.post('/chain/repair').then((r) => r.data),
};

export const statsApi = {
  get: () => api.get('/stats').then((r) => r.data),
};

export default api;
