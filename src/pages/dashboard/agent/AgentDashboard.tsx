import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';
import { appointmentApi } from '../../../api/services';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Bell, 
  Activity,
  CalendarDays,
  User
} from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 min-h-screen p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 -z-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">{user?.firstName || 'Agent'}</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
              <span className="text-indigo-600 font-bold">{stats.today} appointments today</span>
            </p>
          </div>
          <Link
            to="/dashboard/agent/appointments"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-slate-800 transition-all hover:-translate-y-0.5 shadow-lg shadow-slate-900/20 group"
          >
            Manage Queue
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Pending Alert */}
        {stats.pending > 0 && (
          <Link
            to="/dashboard/agent/appointments?status=pending"
            className="group block bg-amber-50/50 backdrop-blur-sm border border-amber-100/50 rounded-2xl p-4 md:p-6 hover:shadow-lg hover:border-amber-200 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm group-hover:scale-110 transition-transform">
                <Bell className="w-6 h-6 animate-bounce-subtle" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    Action Required
                  </span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                  {stats.pending} Pending Inquiries
                </h3>
                <p className="text-slate-500 text-sm">
                  You have new appointment requests awaiting confirmation.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'Pending', value: stats.pending, icon: Clock, to: '/dashboard/agent/appointments?status=pending', color: 'amber' },
            { label: 'Today', value: stats.today, icon: CalendarDays, to: '/dashboard/agent/appointments', color: 'blue' },
            { label: 'This Week', value: stats.thisWeek, icon: Calendar, to: '/dashboard/agent/appointments', color: 'indigo' },
            { label: 'Total Apps', value: stats.total, icon: Activity, to: '/dashboard/agent/appointments', color: 'emerald' },
          ].map((item, idx) => (
            <Link
              key={item.label}
              to={item.to}
              className="bg-white/70 backdrop-blur-sm border border-white rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-${item.color}-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                </div>
                <div className={`px-2 py-1 rounded-lg bg-${item.color}-50 border border-${item.color}-100`}>
                   <ArrowRight className={`w-3 h-3 text-${item.color}-600 group-hover:translate-x-0.5 transition-transform`} />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 mb-1">{item.value}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-600 transition-colors">
                  {item.label}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Recent List */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden h-full">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/40">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-50 rounded-lg">
                    <Clock className="w-5 h-5 text-indigo-600" />
                 </div>
                 <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Recent Appointments</h2>
              </div>
              <Link to="/dashboard/agent/appointments" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
                View All
              </Link>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto max-h-[400px]">
              {recentAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center text-slate-400">
                  <Activity className="w-12 h-12 mb-3 opacity-20" />
                  <p className="font-medium">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAppointments.map((apt) => (
                    <div 
                      key={apt._id}
                      className="group flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm border-2 border-white shadow-sm ring-1 ring-slate-100">
                          {apt.customer?.firstName?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                            {apt.customer?.firstName} {apt.customer?.lastName}
                          </p>
                          <p className="text-xs font-medium text-slate-500 font-mono">
                            {format(new Date(apt.scheduledDate), 'MMM d')} • {apt.scheduledTime || 'TBD'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg border ${getStatusColor(apt.status)}`}>
                        {formatStatus(apt.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Today's Schedule (or Empty State) */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden h-full">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/40">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-50 rounded-lg">
                    <CalendarDays className="w-5 h-5 text-blue-600" />
                 </div>
                 <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Today's Schedule</h2>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                {format(new Date(), 'MMM d')}
              </span>
            </div>

            <div className="p-6 flex-1 overflow-y-auto max-h-[400px]">
              {stats.today === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-blue-300" />
                  </div>
                  <p className="text-slate-900 font-bold mb-1">All clear for today!</p>
                  <p className="text-slate-500 text-sm mb-6">No appointments scheduled for today.</p>
                  <Link
                    to="/dashboard/agent/appointments"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                  >
                    Check Upcoming
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAppointments
                    .filter(apt => format(new Date(apt.scheduledDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
                    .map((apt) => (
                      <div
                        key={apt._id}
                        className="flex items-center gap-4 p-4 bg-blue-50/30 rounded-xl border border-blue-100 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all group"
                      >
                        <div className="flex flex-col items-center justify-center min-w-[50px] p-2 bg-white rounded-lg border border-blue-100 shadow-sm">
                           <span className="text-xs font-bold text-blue-600 uppercase">{format(new Date(apt.scheduledDate), 'MMM')}</span>
                           <span className="text-xl font-bold text-slate-900">{format(new Date(apt.scheduledDate), 'd')}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 group-hover:text-indigo-700">{apt.customer?.firstName} {apt.customer?.lastName}</h4>
                          <p className="text-xs font-bold text-blue-600 flex items-center gap-1 mt-1">
                             <Clock className="w-3 h-3" />
                             {apt.scheduledTime || 'Time TBD'}
                          </p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(apt.status).split(' ')[0].replace('bg-', 'bg-')}-500`} />
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
