import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../api/services';

interface DashboardStats {
  totalUsers?: number;
  totalAppointments?: number;
  totalProjects?: number;
  totalPayments?: number;
  pendingAppointments?: number;
  activeProjects?: number;
  pendingPayments?: number;
  revenue?: number;
}

const AdminReports: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({});
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getDashboard();
      const data = response?.data || response;
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '₱0';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const reportCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: '👥',
      color: 'from-blue-500 to-indigo-600',
      description: 'Registered accounts',
    },
    {
      title: 'Total Appointments',
      value: stats.totalAppointments || 0,
      icon: '📅',
      color: 'from-purple-500 to-pink-600',
      description: 'All time bookings',
    },
    {
      title: 'Total Projects',
      value: stats.totalProjects || 0,
      icon: '📁',
      color: 'from-cyan-500 to-teal-600',
      description: 'Customer projects',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.revenue || 0),
      icon: '💰',
      color: 'from-emerald-500 to-green-600',
      description: 'Verified payments',
      isMonetary: true,
    },
  ];

  const quickStats = [
    { label: 'Pending Appointments', value: stats.pendingAppointments || 0, icon: '⏳' },
    { label: 'Active Projects', value: stats.activeProjects || 0, icon: '⚡' },
    { label: 'Pending Payments', value: stats.pendingPayments || 0, icon: '🔔' },
    { label: 'Total Payments', value: stats.totalPayments || 0, icon: '💳' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm md:text-base mt-1">Overview of your business metrics</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="group bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-lg md:rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.totalUsers || 0}</p>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Total Users</p>
        </div>

        <div className="group bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-50 rounded-lg md:rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.totalAppointments || 0}</p>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Appointments</p>
        </div>

        <div className="group bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-50 rounded-lg md:rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.totalProjects || 0}</p>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Projects</p>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-lg md:rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xl md:text-2xl font-bold truncate">{formatCurrency(stats.revenue)}</p>
          <p className="text-slate-300 text-xs md:text-sm mt-1">Total Revenue</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 p-4 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4">Quick Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <div className="flex flex-col items-center p-3 md:p-4 rounded-lg md:rounded-xl bg-slate-50 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3 shadow-sm">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl md:text-2xl font-bold text-slate-900">{stats.pendingAppointments || 0}</span>
            <span className="text-[10px] md:text-xs text-slate-500 text-center mt-1">Pending Appointments</span>
          </div>

          <div className="flex flex-col items-center p-3 md:p-4 rounded-lg md:rounded-xl bg-slate-50 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3 shadow-sm">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl md:text-2xl font-bold text-slate-900">{stats.activeProjects || 0}</span>
            <span className="text-[10px] md:text-xs text-slate-500 text-center mt-1">Active Projects</span>
          </div>

          <div className="flex flex-col items-center p-3 md:p-4 rounded-lg md:rounded-xl bg-slate-50 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3 shadow-sm">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <span className="text-xl md:text-2xl font-bold text-slate-900">{stats.pendingPayments || 0}</span>
            <span className="text-[10px] md:text-xs text-slate-500 text-center mt-1">Pending Payments</span>
          </div>

          <div className="flex flex-col items-center p-3 md:p-4 rounded-lg md:rounded-xl bg-slate-50 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3 shadow-sm">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span className="text-xl md:text-2xl font-bold text-slate-900">{stats.totalPayments || 0}</span>
            <span className="text-[10px] md:text-xs text-slate-500 text-center mt-1">Total Payments</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Appointments Chart */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100">
            <h2 className="text-base md:text-lg font-semibold text-slate-900">Appointments Overview</h2>
          </div>
          <div className="p-4 md:p-6">
            <div className="h-48 md:h-64 flex items-center justify-center bg-slate-50 rounded-lg md:rounded-xl">
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">Chart coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100">
            <h2 className="text-base md:text-lg font-semibold text-slate-900">Revenue Trends</h2>
          </div>
          <div className="p-4 md:p-6">
            <div className="h-48 md:h-64 flex items-center justify-center bg-slate-50 rounded-lg md:rounded-xl">
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">Chart coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 p-4 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4">Export Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4">
          <button className="flex items-center justify-center gap-3 p-3 md:p-4 rounded-lg md:rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-xs md:text-sm font-medium text-slate-900">Appointments</p>
              <p className="text-[10px] md:text-xs text-slate-500">CSV format</p>
            </div>
          </button>

          <button className="flex items-center justify-center gap-3 p-3 md:p-4 rounded-lg md:rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-xs md:text-sm font-medium text-slate-900">Projects</p>
              <p className="text-[10px] md:text-xs text-slate-500">CSV format</p>
            </div>
          </button>

          <button className="flex items-center justify-center gap-3 p-3 md:p-4 rounded-lg md:rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-xs md:text-sm font-medium text-slate-900">Payments</p>
              <p className="text-[10px] md:text-xs text-slate-500">CSV format</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
