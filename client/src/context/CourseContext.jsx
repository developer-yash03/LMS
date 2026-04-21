import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const CourseContext = createContext(null);

// ─── Master Course Catalog ────────────────────────────────────
const COURSE_CATALOG = [
  {
    id: '1',
    title: 'Full Stack Web Dev',
    instructor: 'Yash',
    price: 499,
    category: 'Development',
    rating: 4.8,
    modules: [
      {
        title: 'Module 1: Introduction to the Course',
        topics: [
          { key: '1-0', title: 'Course Overview', type: 'video', duration: '5 min' },
          { key: '1-1', title: 'Setup Environment', type: 'video', duration: '12 min' },
          { key: '1-2', title: 'Welcome Reading', type: 'text', duration: '3 min' },
        ],
      },
      {
        title: 'Module 2: Core Concepts',
        topics: [
          { key: '1-3', title: 'Understanding Components', type: 'video', duration: '15 min' },
          { key: '1-4', title: 'Props & State Management', type: 'video', duration: '20 min' },
          { key: '1-5', title: 'Module 2 Quiz', type: 'quiz', duration: '10 min' },
        ],
      },
      {
        title: 'Module 3: Advanced Topics',
        topics: [
          { key: '1-6', title: 'Context & Reducers', type: 'video', duration: '18 min' },
          { key: '1-7', title: 'Custom Hooks', type: 'video', duration: '14 min' },
          { key: '1-8', title: 'Final Assignment', type: 'assignment', duration: '30 min' },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'UI/UX Design Masterclass',
    instructor: 'Harsh',
    price: 0,
    category: 'Design',
    rating: 4.5,
    modules: [
      {
        title: 'Module 1: Design Fundamentals',
        topics: [
          { key: '2-0', title: 'Introduction to UX', type: 'video', duration: '8 min' },
          { key: '2-1', title: 'Color Theory', type: 'video', duration: '14 min' },
          { key: '2-2', title: 'Typography Essentials', type: 'text', duration: '6 min' },
        ],
      },
      {
        title: 'Module 2: User Research',
        topics: [
          { key: '2-3', title: 'Conducting User Interviews', type: 'video', duration: '18 min' },
          { key: '2-4', title: 'Creating Personas', type: 'video', duration: '12 min' },
          { key: '2-5', title: 'Research Quiz', type: 'quiz', duration: '10 min' },
        ],
      },
      {
        title: 'Module 3: Prototyping',
        topics: [
          { key: '2-6', title: 'Wireframing Basics', type: 'video', duration: '20 min' },
          { key: '2-7', title: 'High-Fidelity Prototypes', type: 'video', duration: '22 min' },
          { key: '2-8', title: 'Design Project', type: 'assignment', duration: '45 min' },
        ],
      },
    ],
  },
  {
    id: '3',
    title: 'Database Management',
    instructor: 'Chakshu',
    price: 299,
    category: 'Database',
    rating: 4.2,
    modules: [
      {
        title: 'Module 1: SQL Fundamentals',
        topics: [
          { key: '3-0', title: 'Introduction to SQL', type: 'video', duration: '10 min' },
          { key: '3-1', title: 'Tables & Relationships', type: 'video', duration: '16 min' },
          { key: '3-2', title: 'SQL Basics Reading', type: 'text', duration: '5 min' },
        ],
      },
      {
        title: 'Module 2: Advanced Queries',
        topics: [
          { key: '3-3', title: 'Joins & Subqueries', type: 'video', duration: '20 min' },
          { key: '3-4', title: 'Indexing & Optimization', type: 'video', duration: '18 min' },
          { key: '3-5', title: 'Query Quiz', type: 'quiz', duration: '10 min' },
        ],
      },
      {
        title: 'Module 3: NoSQL & MongoDB',
        topics: [
          { key: '3-6', title: 'Document Databases', type: 'video', duration: '14 min' },
          { key: '3-7', title: 'Aggregation Pipeline', type: 'video', duration: '22 min' },
          { key: '3-8', title: 'Database Project', type: 'assignment', duration: '40 min' },
        ],
      },
    ],
  },
];

// ─── localStorage helpers ────────────────────────────────────
const loadFromLS = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const saveToLS = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// ─── Provider ────────────────────────────────────────────────
export const CourseProvider = ({ children }) => {
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(
    () => loadFromLS('lms_enrolled', [])
  );
  const [progress, setProgress] = useState(
    () => loadFromLS('lms_progress', {})
  );
  const [quizScores, setQuizScores] = useState(
    () => loadFromLS('lms_quizScores', {})
  );

  // ── Enrollment ──
  const enrollInCourse = useCallback((courseId) => {
    setEnrolledCourseIds((prev) => {
      if (prev.includes(courseId)) return prev;
      const next = [...prev, courseId];
      saveToLS('lms_enrolled', next);
      return next;
    });
  }, []);

  const isEnrolled = useCallback(
    (courseId) => enrolledCourseIds.includes(courseId),
    [enrolledCourseIds]
  );

  // ── Progress tracking ──
  // progress shape: { courseId: { topicKey: true } }
  const markTopicComplete = useCallback((courseId, topicKey) => {
    setProgress((prev) => {
      const courseProgress = prev[courseId] || {};
      if (courseProgress[topicKey]) return prev; // already completed
      const next = {
        ...prev,
        [courseId]: { ...courseProgress, [topicKey]: true },
      };
      saveToLS('lms_progress', next);
      return next;
    });
  }, []);

  const getProgress = useCallback(
    (courseId) => {
      const course = COURSE_CATALOG.find((c) => c.id === courseId);
      if (!course) return 0;

      const totalTopics = course.modules.reduce(
        (sum, mod) => sum + mod.topics.length,
        0
      );
      if (totalTopics === 0) return 0;

      const completedTopics = Object.keys(progress[courseId] || {}).length;
      return Math.round((completedTopics / totalTopics) * 100);
    },
    [progress]
  );

  const isTopicComplete = useCallback(
    (courseId, topicKey) => {
      return !!(progress[courseId] && progress[courseId][topicKey]);
    },
    [progress]
  );

  // ── Quiz scores ──
  // quizScores shape: { courseId: { topicKey: { score, total } } }
  const saveQuizScore = useCallback((courseId, topicKey, score, total) => {
    setQuizScores((prev) => {
      const next = {
        ...prev,
        [courseId]: {
          ...(prev[courseId] || {}),
          [topicKey]: { score, total },
        },
      };
      saveToLS('lms_quizScores', next);
      return next;
    });
  }, []);

  const getQuizScore = useCallback(
    (courseId, topicKey) => {
      return quizScores[courseId]?.[topicKey] || null;
    },
    [quizScores]
  );

  const value = useMemo(
    () => ({
      courses: COURSE_CATALOG,
      enrolledCourseIds,
      enrollInCourse,
      isEnrolled,
      progress,
      markTopicComplete,
      getProgress,
      isTopicComplete,
      quizScores,
      saveQuizScore,
      getQuizScore,
    }),
    [
      enrolledCourseIds,
      enrollInCourse,
      isEnrolled,
      progress,
      markTopicComplete,
      getProgress,
      isTopicComplete,
      quizScores,
      saveQuizScore,
      getQuizScore,
    ]
  );

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourseContext = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourseContext must be used inside CourseProvider');
  }
  return context;
};

export default CourseContext;
