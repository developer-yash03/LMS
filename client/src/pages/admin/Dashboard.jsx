import React from 'react';
import { FiClock, FiLayers, FiShield, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';

const AdminDash = () => {
  const { showToast } = useToast();
  const stats = [
    { label: 'Total Learners', count: '1,240', icon: FiUsers },
    { label: 'Active Courses', count: '45', icon: FiLayers },
    { label: 'Platform Revenue', count: '₹85,000', icon: FiTrendingUp },
  ];

  return (
    <section className="page-container">
      <div className="page-header">
        <h2 className="page-title">
          <FiShield color="var(--primary-blue)" /> Admin Portal
        </h2>
        <p>Monitor platform health, users, and course approvals.</p>
      </div>

      <div className="stats-grid">
        {stats.map((s, i) => (
          <article key={i} className="stat-card">
            <div className="stat-icon" style={{ background: '#f5f7f8', color: '#1f1f1f' }}>
              <s.icon />
            </div>
            <div className="stat-info">
              <h3>{s.count}</h3>
              <p>{s.label}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="table-shell">
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem' }}>
            <FiClock /> Pending Approvals
          </h3>
        </div>
        <table className="table-ui">
          <thead>
            <tr>
              <th>Course Name</th>
              <th>Instructor</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Advanced Node.js Architecture</td>
              <td>Aman Singh</td>
              <td>
                <span className="status-chip warning">Pending</span>
              </td>
              <td>
                <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }} onClick={() => showToast('Opening review panel...', 'info')}>Review</button>
              </td>
            </tr>
            <tr>
              <td>React for Enterprise</td>
              <td>Priya Sharma</td>
              <td>
                <span className="status-chip warning">Pending</span>
              </td>
              <td>
                <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }} onClick={() => showToast('Opening review panel...', 'info')}>Review</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminDash;