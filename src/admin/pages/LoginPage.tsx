import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const LoginPage: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'login' | 'signup'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Signup form state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  
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
          setLoginError('Email not found. Please check your email or sign up.');
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

  // Handle signup
  const handleSignup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    // Validation
    if (!signupUsername.trim()) {
      setSignupError('Username is required');
      return;
    }
    if (!signupEmail.trim()) {
      setSignupError('Email is required');
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }

    setSignupLoading(true);

    try {
      const result = await api.register({
        username: signupUsername,
        email: signupEmail,
        password: signupPassword,
        role: 'editor',
      });

      if (result.error) {
        setSignupError(result.error);
      } else if (result.token && result.admin) {
        login(result.token, result.admin);
      } else {
        setSignupError('Failed to create account');
      }
    } catch (err) {
      setSignupError('An error occurred. Please try again.');
    } finally {
      setSignupLoading(false);
    }
  }, [signupUsername, signupEmail, signupPassword, signupConfirmPassword, login]);

  // Switch to signup
  const switchToSignup = useCallback(() => {
    setActiveMode('signup');
    setLoginError('');
    setLoginEmail('');
    setLoginPassword('');
  }, []);

  // Switch to login
  const switchToLogin = useCallback(() => {
    setActiveMode('login');
    setSignupError('');
    setSignupUsername('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirmPassword('');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {activeMode === 'login' ? 'Admin Login' : 'Create Account'}
          </h1>
          <p className="text-gray-600 text-sm mt-2">
            {activeMode === 'login' ? 'Sign in to your admin account' : 'Create a new admin account'}
          </p>
        </div>

        {/* ===== LOGIN FORM ===== */}
        {activeMode === 'login' && (
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

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-gray-500 text-xs">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <button
              type="button"
              onClick={switchToSignup}
              className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition text-sm"
            >
              Create Admin Account
            </button>

            <p className="text-center text-gray-600 text-xs mt-4">
              Using Firebase Authentication
            </p>
          </div>
        )}

        {/* ===== SIGNUP FORM ===== */}
        {activeMode === 'signup' && (
          <div className="space-y-4">
            {signupError && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {signupError}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Username</label>
                <input
                  type="text"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Email</label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Password</label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  placeholder="Minimum 6 characters"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters required</p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Confirm Password</label>
                <input
                  type="password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={signupLoading}
                className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 text-sm"
              >
                {signupLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-gray-500 text-xs">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <button
              type="button"
              onClick={switchToLogin}
              className="w-full bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 transition text-sm"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
