import { Navigate } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const StudentProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useStudent();

  if (!isAuthenticated) {
    return <Navigate to="/student/login" replace />;
  }

  return <>{children}</>;
};
