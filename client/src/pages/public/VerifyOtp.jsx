import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import OtpInput from '../../components/auth/OtpInput';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardRoute } from '../../utils/authValidation';
import './Auth.css';

const RESEND_SECONDS = 60;

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login } = useAuth();

  const email = location.state?.email || '';

  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (counter <= 0) return;

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
      const data = await apiRequest('/signup/verify-otp', 'POST', {
        email,
        otp: otpCode
      });

      const verifiedUser = data?.user || {};
      const authUser = {
        id: verifiedUser._id,
        name: verifiedUser.name,
        email: verifiedUser.email,
        role: String(verifiedUser.role || 'student').toLowerCase(),
        token: data?.token
      };

      login(authUser);

      setLoading(false);
      showToast('OTP verified successfully. Welcome!', 'success');
      navigate(getDashboardRoute(authUser.role));

    } catch (err) {
      setLoading(false);
      showToast(err.message || 'Verification failed', 'error');
    }
  };

  const handleResend = async () => {
    if (counter > 0) return;

    try {
      await apiRequest('/signup/resend-otp', 'POST', { email });
      showToast('A new OTP has been sent to your email.', 'info');

      setCounter(RESEND_SECONDS);
      setOtpCode('');

    } catch {
      showToast('Failed to resend OTP. Please try again.', 'error');
    }
  };

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
            readOnly
            placeholder="name@example.com"
          />
        </div>

        <form className="auth-form" onSubmit={handleVerify}>
          <div className="otp-wrapper">
            <OtpInput length={6} value={otpCode} onChange={setOtpCode} />
            <p className="otp-meta">Code expires in 10 minutes.</p>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={otpCode.length !== 6 || loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <button
            type="button"
            className="btn btn-outline btn-full"
            onClick={handleResend}
            disabled={counter > 0}
          >
            {counter > 0 ? `Resend OTP in ${counter}s` : 'Resend OTP'}
          </button>
        </form>

        <p className="auth-link-row">
          Wrong email? <Link to="/signup">Go back</Link>
        </p>
      </div>
    </section>
  );
};

export default VerifyOtp;