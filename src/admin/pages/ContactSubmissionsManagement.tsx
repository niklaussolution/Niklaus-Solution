import { useEffect, useState } from "react";
import { Mail, Phone, MessageSquare, Trash2, Check, Clock } from "lucide-react";
import { db } from "../../admin/config/firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy, addDoc } from "firebase/firestore";
import { AdminLayout } from "../components/AdminLayout";

interface ContactSubmission {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  submittedAt: any;
  status: "new" | "read" | "resolved";
}

export function ContactSubmissionsManagement() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "new" | "read" | "resolved">("all");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const q = query(collection(db, "contactSubmissions"), orderBy("submittedAt", "desc"));
      const snapshot = await getDocs(q);
      const data: ContactSubmission[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      console.log('Contact submissions loaded:', data);
      setSubmissions(data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      alert('Error loading contact submissions. Make sure you have permission to view this collection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (confirm("Are you sure you want to delete this submission?")) {
      try {
        await deleteDoc(doc(db, "contactSubmissions", id));
        setSubmissions(submissions.filter((s) => s.id !== id));
        setShowDetails(false);
      } catch (error) {
        console.error("Error deleting submission:", error);
        alert('Error deleting submission');
      }
    }
  };

  const addTestSubmission = async () => {
    try {
      const contactsRef = collection(db, "contactSubmissions");
      await addDoc(contactsRef, {
        fullName: "Test User",
        email: "test@example.com",
        phone: "91 6380516533",
        subject: "Test Submission",
        message: "This is a test contact submission to verify the system is working.",
        submittedAt: new Date(),
        status: "new",
      });
      fetchSubmissions();
      alert('Test submission added successfully!');
    } catch (error) {
      console.error("Error adding test submission:", error);
      alert('Error adding test submission');
    }
  };

  const handleStatusChange = async (id: string, newStatus: "new" | "read" | "resolved") => {
    try {
      await updateDoc(doc(db, "contactSubmissions", id), {
        status: newStatus,
      });
      setSubmissions(
        submissions.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
      if (selectedSubmission?.id === id) {
        setSelectedSubmission({ ...selectedSubmission, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredSubmissions = filterStatus === "all" 
    ? submissions 
    : submissions.filter((s) => s.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-red-100 text-red-800";
      case "read":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <Clock size={16} />;
      case "read":
        return <MessageSquare size={16} />;
      case "resolved":
        return <Check size={16} />;
      default:
        return null;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-3 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Contact Submissions</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">Manage and respond to contact form submissions</p>
          </div>
          <div className="flex gap-2 sm:gap-4 items-center w-full sm:w-auto">
            <button
              onClick={addTestSubmission}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs sm:text-sm font-semibold transition"
            >
              + Add Test
            </button>
            <div className="flex-1 sm:flex-none bg-orange-100 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600">{submissions.length}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm text-red-600 font-semibold">New Submissions</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-700">
                  {submissions.filter((s) => s.status === "new").length}
                </p>
              </div>
              <Clock size={32} className="text-red-400 flex-shrink-0" />
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm text-yellow-600 font-semibold">Read Submissions</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-700">
                  {submissions.filter((s) => s.status === "read").length}
                </p>
              </div>
              <MessageSquare size={32} className="text-yellow-400 flex-shrink-0" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm text-green-600 font-semibold">Resolved</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-700">
                  {submissions.filter((s) => s.status === "resolved").length}
                </p>
              </div>
              <Check size={32} className="text-green-400 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {["all", "new", "read", "resolved"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                filterStatus === status
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Submissions Table/List */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          {filteredSubmissions.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No submissions to display</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">
                        Phone
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">
                        Subject
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">
                        Submitted
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((submission) => (
                      <tr key={submission.id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-4 sm:px-6 py-4">
                          <p className="font-medium text-gray-900 text-sm">{submission.fullName}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <a
                            href={`mailto:${submission.email}`}
                            className="text-orange-600 hover:underline text-xs sm:text-sm"
                          >
                            {submission.email}
                          </a>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <a
                            href={`tel:${submission.phone}`}
                            className="text-orange-600 hover:underline text-xs sm:text-sm"
                          >
                            {submission.phone}
                          </a>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <p className="text-gray-700 text-xs sm:text-sm">{submission.subject}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${getStatusColor(
                              submission.status
                            )}`}
                          >
                            {getStatusIcon(submission.status)}
                            <span className="hidden sm:inline">{submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}</span>
                            <span className="sm:hidden">{submission.status.charAt(0).toUpperCase()}</span>
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <p className="text-gray-600 text-xs sm:text-sm">{formatDate(submission.submittedAt)}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setShowDetails(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-xs sm:text-sm mr-2 sm:mr-4"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteSubmission(submission.id)}
                            className="text-red-600 hover:text-red-800 inline-flex"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3 p-4">
                {filteredSubmissions.map((submission) => (
                  <div key={submission.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition">
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm truncate">{submission.fullName}</h3>
                        <p className="text-xs text-gray-600 truncate">{submission.email}</p>
                        <a href={`tel:${submission.phone}`} className="text-xs text-orange-600 hover:underline truncate block">{submission.phone}</a>
                      </div>
                      <span
                        className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          submission.status
                        )}`}
                      >
                        {getStatusIcon(submission.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 mb-2 line-clamp-2">{submission.subject}</p>
                    <p className="text-xs text-gray-500 mb-3">{formatDate(submission.submittedAt)}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setShowDetails(true);
                        }}
                        className="flex-1 text-blue-600 hover:text-blue-800 font-semibold text-xs bg-white border border-blue-200 rounded py-1 transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteSubmission(submission.id)}
                        className="text-red-600 hover:text-red-800 font-semibold text-xs bg-white border border-red-200 rounded px-2 py-1 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Details Modal */}
        {showDetails && selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 sm:p-6 flex justify-between items-center">
                <h2 className="text-lg sm:text-2xl font-bold">Submission Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-white hover:bg-orange-700 p-2 rounded text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold">Full Name</p>
                    <p className="text-sm sm:text-lg text-gray-900">{selectedSubmission.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold">Email</p>
                    <a href={`mailto:${selectedSubmission.email}`} className="text-sm sm:text-lg text-orange-600 hover:underline break-all">
                      {selectedSubmission.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold">Phone</p>
                    <a href={`tel:${selectedSubmission.phone}`} className="text-sm sm:text-lg text-orange-600 hover:underline">
                      {selectedSubmission.phone}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold">Submitted</p>
                    <p className="text-sm sm:text-lg text-gray-900">{formatDate(selectedSubmission.submittedAt)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">Subject</p>
                  <p className="text-sm sm:text-lg text-gray-900">{selectedSubmission.subject}</p>
                </div>

                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">Message</p>
                  <p className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-3 sm:p-4 rounded-lg whitespace-pre-wrap break-words">{selectedSubmission.message}</p>
                </div>

                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-3">Status</p>
                  <div className="flex gap-2 flex-wrap">
                    {["new", "read", "resolved"].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedSubmission.id, status as any)}
                        className={`px-3 sm:px-4 py-1 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                          selectedSubmission.status === status
                            ? "bg-orange-500 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <a
                    href={`mailto:${selectedSubmission.email}`}
                    className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2 text-sm font-semibold"
                  >
                    <Mail size={18} />
                    <span>Reply Email</span>
                  </a>
                  <a
                    href={`https://wa.me/${selectedSubmission.phone.replace(/\D/g, "")}?text=Hi%20${selectedSubmission.fullName},%20thanks%20for%20contacting%20us!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 text-sm font-semibold"
                  >
                    <MessageSquare size={18} />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
