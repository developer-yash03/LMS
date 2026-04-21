import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="course-card skeleton-card">
      <div className="skeleton-box skeleton-thumb"></div>
      <div className="course-content" style={{ gap: '0.5rem' }}>
        <div className="skeleton-box" style={{ height: '24px', width: '80%', marginBottom: '0.5rem' }}></div>
        <div className="skeleton-box" style={{ height: '16px', width: '60%' }}></div>
        <div className="skeleton-box" style={{ height: '16px', width: '40%', marginBottom: '1rem' }}></div>
        
        <div className="course-footer" style={{ marginTop: 'auto' }}>
          <div className="skeleton-box" style={{ height: '20px', width: '30%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
