import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { useStudent } from '../context/StudentContext';
import { Menu, X, LogOut, User, BookOpen, Award } from 'lucide-react';

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
  const { logout } = useStudent();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        const studentId = localStorage.getItem('studentId');

        if (!token || !studentId) {
          navigate('/student/login');
          return;
        }

        // Get student data from Firestore
        const studentDoc = await getDoc(doc(db, 'students', studentId));

        if (!studentDoc.exists()) {
          setError('Student profile not found');
          navigate('/student/login');
          return;
        }

        const studentData = studentDoc.data();

        setStudent({
          id: studentDoc.id,
          name: studentData.name,
          email: studentData.email,
          phone: studentData.phone,
          enrolledWorkshops: studentData.enrolledWorkshops,
          certificates: studentData.certificates,
          bio: studentData.bio,
        });
      } catch (err: any) {
        setError('Failed to load profile');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      navigate('/student/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/student/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out z-40 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">Student Portal</h1>
          <p className="text-sm text-gray-600 mt-2">Welcome back!</p>
        </div>

        <nav className="p-4 space-y-2">
          <button className="w-full text-left px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-semibold flex items-center gap-3">
            <User size={20} />
            My Profile
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-3">
            <BookOpen size={20} />
            My Enrolled Workshops
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-3">
            <Award size={20} />
            My Certificates
          </button>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <div className="bg-white shadow-md px-4 sm:px-6 py-4 flex items-center justify-between md:hidden">
          <h1 className="text-xl font-bold text-gray-800">Student Dashboard</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{student?.name}</h2>
            <p className="text-gray-600 mb-4">{student?.email}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Email</p>
                <p className="text-gray-800 font-semibold">{student?.email}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Phone</p>
                <p className="text-gray-800 font-semibold">{student?.phone || 'Not set'}</p>
              </div>
            </div>
          </div>

          {/* Workshops Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enrolled Workshops */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen size={24} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800">Enrolled Workshops</h3>
              </div>
              <div className="text-gray-600">
                {student?.enrolledWorkshops && student.enrolledWorkshops.length > 0 ? (
                  <ul className="space-y-2">
                    {student.enrolledWorkshops.map((workshop, index) => (
                      <li key={index} className="p-3 bg-blue-50 rounded-lg">
                        {workshop}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No workshops enrolled yet</p>
                )}
              </div>
            </div>

            {/* Certificates Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award size={24} className="text-green-600" />
                <h3 className="text-xl font-bold text-gray-800">Certificates</h3>
              </div>
              <div className="text-gray-600">
                {student?.certificates && student.certificates.length > 0 ? (
                  <ul className="space-y-2">
                    {student.certificates.map((cert, index) => (
                      <li key={index} className="p-3 bg-green-50 rounded-lg">
                        {cert}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No certificates earned yet</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
