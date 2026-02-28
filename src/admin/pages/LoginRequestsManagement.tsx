import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle,
  XCircle,
  Search,
  Filter,
  AlertCircle,
  Clock,
  Monitor,
  Globe,
  LogOut,
  Trash2,
} from 'lucide-react';
import { db } from '../../config/firebase';
import { collection, getDocs, updateDoc, doc, query, where, deleteDoc } from 'firebase/firestore';

interface LoginRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  createdAt: any;
  updatedAt?: any;
  approved: boolean;
  rejected?: boolean;
  ipAddress?: string;
  deviceName?: string;
  lastLoginTime?: any;
  status?: string;
}

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
}

const formatDate = (date: any): string => {
  if (!date) return 'N/A';
  try {
    if (date.toDate && typeof date.toDate === 'function') {
      return new Date(date.toDate()).toLocaleString();
    }
    if (date instanceof Date) {
      return date.toLocaleString();
    }
    if (typeof date === 'number') {
      return new Date(date).toLocaleString();
    }
    return 'N/A';
  } catch (error) {
    return 'N/A';
  }
};

export const LoginRequestsManagement: React.FC = () => {
  const { admin } = useAuth();
  const [requests, setRequests] = useState<LoginRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    if (admin) {
      fetchLoginRequests();
      // Refresh every 5 seconds to show real-time updates
      const interval = setInterval(fetchLoginRequests, 5000);
      return () => clearInterval(interval);
    }
  }, [admin]);

  const fetchLoginRequests = async () => {
    try {
      setLoading(true);
      const requestsCollection = collection(db, 'loginRequests');
      const snapshot = await getDocs(requestsCollection);

      const requestsData: LoginRequest[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        studentId: doc.data().studentId || 'N/A',
        studentName: doc.data().studentName || 'N/A',
        studentEmail: doc.data().studentEmail || 'N/A',
        createdAt: doc.data().createdAt,
        updatedAt: doc.data().updatedAt,
        approved: doc.data().approved || false,
        rejected: doc.data().rejected || false,
        ipAddress: doc.data().ipAddress || 'Unknown',
        deviceName: doc.data().deviceName || 'Unknown',
        lastLoginTime: doc.data().lastLoginTime,
        status: doc.data().status || (doc.data().approved ? 'approved' : doc.data().rejected ? 'rejected' : 'pending'),
      }));

      setRequests(requestsData);

      // Unique student count (though documents are now unique per studentId)
      const uniqueRequests = requestsData;

      // Calculate stats
      const pending = uniqueRequests.filter((r) => !r.approved && !r.rejected).length;
      const approved = uniqueRequests.filter((r) => r.approved).length;
      const rejected = uniqueRequests.filter((r) => r.rejected).length;

      setStats({ pending, approved, rejected });
    } catch (error) {
      console.error('Error fetching login requests:', error);
      alert('Error loading login requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLogin = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'loginRequests', requestId), {
        approved: true,
        rejected: false,
        approvedAt: new Date(),
      });

      alert('Login approved!');
      fetchLoginRequests();
    } catch (error) {
      console.error('Error approving login:', error);
      alert('Error approving login. Please try again.');
    }
  };

  const handleRejectLogin = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'loginRequests', requestId), {
        approved: false,
        rejected: true,
        rejectedAt: new Date(),
      });

      alert('Login rejected!');
      fetchLoginRequests();
    } catch (error) {
      console.error('Error rejecting login:', error);
      alert('Error rejecting login. Please try again.');
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to delete this login request?')) return;
    try {
      await deleteDoc(doc(db, 'loginRequests', requestId));
      alert('Request deleted!');
      fetchLoginRequests();
    } catch (error) {
      console.error('Error deleting login request:', error);
      alert('Error deleting request.');
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'pending') {
      return !request.approved && !request.rejected && matchesSearch;
    } else if (filterStatus === 'approved') {
      return request.approved && matchesSearch;
    } else if (filterStatus === 'rejected') {
      return request.rejected && matchesSearch;
    }

    return matchesSearch;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading login requests...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Login Requests</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <Clock className="text-yellow-600" size={24} />
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

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <XCircle className="text-red-600" size={24} />
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All Requests</option>
              </select>
            </div>

            <button
              onClick={fetchLoginRequests}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Login Requests List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg">No login requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Student Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Network & Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="font-medium text-gray-900">{request.studentName}</p>
                          <p className="text-sm text-gray-500">{request.studentEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Globe size={14} className="text-blue-500" />
                            <span>{request.ipAddress}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Monitor size={14} className="text-purple-500" />
                            <span className="truncate max-w-[200px]" title={request.deviceName}>
                              {request.deviceName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex flex-col">
                          <span>Requested: {formatDate(request.createdAt)}</span>
                          {request.lastLoginTime && (
                            <span className="text-xs text-gray-400">
                              Active: {formatDate(request.lastLoginTime)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.approved ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <CheckCircle size={16} />
                            Approved
                          </span>
                        ) : request.rejected ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            <XCircle size={16} />
                            Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            <Clock size={16} />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {!request.approved && !request.rejected && (
                            <>
                              <button
                                onClick={() => handleApproveLogin(request.id)}
                                className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition"
                              >
                                <CheckCircle size={16} />
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectLogin(request.id)}
                                className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                              >
                                <XCircle size={16} />
                                Reject
                              </button>
                            </>
                          )}
                          {request.approved && (
                            <button
                              onClick={() => handleRejectLogin(request.id)}
                              className="inline-flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition"
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                          )}
                          {request.rejected && (
                            <button
                              onClick={() => handleApproveLogin(request.id)}
                              className="inline-flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition"
                            >
                              <CheckCircle size={16} />
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="inline-flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded text-sm transition"
                            title="Delete Request"
                          >
                            <Trash2 size={16} />
                          </button>
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
