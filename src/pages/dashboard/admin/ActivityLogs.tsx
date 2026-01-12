import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { adminApi } from '../../../api/services';
import toast from 'react-hot-toast';

interface ActivityLog {
  _id: string;
  userId?: {
    _id: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  };
  action: string;
  resource?: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-emerald-100 text-emerald-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  login: 'bg-emerald-100 text-emerald-700',
  logout: 'bg-amber-100 text-amber-700',
  verify: 'bg-emerald-100 text-emerald-700',
  reject: 'bg-red-100 text-red-700',
  approve: 'bg-emerald-100 text-emerald-700',
  upload: 'bg-purple-100 text-purple-700',
};

const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, actionFilter, resourceFilter, dateFilter]);

  const fetchLogs = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await adminApi.getActivityLogs({
        page: currentPage,
        limit: 20,
        action: actionFilter || undefined,
        resourceType: resourceFilter || undefined,
        startDate: dateFilter || undefined,
      });
      const data = response.data || response;
      setLogs(data.logs || []);
      setTotalPages(Math.ceil((data.total || 0) / 20));
    } catch (error) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('login') || action.includes('logout')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    }
    if (action.includes('create') || action.includes('upload')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      );
    }
    if (action.includes('update') || action.includes('edit')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
    }
    if (action.includes('delete')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    const firstName = log.userId?.profile?.firstName || log.userId?.firstName || '';
    const lastName = log.userId?.profile?.lastName || log.userId?.lastName || '';
    return (
      firstName.toLowerCase().includes(search) ||
      lastName.toLowerCase().includes(search) ||
      log.userId?.email?.toLowerCase().includes(search) ||
      log.action?.toLowerCase().includes(search) ||
      (log.resource || log.resourceType)?.toLowerCase().includes(search)
    );
  });

  const todayLogs = logs.filter(
    (log) => format(new Date(log.createdAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );
  const loginCount = logs.filter((log) => log.action === 'login').length;
  const criticalCount = logs.filter((log) => ['delete', 'reject'].includes(log.action)).length;

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-900 border-t-transparent mx-auto"></div>
          <p className="text-slate-500 mt-4">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Activity Logs</h1>
          <p className="text-slate-500 text-sm md:text-base mt-1">Monitor system activity and user actions</p>
        </div>
        <button
          onClick={() => fetchLogs(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          <svg className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-5 border border-slate-100">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{logs.length}</p>
          <p className="text-xs md:text-sm text-slate-500 mt-1">Total Logs</p>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-5 border border-slate-100">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{todayLogs.length}</p>
          <p className="text-xs md:text-sm text-slate-500 mt-1">Today</p>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-5 border border-slate-100">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{loginCount}</p>
          <p className="text-xs md:text-sm text-slate-500 mt-1">Logins</p>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-5 border border-slate-100">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{criticalCount}</p>
          <p className="text-xs md:text-sm text-slate-500 mt-1">Critical Actions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by user, action, or resource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
            className="w-full md:w-40 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          >
            <option value="">All Actions</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="verify">Verify</option>
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
            <option value="upload">Upload</option>
          </select>
          <select
            value={resourceFilter}
            onChange={(e) => { setResourceFilter(e.target.value); setCurrentPage(1); }}
            className="w-full md:w-40 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          >
            <option value="">All Resources</option>
            <option value="user">Users</option>
            <option value="appointment">Appointments</option>
            <option value="project">Projects</option>
            <option value="payment">Payments</option>
            <option value="auth">Authentication</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
            className="w-full md:w-40 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          />
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-4 md:p-5 border-b border-slate-100">
          <h2 className="text-base md:text-lg font-semibold text-slate-900">Activity Log</h2>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Resource</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-slate-500">No activity logs found</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const firstName = log.userId?.profile?.firstName || log.userId?.firstName || 'System';
                  const lastName = log.userId?.profile?.lastName || log.userId?.lastName || '';
                  const resource = log.resource || log.resourceType || '-';
                  
                  return (
                    <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-slate-900 text-sm">{format(new Date(log.createdAt), 'MMM d, yyyy')}</p>
                        <p className="text-slate-500 text-xs">{format(new Date(log.createdAt), 'h:mm:ss a')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-medium text-xs">
                            {firstName[0]}{lastName[0] || ''}
                          </div>
                          <div>
                            <p className="text-slate-900 text-sm">{firstName} {lastName}</p>
                            <p className="text-slate-500 text-xs capitalize">{log.userId?.role || 'system'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-700'}`}>
                          {getActionIcon(log.action)}
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-700 text-sm capitalize">{resource}</span>
                        {log.resourceId && (
                          <p className="text-slate-400 text-xs font-mono">...{log.resourceId.slice(-8)}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-500 text-sm max-w-xs truncate">
                          {log.details ? JSON.stringify(log.details).slice(0, 50) : '-'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-400 text-sm font-mono">{log.ipAddress || '-'}</p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-500">No activity logs found</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const firstName = log.userId?.profile?.firstName || log.userId?.firstName || 'System';
              const lastName = log.userId?.profile?.lastName || log.userId?.lastName || '';
              const resource = log.resource || log.resourceType || '-';
              
              return (
                <div key={log._id} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-medium text-xs">
                        {firstName[0]}{lastName[0] || ''}
                      </div>
                      <div>
                        <p className="text-slate-900 text-sm font-medium">{firstName} {lastName}</p>
                        <p className="text-slate-500 text-xs">{format(new Date(log.createdAt), 'MMM d, h:mm a')}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-700'}`}>
                      {log.action}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm">
                    <span className="capitalize">{resource}</span>
                    {log.resourceId && <span className="text-slate-400 font-mono text-xs ml-1">...{log.resourceId.slice(-6)}</span>}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-slate-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
