import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, ShieldCheck, Zap, Tag } from 'lucide-react';

const MOSAIC = [
  {
    tag: 'Sell', tagBg: '#f97316',
    title: 'Operating Systems Concepts (8th ed.)',
    price: '₹450', meta: 'Textbooks · CSE',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=500&q=80',
  },
  {
    tag: 'Rent', tagBg: '#3b82f6',
    title: 'MacBook Air M1 — weekends',
    price: '₹200/day', meta: 'Electronics · CSE',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80',
  },
  {
    tag: 'Free', tagBg: '#10b981',
    title: 'Lab coat, size M',
    price: 'Free', meta: 'Lab Equipment · Bio',
    image: 'https://images.unsplash.com/photo-1580281657527-47f249e8f2f9?auto=format&fit=crop&w=500&q=80',
  },
  {
    tag: 'Sell', tagBg: '#f97316',
    title: 'Ergonomic Study Chair',
    price: '₹2,800', meta: 'Furniture · Hostel',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=500&q=80',
  },
];

const QUICK_CATS = ['Textbooks', 'Electronics', 'Lab Equipment', 'Furniture', 'Clothing'];

const PERKS = [
  { icon: ShieldCheck, text: 'Verified students only' },
  { icon: Zap,         text: 'Reply in ~8 min'         },
  { icon: Tag,         text: 'Zero platform fees'       },
];

const Hero = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section className="relative overflow-hidden" style={{ background: 'var(--grad-hero)' }}>
      {/* Dot texture */}
      <div className="absolute inset-0 bg-dot-grid opacity-20 pointer-events-none" aria-hidden />

      {/* Gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -left-16 h-96 w-96 rounded-full blur-3xl opacity-25"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 right-10 h-80 w-80 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #1d4ed8 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 right-1/3 h-64 w-64 -translate-y-1/2 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #be185d 0%, transparent 70%)' }} />
      </div>

      <div className="container-xl relative py-20 sm:py-28">
        <div className="grid gap-14 lg:grid-cols-[1fr_440px] lg:items-center">

          {/* ── Left copy ──────────────────────────────────────────────── */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/75 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
              Campus Marketplace · 4,200+ students
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
              Buy, sell &amp; rent<br />
              <span style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 45%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                anything on campus.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-md text-lg leading-relaxed text-white/55">
              Textbooks, electronics, furniture, lab gear — listed by verified
              students from your college.
            </p>

            {/* Search form */}
            <form onSubmit={handleSearch}
              className="flex items-stretch overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md">
              <div className="flex flex-1 items-center gap-3 px-4">
                <Search size={18} className="shrink-0 text-white/40" />
                <input
                  type="search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search textbooks, electronics, gear…"
                  className="flex-1 bg-transparent py-4 text-[15px] text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>
              <button type="submit"
                className="m-2 flex items-center gap-2 rounded-xl px-5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--grad-primary)', boxShadow: '0 2px 16px rgba(79,70,229,0.45)' }}>
                Search <ArrowRight size={15} />
              </button>
            </form>

            {/* Quick categories */}
            <div className="flex flex-wrap gap-2">
              {QUICK_CATS.map(cat => (
                <Link key={cat} to={`/?category=${encodeURIComponent(cat)}`}
                  className="rounded-full border border-white/12 bg-white/8 px-3.5 py-1.5 text-sm font-medium text-white/60 backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/15 hover:text-white">
                  {cat}
                </Link>
              ))}
            </div>

            {/* Perks */}
            <div className="flex flex-wrap gap-x-7 gap-y-2">
              {PERKS.map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5 text-sm text-white/45">
                  <Icon size={14} className="text-violet-400" />
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right: product mosaic ───────────────────────────────────── */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-4 rounded-3xl blur-3xl opacity-20"
              style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }} aria-hidden />
            <div className="relative grid grid-cols-2 gap-3">
              {MOSAIC.map((item, i) => (
                <div key={i}
                  className="overflow-hidden rounded-2xl border border-white/10 transition-transform duration-300 hover:-translate-y-1"
                  style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)' }}>
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={item.image} alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                  </div>
                  <div className="px-3.5 py-3">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ background: item.tagBg }}>
                        {item.tag}
                      </span>
                      <span className="text-sm font-extrabold text-white">{item.price}</span>
                    </div>
                    <p className="line-clamp-2 text-xs font-medium leading-snug text-white/70">{item.title}</p>
                    <p className="mt-1 text-[10px] text-white/35">{item.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
