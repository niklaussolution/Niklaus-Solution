import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../config/firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  AlertCircle,
  X,
  Save,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Edit,
  Eye,
  Info,
} from 'lucide-react';

interface StudentProject {
  id: string;
  name: string;
  photo: string;
  title: string;
  description: string;
  demoLink: string;
  demoType: 'link' | 'video' | 'image';
  isActive: boolean;
  order: number;
  createdAt: number;
}

// Helper function to validate and convert video URLs
const getEmbeddableVideoUrl = (url: string): string => {
  if (!url) return '';
  
  // YouTube URL patterns
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  
  // Vimeo URL patterns
  const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  // If already an embedded URL, return as is
  if (url.includes('embed') || url.includes('player')) {
    return url;
  }
  
  // If it's a direct video file URL, return as is
  if (url.includes('.mp4') || url.includes('.webm') || url.includes('.mov')) {
    return url;
  }
  
  return url;
};

// Helper function to validate URLs
const validateUrl = (url: string, type: 'link' | 'video' | 'image'): { valid: boolean; message: string } => {
  if (!url.trim()) {
    return { valid: false, message: `${type === 'link' ? 'External' : type.charAt(0).toUpperCase() + type.slice(1)} URL is required` };
  }

  try {
    new URL(url.startsWith('http') ? url : 'https://' + url);
  } catch {
    return { valid: false, message: 'Invalid URL format' };
  }

  if (type === 'image') {
    if (!/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) && !url.includes('firebaseapp')) {
      return { valid: false, message: 'Image URL must end with .jpg, .png, .gif, .webp, or .svg' };
    }
  }

  return { valid: true, message: '' };
};

export const StudentProjectsManagement: React.FC = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    photo: '',
    title: '',
    description: '',
    demoLink: '',
    demoType: 'link' as 'link' | 'video' | 'image',
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectsRef = collection(db, 'studentProjects');
      const q = query(projectsRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const projectsData: StudentProject[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setProjects(projectsData);
    } catch (error) {
      setError('Error fetching projects');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const timestamp = Date.now();
      const fileName = `studentProjects/${timestamp}_${file.name}`;
      const fileRef = ref(storage, fileName);

      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      setFormData({ ...formData, photo: url });
      setSuccess('Photo uploaded successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Error uploading photo');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Student name is required');
      return;
    }
    if (!formData.title.trim()) {
      setError('Project title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Project description is required');
      return;
    }
    if (!formData.photo.trim()) {
      setError('Photo is required');
      return;
    }
    
    // Validate demo link based on type
    const urlValidation = validateUrl(formData.demoLink, formData.demoType);
    if (!urlValidation.valid) {
      setError(urlValidation.message);
      return;
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, 'studentProjects', editingId), {
          ...formData,
          updatedAt: Date.now(),
        });
        setSuccess('Project updated successfully!');
      } else {
        await addDoc(collection(db, 'studentProjects'), {
          ...formData,
          createdAt: Date.now(),
        });
        setSuccess('Project created successfully!');
      }
      resetForm();
      fetchProjects();
    } catch (error: any) {
      setError('Error saving project: ' + error.message);
    }
  };

  const handleEdit = (project: StudentProject) => {
    setFormData({
      name: project.name,
      photo: project.photo,
      title: project.title,
      description: project.description,
      demoLink: project.demoLink,
      demoType: project.demoType,
      isActive: project.isActive,
      order: project.order,
    });
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, photoUrl: string) => {
    if (!window.confirm('Delete this project?')) return;

    try {
      if (photoUrl) {
        const fileRef = ref(storage, photoUrl);
        await deleteObject(fileRef);
      }
      await deleteDoc(doc(db, 'studentProjects', id));
      setSuccess('Project deleted successfully!');
      fetchProjects();
    } catch (error) {
      setError('Error deleting project');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      photo: '',
      title: '',
      description: '',
      demoLink: '',
      demoType: 'link',
      isActive: true,
      order: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <AdminLayout><div className="p-6 text-center">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Student Projects</h1>
          <p className="text-gray-600 mt-1">Manage student showcase projects</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <span className="text-red-700">{error}</span>
            <button onClick={() => setError('')} className="ml-auto">
              <X size={18} className="text-red-600" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-green-600" size={20} />
            <span className="text-green-700">{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X size={18} className="text-green-600" />
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-8 border-l-4 border-blue-600">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingId ? 'Edit Project' : 'Add New Project'}
              </h2>
              <button onClick={resetForm} className="text-gray-600 hover:text-gray-900">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Student name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Project title"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  rows={3}
                  placeholder="Describe the project..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Demo Type *
                  </label>
                  <select
                    value={formData.demoType}
                    onChange={(e) =>
                      setFormData({ ...formData, demoType: e.target.value as 'link' | 'video' | 'image' })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="link">External Link</option>
                    <option value="video">Video URL</option>
                    <option value="image">Image URL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Demo Link / URL *
                  </label>
                  <input
                    type="text"
                    value={formData.demoLink}
                    onChange={(e) => setFormData({ ...formData, demoLink: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder={
                      formData.demoType === 'link'
                        ? 'https://example.com'
                        : formData.demoType === 'video'
                        ? 'https://youtube.com/watch?v=... or direct video URL'
                        : 'https://example.com/image.jpg'
                    }
                  />
                </div>
              </div>

              {/* URL Format Helper */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <Info className="text-blue-600 flex-shrink-0 w-5 h-5 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-2">Supported URL Formats:</p>
                  <ul className="space-y-1 text-xs">
                    {formData.demoType === 'link' && (
                      <li>• Regular website URL: https://example.com</li>
                    )}
                    {formData.demoType === 'video' && (
                      <>
                        <li>• YouTube: https://youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID</li>
                        <li>• Vimeo: https://vimeo.com/VIDEO_ID</li>
                        <li>• Direct video: https://example.com/video.mp4 (.mp4, .webm, .mov)</li>
                      </>
                    )}
                    {formData.demoType === 'image' && (
                      <>
                        <li>• Image URL: https://example.com/image.jpg</li>
                        <li>• Supported formats: .jpg, .png, .gif, .webp, .svg</li>
                        <li>• Firebase URLs: Automatically detected</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Photo *
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </div>
                  {formData.photo && (
                    <img
                      src={formData.photo}
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Active
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Save size={18} />
                  {editingId ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Plus size={18} />
                New Project
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Student</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Project Title</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Demo Type</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <tr key={project.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={project.photo}
                            alt={project.name}
                            className="h-10 w-10 object-cover rounded"
                          />
                          <span className="font-medium">{project.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{project.title}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {project.demoType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            project.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {project.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(project)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(project.id, project.photo)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-600">
                      No projects found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StudentProjectsManagement;
