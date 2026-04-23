import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiBookOpen,
  FiClock,
  FiGrid,
  FiPlusSquare,
  FiShield,
  FiUsers,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  // Guard: render nothing if user is not logged in
  if (!user) return null;

  const menuItems = {
    student: [
      { name: 'My Learning', path: '/my-learning', icon: FiBookOpen },
      { name: 'History', path: '/history', icon: FiClock },
    ],
    instructor: [
      { name: 'Dashboard', path: '/instructor/dashboard', icon: FiGrid },
      { name: 'Manage Courses', path: '/instructor/courses', icon: FiPlusSquare },
    ],
    admin: [
      { name: 'Admin Dashboard', path: '/admin/dashboard', icon: FiShield },
      { name: 'Users', path: '/admin/users', icon: FiUsers },
    ],
  };

  const roleLabel = {
    student: 'Student Portal',
    instructor: 'Instructor Portal',
    admin: 'Admin Portal',
  };

  const roleItems = menuItems[user.role] || [];
  const isActivePath = (path) => pathname === path || pathname.startsWith(path + '/');

  return (
    <div className="sidebar-wrapper">
      {/* Role label */}
      <span className="sidebar-role">
        {roleLabel[user.role] || `${user.role} Portal`}
      </span>

      {/* Role avatar */}
      <div className="sidebar-user-info">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0056D2&color=fff&size=36&font-size=0.45&bold=true`}
          alt="User"
          className="sidebar-avatar"
        />
        <span className="sidebar-username">{user.name}</span>
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
    </div>
  );
};

export default Sidebar;