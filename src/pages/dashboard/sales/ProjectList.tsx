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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Management</h1>
          <p className="text-slate-400 mt-1">Create and manage customer projects</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          New Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{projects.length}</p>
              <p className="text-sm text-slate-400">Total Projects</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {projects.filter((p) => p.status === 'blueprint_pending').length}
              </p>
              <p className="text-sm text-slate-400">Awaiting Blueprint</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Edit className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {projects.filter((p) => p.status === 'in_fabrication').length}
              </p>
              <p className="text-sm text-slate-400">In Fabrication</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                ₱{projects.reduce((sum, p) => sum + (p.quotation?.totalAmount || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-slate-400">Total Value</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by project name or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-full md:w-56">
              <Select
                value={statusFilter}
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-cyan-400" />
            Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
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
                  icon={<Briefcase className="w-12 h-12 text-slate-600" />}
                />
              ) : (
                filteredProjects.map((project) => (
                  <TableRow key={project._id}>
                    <TableCell>
                      <p className="font-medium text-white">{project.projectName}</p>
                      <p className="text-sm text-slate-400 max-w-xs truncate">
                        {project.description || 'No description'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-slate-300" />
                        </div>
                        <div>
                          <p className="text-white">
                            {project.customerId?.firstName} {project.customerId?.lastName}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={project.status} />
                    </TableCell>
                    <TableCell>
                      <p className="text-white font-medium">
                        ₱{project.quotation?.totalAmount?.toLocaleString() || '0'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-slate-400">
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
      >
        <div className="space-y-4">
          <Input
            label="Customer ID"
            placeholder="Enter customer ID"
            value={formData.customerId}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            required
          />
          <Input
            label="Project Name"
            placeholder="Enter project name"
            value={formData.projectName}
            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            placeholder="Enter project description..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />

          <div className="border-t border-slate-700 pt-4">
            <h4 className="font-medium text-white mb-3">Quotation Details</h4>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Material Cost (₱)"
                type="number"
                placeholder="0.00"
                value={formData.materialCost}
                onChange={(e) => setFormData({ ...formData, materialCost: e.target.value })}
              />
              <Input
                label="Labor Cost (₱)"
                type="number"
                placeholder="0.00"
                value={formData.laborCost}
                onChange={(e) => setFormData({ ...formData, laborCost: e.target.value })}
              />
              <Input
                label="Est. Days"
                type="number"
                placeholder="0"
                value={formData.estimatedDays}
                onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
              />
            </div>
            <div className="mt-3 p-3 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-400">Total Amount</p>
              <p className="text-xl font-bold text-cyan-400">
                ₱{(
                  (parseFloat(formData.materialCost) || 0) +
                  (parseFloat(formData.laborCost) || 0)
                ).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} loading={processing}>
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
                <label className="text-sm text-slate-400">Project Name</label>
                <p className="text-white font-medium">{selectedProject.projectName}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Status</label>
                <div className="mt-1">
                  <StatusBadge status={selectedProject.status} />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400">Customer</label>
                <p className="text-white">
                  {selectedProject.customerId?.firstName} {selectedProject.customerId?.lastName}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Created</label>
                <p className="text-white">
                  {format(new Date(selectedProject.createdAt), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>

            {selectedProject.description && (
              <div>
                <label className="text-sm text-slate-400">Description</label>
                <p className="text-white mt-1 bg-slate-700/50 p-3 rounded-lg">
                  {selectedProject.description}
                </p>
              </div>
            )}

            {/* Editable Quotation */}
            <div className="border-t border-slate-700 pt-4">
              <h4 className="font-medium text-white mb-3">Update Quotation</h4>
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
              <Button onClick={handleUpdateQuotation} loading={processing}>
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
