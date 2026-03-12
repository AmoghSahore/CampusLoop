import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MessageSquare, Heart, ShieldCheck, MapPin, Calendar, Tag, ZoomIn, X } from 'lucide-react';
import API_BASE from '../config/api.js';

const typeConfig = {
  FREE:   { label:'Free', cls:'badge-free'   },
  DONATE: { label:'Free', cls:'badge-free'   },
  RENT:   { label:'Rent', cls:'badge-rent'   },
  SELL:   { label:'Sell', cls:'badge-accent' },
  SALE:   { label:'Sell', cls:'badge-accent' },
  LEND:   { label:'Lend', cls:'badge-rent'   },
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [liked,   setLiked]   = useState(false);
  const [zoomed,  setZoomed]  = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/api/products/${id}`)
      .then(r => { setProduct(r.data); setLoading(false); })
      .catch(() => { setError('Failed to load product details'); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
      <div className="text-center"><div className="spinner mx-auto"/><p className="mt-3 text-sm text-[var(--fg-muted)]">Loading…</p></div>
    </div>
  );

  if (error || !product) return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
      <div className="text-center">
        <p className="text-lg font-semibold text-rose-600">{error || 'Product not found'}</p>
        <Link to="/" className="btn-primary mt-4">Back to Home</Link>
      </div>
    </div>
  );

  const raw = (product.listingType || product.type || '').toUpperCase();
  const typeCfg = typeConfig[raw] || { label: raw || 'Item', cls: 'badge-muted' };
  const isFree = product.price === 0 || typeCfg.label === 'Free';
  const imageUrl = product.imageUrl || `${API_BASE}/api/products/${id}/image`;

  return (
    <div className="min-h-screen pt-6 pb-20" style={{ background:'linear-gradient(180deg,var(--bg) 0%,#edf7f0 100%)' }}>
      <div className="container-xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--primary)] hover:underline mb-8">
          <ArrowLeft size={16}/> Back to listings
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">

          {/* ── Image ───────────────────────────────────────────────── */}
          <div className="glass-card overflow-hidden group cursor-zoom-in" onClick={() => setZoomed(true)}>
            <div className="relative aspect-square overflow-hidden bg-[var(--bg-alt)]">
              <img src={imageUrl} alt={product.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80'; }} />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[var(--fg)] shadow-lg">
                  <ZoomIn size={20}/>
                </div>
              </div>
            </div>
          </div>

          {/* ── Details ─────────────────────────────────────────────── */}
          <div className="space-y-5">
            <div className="glass-card p-7">
              {/* Badges */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {product.category && (
                  <span className="badge badge-primary flex items-center gap-1"><Tag size={11}/>{product.category}</span>
                )}
                <span className={`badge ${typeCfg.cls}`}>{typeCfg.label}</span>
              </div>

              <h1 className="text-2xl font-extrabold leading-snug text-[var(--fg)] sm:text-3xl">{product.title}</h1>

              {/* Price */}
              <div className="mt-4">
                {isFree ? (
                  <p className="text-4xl font-extrabold text-gradient">Free</p>
                ) : (
                  <p className="text-4xl font-extrabold" style={{ background:'var(--grad-primary)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                    ₹{Number(product.price).toLocaleString('en-IN')}
                  </p>
                )}
                {product.condition && <span className="mt-2 inline-block badge badge-muted">{product.condition}</span>}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mt-5">
                  <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--fg-subtle)]">Description</h2>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--fg-muted)]">{product.description}</p>
                </div>
              )}

              {/* Seller */}
              {product.seller && (
                <div className="mt-5 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background:'var(--grad-primary)' }}>
                    {(product.seller.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--fg)]">{product.seller.name || 'Anonymous'}</p>
                    {product.seller.email && <p className="text-xs text-[var(--fg-muted)] truncate">{product.seller.email}</p>}
                  </div>
                </div>
              )}

              {product.createdAt && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--fg-subtle)]">
                  <Calendar size={12}/>
                  Posted {new Date(product.createdAt).toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' })}
                </p>
              )}

              {/* CTA */}
              <div className="mt-6 flex gap-3">
                <Link to={`/chat?sellerId=${product.seller?._id || product.seller}`}
                  className="btn-primary flex-1 justify-center gap-2 py-3 text-base">
                  <MessageSquare size={17}/> Chat with Seller
                </Link>
                <button onClick={() => setLiked(!liked)}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all ${
                    liked ? 'border-rose-400 bg-rose-50 text-rose-500 scale-110' : 'border-[var(--border)] bg-white text-[var(--fg-muted)] hover:border-rose-400 hover:text-rose-500'
                  }`}>
                  <Heart size={18} fill={liked ? 'currentColor' : 'none'}/>
                </button>
              </div>
            </div>

            {/* Safety tips */}
            <div className="glass-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ background:'var(--grad-primary)', boxShadow:'0 2px 8px var(--primary-glow)' }}>
                  <ShieldCheck size={14} className="text-white"/>
                </div>
                <h3 className="text-sm font-bold text-[var(--fg)]">Safety Tips</h3>
              </div>
              <ul className="space-y-2">
                {[
                  { icon:MapPin,      text:'Meet in public campus locations'           },
                  { icon:ShieldCheck, text:'Verify item before making payment'          },
                  { icon:ShieldCheck, text:'Use university email for communication'     },
                  { icon:ShieldCheck, text:'Report suspicious listings immediately'     },
                ].map(({ icon:Icon, text }) => (
                  <li key={text} className="flex items-start gap-2 text-sm text-[var(--fg-muted)]">
                    <Icon size={14} className="mt-0.5 shrink-0 text-[var(--primary)]"/>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Image zoom lightbox ─────────────────────────────────────────── */}
      {zoomed && (
        <div role="dialog" aria-modal="true" onClick={() => setZoomed(false)}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 cursor-zoom-out"
          style={{ animation:'fadeIn 0.2s ease' }}>
          <button onClick={() => setZoomed(false)}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition"
            aria-label="Close">
            <X size={18}/>
          </button>
          <img src={imageUrl} alt={product.title} onClick={e => e.stopPropagation()}
            className="max-h-[90vh] max-w-full rounded-2xl object-contain shadow-2xl cursor-default"
            style={{ animation:'zoomIn 0.2s ease' }}/>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
