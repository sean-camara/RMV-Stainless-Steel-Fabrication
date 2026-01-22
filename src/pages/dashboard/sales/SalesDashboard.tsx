import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';
import { appointmentApi } from '../../../api/services';
import type { Appointment } from '../../../types';

const SalesDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    upcoming: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const appointmentsRes = await appointmentApi.getAll({ limit: 100 });
        const appointmentData = appointmentsRes?.data?.data ?? appointmentsRes?.data ?? {};
        const appointmentList: Appointment[] = appointmentData.appointments || [];

        setStats({
          total: appointmentList.length,
          pending: appointmentList.filter(a => a.status === 'pending').length,
          upcoming: appointmentList.filter(a => ['scheduled', 'confirmed'].includes(a.status)).length,
          completed: appointmentList.filter(a => a.status === 'completed').length
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
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-purple-50/40 rounded-full blur-3xl opacity-60 mix-blend-multiply animate-blob" />
      <div className="absolute bottom-0 left-0 -z-10 w-64 h-64 bg-slate-100/50 rounded-full blur-3xl opacity-60 mix-blend-multiply animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-96 h-96 bg-pink-50/40 rounded-full blur-3xl opacity-60 mix-blend-multiply animate-blob animation-delay-4000" />

      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 hero-fade-up">
        <div>
          <h1 className="text-4xl xs:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none mb-2">
            Sales<span className="text-slate-300">.</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-light tracking-wide">
            Welcome back, <span className="text-slate-900 font-bold">{user?.firstName}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end border-r border-slate-200 pr-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Today</span>
            <span className="text-sm font-bold text-slate-900">{format(new Date(), 'MMM dd')}</span>
          </div>
          <Link
            to="/dashboard/sales/appointments"
            className="group relative inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-2xl overflow-hidden transition-all hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.3)] hover:-translate-y-1"
          >
             <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-shine" />
            <span className="relative text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Book Visit
            </span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Total Visits', value: stats.total, icon: 'briefcase', to: '/dashboard/sales/appointments', color: 'slate', isPrimary: true },
          { label: 'Pending', value: stats.pending, icon: 'clock', to: '/dashboard/sales/appointments', color: 'amber' },
          { label: 'Upcoming', value: stats.upcoming, icon: 'calendar', to: '/dashboard/sales/appointments', color: 'blue' },
          { label: 'Completed', value: stats.completed, icon: 'check-circle', to: '/dashboard/sales/appointments', color: 'emerald' },
        ].map((item, idx) => (
          <Link
            key={item.label}
            to={item.to}
            className={`group rounded-2xl p-6 border transition-all hero-fade-up ${
              item.isPrimary 
                ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/10' 
                : 'bg-white/70 backdrop-blur-sm border-white shadow-[0_8px_30_rgb(0,0,0,0.04)] hover:border-slate-200 hover:shadow-md'
            }`}
            style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                item.isPrimary ? 'bg-white/10' : `bg-${item.color}-50`
              }`}>
                {item.icon === 'briefcase' && <svg className={`w-6 h-6 ${item.isPrimary ? 'text-white' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                {item.icon === 'clock' && <svg className={`w-6 h-6 ${item.isPrimary ? 'text-white' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                {item.icon === 'calendar' && <svg className={`w-6 h-6 ${item.isPrimary ? 'text-white' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                {item.icon === 'check-circle' && <svg className={`w-6 h-6 ${item.isPrimary ? 'text-white' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${item.isPrimary ? 'text-slate-400' : 'text-slate-400'}`}>{item.label}</span>
            </div>
            <p className={`text-3xl font-bold tracking-tight truncate ${item.isPrimary ? 'text-white' : 'text-slate-900'}`}>{item.value}</p>
            <p className={`text-[10px] mt-2 uppercase tracking-widest font-bold ${item.isPrimary ? 'text-slate-500' : 'text-slate-300'}`}>View Details</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-[0_8px_30_rgb(0,0,0,0.04)] p-6 md:p-8 hero-fade-up" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Quick Actions
          </h2>
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          <Link
            to="/dashboard/sales/appointments"
            className="flex flex-col items-center p-6 rounded-2xl bg-white/50 border border-slate-100 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all group aspect-square justify-center text-center shadow-sm hover:shadow-xl max-w-xs mx-auto"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/10 group-hover:text-white transition-all">
              <svg className="w-6 h-6 text-slate-700 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest leading-tight opacity-70 group-hover:opacity-100">Manage<br/>Visits</span>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
