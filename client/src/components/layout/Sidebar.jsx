import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiCheckSquare,
  FiClock,
  FiGrid,
  FiDollarSign,
  FiPlus,
  FiPlusSquare,
  FiShield,
  FiUsers,
  FiHeart,
  FiLogOut
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Guard: render nothing if user is not logged in
  if (!user) return null;

  const normalizedRole = String(user?.role || 'student').toLowerCase();
  const safeIdentity = String(user?.name || user?.email || 'User').trim();
  const firstName = safeIdentity.split(' ')[0] || 'User';

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully!', 'info');
    navigate('/');
  };

  const menuItems = {
    student: [
      { name: 'My Learning', path: '/my-learning', icon: FiClock },
      { name: 'Payment History', path: '/history', icon: FiClock },
      { name: 'Wishlist', path: '/student/wishlist', icon: FiHeart },
    ],
    instructor: [
      { name: 'Dashboard', path: '/instructor/dashboard', icon: FiGrid },
      { name: 'My Courses', path: '/instructor/courses', icon: FiPlusSquare },
      { name: 'Assignments', path: '/instructor/assignments', icon: FiCheckSquare },
      { name: 'Earnings', path: '/instructor/earnings', icon: FiDollarSign },
    ],
    admin: [
      { name: 'Users', path: '/admin/users', icon: FiUsers },
      { name: 'Course Approvals', path: '/admin/approvals', icon: FiCheckSquare },
    ],
  };

  const roleLabel = {
    student: 'Student DashBoard',
    instructor: 'Instructor DashBoard',
    admin: 'Admin DashBoard',
  };

  const roleItems = menuItems[normalizedRole] || [];
  const isActivePath = (path) => pathname === path || pathname.startsWith(path + '/');

  return (
    <div className={`sidebar-wrapper ${['instructor', 'admin'].includes(normalizedRole) ? 'sidebar-instructor' : ''}`}>
      {/* Role label */}
      <span className="sidebar-role">
        {roleLabel[normalizedRole] || `${normalizedRole} Portal`}
      </span>

      {/* Greeting and Role avatar */}
      <div className="sidebar-user-info">
        <div className="sidebar-greeting">
          <p className="greeting-text">Hello,</p>
          <h3 className="greeting-name">{firstName}!</h3>
        </div>
        <div className="avatar-wrapper">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(safeIdentity)}&background=0056D2&color=fff&size=36&font-size=0.45&bold=true`}
            alt="User"
            className="sidebar-avatar"
          />
        </div>
      </div>

      {/* Navigation items */}
      <ul className="sidebar-nav">
        {roleItems.map((item, i) => (
          <li key={i}>
            <Link
              to={item.path}
              className={`sidebar-link ${isActivePath(item.path) ? 'active' : ''}`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          </li>
        ))}
      </ul>

      {/* Logout button */}
      <div className="sidebar-footer">
        {normalizedRole === 'instructor' && (
          <Link
            to="/instructor/create"
            className={`sidebar-create-btn ${isActivePath('/instructor/create') || isActivePath('/instructor/courses') ? 'active' : ''}`}
          >
            <FiPlus size={18} />
            Create New Course
          </Link>
        )}
        <button onClick={handleLogout} className="sidebar-logout-btn">
          <FiLogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;