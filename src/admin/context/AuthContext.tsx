import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

// Define allowed roles for admin panel access
const ALLOWED_ADMIN_ROLES = ['super_admin', 'editor'];

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
        // Verify this user is in the admins collection with a valid role
        try {
          const adminsRef = collection(db, 'admins');
          const q = query(adminsRef, where('email', '==', user.email));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const adminData = querySnapshot.docs[0].data();
            const userRole = adminData.role?.trim();
            
            if (userRole && ALLOWED_ADMIN_ROLES.includes(userRole)) {
              const idToken = await user.getIdToken();
              setToken(idToken);
              // Update admin data from Firestore
              setAdmin({
                id: user.uid,
                username: adminData.username,
                email: adminData.email,
                role: userRole,
              });
              localStorage.setItem('admin', JSON.stringify({
                id: user.uid,
                username: adminData.username,
                email: adminData.email,
                role: userRole,
              }));
            } else {
              // User doesn't have valid role - sign them out
              await signOut(auth);
              setToken(null);
              setAdmin(null);
              localStorage.removeItem('admin');
            }
          } else {
            // User not in admins collection - sign them out
            await signOut(auth);
            setToken(null);
            setAdmin(null);
            localStorage.removeItem('admin');
          }
        } catch (error) {
          console.error('Error verifying admin:', error);
          await signOut(auth);
          setToken(null);
          setAdmin(null);
          localStorage.removeItem('admin');
        }
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
