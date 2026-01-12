import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../../../api/services';

interface RevisionHistory {
  _id: string;
  feedback: string;
  requestedAt: string;
  resolvedAt?: string;
}

interface Project {
  _id: string;
  projectName?: string;
  title?: string;
  description?: string;
  status: string;
  category?: string;
  quotation?: {
    totalAmount?: number;
    laborCost?: number;
    materialCost?: number;
    estimatedDays?: number;
    breakdown?: Array<{
      item: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
  };
  blueprint?: {
    url?: string;
    fileName?: string;
    uploadedAt?: string;
    version?: number;
  };
  revisionHistory?: RevisionHistory[];
  createdAt: string;
  updatedAt?: string;
}

// Project category icons
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  gate: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21V7l9-4 9 4v14M3 21h18M9 21v-8h6v8M9 13h6M12 3v5" />
    </svg>
  ),
  railing: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8h16M4 8v8M20 8v8M8 8v8M12 8v8M16 8v8M4 16h16" />
    </svg>
  ),
  grills: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  door: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M5 21h14M12 11v2" />
    </svg>
  ),
  fence: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v16M8 4v16M12 4v16M16 4v16M20 4v16M2 8h20M2 16h20" />
    </svg>
  ),
  staircase: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h6v-6h6v-6h6V3" />
    </svg>
  ),
  furniture: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 21V8a2 2 0 00-2-2H6a2 2 0 00-2 2v13M4 21h16M4 11h16M8 21v-4M16 21v-4" />
    </svg>
  ),
  kitchen: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9h18M3 15h18M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zM8 9v6M12 9v6M16 9v6" />
    </svg>
  ),
  custom: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
};

const MyProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'blueprint' | 'quotation' | 'history'>('blueprint');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectApi.getMine();
      setProjects(response.data?.projects || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const openProjectDetail = (project: Project) => {
    setSelectedProject(project);
    setActiveTab('blueprint');
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProject(null);
  };

  const openRevisionModal = (project: Project) => {
    setSelectedProject(project);
    setRevisionFeedback('');
    setShowRevisionModal(true);
  };

  const closeRevisionModal = () => {
    setShowRevisionModal(false);
    setRevisionFeedback('');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      blueprint_pending: 'bg-purple-50 text-purple-700 border-purple-200',
      blueprint_uploaded: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      client_approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      client_rejected: 'bg-red-50 text-red-700 border-red-200',
      dp_pending: 'bg-amber-50 text-amber-700 border-amber-200',
      in_fabrication: 'bg-blue-50 text-blue-700 border-blue-200',
      fabrication_done: 'bg-teal-50 text-teal-700 border-teal-200',
      ready_for_pickup: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      released: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getProgress = (status: string): number => {
    const progressMap: Record<string, number> = {
      blueprint_pending: 10,
      blueprint_uploaded: 25,
      client_approved: 35,
      client_rejected: 25,
      dp_pending: 45,
      in_fabrication: 65,
      fabrication_done: 85,
      ready_for_pickup: 95,
      released: 100,
    };
    return progressMap[status] || 0;
  };

  const getNextAction = (status: string): string | null => {
    const actions: Record<string, string> = {
      blueprint_uploaded: 'Review and approve the blueprint',
      dp_pending: 'Pay 30% downpayment to start fabrication',
      fabrication_done: 'Pay 40% progress payment',
      ready_for_pickup: 'Pay final 30% and arrange pickup',
    };
    return actions[status] || null;
  };

  const handleApproveBlueprint = async (projectId: string) => {
    if (!confirm('Are you sure you want to approve this design? Once approved, fabrication will begin after payment.')) {
      return;
    }
    setSubmitting(true);
    try {
      await projectApi.reviewBlueprint(projectId, { approved: true });
      fetchProjects();
      closeDetailModal();
    } catch (error) {
      console.error('Failed to approve blueprint:', error);
      alert('Failed to approve design. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectBlueprint = async (projectId: string) => {
    if (!revisionFeedback.trim()) {
      alert('Please provide feedback on what needs to be revised.');
      return;
    }
    setSubmitting(true);
    try {
      await projectApi.reviewBlueprint(projectId, { 
        approved: false, 
        feedback: revisionFeedback.trim() 
      });
      fetchProjects();
      closeRevisionModal();
      closeDetailModal();
    } catch (error) {
      console.error('Failed to reject blueprint:', error);
      alert('Failed to request revision. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryIcon = (category?: string) => {
    return CATEGORY_ICONS[category || 'custom'] || CATEGORY_ICONS.custom;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Projects</h1>
        <p className="text-slate-500 mt-1">Track progress and manage your fabrication projects</p>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No projects yet</h3>
          <p className="text-slate-500 mb-6">
            Your projects will appear here after your consultation is complete.
          </p>
          <Link
            to="/dashboard/customer/appointments/new"
            className="inline-flex items-center text-slate-900 font-medium hover:underline"
          >
            Book a consultation to get started →
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {projects.map((project) => {
            const progress = getProgress(project.status);
            const nextAction = getNextAction(project.status);
            const needsReview = project.status === 'blueprint_uploaded';

            return (
              <div
                key={project._id}
                className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                  needsReview 
                    ? 'border-indigo-200 ring-2 ring-indigo-100' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                {/* Action Required Banner */}
                {needsReview && (
                  <div className="bg-indigo-600 text-white px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-sm font-medium">Design Ready for Review</span>
                    </div>
                  </div>
                )}

                <div className="p-4 md:p-6">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`p-2.5 rounded-xl ${needsReview ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                      {getCategoryIcon(project.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {project.projectName || project.title || 'Untitled Project'}
                      </h3>
                      <p className="text-sm text-slate-500 capitalize">
                        {project.category?.replace(/_/g, ' ') || 'Custom Fabrication'}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border whitespace-nowrap ${getStatusColor(project.status)}`}>
                      {formatStatus(project.status)}
                    </span>
                  </div>

                  {project.description && (
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-medium text-slate-900">{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-slate-700 to-slate-900 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Total Cost</p>
                      <p className="font-semibold text-slate-900 mt-1">
                        {project.quotation?.totalAmount 
                          ? `₱${project.quotation.totalAmount.toLocaleString()}`
                          : 'Pending'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Timeline</p>
                      <p className="font-semibold text-slate-900 mt-1">
                        {project.quotation?.estimatedDays 
                          ? `${project.quotation.estimatedDays} days`
                          : 'TBD'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Next Action Alert */}
                  {nextAction && !needsReview && (
                    <div className="mt-4 p-3 md:p-4 bg-amber-50 border border-amber-100 rounded-xl">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-sm text-amber-800">{nextAction}</p>
                      </div>
                    </div>
                  )}

                  {/* Blueprint Actions - Mobile Optimized */}
                  {needsReview && (
                    <div className="mt-4 space-y-3">
                      <button
                        onClick={() => openProjectDetail(project)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Blueprint & Quotation
                      </button>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleApproveBlueprint(project._id)}
                          disabled={submitting}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </button>
                        <button
                          onClick={() => openRevisionModal(project)}
                          disabled={submitting}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Revise
                        </button>
                      </div>
                    </div>
                  )}

                  {/* View Details Button for non-review projects */}
                  {!needsReview && project.blueprint?.url && (
                    <button
                      onClick={() => openProjectDetail(project)}
                      className="mt-4 w-full flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Project Details
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Detail Modal */}
      {showDetailModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeDetailModal} />
          <div className="relative bg-white w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                  {getCategoryIcon(selectedProject.category)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {selectedProject.projectName || selectedProject.title || 'Project Details'}
                  </h2>
                  <p className="text-sm text-slate-500 capitalize">
                    {selectedProject.category?.replace(/_/g, ' ') || 'Custom Fabrication'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeDetailModal}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 px-4 md:px-6">
              <button
                onClick={() => setActiveTab('blueprint')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'blueprint'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Blueprint
              </button>
              <button
                onClick={() => setActiveTab('quotation')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'quotation'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Quotation
              </button>
              {(selectedProject.revisionHistory?.length || 0) > 0 && (
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'history'
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  History ({selectedProject.revisionHistory?.length})
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Blueprint Tab */}
              {activeTab === 'blueprint' && (
                <div className="space-y-4">
                  {selectedProject.blueprint?.url ? (
                    <>
                      <div className="aspect-[4/3] bg-slate-100 rounded-xl overflow-hidden">
                        {selectedProject.blueprint.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <img
                            src={selectedProject.blueprint.url}
                            alt="Blueprint"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <iframe
                            src={selectedProject.blueprint.url}
                            className="w-full h-full"
                            title="Blueprint Document"
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {selectedProject.blueprint.fileName || 'Blueprint Document'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {selectedProject.blueprint.version 
                              ? `Version ${selectedProject.blueprint.version}`
                              : 'Current Version'
                            }
                            {selectedProject.blueprint.uploadedAt && (
                              <> • Uploaded {formatDate(selectedProject.blueprint.uploadedAt)}</>
                            )}
                          </p>
                        </div>
                        <a
                          href={selectedProject.blueprint.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Open
                        </a>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">Blueprint Pending</h3>
                      <p className="text-sm text-slate-500">
                        Our engineer is working on your design. You'll be notified when it's ready.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Quotation Tab */}
              {activeTab === 'quotation' && (
                <div className="space-y-4">
                  {selectedProject.quotation?.totalAmount ? (
                    <>
                      {/* Cost Breakdown */}
                      {selectedProject.quotation.breakdown && selectedProject.quotation.breakdown.length > 0 && (
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                            <h4 className="font-medium text-slate-900">Cost Breakdown</h4>
                          </div>
                          <div className="divide-y divide-slate-100">
                            {selectedProject.quotation.breakdown.map((item, index) => (
                              <div key={index} className="px-4 py-3 flex justify-between items-center">
                                <div>
                                  <p className="text-sm font-medium text-slate-900">{item.item}</p>
                                  <p className="text-xs text-slate-500">
                                    {item.quantity} × ₱{item.unitPrice.toLocaleString()}
                                  </p>
                                </div>
                                <p className="font-medium text-slate-900">
                                  ₱{item.total.toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Summary */}
                      <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3">
                        {selectedProject.quotation.materialCost && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Materials</span>
                            <span>₱{selectedProject.quotation.materialCost.toLocaleString()}</span>
                          </div>
                        )}
                        {selectedProject.quotation.laborCost && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Labor</span>
                            <span>₱{selectedProject.quotation.laborCost.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-3 border-t border-slate-700">
                          <span className="font-medium">Total</span>
                          <span className="text-xl font-bold">
                            ₱{selectedProject.quotation.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Payment Schedule */}
                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <h4 className="font-medium text-blue-900 mb-3">Payment Schedule (30-40-30)</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-700">1. Initial Payment (30%)</span>
                            <span className="font-medium text-blue-900">
                              ₱{Math.round(selectedProject.quotation.totalAmount * 0.3).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-700">2. Midpoint Payment (40%)</span>
                            <span className="font-medium text-blue-900">
                              ₱{Math.round(selectedProject.quotation.totalAmount * 0.4).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-700">3. Final Payment (30%)</span>
                            <span className="font-medium text-blue-900">
                              ₱{Math.round(selectedProject.quotation.totalAmount * 0.3).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      {selectedProject.quotation.estimatedDays && (
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                          <div className="p-2 bg-slate-200 rounded-lg">
                            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">Estimated Timeline</p>
                            <p className="text-sm text-slate-500">{selectedProject.quotation.estimatedDays} working days</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">Quotation Pending</h3>
                      <p className="text-sm text-slate-500">
                        Cost estimate will be available once the blueprint is complete.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Revision History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  {selectedProject.revisionHistory && selectedProject.revisionHistory.length > 0 ? (
                    <div className="space-y-3">
                      {selectedProject.revisionHistory.map((revision, index) => (
                        <div key={revision._id || index} className="p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${revision.resolvedAt ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                              {revision.resolvedAt ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  revision.resolvedAt 
                                    ? 'bg-emerald-100 text-emerald-700' 
                                    : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {revision.resolvedAt ? 'Resolved' : 'Pending'}
                                </span>
                                <span className="text-xs text-slate-500">
                                  Revision #{selectedProject.revisionHistory!.length - index}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700">{revision.feedback}</p>
                              <p className="text-xs text-slate-400 mt-2">
                                Requested: {formatDate(revision.requestedAt)}
                                {revision.resolvedAt && (
                                  <> • Resolved: {formatDate(revision.resolvedAt)}</>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-slate-500">No revision history</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions for blueprint review */}
            {selectedProject.status === 'blueprint_uploaded' && (
              <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50">
                <div className="flex gap-3">
                  <button
                    onClick={() => openRevisionModal(selectedProject)}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Request Revision
                  </button>
                  <button
                    onClick={() => handleApproveBlueprint(selectedProject._id)}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    Approve Design
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Revision Request Modal */}
      {showRevisionModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeRevisionModal} />
          <div className="relative bg-white w-full md:max-w-md md:rounded-2xl rounded-t-2xl">
            <div className="p-4 md:p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Request Revision</h2>
                <button
                  onClick={closeRevisionModal}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <p className="text-sm text-slate-600 mb-4">
                Please describe what changes you'd like to make to the design. Be as specific as possible.
              </p>
              <textarea
                value={revisionFeedback}
                onChange={(e) => setRevisionFeedback(e.target.value)}
                placeholder="e.g., Please make the gate 2 inches taller and add decorative scrollwork at the top..."
                rows={5}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
              />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={closeRevisionModal}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectBlueprint(selectedProject._id)}
                  disabled={submitting || !revisionFeedback.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProjects;
