import React, { useEffect, useMemo, useState } from 'react';
import {
  FiCheckCircle,
  FiPlayCircle,
  FiClock,
  FiChevronDown,
  FiChevronRight,
  FiDownload,
  FiUploadCloud,
  FiLoader,
} from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import BackButton from '../../components/common/BackButton';
import Progressbar from '../../components/common/Progressbar';
import { apiRequest, uploadMedia } from '../../services/api';

const Player = () => {
  const { id } = useParams();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [completedTopicIds, setCompletedTopicIds] = useState([]);
  const [progress, setProgress] = useState(0);
  const [activeTopic, setActiveTopic] = useState({ modIndex: 0, topicIndex: 0 });
  const [collapsedModules, setCollapsedModules] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isUploadingAssignment, setIsUploadingAssignment] = useState(false);

  useEffect(() => {
    const fetchPlayerData = async () => {
      setLoading(true);
      try {
        const [contentResponse, progressResponse] = await Promise.all([
          apiRequest(`/courses/${id}/content`),
          apiRequest(`/courses/${id}/progress`),
        ]);

        const content = contentResponse?.data || {};
        setCourse(content.course || null);
        setModules(content.modules || []);

        const progressData = progressResponse?.data || content.progress || {};
        const completed = (progressData.completedTopics || []).map((topic) => {
          if (typeof topic === 'object') {
            return String(topic._id);
          }
          return String(topic);
        });

        setCompletedTopicIds(completed);
        setProgress(progressData.progressPercentage || 0);
      } catch (error) {
        showToast(error.message || 'Failed to load course player', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [id, showToast]);

  const currentModule = modules[activeTopic.modIndex] || null;
  const currentTopic = currentModule?.topics?.[activeTopic.topicIndex] || null;

  useEffect(() => {
    if (!currentTopic || !course) return;
    const fetchSubmission = async () => {
      try {
        const res = await apiRequest(`/courses/${course._id}/topic/${currentTopic._id}/submission`);
        setSubmissionStatus(res?.data || null);
      } catch (err) {
        setSubmissionStatus(null);
      }
    };
    fetchSubmission();
  }, [currentTopic, course]);

  const totalTopics = useMemo(() => {
    return modules.reduce((sum, mod) => sum + (mod.topics || []).length, 0);
  }, [modules]);

  const toggleModule = (index) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const isTopicComplete = (topicId) => completedTopicIds.includes(String(topicId));

  const markCurrentTopicComplete = async () => {
    if (!currentTopic?._id) return;

    if (isTopicComplete(currentTopic._id)) {
      showToast('Topic already completed', 'info');
      return;
    }

    try {
      const response = await apiRequest(
        `/courses/${id}/topic/${currentTopic._id}/complete`,
        'POST',
        {}
      );

      const updatedCompleted = (response?.progress?.completedTopics || []).map((topic) =>
        typeof topic === 'object' ? String(topic._id) : String(topic)
      );

      setCompletedTopicIds(updatedCompleted);
      setProgress(response?.progress?.progressPercentage || 0);
      showToast('Topic marked as completed');
    } catch (error) {
      showToast(error.message || 'Could not update progress', 'error');
    }
  };

  if (loading) return <p>Loading course content...</p>;

  if (!course) {
    return (
      <section className="page-container">
        <h3>Course content unavailable</h3>
        <p>You might not be enrolled in this course yet.</p>
      </section>
    );

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const ytMatch = url.match(ytRegex);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    return url;
  };

  const videoUrl = currentTopic?.videoUrl;
  const embedUrl = getEmbedUrl(videoUrl);
  const isYoutube = embedUrl?.includes('youtube.com/embed');

  return (
    <section className="page-container">
      <BackButton to="/my-learning" label="Back to My Learning" />

      <div style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{course?.title}</h3>
          <span
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              fontWeight: '600',
            }}
          >
            {completedTopicIds.length}/{totalTopics} complete
          </span>
        </div>
        <Progressbar value={progress} />
      </div>

      <div className="player-layout">
        <div>
          {currentTopic ? (
            <>
              <div className="player-video-container">
                {videoUrl ? (
                  isYoutube ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={embedUrl}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      style={{ borderRadius: '12px' }}
                    ></iframe>
                  ) : (
                    <video 
                      src={videoUrl} 
                      controls 
                      width="100%" 
                      height="100%" 
                      style={{ borderRadius: '12px', background: '#000' }}
                    />
                  )
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <FiPlayCircle size={48} style={{ opacity: 0.3 }} />
                    <p>No video content</p>
                  </div>
                )}
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{currentTopic.title}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <FiClock style={{ marginRight: '0.35rem' }} />
                Topic in module: {currentModule?.title}
              </p>

              {currentTopic.videoUrl && (
                <p style={{ marginBottom: '1rem' }}>
                  <a href={currentTopic.videoUrl} target="_blank" rel="noreferrer">
                    Open Video URL
                  </a>
                </p>
              )}

              {currentTopic.assignmentUrl && (
                <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiDownload /> Assignment Materials
                  </h3>
                  <a href={currentTopic.assignmentUrl} target="_blank" rel="noreferrer" className="btn btn-soft" style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiDownload /> Download Assignment
                  </a>

                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiUploadCloud /> Submit Your Work
                  </h3>
                  
                  {submissionStatus ? (
                    <div style={{ padding: '1rem', background: '#dcfce7', borderRadius: '6px', color: '#166534' }}>
                      <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                        <FiCheckCircle /> Assignment submitted on {new Date(submissionStatus.submittedAt).toLocaleDateString()}
                      </p>
                      <a href={submissionStatus.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '0.5rem', color: '#15803d', textDecoration: 'underline' }}>
                        View your submission
                      </a>
                    </div>
                  ) : (
                    <div>
                      <input 
                        type="file" 
                        id="assignment-upload"
                        style={{ display: 'none' }}
                        disabled={isUploadingAssignment}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setIsUploadingAssignment(true);
                          try {
                            const res = await uploadMedia(file);
                            const submitRes = await apiRequest(`/courses/${course._id}/topic/${currentTopic._id}/submit`, 'POST', { fileUrl: res.url });
                            setSubmissionStatus(submitRes.data);
                            showToast('Assignment submitted successfully!');
                            if (!isTopicComplete(currentTopic._id)) {
                              markCurrentTopicComplete();
                            }
                          } catch (err) {
                            showToast('Failed to upload assignment', 'error');
                          } finally {
                            setIsUploadingAssignment(false);
                          }
                        }}
                      />
                      <label htmlFor="assignment-upload" className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isUploadingAssignment ? <FiLoader className="spin" /> : <FiUploadCloud />} 
                        {isUploadingAssignment ? 'Uploading to cloud...' : 'Upload Submission'}
                      </label>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>Accepts PDF, DOCX, ZIP files</p>
                    </div>
                  )}
                </div>
              )}

              <button
                className="btn btn-primary"
                style={{ marginTop: '1rem', padding: '0.75rem 1.5rem' }}
                onClick={markCurrentTopicComplete}
                disabled={isTopicComplete(currentTopic._id)}
              >
                <FiCheckCircle />
                {isTopicComplete(currentTopic._id) ? 'Completed' : 'Mark as Complete'}
              </button>
            </>
          ) : (
            <p>Select a topic from the sidebar.</p>
          )}
        </div>

        <aside className="player-sidebar">
          <h3>Course Content</h3>
          {modules.map((mod, modIndex) => {
            const isCollapsed = collapsedModules[modIndex];
            const moduleTopics = mod.topics || [];
            const moduleCompleted = moduleTopics.filter((topic) => isTopicComplete(topic._id)).length;

            return (
              <div key={mod._id || modIndex} className="module-accordion">
                <button
                  type="button"
                  className="module-title"
                  onClick={() => toggleModule(modIndex)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 600,
                    fontSize: '1rem',
                    padding: '0.25rem 0',
                    color:
                      moduleTopics.length > 0 && moduleCompleted === moduleTopics.length
                        ? '#16A34A'
                        : 'var(--text-dark)',
                    fontFamily: 'var(--font-family)',
                  }}
                >
                  {isCollapsed ? <FiChevronRight /> : <FiChevronDown />}
                  <span style={{ flex: 1 }}>{mod.title}</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      fontWeight: 500,
                    }}
                  >
                    {moduleCompleted}/{moduleTopics.length}
                  </span>
                </button>

                {!isCollapsed && (
                  <ul className="topic-list">
                    {moduleTopics.map((topic, topicIndex) => {
                      const isActive =
                        activeTopic.modIndex === modIndex && activeTopic.topicIndex === topicIndex;
                      const completed = isTopicComplete(topic._id);

                      return (
                        <li key={topic._id || `${modIndex}-${topicIndex}`}>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveTopic({ modIndex: modIndex, topicIndex: topicIndex })
                            }
                            className={`topic-item ${isActive ? 'active' : ''}`}
                          >
                            <span
                              style={{
                                color: completed
                                  ? '#16A34A'
                                  : isActive
                                    ? 'var(--primary-blue)'
                                    : 'var(--text-muted)',
                              }}
                            >
                              {completed ? <FiCheckCircle /> : <FiPlayCircle />}
                            </span>
                            <span style={{ flex: 1, textAlign: 'left' }}>{topic.title}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </aside>
      </div>
    </section>
  );
};

export default Player;
