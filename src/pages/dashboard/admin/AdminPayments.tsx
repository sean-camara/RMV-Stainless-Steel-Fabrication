import React, { useState, useEffect } from 'react';
import { paymentApi } from '../../../api/services';
import { useNotification } from '../../../contexts/NotificationContext';

interface Payment {
  _id: string;
  project: {
    _id: string;
    title?: string;
    customer?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  stage: 'downpayment' | 'progress' | 'final';
  amount: number;
  status: 'pending' | 'paid' | 'verified' | 'rejected';
  paymentMethod?: string;
  referenceNumber?: string;
  createdAt: string;
  paidAt?: string;
  verifiedAt?: string;
}

const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { notify } = useNotification();

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter, stageFilter]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const response = await paymentApi.getAll({
        page,
        limit: 10,
        status: statusFilter || undefined,
        stage: stageFilter || undefined,
      });
      const data = response?.data || response;
      setPayments(data.payments || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching payments:', error);
      notify({ type: 'error', title: 'Payments unavailable', message: 'Could not load payments list' });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      paid: 'bg-blue-50 text-blue-700 border-blue-200',
      verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border ${styles[status] || 'bg-slate-50 text-slate-600'}`}>
        {status.replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  const getStageBadge = (stage: string) => {
    const styles: Record<string, string> = {
      downpayment: 'bg-purple-50 text-purple-700 border-purple-200',
      progress: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      final: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border ${styles[stage] || 'bg-slate-50 text-slate-600'}`}>
        {stage.replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredPayments = payments.filter(payment => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      payment.project?.title?.toLowerCase().includes(search) ||
      payment.project?.customer?.firstName?.toLowerCase().includes(search) ||
      payment.project?.customer?.lastName?.toLowerCase().includes(search) ||
      payment.referenceNumber?.toLowerCase().includes(search)
    );
  });

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    awaiting: payments.filter(p => p.status === 'paid').length,
    verified: payments.filter(p => p.status === 'verified').length,
  };

  const totalAmount = payments.reduce((sum, p) => sum + (p.status === 'verified' ? p.amount : 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-500 text-sm md:text-base mt-1">Manage all payment transactions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-lg md:rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Total Payments</p>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 rounded-lg md:rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.pending}</p>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Pending</p>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-50 rounded-lg md:rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.awaiting}</p>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Awaiting Verification</p>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-lg md:rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.verified}</p>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Verified</p>
        </div>
      </div>


      {/* Total Revenue Card */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <p className="text-sm opacity-80">Total Verified Revenue</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(totalAmount)}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by project, customer, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rmv-select w-full sm:w-44"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid (Awaiting)</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="rmv-select w-full sm:w-44"
          >
            <option value="">All Stages</option>
            <option value="downpayment">Downpayment</option>
            <option value="progress">Progress</option>
            <option value="final">Final</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12 md:py-20">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-semibold text-slate-900">No payments found</h3>
            <p className="text-slate-500 text-xs md:text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Project</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Stage</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Reference</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{payment.project?.title || 'Untitled'}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">
                            {payment.project?.customer?.firstName} {payment.project?.customer?.lastName}
                          </p>
                          <p className="text-sm text-slate-500">{payment.project?.customer?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStageBadge(payment.stage)}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">{formatCurrency(payment.amount)}</span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 font-mono text-sm">
                          {payment.referenceNumber || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filteredPayments.map((payment) => (
                <div key={payment._id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-slate-900">{payment.project?.title || 'Untitled'}</p>
                      <p className="text-sm text-slate-500">
                        {payment.project?.customer?.firstName} {payment.project?.customer?.lastName}
                      </p>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStageBadge(payment.stage)}
                      {payment.referenceNumber && (
                        <span className="text-xs text-slate-500 font-mono">{payment.referenceNumber}</span>
                      )}
                    </div>
                    <span className="font-bold text-slate-900">{formatCurrency(payment.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;
