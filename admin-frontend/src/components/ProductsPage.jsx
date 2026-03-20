import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchProducts, updateProductModeration } from '../services/adminApi.js';

const MODERATION_STATUSES = ['', 'ACTIVE', 'UNDER_REVIEW', 'REMOVED'];
const PAGE_SIZE = 12;

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';
  const initialQuery = searchParams.get('q') || '';
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [page, setPage] = useState(1);
  const [draftStatuses, setDraftStatuses] = useState({});
  const [draftReasons, setDraftReasons] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('UNDER_REVIEW');
  const [bulkReason, setBulkReason] = useState('');

  useEffect(() => {
    if (initialStatus && MODERATION_STATUSES.includes(initialStatus)) {
      setStatusFilter(initialStatus);
    }
    if (initialQuery) {
      setSearchInput(initialQuery);
      setSearchQuery(initialQuery);
    }
  }, [initialStatus, initialQuery]);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await fetchProducts(statusFilter, searchQuery);
      setProducts(rows);
      setDraftStatuses((prev) => {
        const next = { ...prev };
        rows.forEach((product) => {
          if (!next[product._id]) {
            next[product._id] = product.moderationStatus;
          }
        });
        return next;
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
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
    loadProducts();
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
    const availableIds = new Set(products.map((product) => product._id));
    setSelectedIds((prev) => prev.filter((id) => availableIds.has(id)));
  }, [products]);

  const handleUpdate = async (product) => {
    const productId = product._id;
    const nextStatus = draftStatuses[productId] || product.moderationStatus;
    const reason = (draftReasons[productId] || '').trim();

    setError('');
    if (nextStatus === product.moderationStatus) {
      setError('Choose a different moderation status before applying.');
      return;
    }

    if (nextStatus === 'REMOVED' && !reason) {
      setError('Reason is required when removing a product.');
      return;
    }

    const confirmed = window.confirm(`Change product #${productId} moderation status to ${nextStatus}?`);
    if (!confirmed) {
      return;
    }

    try {
      const response = await updateProductModeration(productId, nextStatus, reason);
      setSuccess(response.message || `Product #${productId} updated`);
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product moderation status');
    }
  };

  const handleBulkUpdate = async () => {
    setError('');
    setSuccess('');

    if (selectedIds.length === 0) {
      setError('Select at least one product for bulk action.');
      return;
    }

    if (bulkStatus === 'REMOVED' && !bulkReason.trim()) {
      setError('Reason is required for bulk removal actions.');
      return;
    }

    const confirmed = window.confirm(`Apply ${bulkStatus} to ${selectedIds.length} selected products?`);
    if (!confirmed) {
      return;
    }

    let successCount = 0;
    let failureCount = 0;
    for (const productId of selectedIds) {
      try {
        await updateProductModeration(productId, bulkStatus, bulkReason.trim());
        successCount += 1;
      } catch (_err) {
        failureCount += 1;
      }
    }

    setSuccess(`Bulk update complete. Success: ${successCount}, Failed: ${failureCount}`);
    setSelectedIds([]);
    await loadProducts();
  };

  const sortedProducts = [...products].sort((left, right) => {
    if (sortBy === 'createdAt_asc') {
      return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    }
    if (sortBy === 'status_asc') {
      return String(left.moderationStatus).localeCompare(String(right.moderationStatus));
    }
    if (sortBy === 'status_desc') {
      return String(right.moderationStatus).localeCompare(String(left.moderationStatus));
    }
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pagedProducts = sortedProducts.slice(start, start + PAGE_SIZE);
  const allOnPageSelected = pagedProducts.length > 0 && pagedProducts.every((product) => selectedIds.includes(product._id));

  const toggleSelectAllOnPage = () => {
    if (allOnPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pagedProducts.some((product) => product._id === id)));
      return;
    }
    setSelectedIds((prev) => {
      const merged = new Set(prev);
      pagedProducts.forEach((product) => merged.add(product._id));
      return [...merged];
    });
  };

  return (
    <div className="card stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2 className="title">Product Moderation</h2>
        <button className="btn" onClick={loadProducts}>Refresh</button>
      </div>
      <div className="row">
        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {MODERATION_STATUSES.map((value) => <option key={value} value={value}>{value || 'ALL STATUS'}</option>)}
        </select>
        <input
          className="input"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by ID, title, category, seller"
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
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="REMOVED">REMOVED</option>
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
                <th>ID</th><th>Title</th><th>Category</th><th>Seller</th><th>Listing</th><th>Status</th><th>Change Status</th><th>Reason</th><th>Apply</th>
              </tr>
            </thead>
            <tbody>
              {pagedProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="muted">No products found.</td>
                </tr>
              ) : pagedProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product._id)}
                      onChange={() => setSelectedIds((prev) => (
                        prev.includes(product._id)
                          ? prev.filter((id) => id !== product._id)
                          : [...prev, product._id]
                      ))}
                    />
                  </td>
                  <td>{product._id}</td>
                  <td>
                    <div>{product.title}</div>
                    <div className="muted">₹ {Number(product.price || 0).toLocaleString()}</div>
                  </td>
                  <td>{product.category}</td>
                  <td>
                    <Link to={`/users?q=${encodeURIComponent(product.seller?._id || '')}`} className="link-inline">{product.seller?.name || '-'}</Link>
                    <div className="muted">{product.seller?.email}</div>
                  </td>
                  <td>{product.listingType}</td>
                  <td><span className={`badge ${String(product.moderationStatus).toLowerCase()}`}>{product.moderationStatus}</span></td>
                  <td>
                    <select
                      className="select"
                      value={draftStatuses[product._id] || product.moderationStatus}
                      onChange={(e) => setDraftStatuses((prev) => ({ ...prev, [product._id]: e.target.value }))}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                      <option value="REMOVED">REMOVED</option>
                    </select>
                  </td>
                  <td>
                    <input
                      className="input"
                      placeholder="Optional reason"
                      value={draftReasons[product._id] || ''}
                      onChange={(e) => setDraftReasons((prev) => ({ ...prev, [product._id]: e.target.value }))}
                    />
                  </td>
                  <td>
                    <button className="btn primary" onClick={() => handleUpdate(product)}>Save</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <p className="muted">Showing {sortedProducts.length === 0 ? 0 : start + 1}-{Math.min(start + PAGE_SIZE, sortedProducts.length)} of {sortedProducts.length}</p>
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

export default ProductsPage;
