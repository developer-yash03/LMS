import React from 'react';
import { FiAward, FiBookOpen, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { useCourseContext } from '../../context/CourseContext';
import CourseCard from '../../components/course/CourseCard';

const Home = () => {
  const { courses } = useCourseContext();

  // Show the first 3 courses from the master catalog as featured
  const featuredCourses = courses.slice(0, 3);

  return (
    <div className="home-page">
      <header className="home-hero">
        <span className="icon-pill">
          <FiTrendingUp /> Learn. Build. Grow.
        </span>
        <h1 className="home-title">Master New Skills with Guided Courses</h1>
        <p className="home-subtitle">Simple lessons, real projects, and progress tracking.</p>
      </header>

      <section>
        <div className="section-head">
          <h2>
            <FiBookOpen /> Featured Courses
          </h2>
          <p>Hand-picked for fast, practical learning.</p>
        </div>
        <div className="course-grid">
          {featuredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      <section className="home-stats">
        <article className="stat-card">
          <strong>
            <FiUsers /> 1,200+ Students
          </strong>
          <span>Active learners on the platform.</span>
        </article>
        <article className="stat-card">
          <strong>
            <FiBookOpen /> {courses.length}+ Courses
          </strong>
          <span>From beginner to advanced levels.</span>
        </article>
        <article className="stat-card">
          <strong>
            <FiAward /> Project-focused
          </strong>
          <span>Learn by building real outcomes.</span>
        </article>
      </section>
    </div>
  );
};

export default Home;