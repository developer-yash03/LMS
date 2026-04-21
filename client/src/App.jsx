import React, { useEffect, useRef } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
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

// Student Pages
import History from './pages/student/History.jsx';
import MyLearning from './pages/student/MyLearning.jsx';
import Player from './pages/student/Player.jsx';

// Instructor Pages
import InstructorDash from './pages/instructor/Dashboard.jsx';
import CreateCourse from './pages/instructor/Create.jsx';

// Admin Pages
import AdminDash from './pages/admin/Dashboard.jsx';
import AdminUsers from './pages/admin/Users.jsx';

// Auth Wrappers (Security)
import Protected from './components/auth/Protected.jsx';
import RoleGate from './components/auth/RoleGate.jsx';

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
  const mainScrollRef = useRef(null);

  const dashboardPrefixes = ['/my-learning', '/player/', '/history', '/instructor', '/admin'];
  const showSidebar = dashboardPrefixes.some((prefix) => pathname.startsWith(prefix));

  return (
    <div className="app-shell">
      <ScrollToTop scrollRef={mainScrollRef} />

      {/* ── Fixed Navbar ── */}
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
          <div className="app-content">
            <Routes>
              {/* --- PUBLIC ROUTES --- */}
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/course/:id" element={<Details />} />
              <Route path="/login" element={<Login />} />

              {/* --- STUDENT ROUTES (Protected) --- */}
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
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default App;