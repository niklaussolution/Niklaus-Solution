import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, addDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth, db, storage } from '../../config/firebase';
import { useStudent } from '../context/StudentContext';
import { SecureVideoPlayer } from '../components/SecureVideoPlayer';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Menu, X, LogOut, User, BookOpen, Award, Heart, HelpCircle, ShoppingCart, MessageSquare, Settings, ChevronDown, Upload, Eye, EyeOff, Lock, Globe, Linkedin, Twitter, Github, Play, ShieldCheck, Send } from 'lucide-react';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  enrolledWorkshops?: string[];
  certificates?: string[];
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  publicName?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
}

interface CourseVideo {
  id: string;
  workshopId: string;
  title: string;
  videoUrl: string;
  description: string;
  duration?: string;
  order: number;
  isActive: boolean;
}

interface Order {
  id: string;
  workshopTitle: string;
  amount: number;
  status: string;
  paymentStatus: string;
  registrationDate: string;
}

interface QuizAttempt {
  id: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  attemptedAt: number;
}

interface Question {
  id: string;
  question: string;
  status: string;
  replies: any[];
  createdAt: number;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'student' | 'admin';
  timestamp: number;
}

interface StudentProgress {
  completedVideos: string[];
  completionPercentage: number;
}

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useStudent();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [coursesWithVideos, setCoursesWithVideos] = useState<Map<string, CourseVideo[]>>(new Map());
  const [videoLoading, setVideoLoading] = useState(true);
  const [selectedCourseVideo, setSelectedCourseVideo] = useState<{ course: string; video: CourseVideo } | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [studentProgress, setStudentProgress] = useState<Map<string, StudentProgress>>(new Map());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState<any>({});
  const [successMsg, setSuccessMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        const studentId = localStorage.getItem('studentId');

        if (!token || !studentId) {
          navigate('/student/login');
          return;
        }

        const studentDoc = await getDoc(doc(db, 'students', studentId));
        if (!studentDoc.exists()) {
          setError('Student profile not found');
          navigate('/student/login');
          return;
        }

        const studentData = studentDoc.data();
        const profileData: StudentProfile = {
          id: studentDoc.id,
          name: studentData.name,
          email: studentData.email,
          phone: studentData.phone,
          enrolledWorkshops: studentData.enrolledWorkshops,
          certificates: studentData.certificates,
          bio: studentData.bio,
          profileImage: studentData.profileImage,
          coverImage: studentData.coverImage,
          publicName: studentData.publicName || studentData.name,
          social: studentData.social || {},
        };

        setStudent(profileData);
        setProfileFormData(profileData);

        // Fetch wishlist
        const wishlistQ = query(collection(db, 'wishlists'), where('studentId', '==', studentId));
        const wishlistSnap = await getDocs(wishlistQ);
        if (!wishlistSnap.empty) {
          setWishlist(wishlistSnap.docs[0].data().workshops || []);
        }

        // Fetch orders/registrations by studentId
        let ordersSnap = await getDocs(query(collection(db, 'registrations'), where('studentId', '==', studentId)));
        
        // Fallback: if no registrations found by studentId, try by email
        if (ordersSnap.empty && studentData.email) {
          console.warn('No registrations found by studentId, trying by email:', studentData.email);
          ordersSnap = await getDocs(query(collection(db, 'registrations'), where('email', '==', studentData.email)));
        }
        
        console.log('Registrations found:', ordersSnap.docs.length);
        ordersSnap.docs.forEach((doc, i) => {
          console.log(`Registration ${i}:`, doc.data());
        });
        
        const completedOrders = ordersSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as any))
          .filter(o => o.paymentStatus === 'Completed');
        
        console.log('Completed orders:', completedOrders.length, completedOrders);
        setOrders(completedOrders);

        // Get enrolled workshops from both student doc and registrations
        const enrolledFromStudent = studentData.enrolledWorkshops || [];
        const enrolledFromRegistrations = completedOrders.map(order => order.workshopTitle);
        
        console.log('Enrolled from student doc:', enrolledFromStudent);
        console.log('Enrolled from registrations:', enrolledFromRegistrations);
        
        const allEnrolledWorkshops = Array.from(new Set([...enrolledFromStudent, ...enrolledFromRegistrations]));
        
        console.log('All enrolled workshops:', allEnrolledWorkshops);

        // Update student profile with combined enrolled workshops
        const updatedStudent: StudentProfile = {
          ...profileData,
          enrolledWorkshops: allEnrolledWorkshops,
        };
        setStudent(updatedStudent);

        // Fetch quiz attempts
        const quizQ = query(collection(db, 'quizAttempts'), where('studentId', '==', studentId));
        const quizSnap = await getDocs(quizQ);
        setQuizAttempts(quizSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));

        // Fetch questions
        if (allEnrolledWorkshops && allEnrolledWorkshops.length > 0) {
          const workshopsRef = collection(db, 'workshops');
          let allQuestions: Question[] = [];
          for (const workshopName of allEnrolledWorkshops) {
            const wQ = query(workshopsRef, where('title', '==', workshopName));
            const wSnap = await getDocs(wQ);
            if (!wSnap.empty) {
              const workshopId = wSnap.docs[0].id;
              const questionsQ = query(collection(db, 'questions'), where('workshopId', '==', workshopId), where('studentId', '==', studentId));
              const questionsSnap = await getDocs(questionsQ);
              allQuestions = [...allQuestions, ...questionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any))];
            }
          }
          setQuestions(allQuestions);
        }
      } catch (err: any) {
        setError('Failed to load profile');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [navigate]);

  // Fetch videos for enrolled courses
  useEffect(() => {
    const fetchEnrolledCoursesVideos = async () => {
      if (!student?.enrolledWorkshops || student.enrolledWorkshops.length === 0) {
        setVideoLoading(false);
        return;
      }

      try {
        const videosMap = new Map<string, CourseVideo[]>();
        const progressMap = new Map<string, StudentProgress>();

        for (const courseName of student.enrolledWorkshops) {
          const workshopsRef = collection(db, 'workshops');
          const workshopQuery = query(workshopsRef, where('title', '==', courseName));
          const workshopSnapshot = await getDocs(workshopQuery);

          if (!workshopSnapshot.empty) {
            const workshopId = workshopSnapshot.docs[0].id;

            // Fetch videos
            const videosRef = collection(db, 'workshop_videos');
            const videosQuery = query(videosRef, where('workshopId', '==', workshopId), where('isActive', '==', true));
            const videosSnapshot = await getDocs(videosQuery);

            const videos = videosSnapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() } as CourseVideo))
              .sort((a, b) => a.order - b.order);

            videosMap.set(courseName, videos);

            // Fetch progress
            const progressQ = query(collection(db, 'studentProgress'), where('studentId', '==', student.id), where('workshopId', '==', workshopId));
            const progressSnap = await getDocs(progressQ);
            if (!progressSnap.empty) {
              progressMap.set(courseName, progressSnap.docs[0].data() as StudentProgress);
            } else {
              // Initialize progress if not exists
              progressMap.set(courseName, { completedVideos: [], completionPercentage: 0 });
            }
          }
        }

        setCoursesWithVideos(videosMap);
        setStudentProgress(progressMap);
      } catch (err) {
        console.error('Error fetching course videos:', err);
      } finally {
        setVideoLoading(false);
      }
    };

    fetchEnrolledCoursesVideos();
  }, [student?.enrolledWorkshops, student?.id]);

  // Real-time messenger subscription
  useEffect(() => {
    const studentId = localStorage.getItem('studentId');
    if (!studentId || activePage !== 'qa') return;

    const messagesRef = collection(db, 'students', studentId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      setMessages(msgs);
      setTimeout(scrollToBottom, 100);
    });

    return () => unsubscribe();
  }, [activePage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const studentId = localStorage.getItem('studentId');
    if (!studentId || !newMessage.trim()) return;

    const textPayload = newMessage;
    setNewMessage('');

    try {
      const messagesRef = collection(db, 'students', studentId, 'messages');
      await addDoc(messagesRef, {
        text: textPayload,
        sender: 'student',
        timestamp: Date.now()
      });

      // Update unread status for admin
      const studentDocRef = doc(db, 'students', studentId);
      await updateDoc(studentDocRef, {
        lastMessage: textPayload,
        lastMessageTime: Date.now(),
        hasUnread: true
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      navigate('/student/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageType: 'profileImage' | 'coverImage') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!student) return;

    try {
      setUploadingImage(true);
      const storageRef = ref(storage, `students/${student.id}/${imageType}/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await updateDoc(doc(db, 'students', student.id), {
        [imageType]: url,
        updatedAt: Date.now(),
      });

      setStudent({ ...student, [imageType]: url });
      setProfileFormData({ ...profileFormData, [imageType]: url });
      setSuccessMsg(`${imageType === 'profileImage' ? 'Profile' : 'Cover'} image updated!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (passwordData.new.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        setError('User not authenticated');
        return;
      }

      const credential = EmailAuthProvider.credential(user.email, passwordData.current);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordData.new);

      setShowPasswordModal(false);
      setPasswordData({ current: '', new: '', confirm: '' });
      setError('');
      setSuccessMsg('Password changed successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    }
  };

  const handleSaveProfile = async () => {
    if (!student) return;
    try {
      await updateDoc(doc(db, 'students', student.id), {
        name: profileFormData.name || student.name,
        phone: profileFormData.phone || student.phone,
        bio: profileFormData.bio || student.bio,
        publicName: profileFormData.publicName || student.publicName,
        social: {
          linkedin: profileFormData.linkedin || '',
          twitter: profileFormData.twitter || '',
          github: profileFormData.github || '',
          website: profileFormData.website || '',
        },
        updatedAt: Date.now(),
      });
      setStudent({ ...student, ...profileFormData });
      setEditingProfile(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to save profile');
    }
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim() || !student || !student.enrolledWorkshops || student.enrolledWorkshops.length === 0) return;

    try {
      setSubmittingQuestion(true);
      const workshopsRef = collection(db, 'workshops');
      const wQ = query(workshopsRef, where('title', '==', student.enrolledWorkshops[0]));
      const wSnap = await getDocs(wQ);
      
      if (!wSnap.empty) {
        const workshopId = wSnap.docs[0].id;
        await addDoc(collection(db, 'questions'), {
          studentId: student.id,
          workshopId: workshopId,
          question: newQuestion,
          status: 'open',
          replies: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        
        setQuestions([...questions, {
          id: Date.now().toString(),
          question: newQuestion,
          status: 'open',
          replies: [],
          createdAt: Date.now(),
        }]);
        setNewQuestion('');
        setSuccessMsg('Question submitted successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError('Failed to submit question');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!window.confirm('This will logout you from all devices. Continue?')) return;
    try {
      if (student?.id) {
        await signOut(auth);
        logout();
        navigate('/student/login');
        setSuccessMsg('Logged out from all devices');
      }
    } catch (err) {
      setError('Failed to logout from all devices');
    }
  };

  const recordVideoCompletion = async (videoId: string, courseName: string) => {
    if (!student) return;
    try {
      const workshopsRef = collection(db, 'workshops');
      const wQ = query(workshopsRef, where('title', '==', courseName));
      const wSnap = await getDocs(wQ);
      
      if (!wSnap.empty) {
        const workshopId = wSnap.docs[0].id;
        const progressQ = query(collection(db, 'studentProgress'), where('studentId', '==', student.id), where('workshopId', '==', workshopId));
        const progressSnap = await getDocs(progressQ);

        if (progressSnap.empty) {
          await addDoc(collection(db, 'studentProgress'), {
            studentId: student.id,
            workshopId: workshopId,
            completedVideos: [videoId],
            completionPercentage: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        } else {
          const progressRef = progressSnap.docs[0].ref;
          const progressData = progressSnap.docs[0].data() as any;
          if (!progressData.completedVideos.includes(videoId)) {
            await updateDoc(progressRef, {
              completedVideos: [...progressData.completedVideos, videoId],
              updatedAt: Date.now(),
            });
          }
        }
      }
    } catch (err) {
      console.error('Error recording video completion:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/student/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out z-40 md:relative md:translate-x-0 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b shrink-0">
          <h1 className="text-2xl font-bold text-gray-800">Student Portal</h1>
          <p className="text-sm text-gray-600 mt-2">Welcome, {student?.name?.split(' ')[0]}!</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2 pb-24">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'courses', label: 'Enrolled Courses', icon: BookOpen },
            { id: 'wishlist', label: 'Wishlist', icon: Heart },
            { id: 'quiz', label: 'Quiz Attempts', icon: HelpCircle },
            { id: 'orders', label: 'Order History', icon: ShoppingCart },
            { id: 'qa', label: 'Support Chat', icon: MessageSquare },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActivePage(id); setSidebarOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${
                activePage === id ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t shrink-0 bg-white">
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <div className="bg-white shadow-md px-4 sm:px-6 py-4 flex items-center justify-between md:hidden">
          <h1 className="text-xl font-bold text-gray-800">Student Dashboard</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="bg-green-50 border-l-4 border-green-600 text-green-800 px-6 py-4 m-4 rounded">
            {successMsg}
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activePage === 'dashboard' && (
            <>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {student?.name}!</h2>
                <p className="text-gray-600">Here's an overview of your learning progress</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-2">Enrolled Courses</p>
                      <p className="text-3xl font-bold text-blue-600">{student?.enrolledWorkshops?.length || 0}</p>
                    </div>
                    <BookOpen size={32} className="text-blue-600 opacity-20" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-2">Completed</p>
                      <p className="text-3xl font-bold text-green-600">{student?.certificates?.length || 0}</p>
                    </div>
                    <Award size={32} className="text-green-600 opacity-20" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-2">Quiz Attempts</p>
                      <p className="text-3xl font-bold text-purple-600">{quizAttempts.length}</p>
                    </div>
                    <HelpCircle size={32} className="text-purple-600 opacity-20" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-2">Wishlist Items</p>
                      <p className="text-3xl font-bold text-red-600">{wishlist.length}</p>
                    </div>
                    <Heart size={32} className="text-red-600 opacity-20" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Enrolled Courses</h3>
                  {student?.enrolledWorkshops && student.enrolledWorkshops.length > 0 ? (
                    <ul className="space-y-2">
                      {student.enrolledWorkshops.map((workshop, index) => (
                        <li key={index} className="p-3 bg-blue-50 rounded-lg">{workshop}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No courses enrolled yet</p>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Certificates</h3>
                  {student?.certificates && student.certificates.length > 0 ? (
                    <ul className="space-y-2">
                      {student.certificates.map((cert, index) => (
                        <li key={index} className="p-3 bg-green-50 rounded-lg">{cert}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No certificates earned yet</p>
                  )}
                </div>
              </div>
            </>
          )}

          {activePage === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
                  <p className="text-gray-600">Manage your account information</p>
                </div>
                <button
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  {editingProfile ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600 group">
                  {student?.coverImage && <img src={student.coverImage} alt="Cover" className="w-full h-full object-cover" />}
                  {editingProfile && (
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer">
                      <Upload size={24} className="text-white" />
                      <input type="file" accept="image/*" onChange={(e) => handleProfileImageUpload(e, 'coverImage')} className="hidden" disabled={uploadingImage} />
                    </label>
                  )}
                </div>

                <div className="px-6 pb-6">
                  <div className="flex items-end gap-4 -mt-16 mb-6 relative">
                    <div className="relative h-32 w-32 rounded-full border-4 border-white bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center overflow-hidden">
                      {student?.profileImage ? (
                        <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={64} className="text-white" />
                      )}
                      {editingProfile && (
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer">
                          <Upload size={24} className="text-white" />
                          <input type="file" accept="image/*" onChange={(e) => handleProfileImageUpload(e, 'profileImage')} className="hidden" disabled={uploadingImage} />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileFormData.name || ''}
                        onChange={(e) => setProfileFormData({ ...profileFormData, name: e.target.value })}
                        disabled={!editingProfile}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Public Name</label>
                      <input
                        type="text"
                        value={profileFormData.publicName || ''}
                        onChange={(e) => setProfileFormData({ ...profileFormData, publicName: e.target.value })}
                        disabled={!editingProfile}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input type="email" value={student?.email || ''} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profileFormData.phone || ''}
                        onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                        disabled={!editingProfile}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        value={profileFormData.bio || ''}
                        onChange={(e) => setProfileFormData({ ...profileFormData, bio: e.target.value })}
                        disabled={!editingProfile}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 resize-none"
                      />
                    </div>
                  </div>

                  {editingProfile && (
                    <>
                      <div className="border-t pt-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Social Links</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                            <input
                              type="url"
                              value={profileFormData.linkedin || ''}
                              onChange={(e) => setProfileFormData({ ...profileFormData, linkedin: e.target.value })}
                              placeholder="https://linkedin.com/in/yourprofile"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                            <input
                              type="url"
                              value={profileFormData.twitter || ''}
                              onChange={(e) => setProfileFormData({ ...profileFormData, twitter: e.target.value })}
                              placeholder="https://twitter.com/yourprofile"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                            <input
                              type="url"
                              value={profileFormData.github || ''}
                              onChange={(e) => setProfileFormData({ ...profileFormData, github: e.target.value })}
                              placeholder="https://github.com/yourprofile"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                            <input
                              type="url"
                              value={profileFormData.website || ''}
                              onChange={(e) => setProfileFormData({ ...profileFormData, website: e.target.value })}
                              placeholder="https://yourwebsite.com"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">
                          Save Changes
                        </button>
                        <button onClick={() => setShowPasswordModal(true)} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2">
                          <Lock size={18} /> Change Password
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {activePage === 'courses' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800">Enrolled Courses</h2>
              </div>

              {student?.enrolledWorkshops && student.enrolledWorkshops.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {student.enrolledWorkshops.map((workshop, index) => {
                    const progress = studentProgress.get(workshop) || { completedVideos: [], completionPercentage: 0 };
                    const workshopVideos = coursesWithVideos.get(workshop) || [];
                    const isExpanded = expandedCourse === workshop;
                    const percentComplete = progress.completedVideos.length > 0 && workshopVideos.length > 0
                      ? Math.round((progress.completedVideos.length / workshopVideos.length) * 100)
                      : 0;

                    return (
                      <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                          <h3 className="text-lg font-bold">{workshop}</h3>
                          <p className="text-blue-100 text-sm mt-2">Niklaus Solutions | {workshop}</p>
                          {workshopVideos.length > 0 && <p className="text-blue-100 text-xs mt-3">📹 {workshopVideos.length} lessons</p>}
                        </div>

                        <div className="p-6">
                          <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">Progress</span>
                              <span className="text-lg font-bold">{progress.completedVideos.length}/{workshopVideos.length}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full" style={{ width: `${percentComplete}%` }}></div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{percentComplete}% Complete</p>
                          </div>

                          {workshopVideos.length > 0 && (
                            <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                              <button
                                onClick={() => setExpandedCourse(isExpanded ? null : workshop)}
                                className="w-full flex items-center justify-between text-left font-semibold text-gray-900"
                              >
                                <span>📚 Lessons ({workshopVideos.length})</span>
                                <ChevronDown size={20} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>

                              {isExpanded && (
                                <div className="mt-4 space-y-2">
                                  {workshopVideos.map((video, vidIndex) => (
                                    <button
                                      key={video.id}
                                      onClick={() => {
                                        setSelectedCourseVideo({ course: workshop, video });
                                        recordVideoCompletion(video.id, workshop);
                                      }}
                                      className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                                        progress.completedVideos.includes(video.id)
                                          ? 'bg-green-50 border-green-400'
                                          : 'bg-white border-blue-200 hover:bg-blue-100'
                                      }`}
                                    >
                                      <div className="flex items-start gap-3">
                                        <span className="text-sm font-bold text-blue-600">{vidIndex + 1}.</span>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-900">{video.title}</p>
                                          {video.duration && <p className="text-xs text-gray-600">⏱️ {video.duration} min</p>}
                                        </div>
                                        <span className="text-blue-600 text-sm">▶</span>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex gap-3">
                            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg">
                              Continue Learning
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No courses enrolled yet</p>
                </div>
              )}

              {selectedCourseVideo && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[60] flex items-center justify-center p-0 md:p-8 animate-in fade-in duration-300">
                  <div className="bg-[#0f172a] md:rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] max-w-6xl w-full max-h-[100vh] md:max-h-[95vh] overflow-y-auto border border-blue-900/30 flex flex-col relative">
                    
                    {/* Floating Close Button for Mobile/Premium Feel */}
                    <button 
                      onClick={() => setSelectedCourseVideo(null)} 
                      className="absolute top-4 right-4 z-[70] bg-white/10 hover:bg-white/20 p-2 rounded-full border border-white/20 text-white backdrop-blur-md transition-all group"
                    >
                      <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>

                    <div className="p-6 md:p-8 border-b border-blue-900/30 flex flex-col md:flex-row md:justify-between md:items-center bg-[#1e293b]/50 backdrop-blur-md gap-4">
                      <div className="pr-12 md:pr-0">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-blue-400/20">
                             Now Streaming
                           </span>
                           <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                        </div>
                        <h2 className="text-xl md:text-3xl font-black text-white tracking-tight leading-tight">{selectedCourseVideo.video.title}</h2>
                        <div className="flex items-center gap-3 mt-2 text-gray-400">
                          <p className="text-xs md:text-sm font-medium flex items-center gap-1.5"><BookOpen size={14} className="text-blue-500" /> {selectedCourseVideo.course}</p>
                          <span className="h-1 w-1 bg-gray-600 rounded-full" />
                          <p className="text-xs md:text-sm font-medium flex items-center gap-1.5"><Play size={14} className="text-blue-500" /> Lesson {selectedCourseVideo.video.order + 1}</p>
                        </div>
                      </div>
                      
                      <div className="hidden md:flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">Student ID Verified</p>
                          <ShieldCheck size={14} className="text-green-500" />
                        </div>
                        <p className="text-xs font-mono text-blue-400/70">{student?.email}</p>
                      </div>
                    </div>

                    <div className="flex-1 bg-black flex items-center justify-center p-0 md:p-4">
                      <div className="w-full max-w-5xl">
                        <SecureVideoPlayer
                          videoUrl={selectedCourseVideo.video.videoUrl}
                          videoTitle={selectedCourseVideo.video.title}
                          courseName={selectedCourseVideo.course}
                          userEmail={student?.email || 'student@niklaussolutions.com'}
                          lessonNumber={selectedCourseVideo.video.order + 1}
                          totalLessons={coursesWithVideos.get(selectedCourseVideo.course)?.length || 0}
                        />
                      </div>
                    </div>

                    <div className="p-6 md:p-8 bg-[#0f172a] border-t border-blue-900/30">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                           <div className="flex items-center gap-3 mb-4">
                             <div className="h-8 w-1 bg-blue-600 rounded-full" />
                             <h3 className="font-black text-white uppercase tracking-widest text-sm">Course Overview</h3>
                           </div>
                           <p className="text-gray-400 text-sm md:text-base leading-relaxed font-medium">{selectedCourseVideo.video.description}</p>
                        </div>
                        
                        <div className="bg-[#1e293b]/40 rounded-2xl p-6 border border-blue-900/20 backdrop-blur-sm self-start">
                          <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">Content Metadata</h4>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-blue-900/10">
                              <span className="text-xs text-gray-500 font-medium">Video Duration</span>
                              <span className="text-sm text-gray-200 font-bold">{selectedCourseVideo.video.duration || 'N/A'} mins</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-blue-900/10">
                              <span className="text-xs text-gray-500 font-medium">Status</span>
                              <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20 font-black uppercase">Active</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500 font-medium">Security Level</span>
                              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-black uppercase">AES-256</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-blue-900/10 flex justify-between items-center text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                        <span>Niklaus Solutions Digital Rights Management © 2026</span>
                        <span>Stream Node: 192.168.1.1</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activePage === 'wishlist' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800">Wishlist ({wishlist.length})</h2>
              </div>

              {wishlist.length > 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <p className="text-gray-700">You have {wishlist.length} items in your wishlist.</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-20 text-center">
                  <Heart size={64} className="mx-auto text-gray-300 mb-6" />
                  <h3 className="text-2xl font-bold text-gray-600 mb-2">Your wishlist is empty</h3>
                  <p className="text-gray-500 text-lg">Add courses to get started</p>
                </div>
              )}
            </div>
          )}

          {activePage === 'quiz' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800">Quiz Attempts ({quizAttempts.length})</h2>
              </div>

              {quizAttempts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {quizAttempts.map((attempt) => (
                    <div key={attempt.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">Quiz Attempt</h3>
                          <p className="text-gray-600 text-sm mt-1">{new Date(attempt.attemptedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-blue-600">{attempt.score}%</p>
                          <p className="text-sm text-gray-600">{attempt.totalQuestions} questions</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-20 text-center">
                  <HelpCircle size={64} className="mx-auto text-gray-300 mb-6" />
                  <h3 className="text-2xl font-bold text-gray-600 mb-2">No quiz attempts</h3>
                  <p className="text-gray-500 text-lg">Start taking quizzes to track progress</p>
                </div>
              )}
            </div>
          )}

          {activePage === 'orders' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800">Order History ({orders.length})</h2>
              </div>

              {orders.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{order.workshopTitle}</h3>
                          <p className="text-gray-600 text-sm">{new Date(order.registrationDate).toLocaleDateString()}</p>
                        </div>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">{order.status}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t">
                        <p className="text-gray-600">Amount Paid</p>
                        <p className="text-xl font-bold text-blue-600">₹{order.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-20 text-center">
                  <ShoppingCart size={64} className="mx-auto text-gray-300 mb-6" />
                  <h3 className="text-2xl font-bold text-gray-600 mb-2">No purchases</h3>
                  <p className="text-gray-500 text-lg">Your orders will appear here</p>
                </div>
              )}
            </div>
          )}

          {activePage === 'qa' && (
            <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              {/* Chat Header */}
              <div className="p-4 border-b bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 border-none m-0 p-0 text-lg">Niklaus Support Chat</h2>
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Instructor Online
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <MessageSquare size={48} className="mb-4 opacity-10" />
                    <p className="text-sm">Ask any question to get started!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm ${
                          msg.sender === 'student'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${msg.sender === 'student' ? 'text-blue-100' : 'text-gray-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your question..."
                    className="flex-1 px-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-3 rounded-xl transition shadow-lg shadow-blue-200"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {activePage === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Security</h3>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                  >
                    <Lock size={18} /> Change Password
                  </button>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Management</h3>
                  <button
                    onClick={handleLogoutAllDevices}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                  >
                    Logout from All Devices
                  </button>
                  <p className="text-sm text-gray-600 mt-2">This will end all active sessions</p>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                      <div>
                        <p className="font-medium text-gray-700">Course Updates</p>
                        <p className="text-sm text-gray-600">New content & announcements</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                      <div>
                        <p className="font-medium text-gray-700">Question Replies</p>
                        <p className="text-sm text-gray-600">Instructor responses</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Change Password</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

            <div className="flex gap-3">
              <button
                onClick={handleChangePassword}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Change Password
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
