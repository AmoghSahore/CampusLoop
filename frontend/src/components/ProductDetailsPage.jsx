import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
            <p className="mt-4 text-lg text-slate-600">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4">
          <div className="text-center">
            <p className="text-xl text-rose-600">{error || 'Product not found'}</p>
            <Link
              to="/"
              className="mt-4 inline-block rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = `http://localhost:5000/api/products/${id}/image`;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.2)_0,_transparent_45%),radial-gradient(circle_at_20%_20%,_rgba(59,130,246,0.2)_0,_transparent_35%)] opacity-60" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            ← Back to listings
          </Link>
        </div>

        {/* Product Details */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Section */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
            <div className="aspect-square overflow-hidden bg-slate-100">
              <img
                src={imageUrl}
                alt={product.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80';
                }}
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div className="glass-card border border-white/70 bg-white/90 p-8 shadow-2xl ring-1 ring-slate-200">
              {/* Category Badge */}
              {product.category && (
                <div className="mb-4">
                  <span className="inline-block rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                    {product.category}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                {product.title}
              </h1>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3">
                <p className="text-4xl font-extrabold text-emerald-600">
                  ₹{product.price}
                </p>
                {product.type && (
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    product.type === "Free"
                      ? "bg-emerald-100 text-emerald-700"
                      : product.type === "Rent"
                        ? "bg-sky-100 text-sky-700"
                        : "bg-amber-100 text-amber-800"
                  }`}>
                    {product.type}
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-slate-900">Description</h2>
                  <p className="mt-2 whitespace-pre-line text-slate-600">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Condition */}
              {product.condition && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-slate-900">Condition</h2>
                  <p className="mt-2 text-slate-600">{product.condition}</p>
                </div>
              )}

              {/* Seller Info */}
              {product.seller && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h2 className="text-sm font-semibold text-slate-900">Seller</h2>
                  <p className="mt-1 text-slate-700">
                    {product.seller.name || 'Anonymous'}
                  </p>
                  {product.seller.email && (
                    <p className="mt-1 text-sm text-slate-500">
                      {product.seller.email}
                    </p>
                  )}
                </div>
              )}

              {/* Posted Date */}
              {product.createdAt && (
                <div className="mt-4 text-sm text-slate-500">
                  Posted on {new Date(product.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex gap-4">
                <Link
                  to={`/chat?sellerId=${product.seller?._id || product.seller}`}
                  className="flex-1 rounded-full bg-gradient-to-r from-emerald-600 to-cyan-500 px-6 py-3 text-center text-base font-semibold text-white shadow-glow transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                >
                  💬 Chat with Seller
                </Link>
                <button className="rounded-full border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-400 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/60">
                  ♡
                </button>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="glass-card border border-white/70 bg-white/90 p-6 shadow-lg ring-1 ring-slate-200">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Safety Tips</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>Meet in public campus locations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>Verify the item before making payment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>Use university email for communication</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>Report suspicious listings</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
