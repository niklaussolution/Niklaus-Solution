import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

// Define allowed roles for admin panel access
const ALLOWED_ADMIN_ROLES = ['super_admin', 'editor', 'creator'];

interface Admin {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  login: (token: string, admin: Admin) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('admin');
    if (savedAdmin) {
      const parsedAdmin = JSON.parse(savedAdmin);
      // Validate that the saved admin has an allowed role
      if (parsedAdmin.role && ALLOWED_ADMIN_ROLES.includes(parsedAdmin.role)) {
        setAdmin(parsedAdmin);
      } else {
        // Clear invalid admin data
        localStorage.removeItem('admin');
      }
    }

    // Listen to Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        setToken(idToken);
      } else {
        setToken(null);
        setAdmin(null);
        localStorage.removeItem('admin');
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (newToken: string, newAdmin: Admin) => {
    // Validate role before allowing login
    if (!newAdmin.role || !ALLOWED_ADMIN_ROLES.includes(newAdmin.role)) {
      console.error('Invalid role for admin access');
      return;
    }
    setToken(newToken);
    setAdmin(newAdmin);
    localStorage.setItem('admin', JSON.stringify(newAdmin));
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setToken(null);
      setAdmin(null);
      localStorage.removeItem('admin');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      admin,
      token,
      login,
      logout,
      isAuthenticated: !!token && !!admin && ALLOWED_ADMIN_ROLES.includes(admin.role),
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
