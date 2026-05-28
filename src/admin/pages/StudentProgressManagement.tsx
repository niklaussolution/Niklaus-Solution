import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Search, TrendingUp, AlertCircle } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  enrolledWorkshops: string[];
}

interface StudentProgressData {
  studentId: string;
  studentName: string;
  email: string;
  enrolledCourses: number;
  completedCourses: number;
  averageProgress: number;
  quizAttempts: number;
}

export const StudentProgressManagement: React.FC = () => {
  const { token } = useAuth();
  const [students, setStudents] = useState<StudentProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'enrolled'>('progress');

  useEffect(() => {
    fetchStudentProgress();
  }, []);

  const fetchStudentProgress = async () => {
    try {
      setLoading(true);
      const result = await api.getStudents();
      if (result.data) {
        // Process student data
        const processedStudents = result.data.map((student: any, idx: number) => ({
          studentId: student.id,
          studentName: student.name,
          email: student.email,
          enrolledCourses: student.enrolledWorkshops?.length || 0,
          completedCourses: student.certificates?.length || 0,
          averageProgress: Math.floor(Math.random() * 100), // Placeholder - should calculate from actual progress
          quizAttempts: Math.floor(Math.random() * 10), // Placeholder
        }));
        setStudents(processedStudents);
      }
    } catch (error) {
      setError('Error fetching student progress');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students
    .filter(student =>
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.studentName.localeCompare(b.studentName);
      if (sortBy === 'progress') return b.averageProgress - a.averageProgress;
      return b.enrolledCourses - a.enrolledCourses;
    });

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Student Progress Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor student learning progress and course activity</p>
          </div>

          {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg my-6">{error}</div>}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 my-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Total Students</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{students.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Active Learners</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{students.filter(s => s.enrolledCourses > 0).length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Avg Progress</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {Math.round(students.reduce((sum, s) => sum + s.averageProgress, 0) / students.length)}%
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Total Quiz Attempts</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{students.reduce((sum, s) => sum + s.quizAttempts, 0)}</p>
            </div>
          </div>

          {/* Filter & Sort */}
          <div className="my-6 flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="progress">Sort by Progress</option>
              <option value="name">Sort by Name</option>
              <option value="enrolled">Sort by Enrolled</option>
            </select>
          </div>

          {/* Students Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Enrolled</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Completed</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Progress</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Quizzes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.studentId} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">{student.studentName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600 text-sm">{student.email}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold">
                          {student.enrolledCourses}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 font-semibold">
                          {student.completedCourses}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
                              style={{ width: `${student.averageProgress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700 w-10 text-right">{student.averageProgress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-semibold">
                          {student.quizAttempts}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No students found</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default StudentProgressManagement;
