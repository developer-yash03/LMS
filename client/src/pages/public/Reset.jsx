import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';

const Reset = () => {
  const { showToast } = useToast();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center' }}>
      {step === 1 && (
        <div>
          <h2>Forgot Password?</h2>
          <input type="email" placeholder="Enter Email" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <button onClick={() => setStep(2)}>Send OTP</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <h2>Verify OTP</h2>
          <p>Sent to your email</p>
          <input type="text" placeholder="Enter 6-digit OTP" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <button onClick={() => setStep(3)}>Verify</button>
        </div>
      )}
      {step === 3 && (
        <div>
          <h2>New Password</h2>
          <input type="password" placeholder="New Password" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <button onClick={() => showToast("Password Changed!", "success")}>Reset Password</button>
        </div>
      )}
    </div>
  );
};

export default Reset;