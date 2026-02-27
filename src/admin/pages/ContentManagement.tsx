import React, { useEffect, useState, useRef } from 'react';
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
} from 'lucide-react';
import { initializeAllContent } from '../utils/contentInitializer';

type TabType =
  | 'hero'
  | 'header'
  | 'footer'
  | 'whyChooseUs'
  | 'freeTrialCourses'
  | 'keyFeatures'
  | 'scholarship'
  | 'comparison'
  | 'companies';

interface HeroContent {
  badge: string;
  mainHeading: string;
  mainHeadingHighlight: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  heroImage: string;
  brochureUrl: string;
  stats: {
    students: string;
    studentsLabel: string;
    rating: string;
    ratingLabel: string;
  };
}

interface HeaderContent {
  logo: string;
  logoHighlight: string;
  menuItems: Array<{ label: string; id: string }>;
  ctaButton: string;
}

interface FooterContent {
  company: {
    name: string;
    nameHighlight: string;
    description: string;
  };
  contact: {
    emails: string[];
    phones: string[];
    address: string;
  };
  copyright: string;
  socialLinks?: Array<{ icon: string; url: string }>;
  policies?: Array<{ label: string; url: string }>;
  popularWorkshops?: string[];
  quickLinks?: Array<{ id: string; label: string }>;
}

interface WhyChooseUsFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface WhyChooseUsContent {
  heading: string;
  subheading: string;
  description: string;
  stats: Array<{
    number: string;
    label: string;
  }>;
  features: WhyChooseUsFeature[];
}

interface FreeCourse {
  id: string;
  code: string;
  fullName: string;
  isFeatured: boolean;
}

interface FreeTrialContent {
  heading: string;
  description: string;
  trialButtonText: string;
  courses: FreeCourse[];
}

interface KeyFeature {
  id: string;
  title: string;
  description: string;
}

interface KeyFeaturesContent {
  heading: string;
  subheading: string;
  features: KeyFeature[];
}

interface ScholarshipContent {
  heading: string;
  description: string;
  highlights: string[];
  applyButtonText: string;
  whatsappLink: string;
  disclaimer: string;
}

interface ComparisonFeature {
  feature: string;
  niklaus: boolean;
  others: boolean;
}

interface ComparisonContent {
  heading: string;
  niklaausFeatures: string[];
  features: ComparisonFeature[];
  finalMessage: string;
}

interface Company {
  id: string;
  name: string;
  logoUrl: string;
}

interface CompaniesContent {
  heading: string;
  subheading: string;
  motivationalText: string;
  companies: Company[];
}

export const ContentManagement: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('hero');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pamphletInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [initializing, setInitializing] = useState(false);

  // Hero state
  const [heroContent, setHeroContent] = useState<HeroContent>({
    badge: '',
    mainHeading: '',
    mainHeadingHighlight: '',
    description: '',
    primaryButtonText: '',
    secondaryButtonText: '',
    heroImage: '',
    brochureUrl: '',
    stats: { students: '', studentsLabel: '', rating: '', ratingLabel: '' },
  });

  // Header state
  const [headerContent, setHeaderContent] = useState<HeaderContent>({
    logo: '',
    logoHighlight: '',
    menuItems: [],
    ctaButton: '',
  });

  // Footer state
  const [footerContent, setFooterContent] = useState<FooterContent>({
    company: { name: '', nameHighlight: '', description: '' },
    contact: { emails: [], phones: [], address: '' },
    copyright: '',
    socialLinks: [],
    policies: [],
    popularWorkshops: [],
    quickLinks: [],
  });

  // Why Choose Us state
  const [whyChooseUsContent, setWhyChooseUsContent] = useState<WhyChooseUsContent>({
    heading: '',
    subheading: '',
    description: '',
    stats: [],
    features: [],
  });

  // Free Trial Courses state
  const [freeTrialContent, setFreeTrialContent] = useState<FreeTrialContent>({
    heading: '',
    description: '',
    trialButtonText: '',
    courses: [],
  });

  // Key Features state
  const [keyFeaturesContent, setKeyFeaturesContent] = useState<KeyFeaturesContent>({
    heading: '',
    subheading: '',
    features: [],
  });

  // Scholarship state
  const [scholarshipContent, setScholarshipContent] = useState<ScholarshipContent>({
    heading: '',
    description: '',
    highlights: [],
    applyButtonText: '',
    whatsappLink: '',
    disclaimer: '',
  });

  // Comparison state
  const [comparisonContent, setComparisonContent] = useState<ComparisonContent>({
    heading: '',
    niklaausFeatures: [],
    features: [],
    finalMessage: '',
  });

  // Companies state
  const [companiesContent, setCompaniesContent] = useState<CompaniesContent>({
    heading: '',
    subheading: '',
    motivationalText: '',
    companies: [],
  });

  const [logoPreview, setLogoPreview] = useState<string>('');
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    try {
      setLoading(true);

      const heroDoc = await getDoc(doc(db, 'content', 'hero'));
      if (heroDoc.exists()) setHeroContent(heroDoc.data() as HeroContent);

      const headerDoc = await getDoc(doc(db, 'content', 'header'));
      if (headerDoc.exists()) setHeaderContent(headerDoc.data() as HeaderContent);

      const footerDoc = await getDoc(doc(db, 'content', 'footer'));
      if (footerDoc.exists()) setFooterContent(footerDoc.data() as FooterContent);

      const whyChooseUsDoc = await getDoc(doc(db, 'content', 'whyChooseUs'));
      if (whyChooseUsDoc.exists())
        setWhyChooseUsContent(whyChooseUsDoc.data() as WhyChooseUsContent);
      else
        setShowSetup(true);

      const freeTrialDoc = await getDoc(doc(db, 'content', 'freeTrialCourses'));
      if (freeTrialDoc.exists())
        setFreeTrialContent(freeTrialDoc.data() as FreeTrialContent);

      const keyFeaturesDoc = await getDoc(doc(db, 'content', 'keyFeatures'));
      if (keyFeaturesDoc.exists())
        setKeyFeaturesContent(keyFeaturesDoc.data() as KeyFeaturesContent);

      const scholarshipDoc = await getDoc(doc(db, 'content', 'scholarship'));
      if (scholarshipDoc.exists())
        setScholarshipContent(scholarshipDoc.data() as ScholarshipContent);

      const comparisonDoc = await getDoc(doc(db, 'content', 'comparison'));
      if (comparisonDoc.exists())
        setComparisonContent(comparisonDoc.data() as ComparisonContent);

      const companiesDoc = await getDoc(doc(db, 'content', 'companies'));
      if (companiesDoc.exists())
        setCompaniesContent(companiesDoc.data() as CompaniesContent);
    } catch (err) {
      setError('Error fetching content');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeContent = async () => {
    setInitializing(true);
    try {
      const result = await initializeAllContent();
      if (result.success) {
        setSuccess('All content sections initialized successfully!');
        setShowSetup(false);
        setTimeout(() => {
          fetchAllContent();
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error initializing content');
      console.error(err);
    } finally {
      setInitializing(false);
    }
  };

  const handleCompanyLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const timestamp = Date.now();
      const fileName = `companies/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      if (editingCompanyId) {
        // Update existing company
        const updatedCompanies = companiesContent.companies.map((c) =>
          c.id === editingCompanyId ? { ...c, logoUrl: downloadURL } : c
        );
        const updated = { ...companiesContent, companies: updatedCompanies };
        setCompaniesContent(updated);
        setEditingCompanyId(null);
      } else {
        // Add new company
        const newCompany: Company = {
          id: `company_${timestamp}`,
          name: '',
          logoUrl: downloadURL,
        };
        const updated = {
          ...companiesContent,
          companies: [...companiesContent.companies, newCompany],
        };
        setCompaniesContent(updated);
      }

      setSuccess('Company logo uploaded successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Error uploading company logo');
      console.error(err);
    } finally {
      setUploading(false);
      setLogoPreview('');
    }
  };

  const handleDeleteCompanyLogo = async (logoUrl: string, companyId: string) => {
    if (!confirm('Remove this company?')) return;

    try {
      // Delete from storage
      try {
        const fileRef = ref(storage, logoUrl);
        await deleteObject(fileRef);
      } catch (storageErr) {
        console.warn('Could not delete from storage:', storageErr);
      }

      // Delete from companies list
      const updated = {
        ...companiesContent,
        companies: companiesContent.companies.filter((c) => c.id !== companyId),
      };
      setCompaniesContent(updated);
      setSuccess('Company removed successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Error removing company');
      console.error(err);
    }
  };

  const handleSave = async (section: TabType) => {
    try {
      let content;
      switch (section) {
        case 'hero':
          content = heroContent;
          break;
        case 'header':
          content = headerContent;
          break;
        case 'footer':
          content = footerContent;
          break;
        case 'whyChooseUs':
          content = whyChooseUsContent;
          break;
        case 'freeTrialCourses':
          content = freeTrialContent;
          break;
        case 'keyFeatures':
          content = keyFeaturesContent;
          break;
        case 'scholarship':
          content = scholarshipContent;
          break;
        case 'comparison':
          content = comparisonContent;
          break;
        case 'companies':
          content = companiesContent;
          break;
        default:
          return;
      }

      await setDoc(doc(db, 'content', section), {
        ...content,
        updatedAt: Date.now(),
      });

      setSuccess(`${section} content saved successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Error saving ${section} content`);
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
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Content Management</h1>
          <p className="text-gray-600 mt-1">Manage all website content sections</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
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
            <AlertCircle className="text-green-600" size={20} />
            <div>
              <h3 className="font-semibold text-green-900">Success</h3>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X size={18} className="text-green-600" />
            </button>
          </div>
        )}

        {/* First Time Setup */}
        {showSetup && (
          <div className="mb-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-blue-900 mb-4">First Time Setup</h2>
              <p className="text-blue-700 mb-6">
                Initialize all content sections with default values. You can customize each section afterward.
              </p>
              <button
                onClick={handleInitializeContent}
                disabled={initializing}
                className={`px-8 py-3 rounded-lg font-bold text-white transition flex items-center gap-2 mx-auto ${
                  initializing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Upload size={20} />
                {initializing ? 'Initializing...' : 'Initialize All Sections'}
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-4 rounded-lg shadow">
          {([
            'hero',
            'header',
            'footer',
            'whyChooseUs',
            'freeTrialCourses',
            'keyFeatures',
            'scholarship',
            'comparison',
            'companies',
          ] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab === 'whyChooseUs'
                ? 'Why Choose Us'
                : tab === 'freeTrialCourses'
                  ? 'Free Trial'
                  : tab === 'keyFeatures'
                    ? 'Key Features'
                    : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Hero Tab */}
        {activeTab === 'hero' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Hero Section Content</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Badge
                  </label>
                  <input
                    type="text"
                    value={heroContent.badge}
                    onChange={(e) =>
                      setHeroContent({ ...heroContent, badge: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Heading Highlight
                  </label>
                  <input
                    type="text"
                    value={heroContent.mainHeadingHighlight}
                    onChange={(e) =>
                      setHeroContent({
                        ...heroContent,
                        mainHeadingHighlight: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Heading
                </label>
                <textarea
                  value={heroContent.mainHeading}
                  onChange={(e) =>
                    setHeroContent({ ...heroContent, mainHeading: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={heroContent.description}
                  onChange={(e) =>
                    setHeroContent({ ...heroContent, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    value={heroContent.primaryButtonText}
                    onChange={(e) =>
                      setHeroContent({
                        ...heroContent,
                        primaryButtonText: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Button Text
                  </label>
                  <input
                    type="text"
                    value={heroContent.secondaryButtonText}
                    onChange={(e) =>
                      setHeroContent({
                        ...heroContent,
                        secondaryButtonText: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Students Count
                  </label>
                  <input
                    type="text"
                    value={heroContent.stats.students}
                    onChange={(e) =>
                      setHeroContent({
                        ...heroContent,
                        stats: { ...heroContent.stats, students: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Students Label
                  </label>
                  <input
                    type="text"
                    value={heroContent.stats.studentsLabel}
                    onChange={(e) =>
                      setHeroContent({
                        ...heroContent,
                        stats: { ...heroContent.stats, studentsLabel: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <input
                    type="text"
                    value={heroContent.stats.rating}
                    onChange={(e) =>
                      setHeroContent({
                        ...heroContent,
                        stats: { ...heroContent.stats, rating: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating Label
                  </label>
                  <input
                    type="text"
                    value={heroContent.stats.ratingLabel}
                    onChange={(e) =>
                      setHeroContent({
                        ...heroContent,
                        stats: { ...heroContent.stats, ratingLabel: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Pamphlet Upload Section */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Download Pamphlet (PDF)
                </label>
                <div className="flex items-center gap-4 mb-4">
                  {heroContent.brochureUrl && (
                    <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                      <span className="text-sm text-blue-700">PDF uploaded</span>
                      <a
                        href={heroContent.brochureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        View
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <input
                    ref={pamphletInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file && file.type === 'application/pdf') {
                        setUploading(true);
                        try {
                          const storageRef = ref(storage, `pamphlets/brochure-${Date.now()}.pdf`);
                          await uploadBytes(storageRef, file);
                          const downloadUrl = await getDownloadURL(storageRef);
                          const updatedHeroContent = {
                            ...heroContent,
                            brochureUrl: downloadUrl,
                          };
                          setHeroContent(updatedHeroContent);
                          
                          // Auto-save to Firebase
                          await setDoc(doc(db, 'content', 'hero'), {
                            ...updatedHeroContent,
                            updatedAt: Date.now(),
                          });
                          
                          setSuccess('Pamphlet uploaded and saved successfully!');
                          setTimeout(() => setSuccess(''), 3000);
                        } catch (error) {
                          console.error('Error uploading pamphlet:', error);
                          setError('Failed to upload pamphlet');
                          setTimeout(() => setError(''), 3000);
                        } finally {
                          setUploading(false);
                        }
                      } else if (file) {
                        setError('Please select a PDF file');
                        setTimeout(() => setError(''), 3000);
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => pamphletInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Upload size={18} />
                    {uploading ? 'Uploading...' : 'Upload PDF'}
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleSave('hero')}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition mt-6"
              >
                <Save size={20} />
                Save Hero Content
              </button>
            </div>
          </div>
        )}

        {/* Header Tab */}
        {activeTab === 'header' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Header Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Name
                </label>
                <input
                  type="text"
                  value={headerContent.logo}
                  onChange={(e) =>
                    setHeaderContent({ ...headerContent, logo: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Highlight Word
                </label>
                <input
                  type="text"
                  value={headerContent.logoHighlight}
                  onChange={(e) =>
                    setHeaderContent({
                      ...headerContent,
                      logoHighlight: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  value={headerContent.ctaButton}
                  onChange={(e) =>
                    setHeaderContent({ ...headerContent, ctaButton: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Menu Items
                </label>
                {headerContent.menuItems.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Label"
                      value={item.label}
                      onChange={(e) => {
                        const newItems = [...headerContent.menuItems];
                        newItems[index].label = e.target.value;
                        setHeaderContent({
                          ...headerContent,
                          menuItems: newItems,
                        });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="ID/Section"
                      value={item.id}
                      onChange={(e) => {
                        const newItems = [...headerContent.menuItems];
                        newItems[index].id = e.target.value;
                        setHeaderContent({
                          ...headerContent,
                          menuItems: newItems,
                        });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSave('header')}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition w-full justify-center"
              >
                <Save size={20} />
                Save Header Content
              </button>
            </div>
          </div>
        )}

        {/* Footer Tab */}
        {activeTab === 'footer' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Footer Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={footerContent.company.name}
                  onChange={(e) =>
                    setFooterContent({
                      ...footerContent,
                      company: { ...footerContent.company, name: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name Highlight
                </label>
                <input
                  type="text"
                  value={footerContent.company.nameHighlight}
                  onChange={(e) =>
                    setFooterContent({
                      ...footerContent,
                      company: {
                        ...footerContent.company,
                        nameHighlight: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Description
                </label>
                <textarea
                  value={footerContent.company.description}
                  onChange={(e) =>
                    setFooterContent({
                      ...footerContent,
                      company: {
                        ...footerContent.company,
                        description: e.target.value,
                      },
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Email Addresses
                </label>
                {footerContent.contact.emails.map((email, index) => (
                  <div key={index} className="mb-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        const newEmails = [...footerContent.contact.emails];
                        newEmails[index] = e.target.value;
                        setFooterContent({
                          ...footerContent,
                          contact: {
                            ...footerContent.contact,
                            emails: newEmails,
                          },
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Phone Numbers
                </label>
                {footerContent.contact.phones.map((phone, index) => (
                  <div key={index} className="mb-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const newPhones = [...footerContent.contact.phones];
                        newPhones[index] = e.target.value;
                        setFooterContent({
                          ...footerContent,
                          contact: {
                            ...footerContent.contact,
                            phones: newPhones,
                          },
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={footerContent.contact.address}
                  onChange={(e) =>
                    setFooterContent({
                      ...footerContent,
                      contact: {
                        ...footerContent.contact,
                        address: e.target.value,
                      },
                    })
                  }
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Copyright Text
                </label>
                <textarea
                  value={footerContent.copyright}
                  onChange={(e) =>
                    setFooterContent({
                      ...footerContent,
                      copyright: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Social Links</h3>
                {footerContent.socialLinks?.map((link, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 mb-3">
                    <input
                      type="text"
                      value={link.icon}
                      onChange={(e) => {
                        const newLinks = [...(footerContent.socialLinks || [])];
                        newLinks[index].icon = e.target.value;
                        setFooterContent({
                          ...footerContent,
                          socialLinks: newLinks,
                        });
                      }}
                      placeholder="Icon name"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => {
                        const newLinks = [...(footerContent.socialLinks || [])];
                        newLinks[index].url = e.target.value;
                        setFooterContent({
                          ...footerContent,
                          socialLinks: newLinks,
                        });
                      }}
                      placeholder="URL"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Policies</h3>
                {footerContent.policies?.map((policy, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 mb-3">
                    <input
                      type="text"
                      value={policy.label}
                      onChange={(e) => {
                        const newPolicies = [...(footerContent.policies || [])];
                        newPolicies[index].label = e.target.value;
                        setFooterContent({
                          ...footerContent,
                          policies: newPolicies,
                        });
                      }}
                      placeholder="Policy label"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={policy.url}
                      onChange={(e) => {
                        const newPolicies = [...(footerContent.policies || [])];
                        newPolicies[index].url = e.target.value;
                        setFooterContent({
                          ...footerContent,
                          policies: newPolicies,
                        });
                      }}
                      placeholder="URL"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Popular Workshops</h3>
                {footerContent.popularWorkshops?.map((workshop, index) => (
                  <div key={index} className="mb-2">
                    <input
                      type="text"
                      value={workshop}
                      onChange={(e) => {
                        const newWorkshops = [...(footerContent.popularWorkshops || [])];
                        newWorkshops[index] = e.target.value;
                        setFooterContent({
                          ...footerContent,
                          popularWorkshops: newWorkshops,
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                {footerContent.quickLinks?.map((link, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 mb-3">
                    <input
                      type="text"
                      value={link.id}
                      onChange={(e) => {
                        const newLinks = [...(footerContent.quickLinks || [])];
                        newLinks[index].id = e.target.value;
                        setFooterContent({
                          ...footerContent,
                          quickLinks: newLinks,
                        });
                      }}
                      placeholder="Link ID"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => {
                        const newLinks = [...(footerContent.quickLinks || [])];
                        newLinks[index].label = e.target.value;
                        setFooterContent({
                          ...footerContent,
                          quickLinks: newLinks,
                        });
                      }}
                      placeholder="Link label"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSave('footer')}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition w-full justify-center"
              >
                <Save size={20} />
                Save Footer Content
              </button>
            </div>
          </div>
        )}

        {/* Why Choose Us Tab */}
        {activeTab === 'whyChooseUs' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Why Choose Us Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heading
                </label>
                <input
                  type="text"
                  value={whyChooseUsContent.heading}
                  onChange={(e) =>
                    setWhyChooseUsContent({
                      ...whyChooseUsContent,
                      heading: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Why Choose Niklaus Solutions"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subheading
                </label>
                <textarea
                  value={whyChooseUsContent.subheading}
                  onChange={(e) =>
                    setWhyChooseUsContent({
                      ...whyChooseUsContent,
                      subheading: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Empowering Skills. Building Careers. Your success is our mission."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={whyChooseUsContent.description}
                  onChange={(e) =>
                    setWhyChooseUsContent({
                      ...whyChooseUsContent,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Stats</h3>
                {whyChooseUsContent.stats.map((stat, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      value={stat.number}
                      onChange={(e) => {
                        const newStats = [...whyChooseUsContent.stats];
                        newStats[idx] = { ...stat, number: e.target.value };
                        setWhyChooseUsContent({
                          ...whyChooseUsContent,
                          stats: newStats,
                        });
                      }}
                      placeholder="Number (e.g., 50+)"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => {
                        const newStats = [...whyChooseUsContent.stats];
                        newStats[idx] = { ...stat, label: e.target.value };
                        setWhyChooseUsContent({
                          ...whyChooseUsContent,
                          stats: newStats,
                        });
                      }}
                      placeholder="Label (e.g., Workshops Conducted)"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => {
                        const newStats = whyChooseUsContent.stats.filter(
                          (_, i) => i !== idx
                        );
                        setWhyChooseUsContent({
                          ...whyChooseUsContent,
                          stats: newStats,
                        });
                      }}
                      className="col-span-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      Remove Stat
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setWhyChooseUsContent({
                      ...whyChooseUsContent,
                      stats: [...whyChooseUsContent.stats, { number: '', label: '' }],
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <Plus size={18} />
                  Add Stat
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Features</h3>
                {whyChooseUsContent.features.map((feature, idx) => (
                  <div key={feature.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border border-gray-300 rounded">
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => {
                        const newFeatures = [...whyChooseUsContent.features];
                        newFeatures[idx] = { ...feature, title: e.target.value };
                        setWhyChooseUsContent({
                          ...whyChooseUsContent,
                          features: newFeatures,
                        });
                      }}
                      placeholder="Feature title"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <textarea
                      value={feature.description}
                      onChange={(e) => {
                        const newFeatures = [...whyChooseUsContent.features];
                        newFeatures[idx] = {
                          ...feature,
                          description: e.target.value,
                        };
                        setWhyChooseUsContent({
                          ...whyChooseUsContent,
                          features: newFeatures,
                        });
                      }}
                      placeholder="Description"
                      rows={2}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => {
                        const newFeatures = whyChooseUsContent.features.filter(
                          (_, i) => i !== idx
                        );
                        setWhyChooseUsContent({
                          ...whyChooseUsContent,
                          features: newFeatures,
                        });
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm h-fit"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setWhyChooseUsContent({
                      ...whyChooseUsContent,
                      features: [
                        ...whyChooseUsContent.features,
                        {
                          id: `feature_${Date.now()}`,
                          icon: '',
                          title: '',
                          description: '',
                        },
                      ],
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <Plus size={18} />
                  Add Feature
                </button>
              </div>

              <button
                onClick={() => handleSave('whyChooseUs')}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Save size={20} />
                Save Why Choose Us
              </button>
            </div>
          </div>
        )}

        {/* Free Trial Courses Tab */}
        {activeTab === 'freeTrialCourses' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Free Trial Courses</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heading
                </label>
                <input
                  type="text"
                  value={freeTrialContent.heading}
                  onChange={(e) =>
                    setFreeTrialContent({
                      ...freeTrialContent,
                      heading: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Introducing Niklaus"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={freeTrialContent.description}
                  onChange={(e) =>
                    setFreeTrialContent({
                      ...freeTrialContent,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trial Button Text
                </label>
                <input
                  type="text"
                  value={freeTrialContent.trialButtonText}
                  onChange={(e) =>
                    setFreeTrialContent({
                      ...freeTrialContent,
                      trialButtonText: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Courses</h3>
                {freeTrialContent.courses.map((course, idx) => (
                  <div
                    key={course.id}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border border-gray-300 rounded"
                  >
                    <input
                      type="text"
                      value={course.code}
                      onChange={(e) => {
                        const newCourses = [...freeTrialContent.courses];
                        newCourses[idx] = { ...course, code: e.target.value };
                        setFreeTrialContent({
                          ...freeTrialContent,
                          courses: newCourses,
                        });
                      }}
                      placeholder="Course code (e.g., CEH)"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={course.fullName}
                      onChange={(e) => {
                        const newCourses = [...freeTrialContent.courses];
                        newCourses[idx] = { ...course, fullName: e.target.value };
                        setFreeTrialContent({
                          ...freeTrialContent,
                          courses: newCourses,
                        });
                      }}
                      placeholder="Full course name"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => {
                        const newCourses = freeTrialContent.courses.filter(
                          (_, i) => i !== idx
                        );
                        setFreeTrialContent({
                          ...freeTrialContent,
                          courses: newCourses,
                        });
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm h-fit"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setFreeTrialContent({
                      ...freeTrialContent,
                      courses: [
                        ...freeTrialContent.courses,
                        {
                          id: `course_${Date.now()}`,
                          code: '',
                          fullName: '',
                          isFeatured: false,
                        },
                      ],
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <Plus size={18} />
                  Add Course
                </button>
              </div>

              <button
                onClick={() => handleSave('freeTrialCourses')}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Save size={20} />
                Save Free Trial Content
              </button>
            </div>
          </div>
        )}

        {/* Key Features Tab */}
        {activeTab === 'keyFeatures' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Key Features</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heading
                </label>
                <input
                  type="text"
                  value={keyFeaturesContent.heading}
                  onChange={(e) =>
                    setKeyFeaturesContent({
                      ...keyFeaturesContent,
                      heading: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Key Features Of Niklaus"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subheading
                </label>
                <textarea
                  value={keyFeaturesContent.subheading}
                  onChange={(e) =>
                    setKeyFeaturesContent({
                      ...keyFeaturesContent,
                      subheading: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Elevate Your Career with Guidance from Top Industry Mentors"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Features</h3>
                {keyFeaturesContent.features.map((feature, idx) => (
                  <div
                    key={feature.id}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border border-gray-300 rounded"
                  >
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => {
                        const newFeatures = [...keyFeaturesContent.features];
                        newFeatures[idx] = { ...feature, title: e.target.value };
                        setKeyFeaturesContent({
                          ...keyFeaturesContent,
                          features: newFeatures,
                        });
                      }}
                      placeholder="Feature title"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <textarea
                      value={feature.description}
                      onChange={(e) => {
                        const newFeatures = [...keyFeaturesContent.features];
                        newFeatures[idx] = {
                          ...feature,
                          description: e.target.value,
                        };
                        setKeyFeaturesContent({
                          ...keyFeaturesContent,
                          features: newFeatures,
                        });
                      }}
                      placeholder="Description"
                      rows={2}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => {
                        const newFeatures = keyFeaturesContent.features.filter(
                          (_, i) => i !== idx
                        );
                        setKeyFeaturesContent({
                          ...keyFeaturesContent,
                          features: newFeatures,
                        });
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm h-fit"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setKeyFeaturesContent({
                      ...keyFeaturesContent,
                      features: [
                        ...keyFeaturesContent.features,
                        {
                          id: `feature_${Date.now()}`,
                          title: '',
                          description: '',
                        },
                      ],
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <Plus size={18} />
                  Add Feature
                </button>
              </div>

              <button
                onClick={() => handleSave('keyFeatures')}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Save size={20} />
                Save Key Features
              </button>
            </div>
          </div>
        )}

        {/* Scholarship Tab */}
        {activeTab === 'scholarship' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Scholarship Program</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heading
                </label>
                <input
                  type="text"
                  value={scholarshipContent.heading}
                  onChange={(e) =>
                    setScholarshipContent({
                      ...scholarshipContent,
                      heading: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Scholarship"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={scholarshipContent.description}
                  onChange={(e) =>
                    setScholarshipContent({
                      ...scholarshipContent,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apply Button Text
                </label>
                <input
                  type="text"
                  value={scholarshipContent.applyButtonText}
                  onChange={(e) =>
                    setScholarshipContent({
                      ...scholarshipContent,
                      applyButtonText: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Apply Scholarship"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Link (for button redirect)
                </label>
                <input
                  type="text"
                  value={scholarshipContent.whatsappLink}
                  onChange={(e) =>
                    setScholarshipContent({
                      ...scholarshipContent,
                      whatsappLink: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="https://wa.me/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disclaimer
                </label>
                <textarea
                  value={scholarshipContent.disclaimer}
                  onChange={(e) =>
                    setScholarshipContent({
                      ...scholarshipContent,
                      disclaimer: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Highlights</h3>
                {scholarshipContent.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) => {
                        const newHighlights = [...scholarshipContent.highlights];
                        newHighlights[idx] = e.target.value;
                        setScholarshipContent({
                          ...scholarshipContent,
                          highlights: newHighlights,
                        });
                      }}
                      placeholder="Highlight"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => {
                        const newHighlights = scholarshipContent.highlights.filter(
                          (_, i) => i !== idx
                        );
                        setScholarshipContent({
                          ...scholarshipContent,
                          highlights: newHighlights,
                        });
                      }}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setScholarshipContent({
                      ...scholarshipContent,
                      highlights: [...scholarshipContent.highlights, ''],
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <Plus size={18} />
                  Add Highlight
                </button>
              </div>

              <button
                onClick={() => handleSave('scholarship')}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Save size={20} />
                Save Scholarship Content
              </button>
            </div>
          </div>
        )}

        {/* Comparison Tab */}
        {activeTab === 'comparison' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Why Are We The Best</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heading
                </label>
                <input
                  type="text"
                  value={comparisonContent.heading}
                  onChange={(e) =>
                    setComparisonContent({
                      ...comparisonContent,
                      heading: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Why Are We The Best"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Final Message
                </label>
                <textarea
                  value={comparisonContent.finalMessage}
                  onChange={(e) =>
                    setComparisonContent({
                      ...comparisonContent,
                      finalMessage: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Niklaus Features</h3>
                {comparisonContent.niklaausFeatures.map((feature, idx) => (
                  <div key={idx} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...comparisonContent.niklaausFeatures];
                        newFeatures[idx] = e.target.value;
                        setComparisonContent({
                          ...comparisonContent,
                          niklaausFeatures: newFeatures,
                        });
                      }}
                      placeholder="Feature"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => {
                        const newFeatures = comparisonContent.niklaausFeatures.filter(
                          (_, i) => i !== idx
                        );
                        setComparisonContent({
                          ...comparisonContent,
                          niklaausFeatures: newFeatures,
                        });
                      }}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setComparisonContent({
                      ...comparisonContent,
                      niklaausFeatures: [...comparisonContent.niklaausFeatures, ''],
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <Plus size={18} />
                  Add Feature
                </button>
              </div>

              <button
                onClick={() => handleSave('comparison')}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Save size={20} />
                Save Comparison Content
              </button>
            </div>
          </div>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Our Learners Work At</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heading
                </label>
                <input
                  type="text"
                  value={companiesContent.heading}
                  onChange={(e) =>
                    setCompaniesContent({
                      ...companiesContent,
                      heading: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Our Learners Work At"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subheading
                </label>
                <input
                  type="text"
                  value={companiesContent.subheading}
                  onChange={(e) =>
                    setCompaniesContent({
                      ...companiesContent,
                      subheading: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Join thousands of successful learners..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivational Text
                </label>
                <textarea
                  value={companiesContent.motivationalText}
                  onChange={(e) =>
                    setCompaniesContent({
                      ...companiesContent,
                      motivationalText: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Company Logos</h3>

                {/* Image Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 mb-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCompanyLogoUpload}
                    disabled={uploading}
                    className="hidden"
                  />

                  {logoPreview ? (
                    <div className="flex flex-col items-center gap-4">
                      <img
                        src={logoPreview}
                        alt="Preview"
                        className="h-24 w-24 object-contain rounded-lg"
                      />
                      <div>
                        <p className="text-gray-600 mb-2 text-sm">Enter company name:</p>
                        <input
                          type="text"
                          id="companyName"
                          placeholder="Company name"
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 mb-2"
                        />
                        <div className="flex gap-2 justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              const nameInput = document.getElementById(
                                'companyName'
                              ) as HTMLInputElement;
                              if (nameInput && nameInput.value.trim()) {
                                // Update company name for the logo preview
                                const updatedCompanies =
                                  companiesContent.companies.map((c) => {
                                    if (c.logoUrl.includes(logoPreview)) {
                                      return {
                                        ...c,
                                        name: nameInput.value,
                                      };
                                    }
                                    return c;
                                  });
                                if (
                                  updatedCompanies.length ===
                                  companiesContent.companies.length
                                ) {
                                  // No match found, don't add
                                  setError('Please upload logo first');
                                } else {
                                  setCompaniesContent({
                                    ...companiesContent,
                                    companies: updatedCompanies,
                                  });
                                }
                              }
                              setLogoPreview('');
                            }}
                            disabled={uploading}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:bg-gray-400 text-sm"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLogoPreview('');
                              if (fileInputRef.current)
                                fileInputRef.current.value = '';
                            }}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="mx-auto mb-2 text-gray-400" size={32} />
                      <p className="text-gray-600 mb-2">
                        Upload company logos (Max 2MB)
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                      >
                        {uploading ? 'Uploading...' : 'Select Logo'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Companies List with Edit Option */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {companiesContent.companies.map((company) => (
                    <div
                      key={company.id}
                      className={`flex flex-col gap-3 p-4 border-2 rounded-lg transition ${
                        editingCompanyId === company.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {editingCompanyId === company.id ? (
                        <>
                          {/* Edit Mode */}
                          <div className="space-y-3">
                            {/* Logo URL Input */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Logo URL
                              </label>
                              <input
                                type="text"
                                value={company.logoUrl}
                                onChange={(e) => {
                                  const updatedCompanies = companiesContent.companies.map((c) =>
                                    c.id === company.id ? { ...c, logoUrl: e.target.value } : c
                                  );
                                  setCompaniesContent({
                                    ...companiesContent,
                                    companies: updatedCompanies,
                                  });
                                }}
                                placeholder="https://example.com/logo.png"
                                className="w-full px-2 py-1.5 text-xs border border-blue-300 rounded focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            {/* Company Name Input */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Company Name
                              </label>
                              <input
                                type="text"
                                value={company.name}
                                onChange={(e) => {
                                  const updatedCompanies = companiesContent.companies.map((c) =>
                                    c.id === company.id ? { ...c, name: e.target.value } : c
                                  );
                                  setCompaniesContent({
                                    ...companiesContent,
                                    companies: updatedCompanies,
                                  });
                                }}
                                className="w-full px-2 py-1.5 text-xs border border-blue-300 rounded focus:outline-none focus:border-blue-500 font-medium"
                              />
                            </div>

                            {/* Company ID (Read-only) */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Company ID
                              </label>
                              <input
                                type="text"
                                value={company.id}
                                disabled
                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-gray-100 text-gray-600"
                              />
                            </div>

                            {/* Logo Preview */}
                            {company.logoUrl && (
                              <div className="flex items-center justify-center h-20 bg-gray-100 rounded">
                                <img
                                  src={company.logoUrl}
                                  alt={company.name}
                                  className="max-h-16 max-w-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingCompanyId(null)}
                                className="flex-1 px-2 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition text-xs font-semibold"
                              >
                                Done
                              </button>
                              <button
                                onClick={() => {
                                  setEditingCompanyId(null);
                                }}
                                className="flex-1 px-2 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-xs font-semibold"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* View Mode */}
                          <div className="flex items-center justify-center h-16 bg-gray-100 rounded">
                            {company.logoUrl ? (
                              <img
                                src={company.logoUrl}
                                alt={company.name}
                                className="max-h-14 max-w-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-gray-400 text-xs">No logo</span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-center text-gray-900">{company.name}</p>
                          <p className="text-xs text-gray-500 text-center break-all">{company.id}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingCompanyId(company.id)}
                              className="flex-1 px-2 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs flex items-center justify-center gap-1 font-semibold"
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteCompanyLogo(company.logoUrl, company.id)
                              }
                              className="flex-1 px-2 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition text-xs flex items-center justify-center gap-1 font-semibold"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleSave('companies')}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Save size={20} />
                Save Companies Content
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ContentManagement;
