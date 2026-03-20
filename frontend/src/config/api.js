// Central API base URL.
// Accepts either:
// - http://localhost:3001
// - http://localhost:3001/api
// and normalizes to host base so callers can append /api consistently.
const rawBase = (import.meta.env.VITE_API_URL || 'http://localhost:3001').trim();
const API_BASE = rawBase.replace(/\/+$/, '').replace(/\/api$/i, '');

export default API_BASE;
