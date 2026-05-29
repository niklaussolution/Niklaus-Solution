import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Search, Download, Filter, AlertCircle, ArrowUpDown } from 'lucide-react';

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
  const [sortConfig, setSortConfig] = useState<{ key: keyof Order | ''; direction: 'asc' | 'desc' }>({
    key: 'registrationDate',
    direction: 'desc'
  });
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

  const handleSort = (key: keyof Order) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredOrders = orders
    .filter(order => {
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
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      let aValue: any = a[sortConfig.key] ?? '';
      let bValue: any = b[sortConfig.key] ?? '';

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
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
            {[
              { label: 'Total Orders', value: orders.length, color: 'text-amber-600' },
              { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: 'text-emerald-600' },
              { label: 'Completed', value: orders.filter(o => o.paymentStatus === 'Completed').length, color: 'text-emerald-500' },
              { label: 'Pending', value: orders.filter(o => o.paymentStatus === 'Pending').length, color: 'text-amber-500' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-xl">
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{stat.label}</p>
                <p className={`text-3xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl p-6 mb-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Name, email, or workshop..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Payment Status</label>
                <select
                  value={filterPaymentStatus}
                  onChange={(e) => setFilterPaymentStatus(e.target.value as any)}
                  className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-black uppercase tracking-widest text-slate-600 text-sm"
                >
                  <option value="all">All</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">From Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">To Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-sm"
                />
              </div>
            </div>
          </div>

          {/* Orders Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <table className="w-full">
                <thead className="bg-slate-900/5 border-b border-white/20">
                  <tr>
                    {[
                      { key: 'id', label: 'Order ID' },
                      { key: 'userName', label: 'Customer' },
                      { key: 'workshopTitle', label: 'Workshop' },
                      { key: 'amount', label: 'Amount', align: 'center' },
                      { key: 'status', label: 'Status', align: 'center' },
                      { key: 'paymentStatus', label: 'Payment', align: 'center' },
                      { key: 'registrationDate', label: 'Date' },
                    ].map((col) => (
                      <th 
                        key={col.key}
                        className={`px-6 py-3 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors group ${col.align === 'center' ? 'text-center' : 'text-left'}`}
                        onClick={() => handleSort(col.key as keyof Order)}
                      >
                        <div className={`flex items-center gap-1 ${col.align === 'center' ? 'justify-center' : ''}`}>
                          {col.label}
                          <ArrowUpDown 
                            size={14} 
                            className={`transition-opacity ${
                              sortConfig.key === col.key ? 'opacity-100 text-blue-600' : 'opacity-0 group-hover:opacity-50'
                            }`} 
                          />
                        </div>
                      </th>
                    ))}
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
