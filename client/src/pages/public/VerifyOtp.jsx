import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import OtpInput from '../../components/auth/OtpInput';
import './Auth.css';

const RESEND_SECONDS = 60;

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || '';

  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(RESEND_SECONDS);

  // ⛔ If user directly opens page without email → redirect
  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  // ⏳ Resend countdown timer
  useEffect(() => {
    if (counter <= 0) return;

    const timerId = setInterval(() => {
      setCounter((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [counter]);

  // ✅ VERIFY OTP (REAL BACKEND CALL)
  const handleVerify = async (event) => {
    event.preventDefault();

    if (otpCode.length !== 6) return;

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/signup/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          otp: otpCode
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Verification failed");
      }

      setLoading(false);

      alert("OTP Verified ✅");

      navigate("/login");

    } catch (err) {
      setLoading(false);
      alert(err.message);
    }
  };

  // 🔁 RESEND OTP (frontend only for now)
  const handleResend = async () => {
    if (counter > 0) return;

    try {
      await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          name: "Temp",
          password: "123456",
          role: "student"
        })
      });

      alert("New OTP sent 📩");

      setCounter(RESEND_SECONDS);
      setOtpCode('');

    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Failed to resend OTP");
    }
  };

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