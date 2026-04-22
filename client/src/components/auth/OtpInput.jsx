import React, { useRef } from 'react';
import './OtpInput.css';

const OtpInput = ({ length = 6, value, onChange }) => {
  const inputRefs = useRef([]);

  const otpArray = Array.from({ length }, (_, index) => value[index] || '');

  const updateOtpAt = (index, nextChar) => {
    const nextOtp = otpArray.map((char, charIndex) => (charIndex === index ? nextChar : char)).join('');
    onChange(nextOtp);
  };

  const handleChange = (index, event) => {
    const inputValue = event.target.value.replace(/\D/g, '');
    const nextChar = inputValue.slice(-1);

    updateOtpAt(index, nextChar);

    if (nextChar && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="otp-group" role="group" aria-label="One-time password input">
      {otpArray.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          className="otp-box"
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
