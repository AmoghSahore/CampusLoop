import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    agreeToTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await axios.post('/api/auth/signup', formData);
      // localStorage.setItem('token', response.data.token);
      // navigate('/');
      
      console.log('Signup attempt:', formData);
      // Temporary success simulation
      setTimeout(() => {
        setLoading(false);
        alert('Signup functionality - connect to backend API');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            ♻ Campus<span>Loop</span>
          </div>
          <h2>Join CampusLoop</h2>
          <p>Create your account and start trading sustainably</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">University Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your.name@university.edu"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <small>Use your official university email address</small>
          </div>

          <div className="form-group">
            <label htmlFor="university">University</label>
            <input
              type="text"
              id="university"
              name="university"
              placeholder="Enter your university name"
              value={formData.university}
              onChange={handleChange}
              required
            />
          </div>

          {/* <div className="form-row"> */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
        
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          {/* </div> */}

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
              />
              <span>
                I agree to the{' '}
                <Link to="/terms" className="inline-link">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="inline-link">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
