import { useEffect, useState } from 'react';
import { fetchAdminLogs } from '../services/adminApi.js';

const PAGE_SIZE = 15;

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      setLogs(await fetchAdminLogs(100));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLogs(); }, []);

  useEffect(() => {
    setPage(1);
  }, [search, actionFilter]);

  const filteredLogs = logs.filter((log) => {
    const actionMatches = !actionFilter || log.action === actionFilter;
    if (!actionMatches) {
      return false;
    }

    if (!search.trim()) {
      return true;
    }

    const value = search.trim().toLowerCase();
    return (
      String(log._id).includes(value)
      || String(log.targetId).includes(value)
      || (log.admin?.email || '').toLowerCase().includes(value)
      || (log.action || '').toLowerCase().includes(value)
      || (log.reason || '').toLowerCase().includes(value)
    );
  });

  const uniqueActions = [...new Set(logs.map((log) => log.action))].sort();
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pagedLogs = filteredLogs.slice(start, start + PAGE_SIZE);

  return (
    <div className="card stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2 className="title">Admin Logs</h2>
        <button className="btn" onClick={loadLogs}>Refresh</button>
      </div>
      <div className="row">
        <select className="select" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
          <option value="">ALL ACTIONS</option>
          {uniqueActions.map((action) => <option key={action} value={action}>{action}</option>)}
        </select>
        <input
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID, admin email, action, reason"
          style={{ minWidth: '260px', flex: 1 }}
        />
      </div>
      {error && <p className="error">{error}</p>}
      {loading ? <p className="muted">Loading…</p> : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th><th>Admin</th><th>Action</th><th>Target</th><th>Reason</th><th>Time</th>
              </tr>
            </thead>
            <tbody>
              {pagedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="muted">No logs found.</td>
                </tr>
              ) : pagedLogs.map((log) => (
                <tr key={log._id}>
                  <td>{log._id}</td>
                  <td>{log.admin?.email}</td>
                  <td>{log.action}</td>
                  <td>{log.targetType}:{log.targetId}</td>
                  <td>{log.reason}</td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <p className="muted">Showing {filteredLogs.length === 0 ? 0 : start + 1}-{Math.min(start + PAGE_SIZE, filteredLogs.length)} of {filteredLogs.length}</p>
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

export default LogsPage;
