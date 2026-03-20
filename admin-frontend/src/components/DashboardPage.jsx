import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminSummary } from '../services/adminApi.js';

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSummary = async () => {
    setLoading(true);
    setError('');
    try {
      setSummary(await fetchAdminSummary());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  if (loading) {
    return (
      <div className="card stack">
        <h2 className="title">Dashboard</h2>
        <p className="muted">Loading summary…</p>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="card row" style={{ justifyContent: 'space-between' }}>
        <div>
          <h2 className="title">Dashboard</h2>
          <p className="muted">Moderation KPIs and quick navigation.</p>
        </div>
        <button className="btn" onClick={loadSummary}>Refresh</button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <Link className="card card-link" to="/reports?status=OPEN">
          <p className="muted">Open Reports</p>
          <p className="title">{summary?.reports?.open ?? 0}</p>
          <p className="muted">Total: {summary?.reports?.total ?? 0}</p>
        </Link>

        <Link className="card card-link" to="/appeals?status=OPEN">
          <p className="muted">Open Appeals</p>
          <p className="title">{summary?.appeals?.open ?? 0}</p>
          <p className="muted">Total: {summary?.appeals?.total ?? 0}</p>
        </Link>

        <Link className="card card-link" to="/users?status=SUSPENDED">
          <p className="muted">Suspended Users</p>
          <p className="title">{summary?.users?.suspended ?? 0}</p>
          <p className="muted">Banned: {summary?.users?.banned ?? 0}</p>
        </Link>

        <Link className="card card-link" to="/products?status=UNDER_REVIEW">
          <p className="muted">Products Under Review</p>
          <p className="title">{summary?.products?.underReview ?? 0}</p>
          <p className="muted">Removed: {summary?.products?.removed ?? 0}</p>
        </Link>

        <Link className="card card-link" to="/logs">
          <p className="muted">Admin Actions Today</p>
          <p className="title">{summary?.actionsToday ?? 0}</p>
          <p className="muted">Open logs</p>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
