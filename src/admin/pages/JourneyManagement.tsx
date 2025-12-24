import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Trash2,
  Edit,
  Plus,
  Search,
  AlertCircle,
  X,
  Linkedin,
  Twitter,
  Github,
} from 'lucide-react';

interface Journey {
  id: string;
  name: string;
  company: string;
  position: string;
  workshopName?: string;
  photo?: string;
  bio?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  isActive: boolean;
  order: number;
}

export const JourneyManagement: React.FC = () => {
  const { token } = useAuth();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    position: '',
    workshopName: '',
    photo: '',
    bio: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      github: '',
    },
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchJourneys();
  }, []);

  const fetchJourneys = async () => {
    try {
      setLoading(true);
      const data = await api.getJourneys();
      if (Array.isArray(data)) {
        setJourneys(data);
      }
    } catch (error) {
      setError('Error fetching journeys');
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
      setError('Name is required');
      return;
    }
    if (!formData.company.trim()) {
      setError('Company is required');
      return;
    }
    if (!formData.position.trim()) {
      setError('Position is required');
      return;
    }

    try {
      if (editingId) {
        const result = await api.updateJourney(editingId, formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSuccess('Journey updated successfully!');
      } else {
        const result = await api.createJourney(formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSuccess('Journey created successfully!');
      }

      resetForm();
      fetchJourneys();
    } catch (error: any) {
      setError('Error saving journey');
      console.error(error);
    }
  };

  const handleEdit = (journey: Journey) => {
    setFormData({
      name: journey.name,
      company: journey.company,
      position: journey.position,
      workshopName: journey.workshopName || '',
      photo: journey.photo || '',
      bio: journey.bio || '',
      socialLinks: {
        linkedin: journey.socialLinks?.linkedin || '',
        twitter: journey.socialLinks?.twitter || '',
        github: journey.socialLinks?.github || '',
      },
      isActive: journey.isActive,
      order: journey.order,
    });
    setEditingId(journey.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this journey?')) return;

    try {
      const result = await api.deleteJourney(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess('Journey deleted successfully!');
      fetchJourneys();
    } catch (error) {
      setError('Error deleting journey');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      company: '',
      position: '',
      workshopName: '',
      photo: '',
      bio: '',
      socialLinks: {
        linkedin: '',
        twitter: '',
        github: '',
      },
      isActive: true,
      order: 0,
    });
    setPhotoFile(null);
    setEditingId(null);
    setShowForm(false);
  };

  const filteredJourneys = journeys.filter((journey) =>
    journey.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    journey.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    journey.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadTemplate = () => {
    const template = [
      {
        name: 'John Doe',
        company: 'Tech Company',
        position: 'Software Engineer',
        workshopName: '',
        isActive: true,
        order: 1,
      },
    ];

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(template, null, 2)));
    element.setAttribute('download', 'journeys_template.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Journey of Our Learners</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage learner success stories</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-xs sm:text-sm w-full sm:w-auto"
          >
            <Plus size={16} className="sm:block hidden" />
            <Plus size={14} className="sm:hidden" />
            <span className="hidden sm:inline">Add Journey</span>
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
                {editingId ? 'Edit Journey' : 'Add New Journey'}
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
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    placeholder="e.g., Tech Company"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    placeholder="e.g., Software Engineer"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Workshop Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Workshop Name
                  </label>
                  <input
                    type="text"
                    value={formData.workshopName}
                    onChange={(e) =>
                      setFormData({ ...formData, workshopName: e.target.value })
                    }
                    placeholder="e.g., Niklaus"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                    }
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Photo Upload
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPhotoFile(file);
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setFormData({ ...formData, photo: event.target?.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {formData.photo && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Photo Preview
                  </label>
                  <img
                    src={formData.photo}
                    alt="Learner photo preview"
                    className="max-h-48 w-auto rounded-lg border border-gray-300"
                  />
                </div>
              )}

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Brief biography..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                      })
                    }
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Twitter
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.twitter}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                      })
                    }
                    placeholder="https://twitter.com/username"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    GitHub
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.github}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, github: e.target.value },
                      })
                    }
                    placeholder="https://github.com/username"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
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
                  {editingId ? 'Update Journey' : 'Add Journey'}
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
            placeholder="Search journeys by name, company, or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Journeys Grid */}
        {filteredJourneys.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJourneys.map((journey) => (
              <div
                key={journey.id}
                className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition"
              >
                {/* Photo */}
                {journey.photo && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={journey.photo}
                      alt={journey.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {journey.name}
                  </h3>

                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Company</p>
                      <p className="text-gray-800 font-medium">{journey.company}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Position</p>
                      <p className="text-gray-800 font-medium">{journey.position}</p>
                    </div>
                    {journey.workshopName && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Workshop</p>
                        <p className="text-orange-600 font-medium">After {journey.workshopName}</p>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {journey.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {journey.bio}
                    </p>
                  )}

                  {/* Social Links */}
                  {(journey.socialLinks?.linkedin || journey.socialLinks?.twitter || journey.socialLinks?.github) && (
                    <div className="flex gap-3 mb-4">
                      {journey.socialLinks?.linkedin && (
                        <a href={journey.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900">
                          <Linkedin size={20} />
                        </a>
                      )}
                      {journey.socialLinks?.twitter && (
                        <a href={journey.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:text-sky-700">
                          <Twitter size={20} />
                        </a>
                      )}
                      {journey.socialLinks?.github && (
                        <a href={journey.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-black">
                          <Github size={20} />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Status */}
                  <div className="mb-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        journey.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {journey.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEdit(journey)}
                      className="flex-1 px-4 py-2 text-blue-600 hover:bg-blue-50 font-semibold rounded transition flex items-center justify-center gap-2"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(journey.id)}
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
                ? 'No journeys match your search'
                : 'No journeys added yet'}
            </p>
          </div>
        )}

        {/* Stats */}
        {filteredJourneys.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Total Journeys</p>
              <p className="text-3xl font-bold text-gray-900">
                {filteredJourneys.length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Active Journeys</p>
              <p className="text-3xl font-bold text-green-600">
                {filteredJourneys.filter((j) => j.isActive).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
