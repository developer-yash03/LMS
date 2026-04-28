import React, { useEffect, useState } from 'react';
import { FiPlusCircle, FiTrash2 } from 'react-icons/fi';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './InstructorTheme.css';

const emptyQuestion = () => ({ question: '', options: ['', '', '', ''], correctAnswer: 0 });

const Quizzes = () => {
  const { showToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [questions, setQuestions] = useState(() => Array.from({ length: 10 }, () => emptyQuestion()));
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCourses = async (preferredCourseId = null) => {
    try {
      const res = await apiRequest('/courses/instructor/courses');
      const items = res.data || [];
      setCourses(items);

      if (preferredCourseId) {
        const found = items.find((c) => String(c._id) === String(preferredCourseId));
        if (found) {
          setSelectedCourse(found);
          return;
        }
      }

      if (items.length > 0) setSelectedCourse(items[0]);
    } catch (err) {
      showToast(err.message || 'Failed to load courses', 'error');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const courseParam = params.get('course');
    loadCourses(courseParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTopic = (topicId) => {
    setSelectedTopics((prev) => {
      const copy = new Set(prev);
      if (copy.has(topicId)) copy.delete(topicId); else copy.add(topicId);
      return copy;
    });
  };

  const updateQuestionField = (i, field, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      if (field === 'question') next[i].question = value;
      else if (field === 'correct') next[i].correctAnswer = Number(value);
      else if (field.startsWith('opt')) {
        const idx = Number(field.slice(3));
        next[i].options[idx] = value;
      }
      return next;
    });
  };

  const addQuestion = () => setQuestions((p) => [...p, emptyQuestion()]);
  const removeQuestion = (i) => setQuestions((p) => p.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return showToast('Select a course', 'error');
    if (selectedTopics.size === 0) return showToast('Select at least one topic', 'error');
    if (!questions || questions.length < 10) return showToast('Add at least 10 questions', 'error');

    // Basic validation
    for (const q of questions) {
      if (!q.question.trim()) return showToast('All questions must have text', 'error');
      if (!Array.isArray(q.options) || q.options.length < 2) return showToast('Each question needs options', 'error');
    }

    setSaving(true);
    try {
      const payload = {
        courseId: selectedCourse._id,
        topics: Array.from(selectedTopics),
        title,
        questions
      };

      const res = await apiRequest('/quizzes/instructor', 'POST', payload);
      showToast(res.message || 'Quizzes created');
      // reset selections
      setSelectedTopics(new Set());
      setQuestions(Array.from({ length: 10 }, () => emptyQuestion()));
      setTitle('');
      await loadCourses();
    } catch (err) {
      showToast(err.message || 'Unable to create quizzes', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page-container studio-page instructor-theme-page">
      <div className="page-header studio-hero">
        <div>
          <h2 className="page-title">Create Quizzes</h2>
          <p className="studio-subtitle">Add quizzes for multiple topics at once (min 10 questions per quiz).</p>
        </div>
      </div>

      <div className="studio-layout">
        <aside className="studio-sidebar panel-surface">
          <h4>Your courses</h4>
          <div>
            {courses.map((c) => (
              <button key={c._id} className={`btn ${selectedCourse && selectedCourse._id === c._id ? 'btn-primary' : 'btn-soft'}`} onClick={() => setSelectedCourse(c)}>
                {c.title}
              </button>
            ))}
          </div>
        </aside>

        <div className="panel-surface studio-main">
          {!selectedCourse ? (
            <p>No course selected</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <label>Quiz title (optional)</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} />

              <h4>Select topics</h4>
              {selectedCourse.modules?.map((m) => (
                <div key={m._id} style={{ marginBottom: 8 }}>
                  <strong>{m.title}</strong>
                  <div style={{ paddingLeft: 12 }}>
                    {m.topics?.map((t) => (
                      <label key={t._id} style={{ display: 'block' }}>
                        <input type="checkbox" checked={selectedTopics.has(t._id)} onChange={() => toggleTopic(t._id)} /> {t.title}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <h4>Questions ({questions.length})</h4>
              {questions.map((q, i) => (
                <div key={i} className="panel-surface" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Q{i + 1}</strong>
                    <button type="button" className="btn btn-soft" onClick={() => removeQuestion(i)}><FiTrash2 /></button>
                  </div>
                  <input placeholder="Question text" value={q.question} onChange={(e) => updateQuestionField(i, 'question', e.target.value)} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                    {q.options.map((opt, idx) => (
                      <input key={idx} placeholder={`Option ${idx + 1}`} value={opt} onChange={(e) => updateQuestionField(i, `opt${idx}`, e.target.value)} />
                    ))}
                  </div>
                  <label style={{ marginTop: 8 }}>Correct answer (0-based index)
                    <input type="number" min={0} max={q.options.length - 1} value={q.correctAnswer} onChange={(e) => updateQuestionField(i, 'correct', e.target.value)} />
                  </label>
                </div>
              ))}

              <div style={{ marginTop: 12 }}>
                <button type="button" className="btn btn-outline" onClick={addQuestion}><FiPlusCircle /> Add Question</button>
              </div>

              <div style={{ marginTop: 16 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create Quizzes'}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Quizzes;
