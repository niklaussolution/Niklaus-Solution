import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface SettingData {
  [key: string]: any;
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export const Settings: React.FC = () => {
  const { token } = useAuth();
  const [settings, setSettings] = useState<SettingData>({});
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      setSettings(data || {});
    } catch (error) {
      console.error('Error fetching settings:', error);
      addToast('Error loading settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      addToast('Authentication required', 'error');
      return;
    }

    try {
      const result = await api.updateSettings(settings);
      if (result.error) {
        addToast(`Error: ${result.error}`, 'error');
      } else {
        addToast('Settings updated successfully!', 'success');
      }
    } catch (error: any) {
      console.error('Error updating settings:', error);
      addToast(`Error updating settings: ${error.message}`, 'error');
    }
  };

  if (loading) return <AdminLayout><p>Loading...</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-3 sm:p-6">
        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-fade-in ${
                toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>{toast.message}</span>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="ml-2 hover:opacity-75"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <h1 className="text-4xl font-bold mb-6 text-gray-800">Settings</h1>

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

              {/* WhatsApp Settings Section */}
              <div className="md:col-span-2 border-t pt-6 mt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">WhatsApp Button Settings</h3>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">WhatsApp Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={settings.whatsapp_phone || ''}
                  onChange={(e) => handleChange('whatsapp_phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="919999999999"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Enter phone number with country code (e.g., 919999999999 for India)</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-bold mb-2">WhatsApp Message <span className="text-red-500">*</span></label>
                <textarea
                  value={settings.whatsapp_message || ''}
                  onChange={(e) => handleChange('whatsapp_message', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  rows={3}
                  placeholder="Hi! I'm interested in learning more about your workshops."
                  required
                />
                <p className="text-sm text-gray-500 mt-1">This message will be pre-filled when users click the WhatsApp button</p>
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
