import React, { useEffect, useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  Download,
  Filter,
  ArrowUpDown,
  AlertCircle,
  Trash2,
  Mail,
  User,
  Phone,
  MapPin,
  Briefcase,
} from "lucide-react";
import { db } from "../config/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";

interface SeminarRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Student" | "Employee";
  organization: string;
  city: string;
  registeredAt: any;
  status: string;
}

export const SeminarRegistrationsManagement: React.FC = () => {
  const { token } = useAuth();
  const [registrations, setRegistrations] = useState<SeminarRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "Student" | "Employee">(
    "all",
  );
  const [sortConfig, setSortConfig] = useState<{ key: keyof SeminarRegistration | ''; direction: 'asc' | 'desc' }>({
    key: 'registeredAt',
    direction: 'desc'
  });
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>(
    [],
  );

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError("");
      const q = query(
        collection(db, "seminarRegistrations"),
        orderBy("registeredAt", "desc"),
      );
      const snapshot = await getDocs(q);
      const data: SeminarRegistration[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setRegistrations(data);
    } catch (err) {
      setError(
        "Error fetching seminar registrations. Please check Firestore permissions.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this registration?")) {
      try {
        await deleteDoc(doc(db, "seminarRegistrations", id));
        setRegistrations(registrations.filter((r) => r.id !== id));
      } catch (err) {
        alert("Error deleting registration");
        console.error(err);
      }
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRegistrations(filteredRegistrations.map((r) => r.id));
    } else {
      setSelectedRegistrations([]);
    }
  };

  const handleSelectRegistration = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRegistrations([...selectedRegistrations, id]);
    } else {
      setSelectedRegistrations(
        selectedRegistrations.filter((rid) => rid !== id),
      );
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Role",
      "Organization",
      "City",
      "Registered At",
    ];
    const rows = registrations.map((reg) => [
      reg.name,
      reg.email,
      reg.phone,
      reg.role,
      reg.organization,
      reg.city,
      formatDate(reg.registeredAt),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seminar-registrations-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleSort = (key: keyof SeminarRegistration) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredRegistrations = registrations
    .filter((reg) => {
      const matchesSearch =
        reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.organization.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = filterRole === "all" || reg.role === filterRole;

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      let aValue: any = a[sortConfig.key] ?? '';
      let bValue: any = b[sortConfig.key] ?? '';

      // Handle Firestore Timestamps for dates
      if (aValue?.seconds !== undefined) aValue = aValue.seconds;
      if (bValue?.seconds !== undefined) bValue = bValue.seconds;

      // Case-insensitive string comparison
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    try {
      if (date.toDate && typeof date.toDate === "function") {
        return new Date(date.toDate()).toLocaleDateString();
      }
      if (date instanceof Date) {
        return date.toLocaleDateString();
      }
      if (typeof date === "number") {
        return new Date(date).toLocaleDateString();
      }
      return "N/A";
    } catch (error) {
      return "N/A";
    }
  };

  const stats = {
    total: registrations.length,
    students: registrations.filter((r) => r.role === "Student").length,
    employees: registrations.filter((r) => r.role === "Employee").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-8 bg-gradient-to-br from-orange-50 via-white to-orange-100 min-h-screen p-4 sm:p-8 rounded-[3rem]">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">
            Seminar Registrations
          </h1>
          <p className="text-slate-600 mt-2 font-medium">
            Manage and track all seminar registrations
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-xl">
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">
              Total Registrations
            </p>
            <p className="text-4xl font-black text-slate-900 mt-1">
              {stats.total}
            </p>
          </div>
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-xl">
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Students</p>
            <p className="text-4xl font-black text-amber-600 mt-1">
              {stats.students}
            </p>
          </div>
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-xl">
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Employees</p>
            <p className="text-4xl font-black text-emerald-600 mt-1">
              {stats.employees}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-rose-50/70 backdrop-blur-md border border-rose-200 rounded-2xl p-4 flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-900">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-sm"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) =>
              setFilterRole(e.target.value as "all" | "Student" | "Employee")
            }
            className="px-6 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-black uppercase tracking-widest text-xs md:text-sm text-slate-600"
          >
            <option value="all">All Roles</option>
            <option value="Student">Students</option>
            <option value="Employee">Employees</option>
          </select>

          <button
            onClick={handleExportCSV}
            disabled={registrations.length === 0}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-orange-700 transition-all font-black uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          <button
            onClick={fetchRegistrations}
            disabled={loading}
            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all font-black uppercase tracking-wider text-sm disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {/* Table */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-4 border-orange-100 border-t-orange-600 animate-spin mx-auto mb-4"></div>
                <p className="text-orange-900 font-black uppercase tracking-tighter">Initialising Audit...</p>
              </div>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm || filterRole !== "all"
                    ? "No registrations found"
                    : "No registrations yet"}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedRegistrations.length ===
                          filteredRegistrations.length
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                    </th>
                    {[
                      { key: 'name', label: 'Name' },
                      { key: 'email', label: 'Email' },
                      { key: 'phone', label: 'Phone' },
                      { key: 'role', label: 'Role' },
                      { key: 'organization', label: 'Organization' },
                      { key: 'city', label: 'City' },
                      { key: 'registeredAt', label: 'Registered' },
                    ].map((col) => (
                      <th 
                        key={col.key}
                        className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors group"
                        onClick={() => handleSort(col.key as keyof SeminarRegistration)}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          <ArrowUpDown 
                            size={14} 
                            className={`transition-opacity ${
                              sortConfig.key === col.key ? 'opacity-100 text-blue-600' : 'opacity-0 group-hover:opacity-50'
                            }`} 
                          />
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((reg) => (
                    <tr
                      key={reg.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRegistrations.includes(reg.id)}
                          onChange={(e) =>
                            handleSelectRegistration(reg.id, e.target.checked)
                          }
                          className="w-4 h-4 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {reg.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`mailto:${reg.email}`}
                          className="text-orange-600 hover:text-orange-700 flex items-center gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          {reg.email}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`tel:${reg.phone}`}
                          className="flex items-center gap-2 text-gray-900 hover:text-orange-600"
                        >
                          <Phone className="w-4 h-4" />
                          {reg.phone}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            reg.role === "Student"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {reg.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-900">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          {reg.organization}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-900">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {reg.city}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(reg.registeredAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(reg.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                          title="Delete registration"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="text-center text-sm text-gray-600">
          Showing {filteredRegistrations.length} of {registrations.length}{" "}
          registrations
        </div>
      </div>
    </AdminLayout>
  );
};
