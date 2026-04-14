import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface StudentContextType {
  studentId: string | null;
  studentName: string | null;
  token: string | null;
  isAuthenticated: boolean;
  logout: () => void;
  setStudentInfo: (id: string, name: string, token: string) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored credentials on mount
    const storedId = localStorage.getItem('studentId');
    const storedName = localStorage.getItem('studentName');
    const storedToken = localStorage.getItem('studentToken');
    const isApproved = localStorage.getItem('isApproved') === 'true';

    if (storedId && storedName && storedToken && isApproved) {
      setStudentId(storedId);
      setStudentName(storedName);
      setToken(storedToken);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentName');
    localStorage.removeItem('studentToken');
    localStorage.removeItem('isApproved');
    localStorage.removeItem('loginRequestId');
    setStudentId(null);
    setStudentName(null);
    setToken(null);
  };

  const setStudentInfo = (id: string, name: string, newToken: string) => {
    setStudentId(id);
    setStudentName(name);
    setToken(newToken);
    localStorage.setItem('studentId', id);
    localStorage.setItem('studentName', name);
    localStorage.setItem('studentToken', newToken);
    localStorage.setItem('isApproved', 'true');
  };

  const value: StudentContextType = {
    studentId,
    studentName,
    token,
    isAuthenticated: !!token,
    logout,
    setStudentInfo,
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within StudentProvider');
  }
  return context;
};
