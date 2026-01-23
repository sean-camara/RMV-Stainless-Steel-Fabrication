import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { appointmentApi, projectApi, paymentApi } from '../../../api/services';

interface DashboardStats {
  appointments: number;
  activeProjects: number;
  pendingPayments: number;
  totalPaid: number;
}

interface Project {
  _id: string;
  projectName?: string;
  title?: string;
  status: string;
  category?: string;
  quotation?: {
    totalAmount?: number;
  };
  createdAt: string;
}

interface Appointment {
  _id: string;
  scheduledDate: string;
  scheduledTime?: string;
  appointmentType?: string;
  status: string;
}

interface Payment {
  _id: string;
  stage: string;
  status: string;
  amount?: {
    expected?: number;
    paid?: number;
  };
}

interface ActionRequired {
  type: 'design_approval' | 'payment' | 'appointment';
  title: string;
  description: string;
  link: string;
  priority: number;
}

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    appointments: 0,
    activeProjects: 0,
    pendingPayments: 0,
    totalPaid: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [actionsRequired, setActionsRequired] = useState<ActionRequired[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsRes, projectsRes, paymentsRes] = await Promise.all([
          appointmentApi.getAll({ limit: 5 }).catch(() => ({ data: { appointments: [], pagination: { total: 0 } } })),
          projectApi.getAll({ limit: 5 }).catch(() => ({ data: { projects: [] } })),
          paymentApi.getMyPayments().catch(() => ({ data: { payments: [] } })),
        ]);

        const appointments = appointmentsRes.data?.appointments || [];
        const appointmentsTotal = appointmentsRes.data?.pagination?.total || appointments.length;
        const projects = projectsRes.data?.projects || projectsRes.projects || [];
        const payments = paymentsRes.data?.payments || paymentsRes.payments || [];

        setUpcomingAppointments(appointments.slice(0, 3));
        setRecentProjects(projects.slice(0, 3));
        
        const pending = payments.filter(
          (p: Payment) => p.status === 'pending' || p.status === 'submitted'
        );
        setPendingPayments(pending.slice(0, 3));

        const totalPaid = payments
          .filter((p: Payment) => p.status === 'verified')
          .reduce((sum: number, p: Payment) => sum + (p.amount?.paid || p.amount?.expected || 0), 0);

        // Build action required list
        const actions: ActionRequired[] = [];
        
        // Check for projects needing design approval
        const projectsNeedingApproval = projects.filter(
          (p: Project) => p.status === 'blueprint_uploaded'
        );
        if (projectsNeedingApproval.length > 0) {
          actions.push({
            type: 'design_approval',
            title: 'Design Review Required',
            description: `${projectsNeedingApproval.length} project${projectsNeedingApproval.length > 1 ? 's need' : ' needs'} your approval`,
            link: '/dashboard/customer/projects',
            priority: 1,
          });
        }

        // Check for pending payments
        const pendingPaymentCount = pending.filter((p: Payment) => p.status === 'pending').length;
        if (pendingPaymentCount > 0) {
          actions.push({
            type: 'payment',
            title: 'Payment Required',
            description: `${pendingPaymentCount} payment${pendingPaymentCount > 1 ? 's' : ''} awaiting your action`,
            link: '/dashboard/customer/payments',
            priority: 2,
          });
        }

        setActionsRequired(actions.sort((a, b) => a.priority - b.priority));

        setStats({
          appointments: appointmentsTotal,
          activeProjects: projects.filter(
            (p: Project) => !['completed', 'cancelled', 'released'].includes(p.status)
          ).length,
          pendingPayments: pending.length,
          totalPaid,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
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
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 border-amber-100',
      confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      completed: 'bg-slate-50 text-slate-700 border-slate-100',
      cancelled: 'bg-red-50 text-red-700 border-red-100',
      in_progress: 'bg-blue-50 text-blue-700 border-blue-100',
      blueprint_pending: 'bg-purple-50 text-purple-700 border-purple-100',
      blueprint_uploaded: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      client_approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      dp_pending: 'bg-amber-50 text-amber-700 border-amber-100',
      in_fabrication: 'bg-blue-50 text-blue-700 border-blue-100',
      ready_for_pickup: 'bg-teal-50 text-teal-700 border-teal-100',
      released: 'bg-emerald-50 text-emerald-700 border-emerald-100',
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
      
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-white rounded-[2rem] border border-slate-100 p-8 md:p-10 shadow-sm hero-fade-up">
        {/* Background Accent */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4 justify-center sm:justify-start">
              <span className="h-px w-8 bg-slate-200" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Customer Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight text-center sm:text-left leading-tight">
              Welcome back, <span className="text-slate-400 font-light italic">{user?.firstName || 'Valued Client'}!</span>
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-6">
              <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                {stats.activeProjects > 0 ? 'Active Deployment' : 'System Standby'}
              </div>
              <div className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
          
          <Link
            to="/dashboard/customer/appointments/new"
            className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-200 whitespace-nowrap group"
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:rotate-90 transition-transform">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            Request Schedule
          </Link>
        </div>
      </div>

      {/* Actions Required - Critical Alerts */}
      {actionsRequired.length > 0 && (
        <div className="space-y-4 hero-fade-up" style={{ animationDelay: '0.1s' }}>
          {actionsRequired.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`group flex items-center justify-between p-5 md:p-6 rounded-2xl border backdrop-blur-sm transition-all hover:shadow-lg ${
                action.type === 'design_approval'
                  ? 'bg-blue-50/50 border-blue-100 hover:border-blue-300'
                  : action.type === 'payment'
                    ? 'bg-amber-50/50 border-amber-100 hover:border-amber-300'
                    : 'bg-slate-50/50 border-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  action.type === 'design_approval'
                    ? 'bg-blue-100 text-blue-600'
                    : action.type === 'payment'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-slate-100 text-slate-600'
                }`}>
                  {action.type === 'design_approval' ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ) : action.type === 'payment' ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      action.type === 'design_approval' ? 'bg-blue-100 text-blue-700' : 
                      action.type === 'payment' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}>Attention Needed</span>
                    {action.priority === 1 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
                  </div>
                  <h3 className="font-bold text-slate-900 mt-1">{action.title}</h3>
                  <p className="text-slate-500 text-sm font-light leading-relaxed">{action.description}</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Schedules', value: stats.appointments, icon: 'calendar', to: '/dashboard/customer/appointments', color: 'blue' },
          { label: 'Active Projects', value: stats.activeProjects, icon: 'briefcase', to: '/dashboard/customer/projects', color: 'emerald' },
          { label: 'Balance Due', value: stats.pendingPayments, icon: 'credit-card', to: '/dashboard/customer/payments', color: 'amber' },
          { label: 'Settled', value: formatCurrency(stats.totalPaid), icon: 'check-circle', to: '/dashboard/customer/payments', color: 'slate', isPrimary: true },
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
                {item.icon === 'calendar' && <svg className={`w-6 h-6 ${item.isPrimary ? 'text-white' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                {item.icon === 'briefcase' && <svg className={`w-6 h-6 ${item.isPrimary ? 'text-white' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                {item.icon === 'credit-card' && <svg className={`w-6 h-6 ${item.isPrimary ? 'text-white' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
                {item.icon === 'check-circle' && <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${item.isPrimary ? 'text-slate-400' : 'text-slate-400'}`}>{item.label}</span>
            </div>
            <p className={`text-2xl font-bold tracking-tight truncate ${item.isPrimary ? 'text-white' : 'text-slate-900'}`}>{item.value}</p>
            <p className={`text-[10px] mt-1 uppercase tracking-widest font-black ${item.isPrimary ? 'text-slate-400' : 'text-slate-400'}`}>Current Status</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-[0_8px_30_rgb(0,0,0,0.04)] p-6 md:p-8 hero-fade-up" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Client Controls</h2>
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Link
            to="/dashboard/customer/appointments/new"
            className="flex flex-col items-center p-6 rounded-2xl bg-white/50 border border-slate-100 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all group aspect-square justify-center text-center"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/10 group-hover:text-white transition-all shadow-sm">
              <svg className="w-6 h-6 text-slate-700 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest leading-tight opacity-70 group-hover:opacity-100">Schedule<br/>Meeting</span>
          </Link>

          <Link
            to="/dashboard/customer/projects"
            className="flex flex-col items-center p-6 rounded-2xl bg-white/50 border border-slate-100 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all group aspect-square justify-center text-center"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/10 group-hover:text-white transition-all shadow-sm">
              <svg className="w-6 h-6 text-slate-700 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest leading-tight opacity-70 group-hover:opacity-100">My<br/>Blueprints</span>
          </Link>

          <Link
            to="/dashboard/customer/payments"
            className="flex flex-col items-center p-6 rounded-2xl bg-white/50 border border-slate-100 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all group aspect-square justify-center text-center"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/10 group-hover:text-white transition-all shadow-sm">
              <svg className="w-6 h-6 text-slate-700 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest leading-tight opacity-70 group-hover:opacity-100">Billing<br/>Center</span>
          </Link>

          <Link
            to="/portfolio"
            className="flex flex-col items-center p-6 rounded-2xl bg-white/50 border border-slate-100 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all group aspect-square justify-center text-center"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/10 group-hover:text-white transition-all shadow-sm">
              <svg className="w-6 h-6 text-slate-700 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest leading-tight opacity-70 group-hover:opacity-100">Explore<br/>Work</span>
          </Link>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-white/40 backdrop-blur-sm rounded-3xl border border-white shadow-[0_8px_30_rgb(0,0,0,0.02)] p-6 md:p-8 hero-fade-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Active Deployments</h2>
              <p className="text-xs text-slate-500 font-light mt-1">Status of ongoing fabrications</p>
            </div>
            <Link
              to="/dashboard/customer/projects"
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
            >
              View Full Index →
            </Link>
          </div>
          <div className="space-y-4">
            {recentProjects.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-900">No active projects</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">Start your first fabrication project today</p>
                <Link
                  to="/dashboard/customer/appointments/new"
                  className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
                >
                  Initiate Request
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project, idx) => (
                  <Link
                    key={project._id}
                    to={`/dashboard/customer/projects/${project._id}`}
                    className="flex items-center justify-between p-4 bg-white/50 border border-white rounded-2xl hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{project.projectName || project.title || 'Untitled Project'}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5 uppercase">ID: {project._id.slice(-6)}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(project.status)}`}>
                      {formatStatus(project.status)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white/40 backdrop-blur-sm rounded-3xl border border-white shadow-[0_8px_30_rgb(0,0,0,0.02)] p-6 md:p-8 hero-fade-up" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Scheduled Engagements</h2>
              <p className="text-xs text-slate-500 font-light mt-1">Upcoming consultations & inspections</p>
            </div>
            <Link
              to="/dashboard/customer/appointments"
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
            >
              View Calendar →
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-900">Calendar is clear</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">No pending appointments found</p>
                <Link
                  to="/dashboard/customer/appointments/new"
                  className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
                >
                  Book Slot
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="flex items-center p-4 bg-white/50 border border-white rounded-2xl hover:shadow-lg transition-all"
                  >
                    <div className="flex-shrink-0 w-14 h-14 bg-slate-900 text-white rounded-xl flex flex-col items-center justify-center shadow-lg shadow-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                        {new Date(appointment.scheduledDate).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-xl font-bold leading-none">
                        {new Date(appointment.scheduledDate).getDate()}
                      </span>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">Consultation Session</p>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {appointment.scheduledTime || 'Time TBD'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusColor(appointment.status)}`}>
                          {formatStatus(appointment.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Payments Alert */}
      {pendingPayments.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl md:rounded-2xl border border-amber-100 p-4 md:p-6">
          <div className="flex items-start space-x-3 md:space-x-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-amber-900 text-sm md:text-base">Pending Payments</h3>
              <p className="text-amber-700 text-xs md:text-sm mt-1">
                You have {pendingPayments.length} payment{pendingPayments.length > 1 ? 's' : ''} awaiting action.
              </p>
              <Link
                to="/dashboard/customer/payments"
                className="inline-flex items-center mt-2 md:mt-3 text-xs md:text-sm font-medium text-amber-900 hover:text-amber-700"
              >
                View Payments
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Company Info Footer */}
      <div className="bg-slate-900 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden hero-fade-up" style={{ animationDelay: '0.8s' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Client Satisfaction Guarantee</h3>
            <div className="flex items-baseline space-x-12">
              <div>
                <p className="text-4xl md:text-5xl font-bold tracking-tighter text-white">100%</p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Quality-Assured Fabrication</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Ongoing</p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Project Guidance</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-auto">
             <Link
              to="/about"
              className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl p-4 transition-all group text-left"
            >
              <p className="text-white font-bold text-sm mb-1">About RMV</p>
              <p className="text-slate-400 text-xs">Learn our history</p>
            </Link>
            <Link
               to="/services"
               className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl p-4 transition-all group text-left"
            >
               <p className="text-white font-bold text-sm mb-1">Our Services</p>
               <p className="text-slate-400 text-xs">Explore capabilities</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
