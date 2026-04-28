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
  FiGrid
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
        setCourse(content.course || null);
        setModules(Array.isArray(content.modules) ? content.modules : []);

        const progressData = progressResponse?.data || content.progress || {};
        const completed = (progressData.completedTopics || []).map((topic) => {
          if (typeof topic === 'object' && topic !== null) {
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

    if (id) fetchPlayerData();
  }, [id, showToast]);

  const currentModule = modules[activeTopic.modIndex] || null;
  const currentTopic = currentModule?.topics?.[activeTopic.topicIndex] || null;

  useEffect(() => {
    if (!currentTopic?._id || !course?._id) return;
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
    if (!Array.isArray(modules)) return 0;
    return modules.reduce((sum, mod) => sum + (Array.isArray(mod.topics) ? mod.topics.length : 0), 0);
  }, [modules]);

  const toggleModule = (index) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const isTopicComplete = (topicId) => completedTopicIds.includes(String(topicId));

  const markCurrentTopicComplete = async () => {
    if (!currentTopic?._id || !id) return;

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
      <div className="player-loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '1rem' }}>
        <FiLoader className="spin" size={32} />
        <p>Initializing course content...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="player-error" style={{ textAlign: 'center', padding: '4rem' }}>
        <FiGrid size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
        <p>Course not found or access denied.</p>
        <BackButton />
      </div>
    );
  }

  const videoUrl = currentTopic?.videoUrl;
  const isYoutube = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be');
  let embedUrl = '';
  if (isYoutube && videoUrl) {
    try {
      const videoId = videoUrl.includes('v=') ? videoUrl.split('v=')[1].split('&')[0] : videoUrl.split('/').pop().split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } catch (e) {
      console.error('Invalid YouTube URL');
    }
  }

  return (
    <section className="player-container" style={{ padding: '2rem' }}>
      <div className="player-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <BackButton />
        <h2 className="player-title" style={{ margin: 0 }}>Course Player</h2>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>{course?.title}</h3>
          <span
            style={{
              fontSize: '0.9rem',
              color: '#64748b',
              fontWeight: '600',
            }}
          >
            {completedTopicIds.length}/{totalTopics} lessons complete
          </span>
        </div>
        <Progressbar value={progress} />
      </div>

      <div className="player-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        <div className="player-main">
          {currentTopic ? (
            <>
              <div className="player-video-container" style={{ background: '#000', borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                    ></iframe>
                  ) : (
                    <video 
                      src={videoUrl} 
                      controls 
                      width="100%" 
                      height="100%" 
                    />
                  )
                ) : (
                  <div style={{ textAlign: 'center', color: '#fff' }}>
                    <FiPlayCircle size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>No video content for this lesson</p>
                  </div>
                )}
              </div>
              
              <div style={{ marginTop: '1.5rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', color: '#1e293b' }}>{currentTopic.title}</h2>
                <p style={{ color: '#64748b', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiClock />
                  Module: {currentModule?.title}
                </p>

                {currentTopic.assignmentUrl && (
                  <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                      <FiDownload /> Assignment & Resources
                    </h3>
                    
                    {submissionStatus ? (
                      <div style={{ 
                        padding: '1.5rem', 
                        background: submissionStatus.status === 'graded' ? '#eff6ff' : '#ecfdf5', 
                        borderRadius: '8px', 
                        color: submissionStatus.status === 'graded' ? '#1e40af' : '#065f46', 
                        border: '1px solid currentColor',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '1.1rem' }}>
                              {submissionStatus.status === 'graded' ? <FiAward /> : <FiCheckCircle />}
                              {submissionStatus.status === 'graded' ? 'Assignment Graded' : 'Assignment Submitted'}
                            </p>
                            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', opacity: 0.8 }}>
                              {submissionStatus.status === 'graded' 
                                ? `Reviewed on ${new Date(submissionStatus.gradedAt).toLocaleDateString()}` 
                                : `Submitted on ${new Date(submissionStatus.submittedAt).toLocaleDateString()}`}
                            </p>
                          </div>
                          {submissionStatus.status === 'graded' && (
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '800', opacity: 0.7 }}>Score</span>
                              <div style={{ fontSize: '1.75rem', fontWeight: '900' }}>{submissionStatus.grade} / 10</div>
                            </div>
                          )}
                        </div>
                        
                        {submissionStatus.feedback && (
                          <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '6px', fontSize: '0.95rem', borderLeft: '4px solid currentColor' }}>
                            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Instructor Feedback:</strong>
                            {submissionStatus.feedback}
                          </div>
                        )}

                        <a 
                          href={submissionStatus.fileUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1.25rem', color: 'inherit', textDecoration: 'underline', fontWeight: '600' }}
                        >
                          <FiExternalLink /> View My Submission
                        </a>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <a href={currentTopic.assignmentUrl} target="_blank" rel="noreferrer" className="btn btn-soft" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content' }}>
                          <FiDownload /> Download Assignment File
                        </a>

                        <div style={{ marginTop: '1rem' }}>
                          <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', fontWeight: '600' }}>Submit Your Solution</h4>
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
                                showToast('Assignment submitted successfully!', 'success');
                              } catch (err) {
                                showToast('Failed to upload assignment', 'error');
                              } finally {
                                setIsUploadingAssignment(false);
                              }
                            }}
                          />
                          <label htmlFor="assignment-upload" className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            {isUploadingAssignment ? <FiLoader className="spin" /> : <FiUploadCloud />} 
                            {isUploadingAssignment ? 'Uploading to cloud...' : 'Upload Work'}
                          </label>
                          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>Accepted: PDF, DOCX, ZIP, JPG, PNG</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentTopic.quiz && (
                  <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e', fontWeight: '700' }}>
                      <FiHelpCircle /> Topic Quiz
                    </h3>
                    <p style={{ color: '#b45309', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Validate your knowledge with this quick check.</p>
                    
                    {!showQuiz ? (
                      <button 
                        className="btn" 
                        style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }} 
                        onClick={() => setShowQuiz(true)}
                      >
                        Launch Quiz
                      </button>
                    ) : (
                      <div className="quiz-wrapper-inline">
                        <QuizWidget 
                          questions={Array.isArray(currentTopic.quiz.questions) ? currentTopic.quiz.questions.map(q => ({ 
                            question: q.question, 
                            options: q.options, 
                            answer: q.correctAnswer 
                          })) : []}
                          onComplete={(score, total) => {
                            showToast(`Quiz completed! Score: ${score}/${total}`, 'success');
                            if (score === total && !isTopicComplete(currentTopic._id)) {
                              markCurrentTopicComplete();
                            }
                          }}
                        />
                        <button 
                          className="btn btn-soft" 
                          style={{ marginTop: '1.5rem', width: '100%', borderStyle: 'dashed' }} 
                          onClick={() => setShowQuiz(false)}
                        >
                          Close Quiz
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <button
                  className="btn btn-primary"
                  style={{ marginTop: '1rem', padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: '600' }}
                  onClick={markCurrentTopicComplete}
                  disabled={isTopicComplete(currentTopic._id)}
                >
                  <FiCheckCircle />
                  {isTopicComplete(currentTopic._id) ? 'Lesson Completed' : 'Mark as Complete'}
                </button>
              </div>
            </>
          ) : (
            <div style={{ padding: '6rem 2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
              <FiPlayCircle size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
              <h3 style={{ color: '#64748b' }}>Ready to start learning?</h3>
              <p style={{ color: '#94a3b8' }}>Select a topic from the sidebar to begin your journey.</p>
            </div>
          )}
        </div>

        <aside className="player-sidebar" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', height: 'fit-content', position: 'sticky', top: '2rem' }}>
          <div className="sidebar-header-player" style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Course Syllabus</h3>
          </div>
          <div className="module-list-player" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {Array.isArray(modules) && modules.map((mod, modIndex) => {
              const isCollapsed = collapsedModules[modIndex];
              const moduleTopics = Array.isArray(mod.topics) ? mod.topics : [];
              const moduleCompleted = moduleTopics.filter((topic) => isTopicComplete(topic._id)).length;

              return (
                <div key={mod._id || modIndex} className="module-item-player">
                  <button
                    className={`module-header-player ${isCollapsed ? 'collapsed' : ''}`}
                    onClick={() => toggleModule(modIndex)}
                    style={{ width: '100%', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                      {isCollapsed ? <FiChevronRight style={{ color: '#94a3b8' }} /> : <FiChevronDown style={{ color: 'var(--primary-blue)' }} />}
                      <span className="module-title-player" style={{ fontWeight: '600', fontSize: '0.95rem' }}>{mod.title}</span>
                    </div>
                    <span className="module-badge-player" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#f1f5f9', borderRadius: '10px', color: '#64748b' }}>
                      {moduleCompleted}/{moduleTopics.length}
                    </span>
                  </button>

                  {!isCollapsed && (
                    <ul className="topic-list-player" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {moduleTopics.map((topic, topicIndex) => {
                        const isActive = activeTopic.modIndex === modIndex && activeTopic.topicIndex === topicIndex;
                        const isComplete = isTopicComplete(topic._id);

                        return (
                          <li key={topic._id || topicIndex}>
                            <button
                              className={`topic-item-player ${isActive ? 'active' : ''}`}
                              onClick={() => setActiveTopic({ modIndex, topicIndex })}
                              style={{ 
                                width: '100%', 
                                padding: '0.85rem 1.25rem 0.85rem 2.5rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                border: 'none', 
                                background: isActive ? '#f0f7ff' : 'none', 
                                borderLeft: isActive ? '4px solid var(--primary-blue)' : '4px solid transparent',
                                color: isActive ? 'var(--primary-blue)' : '#475569',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, textAlign: 'left' }}>
                                {isComplete ? (
                                  <FiCheckCircle style={{ color: '#10B981' }} />
                                ) : (
                                  <FiPlayCircle style={{ opacity: 0.4 }} />
                                )}
                                <span className="topic-title-player" style={{ fontSize: '0.9rem', fontWeight: isActive ? '600' : '400' }}>{topic.title}</span>
                              </div>
                              {topic.quiz && <FiHelpCircle size={14} style={{ color: '#f59e0b' }} title="Contains Quiz" />}
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
