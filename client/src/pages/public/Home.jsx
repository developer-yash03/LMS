import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

const subjects = [
  { name: 'Web Development', icon: '💻' },
  { name: 'Data Structures', icon: '🧠' },
  { name: 'Graphic Design', icon: '🎨' },
  { name: 'Mathematics', icon: '📐' },
  { name: 'Python Programming', icon: '🐍' },
  { name: 'Digital Marketing', icon: '📈' },
  { name: 'UI/UX Design', icon: '🖌️' },
  { name: 'Spoken English', icon: '🗣️' },
];

const Home = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchValue.trim();
    if (!query) {
      navigate('/browse');
      return;
    }
    navigate(`/browse?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-badge">Welcome to ScholarHub</p>
          <h1 className="hero-title">Elevate Your Academic Journey.</h1>
          <p className="hero-subtitle">
            Join a community of dedicated learners and world-class instructors in a space designed for focus and growth.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn-hero-primary">
              Start Learning
            </Link>
            <Link to="/signup" className="btn-hero-secondary">
              Become an Instructor
            </Link>
          </div>

          <form className="hero-search-bar" onSubmit={handleSearchSubmit}>
            <span className="search-icon">🔎</span>
            <input
              type="text"
              className="search-input"
              placeholder="What do you want to learn today?"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="content-section">
        <h2 className="section-title">Explore Popular Subjects</h2>
        <div className="category-grid">
          {subjects.map((subject) => (
            <article key={subject.name} className="category-card">
              <div className="category-icon">{subject.icon}</div>
              <h3 className="category-title">{subject.name}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>50+</h3>
            <p>Local Instructors</p>
          </div>
          <div className="stat-card">
            <h3>1000+</h3>
            <p>Active Students</p>
          </div>
          <div className="stat-card">
            <h3>100+</h3>
            <p>Daily Classes</p>
          </div>
          <div className="stat-card">
            <h3>25+</h3>
            <p>Career Tracks</p>
          </div>
        </div>
      </section>

      <section className="bottom-cta-section">
        <div className="bottom-cta-content">
          <h2 className="bottom-cta-title">Ready to start your journey?</h2>
          <p className="bottom-cta-subtitle">
            Join ScholarHub today and learn from trusted local educators with practical, guided lessons.
          </p>
          <Link to="/signup" className="btn-hero-primary">
            Join for Free
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;