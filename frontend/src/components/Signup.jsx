import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Building2, Lock, ArrowRight, Recycle, Eye, EyeOff } from 'lucide-react';
import API_BASE from '../config/api.js';

const FIELDS = [
  { name: 'fullName', label: 'Full name', type: 'text', icon: User, placeholder: 'Arjun Kumar', auto: 'name' },
  { name: 'email', label: 'College email', type: 'email', icon: Mail, placeholder: 'you@christuniversity.in', auto: 'email' },
  { name: 'college', label: 'College / University', type: 'text', icon: Building2, placeholder: 'Christ University', auto: 'organization' },
];

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', college: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) { setError('Please accept the terms to continue.'); return; }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true); setError('');
    try {
      await axios.post(`${API_BASE}/api/auth/signup`, {
        fullName: form.fullName,
        email: form.email,
        college: form.college,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      navigate('/verify-email', { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--grad-hero)' }}>
        <div className="absolute inset-0 bg-dot-grid opacity-20 pointer-events-none" />
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle,#4ade80,transparent)' }} />

        <Link to="/" className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'var(--grad-primary)', boxShadow: '0 2px 12px var(--primary-glow)' }}>
            <Recycle className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Campus<span style={{ background: 'linear-gradient(135deg,#a78bfa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Loop</span></span>
        </Link>

        <div className="relative">
          <h2 className="text-3xl font-extrabold leading-tight text-white">
            Join thousands of<br />students trading smarter.
          </h2>
          <p className="mt-4 text-white/50">
            List your unused items, find great deals from classmates, and earn green credits for sustainable trades.
          </p>

          {/* Floating stat cards */}
          <div className="mt-10 grid grid-cols-2 gap-3">
            {[['12.3k', 'Items rehomed'], ['4.2k', 'Active students'], ['₹0', 'Platform fees'], ['8 min', 'Avg. reply']].map(([v, l]) => (
              <div key={l} className="rounded-xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                <p className="text-xl font-extrabold text-violet-400">{v}</p>
                <p className="mt-0.5 text-xs text-white/45">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/25">© 2026 CampusLoop</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-[var(--bg)] px-6 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'var(--grad-primary)' }}>
              <Recycle className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--fg)]">Campus<span className="text-gradient">Loop</span></span>
          </Link>

          <h1 className="text-2xl font-extrabold text-[var(--fg)]">Create account</h1>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Already have one?{' '}
            <Link to="/login" className="font-semibold text-[var(--primary)] hover:underline">Sign in</Link>
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {FIELDS.map(({ name, label, type, icon: Icon, placeholder, auto }) => (
              <div key={name}>
                <label className="mb-1.5 block text-sm font-semibold text-[var(--fg)]">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-subtle)]" />
                  <input type={type} name={name} required autoComplete={auto}
                    value={form[name]} onChange={handleChange} placeholder={placeholder}
                    className="input-base pl-10" />
                </div>
              </div>
            ))}

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--fg)]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-subtle)]" />
                <input type={showPw ? 'text' : 'password'} name="password" required autoComplete="new-password"
                  value={form.password} onChange={handleChange} placeholder="Min. 6 characters"
                  className="input-base pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-subtle)] hover:text-[var(--fg)] transition">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--fg)]">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-subtle)]" />
                <input type="password" name="confirmPassword" required autoComplete="new-password"
                  value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter your password"
                  className="input-base pl-10" />
              </div>
            </div>

            {/* Terms */}
            <label className="flex cursor-pointer items-start gap-3 pt-1">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 cursor-pointer accent-[var(--primary)]" />
              <span className="text-xs text-[var(--fg-muted)]">
                I agree to the{' '}
                <a href="#" className="font-semibold text-[var(--primary)] hover:underline">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="font-semibold text-[var(--primary)] hover:underline">Privacy Policy</a>
              </span>
            </label>

            <button type="submit" disabled={loading || !agreed}
              className="btn-primary mt-2 w-full justify-center py-3 text-base gap-2">
              {loading && <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
              {loading ? 'Creating account…' : 'Create account'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
