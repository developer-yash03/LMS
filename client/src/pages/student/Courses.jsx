import React, { useState, useEffect } from 'react';
import { FiBook, FiClock, FiCheckCircle, FiArrowRight, FiPlay, FiUsers, FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import './Courses.css';

const Courses = () => {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user) {
        setLoading(false);
        setCourses([]);
        return;
      }

      setLoading(true);
      try {
        // TODO: Backend Integration - Fetch student's enrolled courses
        // Expected API: GET /api/students/courses
        // Response should contain:
        // {
        //   courses: [{
        //     _id,
        //     title,
        //     description,
        //     thumbnail,
        //     instructor: { name },
        //     completionPercentage,
        //     category,
        //     totalLessons,
        //     completedLessons,
        //     rating,
        //     reviewCount
        //   }]
        // }
        const data = await apiRequest('/students/courses', 'GET');
        setCourses(data?.courses || []);
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [user]);

  return (
    <div className="student-page">
      <div className="student-header-banner">
        <div className="student-header-content">
          <span className="student-header-label">MY COURSES</span>
          <h1>Continue Learning</h1>
          <p>Track your progress and pick up where you left off.</p>
        </div>
        <div className="student-header-visual">
          <FiBook size={64} />
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="student-empty-card">
          <div className="student-empty-icon">
            <FiBook size={48} />
          </div>
          <h3>No courses yet</h3>
          <p>You haven't enrolled in any courses. Start your learning journey today!</p>
          <Link to="/browse" className="btn-primary-brown">
            Browse Courses <FiArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="courses-grid-auth">
          {courses.map((course) => {
            const progress = course.completionPercentage || 0;
            const isComplete = progress === 100;
            
            return (
              <Link
                key={course._id}
                to={`/player/${course._id}`}
                className="course-card-auth"
              >
                <div className="course-card-image-auth">
                  <img
                    src={course.thumbnail || `https://picsum.photos/seed/${course._id}/800/450`}
                    alt={course.title}
                  />
                  {isComplete && (
                    <div className="course-card-completed-badge">
                      <FiCheckCircle size={14} /> Completed
                    </div>
                  )}
                </div>
                
                <div className="course-card-body-auth">
                  <span className="course-card-tag">{course.category || 'Course'}</span>
                  <h3 className="course-card-title-auth">{course.title}</h3>
                  <p className="course-card-instructor-auth">
                    <FiUsers size={14} /> {course.instructor?.name || 'Instructor'}
                  </p>
                  
                  {course.rating && (
                    <p className="course-card-rating-auth">
                      <FiStar fill="#b4690e" color="#b4690e" /> {course.rating} <span>({course.reviewCount} reviews)</span>
                    </p>
                  )}
                  
                  <div className="course-card-progress-auth">
                    <div className="progress-track-auth">
                      <div 
                        className="progress-fill-auth" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="progress-label-auth">{progress}% Complete</span>
                  </div>
                  
                  <button className="course-card-action-auth">
                    {isComplete ? (
                      <>Review Course <FiArrowRight size={14} /></>
                    ) : (
                      <>Continue Learning <FiPlay size={14} /></>
                    )}
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Courses;