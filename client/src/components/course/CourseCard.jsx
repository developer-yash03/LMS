import React from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiUser } from 'react-icons/fi';

const CourseCard = ({ course }) => {
  const isFree = course.price === 0;

  return (
    <div className="course-card">
      <img
        src={course.thumbnail || 'https://via.placeholder.com/600x340?text=Course+Preview'}
        alt={`${course.title} thumbnail`}
        className="course-thumb"
      />
      <h3 className="course-title">{course.title}</h3>
      <p className="course-meta">
        <FiUser /> {course.instructor}
      </p>
      <div className="course-row">
        <span className={`price-tag ${isFree ? 'free' : ''}`}>
          {isFree ? 'FREE' : `₹${course.price}`}
        </span>
        <Link to={`/course/${course.id}`} className="card-link">
          <span className="btn btn-primary">
            <FiEye /> Details
          </span>
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;