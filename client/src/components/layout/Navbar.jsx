import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiLogIn, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';

/* ── Inline SVG Logo Component ── */
const LMSLogo = () => (
  <svg width="140" height="36" viewBox="0 0 140 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Book icon */}
    <rect x="2" y="4" width="28" height="28" rx="4" fill="#EEF3FF" />
    <path
      d="M9 10C9 10 16 8 16 8V26C16 26 9 28 9 28V10Z"
      fill="#0056D2"
      opacity="0.9"
    />
    <path
      d="M23 10C23 10 16 8 16 8V26C16 26 23 28 23 28V10Z"
      fill="#0056D2"
      opacity="0.6"
    />
    {/* Spine line */}
    <line x1="16" y1="8" x2="16" y2="26" stroke="#0056D2" strokeWidth="1.5" strokeLinecap="round" />
    {/* Text "LMS" */}
    <text x="38" y="24" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="18" fill="#0056D2">
      LMS
    </text>
    {/* Text "Pro" */}
    <text x="80" y="24" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="18" fill="#1F2937">
      Pro
    </text>
  </svg>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogout = () => {
    // 1) Clear state first
    logout();

    // 2) Defer navigation to next tick so React finishes the
    //    re-render caused by user → null before we navigate.
    //    This avoids "Cannot update during an existing state transition".
    setTimeout(() => {
      showToast('Logged out successfully!', 'info');
      navigate('/', { replace: true });
    }, 0);
  };

  return (
    <nav className="navbar-top">
      <Link to="/" className="navbar-brand" aria-label="LMS Pro Home">
        <LMSLogo />
      </Link>

      <div className="navbar-search">
        <FiSearch color="var(--text-muted)" />
        <input type="text" placeholder="What do you want to learn?" />
      </div>

      <div className="navbar-actions">
        <Link to="/browse" className="nav-link">
          Explore
        </Link>
        {user ? (
          <>
            <Link to="/my-learning" className="nav-link">
              My Learning
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0056D2&color=fff&size=32&font-size=0.45&bold=true`}
                alt="User Avatar"
                className="avatar"
              />
              <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-outline"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.9rem' }}
            >
              <FiLogOut size={15} /> Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
            <FiLogIn /> Log In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;