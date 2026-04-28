import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiFilter, FiDollarSign, FiUsers, FiBook } from 'react-icons/fi';
import { apiRequest } from '../../services/api';
import './InstructorTheme.css';

const Earnings = () => {
  const [earnings, setEarnings] = useState([]);
  const [total, setTotal] = useState(0);
  const [duration, setDuration] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      setLoading(true);
      try {
        const response = await apiRequest(`/payment/earnings?duration=${duration}`);
        if (response.success) {
          setEarnings(response.data || []);
          setTotal(response.total || 0);
        }
      } catch (error) {
        console.error('Failed to fetch earnings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [duration]);

  return (
    <section className="page-container student-page instructor-theme-page">
      <div className="student-header-banner instructor-header-banner">
        <div className="student-header-content">
          <span className="student-header-label">SCHOLARHUB REVENUE</span>
          <h1>Instructor Earnings</h1>
          <p>Real-time revenue tracking across all your published courses.</p>
        </div>
      </div>

      <div className="instructor-earnings-grid">
        <article className="student-panel">
          <div className="student-panel-body">
            <span className="studio-section-label">Total Revenue ({duration === 'all' ? 'Lifetime' : `Last ${duration}`})</span>
            <h2 className="earnings-total">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
            <div className="earnings-filter-row" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              {['all', '7d', '30d', '1y'].map(d => (
                <button 
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`btn btn-sm ${duration === d ? 'btn-primary' : 'btn-soft'}`}
                >
                  {d === 'all' ? 'All Time' : d.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </article>
        
        <article className="student-panel">
          <div className="student-panel-body earnings-highlight">
            <h3><FiTrendingUp /> Performance Tip</h3>
            <p>
              Courses with detailed descriptions and video previews tend to have 30% higher conversion rates. 
              Keep your curriculum updated to maintain steady revenue.
            </p>
          </div>
        </article>
      </div>

      <article className="student-panel full-width">
        <div className="student-panel-header">
          <h3><FiBook /> Course-wise Breakdown</h3>
          <span className="student-panel-tag">{earnings.length} Courses</span>
        </div>
        <div className="student-panel-body">
          {loading ? (
            <div className="studio-loading" style={{ padding: '2rem', textAlign: 'center' }}>
              <div className="spinner"></div>
              <p>Calculating earnings...</p>
            </div>
          ) : earnings.length > 0 ? (
            <div className="earnings-course-grid">
              {earnings.map((item) => (
                <div className="earnings-course-card" key={item.courseId}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.title}</h4>
                    <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FiUsers size={14} /> {item.salesCount} Total Sales
                    </p>
                  </div>
                  <div className="earnings-course-meta" style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--primary-blue)', display: 'block' }}>
                      ₹{item.totalEarned.toLocaleString('en-IN')}
                    </strong>
                    <span className="status-chip neutral" style={{ fontSize: '0.75rem' }}>
                      Average Price: ₹{item.salesCount > 0 ? (item.totalEarned / item.salesCount).toFixed(0) : 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="studio-empty" style={{ padding: '4rem', textAlign: 'center' }}>
              <FiDollarSign size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <h4>No earnings data for this period</h4>
              <p>When students purchase your courses, their payments will appear here.</p>
            </div>
          )}
        </div>
      </article>
    </section>
  );
};

export default Earnings;
