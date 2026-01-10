import React, { useEffect, useState, useRef } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { db, storage } from '../config/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { AlertCircle, X, Save, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  workshop: string;
  testimonial: string;
  rating: number;
  avatar: string;
  imageUrl?: string;
  isActive: boolean;
  order: number;
}

export const TestimonialsManagement: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    role: '',
    workshop: '',
    testimonial: '',
    rating: 5,
    avatar: '',
    imageUrl: '',
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'testimonials'));
      const data: Testimonial[] = [];
      querySnapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as Testimonial);
      });
      data.sort((a, b) => a.order - b.order);
      setTestimonials(data);
    } catch (err) {
      setError('Error fetching testimonials');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.company.trim()) {
      setError('Company is required');
      return;
    }
    if (!formData.testimonial.trim()) {
      setError('Testimonial is required');
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        await updateDoc(doc(db, 'testimonials', editingId), dataToSave);
        setSuccess('Testimonial updated successfully!');
      } else {
        await addDoc(collection(db, 'testimonials'), {
          ...dataToSave,
          createdAt: new Date().toISOString(),
        });
        setSuccess('Testimonial added successfully!');
      }
      setTimeout(() => setSuccess(''), 3000);
      resetForm();
      fetchTestimonials();
    } catch (err) {
      setError('Error saving testimonial');
      console.error(err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      // Delete old image if editing and image exists
      if (editingId && formData.imageUrl) {
        try {
          const oldImageRef = ref(storage, formData.imageUrl);
          await deleteObject(oldImageRef);
        } catch (deleteErr) {
          console.warn('Could not delete old image:', deleteErr);
        }
      }

      // Upload new image
      const timestamp = Date.now();
      const fileName = `testimonials/${editingId || 'new'}_${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      setFormData(prev => ({ ...prev, imageUrl: downloadURL }));
      setSuccess('Image uploaded successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Error uploading image');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      company: '',
      role: '',
      workshop: '',
      testimonial: '',
      rating: 5,
      avatar: '',
      imageUrl: '',
      isActive: true,
      order: testimonials.length,
    });
    setImagePreview('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      name: testimonial.name,
      company: testimonial.company,
      role: testimonial.role,
      workshop: testimonial.workshop,
      testimonial: testimonial.testimonial,
      rating: testimonial.rating,
      avatar: testimonial.avatar,
      imageUrl: testimonial.imageUrl || '',
      isActive: testimonial.isActive,
      order: testimonial.order,
    });
    setImagePreview(testimonial.imageUrl || '');
    setEditingId(testimonial.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      await deleteDoc(doc(db, 'testimonials', id));
      setSuccess('Testimonial deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchTestimonials();
    } catch (err) {
      setError('Error deleting testimonial');
      console.error(err);
    }
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
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Testimonials</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage customer testimonials and reviews</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm w-full sm:w-auto"
          >
            <Plus size={14} className="sm:hidden" />
            <Plus size={16} className="sm:block hidden" />
            <span className="hidden sm:inline">Add Testimonial</span>
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

        {/* Form */}
        {showForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit' : 'Add New'} Testimonial</h2>
            <form onSubmit={handleSave} className="space-y-4">
              {/* Image Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
                
                {imagePreview ? (
                  <div className="flex flex-col items-center gap-4">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="h-32 w-32 object-cover rounded-lg"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-400 text-sm"
                      >
                        {uploading ? 'Uploading...' : 'Change Image'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setFormData(prev => ({ ...prev, imageUrl: '' }));
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <ImageIcon className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="text-gray-600 mb-2">Upload testimonial image (Max 5MB)</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                      {uploading ? 'Uploading...' : 'Select Image'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Student name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Avatar (Initials)</label>
                  <input
                    type="text"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="e.g., PE"
                    maxLength={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company/Organization *</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Job title"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Workshop</label>
                  <input
                    type="text"
                    value={formData.workshop}
                    onChange={(e) => setFormData({ ...formData, workshop: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Workshop name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value={1}>1 Star</option>
                    <option value={2}>2 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={5}>5 Stars</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Testimonial *</label>
                <textarea
                  value={formData.testimonial}
                  onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="What did the student say?"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Save size={20} />
                  {editingId ? 'Update' : 'Create'} Testimonial
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Testimonials List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {testimonials.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No testimonials yet. Click "Add Testimonial" or use the upload button to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Company</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Workshop</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rating</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testimonials.map((testimonial) => (
                    <tr key={testimonial.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-3">
                          {testimonial.imageUrl ? (
                            <img 
                              src={testimonial.imageUrl} 
                              alt={testimonial.name}
                              className="h-10 w-10 object-cover rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-white">
                              {testimonial.avatar || testimonial.name.charAt(0)}
                            </div>
                          )}
                          <span>{testimonial.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{testimonial.company}</td>
                      <td className="px-6 py-4 text-sm">{testimonial.workshop}</td>
                      <td className="px-6 py-4 text-sm">{'⭐'.repeat(testimonial.rating)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          testimonial.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {testimonial.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleEdit(testimonial)}
                          className="mr-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(testimonial.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-xs"
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
      </div>
    </AdminLayout>
  );
};

export default TestimonialsManagement;
