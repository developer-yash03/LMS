import React, { useEffect, useMemo, useState } from 'react';
import {
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiGrid,
  FiLayers,
  FiLink,
  FiLoader,
  FiPlusCircle,
  FiRefreshCw,
  FiSave,
  FiTag,
  FiTrash2,
  FiUpload,
  FiXCircle,
  FiVideo,
} from 'react-icons/fi';
import { apiRequest, uploadMedia } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './InstructorTheme.css';

const defaultCourseForm = {
  title: '',
  description: '',
  price: 0,
  category: 'Web Development',
  level: 'Beginner',
  duration: '',
  thumbnail: '',
};

const defaultModuleForm = {
  title: '',
  description: '',
  order: '',
};

const createTopicDraft = () => ({
  title: '',
  description: '',
  videoUrl: '',
  videoType: 'youtube',
  assignmentUrl: '',
  notes: '',
  durationMinutes: '',
  order: '',
});

const courseToForm = (course) => ({
  title: course.title || '',
  description: course.description || '',
  price: course.price ?? 0,
  category: course.category || 'Web Development',
  level: course.level || 'Beginner',
  duration: course.duration ?? '',
  thumbnail: course.thumbnail || '',
});

const normalizeCourses = (items = []) =>
  items.map((course) => ({
    ...course,
    modules: course.modules || [],
  }));

const sumTopics = (modules = []) =>
  modules.reduce((total, module) => total + (module.topics || []).length, 0);

const statusMeta = {
  pending: { label: 'Pending approval', className: 'warning' },
  approved: { label: 'Approved', className: 'success' },
  rejected: { label: 'Rejected', className: 'neutral' },
};

const resolveStatus = (course) => course?.approvalStatus || 'approved';

const Create = () => {
  const { showToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState(defaultCourseForm);
  const [moduleForm, setModuleForm] = useState(defaultModuleForm);
  const [topicDrafts, setTopicDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingCourse, setSavingCourse] = useState(false);
  const [savingModule, setSavingModule] = useState(false);
  const [savingTopics, setSavingTopics] = useState({});
  const [configCategories, setConfigCategories] = useState(['Web Development', 'Mobile Development', 'Data Science', 'Cloud Computing', 'DevOps', 'Other']);
  const [configLevels, setConfigLevels] = useState(['Beginner', 'Intermediate', 'Advanced']);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingTopicId, setUploadingTopicId] = useState(null);
  const [error, setError] = useState('');

  const selectedCourse = useMemo(
    () => courses.find((course) => String(course._id) === String(selectedCourseId)) || null,
    [courses, selectedCourseId]
  );

  const courseStats = useMemo(() => {
    const totalModules = courses.reduce((count, course) => count + (course.modules || []).length, 0);
    const totalTopics = courses.reduce((count, course) => count + sumTopics(course.modules || []), 0);
    const pendingCount = courses.filter((course) => course.approvalStatus === 'pending').length;
    const approvedCount = courses.filter((course) => !course.approvalStatus || course.approvalStatus === 'approved').length;

    return {
      courses: courses.length,
      modules: totalModules,
      topics: totalTopics,
      selectedModules: selectedCourse ? selectedCourse.modules.length : 0,
      pendingCount,
      approvedCount,
    };
  }, [courses, selectedCourse]);

  const loadCourses = async (preferredCourseId = null) => {
    setLoading(true);
    setError('');

    try {
      const response = await apiRequest('/courses/instructor/courses');
      const normalized = normalizeCourses(response.data || []);
      setCourses(normalized);

      const selectionExists =
        preferredCourseId && normalized.some((course) => String(course._id) === String(preferredCourseId));
      const activeId =
        selectionExists
          ? preferredCourseId
          : normalized.some((course) => String(course._id) === String(selectedCourseId))
            ? selectedCourseId
            : normalized[0]?._id || null;

      setSelectedCourseId(activeId);

      if (activeId) {
        const activeCourse = normalized.find((course) => String(course._id) === String(activeId));
        if (activeCourse) {
          setCourseForm(courseToForm(activeCourse));
        }
      } else {
        setCourseForm(defaultCourseForm);
      }
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const catRes = await apiRequest('/config/categories', 'GET');
      if (catRes && catRes.data) setConfigCategories(catRes.data.map(c => c.name));
      const lvlRes = await apiRequest('/config/levels', 'GET');
      if (lvlRes && lvlRes.data) setConfigLevels(lvlRes.data.map(l => l.name));
    } catch (err) {
      console.error('Failed to load config options', err);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    loadCourses();
    loadConfig();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const handleCourseField = (field, value) => {
    setCourseForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleModuleField = (field, value) => {
    setModuleForm((previous) => ({ ...previous, [field]: value }));
  };

  const updateTopicDraft = (moduleId, field, value) => {
    setTopicDrafts((previous) => ({
      ...previous,
      [moduleId]: {
        ...(previous[moduleId] || createTopicDraft()),
        [field]: value,
      },
    }));
  };

  const resetTopicDraft = (moduleId) => {
    setTopicDrafts((previous) => ({
      ...previous,
      [moduleId]: createTopicDraft(),
    }));
  };

  const handleCourseSubmit = async (event) => {
    event.preventDefault();
    setSavingCourse(true);

    try {
      const payload = {
        ...courseForm,
        price: Number(courseForm.price || 0),
        duration: courseForm.duration === '' ? '' : Number(courseForm.duration),
      };

      const response = selectedCourse
        ? await apiRequest(`/courses/instructor/courses/${selectedCourse._id}`, 'PUT', payload)
        : await apiRequest('/courses/instructor/courses', 'POST', payload);

      const savedCourse = response.data;
      showToast(response.message || (selectedCourse ? 'Course updated' : 'Course created'));
      await loadCourses(savedCourse?._id || null);
    } catch (courseError) {
      showToast(courseError.message || 'Unable to save course', 'error');
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = async (course) => {
    const confirmed = window.confirm(`Delete ${course.title}? This will remove its modules and topics.`);
    if (!confirmed) return;

    try {
      await apiRequest(`/courses/instructor/courses/${course._id}`, 'DELETE');
      showToast('Course deleted successfully');
      const nextSelection = selectedCourseId === course._id ? null : selectedCourseId;
      await loadCourses(nextSelection);
      if (!nextSelection) {
        setCourseForm(defaultCourseForm);
      }
    } catch (courseError) {
      showToast(courseError.message || 'Unable to delete course', 'error');
    }
  };

  const handleNewCourse = () => {
    setSelectedCourseId(null);
    setCourseForm(defaultCourseForm);
    setModuleForm(defaultModuleForm);
    setTopicDrafts({});
  };

  const handleSelectCourse = (course) => {
    setSelectedCourseId(course._id);
    setCourseForm(courseToForm(course));
    setModuleForm(defaultModuleForm);
    setTopicDrafts({});
  };

  const handleModuleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedCourse) {
      showToast('Select a course before adding a module', 'error');
      return;
    }

    setSavingModule(true);
    try {
      const response = await apiRequest(
        `/courses/instructor/courses/${selectedCourse._id}/modules`,
        'POST',
        {
          ...moduleForm,
          order: moduleForm.order === '' ? '' : Number(moduleForm.order),
        }
      );

      showToast(response.message || 'Module added');
      setModuleForm(defaultModuleForm);
      await loadCourses(selectedCourse._id);
    } catch (moduleError) {
      showToast(moduleError.message || 'Unable to add module', 'error');
    } finally {
      setSavingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    const confirmed = window.confirm('Delete this module and all of its topics?');
    if (!confirmed) return;

    try {
      await apiRequest(`/courses/instructor/modules/${moduleId}`, 'DELETE');
      showToast('Module deleted successfully');
      await loadCourses(selectedCourse?._id || null);
    } catch (moduleError) {
      showToast(moduleError.message || 'Unable to delete module', 'error');
    }
  };

  const handleTopicSubmit = async (moduleId) => {
    const draft = topicDrafts[moduleId] || createTopicDraft();
    if (!draft.title.trim()) {
      showToast('Topic title is required', 'error');
      return;
    }

    setSavingTopics((previous) => ({ ...previous, [moduleId]: true }));
    try {
      const response = await apiRequest(`/courses/instructor/modules/${moduleId}/topics`, 'POST', {
        ...draft,
        durationMinutes: draft.durationMinutes === '' ? '' : Number(draft.durationMinutes),
        order: draft.order === '' ? '' : Number(draft.order),
      });

      showToast(response.message || 'Topic added');
      resetTopicDraft(moduleId);
      await loadCourses(selectedCourse?._id || null);
    } catch (topicError) {
      showToast(topicError.message || 'Unable to add topic', 'error');
    } finally {
      setSavingTopics((previous) => ({ ...previous, [moduleId]: false }));
    }
  };

  const handleDeleteTopic = async (topicId) => {
    const confirmed = window.confirm('Delete this topic?');
    if (!confirmed) return;

    try {
      await apiRequest(`/courses/instructor/topics/${topicId}`, 'DELETE');
      showToast('Topic deleted successfully');
      await loadCourses(selectedCourse?._id || null);
    } catch (topicError) {
      showToast(topicError.message || 'Unable to delete topic', 'error');
    }
  };

  const selectedStatus = statusMeta[resolveStatus(selectedCourse)] || statusMeta.approved;

  return (
    <section className="page-container studio-page instructor-theme-page">
      <div className="page-header studio-hero">
        <div>
          <span className="studio-kicker">ScholarHub instructor studio</span>
          <h2 className="page-title">Create New Course</h2>
          <p className="studio-subtitle">
            Design your course structure and submit it for admin approval before it goes live.
          </p>
        </div>
        <div className="studio-toolbar">
          <button type="button" className="btn btn-soft" onClick={() => loadCourses(selectedCourse?._id || null)}>
            <FiRefreshCw /> Refresh
          </button>
          <button type="button" className="btn btn-primary" onClick={handleNewCourse}>
            <FiPlusCircle /> New Course
          </button>
        </div>
      </div>

      <div className="stats-grid studio-stats">
        <article className="stat-card">
          <div className="stat-icon">
            <FiBookOpen />
          </div>
          <div className="stat-info">
            <h3>{courseStats.courses}</h3>
            <p>Courses managed</p>
          </div>
        </article>
        <article className="stat-card">
          <div className="stat-icon">
            <FiClock />
          </div>
          <div className="stat-info">
            <h3>{courseStats.pendingCount}</h3>
            <p>Pending approval</p>
          </div>
        </article>
        <article className="stat-card">
          <div className="stat-icon">
            <FiCheckCircle />
          </div>
          <div className="stat-info">
            <h3>{courseStats.approvedCount}</h3>
            <p>Approved courses</p>
          </div>
        </article>
      </div>

      {error ? (
        <div className="studio-empty studio-error">
          <FiLoader />
          <h3>Unable to load courses</h3>
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => loadCourses()}>
            Try again
          </button>
        </div>
      ) : (
        <div className="studio-layout">
          <aside className="studio-sidebar panel-surface">
            <div className="studio-sidebar-head">
              <div>
                <h3>Your courses</h3>
                <p>{loading ? 'Refreshing course list...' : `${courses.length} total course${courses.length === 1 ? '' : 's'}`}</p>
              </div>
            </div>

            <div className="studio-course-list">
              {loading ? (
                <div className="studio-empty compact">
                  <FiLoader className="spin" />
                  <p>Loading courses...</p>
                </div>
              ) : courses.length > 0 ? (
                courses.map((course) => {
                  const moduleCount = (course.modules || []).length;
                  const topicCount = sumTopics(course.modules || []);
                  const isActive = String(course._id) === String(selectedCourseId);

                  return (
                    <div
                      key={course._id}
                      className={`studio-course-card ${isActive ? 'active' : ''}`}
                      onClick={() => handleSelectCourse(course)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleSelectCourse(course);
                        }
                      }}
                    >
                      <div className="studio-course-card-main">
                        <div>
                          <strong>{course.title}</strong>
                          <span>{course.category}</span>
                        </div>
                        <span className="studio-price-chip">
                          {Number(course.price || 0) === 0 ? 'Free' : `₹${course.price}`}
                        </span>
                      </div>
                      <div>
                        <span className={`status-chip ${statusMeta[resolveStatus(course)]?.className || 'success'}`}>
                          {statusMeta[resolveStatus(course)]?.label || 'Approved'}
                        </span>
                      </div>
                      <div className="studio-course-meta">
                        <span>{moduleCount} modules</span>
                        <span>{topicCount} topics</span>
                      </div>
                      <div className="studio-course-actions">
                        <span className="studio-linkish">Open editor</span>
                        <button
                          type="button"
                          className="icon-btn danger"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteCourse(course);
                          }}
                          aria-label={`Delete ${course.title}`}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="studio-empty compact">
                  <FiGrid />
                  <h4>No courses yet</h4>
                  <p>Create your first course to start adding modules and topics.</p>
                </div>
              )}
            </div>
          </aside>

          <main className="studio-workspace">
            <section className="studio-panel panel-surface">
              <div className="studio-panel-head">
                <div>
                  <span className="studio-section-label">Course details</span>
                  <h3>{selectedCourse ? `Edit ${selectedCourse.title}` : 'Create a new course'}</h3>
                </div>
                <span className={`status-chip ${selectedStatus.className}`}>
                  {selectedCourse ? selectedStatus.label : 'Draft mode'}
                </span>
              </div>

              <form className="studio-form-grid" onSubmit={handleCourseSubmit}>
                <label className="studio-field">
                  <span>
                    <FiBookOpen /> Title
                  </span>
                  <input
                    type="text"
                    value={courseForm.title}
                    onChange={(event) => handleCourseField('title', event.target.value)}
                    placeholder="Course title"
                    required
                  />
                </label>

                <label className="studio-field">
                  <span>
                    <FiTag /> Category
                  </span>
                  <select
                    value={courseForm.category}
                    onChange={(event) => handleCourseField('category', event.target.value)}
                  >
                    {configCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="studio-field studio-span-2">
                  <span>
                    <FiEdit3 /> Description
                  </span>
                  <textarea
                    rows="4"
                    value={courseForm.description}
                    onChange={(event) => handleCourseField('description', event.target.value)}
                    placeholder="Describe what learners will gain"
                  />
                </label>

                <label className="studio-field">
                  <span>
                    <FiTag /> Price
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={courseForm.price}
                    onChange={(event) => handleCourseField('price', event.target.value)}
                    placeholder="0 for free"
                  />
                </label>

                <label className="studio-field">
                  <span>
                    <FiClock /> Duration (hours)
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={courseForm.duration}
                    onChange={(event) => handleCourseField('duration', event.target.value)}
                    placeholder="Estimated course length"
                  />
                </label>

                <label className="studio-field">
                  <span>
                    <FiLayers /> Level
                  </span>
                  <select
                    value={courseForm.level}
                    onChange={(event) => handleCourseField('level', event.target.value)}
                  >
                    {configLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="studio-field studio-span-2">
                  <span>
                    <FiUpload /> Course Thumbnail
                  </span>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setIsUploading(true);
                        try {
                          const res = await uploadMedia(file);
                          handleCourseField('thumbnail', res.url);
                          showToast('Thumbnail uploaded successfully');
                        } catch (err) {
                          showToast('Failed to upload thumbnail', 'error');
                        } finally {
                          setIsUploading(false);
                        }
                      }}
                      style={{ flex: 1 }}
                      disabled={isUploading}
                    />
                    {isUploading && <FiLoader className="spin" />}
                    {courseForm.thumbnail && (
                      <img src={courseForm.thumbnail} alt="Thumbnail preview" style={{ height: '40px', borderRadius: '4px', objectFit: 'cover', width: '70px' }} />
                    )}
                  </div>
                  <input
                    type="text"
                    value={courseForm.thumbnail}
                    onChange={(event) => handleCourseField('thumbnail', event.target.value)}
                    placeholder="Or paste an image URL directly"
                    style={{ marginTop: '0.5rem' }}
                  />
                </label>

                <div className="studio-inline-actions studio-span-2">
                  <button type="submit" className="btn btn-primary" disabled={savingCourse}>
                    {savingCourse ? <FiLoader className="spin" /> : <FiSave />}
                    {selectedCourse
                      ? resolveStatus(selectedCourse) === 'approved'
                        ? 'Save & Resubmit'
                        : 'Update Submission'
                      : 'Submit For Approval'}
                  </button>
                  {selectedCourse && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDeleteCourse(selectedCourse)}
                    >
                      <FiTrash2 /> Delete Course
                    </button>
                  )}
                  {resolveStatus(selectedCourse) === 'rejected' && (
                    <span className="studio-hint" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FiXCircle />
                      {selectedCourse.approvalNote || 'Course was rejected. Update details and resubmit.'}
                    </span>
                  )}
                </div>
              </form>
            </section>

            <section className="studio-panel panel-surface">
              <div className="studio-panel-head">
                <div>
                  <span className="studio-section-label">Module builder</span>
                  <h3>Add modules to the selected course</h3>
                </div>
                <span className="studio-badge">{courseStats.selectedModules} modules in course</span>
              </div>

              <form className="studio-mini-form" onSubmit={handleModuleSubmit}>
                <label className="studio-field">
                  <span>
                    <FiLayers /> Module title
                  </span>
                  <input
                    type="text"
                    value={moduleForm.title}
                    onChange={(event) => handleModuleField('title', event.target.value)}
                    placeholder="Introduction to React"
                    required
                  />
                </label>

                <label className="studio-field">
                  <span>
                    <FiClock /> Order
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={moduleForm.order}
                    onChange={(event) => handleModuleField('order', event.target.value)}
                    placeholder="Optional order"
                  />
                </label>

                <label className="studio-field studio-span-2">
                  <span>
                    <FiEdit3 /> Module description
                  </span>
                  <textarea
                    rows="3"
                    value={moduleForm.description}
                    onChange={(event) => handleModuleField('description', event.target.value)}
                    placeholder="Describe what this module teaches"
                  />
                </label>

                <div className="studio-inline-actions studio-span-2">
                  <button type="submit" className="btn btn-soft" disabled={savingModule || !selectedCourse}>
                    {savingModule ? <FiLoader className="spin" /> : <FiPlusCircle />}
                    Add Module
                  </button>
                  {!selectedCourse && <span className="studio-hint">Select a course first to add modules.</span>}
                </div>
              </form>
            </section>

            <section className="studio-panel panel-surface">
              <div className="studio-panel-head">
                <div>
                  <span className="studio-section-label">Module content</span>
                  <h3>Manage module topics and lesson videos</h3>
                </div>
                <span className="studio-badge">{selectedCourse ? `${selectedCourse.modules.length} modules` : 'No course selected'}</span>
              </div>

              {!selectedCourse ? (
                <div className="studio-empty">
                  <FiBookOpen />
                  <h4>Select a course to manage its modules and topics</h4>
                  <p>Once a course is selected, you can add modules, attach YouTube links or hosted videos, and remove items as needed.</p>
                </div>
              ) : selectedCourse.modules.length > 0 ? (
                <div className="studio-module-list">
                  {selectedCourse.modules.map((module) => {
                    const draft = topicDrafts[module._id] || createTopicDraft();

                    return (
                      <article key={module._id} className="studio-module-card">
                        <div className="studio-module-head">
                          <div>
                            <h4>{module.title}</h4>
                            <p>{module.description || 'No module description provided.'}</p>
                          </div>
                          <button
                            type="button"
                            className="icon-btn danger"
                            onClick={() => handleDeleteModule(module._id)}
                            aria-label={`Delete ${module.title}`}
                          >
                            <FiTrash2 />
                          </button>
                        </div>

                        <div className="studio-topic-list">
                          {(module.topics || []).length > 0 ? (
                            module.topics.map((topic) => (
                              <div key={topic._id} className="studio-topic-card">
                                <div>
                                  <strong>{topic.title}</strong>
                                  <p>{topic.description || 'Topic details will appear here.'}</p>
                                  <div className="studio-topic-meta-row">
                                    <span>
                                      <FiVideo /> {topic.videoType || 'youtube'}
                                    </span>
                                    {topic.durationMinutes ? (
                                      <span>
                                        <FiClock /> {topic.durationMinutes} mins
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="icon-btn danger"
                                  onClick={() => handleDeleteTopic(topic._id)}
                                  aria-label={`Delete ${topic.title}`}
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="studio-muted">No topics yet. Add the first lesson below.</p>
                          )}
                        </div>

                        <form
                          className="studio-topic-form"
                          onSubmit={(event) => {
                            event.preventDefault();
                            handleTopicSubmit(module._id);
                          }}
                        >
                          <div className="studio-mini-form topic-grid">
                            <label className="studio-field">
                              <span>
                                <FiVideo /> Topic title
                              </span>
                              <input
                                type="text"
                                value={draft.title}
                                onChange={(event) => updateTopicDraft(module._id, 'title', event.target.value)}
                                placeholder="Lesson title"
                                required
                              />
                            </label>

                            <div className="studio-field studio-span-2">
                              <span style={{ marginBottom: '0.5rem', display: 'block' }}>
                                <FiVideo /> Select Video Source
                              </span>
                              <div className="video-source-options" style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                  type="button"
                                  className={`source-chip ${draft.videoType === 'youtube' ? 'active' : ''}`}
                                  onClick={() => updateTopicDraft(module._id, 'videoType', 'youtube')}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    border: '1px solid var(--border-color)',
                                    background: draft.videoType === 'youtube' ? 'var(--primary-blue)' : 'transparent',
                                    color: draft.videoType === 'youtube' ? '#fff' : 'inherit',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  YouTube Link
                                </button>
                                <button
                                  type="button"
                                  className={`source-chip ${draft.videoType === 'upload' ? 'active' : ''}`}
                                  onClick={() => updateTopicDraft(module._id, 'videoType', 'upload')}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    border: '1px solid var(--border-color)',
                                    background: draft.videoType === 'upload' ? 'var(--primary-blue)' : 'transparent',
                                    color: draft.videoType === 'upload' ? '#fff' : 'inherit',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  Upload Video File
                                </button>
                                <button
                                  type="button"
                                  className={`source-chip ${draft.videoType === 'link' ? 'active' : ''}`}
                                  onClick={() => updateTopicDraft(module._id, 'videoType', 'link')}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    border: '1px solid var(--border-color)',
                                    background: draft.videoType === 'link' ? 'var(--primary-blue)' : 'transparent',
                                    color: draft.videoType === 'link' ? '#fff' : 'inherit',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  External Link
                                </button>
                              </div>
                            </div>

                            <label className="studio-field studio-span-2">
                              <span>
                                {draft.videoType === 'upload' ? <FiUpload /> : <FiLink />} 
                                {draft.videoType === 'upload' ? ' Video Content (File)' : ' Video Content (URL)'}
                              </span>
                              {draft.videoType === 'upload' ? (
                                <div className="video-upload-box" style={{ 
                                  padding: '1.5rem', 
                                  border: '2px dashed var(--border-color)', 
                                  borderRadius: '8px',
                                  textAlign: 'center',
                                  background: '#f8fafc'
                                }}>
                                  <input
                                    type="file"
                                    accept="video/*"
                                    id={`video-upload-${module._id}`}
                                    style={{ display: 'none' }}
                                    disabled={uploadingTopicId === module._id}
                                    onChange={async (e) => {
                                      const file = e.target.files[0];
                                      if (!file) return;
                                      setUploadingTopicId(module._id);
                                      try {
                                        const res = await uploadMedia(file);
                                        updateTopicDraft(module._id, 'videoUrl', res.url);
                                        showToast('Video uploaded successfully');
                                      } catch (err) {
                                        showToast('Failed to upload video', 'error');
                                      } finally {
                                        setUploadingTopicId(null);
                                      }
                                    }}
                                  />
                                  <label 
                                    htmlFor={`video-upload-${module._id}`}
                                    style={{ 
                                      cursor: 'pointer',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      gap: '0.5rem'
                                    }}
                                  >
                                    {uploadingTopicId === module._id ? (
                                      <><FiLoader className="spin" size={24} /> <span>Uploading video...</span></>
                                    ) : draft.videoUrl ? (
                                      <><FiCheckCircle size={24} color="#16A34A" /> <span style={{ color: '#16A34A' }}>Video Ready</span></>
                                    ) : (
                                      <><FiUpload size={24} /> <span>Click to browse video files</span></>
                                    )}
                                  </label>
                                  {draft.videoUrl && (
                                    <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#64748b', wordBreak: 'break-all' }}>
                                      {draft.videoUrl}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  value={draft.videoUrl}
                                  onChange={(event) => updateTopicDraft(module._id, 'videoUrl', event.target.value)}
                                  placeholder={draft.videoType === 'youtube' ? "Paste YouTube link here..." : "Paste external video URL here..."}
                                />
                              )}
                            </label>

                            <label className="studio-field studio-span-2">
                              <span>
                                <FiLink /> Assignment / Resource File (Optional)
                              </span>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx,.zip,.txt"
                                  disabled={uploadingTopicId === module._id + "_assignment"}
                                  onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    setUploadingTopicId(module._id + "_assignment");
                                    try {
                                      const res = await uploadMedia(file);
                                      updateTopicDraft(module._id, 'assignmentUrl', res.url);
                                      showToast('Assignment uploaded successfully');
                                    } catch (err) {
                                      showToast('Failed to upload assignment', 'error');
                                    } finally {
                                      setUploadingTopicId(null);
                                    }
                                  }}
                                />
                                {uploadingTopicId === module._id + "_assignment" && (
                                  <span style={{ fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FiLoader className="spin" /> Uploading file...
                                  </span>
                                )}
                                {draft.assignmentUrl && uploadingTopicId !== module._id + "_assignment" && (
                                  <p style={{ fontSize: '0.8rem', color: '#16A34A', margin: 0 }}>✓ Assignment attached</p>
                                )}
                              </div>
                            </label>

                            <label className="studio-field">
                              <span>
                                <FiClock /> Duration (minutes)
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={draft.durationMinutes}
                                onChange={(event) => updateTopicDraft(module._id, 'durationMinutes', event.target.value)}
                                placeholder="Optional"
                              />
                            </label>

                            <label className="studio-field">
                              <span>
                                <FiLayers /> Order
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={draft.order}
                                onChange={(event) => updateTopicDraft(module._id, 'order', event.target.value)}
                                placeholder="Optional order"
                              />
                            </label>

                            <label className="studio-field studio-span-2">
                              <span>
                                <FiEdit3 /> Topic description
                              </span>
                              <textarea
                                rows="3"
                                value={draft.description}
                                onChange={(event) => updateTopicDraft(module._id, 'description', event.target.value)}
                                placeholder="Describe the lesson content"
                              />
                            </label>

                            <label className="studio-field studio-span-2">
                              <span>
                                <FiBookOpen /> Notes
                              </span>
                              <textarea
                                rows="3"
                                value={draft.notes}
                                onChange={(event) => updateTopicDraft(module._id, 'notes', event.target.value)}
                                placeholder="Add instructions, reading material, or talking points"
                              />
                            </label>
                          </div>

                          <div className="studio-inline-actions">
                            <button type="submit" className="btn btn-soft" disabled={savingTopics[module._id]}>
                              {savingTopics[module._id] ? <FiLoader className="spin" /> : <FiPlusCircle />}
                              Add Topic
                            </button>
                            <button type="button" className="btn btn-outline" onClick={() => resetTopicDraft(module._id)}>
                              Clear Draft
                            </button>
                          </div>
                        </form>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="studio-empty">
                  <FiLayers />
                  <h4>This course has no modules yet</h4>
                  <p>Add your first module above, then attach topics and lesson videos to build the syllabus.</p>
                </div>
              )}
            </section>
          </main>
        </div>
      )}
    </section>
  );
};

export default Create;
