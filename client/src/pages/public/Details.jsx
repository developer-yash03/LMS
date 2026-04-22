import React from 'react';
import { FiCheckCircle, FiShield, FiClock, FiGlobe, FiAward, FiPlay } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '../../hooks/useCourse';
import { useCourseContext } from '../../context/CourseContext';
import { useAuth } from '../../hooks/useAuth';
import BackButton from '../../components/common/BackButton';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../services/api';

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Details = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { singleCourse, loading } = useCourse(id);
  const { enrollInCourse, isEnrolled, getProgress } = useCourseContext();
  const { user } = useAuth();
  const { showToast } = useToast();

  if (loading) return <p>Loading details...</p>;

  if (!singleCourse) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h3>Course not found</h3>
        <p>The selected course is unavailable right now.</p>
        <BackButton to="/browse" label="Browse Courses" />
      </div>
    );
  }

  const enrolled = isEnrolled(singleCourse.id);
  const progress = enrolled ? getProgress(singleCourse.id) : 0;

  const handleEnroll = async () => {
    if (!user) {
      showToast('Please log in to enroll!', 'info');
      navigate('/login');
      return;
    }

    if (enrolled) {
      navigate(`/player/${singleCourse.id}`);
      return;
    }

    if (singleCourse.price === 0) {
      enrollInCourse(singleCourse.id);
      showToast('Successfully enrolled in the course!', 'success');
      navigate('/my-learning');
      return;
    }

    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      showToast("Razorpay SDK failed to load. Are you online?", "error");
      return;
    }

    try {
      const orderResponse = await apiRequest("/payment/create-order", "POST", { courseId: singleCourse.id });
      
      const options = {
        key: orderResponse.keyId,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: "LMS Platform",
        description: `Enrollment for ${singleCourse.title}`,
        order_id: orderResponse.orderId,
        handler: async function (response) {
          try {
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            const verifyRes = await apiRequest("/payment/verify", "POST", verifyData);
            
            if(verifyRes.message) {
               enrollInCourse(singleCourse.id);
               showToast('Successfully enrolled in the course!', 'success');
               navigate('/my-learning');
            } else {
               showToast(verifyRes.error || "Payment verification failed", "error");
            }
          } catch(err) {
            showToast("Payment verification failed", "error");
          }
        },
        prefill: {
          name: user?.name || "Student",
          email: user?.email || "",
        },
        theme: {
          color: "#0056D2",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      showToast("Something went wrong with the payment", "error");
    }
  };

  return (
    <div className="page-container" style={{ padding: 0 }}>
      <div style={{ padding: '0 2rem' }}>
        <BackButton to="/browse" label="Back to Browse" />
      </div>

      <div className="details-hero">
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}>
          <h1>{singleCourse.title}</h1>
          <p>
            Master the skills you need to advance your career. This comprehensive program covers everything from foundational principles to advanced techniques.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', color: '#d1d5db', fontSize: '0.95rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FiClock /> Approx. 4 months to complete</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FiGlobe /> English</span>
          </div>
          <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(singleCourse.instructor || 'Instructor')}&background=0056D2&color=fff`} alt="Instructor" style={{ borderRadius: '50%', width: '50px', height: '50px' }} />
            <div>
              <span style={{ display: 'block', fontWeight: '600', color: '#fff' }}>Instructor: {singleCourse.instructor}</span>
              <span style={{ fontSize: '0.85rem' }}>Top Instructor</span>
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
                <span>Build real-world applications using modern frameworks.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <FiCheckCircle color="var(--primary-blue)" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
                <span>Understand and apply advanced architectural patterns.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <FiCheckCircle color="var(--primary-blue)" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
                <span>Optimize performance and scale your applications.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <FiCheckCircle color="var(--primary-blue)" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
                <span>Prepare for technical interviews and career growth.</span>
              </div>
            </div>
          </section>

          <section className="syllabus-section">
            <h2>Syllabus</h2>
            <ul className="syllabus-list">
              {(singleCourse.modules || []).map((mod, i) => (
                <li key={i}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.125rem' }}>{mod.title}</h4>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
                      {mod.topics.length} items · {mod.topics.map(t => t.duration).join(', ')}
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
              src={`https://picsum.photos/seed/${singleCourse.id}/800/450`}
              alt="Course preview"
              className="purchase-img"
            />
            <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
              {singleCourse.price === 0 ? 'Free' : `₹${singleCourse.price}`}
            </h3>

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '1rem', padding: '1rem' }}
              onClick={handleEnroll}
            >
              {enrolled ? (
                <><FiPlay /> Continue Learning ({progress}%)</>
              ) : (
                <>Enroll for {singleCourse.price === 0 ? 'Free' : `₹${singleCourse.price}`}</>
              )}
            </button>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <FiShield /> 14-day money-back guarantee
            </p>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FiAward color="var(--primary-blue)" size={24} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem' }}>Shareable Certificate</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Add to your LinkedIn profile</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FiClock color="var(--primary-blue)" size={24} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem' }}>Flexible Deadlines</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Reset deadlines in accordance to your schedule.</span>
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