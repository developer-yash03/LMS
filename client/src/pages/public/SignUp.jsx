import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isValidEmail } from '../../utils/authValidation';
import './Auth.css';

const SignUp = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const emailValid = isValidEmail(trimmedEmail);
  const showEmailError = emailTouched && trimmedEmail.length > 0 && !emailValid;
  const formValid = trimmedName.length > 1 && emailValid && password.length >= 6 && Boolean(role);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formValid) {
      return;
    }

    setLoading(true);

    // Mock sign-up request; replace with a backend call later.
    setTimeout(() => {
      setLoading(false);
      navigate('/verify-otp', {
        state: {
          email: trimmedEmail,
          pendingUser: {
            id: Date.now().toString(),
            name: trimmedName,
            email: trimmedEmail,
            role,
            token: `mock-token-${Date.now()}`,
          },
        },
      });
    }, 1400);
  };

  return (
    <section className="auth-page">
      <Link to="/" className="auth-brand-logo">
        LMS <span>Pro</span>
      </Link>

      <div className="auth-container">
        <div className="auth-heading">
          <h1>Create Account</h1>
          <p>Sign up as a student or instructor.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="signup-name" className="form-label">
              Name
            </label>
            <input
              id="signup-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-email" className="form-label">
              Email
            </label>
            <input
              id="signup-email"
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
            <label htmlFor="signup-password" className="form-label">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div className="form-group">
            <span className="form-label">Role</span>
            <div className="role-selection">
              {/* Each role card is fully clickable and updates role state */}
              <div
                className={`role-card ${role === 'student' ? 'role-card-active' : ''}`}
                onClick={() => setRole('student')}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    setRole('student');
                  }
                }}
              >
                <div className="role-card-header">
                  <span className="role-card-title">Student</span>
                  {role === 'student' && <span className="role-check">✅</span>}
                </div>
                <p className="role-card-text">Join courses and track your learning progress.</p>
              </div>

              <div
                className={`role-card ${role === 'instructor' ? 'role-card-active' : ''}`}
                onClick={() => setRole('instructor')}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    setRole('instructor');
                  }
                }}
              >
                <div className="role-card-header">
                  <span className="role-card-title">Instructor</span>
                  {role === 'instructor' && <span className="role-check">✅</span>}
                </div>
                <p className="role-card-text">Create courses and share your expertise.</p>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={!formValid || loading}>
            {loading ? 'Creating account...' : 'Continue'}
          </button>
        </form>

        <p className="auth-link-row">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
};

export default SignUp;
