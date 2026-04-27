import React, { useEffect, useMemo, useState } from 'react';
import { FiCheckCircle, FiClock, FiLayers, FiShield, FiTrendingUp, FiUsers, FiXCircle } from 'react-icons/fi';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminDash = () => {
  const { showToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  const loadCourses = async () => {
    setLoading(true);
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        apiRequest('/courses/admin/pending?status=pending'),
        apiRequest('/courses/admin/pending?status=approved'),
      ]);

      setCourses([...(pendingRes.data || []), ...(approvedRes.data || [])]);
    } catch (error) {
      showToast(error.message || 'Failed to load approval queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    loadCourses();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const summary = useMemo(() => {
    const pendingCount = courses.filter((course) => course.approvalStatus === 'pending').length;
    const approvedCount = courses.filter((course) => course.approvalStatus === 'approved').length;
    const uniqueInstructors = new Set(courses.map((course) => course?.instructor?._id).filter(Boolean)).size;

    return {
      pendingCount,
      approvedCount,
      uniqueInstructors,
      total: courses.length,
    };
  }, [courses]);

  const handleReview = async (courseId, status) => {
    const notePrompt =
      status === 'rejected'
        ? 'Add a reason for rejection (shown to instructor):'
        : 'Optional approval note for instructor:';
    const note = window.prompt(notePrompt, '');

    if (status === 'rejected' && !note?.trim()) {
      showToast('Rejection requires a short reason', 'error');
      return;
    }

    setProcessing((previous) => ({ ...previous, [courseId]: true }));
    try {
      const response = await apiRequest(`/courses/admin/${courseId}/approval`, 'PATCH', {
        status,
        note: note || '',
      });

      showToast(response.message || 'Course review updated', 'success');
      await loadCourses();
    } catch (error) {
      showToast(error.message || 'Unable to review this course', 'error');
    } finally {
      setProcessing((previous) => ({ ...previous, [courseId]: false }));
    }
  };

  const stats = [
    { label: 'Pending Approvals', count: String(summary.pendingCount), icon: FiClock },
    { label: 'Approved Courses', count: String(summary.approvedCount), icon: FiLayers },
    { label: 'Active Instructors', count: String(summary.uniqueInstructors), icon: FiUsers },
    { label: 'Reviewed Total', count: String(summary.total), icon: FiTrendingUp },
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
              <th>Review Note</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '1.75rem' }}>
                  Loading approval queue...
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '1.75rem' }}>
                  No courses available for review.
                </td>
              </tr>
            ) : (
              courses.map((course) => {
                const isPending = course.approvalStatus === 'pending';
                const isBusy = Boolean(processing[course._id]);

                return (
                  <tr key={course._id}>
                    <td>
                      <strong>{course.title}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{course.category}</div>
                    </td>
                    <td>{course?.instructor?.name || 'Instructor'}</td>
                    <td>
                      <span className={`status-chip ${isPending ? 'warning' : course.approvalStatus === 'approved' ? 'success' : 'neutral'}`}>
                        {course.approvalStatus}
                      </span>
                    </td>
                    <td style={{ maxWidth: '220px' }}>{course.approvalNote || '-'}</td>
                    <td>
                      {isPending ? (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-soft"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
                            onClick={() => handleReview(course._id, 'approved')}
                            disabled={isBusy}
                          >
                            <FiCheckCircle /> Approve
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
                            onClick={() => handleReview(course._id, 'rejected')}
                            disabled={isBusy}
                          >
                            <FiXCircle /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Already reviewed</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminDash;