import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';
import { appointmentApi } from '../../../api/services';

interface Appointment {
  _id: string;
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  scheduledDate: string;
  scheduledTime?: string;
  appointmentType: string;
  status: string;
}

interface DashboardStats {
  pending: number;
  today: number;
  thisWeek: number;
  total: number;
}

const AgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ pending: 0, today: 0, thisWeek: 0, total: 0 });
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await appointmentApi.getAll({ limit: 10 });
      const data = response?.data || response;
      const appointments = data.appointments || [];
      
      const today = format(new Date(), 'yyyy-MM-dd');
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      
      setStats({
        pending: appointments.filter((a: Appointment) => a.status === 'pending').length,
        today: appointments.filter((a: Appointment) => format(new Date(a.scheduledDate), 'yyyy-MM-dd') === today).length,
        thisWeek: appointments.filter((a: Appointment) => new Date(a.scheduledDate) >= weekStart).length,
        total: data.total || appointments.length,
      });
      
      setRecentAppointments(appointments.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 border-amber-100',
      assigned: 'bg-blue-50 text-blue-700 border-blue-100',
      confirmed: 'bg-cyan-50 text-cyan-700 border-cyan-100',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      cancelled: 'bg-red-50 text-red-700 border-red-100',
      no_show: 'bg-slate-50 text-slate-700 border-slate-100',
    };
    return colors[status] || 'bg-slate-50 text-slate-700 border-slate-100';
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

  return (
    <div className="space-y-8 md:space-y-10 relative">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 -z-10 w-64 h-64 bg-slate-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-blue-50/20 rounded-full blur-3xl" />

      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 hero-fade-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 italic">{user?.firstName || 'Agent'}</span>!
          </h1>
          <p className="text-slate-500 text-sm md:text-base mt-1.5 font-light">
            Today's Focus: <span className="text-emerald-600 font-medium">{stats.today} Scheduled Assignments</span> • {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <Link
          to="/dashboard/agent/appointments"
          className="inline-flex items-center justify-center px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all hover:-translate-y-0.5 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_-5px_rgba(0,0,0,0.4)] whitespace-nowrap group"
        >
          <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Manage Queue
        </Link>
      </div>

      {/* Pending Alert - Critical Action */}
      {stats.pending > 0 && (
        <Link
          to="/dashboard/agent/appointments?status=pending"
          className="group flex items-center justify-between p-5 md:p-6 rounded-2xl border border-amber-100 bg-amber-50/50 backdrop-blur-sm hover:border-amber-300 transition-all hover:shadow-lg hero-fade-up"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100/50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-900/70">Action Required</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              </div>
              <h3 className="font-bold text-slate-900 mt-1">Pending Inquiries</h3>
              <p className="text-slate-500 text-sm font-light leading-relaxed">
                You have <span className="font-bold text-amber-700">{stats.pending} appointment{stats.pending > 1 ? 's' : ''}</span> awaiting confirmation.
              </p>
            </div>
          </div>
          <svg className="w-5 h-5 text-slate-300 group-hover:text-amber-600 transition-colors hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Pending', value: stats.pending, icon: 'clock', to: '/dashboard/agent/appointments?status=pending', color: 'amber' },
          { label: 'Today', value: stats.today, icon: 'calendar', to: '/dashboard/agent/appointments', color: 'blue' },
          { label: 'This Week', value: stats.thisWeek, icon: 'calendar-week', to: '/dashboard/agent/appointments', color: 'emerald' },
          { label: 'Total', value: stats.total, icon: 'check-circle', to: '/dashboard/agent/appointments', color: 'slate', isPrimary: true },
        ].map((item, idx) => (
          <Link
            key={item.label}
            to={item.to}
            className={`group rounded-2xl p-6 border transition-all hero-fade-up ${
              item.isPrimary 
                ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' 
                : 'bg-white/70 backdrop-blur-sm border-white shadow-[0_8px_30_rgb(0,0,0,0.04)] hover:border-slate-200 hover:shadow-md'
            }`}
            style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                item.isPrimary ? 'bg-white/10' : `bg-${item.color}-50`
              }`}>
                {item.icon === 'clock' && <svg className={`w-6 h-6 ${item.isPrimary ? 'text-white' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                {item.icon === 'calendar' && <svg className={`w-6 h-6 ${item.isPrimary ? 'text-white' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                {item.icon === 'calendar-week' && <svg className={`w-6 h-6 ${item.isPrimary ? 'text-white' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                {item.icon === 'check-circle' && <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${item.isPrimary ? 'text-slate-400' : 'text-slate-400'}`}>{item.label}</span>
            </div>
            <p className={`text-2xl font-bold tracking-tight truncate ${item.isPrimary ? 'text-white' : 'text-slate-900'}`}>{item.value}</p>
            <p className={`text-[10px] mt-1 uppercase tracking-widest font-black ${item.isPrimary ? 'text-slate-400' : 'text-slate-400'}`}>Status Count</p>
          </Link>
        ))}
      </div>

      {/* Agent Controls */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-100 p-6 shadow-sm hero-fade-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Agent Controls</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/dashboard/agent/appointments"
            className="flex flex-col items-center p-6 rounded-xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-900">All Apps</span>
          </Link>

          <Link
            to="/dashboard/agent/appointments?status=pending"
            className="flex flex-col items-center p-6 rounded-xl bg-white border border-slate-100 hover:border-amber-300 hover:bg-amber-50/30 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-900 group-hover:text-amber-700">Pending</span>
          </Link>

          <Link
            to="/dashboard/agent/calendar"
            className="flex flex-col items-center p-6 rounded-xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-900">Calendar</span>
          </Link>

          <Link
            to="/dashboard/agent/appointments?status=completed"
            className="flex flex-col items-center p-6 rounded-xl bg-white border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">Completed</span>
          </Link>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 hero-fade-up" style={{ animationDelay: '0.4s' }}>
        {/* Recent Appointments */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Recent Appointments</h2>
            <Link
              to="/dashboard/agent/appointments"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="p-6 flex-1">
            {recentAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm font-medium">No appointments yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAppointments.map((apt) => (
                  <div
                    key={apt._id}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs">
                        {apt.customer?.firstName?.[0] || 'C'}{apt.customer?.lastName?.[0] || ''}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">
                          {apt.customer?.firstName || 'Customer'} {apt.customer?.lastName || ''}
                        </p>
                        <p className="text-xs text-slate-500 truncate font-mono mt-0.5">
                          {format(new Date(apt.scheduledDate), 'MMM d')} • {apt.scheduledTime || 'TBD'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border whitespace-nowrap ${getStatusColor(apt.status)}`}>
                      {formatStatus(apt.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white/50">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Today's Schedule</h2>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {format(new Date(), 'EEEE, MMM d')}
            </span>
          </div>
          <div className="p-6 flex-1">
            {stats.today === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-50/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm font-medium mb-4">No appointments scheduled for today</p>
                <Link
                  to="/dashboard/agent/appointments"
                  className="text-xs font-bold text-slate-900 uppercase tracking-widest hover:underline"
                >
                  View upcoming →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAppointments
                  .filter(apt => format(new Date(apt.scheduledDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
                  .map((apt) => (
                    <div
                      key={apt._id}
                      className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 hover:border-blue-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate">
                            {apt.customer?.firstName || 'Customer'} {apt.customer?.lastName || ''}
                          </p>
                          <p className="text-xs text-blue-600 truncate font-mono mt-0.5">
                            {apt.scheduledTime || 'Time TBD'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border whitespace-nowrap ${getStatusColor(apt.status)}`}>
                        {formatStatus(apt.status)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Additional Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60 hover:opacity-100 transition-opacity">
        <Link
          to="/dashboard/agent/appointments"
          className="group flex items-center p-4 rounded-xl hover:bg-white hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-slate-200 transition-colors">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">All Appointments</p>
            <p className="text-xs text-slate-500">Full history & management</p>
          </div>
        </Link>
        
        <Link
          to="/dashboard/agent/calendar"
          className="group flex items-center p-4 rounded-xl hover:bg-white hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-slate-200 transition-colors">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Calendar View</p>
            <p className="text-xs text-slate-500">Monthly schedule overview</p>
          </div>
        </Link>

        <Link
          to="/dashboard/agent/appointments?status=pending"
          className="group flex items-center p-4 rounded-xl hover:bg-white hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-amber-100 transition-colors">
            <svg className="w-5 h-5 text-slate-500 group-hover:text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Pending Queue</p>
            <p className="text-xs text-slate-500">{stats.pending} items awaiting action</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AgentDashboard;
