import React from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiCompass, FiLogIn, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '72px',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 1rem',
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.55rem',
          textDecoration: 'none',
          fontSize: '1.12rem',
          fontWeight: 800,
          color: '#0f172a',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            display: 'grid',
            placeContent: 'center',
            background: '#e0ecff',
            color: '#1d4ed8',
          }}
        >
          <FiBookOpen />
        </span>
        LMS-Pro
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link
          to="/browse"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#334155',
            fontWeight: 700,
            textDecoration: 'none',
            padding: '0.4rem 0.6rem',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <FiCompass />
          Browse
        </Link>
        {user ? (
          <>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '0.45rem 0.65rem',
                borderRadius: '999px',
                color: '#334155',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              <FiUser />
              {user.name}
            </span>
            <button
              onClick={logout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                borderRadius: '10px',
                padding: '0.55rem 0.95rem',
                fontWeight: 700,
                background: '#eef2ff',
                color: '#1e3a8a',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <FiLogOut />
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              borderRadius: '10px',
              padding: '0.55rem 0.95rem',
              fontWeight: 700,
              textDecoration: 'none',
              background: '#1d4ed8',
              color: '#ffffff',
              whiteSpace: 'nowrap',
            }}
          >
            <FiLogIn />
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;