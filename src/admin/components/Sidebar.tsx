import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobile = false, isOpen = true, onClose }) => {
  const location = useLocation();
  const { admin } = useAuth();

  const isSuperAdmin = admin?.role === 'super_admin';

  const menuItems = [
    { path: '/admin/login-requests', label: 'Login Requests', icon: '🔓' },
    { path: '/admin/workshops', label: 'Workshops', icon: '🎓' },
    { path: '/admin/courses', label: 'Courses', icon: '📚' },
    { path: '/admin/course-videos', label: 'Workshop Videos', icon: '📹' },
    { path: '/admin/courses-videos', label: 'Course Videos', icon: '🎬' },
    { path: '/admin/pricing', label: 'Pricing Plans', icon: '💰' },
    { path: '/admin/registrations', label: 'Workshop Registrations', icon: '📋' },
    { path: '/admin/course-enrollments', label: 'Course Enrollments', icon: '✍️' },
    { path: '/admin/certificates', label: 'Certificates', icon: '🏆' },
    { path: '/admin/files', label: 'File Sharing', icon: '📤' },
    { path: '/admin/links', label: 'URL Masking', icon: '🔗' },
    { path: '/admin/trainers', label: 'Trainers', icon: '👨‍🏫' },
    { path: '/admin/testimonials', label: 'Testimonials', icon: '⭐' },
    { path: '/admin/hackathon-winners', label: 'Hackathon Winners', icon: '🏅' },
    { path: '/admin/student-projects', label: 'Student Projects', icon: '🎨' },
    { path: '/admin/content', label: 'Content Management', icon: '📝' },
    { path: '/admin/journeys', label: 'Learner Journeys', icon: '🚀' },
    { path: '/admin/videos', label: 'Video Management', icon: '🎥' },
    { path: '/admin/qa', label: 'Support Chat', icon: '💬' },
    { path: '/admin/contact-submissions', label: 'Contact Submissions', icon: '📩' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
    { path: '/admin/admins', label: 'Admin Users', icon: '🔐', visible: isSuperAdmin },
  ];

  const handleMenuItemClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside className="bg-gray-800 text-white w-64 h-full overflow-y-auto flex flex-col">
      <div className="mb-8 p-4 flex-shrink-0 flex justify-between items-center">
        <h2 className="text-xl font-bold">Niklaus Solutions Admin</h2>
        {isMobile && (
          <button
            onClick={onClose}
            className="md:hidden text-white text-xl font-bold"
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>
      <ul className="space-y-2 px-4 flex-1">
        {menuItems.map((item) => {
          if (item.visible === false) return null;
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={handleMenuItemClick}
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
