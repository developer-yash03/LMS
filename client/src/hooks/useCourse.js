import { useState, useEffect } from 'react';

export const useCourse = (courseId = null) => {
  const [courses, setCourses] = useState([]);
  const [singleCourse, setSingleCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      // 1. Reset state before fetching to prevent UI flashing old data
      setLoading(true);
      setError(null); 

      try {
        // MOCK DATA for now
        const mockData = [
          { id: "1", title: "Full Stack Web Dev", instructor: "Yash", price: 499, category: "Development", rating: 4.8 },
          { id: "2", title: "UI/UX Design Masterclass", instructor: "Harsh", price: 0, category: "Design", rating: 4.5 },
          { id: "3", title: "Database Management", instructor: "Chakshu", price: 299, category: "Database", rating: 4.2 },
        ];

        // Optional: Simulate a 500ms network delay so your <Loader /> actually shows up
        await new Promise(resolve => setTimeout(resolve, 500));

        if (courseId) {
          // 2. Bulletproof ID check: Convert both to Strings just in case
          const found = mockData.find(c => String(c.id) === String(courseId));
          
          if (found) {
            setSingleCourse(found);
          } else {
            // 3. Handle the "404 Not Found" scenario properly
            setError("Course not found 😕");
            setSingleCourse(null);
          }
        } else {
          // Fetching all courses
          setCourses(mockData);
        }
      } catch (err) {
        setError("Error: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [courseId]);

  return { courses, singleCourse, loading, error };
};