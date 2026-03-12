import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, ShieldCheck, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

const featuredListings = [
  { tag:'Sell', tagClass:'badge-accent', title:'Operating Systems Concepts (8th ed.)', price:'₹450', meta:'Textbooks · CSE', user:'Arjun K.', image:'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80' },
  { tag:'Free', tagClass:'badge-free',   title:'Lab coat, size M – Biology dept.',    price:'Free',  meta:'Lab gear · Biology', user:'Priya S.', image:'https://images.unsplash.com/photo-1580281657527-47f249e8f2f9?auto=format&fit=crop&w=600&q=80' },
  { tag:'Rent', tagClass:'badge-rent',   title:'MacBook Air M1 – Available weekends', price:'₹250/day', meta:'Electronics · CSE', user:'Neha B.', image:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80' },
];

const perks = [
  { icon: ShieldCheck, text: 'Verified students only' },
  { icon: Zap,         text: 'Avg. reply in 8 min'    },
  { icon: Leaf,        text: 'Zero platform fees'      },
];

const Hero = () => {
  const [idx,    setIdx]    = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = (next) => {
    setFading(true);
    setTimeout(() => { setIdx(typeof next === 'function' ? next(idx) : next); setFading(false); }, 200);
  };

  useEffect(() => {
    const iv = setInterval(() => goTo((p) => (p + 1) % featuredListings.length), 3800);
    return () => clearInterval(iv);
  }, []);

  const item = featuredListings[idx];

  return (
    <section className="relative overflow-hidden" style={{ background: 'var(--grad-hero)' }}>
      {/* Background texture */}
      <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" aria-hidden />
      {/* Gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, #1d9a6c 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 right-20 h-80 w-80 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 right-1/3 h-64 w-64 -translate-y-1/2 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }} />
      </div>

      <div className="container-xl relative py-20 sm:py-28">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">

          {/* ── Left copy ──────────────────────────────────────────────── */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
              <Leaf className="h-3.5 w-3.5 text-emerald-400" />
              <span>Sustainable campus marketplace</span>
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
              Give campus gear<br />
              <span style={{
                background: 'linear-gradient(135deg, #4ade80 0%, #34d399 50%, #6ee7b7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                a second life.
              </span>
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-white/70">
              Buy, rent, or donate textbooks, electronics, furniture and lab equipment
              within your campus community. Trusted listings, fast replies, zero hassle.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/post-ad"
                className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-bold text-[var(--fg)] transition-all duration-200 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)', boxShadow: '0 4px 24px rgba(74,222,128,0.35)' }}>
                List an item
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#listings"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20">
                Browse listings
              </a>
            </div>

            {/* Perks */}
            <div className="flex flex-wrap gap-6 pt-1">
              {perks.map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-2 text-sm font-medium text-white/65">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                    <Icon className="h-3.5 w-3.5 text-emerald-400" />
                  </span>
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right: floating card ───────────────────────────────────── */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Glow behind card */}
            <div className="absolute inset-8 rounded-3xl blur-3xl opacity-30"
              style={{ background: 'radial-gradient(circle, #1d9a6c 0%, transparent 70%)' }} aria-hidden />

            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-white/12"
              style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', boxShadow: '0 24px 64px rgba(0,0,0,0.45)' }}>

              {/* Card header */}
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-emerald-400">Featured today</p>
                  <p className="text-xs text-white/50">Verified student sellers</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
                </span>
              </div>

              {/* Content area */}
              <div className="transition-all duration-200"
                style={{ opacity: fading ? 0 : 1, transform: fading ? 'translateY(8px)' : 'translateY(0)' }}>
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={item.image} alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                </div>
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <span className={`badge ${item.tagClass}`}>{item.tag}</span>
                        <span className="text-xs text-white/45">{item.meta}</span>
                      </div>
                      <p className="line-clamp-2 font-semibold leading-snug text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-white/50">by {item.user}</p>
                    </div>
                    <p className="shrink-0 text-lg font-extrabold text-emerald-400">{item.price}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
                <button onClick={() => goTo((idx - 1 + featuredListings.length) % featuredListings.length)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:border-white/40 hover:text-white">
                  <ChevronLeft size={13} />
                </button>
                <div className="flex gap-1.5">
                  {featuredListings.map((_, i) => (
                    <button key={i} onClick={() => goTo(i)}
                      className="rounded-full transition-all duration-200"
                      style={{ height:'6px', width: i===idx ? '20px':'6px', background: i===idx ? '#4ade80' : 'rgba(255,255,255,0.2)' }} />
                  ))}
                </div>
                <button onClick={() => goTo((idx + 1) % featuredListings.length)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:border-white/40 hover:text-white">
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
