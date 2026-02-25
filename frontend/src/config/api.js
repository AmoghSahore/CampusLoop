// Central API base URL — set VITE_API_URL in frontend/.env to change the backend port
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default API_BASE;
