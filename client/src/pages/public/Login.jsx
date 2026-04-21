import React, { useState } from 'react';
import { FiLogIn, FiLock, FiMail, FiUser, FiUserPlus } from 'react-icons/fi';
import { useAuthActions } from '../../hooks/useAuth';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { handleLogin } = useAuthActions();

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin({ email, password });
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h2 className="auth-title">
          {isLogin ? <FiLogIn /> : <FiUserPlus />} {isLogin ? 'Welcome Back' : 'Sign Up'}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          {isLogin ? 'Log in to continue your learning journey.' : 'Create an account to start learning.'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <label className="field">
              <FiUser />
              <input
                type="text"
                placeholder="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}

          <label className="field">
            <FiMail />
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="field">
            <FiLock />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', width: '100%' }}>
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div className="role-message">
          <strong>Role Detection Active:</strong> Logging in with <code>admin@...</code> redirects to Admin Dashboard. Using <code>instructor@...</code> goes to Instructor Dashboard. Otherwise, you'll enter the Student area.
        </div>

        <p className="auth-switch">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button type="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;