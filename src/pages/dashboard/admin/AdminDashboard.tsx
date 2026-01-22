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
    <div className="space-y-8 md:space-y-10 relative">
      {/* Decorative Orbs - Subtle for Dashboard */}
      <div className="absolute top-0 right-0 -z-10 w-64 h-64 bg-slate-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-blue-50/20 rounded-full blur-3xl" />

      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-white rounded-[2rem] border border-slate-100 p-8 md:p-10 shadow-sm hero-fade-up">
        {/* Background Accent */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4 justify-center sm:justify-start">
              <span className="h-px w-8 bg-slate-200" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">System Overview</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight text-center sm:text-left leading-tight">
              Welcome back, <span className="text-slate-400 font-light italic">{user?.firstName || 'Admin'}!</span>
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-6">
              <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-emerald-100">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                All services operational
              </div>
              <div className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
          
          <Link
            to="/dashboard/admin/users"
            className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-200 whitespace-nowrap group"
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            Manage Users
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Link 
          to="/dashboard/admin/users"
          className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-200 transition-all hero-fade-up"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">Users</div>
          </div>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">{stats?.users?.total || 0}</p>
          <p className="text-slate-500 text-sm mt-1 font-light">Registered accounts</p>
        </Link>

        <Link 
          to="/dashboard/admin/projects"
          className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30_rgb(0,0,0,0.08)] hover:border-slate-200 transition-all hero-fade-up"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">Active</div>
          </div>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">{stats?.projects?.inFabrication || 0}</p>
          <p className="text-slate-500 text-sm mt-1 font-light">Projects in floor</p>
        </Link>

        <Link 
          to="/dashboard/admin/appointments"
          className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30_rgb(0,0,0,0.08)] hover:border-slate-200 transition-all hero-fade-up"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-wider">Queued</div>
          </div>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">{stats?.appointments?.pending || 0}</p>
          <p className="text-slate-500 text-sm mt-1 font-light">Pending inquiries</p>
        </Link>

        <div 
          className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] duration-300 hero-fade-up"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="px-2.5 py-1 bg-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">Revenue</div>
          </div>
          <p className="text-2xl font-bold truncate tracking-tight">{formatCurrency(stats?.payments?.totalReceived || 0)}</p>
          <p className="text-slate-400 text-sm mt-1 font-light">Accumulated total</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-[0_8px_30_rgb(0,0,0,0.04)] p-6 md:p-8 hero-fade-up" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Operational Shortcuts</h2>
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Link
            to="/dashboard/admin/users"
            className="flex flex-col items-center p-6 rounded-2xl bg-white/50 border border-slate-100 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all group lg:aspect-square justify-center text-center"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/10 group-hover:text-white transition-all">
              <svg className="w-6 h-6 text-slate-700 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest leading-tight">Identity<br/>Management</span>
          </Link>

          <Link
            to="/dashboard/admin/appointments"
            className="flex flex-col items-center p-6 rounded-2xl bg-white/50 border border-slate-100 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all group lg:aspect-square justify-center text-center"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/10 group-hover:text-white transition-all">
              <svg className="w-6 h-6 text-slate-700 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest leading-tight">Service<br/>Inquiries</span>
          </Link>

          <Link
            to="/dashboard/admin/payments"
            className="flex flex-col items-center p-6 rounded-2xl bg-white/50 border border-slate-100 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all group lg:aspect-square justify-center text-center"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/10 group-hover:text-white transition-all">
              <svg className="w-6 h-6 text-slate-700 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest leading-tight">Financial<br/>Ledger</span>
          </Link>

          <Link
            to="/dashboard/admin/reports"
            className="flex flex-col items-center p-6 rounded-2xl bg-white/50 border border-slate-100 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all group lg:aspect-square justify-center text-center"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/10 group-hover:text-white transition-all">
              <svg className="w-6 h-6 text-slate-700 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest leading-tight">Analytical<br/>Reports</span>
          </Link>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Users by Role - Distribution */}
        <div className="lg:col-span-2 bg-white/40 backdrop-blur-sm rounded-3xl border border-white shadow-[0_8px_30_rgb(0,0,0,0.02)] p-6 md:p-8 hero-fade-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Workforce Distribution</h2>
              <p className="text-xs text-slate-500 font-light mt-1">Personnel allocation across sectors</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {stats?.users?.byRole && Object.entries(stats.users.byRole).map(([role, count], index) => {
              const total = stats.users.total || 1;
              const percentage = (count as number / total) * 100;
              return (
                <div key={role} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-700">{getRoleDisplayName(role)}</span>
                    <span className="text-xs font-light text-slate-500">{count} active</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-900 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%`, transitionDelay: `${index * 100}ms` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="lg:col-span-3 bg-white/40 backdrop-blur-sm rounded-3xl border border-white shadow-[0_8px_30_rgb(0,0,0,0.02)] p-6 md:p-8 hero-fade-up" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">System Pulse</h2>
              <p className="text-xs text-slate-500 font-light mt-1">Real-time administrative ledger</p>
            </div>
            <Link to="/dashboard/admin/logs" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
              History →
            </Link>
          </div>

          <div className="space-y-4">
            {stats?.recentActivity?.slice(0, 5).map((log: any, index: number) => (
              <div 
                key={log._id} 
                className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-white/50 transition-colors border border-transparent hover:border-slate-100 group"
              >
                <div className="mt-1">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    <span className="font-bold">{log.userId?.profile?.firstName || 'System'}</span>
                    <span className="text-slate-500 font-light italic ml-1">performed {log.action.replace(/_/g, ' ')}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-tighter">
                    {log.resourceType} • {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                </div>
              </div>
            ))}
            {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
              <div className="text-center py-12">
                <p className="text-slate-400 text-xs uppercase tracking-widest">No activity detected</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Month Summary Footer */}
      <div className="bg-slate-900 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden hero-fade-up" style={{ animationDelay: '0.8s' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Monthly Performance Metric</h3>
            <div className="flex items-baseline space-x-4">
              <span className="text-4xl md:text-5xl font-bold tracking-tighter">{formatCurrency(stats?.payments?.thisMonth || 0)}</span>
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">+12.5% vs Last Month</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 md:gap-12">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">New Commissions</p>
              <p className="text-2xl font-bold">{stats?.projects?.thisMonth || 0}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Verification Queue</p>
              <p className="text-2xl font-bold">{stats?.payments?.pendingVerification || 0}</p>
            </div>
          </div>

          <Link
            to="/dashboard/admin/reports"
            className="w-full md:w-auto px-8 py-4 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all text-center"
          >
            Extract Analytics
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
