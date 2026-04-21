import React from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiUsers, FiDollarSign, FiBookOpen } from 'react-icons/fi';

const InstructorDash = () => {
  const stats = [
    { label: 'Total Students', count: '450', icon: FiUsers },
    { label: 'Course Enrollments', count: '1,200', icon: FiBookOpen },
    { label: 'Total Earnings', count: '₹12,400', icon: FiDollarSign },
  ];

  return (
    <section className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">Instructor Dashboard</h2>
          <p>Manage your courses and track your performance.</p>
        </div>
        <Link to="/instructor/create" className="btn btn-primary">
          <FiPlus /> Create Course
        </Link>
      </div>

      <div className="stats-grid">
        {stats.map((item, index) => (
          <article key={index} className="stat-card">
            <div className="stat-icon">
              <item.icon />
            </div>
            <div className="stat-info">
              <h3>{item.count}</h3>
              <p>{item.label}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default InstructorDash;