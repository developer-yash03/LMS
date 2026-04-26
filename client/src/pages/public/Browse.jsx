import React, { useState, useEffect } from 'react';
import { FiSearch, FiGrid, FiBook, FiClock, FiStar, FiUsers } from 'react-icons/fi';
import { useSearchParams, Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import './Browse.css';

const Browse = () => {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [sortValue, setSortValue] = useState('newest');
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const categoryOptions = [
    'All',
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Cloud Computing',
    'DevOps',
    'Other',
  ];

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, categoryFilter, priceFilter, levelFilter, sortValue]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError('');

      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sort: sortValue,
      });

      if (searchTerm.trim()) {
        query.set('search', searchTerm.trim());
      }
      if (categoryFilter !== 'All') {
        query.set('category', categoryFilter);
      }
      if (levelFilter !== 'All') {
        query.set('level', levelFilter);
      }
      if (priceFilter === 'Free') {
        query.set('priceRange', '0-0');
      } else if (priceFilter === 'Paid') {
        query.set('priceRange', '1-100000');
      }

      try {
        const response = await apiRequest(`/courses/browse?${query.toString()}`);
        const normalized = (response.data || []).map((course) => ({
          ...course,
          id: course._id,
          instructor: typeof course.instructor === 'object' ? course.instructor?.name : course.instructor,
        }));
        setCourses(normalized);
        setPagination(response.pagination || { page: 1, pages: 1, total: 0 });
      } catch (err) {
        setError(err.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [searchTerm, categoryFilter, priceFilter, levelFilter, sortValue, page, limit]);

  const handleClear = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setPriceFilter('All');
    setLevelFilter('All');
    setSortValue('newest');
    setPage(1);
  };

  const goToPrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPage((prev) => Math.min(prev + 1, pagination.pages || 1));
  };

  return (
    <div className="student-page">
      {/* Header Banner */}
      <div className="student-header-banner">
        <div className="student-header-content">
          <span className="student-header-label">EXPLORE COURSES</span>
          <h1>Discover Courses</h1>
          <p>Find courses, certificates, and degrees to advance your career.</p>
        </div>
        <div className="student-header-visual">
          <FiBook size={64} />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="browse-filters">
        <div className="browse-search">
          <FiSearch size={18} />
          <input
            type="text"
            placeholder="Search courses, skills, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select className="browse-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category === 'All' ? 'All Categories' : category}
            </option>
          ))}
        </select>

        <select className="browse-select" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
          <option value="All">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <select className="browse-select" value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
          <option value="All">Free & Paid</option>
          <option value="Free">Free</option>
          <option value="Paid">Paid</option>
        </select>

        <select className="browse-select" value={sortValue} onChange={(e) => setSortValue(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="title_asc">Title: A-Z</option>
          <option value="title_desc">Title: Z-A</option>
          <option value="rating_desc">Top Rated</option>
        </select>

        <button className="btn-clear" onClick={handleClear}>
          Clear
        </button>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="browse-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="browse-skeleton">
              <div className="browse-skeleton-img"></div>
              <div className="browse-skeleton-content">
                <div className="browse-skeleton-tag"></div>
                <div className="browse-skeleton-title"></div>
                <div className="browse-skeleton-text"></div>
                <div className="browse-skeleton-text short"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="browse-error">
          <h3>Unable to load courses</h3>
          <p>{error}</p>
        </div>
      ) : courses.length > 0 ? (
        <div className="browse-grid">
          {courses.map((course) => (
            <Link key={course.id} to={`/course/${course.id}`} className="browse-card">
              <div className="browse-card-image">
                <img
                  src={course.thumbnail || `https://picsum.photos/seed/${course.id}/800/450`}
                  alt={course.title}
                />
              </div>
              <div className="browse-card-body">
                <span className="browse-card-tag">{course.category || 'Course'}</span>
                <h3 className="browse-card-title">{course.title}</h3>
                <p className="browse-card-instructor">
                  <FiUsers size={14} /> {course.instructor || 'Instructor'}
                </p>
                {course.rating && (
                  <p className="browse-card-rating">
                    <FiStar fill="#b4690e" color="#b4690e" /> {course.rating} <span>({course.reviewCount || 0} reviews)</span>
                  </p>
                )}
                <div className="browse-card-footer">
                  {course.price === 0 || course.price === '0' ? (
                    <span className="browse-card-price free">Free</span>
                  ) : (
                    <span className="browse-card-price">${course.price}</span>
                  )}
                  <span className="browse-card-level">{course.level || 'Beginner'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="browse-empty">
          <FiGrid size={48} />
          <h3>No results found</h3>
          <p>Try adjusting your search or filters.</p>
          <button className="btn-primary-brown" onClick={handleClear}>
            Clear Filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && pagination.pages > 1 && (
        <div className="browse-pagination">
          <button onClick={goToPrevPage} disabled={pagination.page <= 1}>
            Previous
          </button>
          <span>Page {pagination.page} of {pagination.pages}</span>
          <button onClick={goToNextPage} disabled={pagination.page >= pagination.pages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Browse;