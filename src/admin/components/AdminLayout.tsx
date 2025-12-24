import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      {/* Sidebar with independent scroll */}
      <div className="flex-shrink-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>
      
      {/* Right side container with independent scroll */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-6 bg-transparent">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
