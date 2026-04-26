import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShield, FiMail } from 'react-icons/fi';
import OtpInput from '../../components/auth/OtpInput';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardRoute } from '../../utils/authValidation';
import './Auth.css';

const RESEND_SECONDS = 120;

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
    if (otpCode.length !== 6 || !email) return;

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
      showToast('Account verified! Welcome to ScholarHub.', 'success');
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
      showToast('Failed to resend OTP.', 'error');
    }
  };

  return (
    <section className="auth-split-page">
      <div className="auth-main-container">
        {/* Left Visual Side */}
        <div className="auth-visual-side">
          <div className="auth-visual-overlay"></div>
          <div className="auth-visual-text">
            <h2>Verify Your Identity.</h2>
            <p>One step closer to your academic journey. Please enter the secure code sent to your email.</p>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="auth-form-side">
          <div className="auth-form-container">
            <div className="auth-header">
              <h1>Verify OTP</h1>
              <p>We've sent a 6-digit verification code to <br /><strong>{email}</strong></p>
            </div>

            <form className="auth-modern-form" onSubmit={handleVerify}>
              <div className="modern-field">
                <div className="otp-wrapper">
                  <OtpInput length={6} value={otpCode} onChange={setOtpCode} />
                  <p className="otp-meta">Code expires in 5 minutes.</p>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-auth-primary" 
                disabled={otpCode.length !== 6 || loading}
              >
                {loading ? 'Verifying...' : 'Complete Verification'}
              </button>

              <button
                type="button"
                className="resend-btn"
                onClick={handleResend}
                disabled={counter > 0}
              >
                {counter > 0 ? `Resend Code in ${counter}s` : 'Resend Code'}
              </button>
            </form>

            <div className="auth-footer-text">
              <Link to="/signup" className="back-to-login">
                <FiArrowLeft /> Back to Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerifyOtp;