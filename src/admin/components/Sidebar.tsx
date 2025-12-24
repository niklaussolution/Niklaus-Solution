import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { admin } = useAuth();

  const isSuperAdmin = admin?.role === 'super_admin';

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/workshops', label: 'Workshops', icon: '🎓' },
    { path: '/admin/pricing', label: 'Pricing Plans', icon: '💰' },
    { path: '/admin/registrations', label: 'Registrations', icon: '📋' },
    { path: '/admin/trainers', label: 'Trainers', icon: '👨‍🏫' },
    { path: '/admin/testimonials', label: 'Testimonials', icon: '⭐' },
    { path: '/admin/content', label: 'Content Management', icon: '📝' },
    { path: '/admin/videos', label: 'Video Management', icon: '🎥' },
    { path: '/admin/users', label: 'User Management', icon: '👥' },
    { path: '/admin/admins', label: 'Admin Users', icon: '🔐', visible: isSuperAdmin },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️', visible: isSuperAdmin },
  ];

  return (
    <aside className="bg-gray-800 text-white w-64 h-full overflow-y-auto flex flex-col">
      <div className="mb-8 p-4 flex-shrink-0">
        <h2 className="text-xl font-bold">Workshop Admin</h2>
      </div>
      <ul className="space-y-2 px-4 flex-1">
        {menuItems.map((item) => {
          if (item.visible === false) return null;
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded transition ${
                  isActive
                    ? 'bg-blue-600'
                    : 'hover:bg-gray-700'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
