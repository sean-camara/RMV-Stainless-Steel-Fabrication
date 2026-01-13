import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Hammer,
  CheckCircle,
  Clock,
  Eye,
  User,
  Play,
  Filter,
  Search,
  Package,
  PackageCheck,
  Truck,
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
  ConfirmModal,
} from '../../../components/ui';
import { Project } from '../../../types';
import toast from 'react-hot-toast';
import { useNotification } from '../../../contexts/NotificationContext';

const FabricationQueue: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'start' | 'complete' | 'ready' | 'release' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [fabricationNotes, setFabricationNotes] = useState('');
  const [progressValue, setProgressValue] = useState(0);
  const { notify } = useNotification();

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let data: any;
      try {
        const response = await projectApi.getFabrication();
        data = response?.data || response;
      } catch (err) {
        const fallback = await projectApi.getAll({ status: statusFilter || undefined });
        data = fallback?.data || fallback;
      }
      const fabricationStatuses = [
        'dp_pending',
        'pending_initial_payment',
        'pending_midpoint_payment',
        'midpoint_payment_verified',
        'in_fabrication',
        'fabrication_done',
        'ready_for_pickup',
      ];
      const list: Project[] = (data.projects || []).filter((p: Project) => {
        if (statusFilter) return p.status === statusFilter;
        return fabricationStatuses.includes(p.status);
      });
      setProjects(list);
    } catch (error) {
      toast.error('Failed to load projects');
      notify({ type: 'error', title: 'Fabrication queue unavailable', message: 'Could not load projects' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartFabrication = async () => {
    if (!selectedProject) return;

    setProcessing(true);
    try {
      await projectApi.updateStatus(selectedProject._id, {
        status: 'in_fabrication',
        notes: fabricationNotes,
      });
      toast.success('Fabrication started');
      notify({ type: 'success', title: 'Fabrication started', message: selectedProject.projectName || 'Project' });
      setShowConfirm(false);
      setShowDetails(false);
      setFabricationNotes('');
      fetchProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
      notify({ type: 'error', title: 'Fabrication start failed', message: error.response?.data?.message || 'Unable to update status' });
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteFabrication = async () => {
    if (!selectedProject) return;

    setProcessing(true);
    try {
      await projectApi.updateStatus(selectedProject._id, {
        status: 'fabrication_done',
        notes: fabricationNotes,
      });
      toast.success('Fabrication marked as complete');
      notify({ type: 'success', title: 'Fabrication complete', message: selectedProject.projectName || 'Project' });
      setShowConfirm(false);
      setShowDetails(false);
      setFabricationNotes('');
      fetchProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
      notify({ type: 'error', title: 'Completion failed', message: error.response?.data?.message || 'Unable to update status' });
    } finally {
      setProcessing(false);
    }
  };

  const handleReadyForPickup = async () => {
    if (!selectedProject) return;

    setProcessing(true);
    try {
      await projectApi.updateStatus(selectedProject._id, {
        status: 'ready_for_pickup',
        notes: fabricationNotes,
      });
      toast.success('Marked as ready for pickup');
      notify({ type: 'success', title: 'Ready for pickup', message: selectedProject.projectName || 'Project' });
      setShowConfirm(false);
      setShowDetails(false);
      setFabricationNotes('');
      fetchProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
      notify({ type: 'error', title: 'Ready-for-pickup failed', message: error.response?.data?.message || 'Unable to update status' });
    } finally {
      setProcessing(false);
    }
  };

  const handleReleaseProject = async () => {
    if (!selectedProject) return;

    setProcessing(true);
    try {
      await projectApi.updateStatus(selectedProject._id, {
        status: 'released',
        notes: fabricationNotes,
      });
      toast.success('Project released');
      notify({ type: 'success', title: 'Project released', message: selectedProject.projectName || 'Project' });
      setShowConfirm(false);
      setShowDetails(false);
      setFabricationNotes('');
      fetchProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
      notify({ type: 'error', title: 'Release failed', message: error.response?.data?.message || 'Unable to update status' });
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateProgress = async () => {
    if (!selectedProject) return;

    setProcessing(true);
    try {
      await projectApi.updateFabricationProgress(selectedProject._id, Number(progressValue), fabricationNotes);
      toast.success('Progress updated');
      notify({ type: 'success', title: 'Progress updated', message: `${progressValue}% • ${selectedProject.projectName || 'Project'}` });
      fetchProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update progress');
      notify({ type: 'error', title: 'Progress update failed', message: error.response?.data?.message || 'Unable to update progress' });
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

  // Stats
  const inQueue = projects.filter((p) => ['dp_pending', 'pending_initial_payment'].includes(p.status)).length;
  const inProgress = projects.filter((p) => p.status === 'in_fabrication').length;
  const completed = projects.filter((p) => p.status === 'fabrication_done').length;
  const readyForPickup = projects.filter((p) => p.status === 'ready_for_pickup').length;

  if (loading) {
    return <PageLoader text="Loading fabrication queue..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Fabrication Queue</h1>
        <p className="text-slate-400 mt-1">Manage and track fabrication progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{inQueue}</p>
              <p className="text-sm text-yellow-200">Awaiting DP</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Hammer className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{inProgress}</p>
              <p className="text-sm text-blue-200">In Progress</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{completed}</p>
              <p className="text-sm text-green-200">Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{readyForPickup}</p>
              <p className="text-sm text-purple-200">Ready for Pickup</p>
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
                  { value: 'dp_pending', label: 'Awaiting DP' },
                  { value: 'pending_initial_payment', label: 'Awaiting DP (alias)' },
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
            Fabrication Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Est. Days</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableEmpty
                  colSpan={5}
                  message="No projects in queue"
                  icon={<Hammer className="w-12 h-12 text-slate-600" />}
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
                      <span className="text-slate-300">
                        {project.quotation?.estimatedDays || '-'} days
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProject(project);
                            setProgressValue(project.fabrication?.progress || 0);
                            setShowDetails(true);
                          }}
                          icon={<Eye className="w-4 h-4" />}
                        >
                          View
                        </Button>
                        {['dp_pending', 'pending_initial_payment'].includes(project.status) && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedProject(project);
                              setProgressValue(project.fabrication?.progress || 0);
                              setConfirmAction('start');
                              setShowConfirm(true);
                            }}
                            icon={<Play className="w-4 h-4" />}
                          >
                            Start
                          </Button>
                        )}
                        {project.status === 'in_fabrication' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setSelectedProject(project);
                              setProgressValue(project.fabrication?.progress || 0);
                              setConfirmAction('complete');
                              setShowConfirm(true);
                            }}
                            icon={<CheckCircle className="w-4 h-4" />}
                          >
                            Complete
                          </Button>
                        )}
                        {project.status === 'fabrication_done' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setSelectedProject(project);
                              setProgressValue(project.fabrication?.progress || 100);
                              setConfirmAction('ready');
                              setShowConfirm(true);
                            }}
                            icon={<PackageCheck className="w-4 h-4" />}
                          >
                            Ready for Pickup
                          </Button>
                        )}
                        {project.status === 'ready_for_pickup' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedProject(project);
                              setProgressValue(project.fabrication?.progress || 100);
                              setConfirmAction('release');
                              setShowConfirm(true);
                            }}
                            icon={<Truck className="w-4 h-4" />}
                          >
                            Release
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

      {/* Project Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedProject(null);
          setFabricationNotes('');
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
                <label className="text-sm text-slate-400">Estimated Duration</label>
                <p className="text-white">{selectedProject.quotation?.estimatedDays || '-'} days</p>
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

            {/* Blueprint Info */}
            {selectedProject.blueprint && (
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-3">Blueprint</h4>
                <div className="flex items-center justify-between">
                  <p className="text-slate-300">Version {selectedProject.blueprint.version}</p>
                  <a
                    href={selectedProject.blueprint.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline"
                  >
                    View Blueprint PDF
                  </a>
                </div>
              </div>
            )}

            {/* Fabrication Progress */}
            <div className="bg-slate-700/30 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white">Progress</h4>
                <span className="text-sm text-slate-300">{selectedProject.fabrication?.progress ?? 0}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400"
                  style={{ width: `${Math.min(selectedProject.fabrication?.progress || 0, 100)}%` }}
                />
              </div>
              {['in_fabrication', 'fabrication_done'].includes(selectedProject.status) && (
                <div className="grid md:grid-cols-2 gap-3">
                  <Input
                    label="Set progress (%)"
                    type="number"
                    min={0}
                    max={100}
                    value={progressValue}
                    onChange={(e) => setProgressValue(Number(e.target.value))}
                  />
                  <div className="flex md:items-end justify-end">
                    <Button onClick={handleUpdateProgress} loading={processing}>
                      Update Progress
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Quotation */}
            {selectedProject.quotation && (
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-3">Quotation Details</h4>
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
                    <span className="text-sm text-slate-400">Total</span>
                    <p className="text-cyan-400 font-bold">
                      ₱{selectedProject.quotation.totalAmount?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Fabrication Notes Input */}
            {['dp_pending', 'pending_initial_payment', 'in_fabrication', 'fabrication_done', 'ready_for_pickup'].includes(selectedProject.status) && (
              <Textarea
                label="Fabrication Notes"
                placeholder="Add notes about the fabrication process..."
                value={fabricationNotes}
                onChange={(e) => setFabricationNotes(e.target.value)}
                rows={3}
              />
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end border-t border-slate-700 pt-4">
              {['dp_pending', 'pending_initial_payment'].includes(selectedProject.status) && (
                <Button
                  onClick={() => {
                    setConfirmAction('start');
                    setShowConfirm(true);
                  }}
                  icon={<Play className="w-4 h-4" />}
                >
                  Start Fabrication
                </Button>
              )}
              {selectedProject.status === 'in_fabrication' && (
                <Button
                  onClick={() => {
                    setConfirmAction('complete');
                    setShowConfirm(true);
                  }}
                  icon={<CheckCircle className="w-4 h-4" />}
                >
                  Mark as Complete
                </Button>
              )}
              {selectedProject.status === 'fabrication_done' && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setConfirmAction('ready');
                    setShowConfirm(true);
                  }}
                  icon={<PackageCheck className="w-4 h-4" />}
                >
                  Ready for Pickup
                </Button>
              )}
              {selectedProject.status === 'ready_for_pickup' && (
                <Button
                  onClick={() => {
                    setConfirmAction('release');
                    setShowConfirm(true);
                  }}
                  icon={<Truck className="w-4 h-4" />}
                >
                  Release Project
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setConfirmAction(null);
        }}
        onConfirm={
          confirmAction === 'start'
            ? handleStartFabrication
            : confirmAction === 'complete'
              ? handleCompleteFabrication
              : confirmAction === 'ready'
                ? handleReadyForPickup
                : handleReleaseProject
        }
        title={
          confirmAction === 'start'
            ? 'Start Fabrication'
            : confirmAction === 'complete'
              ? 'Complete Fabrication'
              : confirmAction === 'ready'
                ? 'Mark Ready for Pickup'
                : 'Release Project'
        }
        message={
          confirmAction === 'start'
            ? 'Start fabrication for this project?'
            : confirmAction === 'complete'
              ? 'Mark this project as fabrication complete?'
              : confirmAction === 'ready'
                ? 'Confirm this project is ready for pickup?'
                : 'Release this project to the customer?'
        }
        confirmText={
          confirmAction === 'start'
            ? 'Start Fabrication'
            : confirmAction === 'complete'
              ? 'Mark Complete'
              : confirmAction === 'ready'
                ? 'Ready for Pickup'
                : 'Release'
        }
        variant="info"
        loading={processing}
      />
    </div>
  );
};

export default FabricationQueue;
