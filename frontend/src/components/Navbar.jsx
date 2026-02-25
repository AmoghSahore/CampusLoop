import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout, getUser } from '../services/authService';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoggedIn(isAuthenticated());
    setUser(getUser());
    const handleStorage = () => {
      setLoggedIn(isAuthenticated());
      setUser(getUser());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setUser(null);
    navigate('/');
  };

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
            to="/post-ad"
            className="rounded-full bg-gradient-to-r from-emerald-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
          >
            + List an item
          </Link>
          {/* Show login/signup if not logged in */}
          {!loggedIn && (
            <Link
              to="/login"
              className="rounded-full bg-emerald-900/90 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:-translate-y-0.5 hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              Log in
            </Link>
          )}
          {/* Show user button and logout if logged in */}
          {loggedIn && (
            <>
              <Link
                to="/profile"
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-lg text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                👤
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300/70 ml-2"
              >
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

