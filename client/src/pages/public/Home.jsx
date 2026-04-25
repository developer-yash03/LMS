import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await apiRequest('/courses/public', 'GET');
        setFeaturedCourses(data.slice(0, 3)); // Showing top 3 for the bento-style layout
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
            <span className="hero-label">ESTABLISHED 2024</span>
            <h1 className="hero-main-title">
              Elevate Your Mind in a Space Designed for <span className="highlight">Deep Learning.</span>
            </h1>
            <p className="hero-description">
              ScholarHub provides a refined environment for serious learners. Curated by experts, designed for focus, and built for lasting knowledge retention.
            </p>
            <div className="hero-btns">
              <Link to="/signup" className="btn-primary-brown">Get Started</Link>
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
          <div className="disciplines-grid">
            {featuredCourses.length > 0 ? (
              <>
                {/* Main Large Card */}
                <Link to={`/course/${featuredCourses[0]._id}`} className="discipline-card-large">
                  <img src={featuredCourses[0].thumbnail || 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&q=80&w=800'} alt={featuredCourses[0].title} />
                  <div className="card-overlay">
                    <span className="card-tag">CERTIFICATE PROGRAM</span>
                    <h3>{featuredCourses[0].title}</h3>
                    <p>{featuredCourses[0].instructor?.name || 'Academic Expert'}</p>
                    <div className="card-meta">
                      <span>🕒 12 Weeks</span>
                      <span>★ 4.9 (1.2k reviews)</span>
                    </div>
                  </div>
                </Link>

                {/* Right Side Column */}
                <div className="disciplines-column">
                  {featuredCourses.slice(1, 3).map((course, idx) => (
                    <Link to={`/course/${course._id}`} key={course._id} className={`discipline-card-small ${idx === 0 ? 'dark' : 'light'}`}>
                      <div className="card-info">
                        <span className="card-tag">{course.category || 'ACADEMIC'}</span>
                        <h3>{course.title}</h3>
                        <p>{course.instructor?.name || 'Academic Expert'}</p>
                        <span className="learn-more">Learn More ➔</span>
                      </div>
                      {idx === 0 && (
                        <div className="card-visual">
                          <img src={course.thumbnail || 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=300'} alt="Course icon" />
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </>
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