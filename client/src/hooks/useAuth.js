import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};

export const useAuthActions = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  /**
   * Role Detection Logic:
   *  - Email starts with "admin"      → admin role
   *  - Email starts with "instructor" → instructor role
   *  - Everything else                → student role
   */
  const handleLogin = (credentials) => {
    const email = credentials.email.toLowerCase();

    let role = 'student';
    if (email.startsWith('admin')) role = 'admin';
    else if (email.startsWith('instructor')) role = 'instructor';

    const mockUser = {
      id: Date.now().toString(),
      name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
      email: credentials.email,
      role,
      token: 'mock-jwt-' + Date.now(),
    };

    login(mockUser);
    showToast(`Welcome back, ${mockUser.name}!`);

    // Navigate to role-appropriate dashboard
    const dashboardRoutes = {
      admin: '/admin/dashboard',
      instructor: '/instructor/dashboard',
      student: '/my-learning',
    };
    navigate(dashboardRoutes[role] || '/');
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully!', 'info');
    navigate('/');
  };

  return { user, handleLogin, handleLogout };
};