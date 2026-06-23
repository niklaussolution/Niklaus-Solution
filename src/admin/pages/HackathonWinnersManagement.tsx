import React, { useEffect, useState, useRef } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { ImageCropper } from '../components/ImageCropper';
import { db, storage } from '../config/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import {
  Plus, Save, X, AlertCircle, Upload, Trash2,
  Star, Eye, EyeOff, ExternalLink, Trophy, Linkedin, Github, Globe
} from 'lucide-react';

interface HackathonWinner {
  id: string;
  name: string;
  collegeName: string;
  department: string;
  projectTitle: string;
  projectDescription: string;
  position: string;
  prize: string;
  imageUrl: string;
  winnerImage: string;
  winnerThumbnail: string;
  projectLink: string;
  hackathonName: string;
  year: number;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  linkedInUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

const POSITIONS = [
  { value: '1st', label: '1st Place', gradient: 'from-yellow-400 to-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  { value: '2nd', label: '2nd Place', gradient: 'from-gray-300 to-gray-400', bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  { value: '3rd', label: '3rd Place', gradient: 'from-orange-400 to-orange-500', bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  { value: 'special', label: 'Special Award', gradient: 'from-blue-400 to-blue-500', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
];

const ACCEPTED_TYPES: Record<string, string> = {
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WEBP',
};

const ACCEPTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

const compressImage = async (file: File, maxDimension: number, quality: number): Promise<Blob> => {
  const img = new Image();
  const bitmap = await createImageBitmap(file);
  let width = bitmap.width;
  let height = bitmap.height;

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height / width) * maxDimension);
      width = maxDimension;
    } else {
      width = Math.round((width / height) * maxDimension);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Image compression failed'));
      },
      'image/jpeg',
      quality
    );
  });
};

function getPositionStyle(position: string) {
  return POSITIONS.find(p => p.value === position) || POSITIONS[3];
}

export const HackathonWinnersManagement: React.FC = () => {
  const [winners, setWinners] = useState<HackathonWinner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [cropperImageUrl, setCropperImageUrl] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    collegeName: '',
    department: '',
    projectTitle: '',
    projectDescription: '',
    position: '1st',
    prize: '',
    imageUrl: '',
    winnerImage: '',
    winnerThumbnail: '',
    projectLink: '',
    hackathonName: '',
    year: new Date().getFullYear(),
    isActive: true,
    isFeatured: false,
    order: 0,
    linkedInUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  });

  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<{ winnerImage?: string; winnerThumbnail?: string }>({});

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
      data.sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        return a.order - b.order;
      });
      setWinners(data);
    } catch {
      setError('Error fetching hackathon winners');
    } finally {
      setLoading(false);
    }
  };

  const validateImage = (file: File): string | null => {
    if (!ACCEPTED_TYPES[file.type] && !ACCEPTED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(`.${ext}`))) {
      return 'Invalid file type. Accepted: JPG, PNG, WEBP';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Image exceeds 5 MB limit';
    }
    return null;
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const processAndUpload = async (blob: Blob, fileName: string) => {
    setProcessing(true);
    setError('');

    try {
      const mainBlob = await compressImage(new File([blob], fileName), 1200, 0.85);
      const thumbBlob = await compressImage(new File([blob], fileName), 400, 0.7);

      const timestamp = Date.now();
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);

      const mainRef = ref(storage, `hackathon-winners/${timestamp}_${sanitizedName}_main.jpg`);
      const thumbRef = ref(storage, `hackathon-winners/${timestamp}_${sanitizedName}_thumb.jpg`);

      const [mainResult, thumbResult] = await Promise.all([
        uploadBytes(mainRef, mainBlob, { contentType: 'image/jpeg' }),
        uploadBytes(thumbRef, thumbBlob, { contentType: 'image/jpeg' }),
      ]);

      const [mainUrl, thumbUrl] = await Promise.all([
        getDownloadURL(mainResult.ref),
        getDownloadURL(thumbResult.ref),
      ]);

      setFormData(prev => ({
        ...prev,
        winnerImage: mainUrl,
        winnerThumbnail: thumbUrl,
      }));

      setUploadedFiles({ winnerImage: mainUrl, winnerThumbnail: thumbUrl });

      setSuccess('Image processed and uploaded');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to process or upload image');
    } finally {
      setProcessing(false);
    }
  };

  const openCropper = (file: File) => {
    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setCropperImageUrl(localUrl);
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropper(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const croppedUrl = URL.createObjectURL(croppedBlob);
    setPreviewUrl(croppedUrl);
    await processAndUpload(croppedBlob, 'cropped.jpg');
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) openCropper(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) openCropper(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getImageUrl = () => formData.winnerImage || formData.imageUrl || previewUrl;

  const handleRemoveImage = async () => {
    const currentImage = formData.winnerImage;
    const currentThumb = formData.winnerThumbnail;
    const currentLegacyImage = formData.imageUrl;

    try {
      if (currentImage) {
        try { await deleteObject(ref(storage, currentImage)); } catch { /* ignore */ }
      }
      if (currentThumb) {
        try { await deleteObject(ref(storage, currentThumb)); } catch { /* ignore */ }
      }
    } catch { /* ignore */ }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setFormData(prev => ({ ...prev, winnerImage: '', winnerThumbnail: '', imageUrl: currentLegacyImage || '' }));
    setPreviewUrl('');
    setUploadedFiles({});
  };

  const handleReplace = () => fileInputRef.current?.click();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) { setError('Winner name is required'); return; }
    if (!formData.projectTitle.trim()) { setError('Project title is required'); return; }
    if (!formData.hackathonName.trim()) { setError('Hackathon name is required'); return; }

    setProcessing(true);
    setError('');

    try {
      const dataToSave = {
        name: formData.name.trim(),
        collegeName: formData.collegeName.trim(),
        department: formData.department.trim(),
        projectTitle: formData.projectTitle.trim(),
        projectDescription: formData.projectDescription.trim(),
        position: formData.position,
        prize: formData.prize.trim(),
        imageUrl: formData.winnerImage || formData.imageUrl,
        winnerImage: formData.winnerImage,
        winnerThumbnail: formData.winnerThumbnail,
        projectLink: formData.projectLink.trim(),
        hackathonName: formData.hackathonName.trim(),
        year: formData.year,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        order: formData.order,
        linkedInUrl: formData.linkedInUrl.trim(),
        githubUrl: formData.githubUrl.trim(),
        portfolioUrl: formData.portfolioUrl.trim(),
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        await updateDoc(doc(db, 'hackathonWinners', editingId), dataToSave);
        setSuccess('Winner updated successfully');
      } else {
        await addDoc(collection(db, 'hackathonWinners'), {
          ...dataToSave,
          createdAt: new Date().toISOString(),
        });
        setSuccess('Winner added successfully');
      }

      setTimeout(() => setSuccess(''), 3000);
      resetForm();
      fetchWinners();
      setShowForm(false);
    } catch {
      setError('Error saving winner');
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = (winner: HackathonWinner) => {
    setFormData({
      name: winner.name,
      collegeName: winner.collegeName || '',
      department: winner.department || '',
      projectTitle: winner.projectTitle,
      projectDescription: winner.projectDescription,
      position: winner.position,
      prize: winner.prize || '',
      imageUrl: winner.imageUrl || '',
      winnerImage: winner.winnerImage || '',
      winnerThumbnail: winner.winnerThumbnail || '',
      projectLink: winner.projectLink || '',
      hackathonName: winner.hackathonName,
      year: winner.year,
      isActive: winner.isActive,
      isFeatured: winner.isFeatured || false,
      order: winner.order,
      linkedInUrl: winner.linkedInUrl || '',
      githubUrl: winner.githubUrl || '',
      portfolioUrl: winner.portfolioUrl || '',
    });
    setPreviewUrl('');
    setUploadedFiles({});
    setEditingId(winner.id);
    setShowForm(true);
  };

  const handleDelete = async (winner: HackathonWinner) => {
    if (!window.confirm(`Delete winner "${winner.name}"?`)) return;
    try {
      const urls = [winner.winnerImage, winner.winnerThumbnail, winner.imageUrl].filter(Boolean);
      await Promise.allSettled(urls.map(url => deleteObject(ref(storage, url)).catch(() => {})));
      await deleteDoc(doc(db, 'hackathonWinners', winner.id));
      setSuccess('Winner deleted');
      setTimeout(() => setSuccess(''), 3000);
      fetchWinners();
    } catch {
      setError('Error deleting winner');
    }
  };

  const handleToggleActive = async (winner: HackathonWinner) => {
    try {
      await updateDoc(doc(db, 'hackathonWinners', winner.id), { isActive: !winner.isActive });
      fetchWinners();
    } catch {
      setError('Error updating winner');
    }
  };

  const handleToggleFeatured = async (winner: HackathonWinner) => {
    try {
      await updateDoc(doc(db, 'hackathonWinners', winner.id), { isFeatured: !winner.isFeatured });
      fetchWinners();
    } catch {
      setError('Error updating winner');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      collegeName: '',
      department: '',
      projectTitle: '',
      projectDescription: '',
      position: '1st',
      prize: '',
      imageUrl: '',
      winnerImage: '',
      winnerThumbnail: '',
      projectLink: '',
      hackathonName: '',
      year: new Date().getFullYear(),
      isActive: true,
      isFeatured: false,
      order: winners.length,
      linkedInUrl: '',
      githubUrl: '',
      portfolioUrl: '',
    });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setUploadedFiles({});
    setEditingId(null);
    setShowForm(false);
  };

  const updateForm = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const currentImage = getImageUrl();
  const pos = getPositionStyle(formData.position);
  const previewCardImage = formData.winnerImage || formData.imageUrl || previewUrl;

  return (
    <AdminLayout>
      {showCropper && cropperImageUrl && (
        <ImageCropper
          imageUrl={cropperImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCancelCrop}
          aspect={4/3}
          cropShape="rect"
        />
      )}
      <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hackathon Winners</h1>
            <p className="text-gray-500 mt-1">Manage winner profiles, photos, and featured placements</p>
          </div>
          {!showForm && (
            <button
              onClick={() => {
                setFormData(prev => ({ ...prev, order: winners.length }));
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-200 font-semibold text-sm"
            >
              <Plus size={18} />
              Add Winner
            </button>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
              <X size={18} />
            </button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <p className="text-sm text-emerald-800 font-medium">{success}</p>
            <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-emerald-600 ml-auto">
              <X size={18} />
            </button>
          </div>
        )}

        {/* ===== FORM PANEL WITH LIVE PREVIEW ===== */}
        {showForm && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Form */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    {editingId ? 'Edit Winner' : 'New Winner'}
                  </h2>
                  <p className="text-sm text-gray-500">Fill in the winner details below</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                  {/* ===== IMAGE UPLOAD SECTION ===== */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold text-gray-800">Winner Photo</h3>
                      {currentImage && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {formData.winnerImage ? 'Uploaded to storage' : 'Pending upload'}
                        </span>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {currentImage ? (
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="relative bg-gray-50">
                          <div className="flex items-center justify-center p-6">
                            <div className="relative w-56 h-56 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm group">
                              <img
                                src={currentImage}
                                alt="Winner preview"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                          </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100">
                          {processing ? (
                            <div className="flex items-center justify-center gap-3 py-2">
                              <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                              <span className="text-sm font-medium text-gray-600">Uploading to storage...</span>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={handleReplace}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition text-sm font-medium shadow-sm"
                              >
                                <Upload size={14} />
                                Replace Photo
                              </button>
                              <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition text-sm font-medium shadow-sm"
                              >
                                <Trash2 size={14} />
                                Remove
                              </button>
                              {(formData.winnerImage || formData.imageUrl) && (
                                <a
                                  href={formData.winnerImage || formData.imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition text-sm font-medium shadow-sm"
                                >
                                  <ExternalLink size={14} />
                                  Open Original
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                          isDragging
                            ? 'border-orange-400 bg-orange-50 scale-[1.01]'
                            : 'border-gray-300 bg-gray-50/50 hover:border-orange-300 hover:bg-orange-50/30 hover:shadow-md'
                        }`}
                      >
                        <div className="py-14 px-8">
                          <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center transition-all ${
                            isDragging
                              ? 'bg-orange-200 scale-110'
                              : 'bg-gradient-to-br from-orange-100 to-orange-50'
                          }`}>
                            <Upload size={28} className={`transition-colors ${
                              isDragging ? 'text-orange-600' : 'text-orange-500'
                            }`} />
                          </div>
                          <p className="text-base font-semibold text-gray-700 mb-1">
                            {isDragging ? 'Drop your image here' : 'Drop image here or click to browse'}
                          </p>
                          <p className="text-xs text-gray-400 mb-6">
                            Supports JPG, PNG, WEBP &middot; Max 5 MB
                          </p>
                          <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md font-medium text-sm hover:shadow-lg hover:shadow-orange-200">
                            <Upload size={16} />
                            Choose Photo
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ===== WINNER INFORMATION ===== */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">Winner Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Winner Name *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => updateForm('name', e.target.value)}
                          placeholder="e.g. Sarah Johnson"
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">College Name</label>
                        <input
                          type="text"
                          value={formData.collegeName}
                          onChange={(e) => updateForm('collegeName', e.target.value)}
                          placeholder="e.g. MIT University"
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        <input
                          type="text"
                          value={formData.department}
                          onChange={(e) => updateForm('department', e.target.value)}
                          placeholder="e.g. Computer Science"
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Project Title *</label>
                        <input
                          type="text"
                          value={formData.projectTitle}
                          onChange={(e) => updateForm('projectTitle', e.target.value)}
                          placeholder="e.g. AI-Powered Health Assistant"
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                        />
                      </div>
                    </div>
                    <div className="mt-5 space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Project Description</label>
                      <textarea
                        value={formData.projectDescription}
                        onChange={(e) => updateForm('projectDescription', e.target.value)}
                        placeholder="Describe the project, its impact, and key achievements..."
                        rows={4}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition resize-y"
                      />
                    </div>
                  </div>

                  {/* ===== EVENT DETAILS ===== */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">Event Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Hackathon Name *</label>
                        <input
                          type="text"
                          value={formData.hackathonName}
                          onChange={(e) => updateForm('hackathonName', e.target.value)}
                          placeholder="e.g. Niklaus Innovation Hackathon"
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Year</label>
                        <input
                          type="number"
                          value={formData.year}
                          onChange={(e) => updateForm('year', parseInt(e.target.value) || new Date().getFullYear())}
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Position</label>
                        <div className="grid grid-cols-2 gap-2">
                          {POSITIONS.map((posOption) => (
                            <button
                              key={posOption.value}
                              type="button"
                              onClick={() => updateForm('position', posOption.value)}
                              className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                                formData.position === posOption.value
                                  ? `${posOption.bg} ${posOption.text} ${posOption.border} border-2`
                                  : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                              }`}
                            >
                              {posOption.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Prize</label>
                        <input
                          type="text"
                          value={formData.prize}
                          onChange={(e) => updateForm('prize', e.target.value)}
                          placeholder="e.g. $5,000 + Internship"
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ===== SOCIAL LINKS ===== */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">Social Profiles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          <span className="inline-flex items-center gap-1.5">
                            <Linkedin size={14} className="text-blue-600" />
                            LinkedIn URL
                          </span>
                        </label>
                        <input
                          type="url"
                          value={formData.linkedInUrl}
                          onChange={(e) => updateForm('linkedInUrl', e.target.value)}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          <span className="inline-flex items-center gap-1.5">
                            <Github size={14} />
                            GitHub URL
                          </span>
                        </label>
                        <input
                          type="url"
                          value={formData.githubUrl}
                          onChange={(e) => updateForm('githubUrl', e.target.value)}
                          placeholder="https://github.com/..."
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          <span className="inline-flex items-center gap-1.5">
                            <Globe size={14} className="text-gray-500" />
                            Portfolio URL
                          </span>
                        </label>
                        <input
                          type="url"
                          value={formData.portfolioUrl}
                          onChange={(e) => updateForm('portfolioUrl', e.target.value)}
                          placeholder="https://myportfolio.com/..."
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Project Link</label>
                        <input
                          type="url"
                          value={formData.projectLink}
                          onChange={(e) => updateForm('projectLink', e.target.value)}
                          placeholder="https://project-demo.com/..."
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ===== SETTINGS ===== */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Display Order</label>
                        <input
                          type="number"
                          value={formData.order}
                          onChange={(e) => updateForm('order', parseInt(e.target.value) || 0)}
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                        />
                      </div>
                      <div className="flex items-end pb-2.5">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={formData.isActive}
                              onChange={(e) => updateForm('isActive', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-5.5 bg-gray-200 rounded-full peer-checked:bg-green-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4.5 after:h-4.5 after:bg-white after:rounded-full after:shadow after:transition-all peer-checked:after:translate-x-[18px]" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Visible on website</span>
                        </label>
                      </div>
                      <div className="flex items-end pb-2.5">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={formData.isFeatured}
                              onChange={(e) => updateForm('isFeatured', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-5.5 bg-gray-200 rounded-full peer-checked:bg-orange-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4.5 after:h-4.5 after:bg-white after:rounded-full after:shadow after:transition-all peer-checked:after:translate-x-[18px]" />
                          </div>
                          <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                            <Star size={14} className="text-orange-500" />
                            Featured winner
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* ===== FORM ACTIONS ===== */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={processing}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold text-sm shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      {editingId ? 'Update Winner' : 'Add Winner'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right: Live Preview */}
            <div className="w-full lg:w-80 xl:w-96 shrink-0">
              <div className="lg:sticky lg:top-6 space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="border-b border-gray-100 px-5 py-3.5">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Eye size={16} className="text-orange-500" />
                      Website Preview
                    </h3>
                  </div>
                  <div className="p-5">
                    <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                      {/* Position Badge */}
                      <div className={`bg-gradient-to-r ${pos.gradient} px-4 py-2.5 flex items-center gap-2`}>
                        <Trophy size={16} className="text-white" />
                        <span className="text-white font-bold text-sm drop-shadow-sm">{pos.label}</span>
                      </div>

                      {/* Preview Image */}
                      <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden">
                        {previewCardImage ? (
                          <img
                            src={previewCardImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <Upload size={28} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500">No image selected</p>
                          </div>
                        )}
                      </div>

                      {/* Preview Content */}
                      <div className="p-4 space-y-2">
                        <div>
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {formData.name || 'Winner Name'}
                          </p>
                          {formData.collegeName && (
                            <p className="text-xs text-gray-500 truncate">{formData.collegeName}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {formData.projectTitle || 'Project Title'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {formData.hackathonName || 'Hackathon Name'} {formData.year || ''}
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {formData.projectDescription || 'Short description of the project will appear here...'}
                        </p>
                        {formData.prize && (
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Prize</p>
                            <p className="text-sm font-bold text-orange-600">{formData.prize}</p>
                          </div>
                        )}
                        {(formData.linkedInUrl || formData.githubUrl || formData.portfolioUrl) && (
                          <div className="flex gap-2 pt-1">
                            {formData.linkedInUrl && (
                              <span className="p-1.5 rounded-md bg-blue-50 text-blue-600"><Linkedin size={14} /></span>
                            )}
                            {formData.githubUrl && (
                              <span className="p-1.5 rounded-md bg-gray-100 text-gray-600"><Github size={14} /></span>
                            )}
                            {formData.portfolioUrl && (
                              <span className="p-1.5 rounded-md bg-orange-50 text-orange-600"><Globe size={14} /></span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center">Preview updates in real time</p>
              </div>
            </div>
          </div>
        )}

        {/* ===== WINNERS TABLE ===== */}
        {!showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : winners.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                  <Trophy size={28} className="text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">No winners yet</h3>
                <p className="text-sm text-gray-500 mb-6">Add your first hackathon winner to showcase achievements</p>
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, order: 0 }));
                    setShowForm(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-200 font-semibold text-sm"
                >
                  <Plus size={18} />
                  Add Winner
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Winner</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Project</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Position</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {winners.map((winner) => {
                      const posStyle = getPositionStyle(winner.position);
                      return (
                        <tr key={winner.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                {(winner.winnerImage || winner.imageUrl) ? (
                                  <img
                                    src={winner.winnerImage || winner.imageUrl}
                                    alt={winner.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Trophy size={16} className="text-gray-300" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{winner.name}</p>
                                  {winner.isFeatured && (
                                    <Star size={12} className="text-orange-500 fill-orange-500 shrink-0" />
                                  )}
                                </div>
                                {winner.collegeName && (
                                  <p className="text-xs text-gray-500 truncate">{winner.collegeName}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                              {winner.projectTitle}
                            </p>
                            <p className="text-xs text-gray-500">{winner.hackathonName} {winner.year}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${posStyle.bg} ${posStyle.text}`}>
                              {posStyle.label}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                              winner.isActive ? 'text-emerald-700' : 'text-gray-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                winner.isActive ? 'bg-emerald-500' : 'bg-gray-300'
                              }`} />
                              {winner.isActive ? 'Active' : 'Hidden'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleToggleFeatured(winner)}
                                className={`p-2 rounded-lg transition ${
                                  winner.isFeatured
                                    ? 'text-orange-500 bg-orange-50 hover:bg-orange-100'
                                    : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'
                                }`}
                                title={winner.isFeatured ? 'Unfeature' : 'Feature'}
                              >
                                <Star size={15} className={winner.isFeatured ? 'fill-orange-500' : ''} />
                              </button>
                              <button
                                onClick={() => handleToggleActive(winner)}
                                className={`p-2 rounded-lg transition ${
                                  winner.isActive
                                    ? 'text-emerald-600 hover:bg-emerald-50'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                }`}
                                title={winner.isActive ? 'Hide from website' : 'Show on website'}
                              >
                                {winner.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
                              </button>
                              <button
                                onClick={() => handleEdit(winner)}
                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                                title="Edit"
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                              </button>
                              <button
                                onClick={() => handleDelete(winner)}
                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default HackathonWinnersManagement;
