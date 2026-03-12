// Persist a wishlist array of product IDs in localStorage
// and broadcast a custom 'wishlistChange' event on every update.

export const getWishlist = () => {
  try { return JSON.parse(localStorage.getItem('wishlist') || '[]'); }
  catch { return []; }
};

export const toggleWishlist = (id) => {
  const list = getWishlist();
  const idx  = list.indexOf(String(id));
  const added = idx === -1;
  if (added) list.push(String(id));
  else list.splice(idx, 1);
  localStorage.setItem('wishlist', JSON.stringify(list));
  window.dispatchEvent(new Event('wishlistChange'));
  return added; // true = added, false = removed
};

export const isWishlisted = (id) => getWishlist().includes(String(id));
