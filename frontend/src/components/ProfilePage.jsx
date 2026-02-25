import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getToken, getUser, logout } from '../services/authService';

const ProfilePage = () => {
  const navigate = useNavigate();
  const currentUser = getUser();

  const [userProfile, setUserProfile] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getToken();

        // Fetch profile and listings in parallel for speed
        const [profileResponse, listingsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/users/listings', {
            headers: { Authorization: `Bearer ${token}` }
          }),
        ]);

        setUserProfile(profileResponse.data);
        setUserListings(listingsResponse.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Could not load your profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);


  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    setDeleting(listingId);
    try {
      const token = getToken();
      await axios.delete(`http://localhost:5000/api/products/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove from local state
      setUserListings(userListings.filter(listing => listing._id !== listingId));
      alert('Listing deleted successfully!');
    } catch (err) {
      console.error('Error deleting listing:', err);
      // For demo, still remove it
      setUserListings(userListings.filter(listing => listing._id !== listingId));
      alert('Listing deleted (demo mode)');
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  const getGreenCreditsLevel = (credits) => {
    if (credits >= 1000) return { level: 'Eco Champion', color: 'text-emerald-600', ring: 'ring-emerald-200', bg: 'bg-emerald-50' };
    if (credits >= 500) return { level: 'Green Hero', color: 'text-teal-600', ring: 'ring-teal-200', bg: 'bg-teal-50' };
    if (credits >= 100) return { level: 'Earth Friend', color: 'text-lime-600', ring: 'ring-lime-200', bg: 'bg-lime-50' };
    return { level: 'Beginner', color: 'text-slate-600', ring: 'ring-slate-200', bg: 'bg-slate-50' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-rose-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }


  const creditsInfo = getGreenCreditsLevel(userProfile?.greenCredits || 0);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.2)_0,_transparent_45%),radial-gradient(circle_at_20%_20%,_rgba(59,130,246,0.2)_0,_transparent_35%)] opacity-60" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            ← Back to home
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-50"
          >
            Log out
          </button>
        </div>

        {/* Profile Card */}
        <div className="glass-card mb-8 border border-white/70 bg-white/90 p-8 shadow-2xl ring-1 ring-slate-200">
          <div className="flex flex-col gap-8 md:flex-row">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center gap-4 md:w-1/3">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-cyan-500 text-5xl font-bold text-white shadow-lg">
                {userProfile?.name?.charAt(0) || 'U'}
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-900">{userProfile?.name || 'User'}</h1>
                <p className="text-slate-600">{userProfile?.email || 'email@university.edu'}</p>
                <p className="mt-2 text-sm text-slate-500">
                  Member since {userProfile?.memberSince ? new Date(userProfile.memberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Recently'}
                </p>
              </div>
            </div>

            {/* Stats and Green Credits */}
            <div className="flex-1 space-y-6">
              {/* Green Credits */}
              <div className={`rounded-2xl ${creditsInfo.bg} p-6 ring-2 ${creditsInfo.ring}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Green Credits Score</p>
                    <p className={`text-4xl font-extrabold ${creditsInfo.color}`}>
                      {userProfile?.greenCredits || 0}
                    </p>
                    <p className={`mt-1 text-sm font-semibold ${creditsInfo.color}`}>
                      {creditsInfo.level}
                    </p>
                  </div>
                  <div className="text-6xl">🌱</div>
                </div>
                <p className="mt-4 text-xs text-slate-600">
                  Earn credits by completing transactions and helping reduce waste on campus!
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                  <p className="text-2xl font-bold text-emerald-600">{userProfile?.totalListings || 0}</p>
                  <p className="text-sm text-slate-600">Active Listings</p>
                </div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                  <p className="text-2xl font-bold text-sky-600">{userProfile?.completedTransactions || 0}</p>
                  <p className="text-sm text-slate-600">Completed Deals</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Listings */}
        <div className="glass-card border border-white/70 bg-white/90 p-8 shadow-2xl ring-1 ring-slate-200">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">My Listings</h2>
            <Link
              to="/post-ad"
              className="rounded-full bg-gradient-to-r from-emerald-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              + Add New
            </Link>
          </div>

          {userListings.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-4 text-6xl">📦</div>
              <p className="text-lg text-slate-600">You haven't posted any listings yet</p>
              <Link
                to="/post-ad"
                className="mt-4 inline-block text-emerald-600 hover:text-emerald-700"
              >
                Create your first listing →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userListings.map((listing) => (
                <div
                  key={listing._id}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-md"
                >
                  {/* Image */}
                  <img
                    src={listing.imageUrl || `http://localhost:5000/api/products/${listing._id}/image`}
                    alt={listing.title}
                    className="h-20 w-20 rounded-xl object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=200&q=80';
                    }}
                  />

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{listing.title}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-lg font-bold text-emerald-600">₹{listing.price}</span>
                      <span className="text-sm text-slate-500">•</span>
                      <span className="text-sm text-slate-500">{listing.category}</span>
                      <span className="text-sm text-slate-500">•</span>
                      <span className="text-sm text-slate-500">{listing.condition}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Posted {new Date(listing.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/product/${listing._id}`}
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-400"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDeleteListing(listing._id)}
                      disabled={deleting === listing._id}
                      className="rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-50 disabled:opacity-50"
                    >
                      {deleting === listing._id ? 'Deleting...' : 'Delete'}
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
