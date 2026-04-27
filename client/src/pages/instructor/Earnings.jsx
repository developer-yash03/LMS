import React, { useMemo } from 'react';
import { FiDownload, FiTrendingUp } from 'react-icons/fi';
import './InstructorTheme.css';

const monthlyRevenue = [
  { month: 'Apr', amount: 12600 },
  { month: 'May', amount: 15400 },
  { month: 'Jun', amount: 18950 },
  { month: 'Jul', amount: 17100 },
  { month: 'Aug', amount: 23200 },
  { month: 'Sep', amount: 24800 },
];

const courseBreakdown = [
  { id: 'c1', title: 'Advanced Classical Rhetoric', students: 1248, revenue: 42400, tag: 'Top Seller' },
  { id: 'c2', title: 'Foundations of Ethics', students: 854, revenue: 28150, tag: 'Stable' },
  { id: 'c3', title: 'Modern Political Theory', students: 2105, revenue: 56920, tag: 'Trending' },
  { id: 'c4', title: 'Logic & Argumentation', students: 412, revenue: 15380, tag: 'Niche' },
];

const Earnings = () => {
  const stats = useMemo(() => {
    const lifetime = monthlyRevenue.reduce((sum, item) => sum + item.amount, 0);
    const bestMonth = monthlyRevenue.reduce((best, current) => (current.amount > best.amount ? current : best), monthlyRevenue[0]);

    return {
      lifetime,
      bestMonth,
    };
  }, []);

  const maxRevenue = Math.max(...monthlyRevenue.map((item) => item.amount));

  return (
    <section className="page-container student-page instructor-theme-page">
      <div className="student-header-banner instructor-header-banner">
        <div className="student-header-content">
          <span className="student-header-label">SCHOLARHUB EARNINGS</span>
          <h1>Earnings Overview</h1>
          <p>Manage your institutional revenue and analyze course-level performance.</p>
        </div>
      </div>

      <div className="instructor-earnings-grid">
        <article className="student-panel">
          <div className="student-panel-body">
            <span className="studio-section-label">Lifetime Earnings</span>
            <h2 className="earnings-total">₹{stats.lifetime.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
            <p className="earnings-growth">+12.5% from last month</p>
          </div>
        </article>
        <article className="student-panel">
          <div className="student-panel-body earnings-highlight">
            <h3>Expanding Reach</h3>
            <p>
              Your course "Classical Rhetoric" saw a significant uptick this month, contributing to a 24% revenue
              spike in the Humanities sector.
            </p>
            <button type="button" className="btn btn-soft">View Details</button>
          </div>
        </article>
      </div>

      <article className="student-panel full-width">
        <div className="student-panel-header">
          <h3><FiTrendingUp size={18} /> Revenue Trends</h3>
          <span className="student-panel-tag">6 Months</span>
        </div>
        <div className="student-panel-body">
          <div className="earnings-chart-wrap">
            {monthlyRevenue.map((item) => (
              <div key={item.month} className="earnings-bar-col">
                <div className="earnings-bar-track">
                  <div className="earnings-bar" style={{ height: `${Math.max(12, Math.round((item.amount / maxRevenue) * 100))}%` }} />
                </div>
                <span>{item.month}</span>
              </div>
            ))}
          </div>
          <p className="studio-hint">
            Best month: {stats.bestMonth.month} (₹{stats.bestMonth.amount.toLocaleString()})
          </p>
        </div>
      </article>

      <article className="student-panel full-width">
        <div className="student-panel-header">
          <h3>Course Breakdown</h3>
          <button type="button" className="btn btn-soft btn-sm">
            <FiDownload size={14} /> Download Report
          </button>
        </div>
        <div className="student-panel-body">
          <div className="earnings-course-grid">
            {courseBreakdown.map((course) => (
              <div className="earnings-course-card" key={course.id}>
                <div>
                  <h4>{course.title}</h4>
                  <p>{course.students.toLocaleString()} Students Enrolled</p>
                </div>
                <div className="earnings-course-meta">
                  <strong>₹{course.revenue.toLocaleString()}</strong>
                  <span className="status-chip neutral">{course.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
};

export default Earnings;
