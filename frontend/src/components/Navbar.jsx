import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
        <div className="flex items-center gap-2 text-2xl font-extrabold text-emerald-700">
          <span className="text-3xl">♻</span>
          <Link to="/">
            <span>Campus<span className="text-emerald-500">Loop</span></span>
          </Link>
        </div>

        <div className="hidden flex-1 md:flex">
          <form onSubmit={handleSearch} className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for textbooks, electronics, lab gear..."
              className="w-full rounded-full border border-slate-200 bg-slate-50/70 px-4 py-2.5 pl-11 text-sm text-slate-700 shadow-inner transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
            />
          </form>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button className="hidden rounded-full border border-slate-200 bg-white px-3 py-2 text-lg text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 md:inline-flex">
            ♡
          </button>
          <Link
            to="/chat"
            className="hidden rounded-full border border-slate-200 bg-white px-3 py-2 text-lg text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 sm:inline-flex"
          >
            💬
          </Link>
          <Link
            to="/profile"
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-lg text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            👤
          </Link>
          <Link
            to="/post-ad"
            className="rounded-full bg-gradient-to-r from-emerald-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
          >
            + List an item
          </Link>
          
        <Link
              to="/login"
              className="rounded-full border border-white/70 bg-white/20 px-5 py-2.5 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-white/30 focus:outline-none shadow-lg shadow-emerald-900/30 focus:ring-2 focus:ring-white/70"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-emerald-900/90 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:-translate-y-0.5 hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              Sign up
            </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

