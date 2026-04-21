import React, { useState, useMemo } from 'react';
import { FiCheckCircle, FiPlayCircle, FiFileText, FiHelpCircle, FiUploadCloud, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import { useCourse } from '../../hooks/useCourse';
import { useCourseContext } from '../../context/CourseContext';
import { useToast } from '../../context/ToastContext';
import BackButton from '../../components/common/BackButton';
import Progressbar from '../../components/common/Progressbar';
import QuizWidget from '../../components/course/QuizWidget';
import AssignmentUpload from '../../components/course/AssignmentUpload';

// ─── Mock Quiz Question Bank ──────────────────────────────────
// Maps topic keys to question arrays
const QUIZ_BANK = {
  '1-5': [
    { question: 'What hook is used to manage state in a functional component?', options: ['useEffect', 'useState', 'useRef', 'useMemo'], answer: 1 },
    { question: 'Which of the following is NOT a valid React lifecycle concept?', options: ['Mounting', 'Updating', 'Compiling', 'Unmounting'], answer: 2 },
    { question: 'Props in React are:', options: ['Mutable by the child', 'Read-only', 'Only for class components', 'Stored in localStorage'], answer: 1 },
  ],
  '2-5': [
    { question: 'What is the primary goal of User Research?', options: ['Making things pretty', 'Understanding user needs', 'Writing code', 'Choosing colors'], answer: 1 },
    { question: 'A Persona in UX design represents:', options: ['A real user', 'A fictional archetype of a user group', 'The designer', 'A stakeholder'], answer: 1 },
    { question: 'Which method helps gather qualitative data?', options: ['A/B Testing', 'User Interviews', 'Analytics', 'Heatmaps'], answer: 1 },
  ],
  '3-5': [
    { question: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Question Language', 'Standard Query Logic', 'System Query Language'], answer: 0 },
    { question: 'Which SQL clause is used to filter results?', options: ['ORDER BY', 'GROUP BY', 'WHERE', 'HAVING'], answer: 2 },
    { question: 'A JOIN combines data from:', options: ['One table only', 'Multiple tables', 'A file system', 'An API'], answer: 1 },
  ],
};

// ─── Mock reading content ──────────────────────────────────────
const READING_CONTENT = {
  default: `This is the reading material for the selected topic. In a production application, this content would be fetched from your CMS or database and rendered as rich formatted text.\n\nKey takeaways:\n• Understand the foundational concepts before moving to advanced topics.\n• Practice with hands-on exercises after each reading.\n• Review the supplementary resources linked at the bottom of each lesson.`,
};

const Player = () => {
  const { id } = useParams();
  const { singleCourse, loading } = useCourse(id);
  const { markTopicComplete, isTopicComplete, getProgress, saveQuizScore, getQuizScore } = useCourseContext();
  const { showToast } = useToast();

  const [activeTopic, setActiveTopic] = useState({ modIndex: 0, topicIndex: 0 });
  const [collapsedModules, setCollapsedModules] = useState({});

  if (loading) return <p>Loading course content...</p>;
  if (!singleCourse) return <p>Course not found.</p>;

  const modules = singleCourse.modules || [];
  const currentModule = modules[activeTopic.modIndex];
  const currentTopic = currentModule?.topics?.[activeTopic.topicIndex];
  const progress = getProgress(singleCourse.id);

  // Count total topics for progress
  const totalTopics = modules.reduce((sum, mod) => sum + mod.topics.length, 0);
  const completedCount = modules.reduce((sum, mod) => {
    return sum + mod.topics.filter((t) => isTopicComplete(singleCourse.id, t.key)).length;
  }, 0);

  const toggleModule = (index) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleMarkComplete = () => {
    if (!currentTopic) return;
    markTopicComplete(singleCourse.id, currentTopic.key);
    showToast('Topic marked as complete!');
  };

  const handleQuizComplete = (score, total) => {
    if (!currentTopic) return;
    saveQuizScore(singleCourse.id, currentTopic.key, score, total);
    markTopicComplete(singleCourse.id, currentTopic.key);
    showToast(`Quiz completed! Score: ${score}/${total}`);
  };

  const handleAssignmentSubmit = () => {
    if (!currentTopic) return;
    markTopicComplete(singleCourse.id, currentTopic.key);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'video': return <FiPlayCircle />;
      case 'text': return <FiFileText />;
      case 'quiz': return <FiHelpCircle />;
      case 'assignment': return <FiUploadCloud />;
      default: return <FiPlayCircle />;
    }
  };

  // ─── Render Content Area ──────────────────────────────────────
  const renderContent = () => {
    if (!currentTopic) return <p>Select a topic to begin.</p>;

    const isComplete = isTopicComplete(singleCourse.id, currentTopic.key);

    switch (currentTopic.type) {
      case 'video':
        return (
          <>
            <div className="player-video-container">
              <FiPlayCircle style={{ opacity: 0.8 }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{currentTopic.title}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Duration: {currentTopic.duration}</p>
            <div style={{ padding: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <h3>About this video</h3>
              <p style={{ margin: 0, marginTop: '0.5rem' }}>
                This video covers the essential concepts of {currentTopic.title.toLowerCase()}. 
                Watch the full video and then mark it as complete to track your progress.
              </p>
            </div>
            {!isComplete && (
              <button
                className="btn btn-primary"
                style={{ marginTop: '1rem', padding: '0.75rem 1.5rem' }}
                onClick={handleMarkComplete}
              >
                <FiCheckCircle /> Mark as Complete
              </button>
            )}
          </>
        );

      case 'text':
        return (
          <>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{currentTopic.title}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Reading · {currentTopic.duration}</p>
            <div style={{ padding: '1.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', lineHeight: '1.8' }}>
              {READING_CONTENT.default.split('\n').map((line, i) => (
                <p key={i} style={{ margin: '0 0 0.75rem', color: 'var(--text-dark)' }}>{line}</p>
              ))}
            </div>
            {!isComplete && (
              <button
                className="btn btn-primary"
                style={{ marginTop: '1rem', padding: '0.75rem 1.5rem' }}
                onClick={handleMarkComplete}
              >
                <FiCheckCircle /> Mark as Complete
              </button>
            )}
          </>
        );

      case 'quiz': {
        const existingScore = getQuizScore(singleCourse.id, currentTopic.key);
        const questions = QUIZ_BANK[currentTopic.key] || [];

        return (
          <>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{currentTopic.title}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Quiz · {currentTopic.duration}</p>
            {existingScore ? (
              <div className="quiz-score-banner perfect" style={{ marginBottom: '1rem' }}>
                <FiCheckCircle size={24} />
                <div>
                  <strong>Previously scored: {existingScore.score} / {existingScore.total}</strong>
                  <span> — Quiz already completed</span>
                </div>
              </div>
            ) : (
              <QuizWidget
                questions={questions}
                onComplete={handleQuizComplete}
              />
            )}
          </>
        );
      }

      case 'assignment':
        return (
          <>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{currentTopic.title}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Assignment · {currentTopic.duration}</p>
            <AssignmentUpload
              title={currentTopic.title}
              onSubmit={handleAssignmentSubmit}
            />
          </>
        );

      default:
        return <p>Unknown content type.</p>;
    }
  };

  return (
    <section className="page-container">
      <BackButton to="/my-learning" label="Back to My Learning" />

      {/* Course-level progress bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{singleCourse.title}</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {completedCount}/{totalTopics} complete
          </span>
        </div>
        <Progressbar value={progress} />
      </div>

      <div className="player-layout">
        {/* ── Content Area ── */}
        <div>
          {renderContent()}
        </div>

        {/* ── Sidebar Syllabus ── */}
        <aside className="player-sidebar">
          <h3>Course Content</h3>
          {modules.map((mod, i) => {
            const isCollapsed = collapsedModules[i];
            const moduleCompleted = mod.topics.every((t) => isTopicComplete(singleCourse.id, t.key));
            const moduleProgress = mod.topics.filter((t) => isTopicComplete(singleCourse.id, t.key)).length;

            return (
              <div key={i} className="module-accordion">
                <button
                  type="button"
                  className="module-title"
                  onClick={() => toggleModule(i)}
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
                    color: moduleCompleted ? '#16A34A' : 'var(--text-dark)',
                    fontFamily: 'var(--font-family)',
                  }}
                >
                  {isCollapsed ? <FiChevronRight /> : <FiChevronDown />}
                  <span style={{ flex: 1 }}>{mod.title}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {moduleProgress}/{mod.topics.length}
                  </span>
                </button>

                {!isCollapsed && (
                  <ul className="topic-list">
                    {mod.topics.map((topic, j) => {
                      const isActive = activeTopic.modIndex === i && activeTopic.topicIndex === j;
                      const completed = isTopicComplete(singleCourse.id, topic.key);

                      return (
                        <li key={j}>
                          <button
                            type="button"
                            onClick={() => setActiveTopic({ modIndex: i, topicIndex: j })}
                            className={`topic-item ${isActive ? 'active' : ''}`}
                          >
                            <span style={{ color: completed ? '#16A34A' : isActive ? 'var(--primary-blue)' : 'var(--text-muted)' }}>
                              {completed ? <FiCheckCircle /> : getIcon(topic.type)}
                            </span>
                            <span style={{ flex: 1, textAlign: 'left' }}>{topic.title}</span>
                            <span className="topic-duration">{topic.duration}</span>
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