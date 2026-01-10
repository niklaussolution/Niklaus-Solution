import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      {/* Sidebar with independent scroll - Hidden on mobile, visible on larger screens */}
      <div className="hidden md:flex flex-shrink-0 h-screen overflow-y-auto">
        <Sidebar isMobile={false} isOpen={true} />
      </div>

      {/* Mobile Sidebar - No overlay */}
      <div
        className={`fixed left-0 top-0 h-screen overflow-y-auto transition-transform duration-300 ease-in-out z-40 md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar isMobile={true} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Right side container with independent scroll */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-3 sm:p-4 md:p-6 bg-transparent">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
