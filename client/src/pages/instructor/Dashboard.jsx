import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiCheckCircle, FiClock, FiDollarSign } from 'react-icons/fi';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './InstructorTheme.css';

const InstructorDash = () => {
  const { showToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await apiRequest('/courses/instructor/courses');
        setCourses(response.data || []);
      } catch (error) {
        showToast(error.message || 'Unable to load dashboard metrics', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [showToast]);

  const summary = useMemo(() => {
    const moduleCount = courses.reduce((total, course) => total + (course.modules || []).length, 0);
    const topicCount = courses.reduce(
      (total, course) => total + (course.modules || []).reduce((moduleTotal, module) => moduleTotal + (module.topics || []).length, 0),
      0
    );
    const earnings = courses.reduce((total, course) => total + Number(course.price || 0), 0);
    const pending = courses.filter((course) => course.approvalStatus === 'pending').length;
    const approved = courses.filter((course) => !course.approvalStatus || course.approvalStatus === 'approved').length;

    return {
      courses: courses.length,
      modules: moduleCount,
      topics: topicCount,
      earnings,
      pending,
      approved,
    };
  }, [courses]);

  const stats = [
    { label: 'Total Courses', count: loading ? '...' : String(summary.courses), icon: FiBookOpen },
    { label: 'Pending Review', count: loading ? '...' : String(summary.pending), icon: FiClock },
    { label: 'Approved', count: loading ? '...' : String(summary.approved), icon: FiCheckCircle },
    { label: 'Catalog Value', count: loading ? '...' : `₹${summary.earnings}`, icon: FiDollarSign },
  ];

  const getDisplayStatus = (course) => course.approvalStatus || 'approved';

  return (
    <section className="page-container student-page instructor-theme-page">
      <div className="student-header-banner instructor-header-banner">
        <div className="student-header-content">
          <span className="student-header-label">SCHOLARHUB INSTRUCTOR PORTAL</span>
          <h1>Good day, Instructor</h1>
          <p>Manage your courses, monitor approvals, and grow your ScholarHub catalog.</p>
          <div style={{ marginTop: 12 }}>
            <Link to="/instructor/quizzes" className="btn btn-primary">Create Quiz</Link>
          </div>
        </div>
      </div>

      <div className="student-stats-row instructor-stats-row">
        {stats.map((item, index) => (
          <article key={index} className="student-stat-card">
            <div className="student-stat-icon instructor-stat-icon">
              <item.icon />
            </div>
            <div className="student-stat-info">
              <span className="student-stat-value">{item.count}</span>
              <span className="student-stat-label">{item.label}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="table-shell instructor-table-shell">
        <table className="table-ui">
          <thead>
            <tr>
              <th>Course</th>
              <th>Category</th>
              <th>Status</th>
              <th>Modules</th>
              <th>Topics</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length > 0 ? (
              courses.map((course) => {
                const moduleCount = (course.modules || []).length;
                const topicCount = (course.modules || []).reduce((count, module) => count + (module.topics || []).length, 0);

                return (
                  <tr key={course._id}>
                    <td>
                      <strong>{course.title}</strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {course.price === 0 ? 'Free' : `₹${course.price}`}
                      </div>
                    </td>
                    <td>{course.category}</td>
                    <td>
                      <span
                        className={`status-chip ${
                          getDisplayStatus(course) === 'approved'
                            ? 'success'
                            : getDisplayStatus(course) === 'rejected'
                              ? 'neutral'
                              : 'warning'
                        }`}
                      >
                        {getDisplayStatus(course)}
                      </span>
                    </td>
                    <td>{moduleCount}</td>
                    <td>{topicCount}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to="/instructor/courses" className="btn btn-soft btn-sm">Open editor</Link>
                        <Link to={`/instructor/quizzes?course=${course._id}`} className="btn btn-outline btn-sm">Create Quiz</Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  {loading ? 'Loading your courses...' : 'No courses yet. Create one to get started.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default InstructorDash;