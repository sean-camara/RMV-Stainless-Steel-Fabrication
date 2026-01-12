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
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      assigned: 'bg-blue-50 text-blue-700 border-blue-200',
      confirmed: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      no_show: 'bg-slate-50 text-slate-700 border-slate-200',
    };
    return colors[status] || 'bg-slate-50 text-slate-700 border-slate-200';
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
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">
            Welcome back, {user?.firstName || 'Agent'}!
          </h1>
          <p className="text-slate-500 text-sm md:text-base mt-1">
            Here's an overview of your appointments.
          </p>
        </div>
        <Link
          to="/dashboard/agent/appointments"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all hover:-translate-y-0.5 shadow-lg shadow-slate-900/20 whitespace-nowrap"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Manage Appointments
        </Link>
      </div>

      {/* Pending Alert */}
      {stats.pending > 0 && (
        <Link
          to="/dashboard/agent/appointments"
          className="flex items-center justify-between p-4 md:p-5 rounded-xl md:rounded-2xl border-2 bg-amber-50 border-amber-200 hover:border-amber-300 transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm md:text-base text-amber-900">Pending Appointments</p>
              <p className="text-xs md:text-sm text-amber-700">{stats.pending} appointment{stats.pending > 1 ? 's' : ''} awaiting your action</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
              Action Required
            </span>
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Link 
          to="/dashboard/agent/appointments?status=pending"
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
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.pending}</p>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Pending</p>
        </Link>

        <Link 
          to="/dashboard/agent/appointments"
          className="group bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all"
        >
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-lg md:rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <svg className="w-4 h-4 md:w-5 md:h-5 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-1 transition-all hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.today}</p>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Today</p>
        </Link>

        <Link 
          to="/dashboard/agent/appointments"
          className="group bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all"
        >
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-lg md:rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <svg className="w-4 h-4 md:w-5 md:h-5 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-1 transition-all hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.thisWeek}</p>
          <p className="text-slate-500 text-xs md:text-sm mt-1">This Week</p>
        </Link>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-lg md:rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold">{stats.total}</p>
          <p className="text-slate-300 text-xs md:text-sm mt-1">Total Appointments</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 p-4 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <Link
            to="/dashboard/agent/appointments"
            className="flex flex-col items-center p-3 md:p-4 rounded-lg md:rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3 shadow-sm group-hover:shadow transition-shadow">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-xs md:text-sm font-medium text-slate-700 text-center">All</span>
          </Link>

          <Link
            to="/dashboard/agent/appointments?status=pending"
            className="flex flex-col items-center p-3 md:p-4 rounded-lg md:rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3 shadow-sm group-hover:shadow transition-shadow">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs md:text-sm font-medium text-slate-700 text-center">Pending</span>
          </Link>

          <Link
            to="/dashboard/agent/calendar"
            className="flex flex-col items-center p-3 md:p-4 rounded-lg md:rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3 shadow-sm group-hover:shadow transition-shadow">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs md:text-sm font-medium text-slate-700 text-center">Calendar</span>
          </Link>

          <Link
            to="/dashboard/agent/appointments?status=completed"
            className="flex flex-col items-center p-3 md:p-4 rounded-lg md:rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3 shadow-sm group-hover:shadow transition-shadow">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs md:text-sm font-medium text-slate-700 text-center">Completed</span>
          </Link>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Recent Appointments */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100">
            <h2 className="text-base md:text-lg font-semibold text-slate-900">Recent Appointments</h2>
            <Link
              to="/dashboard/agent/appointments"
              className="text-xs md:text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="p-4 md:p-6">
            {recentAppointments.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm mb-3 md:mb-4">No appointments yet</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {recentAppointments.map((apt) => (
                  <div
                    key={apt._id}
                    className="flex items-center justify-between p-3 md:p-4 bg-slate-50 rounded-lg md:rounded-xl"
                  >
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-sm text-slate-600 font-medium">
                        {apt.customer?.firstName?.[0] || 'C'}{apt.customer?.lastName?.[0] || ''}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 text-sm md:text-base truncate">
                          {apt.customer?.firstName || 'Customer'} {apt.customer?.lastName || ''}
                        </p>
                        <p className="text-xs md:text-sm text-slate-500 truncate">
                          {format(new Date(apt.scheduledDate), 'MMM d')} • {apt.scheduledTime || 'TBD'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium rounded-full border whitespace-nowrap ${getStatusColor(apt.status)}`}>
                      {formatStatus(apt.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100">
            <h2 className="text-base md:text-lg font-semibold text-slate-900">Today's Schedule</h2>
            <span className="text-xs md:text-sm text-slate-500">
              {format(new Date(), 'EEEE, MMM d')}
            </span>
          </div>
          <div className="p-4 md:p-6">
            {stats.today === 0 ? (
              <div className="text-center py-6 md:py-8">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm mb-3 md:mb-4">No appointments scheduled for today</p>
                <Link
                  to="/dashboard/agent/appointments"
                  className="text-xs md:text-sm text-slate-900 font-medium hover:underline"
                >
                  View upcoming appointments →
                </Link>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {recentAppointments
                  .filter(apt => format(new Date(apt.scheduledDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
                  .map((apt) => (
                    <div
                      key={apt._id}
                      className="flex items-center justify-between p-3 md:p-4 bg-blue-50 rounded-lg md:rounded-xl border border-blue-100"
                    >
                      <div className="flex items-center space-x-3 md:space-x-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-sm">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 text-sm md:text-base truncate">
                            {apt.customer?.firstName || 'Customer'} {apt.customer?.lastName || ''}
                          </p>
                          <p className="text-xs md:text-sm text-blue-600 truncate">
                            {apt.scheduledTime || 'Time TBD'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium rounded-full border whitespace-nowrap ${getStatusColor(apt.status)}`}>
                        {formatStatus(apt.status)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Management Links - Hidden on mobile for space */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/dashboard/agent/appointments"
          className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-slate-200 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-slate-900">All Appointments</p>
              <p className="text-sm text-slate-500">View and manage all</p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/agent/calendar"
          className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-slate-200 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-slate-900">Calendar View</p>
              <p className="text-sm text-slate-500">View schedule calendar</p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/agent/appointments?status=pending"
          className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-slate-200 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-slate-900">Pending Queue</p>
              <p className="text-sm text-slate-500">{stats.pending} awaiting action</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AgentDashboard;
