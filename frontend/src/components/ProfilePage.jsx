import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, LogOut, Plus, Trash2, Eye, Leaf, ShoppingBag, Handshake, Award } from 'lucide-react';
import { getToken, logout } from '../services/authService';
import API_BASE from '../config/api.js';

const getLevel = (credits) => {
  if (credits >= 1000) return { level:'Eco Champion', tier:4 };
  if (credits >= 500)  return { level:'Green Hero',   tier:3 };
  if (credits >= 100)  return { level:'Earth Friend', tier:2 };
  return { level:'Beginner', tier:1 };
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userProfile,  setUserProfile]  = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [deleting,     setDeleting]     = useState(null);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = getToken();
        const [profile, listings] = await Promise.all([
          axios.get(`${API_BASE}/api/users/profile`, { headers:{ Authorization:`Bearer ${token}` } }),
          axios.get(`${API_BASE}/api/users/listings`, { headers:{ Authorization:`Bearer ${token}` } }),
        ]);
        setUserProfile(profile.data);
        setUserListings(listings.data);
      } catch { setError('Could not load your profile.'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    setDeleting(id);
    try {
      await axios.delete(`${API_BASE}/api/products/${id}`, { headers:{ Authorization:`Bearer ${getToken()}` } });
      setUserListings(prev => prev.filter(l => l._id !== id));
    } catch { setUserListings(prev => prev.filter(l => l._id !== id)); }
    finally { setDeleting(null); }
  };

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]"><div className="spinner"/></div>;

  if (error) return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
      <div className="text-center">
        <p className="font-semibold text-rose-600">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary mt-4">Retry</button>
      </div>
    </div>
  );

  const credits = userProfile?.greenCredits || 0;
  const lvl     = getLevel(credits);
  const progress = Math.min(100, lvl.tier === 1 ? (credits/100)*100 : lvl.tier === 2 ? ((credits-100)/400)*100 : lvl.tier === 3 ? ((credits-500)/500)*100 : 100);

  return (
    <div className="min-h-screen pt-6 pb-20" style={{ background:'linear-gradient(180deg,var(--bg) 0%,#edf7f0 100%)' }}>
      <div className="container-xl">
        {/* Top bar */}
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--primary)] hover:underline">
            <ArrowLeft size={16}/> Back to home
          </Link>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50">
            <LogOut size={15}/> Log out
          </button>
        </div>

        {/* Profile card */}
        <div className="glass-card mb-6 overflow-hidden">
          {/* Green Credits banner */}
          <div className="relative overflow-hidden px-7 py-6" style={{ background:'var(--grad-hero)' }}>
            <div className="absolute inset-0 bg-dot-grid opacity-25 pointer-events-none"/>
            <div className="absolute -top-8 right-6 h-32 w-32 rounded-full blur-2xl opacity-20"
              style={{ background:'radial-gradient(circle,#4ade80,transparent)' }}/>
            <div className="relative flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Green Credits Score</p>
                <p className="mt-1 text-5xl font-extrabold text-violet-400">{credits}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Award size={14} className="text-violet-300"/>
                  <p className="text-sm font-semibold text-violet-300">{lvl.level}</p>
                </div>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ background:'rgba(255,255,255,0.08)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.12)' }}>
                <Leaf size={32} className="text-violet-400"/>
              </div>
            </div>
            {/* Progress bar */}
            <div className="relative mt-4">
              <div className="h-1.5 w-full rounded-full bg-white/10">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width:`${progress}%`, background:'linear-gradient(90deg,#a78bfa,#818cf8)' }}/>
              </div>
              <p className="mt-1.5 text-[10px] text-white/35">Earn credits by completing transactions and reducing waste</p>
            </div>
          </div>

          {/* User info */}
          <div className="flex flex-col gap-6 p-7 md:flex-row">
            <div className="flex flex-col items-center gap-3 md:w-44 shrink-0">
              <div className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-extrabold text-white shadow-lg"
                style={{ background:'var(--grad-primary)', boxShadow:'0 4px 20px var(--primary-glow)' }}>
                {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="text-center">
                <p className="font-bold text-[var(--fg)]">{userProfile?.name || 'User'}</p>
                <p className="text-sm text-[var(--fg-muted)]">{userProfile?.email}</p>
                <p className="mt-1 text-xs text-[var(--fg-subtle)]">
                  Member since {userProfile?.memberSince
                    ? new Date(userProfile.memberSince).toLocaleDateString('en-IN',{year:'numeric',month:'short'})
                    : 'Recently'}
                </p>
              </div>
            </div>

            {/* Stat grid */}
            <div className="flex-1 grid grid-cols-2 gap-4 content-start">
              {[
                { icon:ShoppingBag, value:userProfile?.totalListings||0,          label:'Active Listings', grad:'linear-gradient(135deg,#1d9a6c,#178058)' },
                { icon:Handshake,   value:userProfile?.completedTransactions||0,  label:'Completed Deals', grad:'linear-gradient(135deg,#0ea5e9,#0284c7)'  },
              ].map(({ icon:Icon, value, label, grad }) => (
                <div key={label} className="glass-card p-5">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background:grad, boxShadow:'0 2px 10px rgba(0,0,0,0.12)' }}>
                    <Icon size={17} className="text-white"/>
                  </div>
                  <p className="text-2xl font-extrabold text-[var(--fg)]">{value}</p>
                  <p className="text-xs text-[var(--fg-muted)]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="glass-card p-7">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[var(--fg)]">My Listings</h2>
            <Link to="/post-ad" className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm">
              <Plus size={14}/> Add New
            </Link>
          </div>

          {userListings.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-alt)]">
                <ShoppingBag size={22} className="text-[var(--fg-muted)]"/>
              </div>
              <p className="text-[var(--fg-muted)]">You haven't posted any listings yet</p>
              <Link to="/post-ad" className="text-sm font-semibold text-[var(--primary)] hover:underline">Create your first listing →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {userListings.map(listing => (
                <div key={listing._id}
                  className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 transition hover:shadow-card">
                  <img
                    src={listing.imageUrl || `${API_BASE}/api/products/${listing._id}/image`}
                    alt={listing.title}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-[var(--border)]"
                    onError={e => { e.target.src='https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=200&q=80'; }}/>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--fg)] truncate">{listing.title}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[var(--fg-muted)]">
                      <span className="font-bold text-[var(--primary)]">₹{listing.price}</span>
                      <span>·</span><span>{listing.category}</span>
                      {listing.condition && <><span>·</span><span>{listing.condition}</span></>}
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--fg-subtle)]">
                      Posted {new Date(listing.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link to={`/product/${listing._id}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--fg-muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]">
                      <Eye size={14}/>
                    </Link>
                    <button onClick={() => handleDelete(listing._id)} disabled={deleting === listing._id}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-500 transition hover:bg-rose-50 disabled:opacity-50">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
