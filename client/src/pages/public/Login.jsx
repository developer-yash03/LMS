import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthActions } from '../../hooks/useAuth';
import { isValidEmail } from '../../utils/authValidation';
import './Auth.css';

const Login = () => {
  const { handleLogin } = useAuthActions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const trimmedEmail = email.trim();
  const emailValid = isValidEmail(trimmedEmail);
  const showEmailError = emailTouched && trimmedEmail.length > 0 && !emailValid;
  const formValid = emailValid && password.length >= 6;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formValid) {
      return;
    }

    setLoading(true);

    try {
      await handleLogin({
        email: trimmedEmail,
        password,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <Link to="/" className="auth-brand-logo">
        LMS <span>Pro</span>
      </Link>

      <div className="auth-container">
        <div className="auth-heading">
          <h1>Sign In</h1>
          <p>Welcome Back to LMS Pro.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder="name@example.com"
              required
            />
            {showEmailError && <p className="text-error">Please enter a valid email address.</p>}
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="auth-actions">
            <button type="submit" className="btn btn-primary btn-full" disabled={!formValid || loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <Link to="/forgot-password" className="auth-link">
              Forgot Password?
            </Link>
          </div>
        </form>

        <p className="auth-link-row">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="auth-link">
            Create one
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;