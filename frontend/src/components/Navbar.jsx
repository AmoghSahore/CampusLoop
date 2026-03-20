import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Recycle, MessageSquare, User, Plus, Heart } from 'lucide-react';
import { getWishlist, syncWishlistFromServer } from '../utils/wishlist.js';

const Navbar = () => {
  const [searchQuery,   setSearchQuery]   = useState('');
  const [isMenuOpen,    setIsMenuOpen]    = useState(false);
  const [isScrolled,    setIsScrolled]    = useState(false);
  const [isLoggedIn,    setIsLoggedIn]    = useState(!!localStorage.getItem('token'));
  const [wishlistCount, setWishlistCount] = useState(() => getWishlist().length);
  const navigate = useNavigate();

  useEffect(() => {
    const syncAuth = async () => {
      const loggedIn = !!localStorage.getItem('token');
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        try { await syncWishlistFromServer(); } catch (_err) {}
      }
      setWishlistCount(getWishlist().length);
    };
    window.addEventListener('storage',    syncAuth);
    window.addEventListener('authChange', syncAuth);
    syncAuth();
    return () => { window.removeEventListener('storage', syncAuth); window.removeEventListener('authChange', syncAuth); };
  }, []);

  useEffect(() => {
    const sync = () => setWishlistCount(getWishlist().length);
    window.addEventListener('wishlistChange', sync);
    return () => window.removeEventListener('wishlistChange', sync);
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setIsMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If element not found (e.g., on a different page), navigate home first
      navigate(`/?scrollTo=${id}`);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      isScrolled
        ? 'bg-white/90 backdrop-blur-xl shadow-[0_1px_20px_rgba(0,0,0,0.08)] border-b border-[var(--border)]'
        : 'bg-white/70 backdrop-blur-md border-b border-[var(--border)]/60'
    }`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
            style={{ background: 'var(--grad-primary)', boxShadow: '0 2px 10px var(--primary-glow)' }}>
            <Recycle className="h-5 w-5 text-white" strokeWidth={2.2} />
          </div>
          <span className="text-lg font-bold tracking-tight text-[var(--fg)]">
            Campus<span className="text-gradient">Loop</span>
          </span>
        </Link>

        {/* Search */}
        <div className="hidden flex-1 max-w-sm mx-6 lg:block">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-subtle)] pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search textbooks, electronics, gear…"
              className="w-full rounded-full border border-[var(--border)] bg-[var(--bg)] py-2 pl-10 pr-4 text-sm text-[var(--fg)]
                         placeholder:text-[var(--fg-subtle)] focus:border-[var(--primary)] focus:outline-none
                         focus:ring-2 focus:ring-[var(--primary)]/12 transition-all hover:border-[var(--border-strong)]"
            />
          </form>
        </div>

        {/* Nav – desktop */}
        <nav className="hidden items-center gap-0.5 md:flex">
          <button onClick={() => scrollToSection('categories')} className="btn-ghost text-sm">Categories</button>
          <button onClick={() => scrollToSection('listings')}   className="btn-ghost text-sm">Listings</button>

          <div className="mx-2.5 h-5 w-px bg-[var(--border)]" />

          {/* Wishlist badge */}
          <Link to="/wishlist" title="Wishlist"
            className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all
              ${wishlistCount > 0
                ? 'border-rose-200 bg-rose-50 text-rose-500'
                : 'border-[var(--border)] bg-white text-[var(--fg-muted)] hover:border-rose-300 hover:text-rose-500'}`}>
            <Heart size={16} fill={wishlistCount > 0 ? 'currentColor' : 'none'} />
            {wishlistCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <>
              <Link to="/chat" title="Messages"
                className="ml-1 flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--fg-muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]">
                <MessageSquare size={16} />
              </Link>
              <Link to="/profile" title="Profile"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--fg-muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]">
                <User size={16} />
              </Link>
            </>
          ) : (
            <Link to="/login" className="btn-outline ml-1 px-4 py-2 text-sm">Log in</Link>
          )}

          <Link to="/post-ad" className="btn-primary ml-2 flex items-center gap-1.5 px-4 py-2 text-sm">
            <Plus size={14} strokeWidth={2.5} /> List an item
          </Link>
        </nav>

        {/* Hamburger */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--fg)] md:hidden transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isMenuOpen && (
        <div className="border-t border-[var(--border)] bg-white/95 backdrop-blur-xl px-4 py-4 md:hidden"
          style={{ animation: 'slideDown 0.2s ease' }}>
          <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-subtle)]" />
            <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-full border border-[var(--border)] bg-[var(--bg)] py-2 pl-9 pr-4 text-sm text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none" />
          </form>
          <nav className="flex flex-col gap-1">
            <button key="categories" onClick={() => scrollToSection('categories')}
              className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--fg-muted)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-colors">
              Categories
            </button>
            <button key="listings" onClick={() => scrollToSection('listings')}
              className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--fg-muted)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-colors">
              Listings
            </button>
            <Link key="wishlist" to="/wishlist" onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--fg-muted)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-colors flex items-center justify-between">
              Wishlist
              {wishlistCount > 0 && <span className="h-4 min-w-[1rem] flex items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">{wishlistCount}</span>}
            </Link>
            {isLoggedIn && [
              ['/chat', 'Messages'],
              ['/profile', 'My Profile']
            ].map(([to, label]) => (
              <Link key={to} to={to} onClick={() => setIsMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--fg-muted)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-colors">
                {label}
              </Link>
            ))}
            <div className="mt-3 flex gap-2 border-t border-[var(--border)] pt-3">
              {!isLoggedIn && <Link to="/login" onClick={() => setIsMenuOpen(false)} className="btn-outline flex-1 justify-center py-2.5 text-sm">Log in</Link>}
              <Link to="/post-ad" onClick={() => setIsMenuOpen(false)} className="btn-primary flex-1 justify-center py-2.5 text-sm">+ List an item</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
