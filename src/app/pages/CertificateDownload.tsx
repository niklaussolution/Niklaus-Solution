import React, { useState, useEffect } from 'react';
import { Download, AlertCircle, Check, Mail, FileText } from 'lucide-react';
import { generateCertificatePDF } from '../../utils';
import { db } from '../../admin/config/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';

interface Certificate {
  id: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  certificateId: string;
  completionDate: string;
  issueDate: string;
  instructorName?: string;
  courseCode?: string;
  status: 'issued' | 'pending' | 'revoked';
  companyName?: string;
  companyLogo?: string;
  signature?: string;
  mentorName?: string;
  founderName?: string;
  certificationDate?: string;
}

export const CertificateDownload: React.FC = () => {
  const [searchType, setSearchType] = useState<'email' | 'certificateId'>('email');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);


  // Verification uses Firestore directly (no backend required)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCertificates([]);
    setSelectedCertificate(null);

    if (!searchInput.trim()) {
      setError(searchType === 'email' ? 'Please enter your email address' : 'Please enter your Certificate ID');
      return;
    }

    setLoading(true);

    try {
      let q;
      if (searchType === 'email') {
        // Query by email address
        q = query(
          collection(db, 'certificates'),
          where('studentEmail', '==', searchInput.toLowerCase().trim())
        );
      } else {
        // Query by certificate ID
        q = query(
          collection(db, 'certificates'),
          where('certificateId', '==', searchInput.trim()),
          limit(1)
        );
      }

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setError(searchType === 'email' ? 'No certificates found for this email' : 'Certificate not found');
        return;
      }

      const certData: Certificate[] = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        }))
        .filter((c) => c.status === 'issued');

      if (certData.length === 0) {
        setError('No active certificates found');
        return;
      }

      setCertificates(certData);
      if (certData.length === 1) {
        setSelectedCertificate(certData[0]);
      }
      setSuccess(`Found ${certData.length} certificate(s)`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (cert: Certificate) => {
    try {
      await generateCertificatePDF({
        studentName: cert.studentName,
        courseName: cert.courseName || 'WEB DEVELOPMENT',
        completionDate: cert.completionDate,
        certificateId: cert.certificateId,
        companyLogo: cert.companyLogo || '/logo.png',
        signature: '/signature.png',
        companyName: cert.companyName || 'NIKLAUS SOLUTIONS',
      });
      setSuccess('Certificate downloaded successfully!');
    } catch (err) {
      setError('Failed to download certificate');
    }
  };

  return (
    <div id="certificates" className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Download Your Certificate
          </h1>
          <p className="text-gray-600 text-center">
            Search for your certificates by email or certificate ID
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{success}</p>
            </div>
          )}

          {certificates.length === 0 ? (
            <form onSubmit={handleSearch} className="space-y-6">
              {/* Search Type Tabs */}
              <div className="flex gap-3 border-b">
                <button
                  type="button"
                  onClick={() => setSearchType('email')}
                  className={`px-6 py-3 font-semibold border-b-2 transition ${
                    searchType === 'email'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Mail className="inline mr-2" size={18} />
                  Search by Email
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('certificateId')}
                  className={`px-6 py-3 font-semibold border-b-2 transition ${
                    searchType === 'certificateId'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <FileText className="inline mr-2" size={18} />
                  Search by ID
                </button>
              </div>

              {/* Input Field */}
              <div>
                <label htmlFor="searchInput" className="block text-sm font-medium text-gray-700 mb-2">
                  {searchType === 'email' ? 'Email Address' : 'Certificate ID'} *
                </label>
                <input
                  id="searchInput"
                  type={searchType === 'email' ? 'email' : 'text'}
                  placeholder={
                    searchType === 'email'
                      ? 'e.g., student@example.com'
                      : 'e.g., CERT-1234567890-ABC1D2E3'
                  }
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={loading}
                />
              </div>

              {/* Help Text */}
              <p className="text-xs text-gray-500 text-center">
                {searchType === 'email'
                  ? 'Enter the email address used for your course registration to find all your certificates.'
                  : 'Enter your unique certificate ID to download your certificate securely.'}
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Search Certificates
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Found {certificates.length} Certificate(s)</h2>

              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className={`bg-blue-50 rounded-lg p-6 border-2 transition cursor-pointer ${
                    selectedCertificate?.id === cert.id ? 'border-blue-600' : 'border-blue-100 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedCertificate(selectedCertificate?.id === cert.id ? null : cert)}
                >
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Student Name</p>
                      <p className="text-lg font-semibold text-gray-900">{cert.studentName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Course</p>
                        <p className="text-sm font-semibold text-gray-900">{cert.courseName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Completion Date</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(cert.completionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Certificate ID</p>
                      <p className="text-sm font-mono text-gray-600">{cert.certificateId}</p>
                    </div>

                    {selectedCertificate?.id === cert.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadCertificate(cert);
                        }}
                        className="w-full mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        Download Certificate PDF
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Back Button */}
              <button
                onClick={() => {
                  setCertificates([]);
                  setSelectedCertificate(null);
                  setSearchInput('');
                  setSuccess('');
                }}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Search Again
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Your email and certificate information are used only for verification purposes.</p>
          <p className="mt-2">Your data is secure and will not be shared with third parties.</p>
        </div>
      </div>
    </div>
  );
};
