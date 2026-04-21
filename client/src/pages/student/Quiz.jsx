import React, { useState } from 'react';
import { FiHelpCircle } from 'react-icons/fi';
import QuizWidget from '../../components/course/QuizWidget';
import { useToast } from '../../context/ToastContext';

const Quiz = () => {
  const { showToast } = useToast();
  const [completed, setCompleted] = useState(false);

  const questions = [
    {
      question: 'What does HTML stand for?',
      options: ['Hypertext Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'],
      answer: 0,
    },
    {
      question: 'Which CSS property is used to change text color?',
      options: ['font-color', 'text-color', 'color', 'foreground-color'],
      answer: 2,
    },
    {
      question: 'JavaScript is a ___ language.',
      options: ['Compiled', 'Interpreted', 'Assembly', 'Machine'],
      answer: 1,
    },
  ];

  const handleComplete = (score, total) => {
    setCompleted(true);
    showToast(`Quiz finished! You scored ${score}/${total}`);
  };

  return (
    <section className="quiz-shell">
      <div className="quiz-card">
        <h2 className="page-title">
          <FiHelpCircle /> Quick Quiz
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Test your web development fundamentals.
        </p>

        <QuizWidget
          questions={questions}
          onComplete={handleComplete}
        />
      </div>
    </section>
  );
};

export default Quiz;