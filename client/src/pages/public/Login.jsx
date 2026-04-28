import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthActions } from '../../hooks/useAuth';
import { isValidEmail } from '../../utils/authValidation';
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { SiApple } from 'react-icons/si'; // Adding some variety for social icons
import { useToast } from '../../context/ToastContext';
import './Auth.css';

const Login = () => {
  const { handleLogin } = useAuthActions();
  const { showToast } = useToast();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'suspended') {
      showToast('Your account has been temporarily suspended. Please contact support.', 'error');
    }
  }, [showToast]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const trimmedEmail = email.trim();
  const emailValid = isValidEmail(trimmedEmail);
  const showEmailError = emailTouched && trimmedEmail.length > 0 && !emailValid;
  const formValid = emailValid && password.length >= 6;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formValid) return;

    setLoading(true);
    try {
      await handleLogin({ email: trimmedEmail, password });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-page">
      <div className="auth-main-container">
        {/* Left side - Visual Content */}
        <div className="auth-visual-side">
          <div className="auth-visual-overlay"></div>
          <div className="auth-visual-text">
            <h2>Elevate Your Academic Journey.</h2>
            <p>Join a community of dedicated learners and world-class instructors in a space designed for focus and growth.</p>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="auth-form-side">
          <div className="auth-form-container">
            <div className="auth-header">
              <h1>Welcome Back</h1>
              <p>Please enter your details to access your portal.</p>
            </div>

            <form className="auth-modern-form" onSubmit={handleSubmit} noValidate>
              <div className="modern-field">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="name@university.edu"
                  />
                </div>
                {showEmailError && <span className="error-hint">Please enter a valid email address.</span>}
              </div>

              <div className="modern-field">
                <div className="label-row">
                  <label>Password</label>
                  <Link to="/forgot-password">Forgot password?</Link>
                </div>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    className="eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-auth-primary" 
                disabled={!formValid || loading}
              >
                {loading ? 'Processing...' : 'Sign In to ScholarHub'}
              </button>

              <p className="auth-footer-text">
                Don’t have an account? <Link to="/signup">Register now</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;