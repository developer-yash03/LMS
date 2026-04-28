import React, { useState, useEffect, useMemo } from 'react';
import { FiAlertCircle, FiCheckCircle, FiClock, FiFileText, FiUser, FiExternalLink, FiEdit3, FiSave, FiX } from 'react-icons/fi';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './InstructorTheme.css';

const Assignments = () => {
  const { showToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Grading state
  const [gradingId, setGradingId] = useState(null);
  const [gradeValue, setGradeValue] = useState(10);
  const [feedbackValue, setFeedbackValue] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiRequest('/courses/instructor/courses');
        const courseList = res.data || [];
        setCourses(courseList);
        if (courseList.length > 0) setSelectedCourse(courseList[0]._id);
      } catch (err) {
        showToast('Failed to load courses', 'error');
      }
    };
    fetchCourses();
  }, [showToast]);

  useEffect(() => {
    if (!selectedCourse) return;
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const res = await apiRequest(`/courses/instructor/${selectedCourse}/submissions`);
        setSubmissions(res.data || []);
      } catch (err) {
        showToast('Failed to load submissions', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [selectedCourse, showToast]);

  const handleGradeSubmit = async (id) => {
    if (gradeValue < 0 || gradeValue > 10) {
      showToast('Grade must be between 0 and 10', 'error');
      return;
    }
    try {
      const res = await apiRequest(`/courses/instructor/submissions/${id}/grade`, 'POST', {
        grade: Number(gradeValue),
        feedback: feedbackValue
      });
      if (res.success) {
        showToast('Assignment graded!');
        setSubmissions(prev => prev.map(s => s._id === id ? { ...s, ...res.data } : s));
        setGradingId(null);
        setFeedbackValue('');
      }
    } catch (err) {
      showToast('Failed to save grade', 'error');
    }
  };

  const stats = useMemo(() => {
    const pending = submissions.filter(s => s.status === 'pending').length;
    const graded = submissions.filter(s => s.status === 'graded').length;
    const total = submissions.length;
    return { pending, graded, total };
  }, [submissions]);

  return (
    <section className="page-container student-page instructor-theme-page">
      <div className="student-header-banner instructor-header-banner">
        <div className="student-header-content">
          <span className="student-header-label">SCHOLARHUB SUBMISSIONS</span>
          <h1>Assignments Center</h1>
          <p>Review student work, provide feedback, and assign grades out of 10.</p>
        </div>
      </div>

      <div className="student-stats-row instructor-stats-row">
        <article className="student-stat-card">
          <div className="student-stat-icon instructor-stat-icon">
            <FiFileText />
          </div>
          <div className="student-stat-info">
            <span className="student-stat-value">{stats.total}</span>
            <span className="student-stat-label">Total Submissions</span>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon instructor-stat-icon">
            <FiAlertCircle />
          </div>
          <div className="student-stat-info">
            <span className="student-stat-value">{stats.pending}</span>
            <span className="student-stat-label">Needs Grading</span>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon instructor-stat-icon">
            <FiCheckCircle />
          </div>
          <div className="student-stat-info">
            <span className="student-stat-value">{stats.graded}</span>
            <span className="student-stat-label">Graded Work</span>
          </div>
        </article>
      </div>

      <div className="assignment-filter-section" style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)' }}>
          Select Course to Review:
        </label>
        <select 
          className="form-input" 
          value={selectedCourse} 
          onChange={(e) => setSelectedCourse(e.target.value)}
          style={{ maxWidth: '400px' }}
        >
          {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
      </div>

      <article className="student-panel full-width">
        <div className="student-panel-header">
          <h3><FiClock size={18} /> Submission Queue</h3>
          <span className="student-panel-tag">{submissions.length} Total</span>
        </div>
        <div className="student-panel-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <p>Loading submissions...</p>
            </div>
          ) : submissions.length > 0 ? (
            <div className="table-shell" style={{ margin: 0, boxShadow: 'none', border: 'none' }}>
              <table className="table-ui">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Topic</th>
                    <th>Submission</th>
                    <th>Status</th>
                    <th>Grade / 10</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="user-avatar-sm" style={{ background: 'var(--primary-blue)', color: 'white', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                            {sub.user?.name?.[0] || 'S'}
                          </div>
                          <div>
                            <strong style={{ display: 'block' }}>{sub.user?.name}</strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>
                      <td>{sub.topic?.title}</td>
                      <td>
                        <a 
                          href={sub.fileUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn btn-soft btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <FiExternalLink /> View File
                        </a>
                      </td>
                      <td>
                        <span className={`status-chip ${sub.status === 'graded' ? 'success' : 'warning'}`}>
                          {sub.status || 'pending'}
                        </span>
                      </td>
                      <td>
                        {gradingId === sub._id ? (
                          <input 
                            type="number" 
                            min="0" 
                            max="10" 
                            className="form-input" 
                            style={{ width: '70px', padding: '0.25rem' }}
                            value={gradeValue}
                            onChange={(e) => setGradeValue(e.target.value)}
                          />
                        ) : (
                          <strong style={{ fontSize: '1.1rem' }}>{sub.grade !== null ? sub.grade : '-'}</strong>
                        )}
                        <span style={{ color: 'var(--text-muted)', marginLeft: '0.25rem' }}>/ 10</span>
                      </td>
                      <td>
                        {gradingId === sub._id ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              className="btn btn-primary btn-sm" 
                              onClick={() => handleGradeSubmit(sub._id)}
                              title="Save Grade"
                            >
                              <FiSave />
                            </button>
                            <button 
                              className="btn btn-soft btn-sm" 
                              onClick={() => setGradingId(null)}
                              title="Cancel"
                            >
                              <FiX />
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="btn btn-outline btn-sm" 
                            onClick={() => {
                              setGradingId(sub._id);
                              setGradeValue(sub.grade || 10);
                              setFeedbackValue(sub.feedback || '');
                            }}
                          >
                            <FiEdit3 /> {sub.status === 'graded' ? 'Change Grade' : 'Grade'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <FiFileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <h4>No submissions found for this course</h4>
              <p>When students upload assignments, they will appear in this queue.</p>
            </div>
          )}
        </div>
      </article>
    </section>
  );
};

export default Assignments;
