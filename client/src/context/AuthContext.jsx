import React, { useMemo, useState } from 'react';
import AuthContext from './auth-context';

export const AuthProvider = ({ children }) => {
  // For now, we manually set a user to test. Later, this comes from Backend/JWT.
  const [user, setUser] = useState({ name: "Sujal", role: "student" }); // Roles: 'student', 'instructor', 'admin'

  const login = (userData) => setUser(userData);
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const authValue = useMemo(
    () => ({ user, login, logout }),
    [user]
  );

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};