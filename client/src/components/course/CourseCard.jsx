import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';

const CourseCard = ({ course }) => {
  const isFree = course.price === 0;
  const topicCount = (course.modules || []).reduce(
    (sum, mod) => sum + (mod.topics?.length || 0),
    0
  );

  return (
    <Link to={`/course/${course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="course-card">
        <img
          src={course.thumbnail || 'https://picsum.photos/seed/' + course.id + '/800/450'}
          alt={`${course.title} thumbnail`}
          className="course-thumb"
        />
        <div className="course-content">
          <h3 className="course-title">{course.title}</h3>
          <p className="course-instructor">{course.instructor || 'Jane Doe, University of Tech'}</p>
          
          <div className="course-rating">
            <FiStar fill="#b4690e" />
            {course.rating || 4.8} <span>({Math.floor(Math.random() * 2000 + 500).toLocaleString()} reviews)</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            {course.category || 'Beginner'} • {topicCount > 0 ? `${topicCount} lessons` : '4 weeks'}
          </div>
          
          <div className="course-footer">
            <span className="course-price">
              {isFree ? (
                <span style={{ color: '#16A34A' }}>Free</span>
              ) : (
                `₹${course.price}`
              )}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;