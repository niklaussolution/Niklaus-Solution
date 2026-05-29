import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { Trash2, Search, Plus, AlertCircle, Download, X, Check, Loader, ArrowUpDown } from 'lucide-react';
import { db } from '../config/firebase';
import { collection, getDocs, deleteDoc, doc, addDoc, query, where, updateDoc, getDoc, increment } from 'firebase/firestore';
import { api } from '../services/api';

interface Course {
  id: string;
  title: string;
  price: number;
  isActive?: boolean;
}

interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  email: string;
  courseId: string;
  courseTitle: string;
  enrollmentDate: number;
  status: 'Active' | 'Completed' | 'Dropped';
  progress: number;
}

interface AddEnrollmentForm {
  studentName: string;
  email: string;
  courseId: string;
  courseTitle: string;
  status: 'Active' | 'Completed' | 'Dropped';
}

export const CourseEnrollmentsManagement: React.FC = () => {
  const { token } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Completed' | 'Dropped'>('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Enrollment | ''; direction: 'asc' | 'desc' }>({
    key: 'enrollmentDate',
    direction: 'desc'
  });
  const [selectedEnrollments, setSelectedEnrollments] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AddEnrollmentForm>({
    studentName: '',
    email: '',
    courseId: '',
    courseTitle: '',
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchEnrollments(), fetchCourses()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const enrollmentsRef = collection(db, 'courseEnrollments');
      const snapshot = await getDocs(enrollmentsRef);
      const enrollmentsData: Enrollment[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setEnrollments(enrollmentsData);
    } catch (err) {
      setError('Error fetching enrollments');
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const coursesRef = collection(db, 'courses');
      const snapshot = await getDocs(coursesRef);
      const coursesData: Course[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
        price: doc.data().price || 0,
        isActive: doc.data().isActive !== false,
      }));
      const activeCoursesData = coursesData.filter((course) => course.isActive !== false);
      setCourses(activeCoursesData);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.studentName.trim()) errors.studentName = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = 'Invalid email format';
    if (!formData.courseId) errors.courseId = 'Course is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const enrollmentData = {
        studentName: formData.studentName,
        email: formData.email,
        courseId: formData.courseId,
        courseTitle: formData.courseTitle,
        status: formData.status,
        enrollmentDate: Date.now(),
        progress: 0,
      };

      await addDoc(collection(db, 'courseEnrollments'), enrollmentData);

      // Update course enrolled count
      const courseRef = doc(db, 'courses', formData.courseId);
      await updateDoc(courseRef, {
        enrolled: increment(1),
      });

      // Auto-issue certificate if enrollment is created as Completed
      if (formData.status === 'Completed') {
        await issueCourseCompletionCertificate({
          id: '',
          studentId: '',
          ...enrollmentData,
        } as Enrollment);
        // cert function already sets the success message; just reset form and close
      } else {
        setSuccess('Enrollment added successfully!');
      }
      setFormData({
        studentName: '',
        email: '',
        courseId: '',
        courseTitle: '',
        status: 'Active',
      });
      setShowAddModal(false);
      fetchEnrollments();
    } catch (err: any) {
      setError(`Error adding enrollment: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this enrollment?')) return;

    try {
      const enrollment = enrollments.find((e) => e.id === id);
      if (enrollment) {
        const courseRef = doc(db, 'courses', enrollment.courseId);
        await updateDoc(courseRef, {
          enrolled: increment(-1),
        });
      }
      await deleteDoc(doc(db, 'courseEnrollments', id));
      setSuccess('Enrollment deleted successfully!');
      fetchEnrollments();
    } catch (err) {
      setError('Error deleting enrollment');
      console.error(err);
    }
  };

  const handleCourseSelect = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    setFormData((prev) => ({
      ...prev,
      courseId,
      courseTitle: course?.title || '',
    }));
  };

  // Auto-issue a certificate when an enrollment is marked Completed
  const issueCourseCompletionCertificate = async (enrollment: Enrollment) => {
    try {
      // Idempotency – skip if already issued for this course + student
      // Use 2-field query + in-memory status filter to avoid needing a 3-field composite index
      const certsQ = query(
        collection(db, 'certificates'),
        where('studentEmail', '==', enrollment.email.toLowerCase()),
        where('courseName', '==', enrollment.courseTitle)
      );
      const certsSnap = await getDocs(certsQ);
      const alreadyIssued = certsSnap.docs.some((d) => d.data().status === 'issued');
      if (alreadyIssued) return;

      const certificateId = `CERT-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase()}`;
      const now = new Date().toISOString();

      await addDoc(collection(db, 'certificates'), {
        studentName: enrollment.studentName,
        studentEmail: enrollment.email.toLowerCase(),
        courseName: enrollment.courseTitle,
        courseType: 'course',
        certificateId,
        completionDate: now,
        issueDate: now,
        status: 'issued',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      setSuccess(`Certificate automatically issued to ${enrollment.studentName} for "${enrollment.courseTitle}"`);
    } catch (err) {
      console.error('Error auto-issuing course certificate:', err);
    }
  };

  const handleStatusChange = async (enrollmentId: string, newStatus: 'Active' | 'Completed' | 'Dropped') => {
    try {
      const enrollment = enrollments.find((e) => e.id === enrollmentId);
      if (!enrollment || enrollment.status === newStatus) return;

      const enrollmentRef = doc(db, 'courseEnrollments', enrollmentId);
      await updateDoc(enrollmentRef, {
        status: newStatus,
        updatedAt: Date.now(),
      });

      // Issue certificate only when transitioning TO Completed
      if (newStatus === 'Completed') {
        await issueCourseCompletionCertificate(enrollment);
      } else {
        setSuccess(`Status updated to ${newStatus}`);
      }

      setEnrollments((prev) =>
        prev.map((e) => (e.id === enrollmentId ? { ...e, status: newStatus } : e))
      );
    } catch (err) {
      setError('Failed to update enrollment status');
      console.error(err);
    }
  };

  const handleSort = (key: keyof Enrollment) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredEnrollments = enrollments
    .filter((enrollment) => {
      const matchesSearch =
        enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || enrollment.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      let aValue: any = a[sortConfig.key] ?? '';
      let bValue: any = b[sortConfig.key] ?? '';

      // Case-insensitive string comparison for alphabetical sorting
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

  const stats = {
    total: enrollments.length,
    active: enrollments.filter((e) => e.status === 'Active').length,
    completed: enrollments.filter((e) => e.status === 'Completed').length,
    dropped: enrollments.filter((e) => e.status === 'Dropped').length,
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <div className="text-gray-600">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 bg-gradient-to-br from-orange-50 via-white to-orange-100 min-h-screen p-4 sm:p-8 rounded-[3rem]">
        {/* Alerts */}
        {error && (
          <div className="bg-rose-50/70 backdrop-blur-md border border-rose-200 rounded-2xl p-4 flex items-start gap-3 shadow-lg">
            <AlertCircle className="text-rose-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-rose-700 font-bold">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50/70 backdrop-blur-md border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 shadow-lg">
            <Check size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-emerald-700 font-bold">{success}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Enrollments', value: stats.total, color: 'text-slate-900' },
            { label: 'Active', value: stats.active, color: 'text-amber-600' },
            { label: 'Completed', value: stats.completed, color: 'text-emerald-600' },
            { label: 'Dropped', value: stats.dropped, color: 'text-rose-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-xl">
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{stat.label}</p>
              <p className={`text-3xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">Enrollments ({filteredEnrollments.length})</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all text-sm uppercase tracking-wider font-black flex items-center gap-2"
          >
            <Plus size={20} />
            Add Enrollment
          </button>
        </div>

        {/* Add Enrollment Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Add Course Enrollment</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddEnrollment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                  <input
                    type="text"
                    value={formData.studentName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, studentName: e.target.value }))}
                    className={`w-full border rounded-lg px-3 py-2 ${
                      formErrors.studentName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter student name"
                  />
                  {formErrors.studentName && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.studentName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className={`w-full border rounded-lg px-3 py-2 ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter email"
                  />
                  {formErrors.email && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => handleCourseSelect(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 ${
                      formErrors.courseId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  {formErrors.courseId && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.courseId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option>Active</option>
                    <option>Completed</option>
                    <option>Dropped</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium"
                >
                  {isSubmitting ? 'Adding...' : 'Add Enrollment'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl p-6 flex gap-4 flex-wrap shadow-xl">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search enrollments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-sm"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-white/50 border border-slate-200 rounded-2xl px-6 py-3 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-black uppercase tracking-widest text-xs md:text-sm text-slate-600"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Dropped">Dropped</option>
          </select>
        </div>

        {/* Enrollments Table */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/5 border-b border-white/20">
                <tr>
                  {[
                    { key: 'studentName', label: 'Student Name' },
                    { key: 'email', label: 'Email' },
                    { key: 'courseTitle', label: 'Course' },
                    { key: 'enrollmentDate', label: 'Enrollment Date' },
                    { key: 'status', label: 'Status' },
                  ].map((col) => (
                    <th 
                      key={col.key}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors group"
                      onClick={() => handleSort(col.key as keyof Enrollment)}
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No enrollments found
                    </td>
                  </tr>
                ) : (
                  filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{enrollment.studentName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{enrollment.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{enrollment.courseTitle}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={enrollment.status}
                          onChange={(e) =>
                            handleStatusChange(
                              enrollment.id,
                              e.target.value as 'Active' | 'Completed' | 'Dropped'
                            )
                          }
                          className={`border rounded px-2 py-1 text-xs font-medium cursor-pointer ${
                            enrollment.status === 'Active'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : enrollment.status === 'Completed'
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                          }`}
                        >
                          <option value="Active">Active</option>
                          <option value="Completed">Completed</option>
                          <option value="Dropped">Dropped</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDelete(enrollment.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
