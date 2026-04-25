import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiLogIn, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';

/* ── Simple Text Logo ── */
const ScholarHubLogo = () => (
  <span style={{ 
    fontFamily: "'Georgia', serif", 
    fontSize: '1.5rem', 
    fontWeight: 'bold', 
    color: '#2e2117',
    letterSpacing: '0.5px'
  }}>
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
    setTimeout(() => {
      showToast('Logged out successfully!', 'info');
      navigate('/', { replace: true });
    }, 0);
  };

  return (
    <nav className="navbar-top">
      <div className="navbar-row">
        <Link to="/" className="navbar-brand" aria-label="ScholarHub Home">
          <ScholarHubLogo />
        </Link>

        <button
          className="navbar-toggle"
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      <div className={`navbar-actions ${menuOpen ? 'mobile-open' : ''}`}>
        <Link to="/courses" className="nav-link">Courses</Link>
        <Link to="/instructors" className="nav-link">Instructors</Link>
        
        {user ? (
          <>
            <span className="nav-user-name">{user.name}</span>
            <button onClick={handleLogout} className="btn btn-outline nav-button">
              <FiLogOut size={15} /> Logout
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
};

export default Navbar;