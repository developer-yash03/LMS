import React, { useState } from 'react';
import { FiBookOpen, FiDollarSign, FiEdit3, FiLayers, FiPlusCircle } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';

const Create = () => {
  const { showToast } = useToast();
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Web Development',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Saving Course:', courseData);
    showToast('Course Created Successfully!');
  };

  return (
    <section className="form-shell">
      <div className="form-card panel-surface">
        <h2 className="page-title">
          <FiPlusCircle /> Create New Course
        </h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <label className="field">
            <FiBookOpen />
            <input
              type="text"
              placeholder="Course Title"
              required
              onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
            />
          </label>

          <label className="field">
            <FiEdit3 />
            <textarea
              className="form-textarea"
              placeholder="Description"
              rows="4"
              onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
            />
          </label>

          <label className="field">
            <FiDollarSign />
            <input
              type="number"
              placeholder="Price (₹)"
              onChange={(e) => setCourseData({ ...courseData, price: e.target.value })}
            />
          </label>

          <label className="field field-select">
            <FiLayers />
            <select onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}>
              <option>Web Development</option>
              <option>Data Science</option>
              <option>Design</option>
            </select>
          </label>

          <button type="submit" className="btn btn-primary form-submit">
            <FiPlusCircle /> Publish Course
          </button>
        </form>
      </div>
    </section>
  );
};

export default Create;