import { useAuth } from '../../hooks/useAuth';
import { Link, Navigate } from 'react-router-dom';
import { FiHome, FiShieldOff } from 'react-icons/fi';

const RoleGate = ({ children, role }) => {
  const { user } = useAuth();

  // If not logged in, go to login
  if (!user) return <Navigate to="/login" replace />;

  // If user's role doesn't match the required role, show an enterprise access panel
  if (user.role !== role) {
    return (
      <section className="rolegate-wrap">
        <div className="rolegate-card shadow-soft-sm">
          <div className="rolegate-badge">
            <FiShieldOff />
          </div>
          <h2 className="rolegate-title">Access restricted</h2>
          <p className="rolegate-text">
            You need <strong>{role}</strong> permissions to view this area.
          </p>
          <div className="rolegate-actions">
            <Link to="/" className="btn btn-primary">
              <FiHome /> Back to Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return children;
};

export default RoleGate;