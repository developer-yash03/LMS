import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBookOpen, FiDollarSign, FiUsers } from 'react-icons/fi';

const InstructorDash = () => {
  const stats = [
    { label: 'Total Students', count: '450', icon: FiUsers },
    { label: 'Total Earnings', count: '₹12,400', icon: FiDollarSign },
  ];

  return (
    <section className="dashboard-page">
      <div className="dashboard-header">
        <h2 className="page-title">
          <FiBookOpen /> Instructor Dashboard
        </h2>
        <Link to="/instructor/create" className="btn btn-primary">
          Create New Course <FiArrowRight />
        </Link>
      </div>

      <div className="stats-grid">
        {stats.map((item, index) => (
          <article key={index} className="stat-tile panel-surface">
            <p>
              <item.icon /> {item.label}
            </p>
            <h3>{item.count}</h3>
          </article>
        ))}
      </div>
    </section>
  );
};

export default InstructorDash;