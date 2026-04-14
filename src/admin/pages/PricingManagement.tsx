import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Trash2,
  Edit,
  Plus,
  Search,
  GripVertical,
  AlertCircle,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
  isPopular: boolean;
  discountCode?: string;
  discountPercentage?: number;
  validFrom?: string;
  validTo?: string;
  order: number;
  isActive: boolean;
}

export const PricingManagement: React.FC = () => {
  const { token } = useAuth();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    duration: 'per workshop',
    description: '',
    features: [] as string[],
    isPopular: false,
    discountCode: '',
    discountPercentage: 0,
    validFrom: '',
    validTo: '',
    isActive: true,
  });
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await api.getPricingPlans();
      if (Array.isArray(data)) {
        setPlans(data);
      }
    } catch (error) {
      setError('Error fetching pricing plans');
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
    if (!formData.name.trim()) {
      setError('Plan name is required');
      return;
    }
    if (formData.price < 0) {
      setError('Price cannot be negative');
      return;
    }
    if (formData.features.length === 0) {
      setError('At least one feature is required');
      return;
    }
    if (!formData.duration.trim()) {
      setError('Duration is required');
      return;
    }

    try {
      if (editingId) {
        const result = await api.updatePricingPlan(editingId, formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSuccess('Pricing plan updated successfully!');
      } else {
        const result = await api.createPricingPlan({
          ...formData,
          order: plans.length,
        });
        if (result.error) {
          setError(result.error);
          return;
        }
        setSuccess('Pricing plan created successfully!');
      }

      resetForm();
      fetchPlans();
    } catch (error: any) {
      setError('Error saving pricing plan');
      console.error(error);
    }
  };

  const handleEdit = (plan: PricingPlan) => {
    setFormData({
      name: plan.name,
      price: plan.price,
      duration: plan.duration,
      description: plan.description,
      features: [...plan.features],
      isPopular: plan.isPopular,
      discountCode: plan.discountCode || '',
      discountPercentage: plan.discountPercentage || 0,
      validFrom: plan.validFrom || '',
      validTo: plan.validTo || '',
      isActive: plan.isActive,
    });
    setEditingId(plan.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this pricing plan?')) return;

    try {
      const result = await api.deletePricingPlan(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess('Pricing plan deleted successfully!');
      fetchPlans();
    } catch (error) {
      setError('Error deleting pricing plan');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      duration: 'per workshop',
      description: '',
      features: [],
      isPopular: false,
      discountCode: '',
      discountPercentage: 0,
      validFrom: '',
      validTo: '',
      isActive: true,
    });
    setNewFeature('');
    setEditingId(null);
    setShowForm(false);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const filteredPlans = plans.filter((plan) =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = filteredPlans.findIndex((p) => p.id === draggedItem);
    const targetIndex = filteredPlans.findIndex((p) => p.id === targetId);

    const newPlans = [...filteredPlans];
    [newPlans[draggedIndex], newPlans[targetIndex]] = [
      newPlans[targetIndex],
      newPlans[draggedIndex],
    ];

    // Update order
    const updates = newPlans.map((p, idx) => ({
      id: p.id,
      order: idx,
    }));

    setPlans(newPlans);
    setDraggedItem(null);

    // Call API to update order
    // api.reorderPricingPlans(updates);
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Pricing Plans</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage your course pricing tiers</p>
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
            <span className="hidden sm:inline">Add Plan</span>
            <span className="sm:hidden">Add</span>
          </button>
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

        {/* Form Section */}
        {showForm && (
          <div className="mb-8 bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Pricing Plan' : 'Create New Pricing Plan'}
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
                {/* Plan Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Plan Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Professional"
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
                    placeholder="6999"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="e.g., per workshop"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Discount Percentage */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Discount % (0-100)
                  </label>
                  <input
                    type="number"
                    value={formData.discountPercentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountPercentage: parseInt(e.target.value),
                      })
                    }
                    placeholder="0"
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Discount Code */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Discount Code
                  </label>
                  <input
                    type="text"
                    value={formData.discountCode}
                    onChange={(e) =>
                      setFormData({ ...formData, discountCode: e.target.value })
                    }
                    placeholder="e.g., SAVE20"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Valid From */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Valid From
                  </label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) =>
                      setFormData({ ...formData, validFrom: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Valid To */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Valid To
                  </label>
                  <input
                    type="date"
                    value={formData.validTo}
                    onChange={(e) =>
                      setFormData({ ...formData, validTo: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe this pricing plan..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Features <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                    placeholder="Add a feature..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    Add
                  </button>
                </div>

                {formData.features.length > 0 && (
                  <div className="space-y-2">
                    {formData.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                      >
                        <span className="text-gray-700">{feature}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature(idx)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) =>
                      setFormData({ ...formData, isPopular: e.target.checked })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-gray-700 font-medium">Mark as Popular</span>
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
                  {editingId ? 'Update Plan' : 'Create Plan'}
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

        {/* Search */}
        <div className="mb-6 relative">
          <Search
            className="absolute left-3 top-3 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search pricing plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Pricing Plans Cards Grid */}
        {filteredPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                draggable
                onDragStart={() => handleDragStart(plan.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(plan.id)}
                className="bg-white rounded-lg shadow border-2 border-gray-200 hover:shadow-lg transition cursor-move"
              >
                {/* Drag Handle */}
                <div className="px-6 py-3 border-b border-gray-200 flex items-center gap-2 bg-gray-50">
                  <GripVertical size={18} className="text-gray-400" />
                  <span className="text-xs text-gray-500 flex-1">Order: {plan.order}</span>
                  {plan.isPopular && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                      ★ Popular
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">
                        ₹{plan.price.toLocaleString()}
                      </span>
                      <span className="text-gray-600 text-sm">/{plan.duration}</span>
                    </div>
                    {plan.discountPercentage > 0 && (
                      <p className="text-green-600 text-sm font-semibold mt-1">
                        {plan.discountPercentage}% OFF
                        {plan.discountCode && ` - Code: ${plan.discountCode}`}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  {plan.description && (
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  )}

                  {/* Features */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-900 mb-2 uppercase">
                      Features
                    </p>
                    <ul className="space-y-2">
                      {plan.features.slice(0, 3).map((feature, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-700 flex items-start gap-2"
                        >
                          <span className="text-green-600 mt-1">✓</span>
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-xs text-gray-500">
                          +{plan.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Status */}
                  <div className="mb-4 flex gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        plan.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="flex-1 px-4 py-2 text-blue-600 hover:bg-blue-50 font-semibold rounded transition flex items-center justify-center gap-2"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="flex-1 px-4 py-2 text-red-600 hover:bg-red-50 font-semibold rounded transition flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow text-center border border-gray-200">
            <p className="text-gray-600 text-lg">
              {searchTerm
                ? 'No pricing plans match your search'
                : 'No pricing plans created yet'}
            </p>
          </div>
        )}

        {/* Stats */}
        {filteredPlans.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Total Plans</p>
              <p className="text-3xl font-bold text-gray-900">{filteredPlans.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Average Price</p>
              <p className="text-3xl font-bold text-gray-900">
                ₹
                {Math.round(
                  filteredPlans.reduce((sum, p) => sum + p.price, 0) /
                    filteredPlans.length
                )}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Popular Plans</p>
              <p className="text-3xl font-bold text-gray-900">
                {filteredPlans.filter((p) => p.isPopular).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
