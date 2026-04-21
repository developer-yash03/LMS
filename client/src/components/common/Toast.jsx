import React from 'react';
import { FiCheckCircle, FiInfo } from 'react-icons/fi';

const Toast = ({ message, type }) => {
  return (
    <div className={`toast-message ${type}`}>
      {type === 'success' ? <FiCheckCircle color="#16A34A" /> : <FiInfo color="var(--primary-blue)" />}
      {message}
    </div>
  );
};

export default Toast;
