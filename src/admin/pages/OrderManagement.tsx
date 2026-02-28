import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Search, Download, Filter, AlertCircle } from 'lucide-react';

interface Order {
  id: string;
  userName: string;
  email: string;
  workshopTitle: string;
  amount: number;
  status: string;
  paymentStatus: string;
  registrationDate: string;
  phone?: string;
}

export const OrderManagement: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<'all' | 'Completed' | 'Pending' | 'Failed'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await api.getRegistrations();
      if (result && typeof result === 'object' && 'data' in result && Array.isArray(result.data)) {
        setOrders(result.data);
        // Calculate total revenue
        const revenue = result.data.reduce((sum: number, order: any) => 
          order.paymentStatus === 'Completed' ? sum + (order.amount || 0) : sum, 0
        );
        setTotalRevenue(revenue);
      }
    } catch (error) {
      setError('Error fetching orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.workshopTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPaymentStatus = filterPaymentStatus === 'all' || order.paymentStatus === filterPaymentStatus;
    
    let matchesDateRange = true;
    if (dateRange.start && dateRange.end) {
      const orderDate = new Date(order.registrationDate);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDateRange = orderDate >= startDate && orderDate <= endDate;
    }

    return matchesSearch && matchesPaymentStatus && matchesDateRange;
  });

  const handleExport = () => {
    // Create CSV content
    const headers = ['Order ID', 'Name', 'Email', 'Workshop', 'Amount', 'Status', 'Payment Status', 'Date'];
    const data = filteredOrders.map(order => [
      order.id,
      order.userName,
      order.email,
      order.workshopTitle,
      order.amount,
      order.status,
      order.paymentStatus,
      new Date(order.registrationDate).toLocaleDateString(),
    ]);

    const csv = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
              <p className="text-gray-600 mt-2">Monitor and manage all customer orders</p>
            </div>
            <button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2"
            >
              <Download size={20} /> Export CSV
            </button>
          </div>

          {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Total Orders</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{orders.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600 mt-2">₹{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {orders.filter(o => o.paymentStatus === 'Completed').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {orders.filter(o => o.paymentStatus === 'Pending').length}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Name, email, or workshop..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <select
                  value={filterPaymentStatus}
                  onChange={(e) => setFilterPaymentStatus(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="all">All</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Orders Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Order ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Workshop</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Payment</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-3">
                        <p className="text-sm font-mono text-gray-700">{order.id.substring(0, 8)}...</p>
                      </td>
                      <td className="px-6 py-3">
                        <p className="font-semibold text-gray-800">{order.userName}</p>
                        <p className="text-sm text-gray-600">{order.email}</p>
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-gray-700">{order.workshopTitle}</p>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <p className="font-semibold text-blue-600">₹{order.amount?.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          order.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          order.paymentStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                          order.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-left">
                        <p className="text-sm text-gray-700">
                          {new Date(order.registrationDate).toLocaleDateString()}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrderManagement;
