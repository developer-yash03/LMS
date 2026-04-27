import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiPlay, FiCheckCircle, FiArrowRight, FiUsers } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { apiRequest } from '../../services/api';
import CourseCard from '../../components/course/CourseCard';
import './MyLearning.css';

const MyLearning = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [unenrolledCourses, setUnenrolledCourses] = useState([]);
  const [progressByCourse, setProgressByCourse] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user) {
        setLoading(false);
        setEnrolledCourses([]);
        return;
      }

      setLoading(true);
      try {
        // TODO: Backend Integration - Fetch student's enrolled courses with progress
        // Expected API: GET /api/courses/student/enrolled-courses
        // Response: { data: [{ _id, title, thumbnail, instructor, progressPercentage }] }
        const enrolledResponse = await apiRequest('/courses/student/enrolled-courses');
        const courses = enrolledResponse.data || [];
        setEnrolledCourses(courses);

        // TODO: Backend Integration - Fetch progress for each course
        // This could be optimized to fetch all progress in one call
        const progressEntries = await Promise.all(
          courses.map(async (course) => {
            try {
              const progressResponse = await apiRequest(`/courses/${course._id}/progress`);
              return [course._id, progressResponse?.data?.progressPercentage || 0];
            } catch {
              return [course._id, 0];
            }
          })
        );

        setProgressByCourse(Object.fromEntries(progressEntries));

        // Fetch courses for browsing
        const browseResponse = await apiRequest('/courses/browse?limit=10');
        const allAvailable = browseResponse.data || [];
        
        // Filter out already enrolled courses
        const enrolledIds = new Set(courses.map(c => c._id));
        const unEnrolled = allAvailable
           .filter(c => !enrolledIds.has(c._id))
           .map(course => ({
               ...course,
               id: course._id, // CourseCard expects 'id'
               instructor: typeof course.instructor === 'object' ? course.instructor?.name : course.instructor,
           }));
           
        setUnenrolledCourses(unEnrolled);
      } catch (error) {
        showToast(error.message || 'Failed to load enrolled courses', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [showToast, user]);

  const courses = useMemo(() => enrolledCourses || [], [enrolledCourses]);

  return (
    <div className="student-page">
      <div className="student-header-banner">
        <div className="student-header-content">
          <span className="student-header-label">MY LEARNING</span>
          <h1>Continue Learning</h1>
          <p>Pick up where you left off and keep building your skills.</p>
        </div>
        <div className="student-header-visual">
          <FiBookOpen size={64} />
        </div>
      </div>

      <div className="learning-section" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#2e2117', fontSize: '1.5rem', fontWeight: '700' }}>
          Enrolled Courses
        </h2>
        {courses.length === 0 ? (
          <div className="student-empty-card">
            <div className="student-empty-icon">
              <FiBookOpen size={48} />
            </div>
            <h3>No courses yet</h3>
            <p>You haven't enrolled in any courses. Start your learning journey today!</p>
            <Link to="/browse" className="btn-primary-brown">
              Browse All Courses <FiArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="courses-grid-auth">
            {courses.map((course) => {
              const progress = progressByCourse[course._id] || 0;
              const isComplete = progress === 100;
              const instructor =
                typeof course.instructor === 'object'
                  ? course.instructor?.name
                  : course.instructor;

              return (
                <Link
                  key={course._id}
                  to={`/player/${course._id}`}
                  className="course-card-auth"
                >
                  <div className="course-card-image-auth">
                    <img
                      src={course.thumbnail || `https://picsum.photos/seed/${course._id}/800/450`}
                      alt={`${course.title} thumbnail`}
                    />
                    {isComplete && (
                      <div className="course-card-completed-badge">
                        <FiCheckCircle size={14} /> Completed
                      </div>
                    )}
                  </div>
                  
                  <div className="course-card-body-auth">
                    <span className="course-card-tag">{course.category || 'Course'}</span>
                    <h3 className="course-card-title-auth">{course.title}</h3>
                    <p className="course-card-instructor-auth">
                      <FiUsers size={14} /> {instructor || 'Instructor'}
                    </p>
                    
                    <div className="course-card-progress-auth">
                      <div className="progress-track-auth">
                        <div 
                          className="progress-fill-auth" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="progress-label-auth">{progress}% Complete</span>
                    </div>
                    
                    <button className="course-card-action-auth">
                      {isComplete ? (
                        <>Review Course <FiArrowRight size={14} /></>
                      ) : (
                        <>Continue Learning <FiPlay size={14} /></>
                      )}
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="learning-section" style={{ marginTop: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#2e2117', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
            Browse More Courses
          </h2>
          <Link to="/browse" style={{ color: 'var(--primary-blue)', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            View All <FiArrowRight size={16} />
          </Link>
        </div>
        
        {unenrolledCourses.length === 0 ? (
          <div style={{ padding: '2rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>No new courses available to browse at the moment.</p>
          </div>
        ) : (
          <div className="course-grid">
            {unenrolledCourses.slice(0, 4).map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearning;