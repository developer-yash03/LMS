import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import OtpInput from '../../components/auth/OtpInput';
import './Auth.css';

const RESEND_SECONDS = 60;

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const pendingUser = location.state?.pendingUser;
  const email = location.state?.email || '';

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

  const handleVerify = (event) => {
    event.preventDefault();
    if (otpCode.length !== 6 || !pendingUser) {
      return;
    }

    setLoading(true);

    // Mock OTP verification; replace with real OTP verification API later.
    setTimeout(() => {
      login(pendingUser);
      setLoading(false);
      navigate('/');
    }, 1200);
  };

  const handleResend = () => {
    if (counter > 0) {
      return;
    }
    // Mock resend action; replace with real resend API later.
    setCounter(RESEND_SECONDS);
    setOtpCode('');
  };

  if (!pendingUser) {
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

        <form className="auth-form" onSubmit={handleVerify}>
          <div className="otp-wrapper">
            <OtpInput length={6} value={otpCode} onChange={setOtpCode} />
            <p className="otp-meta">Code expires in 5 minutes.</p>
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
