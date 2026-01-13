import React, { useState, useEffect } from 'react';
import { projectApi } from '../../../api/services';
import { useNotification } from '../../../contexts/NotificationContext';

interface Project {
  _id: string;
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  title?: string;
  category: string;
  status: string;
  quotation?: {
    materialCost: number;
    laborCost: number;
    total: number;
  };
  fabrication?: {
    progress: number;
  };
  createdAt: string;
}

const AdminProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { notify } = useNotification();

  useEffect(() => {
    fetchProjects();
  }, [page, statusFilter]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await projectApi.getAll({
        page,
        limit: 10,
        status: statusFilter || undefined,
      });
      const data = response?.data || response;
      setProjects(data.projects || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching projects:', error);
      notify({ type: 'error', title: 'Projects unavailable', message: 'Could not load projects list' });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      consultation: 'bg-blue-50 text-blue-700 border-blue-200',
      pending_blueprint: 'bg-purple-50 text-purple-700 border-purple-200',
      pending_approval: 'bg-amber-50 text-amber-700 border-amber-200',
      awaiting_payment: 'bg-orange-50 text-orange-700 border-orange-200',
      in_fabrication: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border ${styles[status] || 'bg-slate-50 text-slate-600'}`}>
        {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredProjects = projects.filter(project => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      project.customer?.firstName?.toLowerCase().includes(search) ||
      project.customer?.lastName?.toLowerCase().includes(search) ||
      project.title?.toLowerCase().includes(search) ||
      project.category?.toLowerCase().includes(search)
    );
  });

  const stats = {
    total: projects.length,
    active: projects.filter(p => !['completed', 'cancelled'].includes(p.status)).length,
    fabrication: projects.filter(p => p.status === 'in_fabrication').length,
    completed: projects.filter(p => p.status === 'completed').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 text-sm md:text-base mt-1">Manage all customer projects</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-lg md:rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Total Projects</p>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 rounded-lg md:rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.active}</p>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Active</p>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-50 rounded-lg md:rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.fabrication}</p>
          <p className="text-slate-500 text-xs md:text-sm mt-1">In Fabrication</p>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-lg md:rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.completed}</p>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Completed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by customer, title, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rmv-select w-full sm:w-48"
          >
            <option value="">All Statuses</option>
            <option value="consultation">Consultation</option>
            <option value="pending_blueprint">Pending Blueprint</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="awaiting_payment">Awaiting Payment</option>
            <option value="in_fabrication">In Fabrication</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 overflow-hidden">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 md:py-20">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-semibold text-slate-900">No projects found</h3>
            <p className="text-slate-500 text-xs md:text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Project</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Quotation</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Progress</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProjects.map((project) => (
                    <tr key={project._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{project.title || 'Untitled Project'}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{project.customer?.firstName} {project.customer?.lastName}</p>
                          <p className="text-sm text-slate-500">{project.customer?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-700">
                          {project.category || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(project.status)}</td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900">
                          {formatCurrency(project.quotation?.total)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-slate-900 rounded-full transition-all"
                              style={{ width: `${project.fabrication?.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-600 w-10">
                            {project.fabrication?.progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filteredProjects.map((project) => (
                <div key={project._id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-slate-900">{project.title || 'Untitled Project'}</p>
                      <p className="text-sm text-slate-500">{project.customer?.firstName} {project.customer?.lastName}</p>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-slate-600 mb-3">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{project.category}</span>
                    <span>• {formatCurrency(project.quotation?.total)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-900 rounded-full"
                        style={{ width: `${project.fabrication?.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-600">{project.fabrication?.progress || 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProjects;
