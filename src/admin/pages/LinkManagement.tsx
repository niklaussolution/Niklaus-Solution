import React, { useEffect, useRef, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import {
  Link2,
  Plus,
  Trash2,
  Copy,
  Check,
  X,
  Edit,
  Globe,
  Lock,
  Search,
  Filter,
  AlertCircle,
  ExternalLink,
  Eye,
  BarChart2,
  Save,
  Settings,
} from 'lucide-react';
import { db } from '../config/firebase';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  setDoc,
} from 'firebase/firestore';
import {
  getMaskedDomainSettings,
  validateAndSaveMaskedDomain,
} from '../services/maskedDomainService';

interface MaskedLink {
  id: string;
  title: string;
  description: string;
  originalUrl: string;
  shortCode: string;
  isPublic: boolean;
  assignedStudents: string[];
  createdBy: string;
  createdAt: number;
  clickCount: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

const generateShortCode = (): string => {
  // Generate 16 random bytes and convert to hex — completely random, no recognizable patterns
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  let hex = '';
  array.forEach((b) => { hex += b.toString(16).padStart(2, '0'); });
  // Format as UUID-like: 8-4-4-4-12 for better readability
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
};

// Generate a unique short code by checking against Firestore
const generateUniqueShortCode = async (existingCodes: string[]): Promise<string> => {
  let shortCode = generateShortCode();
  let attempts = 0;
  
  while (existingCodes.includes(shortCode) && attempts < 10) {
    shortCode = generateShortCode();
    attempts++;
  }
  
  if (attempts >= 10) {
    console.warn('⚠ Could not generate unique code after 10 attempts, using timestamp-based fallback');
    return `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  return shortCode;
};

// Validate and normalize URL
const validateAndNormalizeUrl = (url: string): { isValid: boolean; error?: string; normalized?: string } => {
  if (!url.trim()) {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    const urlObj = new URL(url);
    // Ensure it has a complete domain with TLD
    const hostname = urlObj.hostname;
    if (!hostname.includes('.')) {
      return { isValid: false, error: 'Please enter a complete domain with TLD (e.g., example.com, go.niklaus.com)' };
    }
    return { isValid: true, normalized: urlObj.toString() };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL (e.g., https://go.niklaus.com)' };
  }
};

let maskedDomainUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-masked-domain.com';

const truncateUrl = (url: string, max = 75): string =>
  url.length > max ? url.slice(0, max) + '…' : url;

export const LinkManagement: React.FC = () => {
  const { admin } = useAuth();

  const [links, setLinks] = useState<MaskedLink[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAccess, setFilterAccess] = useState<'all' | 'public' | 'private'>('all');
  const [maskedDomain, setMaskedDomain] = useState<string>(window.location.origin);
  
  // Masked domain configuration state
  const [editingMaskedDomain, setEditingMaskedDomain] = useState(false);
  const [maskedDomainInput, setMaskedDomainInput] = useState('');
  const [savingMaskedDomain, setSavingMaskedDomain] = useState(false);
  const [maskedDomainError, setMaskedDomainError] = useState('');
  const [maskedDomainSuccess, setMaskedDomainSuccess] = useState('');

  // Function to get masked URL using the current state
  const getMaskedUrl = (shortCode: string): string => {
    // Remove trailing slash if present to avoid double slashes
    const cleanDomain = maskedDomain.endsWith('/') ? maskedDomain.slice(0, -1) : maskedDomain;
    return `${cleanDomain}/r/${shortCode}`;
  };

  const truncateUrl = (url: string, max = 55): string =>
    url.length > max ? url.slice(0, max) + '…' : url;

  // Panel / modal state
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLink, setEditingLink] = useState<MaskedLink | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formIsPublic, setFormIsPublic] = useState(true);
  const [formAssignedStudents, setFormAssignedStudents] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const studentDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchData(); }, []);

  // Handler to save masked domain URL
  const handleSaveMaskedDomain = async () => {
    setMaskedDomainError('');
    setMaskedDomainSuccess('');

    if (!maskedDomainInput.trim()) {
      setMaskedDomainError('Masked domain URL is required');
      return;
    }

    setSavingMaskedDomain(true);
    try {
      // Use the new service to save and validate
      const result = await validateAndSaveMaskedDomain(maskedDomainInput, admin?.email);
      
      if (!result.isValid) {
        setMaskedDomainError(result.error || 'Invalid URL');
        return;
      }

      const normalizedUrl = result.data?.url!;
      setMaskedDomain(normalizedUrl);
      setMaskedDomainInput(normalizedUrl);
      setMaskedDomainSuccess('✓ Masked domain URL saved successfully to urlMaskingSettings collection! Links will now use this domain.');
      setEditingMaskedDomain(false);

      // Clear success message after 4 seconds
      setTimeout(() => {
        setMaskedDomainSuccess('');
      }, 4000);
    } catch (err: any) {
      console.error('Error saving masked domain:', err);
      setMaskedDomainError(`Error: ${err.message}`);
    } finally {
      setSavingMaskedDomain(false);
    }
  };

  const handleCancelMaskedDomain = () => {
    setEditingMaskedDomain(false);
    setMaskedDomainInput(maskedDomain);
    setMaskedDomainError('');
  };

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(e.target as Node))
        setShowStudentDropdown(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(''), 4000); return () => clearTimeout(t); }
  }, [success]);
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(''), 6000); return () => clearTimeout(t); }
  }, [error]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [linksSnap, studentsSnap] = await Promise.all([
        getDocs(query(collection(db, 'maskedLinks'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'students')),
      ]);
      setLinks(linksSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MaskedLink, 'id'>) })));
      setStudents(studentsSnap.docs.map((d) => ({ id: d.id, name: d.data().name || 'Unknown', email: d.data().email || '' })));
      
      // Fetch masked domain from new dedicated collection
      const maskedDomainSettings = await getMaskedDomainSettings();
      if (maskedDomainSettings?.url) {
        console.log('✓ Masked domain loaded from urlMaskingSettings collection:', maskedDomainSettings.url);
        setMaskedDomain(maskedDomainSettings.url);
        setMaskedDomainInput(maskedDomainSettings.url);
      } else {
        console.warn('⚠ No masked domain URL found in urlMaskingSettings collection. Using default:', window.location.origin);
        setMaskedDomain(window.location.origin);
        setMaskedDomainInput('');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load links. Check Firestore permissions.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormUrl('');
    setFormIsPublic(true);
    setFormAssignedStudents([]);
    setStudentSearch('');
  };

  const validateUrl = (url: string): boolean => {
    try { 
      const urlObj = new URL(url);
      // Ensure it has a complete domain with TLD
      if (!urlObj.hostname.includes('.')) {
        return false;
      }
      return true; 
    } catch { 
      return false; 
    }
  };

  const handleCreate = async () => {
    if (!formTitle.trim()) { setError('Title is required.'); return; }
    if (!formUrl.trim()) { setError('URL is required.'); return; }
    if (!validateUrl(formUrl.trim())) { setError('Please enter a valid URL with complete domain (e.g., https://example.com). Include https://)'); return; }
    if (!formIsPublic && formAssignedStudents.length === 0) {
      setError('Select at least one student for private access.');
      return;
    }
    if (!maskedDomain || maskedDomain === window.location.origin || !maskedDomain.includes('.')) {
      setError('⚙️ Please configure a complete masked domain URL first (e.g., https://go.niklaus.com). Click "Configure" above.');
      return;
    }
    setSaving(true);
    try {
      // Generate unique short code
      const existingCodes = links.map((l) => l.shortCode);
      const shortCode = await generateUniqueShortCode(existingCodes);

      await addDoc(collection(db, 'maskedLinks'), {
        title: formTitle.trim(),
        description: formDescription.trim(),
        originalUrl: formUrl.trim(),
        shortCode,
        isPublic: formIsPublic,
        assignedStudents: formIsPublic ? [] : formAssignedStudents,
        createdBy: admin?.email || 'admin',
        createdAt: Date.now(),
        clickCount: 0,
      });
      setSuccess(`✓ Masked link created: ${getMaskedUrl(shortCode)}`);
      resetForm();
      setShowCreatePanel(false);
      fetchData();
    } catch (err: any) {
      setError(`Failed to create link: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (link: MaskedLink) => {
    setEditingLink(link);
    setFormTitle(link.title);
    setFormDescription(link.description);
    setFormUrl(link.originalUrl);
    setFormIsPublic(link.isPublic);
    setFormAssignedStudents(link.assignedStudents || []);
    setStudentSearch('');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingLink) return;
    if (!formTitle.trim()) { setError('Title is required.'); return; }
    if (!formUrl.trim()) { setError('URL is required.'); return; }
    if (!validateUrl(formUrl.trim())) { setError('Please enter a valid URL (include https://).'); return; }
    if (!formIsPublic && formAssignedStudents.length === 0) {
      setError('Select at least one student for private access.');
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'maskedLinks', editingLink.id), {
        title: formTitle.trim(),
        description: formDescription.trim(),
        originalUrl: formUrl.trim(),
        isPublic: formIsPublic,
        assignedStudents: formIsPublic ? [] : formAssignedStudents,
      });
      setSuccess('Link updated successfully.');
      setShowEditModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      setError(`Update failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (link: MaskedLink) => {
    if (!window.confirm(`Delete masked link "${link.title}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'maskedLinks', link.id));
      setSuccess(`"${link.title}" deleted.`);
      fetchData();
    } catch (err: any) {
      setError(`Delete failed: ${err.message}`);
    }
  };

  const handleCopy = (link: MaskedLink) => {
    navigator.clipboard.writeText(getMaskedUrl(link.shortCode)).then(() => {
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const toggleStudent = (id: string) =>
    setFormAssignedStudents((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const getStudentName = (id: string) =>
    students.find((s) => s.id === id)?.name || id;

  const filteredStudents = students.filter(
    (s) => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredLinks = links.filter((l) => {
    const matchSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.shortCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAccess =
      filterAccess === 'all' ||
      (filterAccess === 'public' && l.isPublic) ||
      (filterAccess === 'private' && !l.isPublic);
    return matchSearch && matchAccess;
  });

  const studentPickerUI = (
    <div className="relative" ref={studentDropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Assign to Students <span className="text-red-500">*</span>
      </label>
      {formAssignedStudents.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {formAssignedStudents.map((id) => (
            <span key={id} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {getStudentName(id)}
              <button type="button" onClick={() => toggleStudent(id)} className="hover:text-red-600"><X size={12} /></button>
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
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-44 overflow-y-auto">
          {filteredStudents.map((s) => (
            <button key={s.id} type="button" onClick={() => toggleStudent(s.id)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center justify-between ${formAssignedStudents.includes(s.id) ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}>
              <span><span className="font-medium">{s.name}</span><span className="text-gray-400 ml-2">{s.email}</span></span>
              {formAssignedStudents.includes(s.id) && <Check size={14} className="text-blue-600" />}
            </button>
          ))}
        </div>
      )}
      {showStudentDropdown && filteredStudents.length === 0 && studentSearch && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow p-3 text-sm text-gray-500">No students found</div>
      )}
    </div>
  );

  const formBody = (
    <div className="space-y-6">
      {/* Masked Domain Status Banner */}
      <div className={`p-4 rounded-lg border-2 flex items-start gap-3 ${maskedDomain && maskedDomain !== window.location.origin ? 'bg-green-50 border-green-300' : 'bg-blue-50 border-blue-300'}`}>
        <div className={`mt-0.5 ${maskedDomain && maskedDomain !== window.location.origin ? 'text-green-600' : 'text-blue-600'}`}>
          {maskedDomain && maskedDomain !== window.location.origin ? '✓' : 'ℹ'}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">
            {maskedDomain && maskedDomain !== window.location.origin ? '✓ Custom Masked Domain Active' : 'ℹ Using Default Domain'}
          </p>
          <p className="text-xs text-gray-600 mt-1 font-mono">
            {maskedDomain && maskedDomain !== window.location.origin ? maskedDomain : window.location.origin}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g., Course Resources Drive, YouTube Demo Video"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Original URL <span className="text-red-500">*</span></label>
            <input type="url" value={formUrl} onChange={(e) => setFormUrl(e.target.value)}
              placeholder="https://drive.google.com/... or any URL"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono" />
            <p className="text-xs text-gray-400 mt-1">The real destination URL — students will only see the masked link.</p>
          </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)}
            rows={2} placeholder="Optional note for students..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
        </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          {/* Masked URL Preview */}
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-700 mb-2">📋 MASKED URL PREVIEW</p>
            <div className="space-y-2">
              <p className="text-xs text-gray-600 mb-1">What students will see:</p>
              <code className="block text-xs bg-white border border-blue-300 text-blue-700 font-mono p-2 rounded break-all">
                {getMaskedUrl('example-code-1234')}
              </code>
              <p className="text-xs text-gray-500 mt-2">
                ✓ Original URL completely hidden<br/>
                ✓ Points to: <code className="bg-gray-100 px-1 rounded text-xs">{maskedDomain}</code>
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Access Type</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setFormIsPublic(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition ${formIsPublic ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                <Globe size={15} /> Global
              </button>
              <button type="button" onClick={() => setFormIsPublic(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition ${!formIsPublic ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                <Lock size={15} /> Private
              </button>
            </div>
            {formIsPublic && <p className="text-xs text-gray-500 mt-1.5">✅ Anyone with the masked link can access the destination.</p>}
          </div>
          {!formIsPublic && studentPickerUI}
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Link2 size={24} className="text-blue-600" /> URL Masking
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Paste any URL — share a clean masked link that hides the original destination
            </p>
          </div>
          <button onClick={() => { resetForm(); setShowCreatePanel(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition">
            <Plus size={18} /> New Masked Link
          </button>
        </div>

        {/* Masked Domain Configuration Card */}
        <div className={`bg-white rounded-xl shadow-md border mb-6 overflow-hidden ${!maskedDomain || maskedDomain === window.location.origin || !maskedDomain.includes('.') ? 'border-red-300 bg-red-50' : 'border-green-300'}`}>
          <div className={`px-6 py-4 border-b ${!maskedDomain || maskedDomain === window.location.origin || !maskedDomain.includes('.') ? 'bg-red-100' : 'bg-green-50'}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-bold flex items-center gap-2 ${!maskedDomain || maskedDomain === window.location.origin || !maskedDomain.includes('.') ? 'text-red-800' : 'text-green-800'}`}>
                <Settings size={20} />
                URL Masking Configuration
              </h2>
              {!editingMaskedDomain && (
                <button
                  onClick={() => {
                    setEditingMaskedDomain(true);
                    setMaskedDomainInput(maskedDomain && maskedDomain !== window.location.origin ? maskedDomain : '');
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                >
                  <Edit size={16} /> {maskedDomain && maskedDomain !== window.location.origin && maskedDomain.includes('.') ? 'Edit' : 'Configure'}
                </button>
              )}
            </div>
          </div>

          <div className="px-6 py-4">
            {editingMaskedDomain ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Masked Domain URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={maskedDomainInput}
                    onChange={(e) => setMaskedDomainInput(e.target.value)}
                    placeholder="https://go.niklaus.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    📝 Enter the complete domain where masked links will be hosted. Examples:
                  </p>
                  <ul className="text-xs text-gray-400 mt-1 ml-4 space-y-1">
                    <li>✓ https://go.niklaus.com</li>
                    <li>✓ https://short.niklaus.com</li>
                    <li>✓ https://links.yoursite.com</li>
                    <li>✗ https://haihowareyu (incomplete - missing TLD)</li>
                    <li>✗ go.niklaus.com (missing https://)</li>
                  </ul>
                </div>

                {maskedDomainError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-700">{maskedDomainError}</p>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleCancelMaskedDomain}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMaskedDomain}
                    disabled={savingMaskedDomain}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition text-sm font-medium"
                  >
                    {savingMaskedDomain ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Configuration
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 text-lg ${maskedDomain && maskedDomain !== window.location.origin && maskedDomain.includes('.') ? 'text-green-600' : 'text-red-600'}`}>
                    {maskedDomain && maskedDomain !== window.location.origin && maskedDomain.includes('.') ? '✓' : '⚠'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">
                      {maskedDomain && maskedDomain !== window.location.origin && maskedDomain.includes('.') ? '✓ Custom Masked Domain Active' : '⚠ Masked Domain Not Configured'}
                    </p>
                    <p className="text-xs text-gray-600 font-mono break-all border border-gray-200 bg-gray-50 p-2 rounded mt-2">
                      {maskedDomain && maskedDomain !== window.location.origin && maskedDomain.includes('.') ? maskedDomain : 'Not configured - using default'}
                    </p>
                    {!maskedDomain || maskedDomain === window.location.origin || !maskedDomain.includes('.') ? (
                      <p className="text-xs text-red-700 mt-2 font-medium">
                        🔴 Configure a masked domain to create working masked links. Click "Configure" above.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            {maskedDomainSuccess && (
              <div className="mt-4 flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Check size={16} className="text-green-600 mt-0.5 shrink-0" />
                <p className="text-sm text-green-700">{maskedDomainSuccess}</p>
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4 flex items-start gap-2">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-4 flex items-center gap-2 break-all">
            <Check size={18} className="shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Links', value: links.length, color: 'blue' },
            { label: 'Public Links', value: links.filter((l) => l.isPublic).length, color: 'green' },
            { label: 'Private Links', value: links.filter((l) => !l.isPublic).length, color: 'purple' },
            { label: 'Total Clicks', value: links.reduce((s, l) => s + (l.clickCount || 0), 0), color: 'orange' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-lg shadow-sm border p-4">
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Create Panel */}
        {showCreatePanel && (
          <div className="bg-white rounded-xl shadow-md border mb-6 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-blue-50 shrink-0">
              <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                <Link2 size={18} /> Create Masked Link
              </h2>
              <button onClick={() => { setShowCreatePanel(false); resetForm(); }} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {formBody}
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => { setShowCreatePanel(false); resetForm(); }}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm font-medium">
                  Cancel
                </button>
                <button onClick={handleCreate} disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-lg transition">
                  {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Link2 size={16} />}
                  Generate Masked Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search links..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select value={filterAccess} onChange={(e) => setFilterAccess(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="all">All Access</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <span className="text-sm text-gray-500 ml-auto">{filteredLinks.length} link{filteredLinks.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <span className="ml-3 text-gray-500">Loading links...</span>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center py-16">
              <Link2 size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">
                {links.length === 0 ? 'No masked links yet' : 'No links match your filters'}
              </p>
              {links.length === 0 && (
                <button onClick={() => setShowCreatePanel(true)} className="mt-3 text-blue-600 hover:underline text-sm">
                  Create your first masked link
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Title</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Masked URL</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Destination</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Access</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Clicks</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Created</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLinks.map((link) => (
                    <tr key={link.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800 truncate max-w-[180px]">{link.title}</p>
                        {link.description && (
                          <p className="text-xs text-gray-400 truncate max-w-[180px]">{link.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 group relative">
                          <code className="bg-blue-50 text-blue-700 text-xs font-mono px-2 py-1 rounded truncate max-w-[250px] block cursor-pointer hover:bg-blue-100" 
                            title={`Click to copy: ${getMaskedUrl(link.shortCode)}`}>
                            {getMaskedUrl(link.shortCode)}
                          </code>
                          {/* Full URL tooltip on hover */}
                          <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 bg-gray-800 text-white text-xs rounded px-3 py-1 whitespace-nowrap z-40">
                            {getMaskedUrl(link.shortCode)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="inline-flex items-center gap-2 text-gray-500 text-xs font-medium px-2 py-1 rounded bg-gray-50">
                          <Lock size={12} /> Hidden
                        </span>
                        <p className="text-xs text-gray-400 mt-1">View in Edit →</p>
                      </td>
                      <td className="px-4 py-3">
                        {link.isPublic ? (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                            <Globe size={11} /> Public
                          </span>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                              <Lock size={11} /> Private
                            </span>
                            <p className="text-xs text-gray-400 mt-0.5">{link.assignedStudents?.length || 0} student{(link.assignedStudents?.length || 0) !== 1 ? 's' : ''}</p>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="flex items-center gap-1 text-gray-500">
                          <BarChart2 size={14} /> {link.clickCount || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500 whitespace-nowrap">
                        {new Date(link.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <a href={getMaskedUrl(link.shortCode)} target="_blank" rel="noopener noreferrer"
                            title="Test masked link"
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition">
                            <Eye size={16} />
                          </a>
                          <button onClick={() => handleCopy(link)} title="Copy masked link"
                            className={`p-1.5 rounded-md transition ${copiedId === link.id ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}`}>
                            {copiedId === link.id ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                          <button onClick={() => openEditModal(link)} title="Edit"
                            className="p-1.5 rounded-md hover:bg-yellow-100 text-gray-500 hover:text-yellow-600 transition">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(link)} title="Delete"
                            className="p-1.5 rounded-md hover:bg-red-100 text-gray-500 hover:text-red-600 transition">
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
        {showEditModal && editingLink && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b bg-yellow-50 shrink-0">
                <h2 className="text-lg font-bold text-yellow-800 flex items-center gap-2">
                  <Edit size={18} /> Edit Masked Link
                </h2>
                <button onClick={() => { setShowEditModal(false); resetForm(); }}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-yellow-100 transition">
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-6">
                {/* Current masked URL badge */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-6 border">
                  <Link2 size={20} className="text-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">Masked link (fixed — cannot change)</p>
                    <code className="text-sm text-blue-700 font-mono break-all">
                      {getMaskedUrl(editingLink.shortCode)}
                    </code>
                  </div>
                  <button onClick={() => handleCopy(editingLink)}
                    className={`shrink-0 p-2 rounded-lg transition ${copiedId === editingLink.id ? 'bg-green-100 text-green-600' : 'bg-white border hover:bg-gray-100 text-gray-500'}`}>
                    {copiedId === editingLink.id ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                {formBody}
              </div>

              <div className="px-6 py-4 border-t bg-gray-50 shrink-0 flex items-center justify-end gap-3">
                <button onClick={() => { setShowEditModal(false); resetForm(); }}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition text-sm font-medium">
                  Cancel
                </button>
                <button onClick={handleSaveEdit} disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-lg transition">
                  {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Check size={16} />}
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
