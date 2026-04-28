import React, { useEffect, useRef } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';

// Layout Components
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import Sidebar from './components/layout/Sidebar.jsx';

// Public Pages
import Home from './pages/public/Home.jsx';
import Browse from './pages/public/Browse.jsx';
import Details from './pages/public/Details.jsx';
import Login from './pages/public/Login.jsx';
import SignUp from './pages/public/SignUp.jsx';
import VerifyOtp from './pages/public/VerifyOtp.jsx';
import ForgotPassword from './pages/public/ForgotPassword.jsx';

// Student Pages
import History from './pages/student/History.jsx';
import MyLearning from './pages/student/MyLearning.jsx';
import Player from './pages/student/Player.jsx';
import StudentDashboard from './pages/student/Dashboard.jsx';
import Courses from './pages/student/Courses.jsx';
import Tasks from './pages/student/Tasks.jsx';
import Profile from './pages/student/Profile.jsx';
import Wishlist from './pages/student/Wishlist.jsx';
import TopicQuiz from './pages/student/TopicQuiz.jsx';

// Instructor Pages
import InstructorDash from './pages/instructor/Dashboard.jsx';
import CreateCourse from './pages/instructor/Create.jsx';
import Quizzes from './pages/instructor/Quizzes.jsx';
import InstructorAssignments from './pages/instructor/Assignments.jsx';
import InstructorEarnings from './pages/instructor/Earnings.jsx';

// Admin Pages
import AdminDash from './pages/admin/Dashboard.jsx';
import AdminUsers from './pages/admin/Users.jsx';

// Auth Wrappers (Security)
import Protected from './components/auth/Protected.jsx';
import RoleGate from './components/auth/RoleGate.jsx';
import { useAuth } from './hooks/useAuth.js';
import { getDashboardRoute } from './utils/authValidation.js';

function ScrollToTop({ scrollRef }) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname, scrollRef]);

  return null;
}

function NotFound() {
  return (
    <section className="not-found" role="alert">
      <h1>404</h1>
      <p>The page you are looking for was not found.</p>
      <Link to="/" className="home-link">
        Go to Home
      </Link>
    </section>
  );
}

function App() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const mainScrollRef = useRef(null);

  const dashboardPrefixes = ['/my-learning', '/player/', '/history', '/instructor', '/admin', '/student'];
  const showSidebar = dashboardPrefixes.some((prefix) => pathname.startsWith(prefix));

  return (
    <div className="app-shell">
      <ScrollToTop scrollRef={mainScrollRef} />

      <Navbar />

      <div className="app-body">
        {/* ── Fixed Sidebar ── */}
        {showSidebar && (
          <aside className="app-sidebar">
            <Sidebar />
          </aside>
        )}

        {/* ── Scrollable Main Content ── */}
        <main
          ref={mainScrollRef}
          className={`app-main ${showSidebar ? 'with-sidebar' : ''}`}
        >
          <div className={(pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password' || pathname.startsWith('/student') || pathname === '/my-learning' || pathname === '/browse') ? "auth-full-width" : "app-content"}>
            <Routes>
              {/* --- PUBLIC ROUTES --- */}
              <Route
                path="/"
                element={user ? <Navigate to={getDashboardRoute(String(user?.role || '').toLowerCase())} replace /> : <Home />}
              />
              <Route path="/browse" element={<Browse />} />
              <Route path="/course/:id" element={<Details />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset" element={<ForgotPassword />} />

              {/* --- STUDENT ROUTES (Protected) --- */}
              <Route
                path="/student/dashboard"
                element={<Navigate to="/my-learning" replace />}
              />
              <Route
                path="/student/courses"
                element={
                  <Protected>
                    <Courses />
                  </Protected>
                }
              />
              <Route
                path="/student/tasks"
                element={
                  <Protected>
                    <Tasks />
                  </Protected>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <Protected>
                    <Profile />
                  </Protected>
                }
              />
              <Route
                path="/my-learning"
                element={
                  <Protected>
                    <MyLearning />
                  </Protected>
                }
              />
              <Route
                path="/player/:id"
                element={
                  <Protected>
                    <Player />
                  </Protected>
                }
              />
              <Route
                path="/history"
                element={
                  <Protected>
                    <History />
                  </Protected>
                }
              />
              <Route
                path="/student/wishlist"
                element={
                  <Protected>
                    <Wishlist />
                  </Protected>
                }
              />
              <Route
                path="/student/quiz/:topicId"
                element={
                  <Protected>
                    <TopicQuiz />
                  </Protected>
                }
              />

              {/* --- INSTRUCTOR ROUTES (Role Based) --- */}
              <Route
                path="/instructor/dashboard"
                element={
                  <RoleGate role="instructor">
                    <InstructorDash />
                  </RoleGate>
                }
              />
              <Route
                path="/instructor/create"
                element={
                  <RoleGate role="instructor">
                    <CreateCourse />
                  </RoleGate>
                }
              />
              <Route
                path="/instructor/quizzes"
                element={
                  <RoleGate role="instructor">
                    <Quizzes />
                  </RoleGate>
                }
              />
              <Route
                path="/instructor/courses"
                element={
                  <RoleGate role="instructor">
                    <CreateCourse />
                  </RoleGate>
                }
              />
              <Route
                path="/instructor/assignments"
                element={
                  <RoleGate role="instructor">
                    <InstructorAssignments />
                  </RoleGate>
                }
              />
              <Route
                path="/instructor/earnings"
                element={
                  <RoleGate role="instructor">
                    <InstructorEarnings />
                  </RoleGate>
                }
              />

              {/* --- ADMIN ROUTES (Role Based) --- */}
              <Route
                path="/admin/dashboard"
                element={
                  <RoleGate role="admin">
                    <AdminDash />
                  </RoleGate>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <RoleGate role="admin">
                    <AdminUsers />
                  </RoleGate>
                }
              />

              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App;