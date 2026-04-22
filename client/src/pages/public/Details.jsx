import React, { useEffect, useMemo, useState } from 'react';
import { FiCheckCircle, FiShield, FiClock, FiGlobe, FiAward, FiPlay } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import BackButton from '../../components/common/BackButton';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../services/api';

const Details = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const response = await apiRequest(`/courses/${id}`);
        setCourse(response.data);
      } catch (error) {
        showToast(error.message || 'Failed to load course details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, showToast]);

  useEffect(() => {
    const fetchEnrollmentStatus = async () => {
      if (!user || !id) {
        setEnrolled(false);
        setProgress(0);
        return;
      }

      try {
        const enrolledResponse = await apiRequest('/courses/student/enrolled-courses');
        const exists = (enrolledResponse.data || []).some((item) => String(item._id) === String(id));
        setEnrolled(exists);

        if (exists) {
          try {
            const progressResponse = await apiRequest(`/courses/${id}/progress`);
            setProgress(progressResponse?.data?.progressPercentage || 0);
          } catch {
            setProgress(0);
          }
        }
      } catch {
        setEnrolled(false);
        setProgress(0);
      }
    };

    fetchEnrollmentStatus();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) {
      showToast('Please log in to enroll!', 'info');
      navigate('/login');
      return;
    }

    if (!course) {
      return;
    }

    if (enrolled) {
      navigate(`/player/${course._id}`);
      return;
    }

    try {
      await apiRequest(`/courses/${course._id}/enroll`, 'POST', {});
      showToast('Successfully enrolled in the course!');
      setEnrolled(true);
      setProgress(0);
      navigate('/my-learning');
    } catch (error) {
      showToast(error.message || 'Enrollment failed', 'error');
    }
  };

  const normalizedInstructor = useMemo(() => {
    if (!course) return 'Instructor';
    if (typeof course.instructor === 'object') {
      return course.instructor?.name || 'Instructor';
    }
    return course.instructor || 'Instructor';
  }, [course]);

  if (loading) return <p>Loading details...</p>;

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h3>Course not found</h3>
        <p>The selected course is unavailable right now.</p>
        <BackButton to="/browse" label="Browse Courses" />
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: 0 }}>
      <div style={{ padding: '0 2rem' }}>
        <BackButton to="/browse" label="Back to Browse" />
      </div>

      <div className="details-hero">
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}>
          <h1>{course.title}</h1>
          <p>{course.description || 'Master practical skills with guided modules and topic-wise lessons.'}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', color: '#d1d5db', fontSize: '0.95rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiClock /> {course.duration ? `${course.duration} hours` : 'Self-paced'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiGlobe /> English
            </span>
          </div>
          <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(normalizedInstructor)}&background=0056D2&color=fff`}
              alt="Instructor"
              style={{ borderRadius: '50%', width: '50px', height: '50px' }}
            />
            <div>
              <span style={{ display: 'block', fontWeight: '600', color: '#fff' }}>Instructor: {normalizedInstructor}</span>
              <span style={{ fontSize: '0.85rem' }}>{course.level || 'Beginner'} level</span>
            </div>
          </div>
        </div>
      </div>

      <div className="details-content" style={{ padding: '0 2rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
        <div>
          <section className="syllabus-section" style={{ marginBottom: '2rem' }}>
            <h2>What you'll learn</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <FiCheckCircle color="var(--primary-blue)" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
                <span>Structured modules and topic-wise progression.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <FiCheckCircle color="var(--primary-blue)" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
                <span>Track your progress as you complete lessons.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <FiCheckCircle color="var(--primary-blue)" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
                <span>Hands-on content aligned to real-world outcomes.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <FiCheckCircle color="var(--primary-blue)" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
                <span>Learn at your own pace with repeatable access.</span>
              </div>
            </div>
          </section>

          <section className="syllabus-section">
            <h2>Syllabus</h2>
            <ul className="syllabus-list">
              {(course.modules || []).map((mod, i) => (
                <li key={mod._id || i}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.125rem' }}>{mod.title}</h4>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
                      {(mod.topics || []).length} topics
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside>
          <div className="purchase-card">
            <img
              src={course.thumbnail || `https://picsum.photos/seed/${course._id}/800/450`}
              alt="Course preview"
              className="purchase-img"
            />
            <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
              {course.price === 0 ? 'Free' : `₹${course.price}`}
            </h3>

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '1rem', padding: '1rem' }}
              onClick={handleEnroll}
            >
              {enrolled ? (
                <>
                  <FiPlay /> Continue Learning ({progress}%)
                </>
              ) : (
                <>Enroll for {course.price === 0 ? 'Free' : `₹${course.price}`}</>
              )}
            </button>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <FiShield /> Secure access with your verified account
            </p>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FiAward color="var(--primary-blue)" size={24} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem' }}>Progress Tracking</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>See completion updates topic by topic</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FiClock color="var(--primary-blue)" size={24} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem' }}>Flexible Learning</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Resume anytime from your dashboard</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Details;
