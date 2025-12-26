import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import {
  Trash2,
  Search,
  Plus,
  Edit,
  X,
  AlertCircle,
  Check,
  Clock,
  ChevronDown,
  Download,
} from 'lucide-react';
import { db } from '../config/firebase';
import { generateCertificatePDF } from '../../utils';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';

interface Certificate {
  id: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  certificateId: string;
  completionDate: string;
  dateOfBirth: string;
  issueDate: string;
  instructorName?: string;
  courseCode?: string;
  status: 'issued' | 'pending' | 'revoked';
  notes?: string;
  createdAt: number;
}

interface Stats {
  total: number;
  issued: number;
  pending: number;
  revoked: number;
}

export const CertificatesManagement: React.FC = () => {
  const { token } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'issued' | 'pending' | 'revoked'>('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    courseName: '',
    completionDate: '',
    dateOfBirth: '',
    instructorName: '',
    courseCode: '',
    status: 'issued' as 'issued' | 'pending' | 'revoked',
    notes: '',
  });

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const certificatesRef = collection(db, 'certificates');
      const snapshot = await getDocs(certificatesRef);
      const certData: Certificate[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setCertificates(certData);

      // Calculate stats
      const stats: Stats = {
        total: certData.length,
        issued: certData.filter((c) => c.status === 'issued').length,
        pending: certData.filter((c) => c.status === 'pending').length,
        revoked: certData.filter((c) => c.status === 'revoked').length,
      };
      setStats(stats);
    } catch (error) {
      setError('Error fetching certificates');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.courseName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || cert.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (
        !formData.studentName ||
        !formData.studentEmail ||
        !formData.courseName ||
        !formData.completionDate ||
        !formData.dateOfBirth
      ) {
        setError('Please fill in all required fields');
        return;
      }

      if (editingId) {
        await updateDoc(doc(db, 'certificates', editingId), {
          ...formData,
          updatedAt: Date.now(),
        });
        setSuccess('Certificate updated successfully!');
      } else {
        await addDoc(collection(db, 'certificates'), {
          ...formData,
          issueDate: new Date().toISOString(),
          certificateId: `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        setSuccess('Certificate created successfully!');
      }

      setFormData({
        studentName: '',
        studentEmail: '',
        courseName: '',
        completionDate: '',
        dateOfBirth: '',
        instructorName: '',
        courseCode: '',
        status: 'issued',
        notes: '',
      });
      setEditingId(null);
      setShowForm(false);
      fetchCertificates();
    } catch (error) {
      setError('Error saving certificate');
      console.error(error);
    }
  };

  const handleEdit = (cert: Certificate) => {
    setFormData({
      studentName: cert.studentName,
      studentEmail: cert.studentEmail,
      courseName: cert.courseName,
      completionDate: cert.completionDate,
      dateOfBirth: cert.dateOfBirth,
      instructorName: cert.instructorName || '',
      courseCode: cert.courseCode || '',
      status: cert.status,
      notes: cert.notes || '',
    });
    setEditingId(cert.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;

    try {
      await deleteDoc(doc(db, 'certificates', id));
      setSuccess('Certificate deleted successfully!');
      fetchCertificates();
    } catch (error) {
      setError('Error deleting certificate');
      console.error(error);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      studentName: '',
      studentEmail: '',
      courseName: '',
      completionDate: '',
      dateOfBirth: '',
      instructorName: '',
      courseCode: '',
      status: 'issued',
      notes: '',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'issued':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'revoked':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued':
        return 'bg-green-50 text-green-700';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700';
      case 'revoked':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Certificates Management</h1>
          <button
            onClick={() => {
              if (showForm) {
                handleCloseForm();
              } else {
                setShowForm(true);
              }
            }}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            <Plus className="w-5 h-5" />
            {showForm ? 'Cancel' : 'Issue Certificate'}
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
              <p className="text-gray-600 text-sm font-medium">Total Certificates</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
              <p className="text-gray-600 text-sm font-medium">Issued</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.issued}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
              <p className="text-gray-600 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
              <p className="text-gray-600 text-sm font-medium">Revoked</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.revoked}</p>
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Inline Form Section */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingId ? 'Edit Certificate' : 'Issue New Certificate'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Student Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentName}
                    onChange={(e) =>
                      setFormData({ ...formData, studentName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Student Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.studentEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, studentEmail: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Course Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.courseName}
                    onChange={(e) =>
                      setFormData({ ...formData, courseName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Course Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={formData.courseCode}
                    onChange={(e) =>
                      setFormData({ ...formData, courseCode: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Completion Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Completion Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.completionDate}
                    onChange={(e) =>
                      setFormData({ ...formData, completionDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Instructor Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructor Name
                  </label>
                  <input
                    type="text"
                    value={formData.instructorName}
                    onChange={(e) =>
                      setFormData({ ...formData, instructorName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'issued' | 'pending' | 'revoked',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="issued">Issued</option>
                    <option value="pending">Pending</option>
                    <option value="revoked">Revoked</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                >
                  {editingId ? 'Update Certificate' : 'Issue Certificate'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or certificate ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="issued">Issued</option>
              <option value="pending">Pending</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
        </div>

        {/* Certificates Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading certificates...</div>
          ) : filteredCertificates.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No certificates found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Certificate ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Completion Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCertificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{cert.studentName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{cert.studentEmail}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{cert.courseName}</td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        {cert.certificateId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(cert.completionDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            cert.status
                          )}`}
                        >
                          {getStatusIcon(cert.status)}
                          {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          onClick={() => handleEdit(cert)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cert.id)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            // Download PDF for this certificate
                            await generateCertificatePDF({
                              studentName: cert.studentName,
                              courseName: cert.courseName || 'WEB DEVELOPMENT',
                              completionDate: cert.completionDate,
                              certificateId: cert.certificateId,
                              companyLogo: '/logo.png',
                              signature: '/signature.png',
                              companyName: 'NIKLAUS SOLUTIONS',
                             });
                          }}
                          className="text-green-600 hover:text-green-800 transition"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
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

export default CertificatesManagement;
