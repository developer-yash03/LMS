import { useContext } from 'react';
import AuthContext from '../context/auth-context';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};

export const useAuthActions = () => {
  const { user, login, logout } = useAuth();

  const handleLogin = async (credentials) => {
    // MOCK LOGIC: In real app, call your Node.js API here
    console.log("Logging in with:", credentials);
    
    const mockUser = {
      id: "123",
      name: "Sujal",
      email: credentials.email,
      role: "student", // Change to 'instructor' or 'admin' to test dashboards
      token: "mock-jwt-token"
    };

    localStorage.setItem("token", mockUser.token);
    login(mockUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    logout();
  };

  return { user, handleLogin, handleLogout };
};