import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchUsers, updateUserStatus } from '../services/adminApi.js';

const USER_STATUSES = ['', 'ACTIVE', 'SUSPENDED', 'BANNED'];
const PAGE_SIZE = 12;

const UsersPage = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';
  const initialQuery = searchParams.get('q') || '';
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [page, setPage] = useState(1);
  const [draftStatuses, setDraftStatuses] = useState({});
  const [draftReasons, setDraftReasons] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('SUSPENDED');
  const [bulkReason, setBulkReason] = useState('');

  useEffect(() => {
    if (initialStatus && USER_STATUSES.includes(initialStatus)) {
      setStatusFilter(initialStatus);
    }
    if (initialQuery) {
      setSearchInput(initialQuery);
      setSearchQuery(initialQuery);
    }
  }, [initialStatus, initialQuery]);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await fetchUsers(statusFilter, searchQuery);
      setUsers(rows);
      setDraftStatuses((prev) => {
        const next = { ...prev };
        rows.forEach((user) => {
          if (!next[user._id]) {
            next[user._id] = user.status;
          }
        });
        return next;
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
    loadUsers();
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [sortBy]);

  useEffect(() => {
    if (!success) {
      return undefined;
    }
    const timeout = setTimeout(() => setSuccess(''), 2500);
    return () => clearTimeout(timeout);
  }, [success]);

  useEffect(() => {
    const availableIds = new Set(users.map((user) => user._id));
    setSelectedIds((prev) => prev.filter((id) => availableIds.has(id)));
  }, [users]);

  const handleUpdate = async (user) => {
    const userId = user._id;
    const nextStatus = draftStatuses[userId] || user.status;
    const reason = (draftReasons[userId] || '').trim();

    setError('');
    if (nextStatus === user.status) {
      setError('Choose a different status before applying.');
      return;
    }

    if (['SUSPENDED', 'BANNED'].includes(nextStatus) && !reason) {
      setError('Reason is required when suspending or banning a user.');
      return;
    }

    const confirmed = window.confirm(`Change user #${userId} (${user.email}) status to ${nextStatus}?`);
    if (!confirmed) {
      return;
    }

    try {
      const response = await updateUserStatus(userId, nextStatus, reason);
      setSuccess(response.message || `User #${userId} updated`);
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleBulkUpdate = async () => {
    setError('');
    setSuccess('');

    if (selectedIds.length === 0) {
      setError('Select at least one user for bulk action.');
      return;
    }

    if (['SUSPENDED', 'BANNED'].includes(bulkStatus) && !bulkReason.trim()) {
      setError('Reason is required for bulk suspend/ban actions.');
      return;
    }

    const confirmed = window.confirm(`Apply ${bulkStatus} to ${selectedIds.length} selected users?`);
    if (!confirmed) {
      return;
    }

    let successCount = 0;
    let failureCount = 0;
    for (const userId of selectedIds) {
      try {
        await updateUserStatus(userId, bulkStatus, bulkReason.trim());
        successCount += 1;
      } catch (_err) {
        failureCount += 1;
      }
    }

    setSuccess(`Bulk update complete. Success: ${successCount}, Failed: ${failureCount}`);
    setSelectedIds([]);
    await loadUsers();
  };

  const sortedUsers = [...users].sort((left, right) => {
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

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pagedUsers = sortedUsers.slice(start, start + PAGE_SIZE);
  const allOnPageSelected = pagedUsers.length > 0 && pagedUsers.every((user) => selectedIds.includes(user._id));

  const toggleSelectAllOnPage = () => {
    if (allOnPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pagedUsers.some((user) => user._id === id)));
      return;
    }
    setSelectedIds((prev) => {
      const merged = new Set(prev);
      pagedUsers.forEach((user) => merged.add(user._id));
      return [...merged];
    });
  };

  return (
    <div className="card stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2 className="title">User Moderation</h2>
        <button className="btn" onClick={loadUsers}>Refresh</button>
      </div>
      <div className="row">
        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {USER_STATUSES.map((value) => <option key={value} value={value}>{value || 'ALL STATUS'}</option>)}
        </select>
        <input
          className="input"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by ID, name, email"
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

      <div className="card row" style={{ justifyContent: 'space-between' }}>
        <p className="muted">Selected: {selectedIds.length}</p>
        <div className="row">
          <select className="select" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="BANNED">BANNED</option>
          </select>
          <input
            className="input"
            placeholder="Optional bulk reason"
            value={bulkReason}
            onChange={(e) => setBulkReason(e.target.value)}
            style={{ minWidth: '220px' }}
          />
          <button className="btn danger" onClick={handleBulkUpdate}>Apply to Selected</button>
        </div>
      </div>

      {loading ? <p className="muted">Loading…</p> : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" checked={allOnPageSelected} onChange={toggleSelectAllOnPage} />
                </th>
                <th>ID</th><th>User</th><th>Status</th><th>Verified</th><th>Credits</th><th>Change Status</th><th>Reason</th><th>Apply</th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="muted">No users found.</td>
                </tr>
              ) : pagedUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user._id)}
                      onChange={() => setSelectedIds((prev) => (
                        prev.includes(user._id)
                          ? prev.filter((id) => id !== user._id)
                          : [...prev, user._id]
                      ))}
                    />
                  </td>
                  <td>{user._id}</td>
                  <td>
                    <div>{user.name}</div>
                    <div className="muted">{user.email}</div>
                  </td>
                  <td><span className={`badge ${String(user.status).toLowerCase()}`}>{user.status}</span></td>
                  <td>{user.isEmailVerified ? 'YES' : 'NO'}</td>
                  <td>{user.greenCredits}</td>
                  <td>
                    <select
                      className="select"
                      value={draftStatuses[user._id] || user.status}
                      onChange={(e) => setDraftStatuses((prev) => ({ ...prev, [user._id]: e.target.value }))}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                      <option value="BANNED">BANNED</option>
                    </select>
                  </td>
                  <td>
                    <input
                      className="input"
                      placeholder="Optional reason"
                      value={draftReasons[user._id] || ''}
                      onChange={(e) => setDraftReasons((prev) => ({ ...prev, [user._id]: e.target.value }))}
                    />
                  </td>
                  <td>
                    <button className="btn primary" onClick={() => handleUpdate(user)}>Save</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <p className="muted">Showing {sortedUsers.length === 0 ? 0 : start + 1}-{Math.min(start + PAGE_SIZE, sortedUsers.length)} of {sortedUsers.length}</p>
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

export default UsersPage;
