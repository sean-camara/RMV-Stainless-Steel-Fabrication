import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';
import { projectApi } from '../../../api/services';

interface DashboardStats {
  pendingBlueprints: number;
  inProgress: number;
  completedThisMonth: number;
}

const EngineerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    pendingBlueprints: 0,
    inProgress: 0,
    completedThisMonth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Parallel data fetching for performance
      const [pendingRes, allRes] = await Promise.all([
        projectApi.getPendingForEngineer(),
        projectApi.getAll({ limit: 100 }) // Fetching a batch to filter locally for now
      ]);

      const pendingCount = pendingRes?.data?.length || pendingRes?.length || 0;
      const allProjects = allRes?.data?.projects || allRes?.projects || [];
      
      const inProgressCount = allProjects.filter((p: any) => 
        ['approved', 'fabrication', 'installation'].includes(p.status)
      ).length;

      const completedCount = allProjects.filter((p: any) => 
        p.status === 'completed' && 
        new Date(p.updatedAt).getMonth() === new Date().getMonth()
      ).length;

      setStats({
        pendingBlueprints: pendingCount,
        inProgress: inProgressCount,
        completedThisMonth: completedCount
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-indigo-50/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 w-64 h-64 bg-slate-100/50 rounded-full blur-3xl" />

      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 hero-fade-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Engineering Hub
          </h1>
          <p className="text-slate-500 text-sm md:text-base mt-2 font-light">
            Welcome back, <span className="text-slate-900 font-medium">{user?.firstName}</span>. 
            <span className="hidden sm:inline"> System Status: <span className="text-emerald-600 font-medium">Operational</span></span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Current Date</span>
            <span className="text-sm font-medium text-slate-900">{format(new Date(), 'MMM dd, yyyy')}</span>
          </div>
          <Link
            to="/dashboard/engineer/projects"
            className="inline-flex items-center justify-center px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all hover:-translate-y-0.5 shadow-lg shadow-slate-900/20"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Project
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {[
          { 
            label: 'Pending Blueprints', 
            value: stats.pendingBlueprints, 
            icon: 'blueprint',
            color: 'amber',
            desc: 'Awaiting Review'
          },
          { 
            label: 'Active Projects', 
            value: stats.inProgress, 
            icon: 'construct', 
            color: 'indigo',
            desc: 'In Production'
          },
          { 
            label: 'Completed (Mo)', 
            value: stats.completedThisMonth, 
            icon: 'check', 
            color: 'emerald',
            desc: 'Successfully Delivered'
          }
        ].map((stat, idx) => (
          <div 
            key={stat.label}
            className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-all hero-fade-up"
            style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 bg-${stat.color}-50`}>
                {stat.icon === 'blueprint' && <svg className={`w-6 h-6 text-${stat.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                {stat.icon === 'construct' && <svg className={`w-6 h-6 text-${stat.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
                {stat.icon === 'check' && <svg className={`w-6 h-6 text-${stat.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-${stat.color}-100/50 text-${stat.color}-700`}>
                {stat.color === 'amber' ? 'Urgent' : 'Updates'}
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
            <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
            <p className="text-xs text-slate-400 mt-2 border-t border-slate-100 pt-2">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Main Actions Grid */}
      <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mt-8 mb-4 hero-fade-up" style={{ animationDelay: '0.3s' }}>
        Engineering Controls
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 hero-fade-up" style={{ animationDelay: '0.4s' }}>
        {/* Pending Card */}
        <Link 
          to="/dashboard/engineer/projects?status=pending_review"
          className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-6 hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-amber-100/50" />
          <div className="relative z-10">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-4 text-amber-600 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Blueprint Review</h3>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              Review and approve architectural blueprints for pending projects. 
              {stats.pendingBlueprints > 0 && <span className="block mt-2 font-medium text-amber-600">{stats.pendingBlueprints} items waiting.</span>}
            </p>
            <div className="mt-4 flex items-center text-sm font-bold text-amber-600 group-hover:gap-2 transition-all">
              <span>Start Review</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </div>
        </Link>

        {/* Technical Specs */}
        <Link 
          to="/dashboard/engineer/projects"
          className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-6 hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-indigo-100/50" />
          <div className="relative z-10">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 text-indigo-600 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Technical Specifications</h3>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              Manage material requirements, structural calculations, and project costing data.
            </p>
            <div className="mt-4 flex items-center text-sm font-bold text-indigo-600 group-hover:gap-2 transition-all">
              <span>Access Specs</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </div>
        </Link>

        {/* Fabrication Monitor */}
        <Link 
          to="/dashboard/engineer/projects?status=fabrication"
          className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-6 hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-slate-200/50" />
          <div className="relative z-10">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4 text-slate-600 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Fabrication Status</h3>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              Monitor factory floor progress and quality control checks for active builds.
            </p>
            <div className="mt-4 flex items-center text-sm font-bold text-slate-600 group-hover:gap-2 transition-all">
              <span>View Production</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default EngineerDashboard;
