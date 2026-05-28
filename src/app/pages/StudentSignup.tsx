import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { Navbar } from '../components/Navbar';

export const StudentSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Capture device details
      let ipAddress = 'Unknown';
      try {
        // Faster, non-blocking IP fetch
        const response = await fetch('https://api.ipify.org?format=json').catch(() => null);
        if (response && response.ok) {
          const data = await response.json();
          ipAddress = data.ip || 'Unknown';
        }
      } catch (e) {
        console.warn('IP fetch timed out or failed, continuing signup...');
      }

      const ua = navigator.userAgent;
      const getBrowser = () => {
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Other';
      };

      const getOS = () => {
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac')) return 'MacOS';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
        if (ua.includes('Linux')) return 'Linux';
        return 'Unknown';
      };

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
      console.log('Step 1: Firebase Auth user created:', user.uid);

      // Store ID and info immediately after account creation
      localStorage.setItem('loginRequestId', user.uid);
      localStorage.setItem('studentId', user.uid);
      localStorage.setItem('studentName', formData.name);
      console.log('Step 2: Local storage identifiers set');

      // Store student data in Firestore
      const studentData = {
        firebaseUid: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        enrolledWorkshops: [],
        certificates: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'students', user.uid), studentData);
      console.log('Step 3: Student profile written to Firestore');

      // Step 2: Create a login request to capture detailed info for the admin panel (after student doc is created)
      const token = await user.getIdToken();
      const platform = navigator.platform || 'Unknown Platform';
      const deviceName = `${platform} - ${getBrowser()} on ${getOS()}`; // More descriptive and robust

      const requestRef = doc(db, 'loginRequests', user.uid);
      await setDoc(requestRef, {
        studentId: user.uid,
        studentName: formData.name,
        studentEmail: formData.email,
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

      // Clear any previous errors and redirect to waiting screen immediately
      setError('');
      navigate('/student/waiting-approval', { replace: true });
    } catch (err: any) {
      console.error('Signup Error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already registered');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError(err.message || 'Signup failed');
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Student Sign Up</h2>
            <p className="text-gray-600 text-center mb-6">Create your account to get started</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="your@email.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Your phone number"
                  autoComplete="tel"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition duration-200"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/student/login')}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Login here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
