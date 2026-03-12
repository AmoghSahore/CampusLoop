import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UploadCloud, Lightbulb, Tag, ArrowRight, X } from 'lucide-react';
import API_BASE from '../config/api.js';
import { getToken } from '../services/authService.js';

const CATEGORIES = ['Books','Electronics','Furniture','Clothing','Sports','Services','Other'];
const TYPES      = ['sell','free','lend'];
const TIPS = [
  'Upload 3–4 clear photos for 2× more responses.',
  'Set a fair price by checking similar listings.',
  'Describe condition honestly — earns better reviews.',
  'Use "Free" type to give away items quickly.',
];

const PostAdPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title:'', description:'', price:'', category:'', type:'sell' });
  const [images,   setImages]   = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = files.slice(0, 5);
    setImages(valid);
    setPreviews(valid.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_,i)=>i!==idx));
    setPreviews(prev => prev.filter((_,i)=>i!==idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) { setError('Please select a category.'); return; }
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      images.forEach(img => fd.append('images', img));
      await axios.post(`${API_BASE}/api/products`, fd, {
        headers: { Authorization:`Bearer ${getToken()}`, 'Content-Type':'multipart/form-data' },
      });
      navigate('/listings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pt-20 pb-16" style={{ background:'linear-gradient(180deg,var(--bg) 0%,#edf7f0 100%)' }}>
      <div className="mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="section-eyebrow">Post an ad</span>
          <h1 className="mt-3 text-3xl font-extrabold text-[var(--fg)]">List your item</h1>
          <p className="mt-2 text-[var(--fg-muted)]">Sell, share or lend — fill in a few details and go live instantly.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 max-w-3xl mx-auto">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ── Form ────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
            {/* Image upload zone */}
            <div className="card overflow-hidden">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--fg-subtle)]">Photos</h2>

              {previews.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-[var(--border)]">
                      <img src={src} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
                      <button type="button" onClick={()=>removeImage(i)}
                        className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition">
                        <X size={11}/>
                      </button>
                    </div>
                  ))}
                  {previews.length < 5 && (
                    <label className="aspect-square flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--primary)]/30 bg-[var(--bg-alt)] hover:border-[var(--primary)]/60 hover:bg-emerald-50 transition">
                      <UploadCloud size={20} className="text-[var(--primary)]/60"/>
                      <span className="mt-1 text-[10px] text-[var(--fg-subtle)]">Add more</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles}/>
                    </label>
                  )}
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-[var(--primary)]/30 bg-[var(--bg-alt)] p-10 text-center hover:border-[var(--primary)]/60 hover:bg-emerald-50 transition group">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl transition group-hover:scale-110"
                    style={{ background:'var(--grad-primary)', boxShadow:'0 4px 20px var(--primary-glow)' }}>
                    <UploadCloud className="h-6 w-6 text-white"/>
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--fg)]">Drop images here or click to browse</p>
                    <p className="mt-0.5 text-xs text-[var(--fg-subtle)]">Up to 5 images · JPG, PNG, WEBP</p>
                  </div>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles}/>
                </label>
              )}
            </div>

            {/* Details */}
            <div className="card space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--fg-subtle)]">Details</h2>

              {/* Title */}
              <div>
                <label className="label">Title</label>
                <input type="text" name="title" required value={form.title} onChange={handleChange}
                  placeholder="e.g. Calculus textbook 3rd edition"
                  className="input-base" />
              </div>

              {/* Description */}
              <div>
                <label className="label">Description</label>
                <textarea name="description" rows={4} value={form.description} onChange={handleChange}
                  placeholder="Describe condition, extras included, pickup location…"
                  className="input-base resize-none leading-relaxed" />
              </div>

              {/* Category + Type row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select name="category" required value={form.category} onChange={handleChange} className="input-base">
                    <option value="">Select…</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Type</label>
                  <select name="type" value={form.type} onChange={handleChange} className="input-base">
                    {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              {/* Price */}
              {form.type !== 'free' && (
                <div>
                  <label className="label">Price (₹)</label>
                  <div className="relative">
                    <Tag className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-subtle)]" />
                    <input type="number" name="price" min="0" value={form.price} onChange={handleChange}
                      placeholder="0"
                      className="input-base pl-10" />
                  </div>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base gap-2">
              {loading && <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>}
              {loading ? 'Publishing…' : 'Publish listing'}
              {!loading && <ArrowRight size={16}/>}
            </button>
          </form>

          {/* ── Tips sidebar ────────────────────────────────────────── */}
          <aside className="space-y-4 lg:sticky lg:top-24 self-start">
            <div className="card">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background:'var(--grad-primary)', boxShadow:'0 2px 8px var(--primary-glow)' }}>
                  <Lightbulb className="h-4 w-4 text-white"/>
                </div>
                <h3 className="font-bold text-[var(--fg)]">Tips for selling faster</h3>
              </div>
              <ul className="space-y-3">
                {TIPS.map((t,i) => (
                  <li key={i} className="flex gap-2 text-sm text-[var(--fg-muted)]">
                    <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ background:'var(--bg-alt)', color:'var(--primary)' }}>{i+1}</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-[var(--border)] p-4 text-center"
              style={{ background:'linear-gradient(135deg,#eefbf4,#f0fdf4)' }}>
              <p className="text-xs font-semibold text-[var(--primary)]">🌿 Eco Impact</p>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">Every listing rehomed saves ~1.2kg of waste from landfill.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PostAdPage;
