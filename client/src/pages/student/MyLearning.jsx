import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiPlay } from 'react-icons/fi';
import Progressbar from '../../components/common/Progressbar';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { apiRequest } from '../../services/api';

const MyLearning = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
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
        const enrolledResponse = await apiRequest('/courses/student/enrolled-courses');
        const courses = enrolledResponse.data || [];
        setEnrolledCourses(courses);

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
      } catch (error) {
        showToast(error.message || 'Failed to load enrolled courses', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [showToast, user]);

  const courses = useMemo(() => enrolledCourses || [], [enrolledCourses]);

  if (!user) {
    return (
      <section className="page-container">
        <div className="page-header">
          <h2 className="page-title"><FiBookOpen /> My Learning</h2>
          <p>Please login to see your enrolled courses.</p>
        </div>
        <Link to="/login" className="btn btn-primary">Go to Login</Link>
      </section>
    );
  }

  return (
    <section className="page-container">
      <div className="page-header">
        <h2 className="page-title"><FiBookOpen /> My Learning</h2>
        <p>Pick up where you left off and keep building your skills.</p>
      </div>

      {loading ? (
        <p>Loading enrolled courses...</p>
      ) : courses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h3>No courses yet</h3>
          <p>You haven't enrolled in any courses. Start exploring!</p>
          <Link to="/browse" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            <FiBookOpen /> Browse Courses
          </Link>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map((course) => {
            const progress = progressByCourse[course._id] || 0;
            const instructor =
              typeof course.instructor === 'object'
                ? course.instructor?.name
                : course.instructor;

            return (
              <Link
                key={course._id}
                to={`/player/${course._id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="course-card">
                  <img
                    src={course.thumbnail || `https://picsum.photos/seed/${course._id}/800/450`}
                    alt={`${course.title} thumbnail`}
                    className="course-thumb"
                  />
                  <div className="course-content">
                    <h3 className="course-title">{course.title}</h3>
                    <p className="course-instructor">{instructor || 'Instructor'}</p>

                    <div className="course-footer" style={{ marginTop: 'auto' }}>
                      <Progressbar value={progress} />
                      {progress === 100 ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            color: '#16A34A',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            marginTop: '0.5rem',
                          }}
                        >
                          ✓ Completed
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            color: 'var(--primary-blue)',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            marginTop: '0.5rem',
                          }}
                        >
                          <FiPlay size={14} /> Continue
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default MyLearning;
