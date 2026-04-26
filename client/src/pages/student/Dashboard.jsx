import React, { useState, useEffect } from 'react';
import { FiGrid, FiBook, FiCheckSquare, FiTrendingUp, FiClock, FiUser, FiArrowRight, FiCalendar, FiAlertCircle, FiMail, FiAward } from 'react-icons/fi';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import './Dashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  
  const [semesterInfo, setSemesterInfo] = useState(null);
  const [caCycles, setCaCycles] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // TODO: Backend Integration - Fetch student dashboard overview
        // Expected API: GET /api/students/dashboard
        // Response should contain:
        // {
        //   semester: { name: "Spring 2026", startDate: "2026-01-15", endDate: "2026-05-15" },
        //   caCycles: [{ _id, name, startDate, endDate, status, grades: [{ courseName, grade, maxGrade }] }],
        //   schedule: [{ _id, title, courseName, type, datetime, location, deadline }],
        //   recentGrades: [{ courseName, grade, maxGrade, date }]
        // }
        const data = await apiRequest('/students/dashboard', 'GET');
        setSemesterInfo(data?.semester || null);
        setCaCycles(data?.caCycles || []);
        setRecentGrades(data?.recentGrades || []);
        setSchedule(data?.schedule || []);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const activeCyclesCount = caCycles.filter(c => c.status === 'active').length;
  const upcomingEventsCount = schedule.filter(s => new Date(s.datetime) > new Date()).length;
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: { background: '#dcfce7', color: '#16A34A' },
      upcoming: { background: '#dbeafe', color: '#2563eb' },
      closed: { background: '#f3f4f6', color: '#6b7280' }
    };
    return styles[status] || styles.closed;
  };

  return (
    <div className="student-page">
      {/* Header Banner */}
      <div className="student-header-banner">
        <div className="student-header-content">
          <span className="student-header-label">STUDENT PORTAL</span>
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'Student'}</h1>
          <p>
            {semesterInfo?.name 
              ? `You're in the ${semesterInfo.name} semester. Keep up the great work!` 
              : 'Track your progress and stay on top of your courses.'}
          </p>
        </div>
        <div className="student-header-visual">
          <FiUser size={64} />
        </div>
      </div>

      {/* Stats Row */}
      <div className="student-stats-row">
        <div className="student-stat-card">
          <div className="student-stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <FiGrid />
          </div>
          <div className="student-stat-info">
            <span className="student-stat-value">{caCycles.length}</span>
            <span className="student-stat-label">CA Cycles</span>
          </div>
          {activeCyclesCount > 0 && (
            <span className="student-stat-badge">{activeCyclesCount} active</span>
          )}
        </div>

        <div className="student-stat-card">
          <div className="student-stat-icon" style={{ background: '#dcfce7', color: '#16A34A' }}>
            <FiTrendingUp />
          </div>
          <div className="student-stat-info">
            <span className="student-stat-value">{recentGrades.length}</span>
            <span className="student-stat-label">Recent Grades</span>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <FiCalendar />
          </div>
          <div className="student-stat-info">
            <span className="student-stat-value">{schedule.length}</span>
            <span className="student-stat-label">Upcoming</span>
          </div>
          {upcomingEventsCount > 0 && (
            <span className="student-stat-badge">{upcomingEventsCount} events</span>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="student-content-grid">
        {/* CA Cycles Panel */}
        <div className="student-panel">
          <div className="student-panel-header">
            <h3><FiGrid size={18} /> Continuous Assessment</h3>
            <span className="student-panel-tag">{caCycles.length}</span>
          </div>
          <div className="student-panel-body">
            {caCycles.length === 0 ? (
              <div className="student-panel-empty">
                <p>No CA cycles available at the moment.</p>
              </div>
            ) : (
              <div className="student-list">
                {caCycles.slice(0, 4).map((cycle) => (
                  <div key={cycle._id} className="student-list-item">
                    <div className="student-list-header">
                      <span className="student-list-title">{cycle.name}</span>
                      <span 
                        className="student-list-badge"
                        style={getStatusBadge(cycle.status)}
                      >
                        {cycle.status}
                      </span>
                    </div>
                    <div className="student-list-meta">
                      <span><FiClock size={12} /> {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}</span>
                    </div>
                    {cycle.grades && cycle.grades.length > 0 && (
                      <div className="student-grades-list">
                        {cycle.grades.slice(0, 2).map((grade, idx) => (
                          <div key={idx} className="student-grade-row">
                            <span>{grade.courseName}</span>
                            <span className="student-grade-score">{grade.grade}/{grade.maxGrade}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Schedule Panel */}
        <div className="student-panel">
          <div className="student-panel-header">
            <h3><FiCalendar size={18} /> Upcoming Schedule</h3>
            <span className="student-panel-tag">{schedule.length}</span>
          </div>
          <div className="student-panel-body">
            {schedule.length === 0 ? (
              <div className="student-panel-empty">
                <p>No upcoming classes or deadlines.</p>
              </div>
            ) : (
              <div className="student-list">
                {schedule.slice(0, 5).map((item) => (
                  <div key={item._id} className="student-schedule-item">
                    <div 
                      className="student-schedule-icon"
                      style={{
                        background: item.type === 'class' ? '#dbeafe' : '#fef3c7',
                        color: item.type === 'class' ? '#2563eb' : '#d97706'
                      }}
                    >
                      {item.type === 'class' ? <FiClock /> : <FiAlertCircle />}
                    </div>
                    <div className="student-schedule-details">
                      <span className="student-schedule-title">{item.title}</span>
                      <span className="student-schedule-meta">
                        {item.courseName} • {formatDate(item.datetime)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Grades Table */}
      {recentGrades.length > 0 && (
        <div className="student-panel full-width">
          <div className="student-panel-header">
            <h3><FiTrendingUp size={18} /> Recent Grades</h3>
            <span className="student-panel-tag">{recentGrades.length}</span>
          </div>
          <div className="student-panel-body">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Grade</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentGrades.map((grade, idx) => (
                  <tr key={idx}>
                    <td>{grade.courseName}</td>
                    <td>
                      <span className="student-grade-badge">
                        {grade.grade}/{grade.maxGrade}
                      </span>
                    </td>
                    <td>{formatDate(grade.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;