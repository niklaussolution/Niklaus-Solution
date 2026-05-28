import React, { useState, useEffect } from 'react';
import { Download, Search, AlertCircle, CheckCircle, Trophy, FileText, Mail } from 'lucide-react';
import { db } from '../../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { generateCertificatePDF } from '../../utils';

interface Certificate {
  id: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  courseType: 'course' | 'workshop'; // To differentiate between courses and workshops
  certificateId: string;
  completionDate: string;
  issueDate: string;
  instructorName?: string;
  courseCode?: string;
  status: 'issued' | 'pending' | 'revoked';
  companyName?: string;
  companyLogo?: string;
  signature?: string;
}

interface StudentCertificatesProps {
  studentEmail: string;
}

export const StudentCertificates: React.FC<StudentCertificatesProps> = ({ studentEmail }) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'courses' | 'workshops'>('all');

  useEffect(() => {
    fetchCertificates();
  }, [studentEmail]);

  const fetchCertificates = async () => {
    if (!studentEmail) {
      setError('Student email not found');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Query certificates by student email
      const certificatesRef = collection(db, 'certificates');
      const q = query(
        certificatesRef,
        where('studentEmail', '==', studentEmail.toLowerCase().trim())
      );

      const snapshot = await getDocs(q);
      const certData: Certificate[] = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        }))
        .filter((c) => c.status === 'issued') // Only show issued certificates
        .sort((a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime()); // Sort by latest first

      setCertificates(certData);

      if (certData.length === 0) {
        setError('No certificates earned yet. Complete courses/workshops to earn certificates.');
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError('Failed to fetch certificates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = certificates.filter((cert) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'courses') return cert.courseType !== 'workshop';
    if (activeFilter === 'workshops') return cert.courseType === 'workshop';
    return true;
  });

  const handleDownloadCertificate = async (cert: Certificate) => {
    try {
      setDownloadingId(cert.id);
      await generateCertificatePDF({
        studentName: cert.studentName,
        courseName: cert.courseName || 'COURSE COMPLETION',
        completionDate: cert.completionDate,
        certificateId: cert.certificateId,
        companyLogo: cert.companyLogo || '/logo.png',
        signature: '/signature.png',
        companyName: cert.companyName || 'NIKLAUS SOLUTIONS',
      });
      setSuccessMsg(`Certificate for ${cert.courseName} downloaded successfully!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to download certificate');
      console.error('Download error:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Trophy className="text-yellow-500" size={32} />
            My Certificates
          </h2>
          <p className="text-gray-600 mt-2">Download your earned course and workshop certificates</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-blue-600">{filteredCertificates.length}</p>
          <p className="text-gray-600 text-sm">Total Certificates</p>
        </div>
      </div>

      {/* Student Email Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
        <Mail className="text-blue-600" size={20} />
        <div>
          <p className="text-sm text-blue-600 font-medium">Showing certificates for:</p>
          <p className="text-sm font-semibold text-blue-900">{studentEmail}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Certificates ({certificates.length})
          </button>
          <button
            onClick={() => setActiveFilter('courses')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeFilter === 'courses'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Courses ({certificates.filter((c) => c.courseType !== 'workshop').length})
          </button>
          <button
            onClick={() => setActiveFilter('workshops')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeFilter === 'workshops'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Workshops ({certificates.filter((c) => c.courseType === 'workshop').length})
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-600 text-red-800 px-6 py-4 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMsg && (
        <div className="bg-green-50 border-l-4 border-green-600 text-green-800 px-6 py-4 rounded-lg flex items-start gap-3">
          <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
          <p>{successMsg}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your certificates...</p>
        </div>
      ) : filteredCertificates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-2xl font-bold text-gray-600 mb-2">No certificates yet</h3>
          <p className="text-gray-500 mb-6">Complete courses and workshops to earn certificates</p>
          <button
            onClick={() => setActiveFilter('all')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            View All Courses
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCertificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden border-l-4 border-blue-600"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Certificate Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full p-3 flex-shrink-0">
                        <Trophy size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{cert.courseName}</h3>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FileText size={16} />
                            ID: {cert.certificateId}
                          </span>
                          <span>•</span>
                          <span>
                            Completed: {new Date(cert.completionDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span>•</span>
                          <span
                            className={`px-3 py-1 rounded-full font-semibold text-xs ${
                              cert.courseType === 'workshop'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {cert.courseType === 'workshop' ? '🎯 Workshop' : '📚 Course'}
                          </span>
                        </div>
                        {cert.instructorName && (
                          <p className="text-sm text-gray-500 mt-2">Instructor: {cert.instructorName}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Download Button */}
                  <div className="flex gap-3 md:flex-col lg:flex-row">
                    <button
                      onClick={() => handleDownloadCertificate(cert)}
                      disabled={downloadingId === cert.id}
                      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                        downloadingId === cert.id
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <Download size={18} />
                      {downloadingId === cert.id ? 'Downloading...' : 'Download PDF'}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(cert.certificateId);
                        setSuccessMsg('Certificate ID copied to clipboard!');
                        setTimeout(() => setSuccessMsg(''), 2000);
                      }}
                      className="px-4 py-3 rounded-lg font-semibold transition bg-gray-100 hover:bg-gray-200 text-gray-700"
                      title="Copy Certificate ID"
                    >
                      Copy ID
                    </button>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs font-medium">ISSUED BY</p>
                    <p className="text-gray-900 font-semibold">{cert.companyName || 'Niklaus Solutions'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">STATUS</p>
                    <p className="flex items-center gap-2">
                      <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                      <span className="text-gray-900 font-semibold">Issued</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">ISSUE DATE</p>
                    <p className="text-gray-900 font-semibold">
                      {new Date(cert.issueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">VERIFICATION</p>
                    <p className="text-blue-600 font-semibold cursor-pointer hover:underline">{cert.certificateId.slice(0, 8)}...</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Information Box */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">About Your Certificates</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex gap-2">
            <span>✓</span>
            <span>All certificates are verified and issued by Niklaus Solutions</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Download your certificates as PDF files to your device</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Each certificate has a unique ID for verification purposes</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Certificates can be shared on LinkedIn and other platforms</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
