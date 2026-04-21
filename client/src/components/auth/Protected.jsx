import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const Protected = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default Protected;