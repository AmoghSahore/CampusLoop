import { Navigate } from 'react-router-dom';
import { isAdminAuthenticated } from '../services/adminAuth.js';

const ProtectedRoute = ({ children }) => {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
