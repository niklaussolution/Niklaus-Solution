import { useEffect, useState } from "react";
import { Send, Trash2, Check, Clock, Download, Phone, Mail, MessageCircle } from "lucide-react";
import { db } from "../../admin/config/firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy, writeBatch } from "firebase/firestore";
import { AdminLayout } from "../components/AdminLayout";

interface Enquiry {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  whatsappNumber: string;
  course: string;
  message: string;
  submittedAt: any;
  status: "new" | "read" | "resolved";
}

export function EnquiryManagement() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "new" | "read" | "resolved">("all");
  const [markingAllRead, setMarkingAllRead] = useState(false);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const q = query(collection(db, "courseEnquiries"), orderBy("submittedAt", "desc"));
      const snapshot = await getDocs(q);
      const data: Enquiry[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setEnquiries(data);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      alert("Error loading enquiries. Make sure you have permission to view this collection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEnquiry = async (id: string) => {
    if (confirm("Are you sure you want to delete this enquiry?")) {
      try {
        await deleteDoc(doc(db, "courseEnquiries", id));
        setEnquiries(enquiries.filter((s) => s.id !== id));
        setShowDetails(false);
      } catch (error) {
        console.error("Error deleting enquiry:", error);
        alert("Error deleting enquiry");
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: "new" | "read" | "resolved") => {
    try {
      await updateDoc(doc(db, "courseEnquiries", id), { status: newStatus });
      setEnquiries(enquiries.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const BATCH_LIMIT = 450;

  const handleMarkAllAsRead = async () => {
    const newOnes = enquiries.filter((s) => s.status === "new");
    if (newOnes.length === 0) return;
    if (!confirm(`Mark all ${newOnes.length} new enquiry(ies) as read?`)) return;

    setMarkingAllRead(true);
    try {
      for (let i = 0; i < newOnes.length; i += BATCH_LIMIT) {
        const batch = writeBatch(db);
        newOnes.slice(i, i + BATCH_LIMIT).forEach((s) => {
          batch.update(doc(db, "courseEnquiries", s.id), { status: "read" });
        });
        await batch.commit();
      }
      setEnquiries(enquiries.map((s) => (s.status === "new" ? { ...s, status: "read" } : s)));
    } catch (error) {
      console.error("Error marking all as read:", error);
      alert("Error marking all enquiries as read");
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleDeleteAll = async () => {
    if (enquiries.length === 0) return;
    if (
      !confirm(
        `Are you sure you want to permanently delete ALL ${enquiries.length} enquiries? This cannot be undone.`
      )
    )
      return;
    if (!confirm("This will delete every enquiry shown here. Click OK to confirm you really want to proceed."))
      return;

    setMarkingAllRead(true);
    try {
      for (let i = 0; i < enquiries.length; i += BATCH_LIMIT) {
        const batch = writeBatch(db);
        enquiries.slice(i, i + BATCH_LIMIT).forEach((s) => {
          batch.delete(doc(db, "courseEnquiries", s.id));
        });
        await batch.commit();
      }
      setEnquiries([]);
      setShowDetails(false);
    } catch (error) {
      console.error("Error deleting all enquiries:", error);
      alert("Error deleting all enquiries");
    } finally {
      setMarkingAllRead(false);
    }
  };

  const filteredEnquiries = filterStatus === "all"
    ? enquiries
    : enquiries.filter((s) => s.status === filterStatus);

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
        return <Send size={16} />;
      case "resolved":
        return <Check size={16} />;
      default:
        return null;
    }
  };

  const escapeCsvField = (value: string) => {
    const str = String(value ?? "");
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
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

  const handleExportExcel = () => {
    const headers = [
      "Name",
      "Email",
      "Mobile Number",
      "WhatsApp Number",
      "Course",
      "Extra Information",
      "Status",
      "Submitted",
    ];
    const rows = filteredEnquiries.map((s) => [
      s.name,
      s.email,
      s.mobileNumber,
      s.whatsappNumber,
      s.course,
      s.message,
      s.status,
      formatDate(s.submittedAt),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsvField).join(","))
      .join("\r\n");

    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Enquiries</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">Applications from the /enquiry landing page</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-4 items-center w-full sm:w-auto">
            <button
              onClick={handleExportExcel}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs sm:text-sm font-semibold transition"
            >
              <Download size={16} />
              Export Excel
            </button>
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAllRead || enquiries.filter((s) => s.status === "new").length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-xs sm:text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={16} />
              Mark All Read
            </button>
            <button
              onClick={handleDeleteAll}
              disabled={markingAllRead || enquiries.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs sm:text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={16} />
              Delete All
            </button>
            <div className="flex-1 sm:flex-none bg-orange-100 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600">{enquiries.length}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm text-red-600 font-semibold">New</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-700">
                  {enquiries.filter((s) => s.status === "new").length}
                </p>
              </div>
              <Clock size={32} className="text-red-400 flex-shrink-0" />
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm text-yellow-600 font-semibold">Read</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-700">
                  {enquiries.filter((s) => s.status === "read").length}
                </p>
              </div>
              <Send size={32} className="text-yellow-400 flex-shrink-0" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm text-green-600 font-semibold">Resolved</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-700">
                  {enquiries.filter((s) => s.status === "resolved").length}
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

        {/* Enquiries Table/List */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          {filteredEnquiries.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <Send size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No enquiries to display</p>
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
                        Mobile
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">
                        Course
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
                    {filteredEnquiries.map((enquiry) => (
                      <tr key={enquiry.id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-4 sm:px-6 py-4">
                          <p className="font-medium text-gray-900 text-sm">{enquiry.name}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <a
                            href={`tel:${enquiry.mobileNumber}`}
                            className="text-orange-600 hover:underline text-xs sm:text-sm"
                          >
                            {enquiry.mobileNumber}
                          </a>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <p className="text-gray-700 text-xs sm:text-sm">{enquiry.course}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${getStatusColor(
                              enquiry.status
                            )}`}
                          >
                            {getStatusIcon(enquiry.status)}
                            <span className="hidden sm:inline">
                              {enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1)}
                            </span>
                            <span className="sm:hidden">{enquiry.status.charAt(0).toUpperCase()}</span>
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <p className="text-gray-600 text-xs sm:text-sm">{formatDate(enquiry.submittedAt)}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedEnquiry(enquiry);
                              setShowDetails(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-xs sm:text-sm mr-2 sm:mr-4"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteEnquiry(enquiry.id)}
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
                {filteredEnquiries.map((enquiry) => (
                  <div key={enquiry.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition">
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm truncate">{enquiry.name}</h3>
                        <a href={`tel:${enquiry.mobileNumber}`} className="text-xs text-orange-600 hover:underline truncate block">{enquiry.mobileNumber}</a>
                      </div>
                      <span
                        className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          enquiry.status
                        )}`}
                      >
                        {getStatusIcon(enquiry.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 mb-2 line-clamp-2">{enquiry.course}</p>
                    <p className="text-xs text-gray-500 mb-3">{formatDate(enquiry.submittedAt)}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedEnquiry(enquiry);
                          setShowDetails(true);
                        }}
                        className="flex-1 text-blue-600 hover:text-blue-800 font-semibold text-xs bg-white border border-blue-200 rounded py-1 transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteEnquiry(enquiry.id)}
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
        {showDetails && selectedEnquiry && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 sm:p-6 flex justify-between items-center">
                <h2 className="text-lg sm:text-2xl font-bold">Enquiry Details</h2>
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
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold">Name</p>
                    <p className="text-sm sm:text-lg text-gray-900">{selectedEnquiry.name}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold">Email</p>
                    <a href={`mailto:${selectedEnquiry.email}`} className="text-sm sm:text-lg text-orange-600 hover:underline break-all">
                      {selectedEnquiry.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold">Mobile Number</p>
                    <a href={`tel:${selectedEnquiry.mobileNumber}`} className="text-sm sm:text-lg text-orange-600 hover:underline">
                      {selectedEnquiry.mobileNumber}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold">WhatsApp Number</p>
                    <p className="text-sm sm:text-lg text-gray-900">{selectedEnquiry.whatsappNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold">Course</p>
                    <p className="text-sm sm:text-lg text-gray-900">{selectedEnquiry.course}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold">Submitted</p>
                    <p className="text-sm sm:text-lg text-gray-900">{formatDate(selectedEnquiry.submittedAt)}</p>
                  </div>
                </div>

                {selectedEnquiry.message && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">Extra Information</p>
                    <p className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-3 sm:p-4 rounded-lg whitespace-pre-wrap break-words">
                      {selectedEnquiry.message}
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-3">Status</p>
                  <div className="flex gap-2 flex-wrap">
                    {["new", "read", "resolved"].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedEnquiry.id, status as any)}
                        className={`px-3 sm:px-4 py-1 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                          selectedEnquiry.status === status
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
                    href={`mailto:${selectedEnquiry.email}`}
                    className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2 text-sm font-semibold"
                  >
                    <Mail size={18} />
                    <span>Reply Email</span>
                  </a>
                  <a
                    href={`https://wa.me/${selectedEnquiry.whatsappNumber.replace(/\D/g, "")}?text=Hi%20${selectedEnquiry.name},%20thanks%20for%20your%20interest%20in%20${encodeURIComponent(selectedEnquiry.course)}!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 text-sm font-semibold"
                  >
                    <MessageCircle size={18} />
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
