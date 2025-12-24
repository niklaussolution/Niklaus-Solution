import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { admin } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVideos: 0,
    totalAdmins: 0,
  });

  useEffect(() => {
    // Placeholder stats - will be populated from API
    setStats({
      totalUsers: 0,
      totalVideos: 0,
      totalAdmins: 0,
    });
  }, []);

  return (
    <AdminLayout>
      <div>
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-gray-500 text-sm font-bold uppercase mb-2">Total Users</h3>
            <p className="text-4xl font-bold text-blue-600">{stats.totalUsers}</p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-gray-500 text-sm font-bold uppercase mb-2">Total Videos</h3>
            <p className="text-4xl font-bold text-green-600">{stats.totalVideos}</p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-gray-500 text-sm font-bold uppercase mb-2">Admin Users</h3>
            <p className="text-4xl font-bold text-purple-600">{stats.totalAdmins}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Welcome, {admin?.username}!</h2>
          <p className="text-gray-600">
            Use the sidebar navigation to manage your website content. You have {admin?.role === 'super_admin' ? 'full' : 'limited'} access.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};
