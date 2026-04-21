import React from 'react';

const Progressbar = ({ value, showText = true }) => {
  return (
    <div>
      <div className="progress-container">
        <div className="progress-fill" style={{ width: `${value}%` }}></div>
      </div>
      {showText && <small className="progress-text">{value}% Completed</small>}
    </div>
  );
};

export default Progressbar;
