import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Trash2,
  Edit,
  Plus,
  Search,
  Star,
  AlertCircle,
  X,
  Mail,
  Phone,
  Briefcase,
  Download,
  FileUp,
  Linkedin,
  Twitter,
  Github,
  Globe,
  Upload,
} from 'lucide-react';

interface Trainer {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  specialty: string;
  bio: string;
  expertise: string[];
  experience: string;
  qualifications?: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    portfolio?: string;
  };
  rating: number;
  reviewCount: number;
  isActive: boolean;
  order: number;
}

export const TrainersManagement: React.FC = () => {
  const { token } = useAuth();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const bulkFileInputRef = React.useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    photo: '',
    specialty: '',
    bio: '',
    expertise: [] as string[],
    experience: '',
    qualifications: [] as string[],
    socialLinks: {
      linkedin: '',
      twitter: '',
      github: '',
      portfolio: '',
    },
    isActive: true,
  });
  const [newExpertise, setNewExpertise] = useState('');
  const [newQualification, setNewQualification] = useState('');

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const data = await api.getTrainers();
      if (Array.isArray(data)) {
        setTrainers(data);
      }
    } catch (error) {
      setError('Error fetching trainers');
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
      setError('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone is required');
      return;
    }
    if (!formData.bio.trim()) {
      setError('Bio is required');
      return;
    }
    if (formData.expertise.length === 0) {
      setError('At least one expertise is required');
      return;
    }

    try {
      if (editingId) {
        const result = await api.updateTrainer(editingId, formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSuccess('Trainer updated successfully!');
      } else {
        const result = await api.createTrainer(formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSuccess('Trainer created successfully!');
      }

      resetForm();
      fetchTrainers();
    } catch (error: any) {
      setError('Error saving trainer');
      console.error(error);
    }
  };

  const handleEdit = (trainer: Trainer) => {
    setFormData({
      name: trainer.name,
      email: trainer.email,
      phone: trainer.phone,
      photo: trainer.photo,
      specialty: trainer.specialty,
      bio: trainer.bio,
      expertise: [...trainer.expertise],
      experience: trainer.experience,
      qualifications: trainer.qualifications || [],
      socialLinks: {
        linkedin: trainer.socialLinks?.linkedin || '',
        twitter: trainer.socialLinks?.twitter || '',
        github: trainer.socialLinks?.github || '',
        portfolio: trainer.socialLinks?.portfolio || '',
      },
      isActive: trainer.isActive,
    });
    setEditingId(trainer.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this trainer?')) return;

    try {
      const result = await api.deleteTrainer(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess('Trainer deleted successfully!');
      fetchTrainers();
    } catch (error) {
      setError('Error deleting trainer');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      photo: '',
      specialty: '',
      bio: '',
      expertise: [],
      experience: '',
      qualifications: [],
      socialLinks: {
        linkedin: '',
        twitter: '',
        github: '',
        portfolio: '',
      },
      isActive: true,
    });
    setNewExpertise('');
    setNewQualification('');
    setEditingId(null);
    setShowForm(false);
  };

  const addExpertise = () => {
    if (newExpertise.trim()) {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, newExpertise.trim()],
      });
      setNewExpertise('');
    }
  };

  const removeExpertise = (index: number) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter((_, i) => i !== index),
    });
  };

  const addQualification = () => {
    if (newQualification.trim()) {
      setFormData({
        ...formData,
        qualifications: [...(formData.qualifications || []), newQualification.trim()],
      });
      setNewQualification('');
    }
  };

  const removeQualification = (index: number) => {
    setFormData({
      ...formData,
      qualifications: (formData.qualifications || []).filter((_, i) => i !== index),
    });
  };

  const filteredTrainers = trainers.filter((trainer) =>
    trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.expertise.some((e) => e.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setBulkUploading(true);
      const text = await file.text();
      let data: any[] = [];

      // Parse JSON or CSV
      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        // Simple CSV parser
        const lines = text.split('\n');
        const headers = lines[0].split(',').map((h: string) => h.trim());
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',');
            const obj: any = {};
            headers.forEach((header: string, index: number) => {
              obj[header] = values[index]?.trim() || '';
            });
            data.push(obj);
          }
        }
      } else {
        setError('Please upload a JSON or CSV file');
        setBulkUploading(false);
        return;
      }

      // Validate and add trainers
      let addedCount = 0;
      for (const item of data) {
        if (item.name && item.specialty && item.email && item.phone) {
          const trainerData = {
            name: item.name,
            email: item.email,
            phone: item.phone,
            specialty: item.specialty,
            bio: item.bio || '',
            experience: item.experience || '',
            photo: item.photo || '',
            expertise: item.expertise ? item.expertise.split('|').map((e: string) => e.trim()) : [],
            qualifications: item.qualifications ? item.qualifications.split('|').map((q: string) => q.trim()) : [],
            socialLinks: {
              linkedin: item.linkedin || '',
              twitter: item.twitter || '',
              github: item.github || '',
              portfolio: item.portfolio || '',
            },
            isActive: item.isActive !== 'false' && item.isActive !== false,
          };

          const result = await api.createTrainer(trainerData);
          if (!result.error) {
            addedCount++;
          }
        }
      }

      if (addedCount === 0) {
        setError('No valid trainers found in file');
        setBulkUploading(false);
        return;
      }

      setSuccess(`Successfully imported ${addedCount} trainers!`);
      setTimeout(() => setSuccess(''), 3000);
      setShowBulkUpload(false);
      if (bulkFileInputRef.current) bulkFileInputRef.current.value = '';
      fetchTrainers();
    } catch (err) {
      setError('Error uploading file: ' + (err as Error).message);
      console.error(err);
    } finally {
      setBulkUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: 'Dr. Rajesh Kumar',
        specialty: 'Cybersecurity & Ethical Hacking',
        email: 'rajesh@example.com',
        phone: '+91-9876543210',
        experience: '15+ years at Microsoft & Google',
        bio: 'Expert in cybersecurity with decades of experience',
        expertise: 'Ethical Hacking|Penetration Testing|Network Security',
        qualifications: 'B.Tech Computer Science|CISSP Certified',
        linkedin: 'https://linkedin.com/in/rajeshkumar',
        twitter: 'https://twitter.com/rajeshkumar',
        github: 'https://github.com/rajeshkumar',
        portfolio: 'https://rajeshkumar.com',
        isActive: true,
      },
      {
        name: 'Priya Sharma',
        specialty: 'Full Stack Development',
        email: 'priya@example.com',
        phone: '+91-9876543211',
        experience: '12+ years at Amazon & Meta',
        bio: 'Full stack expert specializing in modern web technologies',
        expertise: 'React|Node.js|AWS|Docker',
        qualifications: 'B.Tech Information Technology|AWS Certified',
        linkedin: 'https://linkedin.com/in/priyasharma',
        twitter: 'https://twitter.com/priyasharma',
        github: 'https://github.com/priyasharma',
        portfolio: 'https://priyasharma.com',
        isActive: true,
      },
    ];

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(template, null, 2)));
    element.setAttribute('download', 'trainers_template.json');
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Trainers</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage your course instructors</p>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowBulkUpload(!showBulkUpload)}
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-xs sm:text-sm flex-1 sm:flex-none"
            >
              <FileUp size={16} className="sm:block hidden" />
              <FileUp size={14} className="sm:hidden" />
              <span className="hidden sm:inline">Bulk Upload</span>
              <span className="sm:hidden">Upload</span>
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-xs sm:text-sm flex-1 sm:flex-none"
            >
              <Plus size={16} className="sm:block hidden" />
              <Plus size={14} className="sm:hidden" />
              <span className="hidden sm:inline">Add Trainer</span>
              <span className="sm:hidden">Add</span>
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

        {/* Bulk Upload Section */}
        {showBulkUpload && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-2xl font-bold mb-6">Bulk Upload Trainers</h2>
            <p className="text-gray-600 mb-4">Import multiple trainers from a JSON or CSV file</p>
            
            <div className="space-y-4 mb-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <input
                  ref={bulkFileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={handleBulkUpload}
                  disabled={bulkUploading}
                  className="hidden"
                />
                
                <FileUp className="mx-auto mb-3 text-gray-400" size={40} />
                <p className="text-gray-600 mb-3">Upload JSON or CSV file</p>
                <div className="flex gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => bulkFileInputRef.current?.click()}
                    disabled={bulkUploading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                  >
                    {bulkUploading ? 'Uploading...' : 'Select File'}
                  </button>
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <Download size={18} />
                    Download Template
                  </button>
                </div>
              </div>

              {/* Format Info */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-3">Expected Format:</h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <p><strong>Required fields:</strong> name, specialty, email, phone</p>
                  <p><strong>Optional fields:</strong> bio, experience, photo, expertise (use | to separate multiple), qualifications (use | to separate), linkedin, twitter, github, portfolio, isActive</p>
                  <p><strong>Supported formats:</strong> JSON or CSV</p>
                  <p className="text-xs mt-3 text-blue-700">💡 Download the template above for a sample format</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowBulkUpload(false)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Form Section */}
        {showForm && (
          <div className="mb-8 bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Trainer' : 'Add New Trainer'}
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

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="john@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Specialty */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Specialty <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) =>
                      setFormData({ ...formData, specialty: e.target.value })
                    }
                    placeholder="e.g., Cybersecurity & Ethical Hacking"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Experience
                  </label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                    placeholder="e.g., 15+ years at Microsoft & Google"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Photo Upload */}
                <div className="md:col-span-2">
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
                    alt="Trainer photo preview"
                    className="max-h-48 w-auto rounded-lg border border-gray-300"
                  />
                </div>
              )}

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio <span className="text-red-500">*</span>
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

              {/* Expertise */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expertise <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addExpertise();
                      }
                    }}
                    placeholder="e.g., React, JavaScript"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addExpertise}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    Add
                  </button>
                </div>

                {formData.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.expertise.map((skill, idx) => (
                      <div
                        key={idx}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeExpertise(idx)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Qualifications */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Qualifications
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newQualification}
                    onChange={(e) => setNewQualification(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addQualification();
                      }
                    }}
                    placeholder="e.g., B.Tech in Computer Science"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addQualification}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    Add
                  </button>
                </div>

                {(formData.qualifications || []).length > 0 && (
                  <div className="space-y-2">
                    {formData.qualifications?.map((qual, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                      >
                        <span className="text-gray-700">{qual}</span>
                        <button
                          type="button"
                          onClick={() => removeQualification(idx)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Portfolio
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.portfolio}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, portfolio: e.target.value },
                      })
                    }
                    placeholder="https://example.com"
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
                  {editingId ? 'Update Trainer' : 'Add Trainer'}
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
            placeholder="Search trainers by name, email, or expertise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Trainers Grid */}
        {filteredTrainers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainers.map((trainer) => (
              <div
                key={trainer.id}
                className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition"
              >
                {/* Photo */}
                {trainer.photo && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={trainer.photo}
                      alt={trainer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {trainer.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < Math.floor(trainer.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {trainer.rating.toFixed(1)} ({trainer.reviewCount})
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {trainer.bio}
                  </p>

                  {/* Experience */}
                  {trainer.experience && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Briefcase size={16} />
                      {trainer.experience}
                    </div>
                  )}

                  {/* Specialty */}
                  {trainer.specialty && (
                    <div className="text-orange-600 font-semibold mb-2 text-base">
                      {trainer.specialty}
                    </div>
                  )}

                  {/* Expertise */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-900 mb-2 uppercase">
                      Expertise
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {trainer.expertise.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {trainer.expertise.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{trainer.expertise.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex gap-2 text-gray-600 mb-4 text-sm">
                    <Mail size={16} />
                    <span className="truncate">{trainer.email}</span>
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-3 mb-4">
                    {trainer.socialLinks?.linkedin && (
                      <a href={trainer.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900">
                        <Linkedin size={22} />
                      </a>
                    )}
                    {trainer.socialLinks?.twitter && (
                      <a href={trainer.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:text-sky-700">
                        <Twitter size={22} />
                      </a>
                    )}
                    {trainer.socialLinks?.github && (
                      <a href={trainer.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-black">
                        <Github size={22} />
                      </a>
                    )}
                    {trainer.socialLinks?.portfolio && (
                      <a href={trainer.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                        <Globe size={22} />
                      </a>
                    )}
                  </div>

                  {/* Status */}
                  <div className="mb-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        trainer.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {trainer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEdit(trainer)}
                      className="flex-1 px-4 py-2 text-blue-600 hover:bg-blue-50 font-semibold rounded transition flex items-center justify-center gap-2"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(trainer.id)}
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
                ? 'No trainers match your search'
                : 'No trainers added yet'}
            </p>
          </div>
        )}

        {/* Stats */}
        {filteredTrainers.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Total Trainers</p>
              <p className="text-3xl font-bold text-gray-900">
                {filteredTrainers.length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Average Rating</p>
              <p className="text-3xl font-bold text-yellow-600">
                {(
                  filteredTrainers.reduce((sum, t) => sum + t.rating, 0) /
                  filteredTrainers.length
                ).toFixed(1)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-gray-600 text-sm">Active Trainers</p>
              <p className="text-3xl font-bold text-green-600">
                {filteredTrainers.filter((t) => t.isActive).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
