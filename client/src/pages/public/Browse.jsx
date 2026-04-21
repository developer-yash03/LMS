import React, { useState } from 'react';
import { FiBookOpen, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { useCourse } from '../../hooks/useCourse';
import Loader from '../../components/common/Loader';
import CourseCard from '../../components/course/CourseCard';

const Browse = () => {
  const { courses, loading } = useCourse();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');

  if (loading) return <Loader />;

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || course.category === categoryFilter;

    let matchesPrice = true;
    if (priceFilter === 'Free') matchesPrice = course.price === 0;
    if (priceFilter === 'Paid') matchesPrice = course.price > 0;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setPriceFilter('All');
  };

  return (
    <div className="browse-page">
      <div className="browse-header">
        <h2>
          <FiBookOpen /> Browse Courses
        </h2>
        <p>Find the right course with quick filters.</p>
      </div>

      <div className="filters-card">
        <div className="input-with-icon">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by course name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="control"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Development">Development</option>
          <option value="Design">Design</option>
          <option value="Database">Database</option>
        </select>

        <select
          className="control"
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
        >
          <option value="All">All Prices</option>
          <option value="Free">Free Only</option>
          <option value="Paid">Paid Only</option>
        </select>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="course-grid">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No courses found</h3>
          <p>Try adjusting your search filters.</p>
          <button onClick={clearFilters} className="btn btn-primary" style={{ marginTop: '0.9rem' }}>
            <FiRefreshCw /> Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Browse;