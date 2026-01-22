import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ChevronDown, Check } from 'lucide-react';
import { projectApi } from '../../../api/services';
import toast from 'react-hot-toast';

interface Project {
  _id: string;
  title: string;
  projectName?: string;
  category: string;
  status: string;
  designFeeStatus?: string;
  designFeePaid?: boolean;
  customer: {
    _id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  assignedStaff?: {
    engineer?: {
      _id: string;
    } | null;
  };
  siteAddress?: {
    street?: string;
    city?: string;
    province?: string;
  };
  blueprint?: {
    currentVersion: number;
  };
  costing?: {
    currentVersion: number;
    approvedAmount?: number;
  };
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending_blueprint: { label: 'Need Blueprint', color: 'text-amber-700', bg: 'bg-amber-100' },
  pending_costing: { label: 'Need Costing', color: 'text-orange-700', bg: 'bg-orange-100' },
  pending_customer_approval: { label: 'Awaiting Customer', color: 'text-indigo-700', bg: 'bg-indigo-100' },
  approved: { label: 'Approved', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  fabrication: { label: 'In Fabrication', color: 'text-cyan-700', bg: 'bg-cyan-100' },
  revision_requested: { label: 'Revision Needed', color: 'text-red-700', bg: 'bg-red-100' },
  completed: { label: 'Completed', color: 'text-slate-700', bg: 'bg-slate-100' },
};

const EngineerProjects: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [accepting, setAccepting] = useState<string | null>(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Get status filter from URL params
  const statusFilter = searchParams.get('status') || '';

  // Sync with URL changes
  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      
      const response = await projectApi.getAll(params);
      setProjects(response.data?.projects || response.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptProject = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setAccepting(projectId);
    try {
      await projectApi.acceptProject(projectId);
      toast.success('Project accepted successfully!');
      fetchProjects();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to accept project');
    } finally {
      setAccepting(null);
    }
  };

  const handleFilterChange = (status: string) => {
    if (status) {
      setSearchParams({ status });
    } else {
      setSearchParams({});
    }
  };

  const filteredProjects = projects.filter((project) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    const name = project.projectName || project.title || '';
    const customerName = `${project.customer?.profile?.firstName || ''} ${project.customer?.profile?.lastName || ''}`;
    return name.toLowerCase().includes(search) || customerName.toLowerCase().includes(search);
  });

  // Helper to get page title based on filter
  const getPageTitle = () => {
    switch (statusFilter) {
      case 'pending_blueprint': return 'Need Blueprint';
      case 'pending_costing': return 'Need Costing';
      case 'pending_customer_approval': return 'Awaiting Customer Approval';
      case 'revision_requested': return 'Revisions Required';
      case 'approved': return 'Approved Projects';
      case 'fabrication': return 'In Fabrication';
      default: return 'All Projects';
    }
  };

  const getPageDescription = () => {
    switch (statusFilter) {
      case 'pending_blueprint': return 'Projects waiting for CAD blueprint creation';
      case 'pending_costing': return 'Projects needing cost estimation';
      case 'pending_customer_approval': return 'Projects submitted to customers for approval';
      case 'revision_requested': return 'Projects requiring revisions per customer feedback';
      case 'approved': return 'Projects approved by customers, ready for fabrication';
      default: return 'Manage blueprints, costing, and project approvals';
    }
  };

  // Stats
  const pendingBlueprint = projects.filter((p) => p.status === 'pending_blueprint').length;
  const pendingCosting = projects.filter((p) => p.status === 'pending_costing').length;
  const awaitingApproval = projects.filter((p) => p.status === 'pending_customer_approval').length;
  const revisionNeeded = projects.filter((p) => p.status === 'revision_requested').length;

  const getStatusLabel = (val: string) => {
    switch (val) {
      case 'pending_blueprint': return 'Pending Blueprint';
      case 'pending_costing': return 'Pending Costing';
      case 'pending_owner_approval': return 'Awaiting Owner Approval';
      case 'pending_customer_approval': return 'Awaiting Customer';
      case 'revision_requested': return 'Revision Needed';
      case 'approved': return 'Approved';
      case 'fabrication': return 'In Fabrication';
      default: return 'All Status';
    }
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending_blueprint', label: 'Pending Blueprint' },
    { value: 'pending_costing', label: 'Pending Costing' },
    { value: 'pending_owner_approval', label: 'Awaiting Owner Approval' },
    { value: 'pending_customer_approval', label: 'Awaiting Customer' },
    { value: 'revision_requested', label: 'Revision Needed' },
    { value: 'approved', label: 'Approved' },
    { value: 'fabrication', label: 'In Fabrication' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-indigo-50/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 w-64 h-64 bg-amber-50/30 rounded-full blur-3xl" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hero-fade-up">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              {getPageTitle()}
            </h1>
            {statusFilter && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium uppercase tracking-wider">
                Filtered
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm">
            {getPageDescription()}
          </p>
          {statusFilter && (
            <button
              onClick={() => setSearchParams({})}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium mt-1 inline-flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear filter
            </button>
          )}
        </div>
        <Link
          to="/dashboard/engineer"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          
          
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 hero-fade-up" style={{ animationDelay: '0.1s' }}>
        {[
          { label: 'Pending Blueprint', value: pendingBlueprint, color: 'amber' },
          { label: 'Pending Costing', value: pendingCosting, color: 'orange' },
          { label: 'Awaiting Approval', value: awaitingApproval, color: 'indigo' },
          { label: 'Needs Revision', value: revisionNeeded, color: 'red' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-${stat.color}-100/50 shadow-sm`}
          >
            <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white shadow-sm hero-fade-up relative z-30" style={{ animationDelay: '0.2s' }}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search projects or customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
          <div className="relative min-w-[240px]">
            <button
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              onBlur={() => setTimeout(() => setIsStatusOpen(false), 200)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            >
              <span className="truncate">{getStatusLabel(statusFilter)}</span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`absolute right-0 top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden text-sm font-medium transition-all duration-200 origin-top ring-1 ring-slate-900/5 ${isStatusOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
              <div className="p-1.5 space-y-0.5">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleFilterChange(option.value);
                      setIsStatusOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                      statusFilter === option.value 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {statusFilter === option.value && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4 hero-fade-up" style={{ animationDelay: '0.3s' }}>
        {filteredProjects.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 border border-white shadow-sm text-center">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No projects found</h3>
            <p className="text-sm text-slate-500">
              {statusFilter ? 'Try changing the filter or search query' : 'No projects assigned to you yet'}
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const config = statusConfig[project.status] || { label: project.status, color: 'text-slate-700', bg: 'bg-slate-100' };
            const isUnassigned = !project.assignedStaff?.engineer;
            const designFeePaid = project.designFeePaid ?? false;
            
            return (
              <div
                key={project._id}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white shadow-sm hover:shadow-lg transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {designFeePaid ? (
                    <Link to={`/dashboard/engineer/project/${project._id}`} className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {project.projectName || project.title || 'Untitled Project'}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                        {!designFeePaid && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            Design Fee Pending
                          </span>
                        )}
                        {isUnassigned && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Unassigned
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {project.customer?.profile?.firstName} {project.customer?.profile?.lastName}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {project.category || 'Uncategorized'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {format(new Date(project.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex-1 opacity-70 cursor-not-allowed">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {project.projectName || project.title || 'Untitled Project'}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          Design Fee Pending
                        </span>
                        {isUnassigned && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Unassigned
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {project.customer?.profile?.firstName} {project.customer?.profile?.lastName}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {project.category || 'Uncategorized'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {format(new Date(project.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    {/* Progress Indicators */}
                    <div className="hidden md:flex items-center gap-4 text-center">
                      <div>
                        <p className={`text-lg font-bold ${project.blueprint?.currentVersion ? 'text-emerald-600' : 'text-slate-300'}`}>
                          {project.blueprint?.currentVersion ? `v${project.blueprint.currentVersion}` : '—'}
                        </p>
                        <p className="text-xs text-slate-500">Blueprint</p>
                      </div>
                      <div>
                        <p className={`text-lg font-bold ${project.costing?.currentVersion ? 'text-emerald-600' : 'text-slate-300'}`}>
                          {project.costing?.currentVersion ? `v${project.costing.currentVersion}` : '—'}
                        </p>
                        <p className="text-xs text-slate-500">Costing</p>
                      </div>
                    </div>
                    {/* Accept Button for Unassigned */}
                    {isUnassigned && project.status === 'pending_blueprint' ? (
                      <button
                        onClick={(e) => handleAcceptProject(e, project._id)}
                        disabled={accepting === project._id}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm disabled:opacity-60"
                      >
                        {accepting === project._id ? 'Accepting...' : 'Accept Project'}
                      </button>
                    ) : designFeePaid ? (
                      <Link
                        to={`/dashboard/engineer/project/${project._id}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        View Details
                        <svg
                          className="w-4 h-4 group-hover:translate-x-1 transition-all"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ) : (
                      <span className="px-4 py-2 text-sm text-slate-400 font-medium cursor-not-allowed">
                        Design fee required
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EngineerProjects;
