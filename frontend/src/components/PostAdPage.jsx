import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api.js';

const PostAdPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    description: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Bidding-related state
  const [enableBidding, setEnableBidding] = useState(false);
  const [biddingDuration, setBiddingDuration] = useState(1);
  const [buyoutPrice, setBuyoutPrice] = useState('');
  const [enableBuyout, setEnableBuyout] = useState(false);

  const categories = [
    'Textbooks',
    'Electronics',
    'Lab Equipment',
    'Furniture',
    'Clothing',
    'Sports & Fitness',
    'Stationery',
    'Musical Instruments',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.title || !formData.category || !formData.price || !formData.description) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!image) {
      setError('Please upload an image');
      setLoading(false);
      return;
    }
    
    // Bidding validation
    if (enableBidding) {
      if (biddingDuration < 1) {
        setError('Bidding duration must be at least 1 day');
        setLoading(false);
        return;
      }
      if (enableBuyout && (!buyoutPrice || parseFloat(buyoutPrice) <= parseFloat(formData.price))) {
        setError('Buyout price must be higher than the starting price');
        setLoading(false);
        return;
      }
    }

    try {
      // Create FormData object for file upload
      const postData = new FormData();
      postData.append('title', formData.title);
      postData.append('category', formData.category);
      postData.append('price', formData.price);
      postData.append('description', formData.description);
      postData.append('image', image);
      
      // Add bidding data if enabled
      if (enableBidding) {
        postData.append('biddingEnabled', 'true');
        postData.append('biddingDuration', biddingDuration);
        if (enableBuyout && buyoutPrice) {
          postData.append('buyoutPrice', buyoutPrice);
        }
      }

      // Get token from localStorage for authentication
      const token = localStorage.getItem('token');

      // Make API call with FormData
      const response = await axios.post(
        `${API_BASE}/api/listings`,
        postData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Listing created:', response.data);

      // Navigate to home page or listing details
      navigate('/');
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err.response?.data?.message || 'Failed to create listing. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.2)_0,_transparent_45%),radial-gradient(circle_at_20%_20%,_rgba(59,130,246,0.2)_0,_transparent_35%)] opacity-60" aria-hidden />

      <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            ← Back to home
          </Link>
          <h1 className="mt-4 text-4xl font-extrabold text-slate-900">
            List your item
            <span className="block text-emerald-600">Reach thousands of students</span>
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Fill in the details below to create your listing
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card border border-white/70 bg-white/90 p-8 shadow-2xl ring-1 ring-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {error}
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-semibold text-slate-800">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="e.g., Introduction to Algorithms Textbook"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-semibold text-slate-800">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-semibold text-slate-800">
                {enableBidding ? 'Starting Price' : 'Price'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-600">₹</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-8 text-sm text-slate-800 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  required
                />
              </div>
              {enableBidding && (
                <p className="text-xs text-slate-500">
                  This will be the starting price for the auction
                </p>
              )}
            </div>
            
            {/* Bidding Options */}
            <div className="space-y-4 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="enableBidding" className="text-sm font-semibold text-slate-800">
                    🔨 Enable Bidding/Auction
                  </label>
                  <p className="text-xs text-slate-600">Allow users to bid on your item</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    id="enableBidding"
                    checked={enableBidding}
                    onChange={(e) => setEnableBidding(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/30"></div>
                </label>
              </div>
              
              {enableBidding && (
                <div className="space-y-4 pt-2">
                  {/* Bidding Duration */}
                  <div className="space-y-2">
                    <label htmlFor="biddingDuration" className="text-sm font-semibold text-slate-800">
                      Auction Duration (days) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="biddingDuration"
                      min="1"
                      value={biddingDuration}
                      onChange={(e) => setBiddingDuration(parseInt(e.target.value) || 1)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      required={enableBidding}
                    />
                    <p className="text-xs text-slate-500">
                      Minimum 1 day. The auction will end after this duration.
                    </p>
                  </div>
                  
                  {/* Enable Buyout */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="enableBuyout"
                      checked={enableBuyout}
                      onChange={(e) => setEnableBuyout(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <div className="flex-1">
                      <label htmlFor="enableBuyout" className="text-sm font-semibold text-slate-800">
                        ⚡ Add Buyout Price (Optional)
                      </label>
                      <p className="text-xs text-slate-600">
                        Allow buyers to instantly purchase at this price
                      </p>
                    </div>
                  </div>
                  
                  {/* Buyout Price */}
                  {enableBuyout && (
                    <div className="space-y-2">
                      <label htmlFor="buyoutPrice" className="text-sm font-semibold text-slate-800">
                        Buyout Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-600">₹</span>
                        <input
                          type="number"
                          id="buyoutPrice"
                          placeholder="Enter buyout price"
                          min={parseFloat(formData.price) + 1 || 1}
                          step="0.01"
                          value={buyoutPrice}
                          onChange={(e) => setBuyoutPrice(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-8 text-sm text-slate-800 shadow-inner focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        Must be higher than the starting price
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-semibold text-slate-800">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe your item's condition, features, and any other relevant details..."
                rows="5"
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                required
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label htmlFor="image" className="text-sm font-semibold text-slate-800">
                Upload Image <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-4">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner file:mr-4 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  required
                />
                {imagePreview && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-2 text-sm font-semibold text-slate-700">Image Preview:</p>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-48 w-full rounded-xl object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full bg-gradient-to-r from-emerald-600 to-cyan-500 px-6 py-3 text-base font-semibold text-white shadow-glow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              >
                {loading ? 'Creating listing...' : 'Post listing'}
              </button>
              <Link
                to="/"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/60"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="mb-2 text-2xl">📸</div>
            <p className="text-sm font-semibold text-slate-900">Clear photos</p>
            <p className="text-sm text-slate-500">Use good lighting for better visibility</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="mb-2 text-2xl">💰</div>
            <p className="text-sm font-semibold text-slate-900">Fair pricing</p>
            <p className="text-sm text-slate-500">Check similar listings first</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="mb-2 text-2xl">✍️</div>
            <p className="text-sm font-semibold text-slate-900">Detailed description</p>
            <p className="text-sm text-slate-500">Include condition and features</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostAdPage;
