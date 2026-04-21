import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft } from 'react-icons/fi';

const BackButton = ({ to, label = 'Back' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <button 
      onClick={handleBack}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        background: 'none',
        border: 'none',
        color: 'var(--primary-blue)',
        fontWeight: '600',
        cursor: 'pointer',
        padding: '0.5rem 0',
        marginBottom: '1rem',
        fontSize: '1rem',
        fontFamily: 'var(--font-family)'
      }}
    >
      <FiChevronLeft /> {label}
    </button>
  );
};

export default BackButton;
