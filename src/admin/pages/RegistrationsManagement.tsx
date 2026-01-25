import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import {
  Trash2,
  Search,
  Filter,
  AlertCircle,
  X,
  Download,
  Plus,
} from 'lucide-react';
import { db } from '../config/firebase';
import { collection, getDocs, deleteDoc, doc, query, where, addDoc, updateDoc, increment } from 'firebase/firestore';

interface Registration {
  id: string;
  userName: string;
  email: string;
  phone: string;
  organization: string;
  workshopId: string;
  workshopTitle: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  paymentStatus: 'Pending' | 'Completed' | 'Cancelled';
  amount: number;
  createdAt: number;
}

interface Workshop {
  id: string;
  title: string;
  price: number;
}

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
}

interface AddRegistrationForm {
  userName: string;
  email: string;
  phone: string;
  organization: string;
  workshopId: string;
  workshopTitle: string;
  amount: number;
  status: 'Pending' | 'Confirmed';
  paymentStatus: 'Pending' | 'Completed';
}

export const RegistrationsManagement: React.FC = () => {
  const { token } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pending' | 'Confirmed' | 'Cancelled'>('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AddRegistrationForm>({
    userName: '',
    email: '',
    phone: '',
    organization: '',
    workshopId: '',
    workshopTitle: '',
    amount: 0,
    status: 'Confirmed',
    paymentStatus: 'Completed',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchRegistrations(), fetchWorkshops()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const registrationsRef = collection(db, 'registrations');
      const snapshot = await getDocs(registrationsRef);
      const regData: Registration[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setRegistrations(regData);

      // Calculate stats
      const stats: Stats = {
        total: regData.length,
        pending: regData.filter((r) => r.status === 'Pending').length,
        confirmed: regData.filter((r) => r.status === 'Confirmed').length,
        cancelled: regData.filter((r) => r.status === 'Cancelled').length,
      };
      setStats(stats);
    } catch (error) {
      setError('Error fetching registrations');
      console.error(error);
    }
  };

  const fetchWorkshops = async () => {
    try {
      const workshopsRef = collection(db, 'workshops');
      const snapshot = await getDocs(workshopsRef);
      const workshopData: Workshop[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
        price: doc.data().price || 0,
      }));
      setWorkshops(workshopData);
    } catch (error) {
      console.error('Error fetching workshops:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this registration?'))
      return;

    try {
      await deleteDoc(doc(db, 'registrations', id));
      setSuccess('Registration deleted successfully!');
      fetchRegistrations();
    } catch (error) {
      setError('Error deleting registration');
      console.error(error);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.userName.trim()) errors.userName = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = 'Invalid email format';
    if (!formData.phone.trim()) errors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, '')))
      errors.phone = 'Phone must be 10 digits';
    if (!formData.organization.trim()) errors.organization = 'Organization is required';
    if (!formData.workshopId) errors.workshopId = 'Workshop is required';
    if (formData.amount <= 0) errors.amount = 'Amount must be greater than 0';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Starting registration process with data:', formData);
      
      // Add registration directly to Firestore
      const registrationData = {
        userName: formData.userName,
        email: formData.email,
        phone: formData.phone,
        organization: formData.organization,
        workshopId: formData.workshopId,
        workshopTitle: formData.workshopTitle,
        amount: formData.amount,
        status: formData.status,
        paymentStatus: formData.paymentStatus,
        registrationDate: new Date().toISOString(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      console.log('Adding registration to collection...');
      const regRef = await addDoc(collection(db, 'registrations'), registrationData);
      console.log('Registration added successfully with ID:', regRef.id);

      // Increment the workshop's enrolled count
      if (formData.workshopId) {
        try {
          const workshopRef = doc(db, 'workshops', formData.workshopId);
          console.log('Incrementing enrolled count for workshop:', formData.workshopId);
          await updateDoc(workshopRef, {
            enrolled: increment(1),
          });
          console.log('Workshop enrolled count updated successfully');
        } catch (workshopErr) {
          console.warn('Warning: Could not update workshop enrolled count:', workshopErr);
          // Don't fail the entire operation if workshop update fails
        }
      }

      setSuccess('Registration added successfully!');
      console.log('Success message displayed');
      
      // Reset form
      setFormData({
        userName: '',
        email: '',
        phone: '',
        organization: '',
        workshopId: '',
        workshopTitle: '',
        amount: 0,
        status: 'Confirmed',
        paymentStatus: 'Completed',
      });
      setFormErrors({});
      setShowAddModal(false);
      
      // Refresh the registrations list
      await fetchRegistrations();
      console.log('Registrations list refreshed');
    } catch (err: any) {
      console.error('Error adding registration:', err);
      const errorMessage = err?.message || 'Error adding registration. Please try again.';
      setError(errorMessage);
      
      // Log more detailed error information
      if (err?.code) {
        console.error('Error code:', err.code);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRegistrations(filteredRegistrations.map((r) => r.id));
    } else {
      setSelectedRegistrations([]);
    }
  };

  const handleSelectRegistration = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRegistrations([...selectedRegistrations, id]);
    } else {
      setSelectedRegistrations(
        selectedRegistrations.filter((rid) => rid !== id)
      );
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Organization',
      'Workshop',
      'Status',
      'Registration Date',
    ];

    const rows = filteredRegistrations.map((reg) => [
      reg.userName,
      reg.email,
      reg.phone,
      reg.organization,
      reg.workshopTitle,
      reg.status,
      new Date(reg.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${Date.now()}.csv`;
    a.click();
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.phone.includes(searchTerm) ||
      reg.workshopTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || reg.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Confirmed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-3 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Registrations</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage user registrations for workshops</p>
          </div>
          <div className="flex gap-2 flex-col sm:flex-row">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-xs sm:text-sm w-full sm:w-auto"
            >
              <Plus size={16} className="sm:block hidden" />
              <Plus size={14} className="sm:hidden" />
              <span className="hidden sm:inline">Add Registration</span>
              <span className="sm:hidden">Add</span>
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-xs sm:text-sm w-full sm:w-auto"
            >
              <Download size={16} className="sm:block hidden" />
              <Download size={14} className="sm:hidden" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button onClick={() => setError('')} className="ml-auto">
              <X size={18} className="text-red-600" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-green-600 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-green-900">Success</h3>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X size={18} className="text-green-600" />
            </button>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Total Registrations</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Confirmed</p>
              <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Cancelled</p>
              <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, phone, or workshop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Filter size={20} className="text-gray-600 mt-2" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          {filteredRegistrations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        checked={
                          selectedRegistrations.length ===
                          filteredRegistrations.length &&
                          filteredRegistrations.length > 0
                        }
                        className="w-4 h-4 rounded"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Organization
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Workshop
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((reg) => (
                    <tr
                      key={reg.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRegistrations.includes(reg.id)}
                          onChange={(e) =>
                            handleSelectRegistration(reg.id, e.target.checked)
                          }
                          className="w-4 h-4 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {reg.userName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {reg.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {reg.phone}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {reg.organization}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {reg.workshopTitle}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            statusColors[reg.status]
                          }`}
                        >
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(reg.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-600 text-lg">
                {searchTerm || filterStatus !== 'all'
                  ? 'No registrations match your filters'
                  : 'No registrations yet'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Registration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-white">
              <h2 className="text-xl font-bold text-gray-900">Add Manual Registration</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddRegistration} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => {
                      setFormData({ ...formData, userName: e.target.value });
                      if (formErrors.userName) {
                        setFormErrors({ ...formErrors, userName: '' });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.userName
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Full name"
                  />
                  {formErrors.userName && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.userName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (formErrors.email) {
                        setFormErrors({ ...formErrors, email: '' });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.email
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="email@example.com"
                  />
                  {formErrors.email && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Phone <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (formErrors.phone) {
                        setFormErrors({ ...formErrors, phone: '' });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.phone
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="10-digit phone number"
                  />
                  {formErrors.phone && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.phone}</p>
                  )}
                </div>

                {/* Organization */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Organization <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => {
                      setFormData({ ...formData, organization: e.target.value });
                      if (formErrors.organization) {
                        setFormErrors({ ...formErrors, organization: '' });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.organization
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="College/Company name"
                  />
                  {formErrors.organization && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.organization}</p>
                  )}
                </div>

                {/* Workshop */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Workshop <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.workshopId}
                    onChange={(e) => {
                      const workshop = workshops.find((w) => w.id === e.target.value);
                      setFormData({
                        ...formData,
                        workshopId: e.target.value,
                        workshopTitle: workshop?.title || '',
                        amount: workshop?.price || 0,
                      });
                      if (formErrors.workshopId) {
                        setFormErrors({ ...formErrors, workshopId: '' });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.workshopId
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Select a workshop</option>
                    {workshops.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.title} - ₹{w.price}
                      </option>
                    ))}
                  </select>
                  {formErrors.workshopId && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.workshopId}</p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Amount <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    placeholder="Auto-filled from workshop"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Status <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'Pending' | 'Confirmed' })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                  </select>
                </div>

                {/* Payment Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Payment Status <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentStatus: e.target.value as 'Pending' | 'Completed',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 justify-end pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold"
                >
                  {isSubmitting ? 'Adding...' : 'Add Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default RegistrationsManagement;
