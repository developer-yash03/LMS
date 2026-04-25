import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isValidEmail } from '../../utils/authValidation';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import './Auth.css';

const SignUp = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student'); // Default to student
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const emailValid = isValidEmail(trimmedEmail);
  const showEmailError = emailTouched && trimmedEmail.length > 0 && !emailValid;
  const formValid = trimmedName.length > 1 && emailValid && password.length >= 6 && Boolean(role);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formValid) return;

    setLoading(true);
    try {
      await apiRequest('/signup', 'POST', {
          name: trimmedName,
          email: trimmedEmail,
          password,
          role
      });

      setLoading(false);
      showToast('OTP sent to your email. Please verify to continue.', 'success');
      navigate('/verify-otp', { state: { email: trimmedEmail } });
    } catch (err) {
      setLoading(false);
      showToast(err.message || 'Signup failed', 'error');
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

        {/* Right side - Signup Form */}
        <div className="auth-form-side">
          <div className="auth-form-container">
            <div className="auth-header">
              <h1>Create Account</h1>
              <p>Join ScholarHub as a student or instructor.</p>
            </div>

            <form className="auth-modern-form" onSubmit={handleSubmit} noValidate>
              <div className="modern-field">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

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
                <label>Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
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

              <div className="modern-field">
                <label>I am a...</label>
                <div className="role-btn-group">
                  <button
                    type="button"
                    className={`role-select-btn ${role === 'student' ? 'active' : ''}`}
                    onClick={() => setRole('student')}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    className={`role-select-btn ${role === 'instructor' ? 'active' : ''}`}
                    onClick={() => setRole('instructor')}
                  >
                    Instructor
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-auth-primary" 
                disabled={!formValid || loading}
              >
                {loading ? 'Creating account...' : 'Get Started'}
              </button>

              <p className="auth-footer-text">
                Already have an account? <Link to="/login">Sign in</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
