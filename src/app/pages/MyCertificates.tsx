import React, { useState, useEffect } from 'react';
import { Download, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { db } from '../../admin/config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { generateCertificatePDF } from '../../utils';

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
}

export const MyCertificates: React.FC = () => {
  const [email, setEmail] = useState('');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSearched(true);
    setLoading(true);

    try {
      if (!email.trim()) {
        setError('Please enter your email address');
        setCertificates([]);
        setLoading(false);
        return;
      }

      // Query certificates by email
      const certificatesRef = collection(db, 'certificates');
      const q = query(
        certificatesRef,
        where('studentEmail', '==', email.toLowerCase().trim())
      );
      const snapshot = await getDocs(q);

      const certData: Certificate[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));

      if (certData.length === 0) {
        setError('No certificates found for this email address');
        setCertificates([]);
      } else {
        // Show all issued certificates for this email
        const issuedCerts = certData.filter((c) => c.status === 'issued');
        if (issuedCerts.length === 0) {
          setError('No issued certificates found for this email');
          setCertificates([]);
        } else {
          setCertificates(issuedCerts);
          setError('');
        }
      }
    } catch (err) {
      setError('Error fetching certificates. Please try again.');
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (cert: Certificate) => {
    await generateCertificatePDF({
      studentName: cert.studentName,
      courseName: cert.courseName || 'WEB DEVELOPMENT',
      completionDate: cert.completionDate,
      certificateId: cert.certificateId,
      companyLogo: cert.companyLogo || '/logo.png',
      signature: '/signature.png',
      companyName: 'NIKLAUS SOLUTIONS',
        });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Certificates</h1>
          <p className="text-gray-600">Search and download your certificates</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? 'Searching...' : 'Search My Certificates'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-8">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Certificates List */}
        {searched && certificates.length > 0 && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
              <div className="flex items-center gap-2 text-green-700 font-semibold mb-4">
                <CheckCircle className="w-5 h-5" />
                Found {certificates.length} certificate{certificates.length !== 1 ? 's' : ''}
              </div>

              <div className="space-y-4">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{cert.courseName}</h3>
                      <p className="text-sm text-gray-600">
                        Completed: {new Date(cert.completionDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Certificate ID: <span className="font-mono font-semibold">{cert.certificateId}</span>
                      </p>
                      {cert.courseCode && (
                        <p className="text-sm text-gray-500">
                          Course Code: {cert.courseCode}
                        </p>
                      )}
                      {cert.instructorName && (
                        <p className="text-sm text-gray-500">
                          Instructor: {cert.instructorName}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDownload(cert)}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 whitespace-nowrap"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Search Yet */}
        {!searched && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <p className="text-gray-700 text-lg">
              Enter your email address to find and download your certificates
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How it works</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm">1</span>
              <span>Enter the email address associated with your certificate</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm">2</span>
              <span>View all your issued certificates</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm">3</span>
              <span>Click "Download PDF" to get your certificate as a PDF file</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MyCertificates;
