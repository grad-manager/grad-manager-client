import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface Subscriber {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: 'user' | 'mentor' | 'admin';
  subscription?: {
    plan?: string;
    status?: string;
    startDate?: string;
    expirationDate?: string;
    paymentReference?: string;
    paymentCurrency?: string;
    paymentGateway?: string;
  };
  createdAt: string;
}

interface Payment {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  plan: string;
  status: string;
  paymentCurrency: string;
  paymentGateway: string;
  paymentReference: string;
  startDate: string;
  expirationDate: string;
  createdAt: string;
}

const AdminSubscriptionPaymentDashboard: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'payments'>('subscriptions');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role' | 'plan'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [planEdits, setPlanEdits] = useState<Record<string, string>>({});
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Determine correct API base URL
  const resolveApiUrl = (endpoint: string) => {
    const sanitized = API_BASE.replace(/\/$/, '');
    const candidates = [
      `${sanitized}/admin${endpoint}`,
      `${sanitized}/api/admin${endpoint}`,
    ];
    return candidates[0]; // Will fallback to second if needed
  };

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const url = resolveApiUrl('/users');
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const users = Array.isArray(response.data) ? response.data : response.data?.users || [];
      const mapped = users.map((u: any) => ({
        id: u.id || u.uid,
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        email: u.email || '',
        role: u.role || 'user',
        createdAt: u.createdAt || '',
        subscription: u.subscription || {},
      }));
      setSubscribers(mapped);
    } catch (error: any) {
      console.error('Error fetching subscribers:', error);
      toast.error('Failed to fetch subscribers.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const url = resolveApiUrl('/payments');
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(response.data.payments || []);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payment history.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = (userId: string, plan: string) => {
    setPlanEdits((prev) => ({ ...prev, [userId]: plan }));
  };

  const handlePlanUpdate = async (subscriber: Subscriber) => {
    if (!token) return;

    const selectedPlan = (planEdits[subscriber.id] || subscriber.subscription?.plan || '').toLowerCase();
    if (!selectedPlan) {
      toast.error('Please select a plan.');
      return;
    }

    if (selectedPlan === (subscriber.subscription?.plan || '').toLowerCase()) {
      toast.info('Plan is already set to this value.');
      return;
    }

    setUpdatingUserId(subscriber.id);
    try {
      const url = resolveApiUrl(`/users/${subscriber.id}/subscription`);
      const response = await axios.put(
        url,
        { plan: selectedPlan },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedSubscription = response.data?.subscription;
      if (updatedSubscription) {
        setSubscribers((prev) =>
          prev.map((item) =>
            item.id === subscriber.id
              ? {
                  ...item,
                  subscription: {
                    ...item.subscription,
                    ...updatedSubscription,
                  },
                }
              : item
          )
        );
      }

      toast.success('Subscription plan updated.');
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      toast.error(error.response?.data?.message || 'Failed to update subscription plan.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  useEffect(() => {
    if (!token) return;
    if (activeTab === 'subscriptions') {
      fetchSubscribers();
    } else {
      fetchPayments();
    }
  }, [activeTab, token]);

  const filteredSubscribers = subscribers.filter((sub) => {
    const q = searchTerm.toLowerCase();
    return (
      (sub.firstName || '').toLowerCase().includes(q) ||
      (sub.lastName || '').toLowerCase().includes(q) ||
      (sub.email || '').toLowerCase().includes(q)
    );
  });
  const roleOrder: Record<string, number> = { admin: 0, mentor: 1, user: 2 };
  const planOrder: Record<string, number> = { pro: 0, free: 1 };
  const sortedSubscribers = [...filteredSubscribers].sort((a, b) => {
    const dir = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'role') {
      return dir * ((roleOrder[a.role || 'user'] ?? 99) - (roleOrder[b.role || 'user'] ?? 99));
    }
    if (sortBy === 'plan') {
      const aPlan = (a.subscription?.plan || 'free').toLowerCase();
      const bPlan = (b.subscription?.plan || 'free').toLowerCase();
      return dir * ((planOrder[aPlan] ?? 99) - (planOrder[bPlan] ?? 99));
    }
    if (sortBy === 'email') {
      return dir * (a.email || '').localeCompare(b.email || '');
    }
    const aName = `${a.firstName || ''} ${a.lastName || ''}`.trim();
    const bName = `${b.firstName || ''} ${b.lastName || ''}`.trim();
    return dir * aName.localeCompare(bName);
  });

  const filteredPayments = payments.filter(
    (payment) =>
      payment.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscriptions & Payments</h1>
          <p className="text-gray-600 mt-2">View all users and their current plans alongside payment history.</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'subscriptions'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Users ({subscribers.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'payments'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Payment History ({payments.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="role">Sort by Role</option>
            <option value="plan">Sort by Plan</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading data...</p>
          </div>
        )}

        {/* All Users (Plans) Tab */}
        {activeTab === 'subscriptions' && !loading && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {sortedSubscribers.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No users found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Plan</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Start Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Expiration</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Change Plan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedSubscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {subscriber.firstName} {subscriber.lastName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{subscriber.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 uppercase">
                            {subscriber.role || 'user'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {subscriber.subscription?.plan || 'free'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(subscriber.subscription?.startDate || '')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(subscriber.subscription?.expirationDate || '')}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {subscriber.subscription?.status || 'inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <select
                              value={(planEdits[subscriber.id] || subscriber.subscription?.plan || '').toLowerCase()}
                              onChange={(e) => handlePlanChange(subscriber.id, e.target.value)}
                              className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select plan</option>
                              <option value="free">Free</option>
                              <option value="pro">Pro</option>
                            </select>
                            <button
                              onClick={() => handlePlanUpdate(subscriber)}
                              disabled={updatingUserId === subscriber.id}
                              className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                              {updatingUserId === subscriber.id ? 'Updating...' : 'Update'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === 'payments' && !loading && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {filteredPayments.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No payment history found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Plan</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Currency</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Gateway</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Payment Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {payment.firstName} {payment.lastName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{payment.email}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {payment.plan || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {payment.paymentCurrency || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {payment.paymentGateway || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(payment.startDate)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              payment.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Active Subscribers</h3>
            <p className="text-4xl font-bold text-blue-600">{subscribers.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Payments Made</h3>
            <p className="text-4xl font-bold text-green-600">{payments.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptionPaymentDashboard;
