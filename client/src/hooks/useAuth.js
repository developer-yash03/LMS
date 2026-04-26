import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiRequest } from '../services/api';
import { getDashboardRoute } from '../utils/authValidation';

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

  const handleLogin = async (credentials) => {
    try {
      const data = await apiRequest('/auth/login', 'POST', credentials);
      
      const loggedUser = {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token,
      };

      login(loggedUser);
      showToast(`Welcome back, ${loggedUser.name}!`);

      // Normalize role before redirect to avoid casing mismatches from API
      const normalizedRole = String(loggedUser.role || 'student').toLowerCase();
      navigate(getDashboardRoute(normalizedRole));
    } catch (error) {
      showToast(error.message || "Login failed", "error");
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully!', 'info');
    navigate('/');
  };

  return { user, handleLogin, handleLogout };
};