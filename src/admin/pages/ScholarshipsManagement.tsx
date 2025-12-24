import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { api } from '../services/api';
import { Trash2, Edit, Plus, Search, AlertCircle, X, Award } from 'lucide-react';

interface Scholarship {
  id: string;
  name: string;
  description: string;
  amount: number;
  percentage: number;
  category: 'merit' | 'financial' | 'diversity' | 'need-based';
  isActive: boolean;
  totalSlots: number;
  availableSlots: number;
  awardedTo: string[];
  criteria: string[];
  startDate?: number;
  endDate?: number;
}

export const ScholarshipsManagement: React.FC = () => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [badgeFile, setBadgeFile] = useState<File | null>(null);
  const [badgeImage, setBadgeImage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: 0,
    percentage: 0,
    category: 'merit' as 'merit' | 'financial' | 'diversity' | 'need-based',
    totalSlots: 10,
    availableSlots: 10,
    startDate: Date.now(),
    endDate: Date.now() + 86400000 * 30,
    criteria: [] as string[],
    requirements: [] as string[],
    workshopIds: [] as string[],
    tags: [] as string[],
    isActive: true,
  });
  const [newCriterion, setNewCriterion] = useState('');

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const data = await api.getScholarships();
      if (Array.isArray(data)) {
        setScholarships(data as Scholarship[]);
      }
    } catch (error) {
      setError('Error fetching scholarships');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Scholarship name is required');
      return;
    }
    if (formData.criteria.length === 0) {
      setError('At least one criterion is required');
      return;
    }

    try {
      if (editingId) {
        const result = await api.updateScholarship(editingId, formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSuccess('Scholarship updated successfully!');
      } else {
        const result = await api.createScholarship(formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSuccess('Scholarship created successfully!');
      }
      resetForm();
      fetchScholarships();
    } catch (error: any) {
      setError('Error saving scholarship');
    }
  };

  const handleEdit = (scholarship: Scholarship) => {
    setFormData({
      name: scholarship.name,
      description: scholarship.description,
      amount: scholarship.amount,
      percentage: scholarship.percentage,
      category: scholarship.category,
      totalSlots: scholarship.totalSlots,
      availableSlots: scholarship.availableSlots,
      startDate: scholarship.startDate,
      endDate: scholarship.endDate,
      criteria: scholarship.criteria || [],
      requirements: [],
      workshopIds: scholarship.criteria || [],
      tags: [],
      isActive: scholarship.isActive,
    });
    setEditingId(scholarship.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this scholarship?')) return;
    try {
      const result = await api.deleteScholarship(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess('Scholarship deleted successfully!');
      fetchScholarships();
    } catch (error) {
      setError('Error deleting scholarship');
    }
  };

  const addCriterion = () => {
    if (newCriterion.trim() && !formData.criteria.includes(newCriterion.trim())) {
      setFormData({
        ...formData,
        criteria: [...formData.criteria, newCriterion.trim()],
      });
      setNewCriterion('');
    }
  };

  const removeCriterion = (criterion: string) => {
    setFormData({
      ...formData,
      criteria: formData.criteria.filter((c) => c !== criterion),
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      amount: 0,
      percentage: 0,
      category: 'merit',
      totalSlots: 10,
      availableSlots: 10,
      startDate: Date.now(),
      endDate: Date.now() + 86400000 * 30,
      criteria: [],
      requirements: [],
      workshopIds: [],
      tags: [],
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredScholarships = scholarships.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || s.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Scholarships</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage scholarship programs and awards</p>
          </div>
          <button
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-xs sm:text-sm w-full sm:w-auto"
          >
            <Plus size={16} className="sm:block hidden" />
            <Plus size={14} className="sm:hidden" />
            <span className="hidden sm:inline">Add Scholarship</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
            <button onClick={() => setError('')} className="ml-auto">
              <X size={18} className="text-red-600" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-green-600 flex-shrink-0" size={20} />
            <p className="text-green-700">{success}</p>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X size={18} className="text-green-600" />
            </button>
          </div>
        )}

        {showForm && (
          <div className="mb-8 bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Scholarship' : 'Add New Scholarship'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Scholarship name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as any })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="merit">Merit-Based</option>
                    <option value="financial">Financial Need</option>
                    <option value="diversity">Diversity</option>
                    <option value="need-based">Need-Based</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Scholarship description"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: parseFloat(e.target.value) })
                    }
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={formData.percentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        percentage: Math.min(100, parseFloat(e.target.value)),
                      })
                    }
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Badge Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setBadgeFile(file);
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setBadgeImage(event.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {badgeImage && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Badge Preview
                  </label>
                  <img
                    src={badgeImage}
                    alt="Scholarship badge preview"
                    className="max-h-32 w-auto rounded-lg border border-gray-300"
                  />
                </div>
              )}

              {/* Criteria */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Eligibility Criteria <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCriterion}
                    onChange={(e) => setNewCriterion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCriterion()}
                    placeholder="Add criterion"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addCriterion}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.criteria.map((c) => (
                    <span
                      key={c}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {c}
                      <button
                        type="button"
                        onClick={() => removeCriterion(c)}
                        className="hover:text-blue-900"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

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

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  {editingId ? 'Update Scholarship' : 'Add Scholarship'}
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

        <div className="mb-6 bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search scholarships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="merit">Merit-Based</option>
              <option value="financial">Financial Need</option>
              <option value="diversity">Diversity</option>
              <option value="need-based">Need-Based</option>
            </select>
          </div>
        </div>

        {filteredScholarships.length > 0 ? (
          <div className="space-y-4">
            {filteredScholarships.map((scholarship) => (
              <div
                key={scholarship.id}
                className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="text-yellow-600" size={24} />
                      <h3 className="text-lg font-bold text-gray-900">{scholarship.name}</h3>
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        scholarship.category === 'merit'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {scholarship.category}
                    </span>
                  </div>
                  {!scholarship.isActive && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-semibold">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-xs">Amount</p>
                    <p className="text-lg font-bold text-gray-900">${scholarship.amount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Discount</p>
                    <p className="text-lg font-bold text-gray-900">{scholarship.percentage}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Slots</p>
                    <p className="text-lg font-bold text-gray-900">
                      {scholarship.availableSlots}/{scholarship.totalSlots}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Awarded</p>
                    <p className="text-lg font-bold text-gray-900">{scholarship.awardedTo.length}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(scholarship)}
                    className="flex-1 px-3 py-2 text-blue-600 hover:bg-blue-50 font-semibold rounded transition text-sm flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(scholarship.id)}
                    className="flex-1 px-3 py-2 text-red-600 hover:bg-red-50 font-semibold rounded transition text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow text-center border border-gray-200">
            <p className="text-gray-600 text-lg">No scholarships found</p>
          </div>
        )}

        {filteredScholarships.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Total Scholarships</p>
              <p className="text-3xl font-bold text-gray-900">{filteredScholarships.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Active</p>
              <p className="text-3xl font-bold text-green-600">
                {filteredScholarships.filter((s) => s.isActive).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Total Awarded</p>
              <p className="text-3xl font-bold text-yellow-600">
                {filteredScholarships.reduce((sum, s) => sum + s.awardedTo.length, 0)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Total Value</p>
              <p className="text-3xl font-bold text-purple-600">
                ${filteredScholarships.reduce((sum, s) => sum + s.amount * s.awardedTo.length, 0)}
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
