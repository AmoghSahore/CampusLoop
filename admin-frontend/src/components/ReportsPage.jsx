import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchReports, updateReportStatus } from '../services/adminApi.js';

const REPORT_STATUSES = ['', 'OPEN', 'REVIEWED', 'DISMISSED', 'ACTIONED'];
const PAGE_SIZE = 10;

const ReportsPage = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';
  const [status, setStatus] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (initialStatus && REPORT_STATUSES.includes(initialStatus)) {
      setStatus(initialStatus);
    }
  }, [initialStatus]);

  const loadReports = async () => {
    setLoading(true);
    setError('');
    try {
      setReports(await fetchReports(status));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadReports();
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
    const confirmed = window.confirm(`Mark report #${id} as ${nextStatus}?`);
    if (!confirmed) {
      return;
    }

    const reason = window.prompt('Add a reason for audit logs (optional):', '') ?? '';

    if (['DISMISSED', 'ACTIONED'].includes(nextStatus) && !reason.trim()) {
      setError('Reason is required for dismissed/actioned reports.');
      return;
    }

    try {
      await updateReportStatus(id, nextStatus, reason.trim());
      setSuccess(`Report #${id} marked as ${nextStatus}`);
      await loadReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update report');
    }
  };

  const filteredReports = reports
    .filter((report) => {
      if (!search.trim()) {
        return true;
      }
      const value = search.trim().toLowerCase();
      return (
        String(report._id).includes(value)
        || String(report.productId).includes(value)
        || String(report.reportedBy?._id || '').includes(value)
        || (report.productTitle || '').toLowerCase().includes(value)
        || (report.reportedBy?.name || '').toLowerCase().includes(value)
        || (report.reason || '').toLowerCase().includes(value)
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

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pagedReports = filteredReports.slice(start, start + PAGE_SIZE);

  return (
    <div className="card stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2 className="title">Reports</h2>
        <button className="btn" onClick={loadReports}>Refresh</button>
      </div>
      <div className="row">
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          {REPORT_STATUSES.map((value) => <option key={value} value={value}>{value || 'ALL STATUS'}</option>)}
        </select>
        <input
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID, product, reporter, reason"
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
                <th>ID</th><th>Product</th><th>Reporter</th><th>Reason</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pagedReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="muted">No reports found.</td>
                </tr>
              ) : pagedReports.map((report) => (
                <tr key={report._id}>
                  <td>{report._id}</td>
                  <td>
                    <Link to={`/products?q=${encodeURIComponent(report.productId)}`} className="link-inline">{report.productTitle}</Link>
                    <div className="muted">#{report.productId}</div>
                    <Link to={`/products?q=${encodeURIComponent(report.productId)}`} className="link-inline small">View product moderation</Link>
                  </td>
                  <td>
                    {report.reportedBy?._id ? (
                      <Link to={`/users?q=${encodeURIComponent(report.reportedBy._id)}`} className="link-inline">{report.reportedBy?.name || '-'}</Link>
                    ) : (report.reportedBy?.name || '-')}
                  </td>
                  <td>{report.reason}</td>
                  <td><span className={`badge ${report.status.toLowerCase()}`}>{report.status}</span></td>
                  <td className="row">
                    <button className="btn" onClick={() => handleUpdate(report._id, 'REVIEWED')}>Review</button>
                    <button className="btn" onClick={() => handleUpdate(report._id, 'DISMISSED')}>Dismiss</button>
                    <button className="btn danger" onClick={() => handleUpdate(report._id, 'ACTIONED')}>Actioned</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <p className="muted">Showing {filteredReports.length === 0 ? 0 : start + 1}-{Math.min(start + PAGE_SIZE, filteredReports.length)} of {filteredReports.length}</p>
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

export default ReportsPage;
