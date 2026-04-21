import React from 'react';
import { FiBookOpen, FiCheckCircle, FiShield, FiShoppingCart, FiUser } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '../../hooks/useCourse';

const Details = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { singleCourse, loading } = useCourse(id);

  if (loading) return <p className="page-loading">Loading details...</p>;

  if (!singleCourse) {
    return (
      <div className="empty-state">
        <h3>Course not found</h3>
        <p>The selected course is unavailable right now.</p>
      </div>
    );
  }

  return (
    <section className="details-layout">
      <article className="details-main panel-surface">
        <span className="icon-pill">
          <FiBookOpen /> Course Overview
        </span>
        <h1>{singleCourse.title}</h1>
        <p className="details-author">
          <FiUser /> Taught by {singleCourse.instructor}
        </p>
        <p className="details-description">
          A practical full-stack learning path designed for university-level outcomes and real project confidence.
        </p>
        <h3>What you'll learn</h3>
        <ul className="details-list">
          <li>
            <FiCheckCircle /> React Hooks and Context API patterns
          </li>
          <li>
            <FiCheckCircle /> Node.js architecture and API workflows
          </li>
          <li>
            <FiCheckCircle /> MongoDB data modeling for production apps
          </li>
        </ul>
      </article>

      <aside className="details-purchase panel-surface">
        <img
          src="https://via.placeholder.com/600x360?text=Course+Preview"
          alt="Course preview"
          className="details-preview"
        />
        <p className="details-price">
          {singleCourse.price === 0 ? 'FREE' : `₹${singleCourse.price}`}
        </p>
        <button className="btn btn-primary details-buy-btn" onClick={() => navigate('/my-learning')}>
          <FiShoppingCart /> Enroll Now
        </button>
        <p className="details-note">
          <FiShield /> 30-day learning satisfaction guarantee.
        </p>
      </aside>
    </section>
  );
};

export default Details;