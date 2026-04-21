import React, { useState } from 'react';
import { FiLogIn, FiLock, FiMail, FiUser, FiUserPlus } from 'react-icons/fi';
import { useAuthActions } from '../../hooks/useAuth';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const { handleLogin } = useAuthActions();

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin({ email, password: 'password123' });
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h2 className="auth-title">
          {isLogin ? <FiLogIn /> : <FiUserPlus />} {isLogin ? 'Login' : 'Sign Up'}
        </h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <label className="field">
              <FiUser />
              <input type="text" placeholder="Full Name" required />
            </label>
          )}

          <label className="field">
            <FiMail />
            <input
              type="email"
              placeholder="Email Address"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="field">
            <FiLock />
            <input type="password" placeholder="Password" required />
          </label>

          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>
            {isLogin ? <FiLogIn /> : <FiUserPlus />}
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

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