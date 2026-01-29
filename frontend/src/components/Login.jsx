import { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await axios.post('/api/auth/login', formData);
      // localStorage.setItem('token', response.data.token);
      // navigate('/');
      
      console.log('Login attempt:', formData);
      // Temporary success simulation
      setTimeout(() => {
        setLoading(false);
        alert('Login functionality - connect to backend API');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.2)_0,_transparent_45%),radial-gradient(circle_at_20%_20%,_rgba(59,130,246,0.2)_0,_transparent_35%)] opacity-60" aria-hidden />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              ♻ CampusLoop
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
              Welcome back.
              <span className="block text-emerald-600">Trade smarter, waste less.</span>
            </h1>
            <p className="max-w-xl text-lg text-slate-600">
              Sign in to see the latest listings, chat with sellers, and keep your wishlist in sync across devices.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-semibold text-slate-900">Safe handoffs</p>
                <p className="text-sm text-slate-500">Meet in verified campus zones.</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-semibold text-slate-900">Zero platform fees</p>
                <p className="text-sm text-slate-500">Students help students.</p>
              </div>
            </div>
          </div>

          <div className="glass-card w-full max-w-xl border border-white/70 bg-white/90 p-8 shadow-2xl ring-1 ring-slate-200">
            <div className="mb-6 text-center">
              <div className="text-2xl font-extrabold text-emerald-700">Sign in</div>
              <p className="text-sm text-slate-500">Use your university email to continue</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {error}
                </div>
              )}

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-800">University email</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your.name@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-800">Password</span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  required
                />
              </label>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="font-semibold text-emerald-700 hover:text-emerald-600">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/60 disabled:cursor-not-allowed disabled:opacity-80"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-center text-sm text-slate-600 ring-1 ring-slate-100">
              New to CampusLoop?{' '}
              <Link to="/signup" className="font-semibold text-emerald-700 hover:text-emerald-600">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
