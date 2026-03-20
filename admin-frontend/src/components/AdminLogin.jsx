import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/adminApi.js';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await adminLogin(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'grid', placeItems: 'center' }}>
      <form className="card stack" style={{ width: 'min(420px, 95vw)' }} onSubmit={handleSubmit}>
        <h1 className="title">CampusLoop Admin</h1>
        <p className="muted">Sign in with your admin credentials.</p>
        {error && <p className="error">{error}</p>}
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin email" required />
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" required />
        <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
};

export default AdminLogin;
