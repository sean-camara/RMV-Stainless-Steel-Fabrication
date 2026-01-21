import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';
import { paymentApi } from '../../../api/services';

interface DashboardStats {
  pendingVerification: number;
  verifiedToday: number;
  revenueToday: number;
}

const CashierDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    pendingVerification: 0,
    verifiedToday: 0,
    revenueToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await paymentApi.getAll({ limit: 100 });
      const payments = response?.data?.payments || response?.payments || [];
      const today = new Date().toDateString();

      const pending = payments.filter((p: any) => p.status === 'pending').length;
      
      const verifiedTodayList = payments.filter((p: any) => 
        p.status === 'verified' && 
        new Date(p.verifiedAt || p.updatedAt).toDateString() === today
      );

      const revenue = verifiedTodayList.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

      setStats({
        pendingVerification: pending,
        verifiedToday: verifiedTodayList.length,
        revenueToday: revenue
      });
    } catch (error) {
      console.error('Error fetching cashier stats:', error);
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
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-emerald-50/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 w-64 h-64 bg-slate-100/50 rounded-full blur-3xl" />

      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 hero-fade-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-slate-500 text-sm md:text-base mt-2 font-light">
            Cashier: <span className="text-slate-900 font-medium">{user?.firstName}</span> • Session Status: <span className="text-emerald-600 font-medium">Secure</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">System Time</span>
            <span className="text-sm font-medium text-slate-900">{format(new Date(), 'HH:mm • MMM dd')}</span>
          </div>
          <Link
            to="/dashboard/cashier/pending"
            className="inline-flex items-center justify-center px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all hover:-translate-y-0.5 shadow-lg shadow-slate-900/20"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Verify Now
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {[
          { 
            label: 'Pending Verification', 
            value: stats.pendingVerification, 
            icon: 'clock',
            color: 'amber',
            desc: 'Payments needing review'
          },
          { 
            label: 'Verified Today', 
            value: stats.verifiedToday, 
            icon: 'check', 
            color: 'emerald',
            desc: 'Transactions processed'
          },
          { 
            label: 'Revenue Today', 
            value: `₱${stats.revenueToday.toLocaleString()}`, 
            icon: 'cash', 
            color: 'purple',
            desc: 'Total verified amount',
            isCurrency: true
          }
        ].map((stat, idx) => (
          <div 
            key={stat.label}
            className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-all hero-fade-up"
            style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 bg-${stat.color}-50`}>
                {stat.icon === 'clock' && <svg className={`w-6 h-6 text-${stat.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                {stat.icon === 'check' && <svg className={`w-6 h-6 text-${stat.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                {stat.icon === 'cash' && <svg className={`w-6 h-6 text-${stat.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-${stat.color}-100/50 text-${stat.color}-700`}>
                {stat.color === 'amber' ? 'Urgent' : 'Daily'}
              </span>
            </div>
            <p className={`text-3xl font-bold text-slate-900 tracking-tight ${stat.isCurrency ? 'text-2xl md:text-3xl' : ''}`}>{stat.value}</p>
            <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
            <p className="text-xs text-slate-400 mt-2 border-t border-slate-100 pt-2">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-100 p-6 shadow-sm hero-fade-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Financial Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Link
            to="/dashboard/cashier/pending"
            className="flex items-center p-4 rounded-xl border border-slate-100 bg-white hover:border-amber-200 hover:bg-amber-50/30 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mr-4 text-amber-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Verify Payments</p>
              <p className="text-xs text-slate-500">{stats.pendingVerification} items pending</p>
            </div>
            <svg className="w-5 h-5 ml-auto text-slate-300 group-hover:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>

          <Link
            to="/dashboard/cashier/travel-fees"
            className="flex items-center p-4 rounded-xl border border-slate-100 bg-white hover:border-purple-200 hover:bg-purple-50/30 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4 text-purple-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Travel Fees</p>
              <p className="text-xs text-slate-500">Collect & Verify</p>
            </div>
            <svg className="w-5 h-5 ml-auto text-slate-300 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>

          <Link
            to="/dashboard/cashier/payments"
            className="flex items-center p-4 rounded-xl border border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4 text-emerald-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Transaction History</p>
              <p className="text-xs text-slate-500">View all records</p>
            </div>
            <svg className="w-5 h-5 ml-auto text-slate-300 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;
