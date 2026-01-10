import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { api } from '../services/api';
import {
  Trash2,
  Edit,
  Plus,
  Search,
  AlertCircle,
  X,
  ThumbsUp,
  ThumbsDown,
  Eye,
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'technical' | 'pricing' | 'registration' | 'certification';
  order: number;
  isActive: boolean;
  views: number;
  helpful: number;
  unhelpful: number;
  tags: string[];
}

export const FAQManagement: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general' as 'general' | 'technical' | 'pricing' | 'registration' | 'certification',
    isActive: true,
    order: 0,
    tags: [] as string[],
    workshopId: '',
  });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const data = await api.getFAQs();
      if (Array.isArray(data)) {
        setFaqs(data);
      }
    } catch (error) {
      setError('Error fetching FAQs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.question.trim()) {
      setError('Question is required');
      return;
    }
    if (!formData.answer.trim()) {
      setError('Answer is required');
      return;
    }

    try {
      if (editingId) {
        const result = await api.updateFAQ(editingId, formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSuccess('FAQ updated successfully!');
      } else {
        const result = await api.createFAQ(formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSuccess('FAQ created successfully!');
      }
      resetForm();
      fetchFAQs();
    } catch (error: any) {
      setError('Error saving FAQ');
    }
  };

  const handleEdit = (faq: FAQ) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      isActive: faq.isActive,
      order: faq.order,
      tags: faq.tags || [],
      workshopId: '',
    });
    setEditingId(faq.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      const result = await api.deleteFAQ(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess('FAQ deleted successfully!');
      fetchFAQs();
    } catch (error) {
      setError('Error deleting FAQ');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      isActive: true,
      order: 0,
      tags: [],
      workshopId: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || faq.category === filterCategory;
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">FAQs</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage frequently asked questions</p>
          </div>
          <button
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-xs sm:text-sm w-full sm:w-auto"
          >
            <Plus size={16} className="hidden sm:block" />
            <Plus size={14} className="sm:hidden" />
            <span className="hidden sm:inline">Add FAQ</span>
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
                {editingId ? 'Edit FAQ' : 'Add New FAQ'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  <option value="general">General</option>
                  <option value="technical">Technical</option>
                  <option value="pricing">Pricing</option>
                  <option value="registration">Registration</option>
                  <option value="certification">Certification</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Question <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  placeholder="FAQ question"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Answer <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                  placeholder="FAQ answer"
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Add tag"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
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
                  {editingId ? 'Update FAQ' : 'Add FAQ'}
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
                placeholder="Search FAQs..."
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
              <option value="general">General</option>
              <option value="technical">Technical</option>
              <option value="pricing">Pricing</option>
              <option value="registration">Registration</option>
              <option value="certification">Certification</option>
            </select>
          </div>
        </div>

        {filteredFAQs.length > 0 ? (
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-lg transition"
              >
                <div
                  onClick={() =>
                    setExpandedId(expandedId === faq.id ? null : faq.id)
                  }
                  className="p-6 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            faq.category === 'general'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {faq.category}
                        </span>
                        {!faq.isActive && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-semibold">
                            Inactive
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {faq.question}
                      </h3>
                    </div>
                  </div>

                  {expandedId === faq.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-gray-700 mb-4">{faq.answer}</p>

                      <div className="flex flex-wrap gap-4 items-center mb-4">
                        <div className="flex items-center gap-2">
                          <Eye size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {faq.views} views
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ThumbsUp size={16} className="text-green-500" />
                          <span className="text-sm text-gray-600">
                            {faq.helpful} helpful
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ThumbsDown size={16} className="text-red-500" />
                          <span className="text-sm text-gray-600">
                            {faq.unhelpful} not helpful
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(faq);
                          }}
                          className="flex-1 px-3 py-2 text-blue-600 hover:bg-blue-50 font-semibold rounded transition text-sm flex items-center justify-center gap-2"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(faq.id);
                          }}
                          className="flex-1 px-3 py-2 text-red-600 hover:bg-red-50 font-semibold rounded transition text-sm flex items-center justify-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow text-center border border-gray-200">
            <p className="text-gray-600 text-lg">No FAQs found</p>
          </div>
        )}

        {filteredFAQs.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Total FAQs</p>
              <p className="text-3xl font-bold text-gray-900">{filteredFAQs.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Total Views</p>
              <p className="text-3xl font-bold text-blue-600">
                {filteredFAQs.reduce((sum, f) => sum + f.views, 0)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Helpful Votes</p>
              <p className="text-3xl font-bold text-green-600">
                {filteredFAQs.reduce((sum, f) => sum + f.helpful, 0)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Active</p>
              <p className="text-3xl font-bold text-purple-600">
                {filteredFAQs.filter((f) => f.isActive).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
