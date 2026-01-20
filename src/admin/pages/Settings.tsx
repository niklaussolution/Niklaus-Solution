import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CheckCircle, AlertCircle, X, RefreshCw } from 'lucide-react';

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
  const [submitting, setSubmitting] = useState(false);
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
      console.log('Fetched settings:', data);
      // Set default values if settings are empty
      const settingsData = data && Object.keys(data).length > 0 ? data : {
        whatsapp_phone: '',
        whatsapp_message: 'Hi! I\'m interested in learning more about your workshops.'
      };
      setSettings(settingsData);
    } catch (error) {
      console.error('Error fetching settings:', error);
      addToast('Error loading settings', 'error');
      // Set empty defaults on error
      setSettings({
        whatsapp_phone: '',
        whatsapp_message: ''
      });
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

    setSubmitting(true);
    try {
      console.log('Submitting settings:', settings);
      const result = await api.updateSettings(settings);
      console.log('Settings update response:', result);
      if (result.error) {
        addToast(`Error: ${result.error}`, 'error');
      } else {
        addToast('Settings updated successfully!', 'success');
        // Refresh settings to confirm they were saved
        await fetchSettings();
      }
    } catch (error: any) {
      console.error('Error updating settings:', error);
      addToast(`Error updating settings: ${error.message}`, 'error');
    } finally {
      setSubmitting(false);
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

        <div className="flex gap-3 mb-6">
          <button
            onClick={fetchSettings}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              {/* WhatsApp Settings Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">WhatsApp Button Settings</h3>
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

              <div>
                <label className="block text-gray-700 font-bold mb-2">WhatsApp Message <span className="text-red-500">*</span></label>
                <textarea
                  value={settings.whatsapp_message || ''}
                  onChange={(e) => handleChange('whatsapp_message', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  rows={4}
                  placeholder="Hi! I'm interested in learning more about your workshops."
                  required
                />
                <p className="text-sm text-gray-500 mt-1">This message will be pre-filled when users click the WhatsApp button</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};
