import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, KeyRound, ArrowRight, RefreshCw } from 'lucide-react';
import API_BASE from '../config/api.js';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = location.state?.email || '';
  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;
    const timer = setInterval(() => setCooldown((sec) => (sec > 0 ? sec - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const canResend = useMemo(() => cooldown === 0 && !!email, [cooldown, email]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await axios.post(`${API_BASE}/api/auth/verify-otp`, {
        email: email.trim(),
        otp: otp.trim(),
      });
      setMessage('Email verified successfully. Please sign in.');
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResending(true);
    setError('');
    setMessage('');
    try {
      const response = await axios.post(`${API_BASE}/api/auth/resend-otp`, {
        email: email.trim(),
      });
      setMessage(response.data?.message || 'OTP sent. Check your inbox.');
      setCooldown(60);
    } catch (err) {
      const retryAfter = Number(err.response?.data?.retryAfterSeconds) || 0;
      if (retryAfter > 0) setCooldown(retryAfter);
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-7 shadow-sm">
        <h1 className="text-2xl font-extrabold text-[var(--fg)]">Verify your email</h1>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">
          Enter the OTP sent to your university email to activate your account.
        </p>

        {error && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        {message && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}

        <form className="mt-6 space-y-4" onSubmit={handleVerify}>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[var(--fg)]">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--fg-subtle)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@christuniversity.in"
                className="input-base pl-10"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[var(--fg)]">OTP</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--fg-subtle)]" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit code"
                className="input-base pl-10 tracking-[0.25em]"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center gap-2 py-3 text-base">
            {loading ? 'Verifying…' : 'Verify email'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || resending}
            className="inline-flex items-center gap-2 font-semibold text-[var(--primary)] disabled:opacity-50"
          >
            <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
          </button>
          <Link to="/login" className="text-[var(--fg-muted)] hover:text-[var(--fg)]">Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
