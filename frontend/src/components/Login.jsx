import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, ArrowRight, Recycle, Leaf, ShieldCheck, Zap, Eye, EyeOff } from 'lucide-react';
import API_BASE from '../config/api.js';

const Login = () => {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [showPw,  setShowPw]  = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await axios.post(`${API_BASE}/api/auth/login`, form);
      localStorage.setItem('token', r.data.token);
      localStorage.setItem('user', JSON.stringify(r.data.user));
      window.dispatchEvent(new Event('authChange'));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  const features = [
    { icon: ShieldCheck, text: 'Verified student accounts only' },
    { icon: Zap,         text: 'Instant chat with sellers'      },
    { icon: Leaf,        text: 'Promote campus sustainability'   },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Left panel – brand */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--grad-hero)' }}>
        <div className="absolute inset-0 bg-dot-grid opacity-20 pointer-events-none" />
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full blur-3xl opacity-25"
          style={{ background: 'radial-gradient(circle,#1d9a6c,transparent)' }} />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle,#f59e0b,transparent)' }} />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background:'var(--grad-primary)', boxShadow:'0 2px 12px var(--primary-glow)' }}>
            <Recycle className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Campus<span style={{ background:'linear-gradient(135deg,#a78bfa,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Loop</span></span>
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold leading-tight text-white">
              Welcome back to<br />your campus community.
            </h2>
            <p className="mt-3 text-white/55">Trade smarter. Waste less. Connect more.</p>
          </div>
          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4 text-violet-400" />
                </span>
                <span className="text-sm text-white/70">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/25">© 2026 CampusLoop</p>
      </div>

      {/* Right panel – form */}
      <div className="flex flex-1 items-center justify-center bg-[var(--bg)] px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background:'var(--grad-primary)' }}>
              <Recycle className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--fg)]">Campus<span className="text-gradient">Loop</span></span>
          </Link>

          <h1 className="text-2xl font-extrabold text-[var(--fg)]">Sign in</h1>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            New here?{' '}
            <Link to="/signup" className="font-semibold text-[var(--primary)] hover:underline">Create an account</Link>
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--fg)]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-subtle)]" />
                <input type="email" name="email" required autoComplete="email"
                  value={form.email} onChange={handleChange}
                  placeholder="you@college.edu"
                  className="input-base pl-10" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-semibold text-[var(--fg)]">Password</label>
                <button type="button" className="text-xs font-medium text-[var(--primary)] hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-subtle)]" />
                <input type={showPw ? 'text' : 'password'} name="password" required autoComplete="current-password"
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••"
                  className="input-base pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-subtle)] hover:text-[var(--fg)] transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base gap-2 mt-2">
              {loading ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : null}
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[var(--fg-subtle)]">
            By signing in you agree to our{' '}
            <a href="#" className="text-[var(--primary)] hover:underline">Terms</a> and{' '}
            <a href="#" className="text-[var(--primary)] hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
