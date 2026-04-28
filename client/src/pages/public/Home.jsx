import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUsers, FiStar } from 'react-icons/fi';
import { apiRequest } from '../../services/api';
import './Home.css';
import './Browse.css';

const Home = () => {
  const navigate = useNavigate();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await apiRequest('/courses/public', 'GET');
        setFeaturedCourses(data.slice(0, 6)); // Show top 6 featured courses
      } catch (err) {
        console.error("Failed to fetch featured courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-split">
        <div className="hero-container">
          <div className="hero-text-side">
            <span className="hero-label">ESTABLISHED 2026</span>
            <h1 className="hero-main-title">
              Elevate Your Mind in a Space Designed for <span className="highlight">Deep Learning.</span>
            </h1>
            <p className="hero-description">
              ScholarHub provides a refined environment for serious learners. Curated by experts, designed for focus, and built for lasting knowledge retention.
            </p>
            <div className="hero-btns">
              <Link to="/signup" className="btn-primary-brown">Get Started</Link>
              <Link to="/browse" className="btn-secondary">Explore Courses</Link>
            </div>
            <div className="hero-social-proof">
              <div className="student-avatars">
                <img src="https://i.pravatar.cc/40?img=1" alt="student" />
                <img src="https://i.pravatar.cc/40?img=2" alt="student" />
                <img src="https://i.pravatar.cc/40?img=3" alt="student" />
              </div>
              <p><strong>1.2k+ Students</strong> joined this week</p>
            </div>
          </div>
          <div className="hero-image-side">
            <div className="hero-main-image">
              <img src="https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&q=80&w=1000" alt="Academic environment" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="featured-disciplines">
        <div className="disciplines-header">
          <div>
            <h2>Featured Courses</h2>
            <p>Explore our most popular academic pathways</p>
          </div>
          <Link to="/browse" className="view-all-text">View All ↗</Link>
        </div>

        {loading ? (
          <div className="loading-state">Curating courses...</div>
        ) : (
          <div className="home-featured-grid">
            {featuredCourses.length > 0 ? (
              featuredCourses.map((course) => (
                <div key={course._id || course.id} className="browse-card" style={{ position: 'relative' }}>
                  <Link to={`/course/${course._id || course.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                    <div className="browse-card-image">
                      <img
                        src={course.thumbnail || `https://picsum.photos/seed/${course._id || course.id}/800/450`}
                        alt={course.title}
                      />
                    </div>
                    <div className="browse-card-body">
                      <span className="browse-card-tag">{course.category || 'Course'}</span>
                      <h3 className="browse-card-title">{course.title}</h3>
                      <p className="browse-card-instructor">
                        <FiUsers size={14} /> {course.instructor?.name || (typeof course.instructor === 'string' ? course.instructor : 'Instructor')}
                      </p>
                      {course.rating && (
                        <p className="browse-card-rating">
                          <FiStar fill="#b4690e" color="#b4690e" /> {course.rating} <span>({course.reviewCount || Math.floor(Math.random() * 2000 + 500).toLocaleString()} reviews)</span>
                        </p>
                      )}
                      <div className="browse-card-footer">
                        {course.price === 0 || course.price === '0' ? (
                          <span className="browse-card-price free">Free</span>
                        ) : (
                          <span className="browse-card-price">₹{course.price}</span>
                        )}
                        <span className="browse-card-level">{course.level || 'Beginner'}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <p className="empty-msg">No courses featured at the moment.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;