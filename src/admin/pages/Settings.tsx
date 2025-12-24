import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface SettingData {
  [key: string]: any;
}

export const Settings: React.FC = () => {
  const { token } = useAuth();
  const [settings, setSettings] = useState<SettingData>({});
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      setSettings(data || {});
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
    setUpdated(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      await api.updateSettings(settings, token);
      setUpdated(true);
      setTimeout(() => setUpdated(false), 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  if (loading) return <AdminLayout><p>Loading...</p></AdminLayout>;

  return (
    <AdminLayout>
      <div>
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Settings</h1>

        {updated && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            Settings updated successfully!
          </div>
        )}

        <div className="bg-white p-6 rounded shadow">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">Site Title</label>
                <input
                  type="text"
                  value={settings.site_title || ''}
                  onChange={(e) => handleChange('site_title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="Workshop Landing Page"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">Site Description</label>
                <input
                  type="text"
                  value={settings.site_description || ''}
                  onChange={(e) => handleChange('site_description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="Site description"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">Contact Email</label>
                <input
                  type="email"
                  value={settings.contact_email || ''}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="contact@example.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">Contact Phone</label>
                <input
                  type="tel"
                  value={settings.contact_phone || ''}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-bold mb-2">Address</label>
                <textarea
                  value={settings.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  rows={4}
                  placeholder="Company address"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">Primary Color</label>
                <input
                  type="color"
                  value={settings.primary_color || '#3B82F6'}
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 h-10"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">Secondary Color</label>
                <input
                  type="color"
                  value={settings.secondary_color || '#10B981'}
                  onChange={(e) => handleChange('secondary_color', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 h-10"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-bold mb-2">Social Links (JSON)</label>
                <textarea
                  value={JSON.stringify(settings.social_links || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      handleChange('social_links', JSON.parse(e.target.value));
                    } catch (err) {
                      // Invalid JSON, don't update
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 font-mono text-sm"
                  rows={6}
                  placeholder='{\n  "facebook": "https://facebook.com",\n  "twitter": "https://twitter.com"\n}'
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Save Settings
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};
