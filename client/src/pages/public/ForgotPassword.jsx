import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import OtpInput from '../../components/auth/OtpInput';
import { isValidEmail } from '../../utils/authValidation';
import './Auth.css';

const RESEND_SECONDS = 60;

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
    if (step !== 2 || counter <= 0) {
      return undefined;
    }

    const timerId = setInterval(() => {
      setCounter((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [step, counter]);

  const handleSendCode = (event) => {
    event.preventDefault();
    if (!emailValid) {
      return;
    }
    setLoading(true);

    // Mock forgot-password request; replace with real backend later.
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      setCounter(RESEND_SECONDS);
    }, 1100);
  };

  const handleVerifyOtp = (event) => {
    event.preventDefault();
    if (otpCode.length !== 6) {
      return;
    }
    setLoading(true);

    // Mock OTP verification; replace with real backend later.
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 1000);
  };

  const handleResetPassword = (event) => {
    event.preventDefault();
    if (!canReset) {
      return;
    }
    setLoading(true);

    // Mock password reset request; replace with real backend later.
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage('Password reset successful. You can now sign in.');
    }, 1100);
  };

  return (
    <section className="auth-page">
      <div className="auth-container">
        {step === 1 && (
          <>
            <div className="auth-heading">
              <h1>Forgot Password</h1>
              <p>Enter your registered email to receive an OTP.</p>
            </div>

            <form className="auth-form" onSubmit={handleSendCode} noValidate>
              <div className="form-group">
                <label htmlFor="forgot-email" className="form-label">
                  Email
                </label>
                <input
                  id="forgot-email"
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

              <button type="submit" className="btn btn-primary btn-full" disabled={!emailValid || loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="auth-heading">
              <h1>Enter OTP</h1>
              <p>We sent a code to {trimmedEmail}.</p>
            </div>

            <form className="auth-form" onSubmit={handleVerifyOtp}>
              <div className="otp-wrapper">
                <OtpInput length={6} value={otpCode} onChange={setOtpCode} />
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={otpCode.length !== 6 || loading}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <button
                type="button"
                className="btn btn-outline btn-full"
                disabled={counter > 0}
                onClick={() => {
                  // Mock resend OTP call; replace with real backend later.
                  setCounter(RESEND_SECONDS);
                  setOtpCode('');
                }}
              >
                {counter > 0 ? `Resend OTP in ${counter}s` : 'Resend OTP'}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <div className="auth-heading">
              <h1>Reset Password</h1>
              <p>Create a new secure password for your account.</p>
            </div>

            <form className="auth-form" onSubmit={handleResetPassword}>
              <div className="form-group">
                <label htmlFor="new-password" className="form-label">
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Enter new password"
                  required
                />
                <div className="password-strength">
                  <div
                    className="password-strength-fill"
                    style={{ width: strength.width, backgroundColor: strength.color }}
                  />
                </div>
                <p className="password-strength-label">Strength: {strength.label}</p>
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password" className="form-label">
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter new password"
                  required
                />
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-error">Passwords do not match.</p>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={!canReset || loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              {successMessage && <p className="text-success">{successMessage}</p>}
            </form>
          </>
        )}

        <p className="auth-link-row">
          Back to{' '}
          <Link to="/login" className="auth-link">
            Sign In
          </Link>
        </p>
      </div>
    </section>
  );
};

export default ForgotPassword;
