import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';

const ScholarHubLogo = () => (
  <span className="scholarhub-logo">
    ScholarHub
  </span>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully!', 'info');
    navigate('/');
  };

  return (
    <nav className="navbar-top">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <ScholarHubLogo />
        </Link>

        {/* Main navigation links removed */}

        <div className="navbar-right">
          {user ? (
            <div className="user-nav-actions">
              <span className="user-name">{user.name}</span>
              <button onClick={handleLogout} className="logout-link">Logout</button>
            </div>
          ) : (
            <div className="auth-nav-actions">
              <Link to="/login" className="login-link">Sign in</Link>
              <Link to="/signup" className="register-btn">Register</Link>
            </div>
          )}

          <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;