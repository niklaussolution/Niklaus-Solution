import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { useStudent } from '../context/StudentContext';
import { Navbar } from '../components/Navbar';

export const StudentLogin = () => {
  const navigate = useNavigate();
  const { setStudentInfo } = useStudent();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if user is already "waiting for approval" from a previous session
      const existingRequestId = localStorage.getItem('loginRequestId');
      const isApproved = localStorage.getItem('isApproved') === 'true';
      
      if (existingRequestId && !isApproved) {
        console.log('Found existing pending login request');
        navigate('/student/waiting-approval', { replace: true });
        return;
      }

      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get student data from Firestore
      const studentDoc = await getDoc(doc(db, 'students', user.uid));
      
      if (!studentDoc.exists()) {
        setError('Student account not found');
        setLoading(false);
        return;
      }

      const studentData = studentDoc.data();
      const token = await user.getIdToken();

      // Check if student was manually registered by admin (skip approval)
      if (studentData.manuallyRegistered === true) {
        // Manually registered students don't need admin approval
        console.log('Student is manually registered, skipping approval process');
        setStudentInfo(user.uid, studentData.name, token);
        navigate('/student/dashboard', { replace: true });
      } else {
        // Regular sign-up students need admin approval
        // Fetch IP and device info
        let ipAddress = 'Unknown';
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          const ipResponse = await fetch('https://api.ipify.org?format=json', {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          const ipData = await ipResponse.json();
          ipAddress = ipData.ip;
        } catch (e) {
          console.warn('IP fetch failed, continuing login...');
        }

        const ua = navigator.userAgent; // User agent string
        
        // Extensive device details
        const getBrowser = () => {
          if (ua.includes('Firefox')) return 'Firefox'; // Added Firefox check
          if (ua.includes('Safari')) return 'Safari';
          if (ua.includes('Edge')) return 'Edge';
          if (ua.includes('Chrome')) return 'Chrome'; // Added Chrome check
          return 'Other';
        };

        const getOS = () => {
          if (ua.includes('Windows')) return 'Windows'; // Added Windows check
          if (ua.includes('Mac')) return 'MacOS';
          if (ua.includes('Android')) return 'Android';
          if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
          if (ua.includes('Linux')) return 'Linux';
          return 'Unknown';
        };
        const platform = navigator.platform || 'Unknown Platform';
        const deviceName = `${platform} - ${getBrowser()} on ${getOS()}`;

        // Create or update existing login request (Unique per student)
        // Using studentId as the document ID ensures only one document per student
        const requestRef = doc(db, 'loginRequests', user.uid);
        await setDoc(requestRef, {
          studentId: user.uid,
          studentName: studentData.name,
          studentEmail: email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          approved: false,
          rejected: false,
          token: token,
          ipAddress,
          deviceName,
          browser: getBrowser(),
          os: getOS(),
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          lastLoginTime: serverTimestamp(),
          status: 'pending'
        }, { merge: true });

        // Store request ID and student info
        localStorage.setItem('loginRequestId', user.uid);
        localStorage.setItem('studentId', user.uid);
        localStorage.setItem('studentName', studentData.name);

        console.log('Login request created/updated, waiting for approval');
        navigate('/student/waiting-approval', { replace: true });
      }
    } catch (err: any) { // This catch block handles Firebase Auth errors, not the AuthContext error
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-email' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many login attempts. Please try again later');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Student Login</h2>
            <p className="text-gray-600 text-center mb-6">Access your dashboard and track your progress</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="your@email.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition duration-200"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/student/signup')}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
