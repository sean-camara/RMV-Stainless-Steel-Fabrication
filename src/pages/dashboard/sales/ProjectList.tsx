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
      const response = await projectApi.getAll({
        page: currentPage,
        limit: 10,
        status: statusFilter || undefined,
      });
      setProjects(response.data.projects || []);
      setTotalPages(Math.ceil((response.data.total || 0) / 10));
    } catch (error) {
      toast.error('Failed to load projects');
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
    return <PageLoader text="Loading projects..." />;
  }

  return (
    <div className="space-y-6 md:space-y-8 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 sm:gap-6 pt-1">
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Sales • Projects</p>
          <h1 className="text-2xl font-bold text-slate-900">Project Management</h1>
          <p className="text-slate-600">Create projects, update quotations, and keep clients moving.</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="w-4 h-4" />}
          className="bg-slate-900 hover:bg-slate-800 focus:ring-slate-500 text-white"
        >
          New Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card variant="light" className="min-w-0">
          <CardContent className="flex items-center gap-3 sm:gap-4 py-4 min-w-0">
            <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-slate-900 leading-tight">{projects.length}</p>
              <p className="text-sm text-slate-500 leading-snug break-words">Total Projects</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="light" className="min-w-0">
          <CardContent className="flex items-center gap-3 sm:gap-4 py-4 min-w-0">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-slate-900 leading-tight">
                {projects.filter((p) => p.status === 'blueprint_pending').length}
              </p>
              <p className="text-sm text-slate-500 leading-snug break-words">Awaiting Blueprint</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="light" className="min-w-0">
          <CardContent className="flex items-center gap-3 sm:gap-4 py-4 min-w-0">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Edit className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-slate-900 leading-tight">
                {projects.filter((p) => p.status === 'in_fabrication').length}
              </p>
              <p className="text-sm text-slate-500 leading-snug break-words">In Fabrication</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="light" className="min-w-0">
          <CardContent className="flex items-center gap-3 sm:gap-4 py-4 min-w-0">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-slate-900 leading-tight">
                ₱{projects.reduce((sum, p) => sum + (p.quotation?.totalAmount || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-slate-500 leading-snug break-words">Total Value</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="light">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex-1">
              <Input
                placeholder="Search by project name or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
                variant="light"
              />
            </div>
            <div className="w-full md:w-56">
              <Select
                value={statusFilter}
                variant="minimal"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'blueprint_pending', label: 'Blueprint Pending' },
                  { value: 'blueprint_uploaded', label: 'Blueprint Uploaded' },
                  { value: 'client_approved', label: 'Client Approved' },
                  { value: 'client_rejected', label: 'Client Rejected' },
                  { value: 'dp_pending', label: 'DP Pending' },
                  { value: 'in_fabrication', label: 'In Fabrication' },
                  { value: 'fabrication_done', label: 'Fabrication Done' },
                  { value: 'ready_for_pickup', label: 'Ready for Pickup' },
                  { value: 'released', label: 'Released' },
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card variant="light" className="min-w-0">
        <CardHeader variant="light">
          <CardTitle variant="light" className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-cyan-500" />
            Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table variant="light">
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableEmpty
                  colSpan={6}
                  message="No projects found"
                  icon={<Briefcase className="w-12 h-12 text-slate-400" />}
                />
              ) : (
                filteredProjects.map((project) => (
                  <TableRow key={project._id}>
                    <TableCell>
                      <p className="font-semibold text-slate-900">{project.projectName}</p>
                      <p className="text-sm text-slate-500 max-w-xs truncate">
                        {project.description || 'No description'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-slate-900 font-medium">
                            {project.customerId?.firstName} {project.customerId?.lastName}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={project.status} />
                    </TableCell>
                    <TableCell>
                      <p className="text-slate-900 font-semibold">
                        ₱{project.quotation?.totalAmount?.toLocaleString() || '0'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-slate-500">
                        {format(new Date(project.createdAt), 'MMM d, yyyy')}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setFormData({
                            customerId: project.customerId?._id || '',
                            projectName: project.projectName || '',
                            description: project.description || '',
                            materialCost: String(project.quotation?.materialCost || ''),
                            laborCost: String(project.quotation?.laborCost || ''),
                            estimatedDays: String(project.quotation?.estimatedDays || ''),
                          });
                          setShowDetailsModal(true);
                        }}
                        icon={<Eye className="w-4 h-4" />}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

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
