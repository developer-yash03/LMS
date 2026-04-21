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

  if (!user) return null; // No sidebar if logged out

  const menuItems = {
    student: [
      { name: 'My Learning', path: '/my-learning', icon: FiBookOpen },
      { name: 'History', path: '/history', icon: FiClock },
    ],
    instructor: [
      { name: 'Dashboard', path: '/instructor/dashboard', icon: FiGrid },
      { name: 'Create Course', path: '/instructor/create', icon: FiPlusSquare },
    ],
    admin: [
      { name: 'Admin Dashboard', path: '/admin/dashboard', icon: FiShield },
      { name: 'Users', path: '/admin/users', icon: FiUsers },
    ],
  };

  const roleItems = menuItems[user.role] || [];
  const isActivePath = (path) => pathname === path || pathname.startsWith(path + '/');

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '14px',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        color: '#e2e8f0',
        padding: '14px',
        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.2)',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          fontSize: '0.72rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#94a3b8',
          marginBottom: '0.65rem',
        }}
      >
        {user.role}
      </span>
      <h3 style={{ margin: '0 0 12px', fontSize: '1.05rem' }}>Dashboard</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
        {roleItems.map((item, i) => (
          <li key={i}>
            <Link
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                textDecoration: 'none',
                borderRadius: '10px',
                padding: '0.6rem 0.7rem',
                fontWeight: isActivePath(item.path) ? 800 : 600,
                background: isActivePath(item.path) ? '#2563eb' : 'transparent',
                color: '#e2e8f0',
                boxShadow: isActivePath(item.path)
                  ? '0 8px 16px rgba(37, 99, 235, 0.35)'
                  : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <item.icon />
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default Sidebar;