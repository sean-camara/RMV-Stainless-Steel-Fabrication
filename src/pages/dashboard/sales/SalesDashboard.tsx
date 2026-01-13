import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { appointmentApi, projectApi } from '../../../api/services';

const SalesDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    appointments: 0,
    projects: 0,
    pendingApprovals: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      setLoadingStats(true);
      try {
        const [appointmentsRes, projectsRes] = await Promise.all([
          appointmentApi.getAll({ limit: 1 }),
          projectApi.getAll({ limit: 1 }),
        ]);

        const appointmentData = appointmentsRes?.data?.data ?? appointmentsRes?.data ?? {};
        const projectData = projectsRes?.data?.data ?? projectsRes?.data ?? {};

        const appointmentTotal = appointmentData.pagination?.total ?? appointmentData.appointments?.length ?? 0;
        const projectTotal = projectData.pagination?.total ?? projectData.projects?.length ?? 0;

        setStats({
          appointments: appointmentTotal,
          projects: projectTotal,
          pendingApprovals: 0,
        });
      } catch (error) {
        console.error('Failed to load sales stats', error);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, []);

  const statCards = [
    {
      label: 'My Appointments',
      value: stats.appointments,
      accent: 'bg-blue-50 text-blue-600',
      iconBg: 'bg-blue-100',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Active Projects',
      value: stats.projects,
      accent: 'bg-emerald-50 text-emerald-600',
      iconBg: 'bg-emerald-100',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: 'Pending Approvals',
      value: stats.pendingApprovals,
      accent: 'bg-amber-50 text-amber-600',
      iconBg: 'bg-amber-100',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const quickActions = [
    {
      label: 'View Appointments',
      to: '/dashboard/sales/appointments',
      description: 'Track and manage your booked visits',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Manage Projects',
      to: '/dashboard/sales/projects',
      description: 'Create, quote, and update projects',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: 'Travel Fees',
      to: '/dashboard/sales/travel-fees',
      description: 'Collect ocular visit travel fees',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 2 2.732V17a1 1 0 002 0v-4.268C13.657 12.895 15 12 15 10s-1.343-2-3-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">Sales Team</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Welcome back, {user?.firstName || 'Sales'}!
          </h1>
          <p className="text-slate-600 mt-1">Stay on top of bookings, projects, and collections.</p>
        </div>
        <Link
          to="/dashboard/sales/appointments"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-md shadow-slate-900/15"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          New Appointment
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
        {statCards.map((item) => (
          <div
            key={item.label}
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all min-w-0"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{loadingStats ? '—' : item.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${item.iconBg} text-slate-800`}>{item.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 md:p-6 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Quick actions</p>
            <h2 className="text-lg font-semibold text-slate-900">Jump into your work</h2>
            <p className="text-sm text-slate-500">Move between appointments, projects, and collections.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 transition-all"
            >
              <div className="p-2.5 rounded-lg bg-slate-900 text-white shadow-sm">
                {action.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 group-hover:text-slate-950">{action.label}</p>
                <p className="text-sm text-slate-600 leading-snug">{action.description}</p>
              </div>
              <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
