import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import OtpInput from '../../components/auth/OtpInput';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './Auth.css';

const RESEND_SECONDS = 60;

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const emailFromState = location.state?.email || '';
  const [email, setEmail] = useState(emailFromState || sessionStorage.getItem('pending_email') || '');

  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (counter <= 0) {
      return undefined;
    }

    const timerId = setInterval(() => {
      setCounter((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [counter]);

  const handleVerify = async (event) => {
    event.preventDefault();
    if (otpCode.length !== 6 || !email) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest('/auth/verify-otp', 'POST', {
        email,
        otp: otpCode,
      });

      login({
        ...response.user,
        token: response.token,
      });

      sessionStorage.removeItem('pending_email');
      showToast('Email verified successfully', 'success');
      navigate('/browse');
    } catch (error) {
      showToast(error.message || 'OTP verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (counter > 0) {
      return;
    }

    if (!email) {
      showToast('Email not found. Please sign up again.', 'error');
      return;
    }

    try {
      await apiRequest('/auth/resend-otp', 'POST', { email });
      setCounter(RESEND_SECONDS);
      setOtpCode('');
      showToast('OTP resent to your email', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to resend OTP', 'error');
    }
  };

  if (!email) {
    return (
      <section className="auth-page">
        <div className="auth-container">
          <div className="auth-heading">
            <h1>OTP Session Expired</h1>
            <p>Please sign up again to receive a new verification code.</p>
          </div>
          <Link to="/signup" className="btn btn-primary btn-full">
            Back to Sign Up
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-page">
      <div className="auth-container">
        <div className="auth-heading">
          <h1>Verify OTP</h1>
          <p>Enter the 6-digit code sent to {email || 'your email'}.</p>
        </div>

        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <label htmlFor="verify-email" className="form-label">
            Email
          </label>
          <input
            id="verify-email"
            type="email"
            className="form-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
          />
        </div>

        <form className="auth-form" onSubmit={handleVerify}>
          <div className="otp-wrapper">
            <OtpInput length={6} value={otpCode} onChange={setOtpCode} />
            <p className="otp-meta">Code expires in 10 minutes.</p>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={otpCode.length !== 6 || loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <button type="button" className="btn btn-outline btn-full" onClick={handleResend} disabled={counter > 0}>
            {counter > 0 ? `Resend OTP in ${counter}s` : 'Resend OTP'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default VerifyOtp;
