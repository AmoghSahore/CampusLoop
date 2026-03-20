import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, User, Clock } from 'lucide-react';
import API_BASE from '../config/api.js';
import { toggleWishlist, isWishlisted } from '../utils/wishlist.js';

const typeConfig = {
  FREE:   { label:'Free', cls:'badge-free'   },
  DONATE: { label:'Free', cls:'badge-free'   },
  RENT:   { label:'Rent', cls:'badge-rent'   },
  SELL:   { label:'Sell', cls:'badge-accent' },
  SALE:   { label:'Sell', cls:'badge-accent' },
};

function getTypeCfg(p) {
  const raw = (p.listingType || p.type || '').toUpperCase();
  return typeConfig[raw] || { label: raw || 'Item', cls: 'badge-muted' };
}

function timeAgo(d) {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.round(diff/60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m/60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h/24)}d ago`;
}

const ProductCard = ({ product }) => {
  const [liked,    setLiked]    = useState(() => isWishlisted(product._id));
  const [toastMsg, setToastMsg] = useState('');
  const [toastVis, setToastVis] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const sync = () => setLiked(isWishlisted(product._id));
    window.addEventListener('wishlistChange', sync);
    return () => window.removeEventListener('wishlistChange', sync);
  }, [product._id]);

  const imageUrl = product.imageUrl || `${API_BASE}/api/products/${product._id}/image`;
  const typeCfg  = getTypeCfg(product);
  const isFree   = product.price === 0 || typeCfg.label === 'Free';

  const handleLike = async (e) => {
    e.preventDefault();
    if (updating) return;
    setUpdating(true);
    try {
      const added = await toggleWishlist(product._id);
      setLiked(added);
      setToastMsg(added ? '♥ Saved to wishlist' : 'Removed from wishlist');
      setToastVis(true);
      setTimeout(() => setToastVis(false), 1800);
    } catch (_err) {
      setToastMsg('Could not update wishlist');
      setToastVis(true);
      setTimeout(() => setToastVis(false), 1800);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="group relative glass-card overflow-hidden transition-all duration-250 hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] hover:border-[var(--primary)]/40">
      {/* Toast */}
      {toastVis && (
        <div className="pointer-events-none absolute inset-x-0 top-2.5 z-30 flex justify-center">
          <span className="rounded-full bg-[var(--fg)] px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg"
            style={{ animation: 'fadeUp 0.22s ease' }}>
            {toastMsg}
          </span>
        </div>
      )}

      {/* Image */}
      <Link to={`/product/${product._id}`} className="relative block aspect-[4/3] overflow-hidden bg-[var(--bg-alt)]">
        <img src={imageUrl} alt={product.title}
          className="h-full w-full object-cover transition-transform duration-400 group-hover:scale-108"
          style={{ transitionTimingFunction: 'cubic-bezier(0.25,0.46,0.45,0.94)' }}
          onError={(e) => { e.target.src='https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80'; }} />

        {/* Shine overlay on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)' }} />

        {/* Wishlist */}
        <button onClick={handleLike} disabled={updating}
          className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all duration-200 ${
            liked ? 'bg-rose-500 text-white scale-110' : 'bg-white/85 text-[var(--fg-muted)] hover:bg-white hover:text-rose-500 hover:scale-110'
          }`}
          aria-label={liked ? 'Remove from wishlist' : 'Save to wishlist'}>
          <Heart size={13} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 2} />
        </button>

        {/* Type badge */}
        {isFree && (
          <span className="absolute left-2.5 top-2.5 badge badge-free shadow-sm">Free</span>
        )}
      </Link>

      {/* Content */}
      <Link to={`/product/${product._id}`} className="block p-4">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className={`badge ${typeCfg.cls}`}>{typeCfg.label}</span>
          <span className={`text-base font-extrabold ${isFree ? 'text-gradient' : 'text-[var(--fg)]'}`}>
            {isFree ? 'Free' : `₹${Number(product.price).toLocaleString('en-IN')}`}
          </span>
        </div>

        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--fg)] transition-colors group-hover:text-[var(--primary)]">
          {product.title}
        </h3>

        {product.category && (
          <span className="mt-1.5 inline-block rounded-full bg-[var(--bg-alt)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--fg-muted)]">
            {product.category}
          </span>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-[var(--border)]/60 pt-3 text-xs text-[var(--fg-subtle)]">
          <span className="flex items-center gap-1.5">
            <User size={11} />{product.seller?.name || 'Anonymous'}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={11} />{timeAgo(product.createdAt)}
          </span>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
