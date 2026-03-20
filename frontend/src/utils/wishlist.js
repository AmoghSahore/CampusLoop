import axios from 'axios';
import API_BASE from '../config/api.js';
import { getToken } from '../services/authService.js';

// Persist a wishlist array of product IDs in localStorage and
// broadcast a custom 'wishlistChange' event on every update.

const WISHLIST_KEY = 'wishlist';
const WISHLIST_API = `${API_BASE}/api/wishlist`;

const setWishlist = (ids) => {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids.map(String)));
};

const emitWishlistChange = () => {
  window.dispatchEvent(new Event('wishlistChange'));
};

const authHeaders = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export const getWishlist = () => {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); }
  catch { return []; }
};

export const syncWishlistFromServer = async () => {
  if (!getToken()) return getWishlist();
  const res = await axios.get(WISHLIST_API, authHeaders());
  const ids = res.data?.ids || [];
  setWishlist(ids);
  emitWishlistChange();
  return ids;
};

export const getWishlistItemsFromServer = async () => {
  if (!getToken()) return [];
  const res = await axios.get(WISHLIST_API, authHeaders());
  const ids = res.data?.ids || [];
  setWishlist(ids);
  emitWishlistChange();
  return res.data?.items || [];
};

export const toggleWishlist = async (id) => {
  const list = getWishlist();
  const sid = String(id);
  const idx = list.indexOf(sid);
  const added = idx === -1;

  if (getToken()) {
    if (added) {
      await axios.post(`${WISHLIST_API}/${sid}`, {}, authHeaders());
      list.push(sid);
    } else {
      await axios.delete(`${WISHLIST_API}/${sid}`, authHeaders());
      list.splice(idx, 1);
    }
  } else {
    if (added) list.push(sid);
    else list.splice(idx, 1);
  }

  setWishlist(list);
  emitWishlistChange();
  return added; // true = added, false = removed
};

export const isWishlisted = (id) => getWishlist().includes(String(id));
