import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { db, functions } from '../config/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

const LEADS_COLLECTION = 'Google Ads Registration';

interface Lead {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  formLocation?: string;
  source?: string;
  status?: string;
  paid?: boolean;
  paymentStatus?: string;
  createdAt?: { seconds: number } | number | string;
  utm?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    gclid?: string;
  };
}

function isMarkedPaid(lead: Lead): boolean {
  return (
    lead.paid === true ||
    lead.paymentStatus?.toLowerCase() === 'completed' ||
    lead.paymentStatus?.toLowerCase() === 'paid' ||
    lead.status?.toLowerCase() === 'paid'
  );
}

function formatDate(value: Lead['createdAt']) {
  if (!value) return '-';
  if (typeof value === 'object' && 'seconds' in value) {
    return new Date(value.seconds * 1000).toLocaleString();
  }
  const d = new Date(value as string | number);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

export const GoogleAdsRegistrationsManagement: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [markingId, setMarkingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, LEADS_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setLeads(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    } catch (err) {
      console.error(err);
      setError('Error fetching Google Ads registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    if (!window.confirm('Mark this registration as paid?')) return;
    try {
      setMarkingId(id);
      setError('');
      const markRegistrationPaid = httpsCallable(functions, 'markRegistrationPaid');
      await markRegistrationPaid({ registrationId: id });
      setSuccess('Registration marked as paid');
      setTimeout(() => setSuccess(''), 3000);
      await fetchLeads();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to mark as paid');
    } finally {
      setMarkingId(null);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const term = searchTerm.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(term) ||
      lead.email?.toLowerCase().includes(term) ||
      lead.phone?.toLowerCase().includes(term)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Google Ads Registrations</h1>
          <p className="text-gray-500 text-sm mt-1">
            Leads captured from the workshop registration funnel ({leads.length} total)
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 p-3 rounded-lg">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No registrations found</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{lead.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div>{lead.email || '-'}</div>
                      <div className="text-gray-400">{lead.phone || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {lead.source || lead.utm?.utm_source || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(lead.createdAt)}</td>
                    <td className="px-4 py-3 text-sm">
                      {isMarkedPaid(lead) ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Paid</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {!isMarkedPaid(lead) && (
                        <button
                          onClick={() => handleMarkPaid(lead.id)}
                          disabled={markingId === lead.id}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                          {markingId === lead.id ? 'Marking...' : 'Mark Paid'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
