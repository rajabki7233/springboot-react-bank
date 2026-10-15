import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8080/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getAccount = () => API.get('/bank/account');
export const deposit = (amount) => API.post('/bank/deposit', { amount });
export const withdraw = (amount) => API.post('/bank/withdraw', { amount });
export const send = (amount, toAccountNumber) =>
  API.post('/bank/send', { amount, toAccountNumber });
export const getTransactions = () => API.get('/bank/transactions');

export default API;