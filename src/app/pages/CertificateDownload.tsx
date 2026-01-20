import React, { useState, useEffect } from 'react';
import { Download, AlertCircle, Check } from 'lucide-react';
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
  const [certificateId, setCertificateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  // Verification uses Firestore directly (no backend required)

  const handleVerifyAndDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCertificate(null);

    if (!certificateId.trim()) {
      setError('Please enter your Certificate ID');
      return;
    }

    setLoading(true);

    try {
      // Query certificates collection by certificateId directly from Firestore
      const q = query(
        collection(db, 'certificates'),
        where('certificateId', '==', certificateId.trim()),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setError('Certificate not found');
        return;
      }

      const docSnap = snapshot.docs[0];
      const certDataRaw = docSnap.data() as any;

      if (certDataRaw.status !== 'issued') {
        setError('Certificate is not active');
        return;
      }

      // Build Certificate object with logo and signature
      const certData: Certificate = {
        id: docSnap.id,
        studentName: certDataRaw.studentName || 'Unknown',
        studentEmail: certDataRaw.studentEmail || '',
        courseName: certDataRaw.courseName || 'WEB DEVELOPMENT',
        certificateId: certDataRaw.certificateId || certificateId.trim(),
        completionDate: certDataRaw.completionDate || new Date().toISOString(),
        issueDate: certDataRaw.issueDate || new Date().toISOString(),
        instructorName: certDataRaw.instructorName,
        courseCode: certDataRaw.courseCode,
        status: certDataRaw.status || 'issued',
        companyName: 'NIKLAUS SOLUTIONS',
        companyLogo: certDataRaw.companyLogo || '/logo.png',
        signature: '/signature.png',
        mentorName: certDataRaw.instructorName || 'AUTHORIZED INSTRUCTOR',
        founderName: 'FOUNDER & CEO',
      };

      setCertificate(certData);
      setSuccess('Certificate found — Generating PDF...');

      await generateCertificatePDF(certData);
      setSuccess('Certificate downloaded successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="certificates" className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Download Your Certificate
          </h1>
          <p className="text-gray-600 text-center">
            Enter your Certificate ID to download your certificate
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

          {/* Note: Verification is performed directly against Firestore (no backend required) */}
          <p className="text-xs text-gray-500 text-center mb-4">Verification is performed directly against Firestore — no backend required.</p>
          {!certificate ? (
            <form onSubmit={handleVerifyAndDownload} className="space-y-6">
              {/* Certificate ID Input */}
              <div>
                <label htmlFor="certificateId" className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate ID *
                </label>
                <input
                  id="certificateId"
                  type="text"
                  placeholder="e.g., CERT-1234567890-ABC1D2E3"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={loading}
                />
              </div>

              {/* Help Text */}
              <p className="text-xs text-gray-500 text-center">
                Enter your unique certificate ID to download your certificate securely.
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
                    Verifying...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Get Your Certificate
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Certificate Details */}
              <div className="bg-blue-50 rounded-lg p-6 space-y-3">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Student Name</p>
                  <p className="text-lg font-semibold text-gray-900">{certificate.studentName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Course</p>
                  <p className="text-lg font-semibold text-gray-900">{certificate.courseName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Completion Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(certificate.completionDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Certificate ID</p>
                  <p className="text-sm font-mono text-gray-600">{certificate.certificateId}</p>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={async () => {
                  if (certificate) {
                    await generateCertificatePDF(certificate);
                  }
                }}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Certificate PDF
              </button>

              {/* Download Again Button */}
              <button
                onClick={() => {
                  setCertificate(null);
                  setCertificateId('');
                  setDateOfBirth('');
                  setSuccess('');
                }}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Download Another Certificate
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Your Certificate ID and Date of Birth are used only for verification purposes.</p>
          <p className="mt-2">Your data is secure and will not be shared with third parties.</p>
        </div>
      </div>
    </div>
  );
};
