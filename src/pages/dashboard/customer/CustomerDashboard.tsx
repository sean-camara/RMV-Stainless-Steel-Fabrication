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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      completed: 'bg-slate-50 text-slate-700 border-slate-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
      blueprint_pending: 'bg-purple-50 text-purple-700 border-purple-200',
      blueprint_uploaded: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      client_approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dp_pending: 'bg-amber-50 text-amber-700 border-amber-200',
      in_fabrication: 'bg-blue-50 text-blue-700 border-blue-200',
      ready_for_pickup: 'bg-teal-50 text-teal-700 border-teal-200',
      released: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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
            Welcome back, {user?.firstName || 'Customer'}!
          </h1>
          <p className="text-slate-500 text-sm md:text-base mt-1">
            Here's an overview of your projects and appointments.
          </p>
        </div>
        <Link
          to="/dashboard/customer/appointments/new"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all hover:-translate-y-0.5 shadow-lg shadow-slate-900/20 whitespace-nowrap"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Book Appointment
        </Link>
      </div>

      {/* Actions Required - High Priority Alerts */}
      {actionsRequired.length > 0 && (
        <div className="space-y-3">
          {actionsRequired.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`flex items-center justify-between p-4 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all hover:shadow-md ${
                action.type === 'design_approval'
                  ? 'bg-indigo-50 border-indigo-200 hover:border-indigo-300'
                  : action.type === 'payment'
                    ? 'bg-amber-50 border-amber-200 hover:border-amber-300'
                    : 'bg-blue-50 border-blue-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${
                  action.type === 'design_approval'
                    ? 'bg-indigo-100'
                    : action.type === 'payment'
                      ? 'bg-amber-100'
                      : 'bg-blue-100'
                }`}>
                  {action.type === 'design_approval' ? (
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ) : action.type === 'payment' ? (
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className={`font-semibold text-sm md:text-base ${
                    action.type === 'design_approval'
                      ? 'text-indigo-900'
                      : action.type === 'payment'
                        ? 'text-amber-900'
                        : 'text-blue-900'
                  }`}>{action.title}</p>
                  <p className={`text-xs md:text-sm ${
                    action.type === 'design_approval'
                      ? 'text-indigo-700'
                      : action.type === 'payment'
                        ? 'text-amber-700'
                        : 'text-blue-700'
                  }`}>{action.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`hidden sm:inline-block px-3 py-1 text-xs font-medium rounded-full ${
                  action.type === 'design_approval'
                    ? 'bg-indigo-100 text-indigo-700'
                    : action.type === 'payment'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                }`}>
                  Action Required
                </span>
                <svg className={`w-5 h-5 ${
                  action.type === 'design_approval'
                    ? 'text-indigo-400'
                    : action.type === 'payment'
                      ? 'text-amber-400'
                      : 'text-blue-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Link 
          to="/dashboard/customer/appointments"
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
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.appointments}</p>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Appointments</p>
        </Link>

        <Link 
          to="/dashboard/customer/projects"
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
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.activeProjects}</p>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Projects</p>
        </Link>

        <Link 
          to="/dashboard/customer/payments"
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
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.pendingPayments}</p>
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
          <p className="text-xl md:text-3xl font-bold truncate">₱{stats.totalPaid.toLocaleString()}</p>
          <p className="text-slate-300 text-xs md:text-sm mt-1">Total Paid</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 p-4 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <Link
            to="/dashboard/customer/appointments/new"
            className="flex flex-col items-center p-3 md:p-4 rounded-lg md:rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3 shadow-sm group-hover:shadow transition-shadow">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs md:text-sm font-medium text-slate-700 text-center">Book</span>
          </Link>

          <Link
            to="/dashboard/customer/projects"
            className="flex flex-col items-center p-3 md:p-4 rounded-lg md:rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3 shadow-sm group-hover:shadow transition-shadow">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xs md:text-sm font-medium text-slate-700 text-center">Designs</span>
          </Link>

          <Link
            to="/dashboard/customer/payments"
            className="flex flex-col items-center p-3 md:p-4 rounded-lg md:rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3 shadow-sm group-hover:shadow transition-shadow">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span className="text-xs md:text-sm font-medium text-slate-700 text-center">Payment</span>
          </Link>

          <Link
            to="/portfolio"
            className="flex flex-col items-center p-3 md:p-4 rounded-lg md:rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3 shadow-sm group-hover:shadow transition-shadow">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs md:text-sm font-medium text-slate-700 text-center">Portfolio</span>
          </Link>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Recent Projects */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100">
            <h2 className="text-base md:text-lg font-semibold text-slate-900">Recent Projects</h2>
            <Link
              to="/dashboard/customer/projects"
              className="text-xs md:text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="p-4 md:p-6">
            {recentProjects.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm mb-3 md:mb-4">No projects yet</p>
                <Link
                  to="/dashboard/customer/appointments/new"
                  className="text-xs md:text-sm text-slate-900 font-medium hover:underline"
                >
                  Book a consultation to start →
                </Link>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {recentProjects.map((project) => (
                  <Link
                    key={project._id}
                    to={`/dashboard/customer/projects/${project._id}`}
                    className="flex items-center justify-between p-3 md:p-4 bg-slate-50 rounded-lg md:rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-medium text-slate-900 truncate text-sm md:text-base">
                        {project.projectName || project.title || 'Untitled Project'}
                      </p>
                      <p className="text-xs md:text-sm text-slate-500 capitalize mt-0.5">
                        {project.category?.replace(/_/g, ' ') || 'Custom Fabrication'}
                      </p>
                    </div>
                    <span className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium rounded-full border whitespace-nowrap ${getStatusColor(project.status)}`}>
                      {formatStatus(project.status)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100">
            <h2 className="text-base md:text-lg font-semibold text-slate-900">Upcoming Appointments</h2>
            <Link
              to="/dashboard/customer/appointments"
              className="text-xs md:text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="p-4 md:p-6">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm mb-3 md:mb-4">No upcoming appointments</p>
                <Link
                  to="/dashboard/customer/appointments/new"
                  className="text-xs md:text-sm text-slate-900 font-medium hover:underline"
                >
                  Schedule one now →
                </Link>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="flex items-center justify-between p-3 md:p-4 bg-slate-50 rounded-lg md:rounded-xl"
                  >
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 text-sm md:text-base truncate">
                          {new Date(appointment.scheduledDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-xs md:text-sm text-slate-500 truncate">
                          {appointment.scheduledTime || 'Time TBD'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium rounded-full border whitespace-nowrap ${getStatusColor(appointment.status)}`}>
                      {formatStatus(appointment.status)}
                    </span>
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

      {/* Company Info Footer - Hidden on mobile for space */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/about"
          className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-slate-200 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-slate-900">About RMV</p>
              <p className="text-sm text-slate-500">Learn about our company</p>
            </div>
          </div>
        </Link>

        <Link
          to="/portfolio"
          className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-slate-200 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-slate-900">Our Portfolio</p>
              <p className="text-sm text-slate-500">View completed projects</p>
            </div>
          </div>
        </Link>

        <Link
          to="/services"
          className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-slate-200 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-slate-900">Contact Us</p>
              <p className="text-sm text-slate-500">Get in touch with us</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default CustomerDashboard;
