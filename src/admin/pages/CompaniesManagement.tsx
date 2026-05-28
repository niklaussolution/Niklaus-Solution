import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { api } from '../services/api';
import { Trash2, Edit, Plus, Search, AlertCircle, X, Globe, Linkedin, Twitter } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  logo: string;
  website: string;
  industry: string;
  employees: number;
  isActive: boolean;
  trainersCount: number;
  testimonials: number;
}

export const CompaniesManagement: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    website: '',
    description: '',
    industry: '',
    employees: 0,
    location: '',
    contact: { email: '', phone: '', contactPerson: '' },
    socialLinks: { linkedin: '', twitter: '', facebook: '', instagram: '' },
    workshopIds: [] as string[],
    trainersCount: 0,
    testimonials: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await api.getCompanies();
      if (Array.isArray(data)) {
        setCompanies(data as Company[]);
      }
    } catch (error) {
      setError('Error fetching companies');
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
      setError('Company name is required');
      return;
    }
    if (!formData.contact.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Valid email is required');
      return;
    }

    try {
      if (editingId) {
        const result = await api.updateCompany(editingId, formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSuccess('Company updated successfully!');
      } else {
        const result = await api.createCompany(formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSuccess('Company created successfully!');
      }
      resetForm();
      fetchCompanies();
    } catch (error: any) {
      setError('Error saving company');
    }
  };

  const handleEdit = (company: Company) => {
    setFormData({
      name: company.name,
      logo: company.logo,
      website: company.website,
      description: '',
      industry: company.industry,
      employees: company.employees,
      location: '',
      contact: { email: '', phone: '', contactPerson: '' },
      socialLinks: { linkedin: '', twitter: '', facebook: '', instagram: '' },
      workshopIds: [],
      trainersCount: company.trainersCount,
      testimonials: company.testimonials,
      isActive: company.isActive,
    });
    setEditingId(company.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this company?')) return;
    try {
      const result = await api.deleteCompany(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess('Company deleted successfully!');
      fetchCompanies();
    } catch (error) {
      setError('Error deleting company');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo: '',
      website: '',
      description: '',
      industry: '',
      employees: 0,
      location: '',
      contact: { email: '', phone: '', contactPerson: '' },
      socialLinks: { linkedin: '', twitter: '', facebook: '', instagram: '' },
      workshopIds: [],
      trainersCount: 0,
      testimonials: 0,
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Companies</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage partner and collaborating companies</p>
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
            <span className="hidden sm:inline">Add Company</span>
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
                {editingId ? 'Edit Company' : 'Add New Company'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Company name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g., Technology, Finance"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: { ...formData.contact, email: e.target.value },
                      })
                    }
                    placeholder="company@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contact.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: { ...formData.contact, phone: e.target.value },
                      })
                    }
                    placeholder="Contact number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Logo Upload
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLogoFile(file);
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setFormData({ ...formData, logo: event.target?.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {formData.logo && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Logo Preview
                  </label>
                  <img
                    src={formData.logo}
                    alt="Logo preview"
                    className="max-h-32 w-auto rounded-lg border border-gray-300"
                  />
                </div>
              )}

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
                  {editingId ? 'Update Company' : 'Add Company'}
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
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition"
              >
                {company.logo && (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-full h-20 object-contain mb-4"
                  />
                )}

                <h3 className="text-lg font-bold text-gray-900 mb-2">{company.name}</h3>
                <p className="text-sm text-gray-600 mb-1">{company.industry}</p>
                <p className="text-xs text-gray-500 mb-4">
                  {company.employees.toLocaleString()} employees
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                  <div>
                    <p className="text-gray-600 text-xs">Trainers</p>
                    <p className="text-lg font-bold text-gray-900">{company.trainersCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Testimonials</p>
                    <p className="text-lg font-bold text-gray-900">{company.testimonials}</p>
                  </div>
                </div>

                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 text-sm"
                  >
                    <Globe size={16} />
                    Visit Website
                  </a>
                )}

                {!company.isActive && (
                  <span className="block text-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-semibold mb-4">
                    Inactive
                  </span>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(company)}
                    className="flex-1 px-3 py-2 text-blue-600 hover:bg-blue-50 font-semibold rounded transition text-sm flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
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
            <p className="text-gray-600 text-lg">No companies found</p>
          </div>
        )}

        {filteredCompanies.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Total Companies</p>
              <p className="text-3xl font-bold text-gray-900">{filteredCompanies.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Active</p>
              <p className="text-3xl font-bold text-green-600">
                {filteredCompanies.filter((c) => c.isActive).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Total Employees</p>
              <p className="text-3xl font-bold text-blue-600">
                {filteredCompanies.reduce((sum, c) => sum + c.employees, 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
