import React, { useEffect, useRef, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import {
  Upload,
  Trash2,
  Search,
  Copy,
  Check,
  X,
  Edit,
  Globe,
  Lock,
  FileText,
  Download,
  AlertCircle,
  Plus,
  Filter,
  Eye,
} from 'lucide-react';
import { db, storage } from '../config/firebase';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

interface SharedFile {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  fileType: string;
  fileSize: number;
  category: string;
  isPublic: boolean;
  assignedStudents: string[]; // array of student document IDs
  uploadedBy: string;
  uploadedAt: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

const CATEGORIES = ['Notes', 'Assignment', 'Software', 'Resources', 'Certificate', 'Other'];

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getFileIcon = (fileType: string): string => {
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return '🗜️';
  if (fileType.includes('image')) return '🖼️';
  if (fileType.includes('video')) return '🎬';
  if (fileType.includes('audio')) return '🎵';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📊';
  return '📁';
};

export const FileManagement: React.FC = () => {
  const { admin } = useAuth();

  // Data state
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAccess, setFilterAccess] = useState<'all' | 'public' | 'private'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload state
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state (shared by upload & edit)
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Notes');
  const [formIsPublic, setFormIsPublic] = useState(true);
  const [formAssignedStudents, setFormAssignedStudents] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const studentDropdownRef = useRef<HTMLDivElement>(null);

  // Edit modal state
  const [editingFile, setEditingFile] = useState<SharedFile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  // Preview modal state
  const [previewFile, setPreviewFile] = useState<SharedFile | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Close student dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(e.target as Node)) {
        setShowStudentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 6000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [filesSnap, studentsSnap] = await Promise.all([
        getDocs(query(collection(db, 'sharedFiles'), orderBy('uploadedAt', 'desc'))),
        getDocs(collection(db, 'students')),
      ]);

      setFiles(
        filesSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<SharedFile, 'id'>),
        }))
      );

      setStudents(
        studentsSnap.docs.map((d) => ({
          id: d.id,
          name: d.data().name || 'Unknown',
          email: d.data().email || '',
        }))
      );
    } catch (err) {
      console.error(err);
      setError('Failed to load files. Check Firestore permissions.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Notes');
    setFormIsPublic(true);
    setFormAssignedStudents([]);
    setStudentSearch('');
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile) { setError('Please select a file to upload.'); return; }
    if (!formTitle.trim()) { setError('Please enter a file title.'); return; }
    if (!formIsPublic && formAssignedStudents.length === 0) {
      setError('Please select at least one student for private access.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const safeFileName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `sharedFiles/${timestamp}_${safeFileName}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          (err) => reject(err),
          () => resolve()
        );
      });

      const fileUrl = await getDownloadURL(uploadTask.snapshot.ref);

      await addDoc(collection(db, 'sharedFiles'), {
        title: formTitle.trim(),
        description: formDescription.trim(),
        fileName: selectedFile.name,
        fileUrl,
        storagePath,
        fileType: selectedFile.type || 'application/octet-stream',
        fileSize: selectedFile.size,
        category: formCategory,
        isPublic: formIsPublic,
        assignedStudents: formIsPublic ? [] : formAssignedStudents,
        uploadedBy: admin?.email || 'admin',
        uploadedAt: timestamp,
      });

      setSuccess(`"${formTitle}" uploaded successfully.`);
      resetForm();
      setShowUploadPanel(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      setError(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file: SharedFile) => {
    if (!window.confirm(`Delete "${file.title}"? This cannot be undone.`)) return;
    try {
      // Delete from Storage
      try {
        const storageRef = ref(storage, file.storagePath);
        await deleteObject(storageRef);
      } catch (storageErr: any) {
        // If file not found in storage, still delete Firestore record
        if (storageErr.code !== 'storage/object-not-found') {
          console.warn('Storage delete error:', storageErr);
        }
      }
      // Delete from Firestore
      await deleteDoc(doc(db, 'sharedFiles', file.id));
      setSuccess(`"${file.title}" deleted.`);
      fetchData();
    } catch (err: any) {
      setError(`Delete failed: ${err.message}`);
    }
  };

  const handleCopyLink = (file: SharedFile) => {
    navigator.clipboard.writeText(file.fileUrl).then(() => {
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const openEditModal = (file: SharedFile) => {
    setEditingFile(file);
    setFormTitle(file.title);
    setFormDescription(file.description);
    setFormCategory(file.category);
    setFormIsPublic(file.isPublic);
    setFormAssignedStudents(file.assignedStudents || []);
    setStudentSearch('');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingFile) return;
    if (!formTitle.trim()) { setError('Title is required.'); return; }
    if (!formIsPublic && formAssignedStudents.length === 0) {
      setError('Select at least one student for private access.');
      return;
    }
    setEditSaving(true);
    try {
      await updateDoc(doc(db, 'sharedFiles', editingFile.id), {
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory,
        isPublic: formIsPublic,
        assignedStudents: formIsPublic ? [] : formAssignedStudents,
      });
      setSuccess('File updated.');
      setShowEditModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      setError(`Update failed: ${err.message}`);
    } finally {
      setEditSaving(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setFormAssignedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const getStudentName = (id: string) =>
    students.find((s) => s.id === id)?.name || id;

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredFiles = files.filter((f) => {
    const matchSearch =
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAccess =
      filterAccess === 'all' ||
      (filterAccess === 'public' && f.isPublic) ||
      (filterAccess === 'private' && !f.isPublic);
    const matchCategory = filterCategory === 'all' || f.category === filterCategory;
    return matchSearch && matchAccess && matchCategory;
  });

  const studentPickerUI = (
    <div className="relative" ref={studentDropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Assign to Students <span className="text-red-500">*</span>
      </label>
      {/* Selected tags */}
      {formAssignedStudents.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {formAssignedStudents.map((id) => (
            <span
              key={id}
              className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
            >
              {getStudentName(id)}
              <button
                type="button"
                onClick={() => toggleStudentSelection(id)}
                className="hover:text-red-600"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={studentSearch}
        onChange={(e) => { setStudentSearch(e.target.value); setShowStudentDropdown(true); }}
        onFocus={() => setShowStudentDropdown(true)}
        placeholder="Search students..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {showStudentDropdown && filteredStudents.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredStudents.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => toggleStudentSelection(s.id)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center justify-between ${
                formAssignedStudents.includes(s.id) ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <span>
                <span className="font-medium">{s.name}</span>
                <span className="text-gray-500 ml-2">{s.email}</span>
              </span>
              {formAssignedStudents.includes(s.id) && <Check size={14} className="text-blue-600" />}
            </button>
          ))}
        </div>
      )}
      {showStudentDropdown && filteredStudents.length === 0 && studentSearch && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow p-3 text-sm text-gray-500">
          No students found
        </div>
      )}
    </div>
  );

  const formFields = (isEdit = false) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          placeholder="e.g., Python Cheat Sheet, VS Code Installer"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formDescription}
          onChange={(e) => setFormDescription(e.target.value)}
          rows={2}
          placeholder="Optional description or instructions..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={formCategory}
          onChange={(e) => setFormCategory(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Access Type</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setFormIsPublic(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 text-sm font-medium transition ${
              formIsPublic
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <Globe size={16} />
            Global (Public Link)
          </button>
          <button
            type="button"
            onClick={() => setFormIsPublic(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 text-sm font-medium transition ${
              !formIsPublic
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <Lock size={16} />
            Private (Specific Students)
          </button>
        </div>
        {formIsPublic && (
          <p className="text-xs text-gray-500 mt-1">
            ✅ All logged-in students can see and download this file.
          </p>
        )}
      </div>

      {!formIsPublic && studentPickerUI}
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">File Sharing</h1>
            <p className="text-gray-500 text-sm mt-1">
              Upload and share files (PDF, EXE, APK, ZIP, RAR, etc.) with students
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowUploadPanel(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <Plus size={18} />
            Upload File
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4 flex items-start gap-2">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
            <Check size={18} />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Files', value: files.length, color: 'blue' },
            { label: 'Public Files', value: files.filter((f) => f.isPublic).length, color: 'green' },
            { label: 'Private Files', value: files.filter((f) => !f.isPublic).length, color: 'purple' },
            { label: 'Students', value: students.length, color: 'orange' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-lg shadow-sm border p-4">
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Upload Panel */}
        {showUploadPanel && (
          <div className="bg-white rounded-xl shadow-md border mb-6 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-blue-50">
              <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                <Upload size={20} /> Upload New File
              </h2>
              <button onClick={() => { setShowUploadPanel(false); resetForm(); }} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-6">
              {/* File Drop Zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) setSelectedFile(file);
                  }}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                >
                  {selectedFile ? (
                    <div>
                      <span className="text-4xl">{getFileIcon(selectedFile.type)}</span>
                      <p className="font-semibold text-gray-700 mt-2 break-all">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">{formatBytes(selectedFile.size)}</p>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="mt-2 text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={36} className="mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600 font-medium">Click or drag & drop any file</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, EXE, APK, ZIP, RAR, DOCX, MP4 and more</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file);
                  }}
                />

                {uploading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div>
                {formFields(false)}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleUpload}
                    disabled={uploading || !selectedFile}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Uploading {uploadProgress}%
                      </>
                    ) : (
                      <>
                        <Upload size={16} /> Upload File
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => { setShowUploadPanel(false); resetForm(); }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filterAccess}
              onChange={(e) => setFilterAccess(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Access</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <span className="text-sm text-gray-500 ml-auto">
            {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Files Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <span className="ml-3 text-gray-500">Loading files...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-16">
              <FileText size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">
                {files.length === 0 ? 'No files uploaded yet' : 'No files match your filters'}
              </p>
              {files.length === 0 && (
                <button
                  onClick={() => setShowUploadPanel(true)}
                  className="mt-3 text-blue-600 hover:underline text-sm"
                >
                  Upload your first file
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">File</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Access</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Size</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Uploaded</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getFileIcon(file.fileType)}</span>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate max-w-xs">{file.title}</p>
                            <p className="text-xs text-gray-400 truncate max-w-xs">{file.fileName}</p>
                            {file.description && (
                              <p className="text-xs text-gray-500 truncate max-w-xs">{file.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                          {file.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {file.isPublic ? (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                            <Globe size={11} /> Public
                          </span>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                              <Lock size={11} /> Private
                            </span>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {file.assignedStudents?.length || 0} student{(file.assignedStudents?.length || 0) !== 1 ? 's' : ''}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatBytes(file.fileSize)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Preview / Open"
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                          >
                            <Eye size={16} />
                          </a>
                          <button
                            onClick={() => handleCopyLink(file)}
                            title="Copy download link"
                            className={`p-1.5 rounded-md transition ${
                              copiedId === file.id
                                ? 'bg-green-100 text-green-600'
                                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {copiedId === file.id ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                          <a
                            href={file.fileUrl}
                            download={file.fileName}
                            title="Download"
                            className="p-1.5 rounded-md hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition"
                          >
                            <Download size={16} />
                          </a>
                          <button
                            onClick={() => openEditModal(file)}
                            title="Edit"
                            className="p-1.5 rounded-md hover:bg-yellow-100 text-gray-500 hover:text-yellow-600 transition"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(file)}
                            title="Delete"
                            className="p-1.5 rounded-md hover:bg-red-100 text-gray-500 hover:text-red-600 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && editingFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b bg-yellow-50 shrink-0">
                <h2 className="text-lg font-bold text-yellow-800 flex items-center gap-2">
                  <Edit size={18} /> Edit File Settings
                </h2>
                <button
                  onClick={() => { setShowEditModal(false); resetForm(); }}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-yellow-100 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body — scrollable */}
              <div className="overflow-y-auto flex-1 p-6">
                {/* File info banner */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6 border">
                  <span className="text-4xl shrink-0">{getFileIcon(editingFile.fileType)}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{editingFile.title}</p>
                    <p className="text-sm text-gray-500 truncate">{editingFile.fileName}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">{formatBytes(editingFile.fileSize)}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-400">
                        Uploaded {new Date(editingFile.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <a
                    href={editingFile.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1.5 text-sm text-blue-600 hover:underline font-medium ml-auto"
                  >
                    <Eye size={14} /> Preview
                  </a>
                </div>

                {/* Two-column form on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left column: title, description, category */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="File title"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        rows={3}
                        placeholder="Optional description or instructions..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Right column: access type + student picker */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Access Type</label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setFormIsPublic(true)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition ${
                            formIsPublic
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <Globe size={16} /> Global
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormIsPublic(false)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition ${
                            !formIsPublic
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <Lock size={16} /> Private
                        </button>
                      </div>
                      {formIsPublic && (
                        <p className="text-xs text-gray-500 mt-1.5">
                          ✅ All logged-in students can see and download this file.
                        </p>
                      )}
                    </div>

                    {!formIsPublic && studentPickerUI}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t bg-gray-50 shrink-0 flex items-center justify-end gap-3">
                <button
                  onClick={() => { setShowEditModal(false); resetForm(); }}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={editSaving}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  {editSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Check size={16} />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
