import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  FileText, 
  Upload, 
  CheckCircle2, 
  History, 
  Info, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Download,
  Eye,
  Layout,
  Hammer,
  ClipboardList,
  User,
  MapPin,
  Ruler,
  AlertCircle,
  Lightbulb,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Settings,
  X
} from 'lucide-react';
import { projectApi } from '../../../api/services';
import toast from 'react-hot-toast';

interface ProjectDetail {
  _id: string;
  title: string;
  projectName?: string;
  description?: string;
  category: string;
  status: string;
  customer: {
    _id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      phone?: string;
    };
  };
  siteAddress?: {
    street?: string;
    city?: string;
    province?: string;
    zipCode?: string;
  };
  specifications?: {
    dimensions?: { width?: number; height?: number; length?: number };
    material?: string;
    color?: string;
    additionalSpecs?: string;
    additionalNotes?: string;
  };
  consultation?: {
    conductedBy?: {
      _id: string;
      profile?: {
        firstName: string;
        lastName: string;
      };
    };
    conductedAt?: string;
    notes?: string;
    measurements?: Array<{ name: string; value: string; unit?: string }>;
    photos?: Array<{ filename: string; path: string; uploadedAt: string }>;
  };
  // Sales submission data
  sourceAppointment?: {
    _id: string;
    projectSubmission?: {
      submitted: boolean;
      submittedAt?: string;
      projectType?: string;
      dimensions?: string;
      preferredMaterials?: string;
      specialInstructions?: string;
    };
    ocularVisit?: {
      status?: string;
      measurements?: string;
      feasibilityAssessment?: 'feasible' | 'needs_adjustment' | 'not_feasible';
      observations?: string;
    };
  };
  blueprint?: {
    currentVersion: number;
    versions: Array<{
      version: number;
      filename: string;
      path: string;
      uploadedAt: string;
      notes?: string;
    }>;
  };
  costing?: {
    currentVersion: number;
    approvedAmount?: number;
    versions: Array<{
      version: number;
      filename: string;
      path: string;
      totalAmount: number;
      uploadedAt: string;
      notes?: string;
      breakdown?: Array<{ item: string; cost: number }>;
    }>;
  };
  revisions?: Array<{
    description: string;
    type: 'minor' | 'major';
    status: string;
    requestedAt: string;
  }>;
  statusHistory?: Array<{
    status: string;
    notes?: string;
    changedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-slate-700', bg: 'bg-slate-100' },
  pending_blueprint: { label: 'Need Blueprint', color: 'text-amber-700', bg: 'bg-amber-100' },
  pending_costing: { label: 'Need Costing', color: 'text-orange-700', bg: 'bg-orange-100' },
  pending_customer_approval: { label: 'Awaiting Customer Approval', color: 'text-indigo-700', bg: 'bg-indigo-100' },
  approved: { label: 'Customer Approved', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  fabrication: { label: 'In Fabrication', color: 'text-cyan-700', bg: 'bg-cyan-100' },
  revision_requested: { label: 'Revision Needed', color: 'text-red-700', bg: 'bg-red-100' },
  completed: { label: 'Completed', color: 'text-slate-700', bg: 'bg-slate-100' },
};

const EngineerProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'blueprint' | 'costing' | 'history'>('details');
  
  // Modal states
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [showCostingModal, setShowCostingModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Upload form states
  const [blueprintFile, setBlueprintFile] = useState<File | null>(null);
  const [blueprintNotes, setBlueprintNotes] = useState('');
  const [costingFile, setCostingFile] = useState<File | null>(null);
  const [costingAmount, setCostingAmount] = useState('');
  const [costingNotes, setCostingNotes] = useState('');
  const [costingBreakdown, setCostingBreakdown] = useState<Array<{ item: string; cost: string }>>([
    { item: '', cost: '' }
  ]);

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const response = await projectApi.getById(id!);
      setProject(response.data?.project || response.project);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project details');
      navigate('/dashboard/engineer/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadBlueprint = async () => {
    if (!blueprintFile) {
      toast.error('Please select a blueprint file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('blueprint', blueprintFile);
      formData.append('notes', blueprintNotes);

      await projectApi.uploadBlueprint(id!, formData);
      toast.success('Blueprint uploaded successfully');
      setShowBlueprintModal(false);
      setBlueprintFile(null);
      setBlueprintNotes('');
      fetchProject();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload blueprint');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadCosting = async () => {
    if (!costingFile || !costingAmount) {
      toast.error('Please provide costing file and total amount');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('costing', costingFile);
      formData.append('totalAmount', costingAmount);
      formData.append('notes', costingNotes);
      
      const breakdown = costingBreakdown
        .filter(b => b.item && b.cost)
        .map(b => ({ item: b.item, cost: parseFloat(b.cost) }));
      formData.append('breakdown', JSON.stringify(breakdown));

      await projectApi.uploadCosting(id!, formData);
      toast.success('Costing uploaded successfully');
      setShowCostingModal(false);
      setCostingFile(null);
      setCostingAmount('');
      setCostingNotes('');
      setCostingBreakdown([{ item: '', cost: '' }]);
      fetchProject();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload costing');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!project?.blueprint?.currentVersion || !project?.costing?.currentVersion) {
      toast.error('Blueprint and costing must be uploaded first');
      return;
    }

    setSubmitting(true);
    try {
      await projectApi.submitForApproval(id!);
      toast.success('Project submitted for customer approval');
      fetchProject();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit for approval');
    } finally {
      setSubmitting(false);
    }
  };

  const addBreakdownRow = () => {
    setCostingBreakdown([...costingBreakdown, { item: '', cost: '' }]);
  };

  const updateBreakdownRow = (index: number, field: 'item' | 'cost', value: string) => {
    const updated = [...costingBreakdown];
    updated[index][field] = value;
    setCostingBreakdown(updated);
  };

  const removeBreakdownRow = (index: number) => {
    if (costingBreakdown.length > 1) {
      setCostingBreakdown(costingBreakdown.filter((_, i) => i !== index));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Project not found</p>
      </div>
    );
  }

  const config = statusConfig[project.status] || { label: project.status, color: 'text-slate-700', bg: 'bg-slate-100' };
  const canUploadBlueprint = ['pending_blueprint', 'revision_requested'].includes(project.status);
  const canUploadCosting = project.blueprint?.currentVersion && ['pending_blueprint', 'pending_costing', 'revision_requested'].includes(project.status);
  const canSubmitForApproval = project.blueprint?.currentVersion && project.costing?.currentVersion && 
    ['pending_blueprint', 'pending_costing', 'revision_requested'].includes(project.status);

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative pb-20">
      {/* Decorative Background */}
      <div className="fixed inset-0 -z-20 bg-slate-50/50" />
      <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-[120px]" />

      {/* Modern sticky header for actions */}
      <div className="sticky top-0 z-30 flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/50 -mx-4 px-4 sm:-mx-8 sm:px-8 mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/engineer/projects"
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
             <div className="flex items-center gap-2 mb-0.5">
                <Layout size={14} className="text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Project Management</span>
             </div>
             <h1 className="text-xl font-black text-slate-900 leading-tight">
                {project.projectName || project.title || 'Untitled Project'}
             </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {canSubmitForApproval && (
            <button
              onClick={handleSubmitForApproval}
              disabled={submitting}
              className="px-6 py-2.5 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center gap-2 group"
            >
              {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldCheck size={16} className="group-hover:scale-110 transition-transform" />}
              {submitting ? 'Submitting...' : 'Mark as Ready'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Essential Workflow */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Status Bar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm overflow-hidden relative">
             <div className="absolute top-0 left-0 w-1 h-full bg-slate-900" />
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                   <div className={`p-3 rounded-2xl ${config.bg} ${config.color.replace('text', 'bg').replace('700', '100')}`}>
                      <Hammer size={24} />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Phase</p>
                      <h2 className={`text-lg font-black uppercase tracking-tight ${config.color}`}>{config.label}</h2>
                   </div>
                </div>

                <div className="grid grid-cols-2 sm:flex items-center gap-4 md:gap-8">
                   <div className="text-center md:text-left">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Created</p>
                      <p className="text-sm font-bold text-slate-900">{format(new Date(project.createdAt), 'MMM d, yyyy')}</p>
                   </div>
                   <div className="text-center md:text-left">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</p>
                      <p className="text-sm font-bold text-slate-900">{project.category.replace(/_/g, ' ')}</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 p-1.5 bg-slate-200/50 rounded-2xl w-fit">
            {[
              { id: 'details', label: 'Brief', icon: ClipboardList },
              { id: 'blueprint', label: 'Blueprints', icon: FileText },
              { id: 'costing', label: 'Pricing', icon: TrendingUp },
              { id: 'history', label: 'Timeline', icon: History }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
             {activeTab === 'details' && (
                <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   {/* Sales Handover Data - Most Important for Engineer */}
                   <div className="bg-white text-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:scale-110" />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                           <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-yellow-50 rounded-xl text-yellow-600">
                                 <Lightbulb size={24} />
                              </div>
                              <h3 className="text-xl font-black">Sales Handover Brief</h3>
                           </div>
                           <div className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black tracking-widest uppercase">
                              Technical Focus
                           </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                           <div className="col-span-full md:col-span-1">
                              <div>
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-3">Project Classification</label>
                                 <p className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-slate-900" />
                                    {project.sourceAppointment?.projectSubmission?.projectType || 'Standard Category'}
                                 </p>
                              </div>
                           </div>
                           
                           <div className="md:col-span-1 space-y-6">
                              <div>
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Material Preference</label>
                                 <div className="text-sm font-bold text-slate-700 leading-relaxed bg-slate-50 px-5 py-4 rounded-2xl border border-slate-200">
                                    {project.sourceAppointment?.projectSubmission?.preferredMaterials || 'No specific material requirement provided by sales staff.'}
                                 </div>
                              </div>
                           </div>

                           <div className="col-span-full">
                              <div>
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Primary Dimensions</label>
                                 <div className="bg-slate-50 px-6 py-5 rounded-2xl border border-slate-200">
                                    <div className="flex items-start gap-4">
                                       <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm shrink-0">
                                          <Ruler size={18} className="text-slate-500" />
                                       </div>
                                       <div className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-line pt-1">
                                          {project.sourceAppointment?.ocularVisit?.measurements || 
                                           project.sourceAppointment?.projectSubmission?.dimensions || 'Pending Update'}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                        
                        {project.sourceAppointment?.projectSubmission?.specialInstructions && (
                          <div className="mt-8 pt-6 border-t border-slate-100">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <MessageSquare size={14} />
                                Technical Directives
                             </label>
                             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <ul className="space-y-3">
                                   {(project.sourceAppointment.projectSubmission.specialInstructions.includes('•') 
                                      ? project.sourceAppointment.projectSubmission.specialInstructions.split('•').filter(i => i.trim()) 
                                      : [project.sourceAppointment.projectSubmission.specialInstructions]
                                   ).map((instruction, idx) => (
                                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
                                         <div className="min-w-[6px] h-[6px] rounded-full bg-slate-300 mt-2" />
                                         <span>{instruction.replace(/^"|"$/g, '').trim()}</span>
                                      </li>
                                   ))}
                                </ul>
                             </div>
                          </div>
                        )}
                      </div>
                   </div>

                   {/* Secondary Info Grid */}
                   <div className="grid md:grid-cols-2 gap-6 leading-relaxed">
                      {/* Customer Details Card */}
                      <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
                         <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                               <MapPin size={18} />
                            </div>
                            <h4 className="font-bold text-slate-900 tracking-tight">Installation Context</h4>
                         </div>
                         <div className="space-y-5">
                            <div>
                               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Customer / Site</p>
                               <p className="text-sm font-bold text-slate-900">{project.customer?.profile?.firstName} {project.customer?.profile?.lastName}</p>
                               <p className="text-xs text-slate-500 mt-0.5">{project.siteAddress?.city}, {project.siteAddress?.province}</p>
                            </div>
                            
                            {project.sourceAppointment?.ocularVisit?.feasibilityAssessment && (
                               <div>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Feasibility Verification</p>
                                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
                                     project.sourceAppointment.ocularVisit.feasibilityAssessment === 'feasible' 
                                       ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                       : 'bg-amber-50 text-amber-600 border-amber-100'
                                  }`}>
                                     <CheckCircle2 size={12} />
                                     {project.sourceAppointment.ocularVisit.feasibilityAssessment.replace(/_/g, ' ')}
                                  </div>
                               </div>
                            )}

                            {project.sourceAppointment?.ocularVisit?.observations && (
                               <div className="pt-4 border-t border-slate-100">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Site Constraints</p>
                                  <div className="text-xs text-slate-600 leading-relaxed italic space-y-1">
                                    {(project.sourceAppointment.ocularVisit.observations.includes('•') 
                                      ? project.sourceAppointment.ocularVisit.observations.split('•').filter(o => o.trim())
                                      : [project.sourceAppointment.ocularVisit.observations]
                                    ).map((obs, i) => (
                                      <div key={i} className="flex items-start gap-2">
                                        {project.sourceAppointment?.ocularVisit?.observations?.includes('•') && <span className="text-slate-400 mt-1">•</span>}
                                        <span>{obs.trim()}</span>
                                      </div>
                                    ))}
                                  </div>
                               </div>
                            )}
                         </div>
                      </div>

                      {/* Technical Spec Summary */}
                      <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
                         <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                               <Settings size={18} />
                            </div>
                            <h4 className="font-bold text-slate-900 tracking-tight">System Specs</h4>
                         </div>
                         <div className="space-y-4">
                            {[
                               { label: 'Material Grade', value: project.specifications?.material === '304_grade' ? '304 Stainless' : project.specifications?.material === '316_grade' ? '316 Stainless' : 'To be specified' },
                               { label: 'Finish/Color', value: project.specifications?.color || 'Manufacturer Standard' },
                               { label: 'Source Staff', value: project.consultation?.conductedBy?.profile?.firstName ? `${project.consultation.conductedBy.profile.firstName} ${project.consultation.conductedBy.profile.lastName}` : 'System Initialized' }
                            ].map((item) => (
                               <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{item.label}</span>
                                  <span className="text-sm font-bold text-slate-900">{item.value}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
             )}

             {activeTab === 'blueprint' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Blueprint Registry</h3>
                      {canUploadBlueprint && (
                         <button
                           onClick={() => setShowBlueprintModal(true)}
                           className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                         >
                            <Plus size={16} />
                            Upload New Version
                         </button>
                      )}
                   </div>

                   {project.blueprint?.versions && project.blueprint.versions.length > 0 ? (
                      <div className="grid gap-4">
                         {project.blueprint.versions.map((bp, idx) => (
                            <div 
                              key={idx} 
                              className={`group relative bg-white border rounded-3xl p-6 transition-all hover:shadow-xl hover:border-slate-300 ${
                                bp.version === project.blueprint?.currentVersion ? 'ring-2 ring-indigo-500 border-transparent shadow-lg' : 'border-slate-200'
                              }`}
                            >
                               {bp.version === project.blueprint?.currentVersion && (
                                  <div className="absolute top-0 right-10 -translate-y-1/2 px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                                     Active Release
                                  </div>
                               )}
                               <div className="flex items-center gap-6">
                                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                                     bp.version === project.blueprint?.currentVersion ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'
                                  }`}>
                                     <FileText size={32} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">Version {bp.version}</h4>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{format(new Date(bp.uploadedAt), 'MMM dd, yyyy')}</span>
                                     </div>
                                     <p className="text-sm text-slate-500 italic">"{bp.notes || 'Technical schematic submission.'}"</p>
                                  </div>
                                  <div className="flex gap-2">
                                     <a
                                       href={`/uploads/blueprints/${bp.filename}`}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                       title="Visual Inspection"
                                     >
                                        <Eye size={18} />
                                     </a>
                                     <a
                                       href={`/uploads/blueprints/${bp.filename}`}
                                       download
                                       className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                       title="Download Schematic"
                                     >
                                        <Download size={18} />
                                     </a>
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                   ) : (
                      <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] py-20 text-center">
                         <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <FileText size={40} />
                         </div>
                         <p className="text-slate-900 font-black uppercase tracking-widest text-sm">No Blueprints Managed</p>
                         <p className="text-slate-500 text-xs mt-2 mb-8">Begin the engineering process by uploading the first technical PDF.</p>
                         <button
                           onClick={() => setShowBlueprintModal(true)}
                           className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                         >
                            Initialize Upload
                         </button>
                      </div>
                   )}
                </div>
             )}

             {activeTab === 'costing' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Costing & Estimates</h3>
                      {canUploadCosting && (
                         <button
                           onClick={() => setShowCostingModal(true)}
                           className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                         >
                            <Plus size={16} />
                            Create Estimate
                         </button>
                      )}
                   </div>

                   {project.costing?.versions && project.costing.versions.length > 0 ? (
                      <div className="grid gap-6">
                         {project.costing.versions.map((cost, idx) => (
                            <div 
                              key={idx} 
                              className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all"
                            >
                               <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                  <div className="flex items-center gap-6">
                                     <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                        <TrendingUp size={32} />
                                     </div>
                                     <div>
                                        <div className="flex items-center gap-3 mb-1">
                                          <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight italic">Revision {cost.version}</h4>
                                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                                            {format(new Date(cost.uploadedAt), 'MMM dd, yyyy')}
                                          </span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-none">Technical valuation of fabrication requirements.</p>
                                     </div>
                                  </div>
                                  <div className="text-left md:text-right bg-slate-50 md:bg-transparent p-5 md:p-0 rounded-2xl">
                                     <p className="text-3xl font-black text-slate-900 tracking-tighter">₱{cost.totalAmount?.toLocaleString()}</p>
                                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Project Valuation</p>
                                  </div>
                               </div>

                               {cost.breakdown && cost.breakdown.length > 0 && (
                                  <div className="bg-slate-50/50 p-8 border-t border-slate-100">
                                     <div className="flex items-center gap-2 mb-6">
                                        <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cost Breakdown Matrix</h5>
                                     </div>
                                     <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                                        {cost.breakdown.map((item, i) => (
                                           <div key={i} className="flex justify-between items-center py-2 border-b border-slate-200/40">
                                              <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{item.item}</span>
                                              <span className="text-sm font-black text-slate-900">₱{item.cost?.toLocaleString()}</span>
                                           </div>
                                        ))}
                                     </div>
                                     
                                     {cost.notes && (
                                        <div className="mt-8 pt-6 border-t border-slate-200/40">
                                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Valuation Notes</p>
                                           <p className="text-xs text-slate-600 italic leading-relaxed bg-white/50 p-4 rounded-xl">"{cost.notes}"</p>
                                        </div>
                                     )}
                                     
                                     <div className="mt-8 flex justify-end">
                                        <a
                                          href={`/uploads/costings/${cost.filename}`}
                                          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                                        >
                                           <Download size={14} />
                                           Export Full Details (PDF)
                                        </a>
                                     </div>
                                  </div>
                               )}
                            </div>
                         ))}
                      </div>
                   ) : (
                      <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] py-20 text-center">
                         <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <TrendingUp size={40} />
                         </div>
                         <p className="text-slate-900 font-black uppercase tracking-widest text-sm">No Costing Established</p>
                         <p className="text-slate-500 text-xs mt-2 mb-8">Estimated fabrication costs must be assigned to proceed.</p>
                         <button
                           onClick={() => setShowCostingModal(true)}
                           disabled={!project.blueprint?.currentVersion}
                           className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-30 flex items-center gap-2 mx-auto"
                         >
                            {!project.blueprint?.currentVersion && <AlertCircle size={14} />}
                            {project.blueprint?.currentVersion ? 'Initialize Costing' : 'Upload Blueprint First'}
                         </button>
                      </div>
                   )}
                </div>
             )}

             {activeTab === 'history' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <div className="relative pl-10 space-y-10 py-4">
                      <div className="absolute top-0 left-4 w-px h-full bg-slate-200" />
                      
                      {project.statusHistory && project.statusHistory.length > 0 ? (
                        [...project.statusHistory].reverse().map((entry, idx) => (
                           <div key={idx} className="relative group">
                              <div className="absolute -left-10 top-2.5 w-8 h-8 bg-white border-2 border-slate-900 rounded-full z-10 flex items-center justify-center transition-transform group-hover:scale-110">
                                 <div className="w-2 h-2 bg-slate-900 rounded-full" />
                              </div>
                              <div className="bg-white rounded-[1.5rem] p-6 border border-slate-200 group-hover:border-slate-400 transition-all shadow-sm">
                                 <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-black text-slate-900 uppercase tracking-tight italic">{entry.status.replace(/_/g, ' ')}</h4>
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{format(new Date(entry.changedAt), 'MMM dd, h:mm a')}</span>
                                 </div>
                                 <p className="text-sm text-slate-500 leading-relaxed mb-0.5">{entry.notes || 'No technical notes recorded for this transition.'}</p>
                              </div>
                           </div>
                        ))
                      ) : (
                        <p className="text-center text-slate-500 py-12">No event logs available for this project.</p>
                      )}
                   </div>
                </div>
             )}
          </div>
        </div>

        {/* Right Column: Reference & Actions */}
        <div className="lg:col-span-4 space-y-6">
           {/* Revision Request Floating Card */}
           {project.status === 'revision_requested' && (
              <div className="bg-red-600 text-white rounded-3xl p-6 shadow-2xl shadow-red-200 animate-pulse relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
                <div className="flex items-center gap-3 mb-4">
                   <div className="p-2 bg-white/20 rounded-xl">
                      <AlertCircle size={24} />
                   </div>
                   <h4 className="font-black text-lg uppercase tracking-tight">Active Revision</h4>
                </div>
                <div className="bg-black/10 p-4 rounded-2xl border border-white/10 mb-4">
                  <p className="text-sm font-bold leading-relaxed italic">
                    "{project.revisions?.[project.revisions.length - 1]?.description}"
                  </p>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                  Engineer Action: Re-upload Blueprints or Pricing
                </p>
              </div>
           )}

           {/* Quick Actions Card */}
           <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm relative overflow-hidden">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Workflow GATING</h3>
              <div className="space-y-3">
                 <div className={`p-4 rounded-2xl flex items-center justify-between transition-all ${project.blueprint?.currentVersion ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400 opacity-50'}`}>
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-lg ${project.blueprint?.currentVersion ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                          <FileText size={16} />
                       </div>
                       <span className="text-xs font-black uppercase tracking-widest">Blueprint</span>
                    </div>
                    {project.blueprint?.currentVersion ? <CheckCircle2 size={18} /> : <span>Pending</span>}
                 </div>

                 <div className={`p-4 rounded-2xl flex items-center justify-between transition-all ${project.costing?.currentVersion ? 'bg-emerald-50 text-emerald-700' : (project.blueprint?.currentVersion ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-400 opacity-50')}`}>
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-lg ${project.costing?.currentVersion ? 'bg-emerald-100' : (project.blueprint?.currentVersion ? 'bg-amber-100' : 'bg-slate-200')}`}>
                          <TrendingUp size={16} />
                       </div>
                       <span className="text-xs font-black uppercase tracking-widest">Pricing</span>
                    </div>
                    {project.costing?.currentVersion ? <CheckCircle2 size={18} /> : <span>{project.blueprint?.currentVersion ? 'Locked' : 'Blocked'}</span>}
                 </div>
              </div>
           </div>

           {/* Checklist Card */}
           <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                 <CheckCircle2 size={12} className="text-indigo-500" />
                 Engineering Standards
              </h3>
              <ul className="space-y-4">
                 {[
                    'CAD/Schematic matches all site measurements.',
                    'Material specs strictly follow sale briefing.',
                    'Costing accounts for labor, parts & logistics.',
                    'All technical notes are clear for fabrication.'
                 ].map((task, i) => (
                    <li key={i} className="flex items-start gap-3 group/item cursor-default">
                       <div className="mt-1 w-4 h-4 rounded border border-slate-200 flex items-center justify-center shrink-0 group-hover/item:border-indigo-500 transition-colors">
                          <CheckCircle2 size={10} className="text-indigo-500 opacity-0 group-hover/item:opacity-100" />
                       </div>
                       <span className="text-xs text-slate-600 leading-relaxed group-hover/item:text-slate-900 transition-colors">{task}</span>
                    </li>
                 ))}
              </ul>
           </div>

           {/* Assigned Staff */}
           <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm leading-relaxed">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Assigned Resources</h3>
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                 <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                    <User size={20} />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Lead Engineer</p>
                    <p className="text-sm font-black text-slate-900 truncate">S.Camara (Assignee)</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Blueprint Upload Modal */}
      {showBlueprintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowBlueprintModal(false)} />
          <div className="relative bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">Blueprint Upload</h3>
              <button 
                onClick={() => setShowBlueprintModal(false)} 
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div 
                className={`relative border-2 border-dashed rounded-[2rem] p-8 text-center transition-all group ${
                  blueprintFile ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setBlueprintFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="relative z-0">
                   {blueprintFile ? (
                      <div className="flex flex-col items-center gap-2 text-indigo-600">
                         <FileText size={40} className="animate-bounce" />
                         <span className="font-black uppercase tracking-widest text-xs truncate max-w-[200px]">{blueprintFile.name}</span>
                         <span className="text-[10px] font-bold text-indigo-400">{(blueprintFile.size / 1024 / 1024).toFixed(2)} MB • PDF</span>
                      </div>
                   ) : (
                      <div className="flex flex-col items-center gap-3">
                         <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 shadow-sm group-hover:scale-110 transition-transform">
                            <Upload size={32} />
                         </div>
                         <div>
                            <p className="text-slate-900 font-bold text-sm tracking-tight">Drop Blueprint PDF</p>
                            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-1">Maximum 25MB File</p>
                         </div>
                      </div>
                   )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1 italic">Technical Revision Notes</label>
                <textarea
                  value={blueprintNotes}
                  onChange={(e) => setBlueprintNotes(e.target.value)}
                  placeholder="Summarize changes or technical focus..."
                  rows={4}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all placeholder:text-slate-300"
                />
              </div>

              <button
                onClick={handleUploadBlueprint}
                disabled={!blueprintFile || uploading}
                className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group"
              >
                 {uploading ? (
                   <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                 ) : (
                   <>
                     <CheckCircle2 size={18} className="group-hover:rotate-12 transition-transform" />
                     <span>Confirm Submission</span>
                   </>
                 )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Costing Upload Modal */}
      {showCostingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowCostingModal(false)} />
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl p-10 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Fabrication Pricing</h3>
                  <p className="text-slate-400 text-xs mt-1">Establish the technical valuation for this project.</p>
               </div>
               <button onClick={() => setShowCostingModal(false)} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors"><X size={24} /></button>
            </div>
            
            <div className="space-y-10 group">
              <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div>
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 italic">Technical Price List (PDF) *</label>
                       <div 
                         className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                           costingFile ? 'border-emerald-400 bg-emerald-50/20' : 'border-slate-200 bg-slate-50/50'
                         }`}
                       >
                         <input
                           type="file"
                           accept=".pdf"
                           onChange={(e) => setCostingFile(e.target.files?.[0] || null)}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                         />
                         <div className="flex flex-col items-center gap-2">
                           {costingFile ? (
                              <FileText size={32} className="text-emerald-500" />
                           ) : (
                              <Upload size={32} className="text-slate-300" />
                           )}
                           <p className="text-[10px] font-black uppercase tracking-widest mt-2">{costingFile ? costingFile.name : 'Drop PDF'}</p>
                         </div>
                       </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 italic">Total Estimated Balance (₱) *</label>
                      <div className="relative">
                         <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold italic text-lg leading-none">₱</span>
                         <input
                           type="number"
                           value={costingAmount}
                           onChange={(e) => setCostingAmount(e.target.value)}
                           className="w-full pl-10 pr-5 py-4 bg-slate-900 text-white rounded-2xl text-xl font-black placeholder:text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all tracking-tight"
                           placeholder="00.00"
                         />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 ml-1">Final amount to be billed to customer.</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 italic">Strategic Valuation Split</label>
                       <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                         {costingBreakdown.map((row, idx) => (
                           <div key={idx} className="flex gap-2 animate-in fade-in slide-in-from-right-1">
                             <input
                               placeholder="Component"
                               value={row.item}
                               onChange={(e) => updateBreakdownRow(idx, 'item', e.target.value)}
                               className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-slate-400"
                             />
                             <input
                               placeholder="Cost"
                               type="number"
                               value={row.cost}
                               onChange={(e) => updateBreakdownRow(idx, 'cost', e.target.value)}
                               className="w-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-slate-400"
                             />
                             {costingBreakdown.length > 1 && (
                               <button onClick={() => removeBreakdownRow(idx)} className="p-3 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                             )}
                           </div>
                         ))}
                         <button 
                           onClick={addBreakdownRow}
                           className="w-full py-3 border-2 border-dashed border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-slate-200 hover:text-slate-600 transition-all flex items-center justify-center gap-2"
                         >
                            <Plus size={12} /> Add Matrix Row
                         </button>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center gap-6">
                 <div className="flex-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1 italic">Accounting Directives</label>
                    <textarea
                      value={costingNotes}
                      onChange={(e) => setCostingNotes(e.target.value)}
                      placeholder="Note details for the customer or cashier..."
                      rows={2}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-slate-400 transition-all"
                    />
                 </div>
                 <button
                   onClick={handleUploadCosting}
                   disabled={!costingFile || !costingAmount || uploading}
                   className="w-full md:w-auto px-10 py-5 bg-black text-white rounded-[2rem] font-black uppercase tracking-widest text-sm hover:scale-[1.02] hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-30 shadow-2xl shadow-slate-200"
                 >
                    {uploading ? 'Processing...' : 'Publish Valuation'}
                 </button>
              </div>
            </div>
          </div>
            </div>
         )}
      </div>
   );
};

export default EngineerProjectDetail;
