import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min?url';
import { projectApi } from '../../../api/services';

interface RevisionHistory {
  _id: string;
  feedback: string;
  requestedAt: string;
  resolvedAt?: string;
}

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

interface BlueprintVersion {
  version: number;
  filename: string;
  originalName: string;
  path: string;
  uploadedAt: string;
  notes?: string;
}

interface CostingVersion {
  version: number;
  filename: string;
  originalName: string;
  path: string;
  uploadedAt: string;
  totalAmount?: number;
  breakdown?: Array<{
    item: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  notes?: string;
}

interface Project {
  _id: string;
  projectName?: string;
  title?: string; // Fallback
  name?: string; // Fallback
  description?: string;
  status: string;
  category?: string;
  blueprint?: {
    currentVersion: number;
    versions?: BlueprintVersion[];
    url?: string; // Helper for legacy/direct url
  };
  costing?: {
    currentVersion: number;
    versions?: CostingVersion[];
    approvedAmount?: number;
  };
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363 1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
};

const MyProjects: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<'staged' | 'full'>('staged');
  const [activeTab, setActiveTab] = useState<'blueprint' | 'quotation' | 'history'>('blueprint');
  const [pdfPageCount, setPdfPageCount] = useState<number>(0);
  const pdfOptions = useMemo(() => ({ withCredentials: true }), []);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    // If there's an ID in the URL and we have projects loaded, open that project
    if (id && projects.length > 0) {
      const project = projects.find(p => p._id === id);
      if (project) {
        openProjectDetail(project);
      }
    }
  }, [id, projects]);

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
    if (window.location.pathname !== `/dashboard/customer/projects/${project._id}`) {
      navigate(`/dashboard/customer/projects/${project._id}`, { replace: true });
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProject(null);
    navigate('/dashboard/customer/projects', { replace: true });
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

  const openApproveModal = () => {
    setPaymentPlan('staged');
    setShowApproveModal(true);
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
       case 'client_approved':
       case 'customer_approved':
       case 'approved':
       case 'released':
         return 'bg-emerald-50 text-emerald-700 border-emerald-200';
       case 'blueprint_uploaded':
       case 'pending_customer_approval':
         return 'bg-slate-900 text-white border-slate-900'; // Critical Action
       case 'client_rejected':
       case 'cancelled':
         return 'bg-red-50 text-red-700 border-red-200';
       case 'in_fabrication':
         return 'bg-blue-50 text-blue-700 border-blue-200';
       case 'ready_for_pickup':
       case 'fabrication_done':
         return 'bg-teal-50 text-teal-700 border-teal-200';
       default:
         return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getProgress = (status: string): number => {
    const progressMap: Record<string, number> = {
      blueprint_pending: 10,
      pending_blueprint: 10,
      blueprint_uploaded: 25,
      pending_customer_approval: 25,
      client_approved: 35,
      customer_approved: 35,
      approved: 45,
      pending_initial_payment: 45,
      pending_full_payment: 45,
      client_rejected: 25,
      dp_pending: 45,
      in_fabrication: 65,
      fabrication_done: 85,
      ready_for_pickup: 95,
      released: 100,
    };
    return progressMap[status] || 0;
  };

  const handleApproveBlueprint = async (projectId: string) => {
    setSubmitting(true);
    try {
      await projectApi.reviewBlueprint(projectId, { approved: true, paymentPlan });
      fetchProjects();
      closeDetailModal();
      setShowApproveModal(false);
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
    });
  };

  const getCategoryIcon = (category?: string) => {
    return CATEGORY_ICONS[category || 'custom'] || CATEGORY_ICONS.custom;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Projects</h1>
        <p className="text-slate-500 mt-1 text-sm">Track progress and manage your fabrication projects</p>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-slate-900 mb-1">No projects yet</h3>
          <p className="text-sm text-slate-500 mb-4">
            Projects will appear here after your consultation.
          </p>
          <Link
            to="/dashboard/customer/appointments/new"
            className="inline-flex items-center text-slate-900 font-semibold text-sm hover:underline"
          >
            Book a consultation →
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
          {projects.map((project) => {
            const progress = getProgress(project.status);
            const needsReview = project.status === 'blueprint_uploaded' || project.status === 'pending_customer_approval';

            return (
              <div
                key={project._id}
                className={`bg-white rounded-xl border overflow-hidden transition-all hover:shadow-sm ${
                  needsReview 
                    ? 'border-slate-900 ring-1 ring-slate-900' 
                    : 'border-slate-200'
                }`}
              >
                {/* Review Banner */}
                {needsReview && (
                  <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide">Action Required</span>
                    <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">Review Design</span>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 border border-slate-100">
                        {getCategoryIcon(project.category)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-base leading-snug truncate max-w-[200px]">
                          {project.projectName || project.title || project.name || 'Untitled Project'}
                        </h3>
                        <p className="text-xs text-slate-500 capitalize">
                          {project.category?.replace(/_/g, ' ') || 'Custom Job'}
                        </p>
                      </div>
                    </div>
                     <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusStyle(project.status)}`}>
                      {formatStatus(project.status)}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">Completion</span>
                      <span className="text-slate-900 font-bold">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-3 border-t border-slate-100 mb-3">
                    <div>
                        <span className="block text-slate-400 mb-0.5">Estimated Cost</span>
                        <span className="font-semibold text-slate-900">
                           {project.quotation?.totalAmount ? `₱${project.quotation.totalAmount.toLocaleString()}` : 'Top be calculated'}
                        </span>
                    </div>
                     <div>
                        <span className="block text-slate-400 mb-0.5">Timeline</span>
                        <span className="font-semibold text-slate-900">
                           {project.quotation?.estimatedDays ? `${project.quotation.estimatedDays} days` : '--'}
                        </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {needsReview ? (
                    <button
                        onClick={() => openProjectDetail(project)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                      >
                        Review Blueprints
                    </button>
                  ) : (
                    <button
                      onClick={() => openProjectDetail(project)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 bg-white rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Detail Modal */}
      {showDetailModal && selectedProject && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closeDetailModal} />
          <div className="relative bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-lg text-slate-600">
                    {getCategoryIcon(selectedProject.category)}
                 </div>
                 <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {selectedProject.projectName || selectedProject.title || 'Project Details'}
                    </h2>
                    <p className="text-xs text-slate-500 capitalize">
                      {selectedProject.category?.replace(/_/g, ' ') || 'Custom Project'}
                    </p>
                 </div>
              </div>
              <button
                onClick={closeDetailModal}
                className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 px-4 bg-slate-50/50">
              <button
                onClick={() => setActiveTab('blueprint')}
                className={`mr-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'blueprint'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Blueprints & Design
              </button>
              <button
                onClick={() => setActiveTab('quotation')}
                className={`mr-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'quotation'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Costs & Timeline
              </button>
              {(selectedProject.revisionHistory?.length || 0) > 0 && (
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'history'
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  History ({selectedProject.revisionHistory?.length})
                </button>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {/* Blueprint Tab */}
              {activeTab === 'blueprint' && (
                <div className="space-y-4">
                  {(() => {
                    const latestBlueprint = selectedProject.blueprint?.versions?.[selectedProject.blueprint.versions.length - 1];
                    const blueprintUrl = latestBlueprint?.path ? `http://localhost:5000${latestBlueprint.path.startsWith('/') ? latestBlueprint.path : '/' + latestBlueprint.path}` : null;
                    
                      return blueprintUrl ? (
                      <div className="space-y-4">
                       {/* Blueprint Viewer Area */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center min-h-[400px]">
                         {blueprintUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img src={blueprintUrl} alt="Blueprint" className="max-w-full max-h-[600px] object-contain" />
                         ) : blueprintUrl.match(/\.pdf$/i) ? (
                            <div className="w-full h-[600px] overflow-y-auto scrollbar-light bg-white">
                              <Document
                                file={blueprintUrl}
                                options={pdfOptions}
                                onLoadSuccess={({ numPages }) => setPdfPageCount(numPages)}
                                onLoadError={(err) => console.error('PDF load error:', err)}
                                loading={<div className="py-10 text-sm text-slate-500">Loading PDF...</div>}
                                error={<div className="py-10 text-sm text-slate-500">Unable to display PDF.</div>}
                              >
                                {Array.from({ length: pdfPageCount || 0 }, (_, index) => (
                                  <div key={`page_${index + 1}`} className="flex justify-center py-4">
                                    <Page
                                      pageNumber={index + 1}
                                      renderTextLayer={false}
                                      renderAnnotationLayer={false}
                                    />
                                  </div>
                                ))}
                              </Document>
                            </div>
                         ) : (
                           <div className="text-center p-8">
                              <p className="text-slate-600 mb-2 font-medium">Document Available</p>
                              <a href={blueprintUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download to View</a>
                           </div>
                         )}
                        </div>
                       
                       {/* Metadata */}
                       <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                          <div>
                             <p className="font-semibold text-slate-900 text-sm">{latestBlueprint?.originalName || 'Design Document'}</p>
                             <p className="text-xs text-slate-500">Version {latestBlueprint?.version || 1} • {latestBlueprint && formatDate(latestBlueprint.uploadedAt)}</p>
                          </div>
                          <a href={blueprintUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                             Download
                          </a>
                       </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                         <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <p className="text-slate-900 font-medium">No designs uploaded yet</p>
                      <p className="text-slate-500 text-xs">Our engineers are working on your initial draft.</p>
                    </div>
                  );
                  })()}
                </div>
              )}

              {/* Quotation Tab */}
              {activeTab === 'quotation' && (
                <div className="space-y-6">
                  {(() => {
                    const latestCosting = selectedProject.costing?.versions?.[selectedProject.costing.versions.length - 1];
                    const totalAmount = latestCosting?.totalAmount || selectedProject.quotation?.totalAmount;
                    
                    return totalAmount ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Breakdown */}
                        <div className="col-span-2 md:col-span-1">
                           <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Cost Breakdown</h3>
                           {latestCosting?.breakdown && latestCosting.breakdown.length > 0 ? (
                             <div className="border border-slate-200 rounded-xl overflow-hidden">
                                {latestCosting.breakdown.map((item, idx) => (
                                   <div key={idx} className="flex justify-between items-center p-3 text-sm border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                        <div>
                                          <p className="font-medium text-slate-900">{item.item}</p>
                                          <p className="text-xs text-slate-500">{item.quantity} units @ ₱{Number(item.unitPrice ?? 0).toLocaleString()}</p>
                                        </div>
                                        <span className="font-medium text-slate-900">₱{Number(item.total ?? 0).toLocaleString()}</span>
                                   </div>
                                ))}
                             </div>
                           ) : (
                             <p className="text-slate-500 text-sm">No itemized breakdown provided.</p>
                           )}
                        </div>

                        {/* Summary & Schedule */}
                        <div className="col-span-2 md:col-span-1 space-y-4">
                           <div className="bg-slate-900 rounded-xl p-5 text-white shadow-lg">
                              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-4">Total Estimate</h3>
                              <div className="flex items-baseline gap-1">
                                 <span className="text-3xl font-bold">₱{totalAmount.toLocaleString()}</span>
                                 <span className="text-sm text-slate-400">PHP</span>
                              </div>
                              <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-sm">
                                 {selectedProject.quotation?.materialCost && (
                                     <div className="flex justify-between text-slate-300">
                                         <span>Material Cost</span>
                                         <span>₱{selectedProject.quotation.materialCost.toLocaleString()}</span>
                                     </div>
                                 )}
                                 {selectedProject.quotation?.laborCost && (
                                     <div className="flex justify-between text-slate-300">
                                         <span>Labor Cost</span>
                                         <span>₱{selectedProject.quotation.laborCost.toLocaleString()}</span>
                                     </div>
                                 )}
                              </div>
                           </div>

                           <div className="border border-slate-200 rounded-xl p-4">
                              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Payment Terms (30-40-30)</h3>
                              <div className="space-y-3 text-sm">
                                  <div className="flex justify-between">
                                     <span className="text-slate-600">Downpayment (30%)</span>
                                     <span className="font-medium text-slate-900">₱{Math.round(totalAmount * 0.3).toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                     <span className="text-slate-600">Progress (40%)</span>
                                     <span className="font-medium text-slate-900">₱{Math.round(totalAmount * 0.4).toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                     <span className="text-slate-600">Completion (30%)</span>
                                     <span className="font-medium text-slate-900">₱{Math.round(totalAmount * 0.3).toLocaleString()}</span>
                                  </div>
                              </div>
                           </div>
                        </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-slate-500">Quotation pending...</p>
                    </div>
                  );
                  })()}
                </div>
              )}

              {/* Revision History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  {selectedProject.revisionHistory && selectedProject.revisionHistory.length > 0 ? (
                    <div className="space-y-3">
                      {selectedProject.revisionHistory.map((revision, index) => (
                        <div key={revision._id || index} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex justify-between items-start mb-2">
                               <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Revision #{selectedProject.revisionHistory!.length - index}</span>
                               <span className="text-xs text-slate-400">{formatDate(revision.requestedAt)}</span>
                            </div>
                            <p className="text-sm text-slate-700">{revision.feedback}</p>
                            {revision.resolvedAt && (
                               <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
                                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                   Resolved on {formatDate(revision.resolvedAt)}
                               </div>
                            )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-8">No revision history.</p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            {selectedProject.status === 'blueprint_uploaded' && activeTab === 'blueprint' && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                 <button
                    onClick={() => openRevisionModal(selectedProject)}
                    className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                 >
                    Request Modification
                 </button>
                 <button
                    onClick={openApproveModal}
                    className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
                 >
                    Approve Design
                 </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Revision Request Modal */}
      {showRevisionModal && selectedProject && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeRevisionModal} />
           <div className="relative bg-white w-full max-w-md rounded-xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Request Modifications</h3>
              <p className="text-sm text-slate-500 mb-4">Please describe the changes you would like to request for this design.</p>
              
              <textarea
                value={revisionFeedback}
                onChange={(e) => setRevisionFeedback(e.target.value)}
                placeholder="E.g., Please change the color to matte black..."
                rows={5}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent mb-4 resize-none"
              />
              
              <div className="flex gap-3">
                   <button onClick={closeRevisionModal} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">Cancel</button>
                   <button 
                     onClick={() => handleRejectBlueprint(selectedProject._id)}
                     disabled={submitting || !revisionFeedback.trim()}
                     className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                   >
                     {submitting ? 'Sending...' : 'Submit Request'}
                   </button>
              </div>
           </div>
        </div>,
        document.body
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedProject && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowApproveModal(false)} />
           <div className="relative bg-white w-full max-w-sm rounded-xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Approve Design?</h3>
              <p className="text-sm text-slate-500 mb-6">
                 By approving, you confirm the blueprint meets your requirements. The project will move to the next stage.
              </p>

              <div className="text-left bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6">
                <p className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold mb-2">Payment Plan</p>
                <label className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Pay in stages</p>
                    <p className="text-xs text-slate-500">30% â€¢ 40% â€¢ 30%</p>
                  </div>
                  <input
                    type="radio"
                    name="paymentPlan"
                    value="staged"
                    checked={paymentPlan === 'staged'}
                    onChange={() => setPaymentPlan('staged')}
                    className="h-4 w-4 text-slate-900 border-slate-300"
                  />
                </label>
                <label className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Pay in full</p>
                    <p className="text-xs text-slate-500">100% upfront</p>
                  </div>
                  <input
                    type="radio"
                    name="paymentPlan"
                    value="full"
                    checked={paymentPlan === 'full'}
                    onChange={() => setPaymentPlan('full')}
                    className="h-4 w-4 text-slate-900 border-slate-300"
                  />
                </label>
              </div>
              
              <div className="flex gap-3">
                   <button onClick={() => setShowApproveModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">Cancel</button>
                   <button 
                     onClick={() => handleApproveBlueprint(selectedProject._id)}
                     disabled={submitting}
                     className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                   >
                     {submitting ? 'Confirming...' : 'Confirm Approval'}
                   </button>
              </div>
           </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MyProjects;
