import axios from 'axios';
import API_BASE from '../config/api.js';
import { getAdminToken, setAdminSession } from './adminAuth.js';

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getAdminToken()}`,
  },
});

export const adminLogin = async (email, password) => {
  const res = await axios.post(`${API_BASE}/api/admin/auth/login`, { email, password });
  setAdminSession({ token: res.data.token, admin: res.data.admin });
  return res.data;
};

export const fetchAdminSummary = async () => {
  const res = await axios.get(`${API_BASE}/api/admin/summary`, authHeaders());
  return res.data;
};

export const fetchReports = async (status = '') => {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await axios.get(`${API_BASE}/api/admin/reports${query}`, authHeaders());
  return res.data;
};

export const updateReportStatus = async (id, status, reason) => {
  const res = await axios.patch(`${API_BASE}/api/admin/reports/${id}`, { status, reason }, authHeaders());
  return res.data;
};

export const fetchAppeals = async (status = '') => {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await axios.get(`${API_BASE}/api/admin/appeals${query}`, authHeaders());
  return res.data;
};

export const updateAppealStatus = async (id, status, reason) => {
  const res = await axios.patch(`${API_BASE}/api/admin/appeals/${id}`, { status, reason }, authHeaders());
  return res.data;
};

export const fetchUsers = async (status = '', query = '') => {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (query) params.set('q', query);
  const queryString = params.toString();
  const res = await axios.get(`${API_BASE}/api/admin/users${queryString ? `?${queryString}` : ''}`, authHeaders());
  return res.data;
};

export const updateUserStatus = async (id, status, reason) => {
  const res = await axios.patch(`${API_BASE}/api/admin/users/${id}/status`, { status, reason }, authHeaders());
  return res.data;
};

export const fetchProducts = async (moderationStatus = '', query = '') => {
  const params = new URLSearchParams();
  if (moderationStatus) params.set('moderationStatus', moderationStatus);
  if (query) params.set('q', query);
  const queryString = params.toString();
  const res = await axios.get(`${API_BASE}/api/admin/products${queryString ? `?${queryString}` : ''}`, authHeaders());
  return res.data;
};

export const updateProductModeration = async (id, moderationStatus, reason) => {
  const res = await axios.patch(`${API_BASE}/api/admin/products/${id}/moderation`, { moderationStatus, reason }, authHeaders());
  return res.data;
};

export const fetchAdminLogs = async (limit = 50) => {
  const res = await axios.get(`${API_BASE}/api/admin/logs?limit=${limit}`, authHeaders());
  return res.data;
};
