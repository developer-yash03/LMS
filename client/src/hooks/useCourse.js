import { useState, useEffect } from 'react';
import { useCourseContext } from '../context/CourseContext';

/**
 * useCourse hook — thin wrapper around CourseContext.
 * 
 * Usage:
 *   const { courses, loading }       = useCourse();        // all courses
 *   const { singleCourse, loading }  = useCourse(courseId); // single course
 *
 * Preserves the loading-delay for skeleton loaders to render.
 */
export const useCourse = (courseId = null) => {
  const { courses } = useCourseContext();
  const [loading, setLoading] = useState(true);
  const [singleCourse, setSingleCourse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Simulate a brief network delay so skeleton loaders show up
    const timer = setTimeout(() => {
      if (courseId) {
        const found = courses.find((c) => String(c.id) === String(courseId));
        if (found) {
          setSingleCourse(found);
        } else {
          setError('Course not found 😕');
          setSingleCourse(null);
        }
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [courseId, courses]);

  return { courses, singleCourse, loading, error };
};