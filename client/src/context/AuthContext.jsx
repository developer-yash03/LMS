import React, { createContext, useCallback, useMemo, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('lms_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Keep localStorage in sync whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('lms_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lms_user');
      localStorage.removeItem('lms_token');
    }
  }, [user]);

  // Stable login — wrapped in useCallback so the reference never changes
  const login = useCallback((userData) => {
    setUser(userData);
    if (userData?.token) {
      localStorage.setItem('lms_token', userData.token);
    }
  }, []);

  // Stable logout — wrapped in useCallback so the reference never changes
  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // Include login & logout in the dependency array now that they are stable
  const authValue = useMemo(
    () => ({ user, login, logout }),
    [user, login, logout]
  );

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;