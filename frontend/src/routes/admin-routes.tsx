import { useContext, type JSX } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { isLoggedIn, loading, isAdmin } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!isLoggedIn) {
    return <Navigate to={`/signin?redirectedTo=${location.pathname}`} replace />;
  }

  if (!isAdmin) {
    return <Navigate to={`/`} replace />;
  }

  return children;
};

export default AdminRoute;
