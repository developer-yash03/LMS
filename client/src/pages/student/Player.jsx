import React, { useEffect, useMemo, useState } from 'react';
import {
  FiCheckCircle,
  FiPlayCircle,
  FiClock,
  FiChevronDown,
  FiChevronRight,
} from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import BackButton from '../../components/common/BackButton';
import Progressbar from '../../components/common/Progressbar';
import { apiRequest } from '../../services/api';

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
  }

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
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{course.title}</h3>
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
                <FiPlayCircle style={{ opacity: 0.8 }} />
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
