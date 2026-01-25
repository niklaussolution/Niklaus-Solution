import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const LoginPage: React.FC = () => {
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to admin panel if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/workshops', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  
  // Handle login
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    // Validation
    if (!loginEmail.trim()) {
      setLoginError('Email is required');
      setLoginLoading(false);
      return;
    }
    if (!loginPassword.trim()) {
      setLoginError('Password is required');
      setLoginLoading(false);
      return;
    }

    try {
      const result = await api.login({ email: loginEmail, password: loginPassword });
      
      if (result.error) {
        // Provide user-friendly error messages
        const errorMessage = result.error.toLowerCase();
        if (errorMessage.includes('user-not-found') || errorMessage.includes('not found')) {
          setLoginError('Email not found. Please check your email or contact admin.');
        } else if (errorMessage.includes('wrong-password') || errorMessage.includes('invalid-password')) {
          setLoginError('Incorrect password. Please try again.');
        } else if (errorMessage.includes('invalid-email') || errorMessage.includes('invalid')) {
          setLoginError('Invalid email format. Please check your email.');
        } else if (errorMessage.includes('too-many-requests')) {
          setLoginError('Too many login attempts. Please try again later.');
        } else if (errorMessage.includes('user-disabled')) {
          setLoginError('Your account has been disabled. Please contact support.');
        } else if (errorMessage.includes('firebase') || errorMessage.includes('400')) {
          setLoginError('Firebase configuration error. Please contact admin.');
          console.error('Firebase error details:', result.error);
        } else {
          setLoginError(result.error || 'Login failed. Please try again.');
        }
      } else if (result.token && result.admin) {
        login(result.token, result.admin);
        navigate('/admin/workshops', { replace: true });
      } else {
        setLoginError('Login failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError('Network error. Please check your connection and try again.');
    } finally {
      setLoginLoading(false);
    }
  }, [loginEmail, loginPassword, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-600 text-sm mt-2">Sign in to your admin account</p>
        </div>

        {/* LOGIN FORM */}
        <div className="space-y-4">
          {loginError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 text-sm"
            >
              {loginLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-gray-600 text-xs mt-4">
            Using Firebase Authentication
          </p>
        </div>
      </div>
    </div>
  );
};
