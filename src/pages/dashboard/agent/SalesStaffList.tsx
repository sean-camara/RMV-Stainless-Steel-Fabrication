import React, { useState, useEffect } from 'react';
import { userApi } from '../../../api/services';
import { Search, Users, Mail, Phone, Calendar, Briefcase, RefreshCw, User, Award, TrendingUp } from 'lucide-react';

interface SalesStaff {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  role?: string;
}

const SalesStaffList: React.FC = () => {
  const [staff, setStaff] = useState<SalesStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getByRole('sales_staff');
      // API returns { success, data: { users } }
      const staffList = response?.data?.users || response?.users || (Array.isArray(response) ? response : []);
      setStaff(staffList);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sales staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = staff.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || member.email.toLowerCase().includes(search);
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 min-h-screen p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 -z-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/25">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Sales Staff</h1>
                <p className="text-slate-500 text-sm mt-0.5">
                  View and manage sales team members
                </p>
              </div>
            </div>
            <button
              onClick={fetchStaff}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-sm transition-all duration-200 border border-slate-200 hover:border-slate-300 disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Directory
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Staff</p>
                <p className="text-3xl font-bold text-slate-800">{staff.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Briefcase className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Today</p>
                <p className="text-3xl font-bold text-slate-800">{staff.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Top Performer</p>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">--</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Staff List */}
        {loading ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white p-16 shadow-sm flex flex-col items-center justify-center">
             <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
             <p className="text-slate-500 font-medium animate-pulse">Loading staff directory...</p>
          </div>
        ) : error ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-red-100 p-12 shadow-sm text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Failed to load staff list</h3>
              <p className="text-slate-500 mb-6">{error}</p>
              <button
                onClick={fetchStaff}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all hover:shadow-lg shadow-indigo-200"
              >
                Try Again
              </button>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white p-16 shadow-sm text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-slate-300" />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">No results found</h3>
             <p className="text-slate-500">
               {searchTerm ? `No staff members matching "${searchTerm}"` : 'No sales staff registered in the system.'}
             </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((member) => (
              <div
                key={member._id}
                className="group bg-white/70 backdrop-blur-sm rounded-2xl border border-white p-5 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                        {member.avatar ? (
                        <img
                            src={member.avatar}
                            alt={`${member.firstName} ${member.lastName}`}
                            className="w-full h-full object-cover rounded-2xl"
                        />
                        ) : (
                        <span className="text-xl font-bold text-white tracking-widest">
                            {member.firstName?.[0]}{member.lastName?.[0]}
                        </span>
                        )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="font-bold text-lg text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                      {member.firstName} {member.lastName}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                       Sales Representative
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50/50 p-2 rounded-lg border border-transparent hover:border-slate-100 transition-colors">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="truncate font-medium">{member.email}</span>
                    </div>
                    {member.phone && (
                        <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50/50 p-2 rounded-lg border border-transparent hover:border-slate-100 transition-colors">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{member.phone}</span>
                        </div>
                    )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joined</span>
                     <span className="text-xs font-bold text-slate-700">{formatDate(member.createdAt)}</span>
                  </div>
                  <button className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors">
                      <TrendingUp className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesStaffList;
