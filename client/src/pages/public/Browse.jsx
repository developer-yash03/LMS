import React, { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import SkeletonCard from '../../components/common/SkeletonCard';
import CourseCard from '../../components/course/CourseCard';

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
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Explore Courses</h2>
        <p>Discover courses, certificates, and degrees to advance your career.</p>
      </div>

      <div className="filters-bar">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-main)',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            flex: 1,
            minWidth: '250px',
          }}
        >
          <FiSearch color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search for courses, skills, or videos"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              marginLeft: '0.5rem',
              width: '100%',
              fontSize: '0.95rem',
            }}
          />
        </div>

        <select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category === 'All' ? 'All Categories' : category}
            </option>
          ))}
        </select>

        <select className="filter-select" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
          <option value="All">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <select className="filter-select" value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
          <option value="All">Free & Paid</option>
          <option value="Free">Free</option>
          <option value="Paid">Paid</option>
        </select>

        <select className="filter-select" value={sortValue} onChange={(e) => setSortValue(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="title_asc">Title: A-Z</option>
          <option value="title_desc">Title: Z-A</option>
          <option value="rating_desc">Top Rated</option>
        </select>

        <button
          className="btn btn-outline"
          style={{ padding: '0.5rem 1rem' }}
          onClick={handleClear}
        >
          Clear
        </button>
      </div>

      {loading ? (
        <div className="course-grid">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h3>Unable to load courses</h3>
          <p>{error}</p>
        </div>
      ) : courses.length > 0 ? (
        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h3>No results found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}

      {!loading && !error && pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button className="btn btn-outline" onClick={goToPrevPage} disabled={pagination.page <= 1}>
            Previous
          </button>
          <span style={{ fontWeight: 600 }}>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button className="btn btn-outline" onClick={goToNextPage} disabled={pagination.page >= pagination.pages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Browse;