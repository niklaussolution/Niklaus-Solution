import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useStudent } from '../context/StudentContext';
import { Navbar } from '../components/Navbar';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

export const WaitingForApproval = () => {
  const navigate = useNavigate();
  const { setStudentInfo } = useStudent();
  const [status, setStatus] = useState<'waiting' | 'approved' | 'rejected' | 'loading'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loginRequestId = localStorage.getItem('loginRequestId');
    const studentId = localStorage.getItem('studentId');

    if (!loginRequestId || !studentId) {
      navigate('/student/login');
      return;
    }

    // Listen to login request changes in real-time
    const unsubscribe = onSnapshot(
      doc(db, 'loginRequests', loginRequestId),
      (docSnapshot) => {
        if (!docSnapshot.exists()) {
          // If the request was deleted (e.g. by admin to clear old requests), check if we're already approved
          const isApproved = localStorage.getItem('isApproved') === 'true';
          const storedToken = localStorage.getItem('studentToken');
          if (isApproved && storedToken) {
            navigate('/student/dashboard', { replace: true });
            return;
          }
          
          setStatus('rejected');
          setMessage('Login request not found. Please try again.');
          return;
        }

        const data = docSnapshot.data();

        if (data.approved === true) {
          // Login approved - set context and redirect
          const studentId = localStorage.getItem('studentId');
          const studentName = data.studentName;
          const token = data.token;
          
          // Update StudentContext with approved credentials
          if (studentId && studentName && token) {
            setStudentInfo(studentId, studentName, token);
          }
          
          setStatus('approved');
          setMessage('Login approved! Redirecting to dashboard...');
          
          setTimeout(() => {
            navigate('/student/dashboard', { replace: true });
          }, 1500);
        } else if (data.approved === false && data.rejected === true) {
          // Login rejected
          setStatus('rejected');
          setMessage('Your login request was rejected. Please try again.');
        } else {
          // Still waiting
          setStatus('waiting');
          setMessage('Your login is pending admin approval...');
        }
      },
      (error) => {
        console.error('Error listening to login request:', error);
        setStatus('rejected');
        setMessage('Error checking login status. Please try again.');
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  const handleGoBack = () => {
    localStorage.removeItem('loginRequestId');
    navigate('/student/login');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 text-center">
            {status === 'loading' && (
              <>
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Checking Status...</h2>
              </>
            )}

            {status === 'waiting' && (
              <>
                <div className="flex justify-center mb-4">
                  <Clock size={48} className="text-blue-600 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Waiting for Approval</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <p className="text-sm text-gray-500 mb-6">
                  An admin will review your login request shortly. Please wait...
                </p>
                <button
                  onClick={handleGoBack}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                >
                  Cancel and go back to login
                </button>
              </>
            )}

            {status === 'approved' && (
              <>
                <div className="flex justify-center mb-4">
                  <CheckCircle size={48} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-4">Approved!</h2>
                <p className="text-gray-600 mb-6">{message}</p>
              </>
            )}

            {status === 'rejected' && (
              <>
                <div className="flex justify-center mb-4">
                  <AlertCircle size={48} className="text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-red-600 mb-4">Login Rejected</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <button
                  onClick={handleGoBack}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
