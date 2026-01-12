import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { adminApi } from '../../../api/services';

interface DashboardStats {
  users: {
    total: number;
    byRole: Record<string, number>;
  };
  appointments: {
    pending: number;
    scheduled: number;
    today: number;
  };
  projects: {
    total: number;
    inFabrication: number;
    completed: number;
    thisMonth: number;
  };
  payments: {
    totalReceived: number;
    thisMonth: number;
    pendingVerification: number;
  };
  recentActivity: any[];
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await adminApi.getDashboard();
        const data = response?.data || response;
        setStats(data);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      customer: 'Customers',
      appointment_agent: 'Appointment Agents',
      sales_staff: 'Sales Staff',
      engineer: 'Engineers',
      cashier: 'Cashiers',
      fabrication_staff: 'Fabrication Staff',
      admin: 'Administrators',
    };
    return roleNames[role] || role.replace('_', ' ');
  };

  const getActionIcon = (action: string) => {
    if (action.includes('create') || action.includes('add')) {
      return (
        <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-lg md:rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      );
    }
    if (action.includes('update') || action.includes('edit')) {
      return (
        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-lg md:rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
      );
    }
    if (action.includes('delete') || action.includes('cancel')) {
      return (
        <div className="w-10 h-10 md:w-12 md:h-12 bg-red-50 rounded-lg md:rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 rounded-lg md:rounded-xl flex items-center justify-center">
        <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
            <svg className="w-6 h-6 md:w-8 md:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm mb-3 md:mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs md:text-sm text-slate-900 font-medium hover:underline"
          >
            Try again →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">
            Welcome back, {user?.firstName || 'Admin'}!
          </h1>
          <p className="text-slate-500 text-sm md:text-base mt-1">
            Here's an overview of your system.
          </p>
        </div>
        <Link
          to="/dashboard/admin/users"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all hover:-translate-y-0.5 shadow-lg shadow-slate-900/20 whitespace-nowrap"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Manage Users
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Link 
          to="/dashboard/admin/users"
          className="group bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all"
        >
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-lg md:rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <svg className="w-4 h-4 md:w-5 md:h-5 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-1 transition-all hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats?.users?.total || 0}</p>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Total Users</p>
        </Link>

        <Link 
          to="/dashboard/admin/projects"
          className="group bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all"
        >
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-lg md:rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <svg className="w-4 h-4 md:w-5 md:h-5 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-1 transition-all hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats?.projects?.inFabrication || 0}</p>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Active Projects</p>
        </Link>

        <Link 
          to="/dashboard/admin/appointments"
          className="group bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all"
        >
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 rounded-lg md:rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <svg className="w-4 h-4 md:w-5 md:h-5 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-1 transition-all hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats?.appointments?.pending || 0}</p>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Pending</p>
        </Link>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-lg md:rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xl md:text-3xl font-bold truncate">{formatCurrency(stats?.payments?.totalReceived || 0)}</p>
          <p className="text-slate-300 text-xs md:text-sm mt-1">Total Revenue</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 p-4 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <Link
            to="/dashboard/admin/users"
            className="flex flex-col items-center p-3 md:p-4 rounded-lg md:rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3 shadow-sm group-hover:shadow transition-shadow">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <span className="text-xs md:text-sm font-medium text-slate-700 text-center">Add User</span>
          </Link>

          <Link
            to="/dashboard/admin/appointments"
            className="flex flex-col items-center p-3 md:p-4 rounded-lg md:rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3 shadow-sm group-hover:shadow transition-shadow">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs md:text-sm font-medium text-slate-700 text-center">Appointments</span>
          </Link>

          <Link
            to="/dashboard/admin/payments"
            className="flex flex-col items-center p-3 md:p-4 rounded-lg md:rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3 shadow-sm group-hover:shadow transition-shadow">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span className="text-xs md:text-sm font-medium text-slate-700 text-center">Payments</span>
          </Link>

          <Link
            to="/dashboard/admin/reports"
            className="flex flex-col items-center p-3 md:p-4 rounded-lg md:rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3 shadow-sm group-hover:shadow transition-shadow">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xs md:text-sm font-medium text-slate-700 text-center">Reports</span>
          </Link>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Users by Role */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100">
            <h2 className="text-base md:text-lg font-semibold text-slate-900">Users by Role</h2>
            <Link
              to="/dashboard/admin/users"
              className="text-xs md:text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="p-4 md:p-6">
            {stats?.users?.byRole && Object.entries(stats.users.byRole).length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {Object.entries(stats.users.byRole).map(([role, count]) => (
                  <div
                    key={role}
                    className="flex items-center justify-between p-3 md:p-4 bg-slate-50 rounded-lg md:rounded-xl"
                  >
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-sm md:text-base font-medium text-slate-900">{getRoleDisplayName(role)}</span>
                    </div>
                    <span className="px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium rounded-full bg-slate-200 text-slate-700">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 md:py-8">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm mb-3 md:mb-4">No user data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100">
            <h2 className="text-base md:text-lg font-semibold text-slate-900">Recent Activity</h2>
            <Link
              to="/dashboard/admin/logs"
              className="text-xs md:text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="p-4 md:p-6">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {stats.recentActivity.slice(0, 5).map((log: any) => (
                  <div
                    key={log._id}
                    className="flex items-center justify-between p-3 md:p-4 bg-slate-50 rounded-lg md:rounded-xl"
                  >
                    <div className="flex items-center space-x-3 md:space-x-4">
                      {getActionIcon(log.action)}
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 text-sm md:text-base truncate">
                          {log.userId?.profile?.firstName || 'System'} {log.userId?.profile?.lastName || ''}
                        </p>
                        <p className="text-xs md:text-sm text-slate-500 truncate">
                          {log.action.replace(/_/g, ' ')} {log.resourceType}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] md:text-xs text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 md:py-8">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm mb-3 md:mb-4">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* This Month Summary */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl md:rounded-2xl border border-amber-100 p-4 md:p-6">
        <div className="flex items-start space-x-3 md:space-x-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-amber-900 text-sm md:text-base">This Month's Summary</h3>
            <div className="flex flex-wrap gap-4 mt-2">
              <div>
                <p className="text-amber-700 text-xs md:text-sm">Revenue</p>
                <p className="font-bold text-amber-900">{formatCurrency(stats?.payments?.thisMonth || 0)}</p>
              </div>
              <div>
                <p className="text-amber-700 text-xs md:text-sm">New Projects</p>
                <p className="font-bold text-amber-900">{stats?.projects?.thisMonth || 0}</p>
              </div>
              <div>
                <p className="text-amber-700 text-xs md:text-sm">Pending Payments</p>
                <p className="font-bold text-amber-900">{stats?.payments?.pendingVerification || 0}</p>
              </div>
            </div>
            <Link
              to="/dashboard/admin/reports"
              className="inline-flex items-center mt-2 md:mt-3 text-xs md:text-sm font-medium text-amber-900 hover:text-amber-700"
            >
              View Full Report
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Management Links - Hidden on mobile for space */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/dashboard/admin/users"
          className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-slate-200 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-slate-900">User Management</p>
              <p className="text-sm text-slate-500">Manage system users</p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/admin/logs"
          className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-slate-200 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-slate-900">Activity Logs</p>
              <p className="text-sm text-slate-500">View system activity</p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/admin/reports"
          className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-slate-200 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-slate-900">Reports & Analytics</p>
              <p className="text-sm text-slate-500">View business insights</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
