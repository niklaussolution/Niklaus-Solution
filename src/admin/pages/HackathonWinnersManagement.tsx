import React, { useEffect, useState, useRef } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { db, storage } from '../config/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { AlertCircle, X, Save, Plus, Trash2, Upload, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';

interface HackathonWinner {
  id: string;
  name: string;
  projectTitle: string;
  projectDescription: string;
  position: string;
  prize: string;
  imageUrl: string;
  projectLink: string;
  hackathonName: string;
  year: number;
  isActive: boolean;
  order: number;
}

export const HackathonWinnersManagement: React.FC = () => {
  const [winners, setWinners] = useState<HackathonWinner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cropProcessing, setCropProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImage, setCropImage] = useState<string>('');
  const [cropZoom, setCropZoom] = useState(1);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    projectTitle: '',
    projectDescription: '',
    position: '1st',
    prize: '',
    imageUrl: '',
    projectLink: '',
    hackathonName: '',
    year: new Date().getFullYear(),
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'hackathonWinners'));
      const data: HackathonWinner[] = [];
      querySnapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as HackathonWinner);
      });
      data.sort((a, b) => a.order - b.order);
      setWinners(data);
    } catch (err) {
      setError('Error fetching hackathon winners');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
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

    try {
      setError('');
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setCropImage(result);
        setShowCropModal(true);
        setCropZoom(1);
        setCropX(0);
        setCropY(0);
      };
      reader.onerror = () => {
        setError('Error loading image');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Error loading image');
      console.error(err);
    }
  };

  const handleCropConfirm = async () => {
    if (!canvasRef.current || !imgRef.current) return;

    try {
      setCropProcessing(true);
      setError('');
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Failed to get canvas context');
        setCropProcessing(false);
        return;
      }

      const image = imgRef.current;
      
      // Wait for image to load
      if (!image.complete) {
        await new Promise((resolve) => {
          image.onload = resolve;
        });
      }

      const cropSize = 400;
      canvas.width = cropSize;
      canvas.height = cropSize;

      // Simple approach: the image is displayed with object-contain
      // Calculate the scale at which the image is displayed
      const imgNaturalWidth = image.naturalWidth;
      const imgNaturalHeight = image.naturalHeight;
      
      // Determine scaling to fit in 400x400 container with object-contain
      let scale: number;
      if (imgNaturalWidth >= imgNaturalHeight) {
        // landscape or square
        scale = 400 / imgNaturalWidth;
      } else {
        // portrait
        scale = 400 / imgNaturalHeight;
      }

      // Calculate displayed dimensions
      const displayWidth = imgNaturalWidth * scale;
      const displayHeight = imgNaturalHeight * scale;

      // Calculate center offset (where the image is positioned in the container)
      const centerX = (400 - displayWidth) / 2;
      const centerY = (400 - displayHeight) / 2;

      // The image is scaled and zoomed, translated by cropX and cropY
      // Reverse the transformation: we need to find which part of the original image is visible
      
      // Position of the image in the display container (accounting for transform)
      const imgScreenX = centerX + cropX;
      const imgScreenY = centerY + cropY;
      
      // Map the 400x400 visible area back to the original image
      // The visible area starts at (0,0) in screen space and goes to (400, 400)
      // We need to find what part of the original image this corresponds to
      
      const cropScreenX = -imgScreenX;
      const cropScreenY = -imgScreenY;
      
      // Convert from screen coordinates to image coordinates
      // Account for zoom: screen distance / zoom gives image distance
      const cropImageX = (cropScreenX / scale) / cropZoom;
      const cropImageY = (cropScreenY / scale) / cropZoom;
      const cropImageWidth = (400 / scale) / cropZoom;
      const cropImageHeight = (400 / scale) / cropZoom;
      
      // Clamp to valid image bounds
      const srcX = Math.max(0, Math.min(cropImageX, imgNaturalWidth - 1));
      const srcY = Math.max(0, Math.min(cropImageY, imgNaturalHeight - 1));
      const srcWidth = Math.min(cropImageWidth, imgNaturalWidth - srcX);
      const srcHeight = Math.min(cropImageHeight, imgNaturalHeight - srcY);

      // Draw to canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, cropSize, cropSize);
      
      ctx.drawImage(
        image,
        srcX,
        srcY,
        srcWidth,
        srcHeight,
        0,
        0,
        cropSize,
        cropSize
      );

      // Convert to blob and upload
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            setError('Error processing image - blob is null');
            setCropProcessing(false);
            return;
          }

          try {
            console.log('Uploading blob:', blob.size, blob.type);
            const timestamp = Date.now();
            const filename = `hackathon-winners/${timestamp}-cropped.jpg`;
            const storageRef = ref(storage, filename);

            const uploadResult = await uploadBytes(storageRef, blob, {
              contentType: 'image/jpeg',
            });
            console.log('Upload successful:', uploadResult);

            const downloadURL = await getDownloadURL(storageRef);
            console.log('Download URL:', downloadURL);

            setFormData((prev) => ({
              ...prev,
              imageUrl: downloadURL,
            }));
            setImagePreview(downloadURL);
            setSuccess('Image cropped and uploaded successfully!');
            setTimeout(() => setSuccess(''), 3000);
            setShowCropModal(false);
            setCropProcessing(false);
          } catch (err) {
            console.error('Upload error:', err);
            setError(`Error uploading cropped image: ${err instanceof Error ? err.message : 'Unknown error'}`);
            setCropProcessing(false);
          }
        },
        'image/jpeg',
        0.95
      );
    } catch (err) {
      console.error('Crop error:', err);
      setError(`Error processing image: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setCropProcessing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.projectTitle.trim()) {
      setError('Project title is required');
      return;
    }
    if (!formData.projectDescription.trim()) {
      setError('Project description is required');
      return;
    }
    if (!formData.hackathonName.trim()) {
      setError('Hackathon name is required');
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        await updateDoc(doc(db, 'hackathonWinners', editingId), dataToSave);
        setSuccess('Hackathon winner updated successfully!');
      } else {
        await addDoc(collection(db, 'hackathonWinners'), {
          ...dataToSave,
          createdAt: new Date().toISOString(),
        });
        setSuccess('Hackathon winner added successfully!');
      }
      setTimeout(() => setSuccess(''), 3000);
      resetForm();
      fetchWinners();
      setShowForm(false);
    } catch (err) {
      setError('Error saving hackathon winner');
      console.error(err);
    }
  };

  const handleEdit = (winner: HackathonWinner) => {
    setFormData({
      name: winner.name,
      projectTitle: winner.projectTitle,
      projectDescription: winner.projectDescription,
      position: winner.position,
      prize: winner.prize,
      imageUrl: winner.imageUrl,
      projectLink: winner.projectLink,
      hackathonName: winner.hackathonName,
      year: winner.year,
      isActive: winner.isActive,
      order: winner.order,
    });
    setImagePreview(winner.imageUrl);
    setEditingId(winner.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (window.confirm('Are you sure you want to delete this hackathon winner?')) {
      try {
        await deleteDoc(doc(db, 'hackathonWinners', id));
        
        // Delete image from storage if it exists
        if (imageUrl) {
          try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
          } catch (err) {
            console.error('Error deleting image:', err);
          }
        }

        setSuccess('Hackathon winner deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
        fetchWinners();
      } catch (err) {
        setError('Error deleting hackathon winner');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      projectTitle: '',
      projectDescription: '',
      position: '1st',
      prize: '',
      imageUrl: '',
      projectLink: '',
      hackathonName: '',
      year: new Date().getFullYear(),
      isActive: true,
      order: 0,
    });
    setImagePreview('');
    setEditingId(null);
  };

  const handleToggleActive = async (winner: HackathonWinner) => {
    try {
      await updateDoc(doc(db, 'hackathonWinners', winner.id), {
        isActive: !winner.isActive,
      });
      setSuccess(`Hackathon winner ${!winner.isActive ? 'activated' : 'deactivated'}!`);
      setTimeout(() => setSuccess(''), 3000);
      fetchWinners();
    } catch (err) {
      setError('Error updating hackathon winner');
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Hackathon Winners</h1>
            <p className="text-gray-600 mt-2">Manage hackathon winners and their achievements</p>
          </div>
          {!showForm && (
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
            >
              <Plus size={20} />
              Add Winner
            </button>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Form Section - Inline, No Popup */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border-l-4 border-orange-500">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              {editingId ? 'Edit Hackathon Winner' : 'Add New Hackathon Winner'}
            </h2>

            {/* Crop Interface - Inline within the form */}
            {showCropModal && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-8 mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Crop Your Image</h3>
                
                {/* Instructions */}
                <div className="bg-blue-100 border-l-4 border-blue-600 p-4 rounded mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Tip:</strong> Click and drag the image to position it. Use the zoom slider to adjust the size. Click "Crop & Upload" when ready.
                  </p>
                </div>

                {/* Crop Preview */}
                <div 
                  className="relative w-full bg-gray-100 rounded-lg overflow-hidden border-4 border-gray-300 cursor-move select-none mb-6"
                  style={{ aspectRatio: '1 / 1', maxWidth: '400px' }}
                  onMouseDown={(e) => {
                    if (e.button !== 0 || !imgRef.current?.complete) return;
                    const container = e.currentTarget;
                    const rect = container.getBoundingClientRect();
                    const startX = e.clientX - rect.left - cropX;
                    const startY = e.clientY - rect.top - cropY;
                    
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      setCropX(moveEvent.clientX - rect.left - startX);
                      setCropY(moveEvent.clientY - rect.top - startY);
                    };
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                  onTouchStart={(e) => {
                    if (!imgRef.current?.complete) return;
                    const container = e.currentTarget;
                    const rect = container.getBoundingClientRect();
                    const touch = e.touches[0];
                    const startX = touch.clientX - rect.left - cropX;
                    const startY = touch.clientY - rect.top - cropY;
                    
                    const handleTouchMove = (moveEvent: TouchEvent) => {
                      const moveTouch = moveEvent.touches[0];
                      setCropX(moveTouch.clientX - rect.left - startX);
                      setCropY(moveTouch.clientY - rect.top - startY);
                    };
                    const handleTouchEnd = () => {
                      document.removeEventListener('touchmove', handleTouchMove);
                      document.removeEventListener('touchend', handleTouchEnd);
                    };
                    document.addEventListener('touchmove', handleTouchMove);
                    document.addEventListener('touchend', handleTouchEnd);
                  }}
                >
                  {cropImage && (
                    <>
                      <img
                        ref={imgRef}
                        src={cropImage}
                        alt="Crop preview"
                        className="absolute w-full h-full object-contain"
                        style={{
                          transform: `translate(${cropX}px, ${cropY}px) scale(${cropZoom})`,
                          transformOrigin: 'center',
                          userSelect: 'none',
                        }}
                        draggable={false}
                        onLoad={() => console.log('Image loaded for cropping')}
                      />
                      <div className="absolute inset-0 border-4 border-dashed border-blue-500 pointer-events-none" />
                    </>
                  )}
                </div>

                {/* Zoom Slider */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Zoom: {cropZoom.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={cropZoom}
                    onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                    disabled={cropProcessing}
                    className="w-full cursor-pointer disabled:opacity-50"
                  />
                </div>

                {/* Reset Position */}
                <button
                  type="button"
                  onClick={() => {
                    setCropX(0);
                    setCropY(0);
                    setCropZoom(1);
                  }}
                  disabled={cropProcessing}
                  className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 mb-6"
                >
                  Reset Position
                </button>

                {/* Crop Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCropModal(false)}
                    disabled={cropProcessing}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 font-semibold"
                  >
                    Cancel Crop
                  </button>
                  <button
                    type="button"
                    onClick={handleCropConfirm}
                    disabled={cropProcessing}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition disabled:opacity-50 font-semibold"
                  >
                    {cropProcessing ? 'Processing...' : 'Crop & Upload'}
                  </button>
                </div>
              </div>
            )}

            {/* Main Form */}
            {!showCropModal && (
              <form onSubmit={handleSave} className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Winner Image
                  </label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 transition flex items-center justify-center gap-2"
                      >
                        <Upload size={20} />
                        Choose Image
                      </button>
                    </div>
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg shadow-md"
                      />
                    )}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Winner Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., John Doe"
                  />
                </div>

                {/* Project Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={formData.projectTitle}
                    onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., AI-Powered Health Assistant"
                  />
                </div>

                {/* Project Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Description *
                  </label>
                  <textarea
                    value={formData.projectDescription}
                    onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Describe the project and its impact..."
                  />
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Position */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Position *
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="1st">1st Place</option>
                      <option value="2nd">2nd Place</option>
                      <option value="3rd">3rd Place</option>
                      <option value="Winner">Winner</option>
                      <option value="Finalist">Finalist</option>
                    </select>
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Year *
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="2024"
                    />
                  </div>
                </div>

                {/* Prize */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prize
                  </label>
                  <input
                    type="text"
                    value={formData.prize}
                    onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., $5000 + Internship"
                  />
                </div>

                {/* Hackathon Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hackathon Name *
                  </label>
                  <input
                    type="text"
                    value={formData.hackathonName}
                    onChange={(e) => setFormData({ ...formData, hackathonName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., Niklaus Innovation Hackathon 2024"
                  />
                </div>

                {/* Project Link */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.projectLink}
                    onChange={(e) => setFormData({ ...formData, projectLink: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="https://..."
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
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-semibold text-gray-700">
                    Active on Frontend
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-6 border-t">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold"
                  >
                    <Save size={20} />
                    {editingId ? 'Update Winner' : 'Add Winner'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Winners List */}
        {!showForm && (
          <>
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              </div>
            ) : winners.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-600">No hackathon winners yet. Add one to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {winners.map((winner) => (
                  <div
                    key={winner.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                      {winner.imageUrl ? (
                        <img
                          src={winner.imageUrl}
                          alt={winner.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={48} className="text-gray-300" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md">
                        <button
                          onClick={() => handleToggleActive(winner)}
                          className={`transition ${
                            winner.isActive ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {winner.isActive ? (
                            <Eye size={20} />
                          ) : (
                            <EyeOff size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="mb-2">
                        <h3 className="text-lg font-bold text-gray-800">
                          {winner.name}
                        </h3>
                        <p className="text-sm text-orange-600 font-semibold">
                          {winner.position} • {winner.hackathonName}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {winner.projectTitle}
                      </p>
                      <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                        {winner.projectDescription}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(winner)}
                          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(winner.id, winner.imageUrl)}
                          className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm font-semibold flex items-center justify-center gap-1"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Hidden Canvas for Cropping */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </AdminLayout>
  );
};
