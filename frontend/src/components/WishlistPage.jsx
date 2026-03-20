import { useState, useEffect } from 'react';
import { getWishlistItemsFromServer } from '../utils/wishlist.js';
import Navbar from './Navbar';
import Footer from './Footer';
import ProductCard from './ProductCard';
import { Heart, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const items = await getWishlistItemsFromServer();
        setProducts(items || []);
      } catch (err) {
        console.error("Error fetching wishlist products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();

    const sync = () => {
      fetchProducts();
    };
    window.addEventListener('wishlistChange', sync);
    return () => window.removeEventListener('wishlistChange', sync);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <Navbar />
      
      <main className="flex-1 container-xl py-12">
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--primary)] mb-6 transition-colors group">
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to marketplace
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 shadow-sm">
              <Heart size={24} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-[var(--fg)] tracking-tight sm:text-4xl">My Wishlist</h1>
              <p className="mt-1 text-[var(--fg-muted)]">
                {products.length} {products.length === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-32">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--primary)]/60" />
            <p className="text-sm font-medium text-[var(--fg-subtle)]">Finding your items…</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map(p => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="glass-card flex flex-col items-center justify-center p-16 text-center max-w-2xl mx-auto border-dashed">
            <div className="mb-6 rounded-full bg-slate-50 p-6">
              <Sparkles size={48} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-[var(--fg)]">Your wishlist is empty</h3>
            <p className="mt-2 text-[var(--fg-muted)] max-w-sm">
              Explore the marketplace and save items you're interested in by tapping the heart icon.
            </p>
            <Link to="/" className="btn-primary mt-8 px-8 py-3 font-bold shadow-lg shadow-[var(--primary)]/20">
              Browse Listings
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default WishlistPage;
