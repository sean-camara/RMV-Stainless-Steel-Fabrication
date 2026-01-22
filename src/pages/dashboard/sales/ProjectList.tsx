import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Briefcase,
  Plus,
  Eye,
  Edit,
  User,
  DollarSign,
  Clock,
  Filter,
  Search,
} from 'lucide-react';
import { projectApi } from '../../../api/services';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  StatusBadge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  Modal,
  Input,
  Textarea,
  Select,
  PageLoader,
  Pagination,
} from '../../../components/ui';
import { Project } from '../../../types';
import toast from 'react-hot-toast';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [processing, setProcessing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create form
  const [formData, setFormData] = useState({
    customerId: '',
    projectName: '',
    description: '',
    materialCost: '',
    laborCost: '',
    estimatedDays: '',
  });

  useEffect(() => {
    fetchProjects();
  }, [currentPage, statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      console.log('Fetching projects...'); // Debug log
      const response = await projectApi.getAll({
        page: currentPage,
        limit: 10,
        status: statusFilter || undefined,
      });
      console.log('Projects response:', response); // Debug log
      const projects = response?.data?.projects || response?.projects || [];
      const total = response?.data?.total || response?.total || 0;
      console.log('Extracted projects:', projects, 'Total:', total); // Debug log
      setProjects(projects);
      setTotalPages(Math.ceil(total / 10));
    } catch (error) {
      console.error('Failed to fetch projects:', error); // Debug log
      toast.error('Failed to load projects');
      setProjects([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!formData.projectName || !formData.customerId) {
      toast.error('Please fill in required fields');
      return;
    }

    setProcessing(true);
    try {
      await projectApi.create({
        customerId: formData.customerId,
        projectName: formData.projectName,
        description: formData.description,
        quotation: {
          materialCost: parseFloat(formData.materialCost) || 0,
          laborCost: parseFloat(formData.laborCost) || 0,
          estimatedDays: parseInt(formData.estimatedDays) || 0,
        },
      });
      toast.success('Project created successfully');
      setShowCreateModal(false);
      setFormData({
        customerId: '',
        projectName: '',
        description: '',
        materialCost: '',
        laborCost: '',
        estimatedDays: '',
      });
      fetchProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateQuotation = async () => {
    if (!selectedProject) return;

    setProcessing(true);
    try {
      await projectApi.updateQuotation(selectedProject._id, {
        materialCost: parseFloat(formData.materialCost) || 0,
        laborCost: parseFloat(formData.laborCost) || 0,
        estimatedDays: parseInt(formData.estimatedDays) || 0,
      });
      toast.success('Quotation updated successfully');
      setShowDetailsModal(false);
      fetchProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update quotation');
    } finally {
      setProcessing(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      (project.projectName || '').toLowerCase().includes(search) ||
      project.customerId?.firstName?.toLowerCase().includes(search) ||
      project.customerId?.lastName?.toLowerCase().includes(search)
    );
  });


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
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-cyan-50/40 rounded-full blur-3xl opacity-60 mix-blend-multiply animate-blob" />
      <div className="absolute bottom-0 left-0 -z-10 w-64 h-64 bg-slate-100/50 rounded-full blur-3xl opacity-60 mix-blend-multiply animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-96 h-96 bg-purple-50/40 rounded-full blur-3xl opacity-60 mix-blend-multiply animate-blob animation-delay-4000" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 hero-fade-up">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">
            Projects<span className="text-slate-300">.</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-light tracking-wide">
            Manage project lifecycles, quotations, and client approvals
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-wide text-xs hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 hero-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-[0_8px_30_rgb(0,0,0,0.04)] p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Briefcase className="w-24 h-24 rotate-12" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-cyan-500 mb-1">Total Active</p>
          <p className="text-4xl font-black text-slate-900 tracking-tight">{projects.length}</p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-[0_8px_30_rgb(0,0,0,0.04)] p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-24 h-24 rotate-12" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">Missing Blueprint</p>
          <p className="text-4xl font-black text-slate-900 tracking-tight">
             {projects.filter((p) => p.status === 'blueprint_pending').length}
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-[0_8px_30_rgb(0,0,0,0.04)] p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Edit className="w-24 h-24 rotate-12" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Fabricating</p>
          <p className="text-4xl font-black text-slate-900 tracking-tight">
            {projects.filter((p) => p.status === 'in_fabrication').length}
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-[0_8px_30_rgb(0,0,0,0.04)] p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-24 h-24 rotate-12" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Project Value</p>
          <p className="text-4xl font-black text-slate-900 tracking-tight">
            ₱{(projects.reduce((sum, p) => sum + (p.quotation?.totalAmount || 0), 0) / 1000).toFixed(0)}k
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-[0_8px_30_rgb(0,0,0,0.04)] p-4 flex flex-col md:flex-row gap-4 md:items-center justify-between hero-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects or customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
          />
        </div>
        <div className="w-full md:w-64">
           <div className="relative">
             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <select
               value={statusFilter}
               onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
               }}
               className="w-full pl-11 pr-8 py-3 bg-white/50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900/5 appearance-none cursor-pointer transition-all"
            >
              <option value="">All Statuses</option>
              <option value="blueprint_pending">Blueprint Pending</option>
              <option value="blueprint_uploaded">Blueprint Uploaded</option>
              <option value="client_approved">Client Approved</option>
              <option value="client_rejected">Client Rejected</option>
              <option value="dp_pending">DP Pending</option>
              <option value="in_fabrication">In Fabrication</option>
              <option value="fabrication_done">Fabrication Done</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="released">Released</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white shadow-[0_8px_30_rgb(0,0,0,0.04)] overflow-hidden hero-fade-up" style={{ animationDelay: '0.3s' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100/50 text-left">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Project</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Value</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Created</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {filteredProjects.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                       <Briefcase className="w-8 h-8 opacity-20" />
                       <p className="text-sm font-medium">No projects found matching your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project._id} className="group hover:bg-white/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {project.projectName}
                        </span>
                        <span className="text-xs text-slate-500 max-w-[200px] truncate">
                          {project.description || 'No description'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {project.customerId?.firstName?.[0] || 'C'}
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                           {project.customerId?.firstName || 'Unknown'} {project.customerId?.lastName || ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-6 py-4">
                      {(project.quotation?.totalAmount ?? 0) > 0 ? (
                        <span className="text-sm font-black text-slate-900">
                          ₱{project.quotation?.totalAmount?.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">Not quoted</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-500">
                        {format(new Date(project.createdAt), 'MMM d, yyyy')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          title="View Details"
                          onClick={() => {
                            setSelectedProject(project);
                            setFormData({
                              ...formData,
                              materialCost: project.quotation?.materialCost?.toString() || '',
                              laborCost: project.quotation?.laborCost?.toString() || '',
                              estimatedDays: project.quotation?.estimatedDays?.toString() || '',
                            });
                            setShowDetailsModal(true);
                          }}
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination - Simplified for clean UI */}
        {totalPages > 1 && (
           <div className="px-6 py-4 border-t border-slate-100/50 flex justify-between items-center">
             <button
               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
               disabled={currentPage === 1}
               className="text-xs font-bold text-slate-500 uppercase tracking-wide disabled:opacity-30 hover:text-slate-900"
             >
               Previous
             </button>
             <span className="text-xs font-medium text-slate-400">Page {currentPage} of {totalPages}</span>
             <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="text-xs font-bold text-slate-500 uppercase tracking-wide disabled:opacity-30 hover:text-slate-900"
             >
               Next
             </button>
           </div>
        )}
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Project"
        size="lg"
        variant="light"
      >
        <div className="space-y-4">
          <Input
            label="Customer ID"
            placeholder="Enter customer ID"
            value={formData.customerId}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            required
            variant="light"
          />
          <Input
            label="Project Name"
            placeholder="Enter project name"
            value={formData.projectName}
            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
            required
            variant="light"
          />
          <Textarea
            label="Description"
            placeholder="Enter project description..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            variant="light"
          />

          <div className="border-t border-slate-200 pt-4">
            <h4 className="font-medium text-slate-900 mb-3">Quotation Details</h4>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Material Cost (₱)"
                type="number"
                placeholder="0.00"
                value={formData.materialCost}
                onChange={(e) => setFormData({ ...formData, materialCost: e.target.value })}
                variant="light"
              />
              <Input
                label="Labor Cost (₱)"
                type="number"
                placeholder="0.00"
                value={formData.laborCost}
                onChange={(e) => setFormData({ ...formData, laborCost: e.target.value })}
                variant="light"
              />
              <Input
                label="Est. Days"
                type="number"
                placeholder="0"
                value={formData.estimatedDays}
                onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                variant="light"
              />
            </div>
            <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-sm text-slate-500">Total Amount</p>
              <p className="text-xl font-bold text-slate-900">
                ₱{(
                  (parseFloat(formData.materialCost) || 0) +
                  (parseFloat(formData.laborCost) || 0)
                ).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              loading={processing}
              className="bg-slate-900 hover:bg-slate-800 focus:ring-slate-500 text-white"
            >
              Create Project
            </Button>
          </div>
        </div>
      </Modal>

      {/* Project Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedProject(null);
        }}
        title="Project Details"
        size="lg"
      >
        {selectedProject && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-500">Project Name</label>
                <p className="text-slate-900 font-medium">{selectedProject.projectName}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Status</label>
                <div className="mt-1">
                  <StatusBadge status={selectedProject.status} />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-500">Customer</label>
                <p className="text-slate-900 font-medium">
                  {selectedProject.customerId?.firstName} {selectedProject.customerId?.lastName}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Created</label>
                <p className="text-slate-900">
                  {format(new Date(selectedProject.createdAt), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>

            {selectedProject.description && (
              <div>
                <label className="text-sm text-slate-500">Description</label>
                <p className="text-slate-900 mt-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {selectedProject.description}
                </p>
              </div>
            )}

            {/* Editable Quotation */}
            <div className="border-t border-slate-200 pt-4">
              <h4 className="font-medium text-slate-900 mb-3">Update Quotation</h4>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Material Cost (₱)"
                  type="number"
                  value={formData.materialCost}
                  onChange={(e) => setFormData({ ...formData, materialCost: e.target.value })}
                />
                <Input
                  label="Labor Cost (₱)"
                  type="number"
                  value={formData.laborCost}
                  onChange={(e) => setFormData({ ...formData, laborCost: e.target.value })}
                />
                <Input
                  label="Est. Days"
                  type="number"
                  value={formData.estimatedDays}
                  onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowDetailsModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateQuotation}
                loading={processing}
                className="bg-slate-900 hover:bg-slate-800 focus:ring-slate-500 text-white"
              >
                Update Quotation
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProjectList;
