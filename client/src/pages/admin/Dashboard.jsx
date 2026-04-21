import React from 'react';
import { FiClock, FiLayers, FiShield, FiTrendingUp, FiUsers } from 'react-icons/fi';

const AdminDash = () => {
  const stats = [
    { label: 'Total Students', count: '1,240', icon: FiUsers },
    { label: 'Active Courses', count: '45', icon: FiLayers },
    { label: 'Total Revenue', count: '₹85,000', icon: FiTrendingUp },
  ];

  return (
    <section className="dashboard-page">
      <h2 className="page-title">
        <FiShield /> Admin Control Panel
      </h2>

      <div className="stats-grid admin-stats">
        {stats.map((s, i) => (
          <article key={i} className="stat-tile panel-surface">
            <p>
              <s.icon /> {s.label}
            </p>
            <h3>{s.count}</h3>
          </article>
        ))}
      </div>

      <div className="table-shell">
        <h3 className="table-title">
          <FiClock /> Recent Course Approvals
        </h3>
        <table className="table-ui">
          <thead>
            <tr>
              <th>Course Name</th>
              <th>Instructor</th>
              <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Advanced Node.js</td>
            <td>Aman</td>
            <td>
              <span className="status-chip warning">Pending</span>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </section>
  );
};

export default AdminDash;