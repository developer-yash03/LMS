import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiTrash2, FiPlay, FiBookOpen } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../services/api';
import './MyLearning.css';

const Wishlist = () => {
  const { showToast } = useToast();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await apiRequest('/courses/student/wishlist');
      if (res.success) {
        setWishlist(res.data);
      }
    } catch (error) {
      showToast(error.message || 'Failed to load wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (e, courseId) => {
    e.preventDefault(); // prevent navigation since it's wrapped in a Link
    try {
      const res = await apiRequest(`/courses/${courseId}/wishlist`, 'POST');
      if (res.success) {
        showToast(res.message, 'success');
        setWishlist(wishlist.filter(c => c._id !== courseId));
      }
    } catch (error) {
      showToast(error.message || 'Failed to remove from wishlist', 'error');
    }
  };

  return (
    <div className="student-page">
      <div className="student-header-banner">
        <div className="student-header-content">
          <span className="student-header-label">STUDENT PORTAL</span>
          <h1>My Wishlist</h1>
          <p>Courses you've saved for later.</p>
        </div>
        <div className="student-header-visual">
          <FiHeart size={64} />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading wishlist...</div>
      ) : wishlist.length === 0 ? (
        <div className="student-empty-card">
          <div className="student-empty-icon">
            <FiHeart size={48} />
          </div>
          <h3>Your wishlist is empty</h3>
          <p>Explore courses and save them to your wishlist to view them later.</p>
          <Link to="/browse" className="btn-primary-brown">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="courses-grid-auth">
          {wishlist.map((course) => {
            const instructor = typeof course.instructor === 'object' ? course.instructor?.name : course.instructor;

            return (
              <Link key={course._id} to={`/course/${course._id}`} className="course-card-auth">
                <div className="course-card-image-auth">
                  <img
                    src={course.thumbnail || `https://picsum.photos/seed/${course._id}/800/450`}
                    alt={`${course.title} thumbnail`}
                  />
                  <div 
                    className="course-card-completed-badge" 
                    style={{ background: '#ef4444', color: 'white', cursor: 'pointer' }}
                    onClick={(e) => handleRemove(e, course._id)}
                  >
                    <FiTrash2 size={14} /> Remove
                  </div>
                </div>
                
                <div className="course-card-body-auth">
                  <span className="course-card-tag">{course.category || 'Course'}</span>
                  <h3 className="course-card-title-auth">{course.title}</h3>
                  <p className="course-card-instructor-auth">
                    {instructor || 'Instructor'}
                  </p>
                  
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                      {course.price === 0 ? 'Free' : `₹${course.price}`}
                    </span>
                    <button className="course-card-action-auth" style={{ marginTop: 0, padding: '0.4rem 0.8rem' }}>
                      Details <FiPlay size={14} />
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
