import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle,
  XCircle,
  Search,
  Filter,
  AlertCircle,
  Download,
} from 'lucide-react';
import { db } from '../../config/firebase';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: any;
  approved: boolean;
  paymentStatus: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
}

export const StudentManagement: React.FC = () => {
  const { admin } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterApproved, setFilterApproved] = useState('all');
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    approved: 0,
  });

  useEffect(() => {
    if (admin) {
      fetchStudents();
    }
  }, [admin]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const studentsCollection = collection(db, 'students');
      const snapshot = await getDocs(studentsCollection);

      const studentsData: Student[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || 'N/A',
        email: doc.data().email || 'N/A',
        phone: doc.data().phone || 'N/A',
        createdAt: doc.data().createdAt,
        approved: doc.data().approved || false,
        paymentStatus: doc.data().paymentStatus || 'pending',
      }));

      setStudents(studentsData);

      // Calculate stats
      const total = studentsData.length;
      const pending = studentsData.filter((s) => !s.approved).length;
      const approved = studentsData.filter((s) => s.approved).length;

      setStats({ total, pending, approved });
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Error loading students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveStudent = async (studentId: string) => {
    try {
      await updateDoc(doc(db, 'students', studentId), {
        approved: true,
      });

      // Update local state
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId ? { ...s, approved: true } : s
        )
      );

      alert('Student approved successfully!');
      fetchStudents();
    } catch (error) {
      console.error('Error approving student:', error);
      alert('Error approving student. Please try again.');
    }
  };

  const handleRejectStudent = async (studentId: string) => {
    try {
      await updateDoc(doc(db, 'students', studentId), {
        approved: false,
      });

      alert('Student rejected successfully!');
      fetchStudents();
    } catch (error) {
      console.error('Error rejecting student:', error);
      alert('Error rejecting student. Please try again.');
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterApproved === 'pending') {
      return !student.approved && matchesSearch;
    } else if (filterApproved === 'approved') {
      return student.approved && matchesSearch;
    }

    return matchesSearch;
  });

  const handleDownloadCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Created At'];
    const rows = filteredStudents.map((student) => [
      student.name,
      student.email,
      student.phone,
      student.approved ? 'Approved' : 'Pending',
      new Date(student.createdAt?.toDate?.()).toLocaleDateString() || 'N/A',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading students...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Student Management</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <AlertCircle className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <AlertCircle className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <select
                value={filterApproved}
                onChange={(e) => setFilterApproved(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Students</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
              </select>
            </div>

            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Download size={20} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-medium text-gray-900">{student.name}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {student.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.approved ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <CheckCircle size={16} />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            <AlertCircle size={16} />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {student.createdAt
                          ? new Date(student.createdAt.toDate()).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {!student.approved ? (
                            <>
                              <button
                                onClick={() => handleApproveStudent(student.id)}
                                className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition"
                              >
                                <CheckCircle size={16} />
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectStudent(student.id)}
                                className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                              >
                                <XCircle size={16} />
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleRejectStudent(student.id)}
                              className="inline-flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition"
                            >
                              <XCircle size={16} />
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
