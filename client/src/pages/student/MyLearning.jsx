import React from 'react';
import { FiBookOpen, FiClock } from 'react-icons/fi';
import { useCourse } from '../../hooks/useCourse';
import CourseCard from '../../components/course/CourseCard';

const MyLearning = () => {
  const { courses, loading } = useCourse();
  // In a real app, you'd filter courses based on user.enrolledCourses
  const enrolled = courses.slice(0, 2);

  return (
    <section className="learning-page">
      <div className="page-heading">
        <h2 className="page-title">
          <FiBookOpen /> My Enrolled Courses
        </h2>
        <p className="page-subtitle">
          <FiClock /> {enrolled.length} courses in progress
        </p>
      </div>

      {loading ? (
        <p className="page-loading">Loading your library...</p>
      ) : (
        <div className="learning-grid">
          {enrolled.map((course) => (
            <article key={course.id} className="learning-card panel-surface">
              <CourseCard course={course} />
              <div className="progress-track learning-progress">
                <div className="progress-fill" style={{ width: '60%' }}></div>
              </div>
              <small className="learning-progress-text">60% Completed</small>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default MyLearning;