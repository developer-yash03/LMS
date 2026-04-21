import React, { useState } from 'react';
import { FiCheckCircle, FiHelpCircle } from 'react-icons/fi';

const Quiz = () => {
  const [score, setScore] = useState(null);
  const questions = [
    { q: 'What does HTML stand for?', options: ['Hypertext Markup', 'High Tech Modern'], ans: 0 },
  ];

  const handleFinish = (choice) => {
    if (choice === questions[0].ans) setScore(1);
    else setScore(0);
  };

  return (
    <section className="quiz-shell">
      <div className="quiz-card">
        <h2 className="page-title">
          <FiHelpCircle /> Quick Quiz
        </h2>
      {score === null ? (
          <div>
            <p className="quiz-question">{questions[0].q}</p>
            <div className="quiz-options">
          {questions[0].options.map((opt, i) => (
                <button key={i} onClick={() => handleFinish(i)} className="quiz-option">
                  {opt}
                </button>
          ))}
            </div>
        </div>
      ) : (
          <h3 className="quiz-result">
            <FiCheckCircle /> Your Score: {score} / {questions.length}
          </h3>
      )}
      </div>
    </section>
  );
};

export default Quiz;