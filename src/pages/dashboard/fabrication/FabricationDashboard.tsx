import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';
import { projectApi } from '../../../api/services';

interface DashboardStats {
  activeFabrications: number;
  readyForDelivery: number;
  completedThisWeek: number;
}

const FabricationDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeFabrications: 0,
    readyForDelivery: 0,
    completedThisWeek: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await projectApi.getFabricationProjects();
      const projects = response?.data || response || [];
      
      setStats({
        activeFabrications: projects.filter((p: any) => p.status === 'fabrication').length,
        readyForDelivery: projects.filter((p: any) => p.status === 'ready_for_installation').length,
        completedThisWeek: projects.filter((p: any) => 
          p.status === 'installation' && 
          new Date(p.updatedAt).getTime() > new Date().setDate(new Date().getDate() - 7)
        ).length // Approximate 'completed' in fabrication sense
      });
    } catch (error) {
      console.error('Error fetching fabrication stats:', error);
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
      <div className="absolute top-0 right-0 -z-10 w-80 h-80 bg-orange-50/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 w-64 h-64 bg-slate-100/50 rounded-full blur-3xl" />

      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 hero-fade-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Fabrication Floor
          </h1>
          <p className="text-slate-500 text-sm md:text-base mt-2 font-light">
            Operator: <span className="text-slate-900 font-medium">{user?.firstName}</span> • Shift Status: <span className="text-emerald-600 font-medium">Active</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Date</span>
            <span className="text-sm font-medium text-slate-900">{format(new Date(), 'MMM dd')}</span>
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:shadow-md transition-all text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {[
          { 
            label: 'Active Jobs', 
            value: stats.activeFabrications, 
            icon: 'hammer',
            color: 'orange',
            desc: 'Currently in production'
          },
          { 
            label: 'Ready to Ship', 
            value: stats.readyForDelivery, 
            icon: 'truck', 
            color: 'blue',
            desc: 'Awaiting installation team'
          },
          { 
            label: 'Output (Wk)', 
            value: stats.completedThisWeek, 
            icon: 'check', 
            color: 'emerald',
            desc: 'Completed this week'
          }
        ].map((stat, idx) => (
          <div 
            key={stat.label}
            className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-all hero-fade-up"
            style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 bg-${stat.color}-50`}>
                {stat.icon === 'hammer' && <svg className={`w-6 h-6 text-${stat.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
                {stat.icon === 'truck' && <svg className={`w-6 h-6 text-${stat.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
                {stat.icon === 'check' && <svg className={`w-6 h-6 text-${stat.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-${stat.color}-100/50 text-${stat.color}-700`}>
                {stat.color === 'orange' ? 'Priority' : 'Status'}
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
            <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-100 p-6 shadow-sm hero-fade-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Production Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Link
            to="/dashboard/fabrication/active"
            className="flex items-center p-4 rounded-xl border border-slate-100 bg-white hover:border-orange-200 hover:bg-orange-50/30 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4 text-orange-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Active Queue</p>
              <p className="text-xs text-slate-500">Update progress & tracking</p>
            </div>
            <svg className="w-5 h-5 ml-auto text-slate-300 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>

          <Link
            to="/dashboard/fabrication/updates"
            className="flex items-center p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 text-blue-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Photo Updates</p>
              <p className="text-xs text-slate-500">Upload fabrication evidence</p>
            </div>
            <svg className="w-5 h-5 ml-auto text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FabricationDashboard;
