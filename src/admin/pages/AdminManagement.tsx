import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Plus } from 'lucide-react';

interface Admin {
  _id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'editor' | 'viewer';
}

export const AdminManagement: React.FC = () => {
  const { token } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'editor',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      if (!token) return;
      const data = await api.getAdmins();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!token) {
      setFormError('Authentication required');
      return;
    }

    // Validation
    if (!formData.username.trim()) {
      setFormError('Username is required');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Email is required');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await api.register(formData);
      if (response.error) {
        setFormError(response.error);
        return;
      }
      alert('Admin account created successfully!');
      setFormData({ username: '', email: '', password: '', role: 'editor' });
      setFormError('');
      setShowForm(false);
      fetchAdmins();
    } catch (error) {
      console.error('Error creating admin:', error);
      setFormError('Failed to create admin account');
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm('Are you sure?')) return;

    try {
      await api.deleteAdmin(id);
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Admin Users</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setFormData({ username: '', email: '', password: '', role: 'editor' });
            }}
            className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs sm:text-sm w-full sm:w-auto"
          >
            {showForm ? 'Cancel' : <>
              <Plus size={14} className="sm:hidden" />
              <Plus size={16} className="sm:block hidden" />
              <span className="hidden sm:inline">Add Admin</span>
              <span className="sm:hidden">Add</span>
            </>}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded shadow mb-6 border-l-4 border-blue-600">
            <h2 className="text-2xl font-bold mb-4">Add New Admin User</h2>
            {formError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter username"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Minimum 6 characters required</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  >
                    <option value="viewer">Viewer (Read-only)</option>
                    <option value="editor">Editor (Can edit content)</option>
                    <option value="super_admin">Super Admin (Full access)</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">Select the role permissions</p>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-semibold"
                >
                  Create Admin Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormError('');
                    setFormData({ username: '', email: '', password: '', role: 'editor' });
                  }}
                  className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left">Username</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{admin.username}</td>
                    <td className="px-4 py-2">{admin.email}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        admin.role === 'super_admin' ? 'bg-purple-200 text-purple-800' :
                        admin.role === 'editor' ? 'bg-blue-200 text-blue-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {admin.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDelete(admin._id)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
