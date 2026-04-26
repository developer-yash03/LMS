import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiDollarSign, FiLayers, FiPlus, FiRefreshCw, FiUsers } from 'react-icons/fi';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

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

    return {
      courses: courses.length,
      modules: moduleCount,
      topics: topicCount,
      earnings,
    };
  }, [courses]);

  const stats = [
    { label: 'Courses live', count: loading ? '...' : String(summary.courses), icon: FiBookOpen },
    { label: 'Modules built', count: loading ? '...' : String(summary.modules), icon: FiLayers },
    { label: 'Topics published', count: loading ? '...' : String(summary.topics), icon: FiUsers },
    { label: 'Price total', count: loading ? '...' : `₹${summary.earnings}`, icon: FiDollarSign },
  ];

  return (
    <section className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2 className="page-title">Instructor Dashboard</h2>
          <p>Monitor your catalog and jump straight into course editing.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-soft" onClick={() => window.location.reload()}>
            <FiRefreshCw /> Refresh
          </button>
          <Link to="/instructor/courses" className="btn btn-primary">
            <FiPlus /> Manage Courses
          </Link>
        </div>
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

      <div className="table-shell">
        <table className="table-ui">
          <thead>
            <tr>
              <th>Course</th>
              <th>Category</th>
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
                    <td>{moduleCount}</td>
                    <td>{topicCount}</td>
                    <td>
                      <Link to="/instructor/courses" className="btn btn-soft btn-sm">
                        Open editor
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
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