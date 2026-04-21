import React, { useState } from 'react';
import { FiCheckCircle, FiXCircle, FiAward } from 'react-icons/fi';

/**
 * QuizWidget — Self-contained multi-question quiz.
 *
 * Props:
 *   questions  — [{ question, options: string[], answer: number }]
 *   onComplete — (score, total) => void  (called after grading)
 */
const QuizWidget = ({ questions = [], onComplete }) => {
  const [selected, setSelected] = useState({});       // { questionIndex: optionIndex }
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (qIndex, optIndex) => {
    if (submitted) return;
    setSelected((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmit = () => {
    if (Object.keys(selected).length < questions.length) return; // require all answered

    let correct = 0;
    questions.forEach((q, i) => {
      if (selected[i] === q.answer) correct++;
    });

    setScore(correct);
    setSubmitted(true);

    if (onComplete) {
      onComplete(correct, questions.length);
    }
  };

  const allAnswered = Object.keys(selected).length === questions.length;

  if (questions.length === 0) {
    return <p style={{ color: 'var(--text-muted)' }}>No questions available for this quiz.</p>;
  }

  return (
    <div className="quiz-widget">
      {/* Score Banner (after submit) */}
      {submitted && (
        <div className={`quiz-score-banner ${score === questions.length ? 'perfect' : score >= questions.length / 2 ? 'pass' : 'fail'}`}>
          <FiAward size={24} />
          <div>
            <strong>Score: {score} / {questions.length}</strong>
            <span>
              {score === questions.length
                ? ' — Perfect! 🎉'
                : score >= questions.length / 2
                ? ' — Good job!'
                : ' — Keep practicing!'}
            </span>
          </div>
        </div>
      )}

      {/* Questions */}
      {questions.map((q, qIndex) => {
        const userAnswer = selected[qIndex];
        const isCorrect = submitted && userAnswer === q.answer;
        const isWrong = submitted && userAnswer !== undefined && userAnswer !== q.answer;

        return (
          <div key={qIndex} className="quiz-question-block">
            <p className="quiz-question-text">
              <span className="quiz-question-num">Q{qIndex + 1}.</span> {q.question}
            </p>
            <div className="quiz-options-grid">
              {q.options.map((opt, optIndex) => {
                let optionClass = 'quiz-option-btn';
                if (submitted) {
                  if (optIndex === q.answer) optionClass += ' correct';
                  else if (optIndex === userAnswer && userAnswer !== q.answer) optionClass += ' wrong';
                } else if (userAnswer === optIndex) {
                  optionClass += ' selected';
                }

                return (
                  <button
                    key={optIndex}
                    className={optionClass}
                    onClick={() => handleSelect(qIndex, optIndex)}
                    disabled={submitted}
                  >
                    <span className="quiz-option-letter">
                      {String.fromCharCode(65 + optIndex)}
                    </span>
                    <span>{opt}</span>
                    {submitted && optIndex === q.answer && (
                      <FiCheckCircle className="quiz-feedback-icon correct" />
                    )}
                    {submitted && optIndex === userAnswer && userAnswer !== q.answer && (
                      <FiXCircle className="quiz-feedback-icon wrong" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Submit Button */}
      {!submitted && (
        <button
          className="btn btn-primary quiz-submit-btn"
          onClick={handleSubmit}
          disabled={!allAnswered}
          style={{ opacity: allAnswered ? 1 : 0.5 }}
        >
          <FiCheckCircle /> Submit Quiz ({Object.keys(selected).length}/{questions.length} answered)
        </button>
      )}
    </div>
  );
};

export default QuizWidget;
