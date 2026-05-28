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
  Info,
  Maximize,
  Compass,
  Cpu,
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
  browser?: string;
  os?: string;
  screenResolution?: string;
  language?: string;
  timezone?: string;
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
      // Fetch immediately on mount (sets loading true)
      fetchLoginRequests(true);
      // Refresh every 5 seconds silently
      const interval = setInterval(() => fetchLoginRequests(false), 5000);
      return () => clearInterval(interval);
    }
  }, [admin]);

  const fetchLoginRequests = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
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
        browser: doc.data().browser || 'Unknown',
        os: doc.data().os || 'Unknown',
        screenResolution: doc.data().screenResolution || 'Unknown',
        language: doc.data().language || 'Unknown',
        timezone: doc.data().timezone || 'Unknown',
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
      // alert('Error loading login requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLogin = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'loginRequests', requestId), {
        approved: true,
        rejected: false,
        updatedAt: new Date(),
        approvedAt: new Date(),
      });

      alert('Login approved!');
      fetchLoginRequests(false);
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
        updatedAt: new Date(),
        rejectedAt: new Date(),
      });

      alert('Login rejected!');
      fetchLoginRequests(false);
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
      fetchLoginRequests(false);
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
              onClick={() => fetchLoginRequests(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Login Requests Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
              <p className="text-lg">No login requests found matching your filters</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {/* Card Header - Student Identity */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md border border-white/30 text-2xl font-bold">
                      {request.studentName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{request.studentName}</h3>
                      <p className="text-blue-100 flex items-center gap-2">
                        <Globe size={14} /> {request.studentEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {request.approved ? (
                      <span className="px-4 py-1.5 rounded-full bg-green-400/20 text-green-100 border border-green-400/30 text-sm font-semibold flex items-center gap-2">
                        <CheckCircle size={18} /> Approved Session
                      </span>
                    ) : request.rejected ? (
                      <span className="px-4 py-1.5 rounded-full bg-red-400/20 text-red-100 border border-red-400/30 text-sm font-semibold flex items-center gap-2">
                        <XCircle size={18} /> Request Rejected
                      </span>
                    ) : (
                      <span className="px-4 py-1.5 rounded-full bg-yellow-400/20 text-yellow-100 border border-yellow-400/30 text-sm font-semibold flex items-center gap-2 animate-pulse">
                        <Clock size={18} /> Awaiting Admin Approval
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body - Grid Layout */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Column 1: Network & Security */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-900 font-bold border-b pb-2">
                        <Globe size={18} className="text-blue-600" />
                        Network Details
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">IP Address</span>
                          <span className="font-mono font-semibold text-gray-800 bg-gray-50 px-2 py-1 rounded border border-gray-100">{request.ipAddress}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Timezone</span>
                          <span className="text-gray-800 font-medium">{request.timezone || 'Not Captured'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Locale Language</span>
                          <span className="text-gray-800 font-medium uppercase">{request.language || 'en-US'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Device Specification */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-900 font-bold border-b pb-2">
                        <Monitor size={18} className="text-purple-600" />
                        Device Specification
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Operating System</span>
                          <span className="text-gray-800 font-semibold flex items-center gap-1.5">
                            <Cpu size={14} className="text-gray-400" /> {request.os}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Browser Engine</span>
                          <span className="text-gray-800 font-medium flex items-center gap-1.5">
                            <Compass size={14} className="text-gray-400" /> {request.browser}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Display Resolution</span>
                          <span className="text-gray-800 font-medium flex items-center gap-1.5">
                            <Maximize size={14} className="text-gray-400" /> {request.screenResolution}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Timeline & Audit */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-900 font-bold border-b pb-2">
                        <Clock size={18} className="text-orange-500" />
                        Session Timeline
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 font-medium">Initial Request</span>
                          <span className="text-gray-700">{formatDate(request.createdAt)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 font-medium">Last Interaction</span>
                          <span className="text-gray-700">{request.lastLoginTime ? formatDate(request.lastLoginTime) : 'Session Ended'}</span>
                        </div>
                        {request.updatedAt && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium">Last Status Sync</span>
                            <span className="text-gray-700">{formatDate(request.updatedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-8 pt-6 border-t flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-3">
                      {!request.approved && (
                        <button
                          onClick={() => handleApproveLogin(request.id)}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all active:scale-95"
                        >
                          <CheckCircle size={20} /> Approve Student
                        </button>
                      )}
                      {!request.rejected && (
                        <button
                          onClick={() => handleRejectLogin(request.id)}
                          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all active:scale-95 ${
                            request.approved ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                        >
                          <XCircle size={20} /> {request.approved ? 'Revoke Access' : 'Reject Request'}
                        </button>
                      )}
                      {request.rejected && (
                        <button
                          onClick={() => handleApproveLogin(request.id)}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all active:scale-95"
                        >
                          <CheckCircle size={20} /> Restore Access
                        </button>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleDeleteRequest(request.id)}
                      className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-5 py-2.5 rounded-xl font-bold border border-red-100 transition-all"
                    >
                      <Trash2 size={20} /> Purge Audit Record
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
