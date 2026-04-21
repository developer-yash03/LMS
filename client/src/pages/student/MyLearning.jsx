import React from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiPlay } from 'react-icons/fi';
import { useCourseContext } from '../../context/CourseContext';
import Progressbar from '../../components/common/Progressbar';
import SkeletonCard from '../../components/common/SkeletonCard';

const MyLearning = () => {
  const { courses, enrolledCourseIds, getProgress } = useCourseContext();

  // Get only the courses the user has actually enrolled in
  const enrolledCourses = courses.filter((c) =>
    enrolledCourseIds.includes(c.id)
  );

  return (
    <section className="page-container">
      <div className="page-header">
        <h2 className="page-title"><FiBookOpen /> My Learning</h2>
        <p>Pick up where you left off and keep building your skills.</p>
      </div>

      {enrolledCourses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h3>No courses yet</h3>
          <p>You haven't enrolled in any courses. Start exploring!</p>
          <Link to="/browse" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            <FiBookOpen /> Browse Courses
          </Link>
        </div>
      ) : (
        <div className="course-grid">
          {enrolledCourses.map((course) => {
            const progress = getProgress(course.id);
            return (
              <Link
                key={course.id}
                to={`/player/${course.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="course-card">
                  <img
                    src={course.thumbnail || 'https://picsum.photos/seed/' + course.id + '/800/450'}
                    alt={`${course.title} thumbnail`}
                    className="course-thumb"
                  />
                  <div className="course-content">
                    <h3 className="course-title">{course.title}</h3>
                    <p className="course-instructor">{course.instructor}</p>

                    <div className="course-footer" style={{ marginTop: 'auto' }}>
                      <Progressbar value={progress} />
                      {progress === 100 ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          color: '#16A34A',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          marginTop: '0.5rem',
                        }}>
                          ✓ Completed
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          color: 'var(--primary-blue)',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          marginTop: '0.5rem',
                        }}>
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