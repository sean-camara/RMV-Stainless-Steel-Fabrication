import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  FileText,
  Upload,
  Eye,
  User,
  Clock,
  CheckCircle,
  XCircle,
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
} from '../../../components/ui';
import { Project } from '../../../types';
import toast from 'react-hot-toast';
import { useNotification } from '../../../contexts/NotificationContext';

const BlueprintManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [blueprintFile, setBlueprintFile] = useState<File | null>(null);
  const [blueprintNotes, setBlueprintNotes] = useState('');
  const { notify } = useNotification();

  // Filters
  const [statusFilter, setStatusFilter] = useState('blueprint_pending');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await projectApi.getAll({
        status: statusFilter || undefined,
      });
      setProjects(response.data.projects || []);
    } catch (error) {
      toast.error('Failed to load projects');
      notify({ type: 'error', title: 'Blueprints unavailable', message: 'Could not load projects' });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadBlueprint = async () => {
    if (!selectedProject || !blueprintFile) {
      toast.error('Please select a blueprint file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('blueprint', blueprintFile);
      formData.append('notes', blueprintNotes);

      await projectApi.uploadBlueprint(selectedProject._id, formData);
      toast.success('Blueprint uploaded successfully!');
      notify({ type: 'success', title: 'Blueprint uploaded', message: selectedProject.projectName || 'Project' });
      setShowUploadModal(false);
      setBlueprintFile(null);
      setBlueprintNotes('');
      fetchProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload blueprint');
      notify({ type: 'error', title: 'Upload failed', message: error.response?.data?.message || 'Unable to upload blueprint' });
    } finally {
      setUploading(false);
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

  // Stats
  const pendingCount = projects.filter((p) => p.status === 'blueprint_pending').length;
  const rejectedCount = projects.filter((p) => p.status === 'client_rejected').length;
  const uploadedCount = projects.filter((p) => p.status === 'blueprint_uploaded').length;

  if (loading) {
    return <PageLoader text="Loading projects..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Blueprint Management</h1>
        <p className="text-slate-400 mt-1">Upload and manage project blueprints</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pendingCount}</p>
              <p className="text-sm text-yellow-200">Pending Upload</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{rejectedCount}</p>
              <p className="text-sm text-red-200">Need Revision</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{uploadedCount}</p>
              <p className="text-sm text-cyan-200">Awaiting Approval</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {projects.filter((p) => p.status === 'client_approved').length}
              </p>
              <p className="text-sm text-green-200">Approved</p>
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
                placeholder="Search by project or customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-full md:w-56">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'blueprint_pending', label: 'Pending Upload' },
                  { value: 'blueprint_uploaded', label: 'Awaiting Approval' },
                  { value: 'client_rejected', label: 'Need Revision' },
                  { value: 'client_approved', label: 'Approved' },
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
                <TableHead>Blueprint</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableEmpty
                  colSpan={5}
                  message="No projects found"
                  icon={<FileText className="w-12 h-12 text-slate-600" />}
                />
              ) : (
                filteredProjects.map((project) => (
                  <TableRow key={project._id}>
                    <TableCell>
                      <p className="font-medium text-white">{project.projectName}</p>
                      <p className="text-sm text-slate-400">
                        Created {format(new Date(project.createdAt), 'MMM d, yyyy')}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-slate-300" />
                        </div>
                        <span className="text-white">
                          {project.customerId?.firstName} {project.customerId?.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={project.status} />
                    </TableCell>
                    <TableCell>
                      {project.blueprint ? (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-cyan-400" />
                          <span className="text-slate-300">
                            v{project.blueprint.version}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Not uploaded</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProject(project);
                            setShowDetailsModal(true);
                          }}
                          icon={<Eye className="w-4 h-4" />}
                        >
                          View
                        </Button>
                        {['blueprint_pending', 'client_rejected'].includes(project.status) && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedProject(project);
                              setShowUploadModal(true);
                            }}
                            icon={<Upload className="w-4 h-4" />}
                          >
                            Upload
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Upload Blueprint Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedProject(null);
          setBlueprintFile(null);
          setBlueprintNotes('');
        }}
        title="Upload Blueprint"
        size="md"
      >
        {selectedProject && (
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <h4 className="font-medium text-white mb-2">{selectedProject.projectName}</h4>
              <p className="text-sm text-slate-400">
                Customer: {selectedProject.customerId?.firstName}{' '}
                {selectedProject.customerId?.lastName}
              </p>
              {selectedProject.blueprint && (
                <p className="text-sm text-cyan-400 mt-2">
                  Current version: v{selectedProject.blueprint.version}
                </p>
              )}
            </div>

            {/* Client Feedback (if rejected) */}
            {selectedProject.status === 'client_rejected' && selectedProject.blueprint?.clientFeedback && (
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                <h4 className="font-medium text-red-400 mb-2">Client Feedback</h4>
                <p className="text-slate-300">{selectedProject.blueprint.clientFeedback}</p>
              </div>
            )}

            {/* Upload Form */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Blueprint File (PDF) *
              </label>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-cyan-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setBlueprintFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="blueprint-upload"
                />
                <label htmlFor="blueprint-upload" className="cursor-pointer">
                  {blueprintFile ? (
                    <div className="flex items-center justify-center gap-2 text-cyan-400">
                      <FileText className="w-5 h-5" />
                      <span>{blueprintFile.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-300">Click to upload blueprint PDF</p>
                      <p className="text-xs text-slate-500 mt-1">PDF up to 25MB</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <Textarea
              label="Engineer Notes"
              placeholder="Add any technical notes about the blueprint..."
              value={blueprintNotes}
              onChange={(e) => setBlueprintNotes(e.target.value)}
              rows={3}
            />

            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUploadBlueprint}
                loading={uploading}
                disabled={!blueprintFile}
                icon={<Upload className="w-4 h-4" />}
              >
                Upload Blueprint
              </Button>
            </div>
          </div>
        )}
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

            {/* Quotation Info */}
            {selectedProject.quotation && (
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-3">Quotation</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-slate-400">Material Cost</span>
                    <p className="text-white">
                      ₱{selectedProject.quotation.materialCost?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-400">Labor Cost</span>
                    <p className="text-white">
                      ₱{selectedProject.quotation.laborCost?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-400">Est. Days</span>
                    <p className="text-white">{selectedProject.quotation.estimatedDays}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Blueprint History */}
            {selectedProject.blueprint && (
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-3">Current Blueprint</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-10 h-10 text-cyan-400" />
                    <div>
                      <p className="text-white">Version {selectedProject.blueprint.version}</p>
                      <p className="text-sm text-slate-400">
                        Uploaded {selectedProject.blueprint.uploadedAt ? format(new Date(selectedProject.blueprint.uploadedAt), 'MMM d, yyyy h:mm a') : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <a
                    href={selectedProject.blueprint.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline text-sm"
                  >
                    View PDF
                  </a>
                </div>
                {selectedProject.blueprint.clientFeedback && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded">
                    <p className="text-sm text-slate-400">Client Feedback:</p>
                    <p className="text-slate-300">{selectedProject.blueprint.clientFeedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BlueprintManagement;
