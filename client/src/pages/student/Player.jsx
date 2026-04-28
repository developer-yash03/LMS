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
  FiHelpCircle,
  FiAward,
  FiExternalLink,
} from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import BackButton from '../../components/common/BackButton';
import Progressbar from '../../components/common/Progressbar';
import QuizWidget from '../../components/course/QuizWidget';
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
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    setShowQuiz(false);
  }, [activeTopic]);

  useEffect(() => {
    const fetchPlayerData = async () => {
      setLoading(true);
      try {
        const [contentResponse, progressResponse] = await Promise.all([
          apiRequest(`/courses/${id}/content`),
          apiRequest(`/courses/${id}/progress`),
        ]);

        const content = contentResponse?.data || {};
        console.log('Player Data Received:', content);
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
      const res = await apiRequest(`/courses/${id}/topic/${currentTopic._id}/complete`, 'POST');
      if (res.success) {
        setCompletedTopicIds((prev) => [...prev, String(currentTopic._id)]);
        setProgress(res.data?.progressPercentage || progress);
        showToast('Topic marked as complete!');
      }
    } catch (error) {
      showToast('Failed to mark topic as complete', 'error');
    }
  };

  if (loading) {
    return (
      <div className="player-loading">
        <FiLoader className="spin" size={32} />
        <p>Initializing course content...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="player-error">
        <p>Course not found or access denied.</p>
        <BackButton />
      </div>
    );
  }

  const videoUrl = currentTopic?.videoUrl;
  const isYoutube = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be');
  let embedUrl = '';
  if (isYoutube) {
    const videoId = videoUrl.includes('v=') ? videoUrl.split('v=')[1].split('&')[0] : videoUrl.split('/').pop().split('?')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  }

  return (
    <section className="player-container">
      <div className="player-header">
        <BackButton />
        <h2 className="player-title">Course Player</h2>
      </div>

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
        <div className="player-main">
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
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '4rem' }}>
                    <FiPlayCircle size={48} style={{ opacity: 0.3 }} />
                    <p>No video content for this topic</p>
                  </div>
                )}
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', marginTop: '1.5rem' }}>{currentTopic.title}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                <FiClock style={{ marginRight: '0.35rem' }} />
                Topic in module: {currentModule?.title}
              </p>

              {currentTopic.assignmentUrl && (
                <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiDownload /> Assignment Materials
                  </h3>
                  
                  {submissionStatus ? (
                    <div style={{ 
                      padding: '1.5rem', 
                      background: submissionStatus.status === 'graded' ? '#eff6ff' : '#dcfce7', 
                      borderRadius: '8px', 
                      color: submissionStatus.status === 'graded' ? '#1e40af' : '#166534', 
                      border: '1px solid currentColor',
                      opacity: 0.9 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '1.1rem' }}>
                            {submissionStatus.status === 'graded' ? <FiAward /> : <FiCheckCircle />}
                            {submissionStatus.status === 'graded' ? 'Assignment Graded' : 'Assignment Submitted'}
                          </p>
                          <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                            {submissionStatus.status === 'graded' 
                              ? `Reviewed on ${new Date(submissionStatus.gradedAt).toLocaleDateString()}` 
                              : `Submitted on ${new Date(submissionStatus.submittedAt).toLocaleDateString()}`}
                          </p>
                        </div>
                        {submissionStatus.status === 'graded' && (
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '600', opacity: 0.8 }}>Score</span>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{submissionStatus.grade} / 10</div>
                          </div>
                        )}
                      </div>
                      
                      {submissionStatus.feedback && (
                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.4)', borderRadius: '6px', fontSize: '0.9rem' }}>
                          <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Instructor Feedback:</strong>
                          {submissionStatus.feedback}
                        </div>
                      )}

                      <a 
                        href={submissionStatus.fileUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', color: 'inherit', textDecoration: 'underline', fontWeight: '500', fontSize: '0.9rem' }}
                      >
                        <FiExternalLink /> View My Submission
                      </a>
                    </div>
                  ) : (
                    <div>
                      <a href={currentTopic.assignmentUrl} target="_blank" rel="noreferrer" className="btn btn-soft" style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiDownload /> Download Assignment
                      </a>

                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiUploadCloud /> Submit Your Work
                      </h3>
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

              {currentTopic.quiz && (
                <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e' }}>
                    <FiHelpCircle /> Knowledge Check
                  </h3>
                  <p style={{ color: '#b45309', marginBottom: '1rem' }}>Test your understanding of this topic with a quick quiz.</p>
                  
                  {!showQuiz ? (
                    <button 
                      className="btn" 
                      style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }} 
                      onClick={() => setShowQuiz(true)}
                    >
                      Start Quiz
                    </button>
                  ) : (
                    <div className="quiz-container-player">
                      <QuizWidget 
                        questions={currentTopic.quiz.questions.map(q => ({ 
                          question: q.question, 
                          options: q.options, 
                          answer: q.correctAnswer 
                        }))}
                        onComplete={(score, total) => {
                          showToast(`Quiz completed! You scored ${score}/${total}`);
                          if (score === total && !isTopicComplete(currentTopic._id)) {
                            markCurrentTopicComplete();
                          }
                        }}
                      />
                      <button 
                        className="btn btn-soft" 
                        style={{ marginTop: '1.5rem', width: '100%' }} 
                        onClick={() => setShowQuiz(false)}
                      >
                        Minimize Quiz
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                className="btn btn-primary"
                style={{ marginTop: '2rem', padding: '0.75rem 1.5rem' }}
                onClick={markCurrentTopicComplete}
                disabled={isTopicComplete(currentTopic._id)}
              >
                <FiCheckCircle />
                {isTopicComplete(currentTopic._id) ? 'Completed' : 'Mark as Complete'}
              </button>
            </>
          ) : (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <FiGrid size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
              <p>Select a topic from the sidebar to begin learning.</p>
            </div>
          )}
        </div>

        <aside className="player-sidebar">
          <div className="sidebar-header-player">
            <h3>Course Content</h3>
          </div>
          <div className="module-list-player">
            {modules.map((mod, modIndex) => {
              const isCollapsed = collapsedModules[modIndex];
              const moduleTopics = mod.topics || [];
              const moduleCompleted = moduleTopics.filter((topic) => isTopicComplete(topic._id)).length;

              return (
                <div key={mod._id} className="module-item-player">
                  <button
                    className={`module-header-player ${isCollapsed ? 'collapsed' : ''}`}
                    onClick={() => toggleModule(modIndex)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isCollapsed ? <FiChevronRight /> : <FiChevronDown />}
                      <span className="module-title-player">{mod.title}</span>
                    </div>
                    <span className="module-badge-player">
                      {moduleCompleted}/{moduleTopics.length}
                    </span>
                  </button>

                  {!isCollapsed && (
                    <ul className="topic-list-player">
                      {moduleTopics.map((topic, topicIndex) => {
                        const isActive = activeTopic.modIndex === modIndex && activeTopic.topicIndex === topicIndex;
                        const isComplete = isTopicComplete(topic._id);

                        return (
                          <li key={topic._id}>
                            <button
                              className={`topic-item-player ${isActive ? 'active' : ''}`}
                              onClick={() => setActiveTopic({ modIndex, topicIndex })}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                {isComplete ? (
                                  <FiCheckCircle style={{ color: '#10B981' }} />
                                ) : (
                                  <FiPlayCircle style={{ opacity: 0.5 }} />
                                )}
                                <span className="topic-title-player">{topic.title}</span>
                              </div>
                              {topic.quiz && <FiHelpCircle size={12} style={{ color: '#f59e0b' }} title="Has Quiz" />}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </section>
  );
};

export default Player;
