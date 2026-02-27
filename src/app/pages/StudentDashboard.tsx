import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  enrolledWorkshops?: string[];
  certificates?: string[];
  bio?: string;
}

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        if (!token) {
          navigate('/student/login');
          return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        const response = await axios.get(
          `${apiUrl}/auth/student/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStudent(response.data);
      } catch (err: any) {
        setError('Failed to load profile');
        if (err.response?.status === 401) {
          localStorage.removeItem('studentToken');
          navigate('/student/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentName');
    navigate('/student/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Welcome, {student?.name}!</h1>
            <p className="text-gray-600 mt-2">Manage your courses and track your progress</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Profile Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm">Name</p>
                <p className="text-gray-800 font-semibold">{student?.name}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Email</p>
                <p className="text-gray-800 font-semibold">{student?.email}</p>
              </div>
              {student?.phone && (
                <div>
                  <p className="text-gray-600 text-sm">Phone</p>
                  <p className="text-gray-800 font-semibold">{student.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Enrolled Workshops */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Enrolled Workshops</h3>
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-blue-600">
                {student?.enrolledWorkshops?.length || 0}
              </p>
              <p className="text-gray-600 mt-2">Active Workshops</p>
            </div>
          </div>

          {/* Certificates */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Certificates</h3>
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-green-600">
                {student?.certificates?.length || 0}
              </p>
              <p className="text-gray-600 mt-2">Earned Certificates</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/workshops')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold transition text-center"
          >
            Explore Workshops
          </button>
          <button
            onClick={() => navigate('/student/certificate')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-semibold transition text-center"
          >
            View Certificates
          </button>
        </div>
      </div>
    </div>
  );
};
