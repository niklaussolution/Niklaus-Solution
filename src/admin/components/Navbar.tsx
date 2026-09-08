import React, { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick, sidebarOpen = false }) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [liveViewers, setLiveViewers] = useState<number | null>(null);

  useEffect(() => {
    const adminKey = import.meta.env.VITE_VPS_ADMIN_KEY;
    if (!adminKey) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch('https://videos.theniklaus.com/admin/active-viewers', {
          headers: { 'X-Admin-Key': adminKey },
        });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setLiveViewers(data.count);
        }
      } catch {
        // ignore transient network errors, keep showing the last known count
      }
    };

    poll();
    const interval = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 shadow-lg p-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {/* Hamburger Menu for Mobile */}
        <button
          onClick={onMenuClick}
          className="md:hidden flex flex-col gap-1.5 focus:outline-none p-2 hover:bg-gray-800 rounded-lg transition-colors"
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={sidebarOpen}
        >
          <span
            className={`w-6 h-0.5 bg-white transition-all duration-300 transform ${
              sidebarOpen ? 'rotate-45 translate-y-2.5' : ''
            }`}
          />
          <span
            className={`w-6 h-0.5 bg-white transition-all duration-300 ${
              sidebarOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`w-6 h-0.5 bg-white transition-all duration-300 transform ${
              sidebarOpen ? '-rotate-45 -translate-y-2.5' : ''
            }`}
          />
        </button>

        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-white hidden sm:block">Admin Dashboard</h1>
          <h1 className="text-lg font-bold text-white sm:hidden">Admin</h1>
          <p className="text-xs sm:text-sm text-gray-300">{admin?.username} • {admin?.role.replace('_', ' ').toUpperCase()}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {liveViewers !== null && (
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 rounded-lg"
            title="Students currently watching a video"
          >
            <Radio size={14} className={liveViewers > 0 ? 'text-green-400 animate-pulse' : 'text-gray-500'} />
            <span className="text-sm text-gray-200">{liveViewers} watching now</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold shadow-md hover:shadow-lg"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};
