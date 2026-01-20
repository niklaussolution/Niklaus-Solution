import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Plus, CheckCircle, AlertCircle, X } from 'lucide-react';

interface Video {
  _id: string;
  id?: string;
  title: string;
  youtubeUrl: string;
  thumbnail?: string;
  description?: string;
  heading?: string;
  order: number;
  isActive: boolean;
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export const VideoManagement: React.FC = () => {
  const { token } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    youtubeUrl: '',
    thumbnail: '',
    heading: '',
    description: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await api.getAllVideos();
      const videoList = Array.isArray(data) ? data : [];
      setVideos(videoList.map(v => ({
        _id: v.id || v._id,
        id: v.id || v._id,
        ...v
      })));
    } catch (error) {
      console.error('Error fetching videos:', error);
      addToast('Error loading videos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      addToast('Authentication required', 'error');
      return;
    }

    try {
      if (editingId) {
        const result = await api.updateVideo(editingId, formData);
        if (result.error) {
          addToast(`Error updating video: ${result.error}`, 'error');
        } else {
          addToast('Video updated successfully!', 'success');
        }
      } else {
        const result = await api.createVideo(formData);
        if (result.error) {
          addToast(`Error creating video: ${result.error}`, 'error');
        } else {
          addToast('Video saved successfully!', 'success');
        }
      }
      setFormData({ title: '', youtubeUrl: '', thumbnail: '', heading: '', description: '', order: 0, isActive: true });
      setShowForm(false);
      setEditingId(null);
      fetchVideos();
    } catch (error: any) {
      console.error('Error saving video:', error);
      addToast(`Error saving video: ${error.message}`, 'error');
    }
  };

  const handleEdit = (item: Video) => {
    setFormData({
      title: item.title,
      youtubeUrl: item.youtubeUrl,
      thumbnail: item.thumbnail || '',
      heading: item.heading || '',
      description: item.description || '',
      order: item.order,
      isActive: item.isActive,
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const result = await api.deleteVideo(id);
      if (result.error) {
        addToast(`Error deleting video: ${result.error}`, 'error');
      } else {
        addToast('Video deleted successfully!', 'success');
        fetchVideos();
      }
    } catch (error: any) {
      console.error('Error deleting video:', error);
      addToast(`Error deleting video: ${error.message}`, 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="p-3 sm:p-6">
        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-fade-in ${
                toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>{toast.message}</span>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="ml-2 hover:opacity-75"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Video Management</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ title: '', youtubeUrl: '', thumbnail: '', heading: '', description: '', order: 0, isActive: true });
            }}
            className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs sm:text-sm w-full sm:w-auto"
          >
            {showForm ? 'Cancel' : <>
              <Plus size={14} className="sm:hidden" />
              <Plus size={16} className="sm:block hidden" />
              <span className="hidden sm:inline">Add Video</span>
              <span className="sm:hidden">Add</span>
            </>}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded shadow mb-6">
            <h2 className="text-2xl font-bold mb-4">{editingId ? 'Edit' : 'Add New'} Video</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Video title"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Heading</label>
                  <input
                    type="text"
                    value={formData.heading}
                    onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Section heading for videos"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">YouTube URL *</label>
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Thumbnail URL</label>
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Thumbnail image URL"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-bold mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Video description"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    Active
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                {editingId ? 'Update' : 'Create'} Video
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video._id} className="bg-white rounded shadow overflow-hidden">
                {video.thumbnail && (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-2">{video.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 truncate">{video.youtubeUrl}</p>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-sm ${
                      video.isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}>
                      {video.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleEdit(video)}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(video._id)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
