import React, { useMemo } from 'react';
import { FiAlertCircle, FiCheckCircle, FiClock, FiFileText, FiUser } from 'react-icons/fi';
import './InstructorTheme.css';

const pendingSubmissions = [
  {
    id: 'a1',
    student: 'Sarah Jenkins',
    course: 'Advanced Neural Networks',
    assignment: 'Gradient Descent Practical',
    submittedAt: '2h ago',
    priority: 'action',
  },
  {
    id: 'a2',
    student: 'Liam O\'Conner',
    course: 'Ethics in Modern AI',
    assignment: 'Socio Economic Impact Essay',
    submittedAt: '4h ago',
    priority: 'normal',
  },
  {
    id: 'a3',
    student: 'Elena Rossi',
    course: 'Data Visualization Mastery',
    assignment: 'Data Storytelling Portfolio',
    submittedAt: '8h ago',
    priority: 'normal',
  },
];

const activeAssignments = [
  { id: 'x1', title: 'Gradient Descent Practical', course: 'Advanced Neural Networks', dueIn: '2 days', submissions: 18, total: 24 },
  { id: 'x2', title: 'Ethical Model Assessment', course: 'Ethics in Modern AI', dueIn: '5 days', submissions: 12, total: 19 },
  { id: 'x3', title: 'Dashboard Storyboard', course: 'Data Visualization Mastery', dueIn: '7 days', submissions: 9, total: 16 },
];

const Assignments = () => {
  const summary = useMemo(() => {
    const totalDue = activeAssignments.length;
    const totalSubmissions = activeAssignments.reduce((acc, item) => acc + item.submissions, 0);
    const totalExpected = activeAssignments.reduce((acc, item) => acc + item.total, 0);
    const completion = totalExpected === 0 ? 0 : Math.round((totalSubmissions / totalExpected) * 100);

    return {
      totalDue,
      queue: pendingSubmissions.length,
      completion,
    };
  }, []);

  return (
    <section className="page-container student-page instructor-theme-page">
      <div className="student-header-banner instructor-header-banner">
        <div className="student-header-content">
          <span className="student-header-label">SCHOLARHUB ASSIGNMENTS</span>
          <h1>Assignments Center</h1>
          <p>Review incoming submissions, monitor grading pace, and keep feedback timely.</p>
        </div>
      </div>

      <div className="student-stats-row instructor-stats-row">
        <article className="student-stat-card">
          <div className="student-stat-icon instructor-stat-icon">
            <FiFileText />
          </div>
          <div className="student-stat-info">
            <span className="student-stat-value">{summary.totalDue}</span>
            <span className="student-stat-label">Active Assignments</span>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon instructor-stat-icon">
            <FiAlertCircle />
          </div>
          <div className="student-stat-info">
            <span className="student-stat-value">{summary.queue}</span>
            <span className="student-stat-label">Pending Submissions</span>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon instructor-stat-icon">
            <FiCheckCircle />
          </div>
          <div className="student-stat-info">
            <span className="student-stat-value">{summary.completion}%</span>
            <span className="student-stat-label">Submission Completion</span>
          </div>
        </article>
      </div>

      <div className="student-content-grid">
        <article className="student-panel">
          <div className="student-panel-header">
            <h3><FiClock size={18} /> Pending Submissions</h3>
            <span className="student-panel-tag">{pendingSubmissions.length}</span>
          </div>
          <div className="student-panel-body">
            <div className="student-list">
              {pendingSubmissions.map((item) => (
                <div key={item.id} className="student-list-item instructor-list-item">
                  <div className="student-list-header">
                    <span className="student-list-title">{item.assignment}</span>
                    <span className={`status-chip ${item.priority === 'action' ? 'warning' : 'neutral'}`}>
                      {item.priority === 'action' ? 'Needs Action' : 'Pending'}
                    </span>
                  </div>
                  <div className="student-list-meta">
                    <span><FiUser size={12} /> {item.student}</span>
                    <span>{item.course}</span>
                    <span>{item.submittedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="student-panel">
          <div className="student-panel-header">
            <h3><FiFileText size={18} /> Active Assignment Queue</h3>
            <span className="student-panel-tag">{activeAssignments.length}</span>
          </div>
          <div className="student-panel-body">
            <div className="student-list">
              {activeAssignments.map((item) => {
                const progress = item.total === 0 ? 0 : Math.round((item.submissions / item.total) * 100);

                return (
                  <div key={item.id} className="student-list-item instructor-list-item">
                    <div className="student-list-header">
                      <span className="student-list-title">{item.title}</span>
                      <span className="student-panel-tag">Due in {item.dueIn}</span>
                    </div>
                    <div className="student-list-meta">
                      <span>{item.course}</span>
                      <span>{item.submissions}/{item.total} submitted</span>
                    </div>
                    <div className="progress-container">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default Assignments;
