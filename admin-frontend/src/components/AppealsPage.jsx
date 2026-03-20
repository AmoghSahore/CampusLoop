import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchAppeals, updateAppealStatus } from '../services/adminApi.js';

const APPEAL_STATUSES = ['', 'OPEN', 'ACCEPTED', 'REJECTED'];
const PAGE_SIZE = 10;

const AppealsPage = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';
  const [status, setStatus] = useState('');
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (initialStatus && APPEAL_STATUSES.includes(initialStatus)) {
      setStatus(initialStatus);
    }
  }, [initialStatus]);

  const loadAppeals = async () => {
    setLoading(true);
    setError('');
    try {
      setAppeals(await fetchAppeals(status));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appeals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadAppeals();
  }, [status]);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy]);

  useEffect(() => {
    if (!success) {
      return undefined;
    }
    const timeout = setTimeout(() => setSuccess(''), 2500);
    return () => clearTimeout(timeout);
  }, [success]);

  const handleUpdate = async (id, nextStatus) => {
    setError('');
    const confirmed = window.confirm(`Mark appeal #${id} as ${nextStatus}?`);
    if (!confirmed) {
      return;
    }

    const reason = window.prompt('Add a reason for audit logs (optional):', '') ?? '';

    if (nextStatus === 'REJECTED' && !reason.trim()) {
      setError('Reason is required when rejecting an appeal.');
      return;
    }

    try {
      await updateAppealStatus(id, nextStatus, reason.trim());
      setSuccess(`Appeal #${id} marked as ${nextStatus}`);
      await loadAppeals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appeal');
    }
  };

  const filteredAppeals = appeals
    .filter((appeal) => {
      if (!search.trim()) {
        return true;
      }
      const value = search.trim().toLowerCase();
      return (
        String(appeal._id).includes(value)
        || String(appeal.user?._id || '').includes(value)
        || (appeal.user?.name || '').toLowerCase().includes(value)
        || (appeal.user?.email || '').toLowerCase().includes(value)
        || (appeal.reason || '').toLowerCase().includes(value)
      );
    })
    .sort((left, right) => {
      if (sortBy === 'createdAt_asc') {
        return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
      }
      if (sortBy === 'status_asc') {
        return String(left.status).localeCompare(String(right.status));
      }
      if (sortBy === 'status_desc') {
        return String(right.status).localeCompare(String(left.status));
      }
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });

  const totalPages = Math.max(1, Math.ceil(filteredAppeals.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pagedAppeals = filteredAppeals.slice(start, start + PAGE_SIZE);

  return (
    <div className="card stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2 className="title">Appeals</h2>
        <button className="btn" onClick={loadAppeals}>Refresh</button>
      </div>
      <div className="row">
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          {APPEAL_STATUSES.map((value) => <option key={value} value={value}>{value || 'ALL STATUS'}</option>)}
        </select>
        <input
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID, user, email, reason"
          style={{ minWidth: '260px', flex: 1 }}
        />
        <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="createdAt_desc">Newest first</option>
          <option value="createdAt_asc">Oldest first</option>
          <option value="status_asc">Status A-Z</option>
          <option value="status_desc">Status Z-A</option>
        </select>
      </div>
      {success && <p className="success">{success}</p>}
      {error && <p className="error">{error}</p>}
      {loading ? <p className="muted">Loading…</p> : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th><th>User</th><th>Reason</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pagedAppeals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted">No appeals found.</td>
                </tr>
              ) : pagedAppeals.map((appeal) => (
                <tr key={appeal._id}>
                  <td>{appeal._id}</td>
                  <td>
                    <Link to={`/users?q=${encodeURIComponent(appeal.user?._id || '')}`} className="link-inline">{appeal.user?.name || '-'}</Link>
                    <div className="muted">{appeal.user?.email}</div>
                  </td>
                  <td>{appeal.reason}</td>
                  <td><span className={`badge ${appeal.status.toLowerCase()}`}>{appeal.status}</span></td>
                  <td className="row">
                    <button className="btn primary" onClick={() => handleUpdate(appeal._id, 'ACCEPTED')}>Accept</button>
                    <button className="btn danger" onClick={() => handleUpdate(appeal._id, 'REJECTED')}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <p className="muted">Showing {filteredAppeals.length === 0 ? 0 : start + 1}-{Math.min(start + PAGE_SIZE, filteredAppeals.length)} of {filteredAppeals.length}</p>
            <div className="row">
              <button className="btn" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>Prev</button>
              <span className="muted">Page {currentPage} / {totalPages}</span>
              <button className="btn" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AppealsPage;
