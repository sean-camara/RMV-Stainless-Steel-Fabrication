import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';
import { appointmentApi, projectApi } from '../../../api/services';

const SalesDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    appointments: 0,
    projects: 0,
    pendingApprovals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [appointmentsRes, projectsRes] = await Promise.all([
          appointmentApi.getAll({ limit: 100 }), // Fetching more to local filter if needed
          projectApi.getAll({ limit: 100 }),
        ]);

        const appointmentData = appointmentsRes?.data?.data ?? appointmentsRes?.data ?? {};
        const projectData = projectsRes?.data?.data ?? projectsRes?.data ?? {};

        const appointmentList = appointmentData.appointments || [];
        const projectList = projectData.projects || [];

        setStats({
          appointments: appointmentList.length,
          projects: projectList.length,
          pendingApprovals: projectList.filter((p: any) => p.status === 'pending_approval').length,
        });
      } catch (error) {
        console.error('Failed to load sales stats', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-10 relative">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-purple-50/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 w-64 h-64 bg-slate-100/50 rounded-full blur-3xl" />

      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 hero-fade-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Sales & Projects
          </h1>
          <p className="text-slate-500 text-sm md:text-base mt-2 font-light">
            Welcome back, <span className="text-slate-900 font-medium">{user?.firstName}</span>. 
            <span className="hidden sm:inline"> Target Status: <span className="text-emerald-600 font-medium">On Track</span></span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Date</span>
            <span className="text-sm font-medium text-slate-900">{format(new Date(), 'MMM dd, yyyy')}</span>
          </div>
          <Link
            to="/dashboard/sales/appointments"
            className="inline-flex items-center justify-center px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all hover:-translate-y-0.5 shadow-lg shadow-slate-900/20 whitespace-nowrap"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Book Visit
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {[
          { 
            label: 'My Appointments', 
            value: stats.appointments, 
            icon: 'calendar',
            color: 'purple',
            desc: 'Scheduled visits & consults'
          },
          { 
            label: 'Active Projects', 
            value: stats.projects, 
            icon: 'briefcase', 
            color: 'blue',
            desc: 'Ongoing client projects'
          },
          { 
            label: 'Pending Approval', 
            value: stats.pendingApprovals, 
            icon: 'clipboard', 
            color: 'amber',
            desc: 'Quotations waiting review'
          }
        ].map((stat, idx) => (
          <div 
            key={stat.label}
            className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-all hero-fade-up"
            style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 bg-${stat.color}-50`}>
                {stat.icon === 'calendar' && <svg className={`w-6 h-6 text-${stat.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                {stat.icon === 'briefcase' && <svg className={`w-6 h-6 text-${stat.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                {stat.icon === 'clipboard' && <svg className={`w-6 h-6 text-${stat.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-${stat.color}-100/50 text-${stat.color}-700`}>
                {stat.color === 'amber' ? 'Action' : 'Update'}
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
            <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
            <p className="text-xs text-slate-400 mt-2 border-t border-slate-100 pt-2">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-100 p-6 shadow-sm hero-fade-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Sales Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Link
            to="/dashboard/sales/appointments"
            className="flex items-center p-4 rounded-xl border border-slate-100 bg-white hover:border-purple-200 hover:bg-purple-50/30 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4 text-purple-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Appointments</p>
              <p className="text-xs text-slate-500">View bookings & schedule</p>
            </div>
            <svg className="w-5 h-5 ml-auto text-slate-300 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>

          <Link
            to="/dashboard/sales/projects"
            className="flex items-center p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 text-blue-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Projects</p>
              <p className="text-xs text-slate-500">Create & manage projects</p>
            </div>
            <svg className="w-5 h-5 ml-auto text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>

          <Link
            to="/dashboard/sales/travel-fees"
            className="flex items-center p-4 rounded-xl border border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4 text-emerald-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 2 2.732V17a1 1 0 002 0v-4.268C13.657 12.895 15 12 15 10s-1.343-2-3-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Travel Fees</p>
              <p className="text-xs text-slate-500">Ocular visit payments</p>
            </div>
            <svg className="w-5 h-5 ml-auto text-slate-300 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
