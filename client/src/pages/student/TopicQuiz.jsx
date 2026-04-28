import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import QuizWidget from '../../components/course/QuizWidget';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const TopicQuiz = () => {
  const { topicId } = useParams();
  const { showToast } = useToast();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiRequest(`/quizzes/topic/${topicId}`);
        setQuiz(res.data);
      } catch (err) {
        showToast(err.message || 'Unable to load quiz', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [topicId]);

  const handleStart = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      // ignore
    }
    setStarted(true);
  };

  const handleComplete = (score, total) => {
    showToast(`Quiz complete — ${score}/${total}`);
    // Exit fullscreen
    if (document.fullscreenElement) document.exitFullscreen?.();
  };

  if (loading) return <p>Loading quiz...</p>;
  if (!quiz) return <p>No quiz available.</p>;

  const seconds = quiz.durationMinutes ? quiz.durationMinutes * 60 : 600;

  return (
    <section className="quiz-shell">
      <div className="quiz-card">
        <h2 className="page-title">{quiz.title}</h2>
        <p style={{ color: 'var(--text-muted)' }}>Topic quiz — {quiz.questions.length} questions</p>

        {!started ? (
          <div>
            <p style={{ marginTop: 12 }}>[This quiz will run in full-screen with a timer]</p>
            <button className="btn btn-primary" onClick={handleStart}>Start Quiz (Full screen)</button>
          </div>
        ) : (
          <QuizWidget questions={quiz.questions} onComplete={handleComplete} timerSeconds={seconds} start={started} />
        )}
      </div>
    </section>
  );
};

export default TopicQuiz;
