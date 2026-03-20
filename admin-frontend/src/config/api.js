const rawBase = (import.meta.env.VITE_API_URL || 'http://localhost:3001').trim();
const API_BASE = rawBase.replace(/\/+$/, '').replace(/\/api$/i, '');

export default API_BASE;
