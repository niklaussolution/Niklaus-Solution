import { Navigate } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const StudentProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useStudent();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/student/login" replace />;
  }

  return <>{children}</>;
};
