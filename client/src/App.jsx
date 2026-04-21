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
  const navbarHeight = 72;
  const sidebarWidth = 260;

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: '#f6f9ff' }}>
      <ScrollToTop scrollRef={mainScrollRef} />
      <Navbar />

      {showSidebar && (
        <aside
          style={{
            position: 'fixed',
            top: navbarHeight + 'px',
            left: 0,
            width: sidebarWidth + 'px',
            height: 'calc(100vh - ' + navbarHeight + 'px)',
            padding: '12px',
            overflowY: 'auto',
            zIndex: 40,
          }}
        >
          <Sidebar />
        </aside>
      )}

      <main
        ref={mainScrollRef}
        style={{
          position: 'fixed',
          top: navbarHeight + 'px',
          left: showSidebar ? sidebarWidth + 'px' : 0,
          right: 0,
          bottom: 0,
          overflowY: 'auto',
          padding: '16px',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gap: '16px' }}>
          <section
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
            }}
          >
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

            {/* 404 Page - Optional */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </section>
          <Footer />
        </div>
      </main>
    </div>
  );
}

export default App;