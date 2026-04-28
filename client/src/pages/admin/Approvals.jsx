import React, { useState, useEffect } from 'react';
import { FiCheckSquare, FiCheck, FiXCircle, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';

const AdminApprovals = () => {
  const { showToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/admin/courses/approvals', 'GET');
      if (res.success) {
        setCourses(res.data);
      }
    } catch (error) {
      showToast('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleStatusUpdate = async (courseId, newStatus, courseTitle) => {
    try {
      const res = await apiRequest(`/admin/courses/${courseId}/approve`, 'PUT', { status: newStatus });
      if (res.success) {
        showToast(`Course "${courseTitle}" ${newStatus === 'approved' ? 'approved' : 'revoked'} successfully`, 'success');
        fetchCourses();
      }
    } catch (error) {
      showToast(error.message || 'Action failed', 'error');
    }
  };

  return (
    <section className="table-section">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="page-title" style={{ margin: 0 }}>
          <FiCheckSquare /> Course Approvals
        </h2>
        <button className="btn-clear" onClick={fetchCourses} title="Refresh">
          <FiRefreshCw />
        </button>
      </div>

      <div className="table-shell">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading courses...</div>
        ) : (
          <table className="table-ui">
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>Course Details</th>
                <th>Instructor</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id}>
                  <td style={{ width: '120px' }}>
                    <div className="table-img-wrapper" style={{ width: '100px', height: '60px', borderRadius: '8px', overflow: 'hidden' }}>
                      <img 
                        src={course.thumbnail || 'https://via.placeholder.com/100x60?text=No+Image'} 
                        alt={course.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="table-strong">{course.title}</span>
                      <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{course.category} • ₹{course.price}</span>
                      <Link to={`/course/${course._id}`} target="_blank" style={{ fontSize: '0.75rem', color: '#0056D2', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Preview <FiExternalLink size={10} />
                      </Link>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{course.instructor?.name || 'Unknown'}</span>
                      <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{course.instructor?.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-chip ${course.approvalStatus === 'approved' ? 'success' : (course.approvalStatus === 'pending' ? 'neutral' : 'danger')}`}>
                      {course.approvalStatus.charAt(0).toUpperCase() + course.approvalStatus.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {course.approvalStatus !== 'approved' ? (
                        <button 
                          className="btn btn-success btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          onClick={() => handleStatusUpdate(course._id, 'approved', course.title)}
                        >
                          <FiCheck /> Approve
                        </button>
                      ) : (
                        <button 
                          className="btn btn-danger btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          onClick={() => handleStatusUpdate(course._id, 'pending', course.title)}
                        >
                          <FiXCircle /> Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No courses pending approval.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default AdminApprovals;
