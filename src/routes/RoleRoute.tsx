import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface RoleRouteProps {
  roles: string[];
}

const RoleRoute = ({ roles }: RoleRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
//adding comments 