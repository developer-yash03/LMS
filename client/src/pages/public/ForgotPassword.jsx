import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import OtpInput from '../../components/auth/OtpInput';
import { isValidEmail } from '../../utils/authValidation';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FiMail, FiLock, FiShield, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import './Auth.css';

const RESEND_SECONDS = 120;

const getPasswordStrength = (value) => {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  if (score <= 1) return { label: 'Weak', width: '25%', color: '#ef4444' };
  if (score <= 2) return { label: 'Fair', width: '50%', color: '#f59e0b' };
  if (score <= 3) return { label: 'Good', width: '75%', color: '#3b82f6' };
  return { label: 'Strong', width: '100%', color: '#16a34a' };
};

const ForgotPassword = () => {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [counter, setCounter] = useState(RESEND_SECONDS);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const trimmedEmail = useMemo(() => email.trim(), [email]);
  const emailValid = useMemo(() => isValidEmail(trimmedEmail), [trimmedEmail]);
  const showEmailError = emailTouched && trimmedEmail.length > 0 && !emailValid;

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const canReset = passwordsMatch && newPassword.length >= 8;

  useEffect(() => {
    if (step !== 2 || counter <= 0) return;
    const timerId = setInterval(() => {
      setCounter((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timerId);
  }, [step, counter]);

  const handleSendCode = async (event) => {
    event.preventDefault();
    if (!emailValid) return;
    setLoading(true);
    try {
      await apiRequest('/auth/send-otp', 'POST', { email: trimmedEmail });
      setLoading(false);
      setStep(2);
      setCounter(RESEND_SECONDS);
      showToast('OTP sent to your email address.', 'success');
    } catch (error) {
      setLoading(false);
      showToast(error.message || 'Failed to send OTP', 'error');
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (otpCode.length !== 6) return;
    setLoading(true);
    try {
      await apiRequest('/auth/verify-otp', 'POST', { email: trimmedEmail, otp: otpCode });
      setLoading(false);
      setStep(3);
      showToast('OTP verified. Set your new password.', 'success');
    } catch (error) {
      setLoading(false);
      showToast(error.message || 'OTP verification failed', 'error');
    }
  };

  const handleResetPassword = (event) => {
    event.preventDefault();
    if (!canReset) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage('Password reset successful. You can now sign in.');
    }, 1100);
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

        {/* Right side - Form Content */}
        <div className="auth-form-side">
          <div className="auth-form-container">
            {step === 1 && (
              <>
                <div className="auth-header">
                  <h1>Forgot Password</h1>
                  <p>Enter your registered email to receive an OTP code.</p>
                </div>
                <form className="auth-modern-form" onSubmit={handleSendCode} noValidate>
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
                  <button type="submit" className="btn-auth-primary" disabled={!emailValid || loading}>
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <div className="auth-header">
                  <h1>Verify Code</h1>
                  <p>We sent a 6-digit code to <strong>{trimmedEmail}</strong>.</p>
                </div>
                <form className="auth-modern-form" onSubmit={handleVerifyOtp}>
                  <div className="modern-field">
                    <label>Enter OTP</label>
                    <div className="otp-wrapper">
                      <OtpInput length={6} value={otpCode} onChange={setOtpCode} />
                    </div>
                  </div>
                  <button type="submit" className="btn-auth-primary" disabled={otpCode.length !== 6 || loading}>
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>
                  <button
                    type="button"
                    className="resend-btn"
                    disabled={counter > 0 || loading}
                    onClick={async () => {
                      try {
                        setLoading(true);
                        await apiRequest('/auth/send-otp', 'POST', { email: trimmedEmail });
                        setCounter(RESEND_SECONDS);
                        setOtpCode('');
                        showToast('OTP resent successfully.', 'info');
                      } catch (error) {
                        showToast(error.message || 'Failed to resend OTP', 'error');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    {counter > 0 ? `Resend code in ${counter}s` : 'Resend Code'}
                  </button>
                </form>
              </>
            )}

            {step === 3 && (
              <>
                {!successMessage ? (
                  <>
                    <div className="auth-header">
                      <h1>Reset Password</h1>
                      <p>Create a new secure password for your account.</p>
                    </div>
                    <form className="auth-modern-form" onSubmit={handleResetPassword}>
                      <div className="modern-field">
                        <label>New Password</label>
                        <div className="input-wrapper">
                          <FiLock className="input-icon" />
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min. 8 characters"
                          />
                        </div>
                        <div className="strength-bar-container">
                          <div className="strength-bar" style={{ width: strength.width, backgroundColor: strength.color }}></div>
                        </div>
                        <span className="strength-text">Strength: {strength.label}</span>
                      </div>
                      <div className="modern-field">
                        <label>Confirm Password</label>
                        <div className="input-wrapper">
                          <FiShield className="input-icon" />
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                          />
                        </div>
                        {confirmPassword.length > 0 && !passwordsMatch && (
                          <span className="error-hint">Passwords do not match.</span>
                        )}
                      </div>
                      <button type="submit" className="btn-auth-primary" disabled={!canReset || loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="auth-success-screen">
                    <FiCheckCircle size={60} color="#16a34a" />
                    <h1>Success!</h1>
                    <p>{successMessage}</p>
                    <Link to="/login" className="btn-auth-primary">Sign In</Link>
                  </div>
                )}
              </>
            )}

            <p className="auth-footer-text">
              <Link to="/login" className="back-to-login">
                <FiArrowLeft size={14} /> Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
