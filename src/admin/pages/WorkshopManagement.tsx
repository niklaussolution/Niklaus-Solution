import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Trash2, Edit, Plus, Search, Filter, X, AlertCircle } from 'lucide-react';
import { db } from '../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface Workshop {
  id: string;
  title: string;
  description: string;
  duration: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
  startDate: string;
  price: number;
  instructorName: string;
  capacity: number;
  enrolled: number;
  color: string;
  isFeatured: boolean;
  isActive: boolean;
}

export const WorkshopsManagement: React.FC = () => {
  const { token } = useAuth();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'Online' | 'Offline' | 'Hybrid'>('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    mode: 'Online' as 'Online' | 'Offline' | 'Hybrid',
    startDate: '',
    price: 0,
    instructorName: '',
    capacity: 30,
    color: 'bg-blue-500',
    isFeatured: false,
    isActive: true,
    learningOutcomes: [] as string[],
    requirements: [] as string[],
  });

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const data = await api.getWorkshops();
      if (Array.isArray(data)) {
        // Fetch actual enrollment count from registrations collection
        const registrationsRef = collection(db, "registrations");
        const updatedWorkshops = await Promise.all(
          data.map(async (workshop: Workshop) => {
            const q = query(
              registrationsRef, 
              where("workshopId", "==", workshop.id),
              where("paymentStatus", "==", "completed")
            );
            const registrationSnapshot = await getDocs(q);
            console.log(`Workshop: ${workshop.title} (${workshop.id}), Registrations: ${registrationSnapshot.size}`);
            return {
              ...workshop,
              enrolled: registrationSnapshot.size,
            };
          })
        );
        setWorkshops(updatedWorkshops);
      }
    } catch (error) {
      setError('Error fetching workshops');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.duration.trim()) {
      setError('Duration is required');
      return;
    }
    if (formData.price < 0) {
      setError('Price cannot be negative');
      return;
    }
    if (formData.capacity <= 0) {
      setError('Capacity must be greater than 0');
      return;
    }
    if (!formData.startDate) {
      setError('Start date is required');
      return;
    }

    try {
      if (editingId) {
        const result = await api.updateWorkshop(editingId, formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSuccess('Workshop updated successfully!');
      } else {
        const result = await api.createWorkshop(formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSuccess('Workshop created successfully!');
      }

      resetForm();
      fetchWorkshops();
    } catch (error: any) {
      setError('Error saving workshop');
      console.error(error);
    }
  };

  const handleEdit = (workshop: Workshop) => {
    setFormData({
      title: workshop.title,
      description: workshop.description,
      duration: workshop.duration,
      mode: workshop.mode,
      startDate: workshop.startDate,
      price: workshop.price,
      instructorName: workshop.instructorName,
      capacity: workshop.capacity,
      color: workshop.color,
      isFeatured: workshop.isFeatured,
      isActive: workshop.isActive,
      learningOutcomes: [],
      requirements: [],
    });
    setEditingId(workshop.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this workshop?')) return;

    try {
      const result = await api.deleteWorkshop(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess('Workshop deleted successfully!');
      fetchWorkshops();
    } catch (error) {
      setError('Error deleting workshop');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: '',
      mode: 'Online',
      startDate: '',
      price: 0,
      instructorName: '',
      capacity: 30,
      color: 'bg-blue-500',
      isFeatured: false,
      isActive: true,
      learningOutcomes: [],
      requirements: [],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredWorkshops = workshops.filter((workshop) => {
    const matchesSearch =
      workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workshop.instructorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && workshop.isActive) ||
      (filterStatus === 'inactive' && !workshop.isActive);
    const matchesMode =
      filterMode === 'all' || workshop.mode === filterMode;

    return matchesSearch && matchesStatus && matchesMode;
  });

  const modeColors = {
    Online: 'bg-blue-100 text-blue-800',
    Offline: 'bg-red-100 text-red-800',
    Hybrid: 'bg-purple-100 text-purple-800',
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Workshops</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage all workshops and courses</p>
          </div>
          <button
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-xs sm:text-sm w-full sm:w-auto"
          >
            <Plus size={16} className="sm:block hidden" />
            <Plus size={14} className="sm:hidden" />
            <span className="hidden sm:inline">Add Workshop</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-gap gap-3">
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
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-gap gap-3">
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

        {/* Form Section */}
        {showForm && (
          <div className="mb-8 bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Workshop' : 'Create New Workshop'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Full Stack Development"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="e.g., 6 Weeks"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Mode */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.mode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mode: e.target.value as 'Online' | 'Offline' | 'Hybrid',
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Online</option>
                    <option>Offline</option>
                    <option>Hybrid</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) })
                    }
                    placeholder="4999"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Instructor Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Instructor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.instructorName}
                    onChange={(e) =>
                      setFormData({ ...formData, instructorName: e.target.value })
                    }
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Capacity (Max Students) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: parseInt(e.target.value) })
                    }
                    placeholder="30"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Color Theme <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bg-red-500">Red</option>
                    <option value="bg-blue-500">Blue</option>
                    <option value="bg-purple-500">Purple</option>
                    <option value="bg-green-500">Green</option>
                    <option value="bg-orange-500">Orange</option>
                    <option value="bg-pink-500">Pink</option>
                  </select>
                </div>

                {/* Banner Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Banner Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setBannerFile(file);
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setBannerImage(event.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {bannerImage && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Banner Preview
                  </label>
                  <img
                    src={bannerImage}
                    alt="Workshop banner preview"
                    className="max-h-64 w-full object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the workshop..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-gray-700 font-medium">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-gray-700 font-medium">Active</span>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  {editingId ? 'Update Workshop' : 'Create Workshop'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search workshops or instructors..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Modes</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Workshops Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          {filteredWorkshops.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Instructor
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Mode
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Start Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Enrollment
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkshops.map((workshop) => (
                    <tr
                      key={workshop.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {workshop.title}
                          </p>
                          <p className="text-gray-600 text-xs">
                            {workshop.duration}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {workshop.instructorName}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            modeColors[workshop.mode]
                          }`}
                        >
                          {workshop.mode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(workshop.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ₹{workshop.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition"
                              style={{
                                width: `${
                                  (workshop.enrolled / workshop.capacity) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-gray-600">
                            {workshop.enrolled}/{workshop.capacity}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold w-fit ${
                              workshop.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {workshop.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {workshop.isFeatured && (
                            <span className="px-2 py-1 rounded text-xs font-semibold w-fit bg-yellow-100 text-yellow-800">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(workshop)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(workshop.id)}
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
                {searchTerm || filterStatus !== 'all' || filterMode !== 'all'
                  ? 'No workshops match your filters'
                  : 'No workshops created yet'}
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        {filteredWorkshops.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Total Workshops</p>
              <p className="text-3xl font-bold text-gray-900">
                {filteredWorkshops.length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Total Enrollments</p>
              <p className="text-3xl font-bold text-gray-900">
                {filteredWorkshops.reduce((sum, w) => sum + w.enrolled, 0)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Average Price</p>
              <p className="text-3xl font-bold text-gray-900">
                ₹
                {Math.round(
                  filteredWorkshops.reduce((sum, w) => sum + w.price, 0) /
                    filteredWorkshops.length
                )}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Featured</p>
              <p className="text-3xl font-bold text-gray-900">
                {filteredWorkshops.filter((w) => w.isFeatured).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
