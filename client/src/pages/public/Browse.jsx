import React, { useState } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { useCourse } from '../../hooks/useCourse';
import SkeletonCard from '../../components/common/SkeletonCard';
import CourseCard from '../../components/course/CourseCard';

const Browse = () => {
  const { courses, loading } = useCourse();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');



  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || course.category === categoryFilter;
    let matchesPrice = true;
    if (priceFilter === 'Free') matchesPrice = course.price === 0;
    if (priceFilter === 'Paid') matchesPrice = course.price > 0;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Explore Courses</h2>
        <p>Discover courses, certificates, and degrees to advance your career.</p>
      </div>

      <div className="filters-bar">
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-main)', padding: '0.5rem 1rem', borderRadius: '4px', flex: 1, minWidth: '250px' }}>
          <FiSearch color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search for courses, skills, or videos"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '0.5rem', width: '100%', fontSize: '0.95rem' }}
          />
        </div>

        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Topics</option>
          <option value="Development">Development</option>
          <option value="Design">Design</option>
          <option value="Database">Database</option>
        </select>

        <select
          className="filter-select"
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
        >
          <option value="All">Free & Paid</option>
          <option value="Free">Free</option>
          <option value="Paid">Paid</option>
        </select>
        
        <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} onClick={() => { setSearchTerm(''); setCategoryFilter('All'); setPriceFilter('All'); }}>
          Clear
        </button>
      </div>

      {loading ? (
        <div className="course-grid">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="course-grid">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h3>No results found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default Browse;