import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { appointmentApi, userApi } from '../../../api/services';
import toast from 'react-hot-toast';
import { Modal } from '../../../components/ui';

interface Appointment {
  _id: string;
  customer?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  salesStaff?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  scheduledDate: string;
  scheduledTime?: string;
  appointmentType: 'office_consultation' | 'ocular_visit';
  status: 'pending' | 'assigned' | 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  interestedCategory?: string;
  description?: string;
  notes?: {
    customerNotes?: string;
    agentNotes?: string;
  };
  siteAddress?: {
    street?: string;
    city?: string;
    province?: string;
  };
}

interface SalesStaff {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const CANCEL_TEMPLATES = [
  {
    id: 'schedule_conflict',
    title: 'Scheduling conflict',
    message: 'We need to cancel your appointment due to a scheduling conflict. Please choose a new time that works best for you.',
  },
  {
    id: 'team_unavailable',
    title: 'Team unavailable',
    message: 'Our team will not be available at the scheduled time. Please rebook and we will prioritize your next slot.',
  },
  {
    id: 'site_constraints',
    title: 'Site or weather constraints',
    message: 'We need to cancel because of site or weather constraints. Kindly rebook when conditions improve.',
  },
  {
    id: 'custom',
    title: 'Custom message',
    message: '',
  },
];

const AppointmentList: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [salesStaffList, setSalesStaffList] = useState<SalesStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [agentNotes, setAgentNotes] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pendingCancel, setPendingCancel] = useState<Appointment | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(CANCEL_TEMPLATES[0].id);
  const [cancelMessage, setCancelMessage] = useState(CANCEL_TEMPLATES[0].message);
  const [cancelReason, setCancelReason] = useState(CANCEL_TEMPLATES[0].title);

  useEffect(() => {
    fetchAppointments();
    fetchSalesStaff();
  }, [page, statusFilter, dateFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentApi.getAll({
        page,
        limit: 10,
        status: statusFilter || undefined,
        date: dateFilter || undefined,
      });
      const data = response?.data || response;
      setAppointments(data.appointments || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesStaff = async () => {
    try {
      const response = await userApi.getByRole('sales_staff');
      const data = response?.data || response;
      setSalesStaffList(data.users || []);
    } catch (error) {
      console.error('Error fetching sales staff:', error);
      toast.error('Failed to load sales staff');
    }
  };

  const openCancelModal = (appointment: Appointment) => {
    const template = CANCEL_TEMPLATES[0];
    setPendingCancel(appointment);
    setSelectedTemplate(template.id);
    setCancelMessage(template.message);
    setCancelReason(template.title);
    setShowCancelModal(true);
  };

  const handleAssign = async () => {
    if (!selectedAppointment || !selectedStaffId) {
      toast.error('Please select a sales staff member');
      return;
    }
    
    setProcessing(true);
    try {
      await appointmentApi.assign(selectedAppointment._id, selectedStaffId, agentNotes);
      toast.success('Appointment assigned successfully');
      setShowAssignModal(false);
      setSelectedStaffId('');
      setAgentNotes('');
      fetchAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign appointment');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!pendingCancel) return;

    const message = cancelMessage.trim();
    if (!message) {
      toast.error('Please enter a message to send to the customer');
      return;
    }

    setProcessing(true);
    try {
      await appointmentApi.cancel(pendingCancel._id, {
        reason: cancelReason,
        message,
      });
      toast.success('Appointment cancelled and customer notified');
      fetchAppointments();
      setShowCancelModal(false);
      setPendingCancel(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await appointmentApi.complete(id);
      toast.success('Appointment marked as completed');
      fetchAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete appointment');
    }
  };

  const handleNoShow = async (id: string) => {
    try {
      await appointmentApi.markNoShow(id);
      toast.success('Appointment marked as no-show');
      fetchAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update appointment');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      assigned: 'bg-blue-50 text-blue-700 border-blue-200',
      confirmed: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      scheduled: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      no_show: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border ${styles[status] || 'bg-slate-50 text-slate-600'}`}>
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const isOffice = type === 'office_consultation';
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border ${
        isOffice ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-orange-50 text-orange-700 border-orange-200'
      }`}>
        {isOffice ? 'Office' : 'Ocular'}
      </span>
    );
  };

  const filteredAppointments = appointments.filter(apt => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (apt.customer?.firstName || '').toLowerCase().includes(search) ||
      (apt.customer?.lastName || '').toLowerCase().includes(search) ||
      (apt.customer?.email || '').toLowerCase().includes(search)
    );
  });

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    assigned: appointments.filter(a => a.status === 'assigned').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Appointment Management</h1>
          <p className="text-slate-500 text-sm mt-1">Review and manage customer appointments</p>
        </div>
        <button
          onClick={() => fetchAppointments()}
          className="inline-flex items-center justify-center px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: '📅', color: 'bg-slate-50 border-slate-200' },
          { label: 'Pending', value: stats.pending, icon: '⏳', color: 'bg-amber-50 border-amber-200' },
          { label: 'Assigned', value: stats.assigned, icon: '👤', color: 'bg-blue-50 border-blue-200' },
          { label: 'Completed', value: stats.completed, icon: '✅', color: 'bg-emerald-50 border-emerald-200' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} border rounded-2xl p-4`}>
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
            </div>
            <p className="text-sm text-slate-600 mt-2">{stat.label}</p>
          </div>
        ))}
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
              placeholder="Search by customer name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rmv-select w-full sm:w-44"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-slate-900">No appointments found</h3>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Schedule</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Assigned To</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map((apt) => (
                    <tr key={apt._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-medium">
                            {apt.customer?.firstName?.[0] || 'C'}{apt.customer?.lastName?.[0] || ''}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{apt.customer?.firstName || 'Customer'} {apt.customer?.lastName || ''}</p>
                            <p className="text-sm text-slate-500">{apt.customer?.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{format(new Date(apt.scheduledDate), 'MMM d, yyyy')}</p>
                        <p className="text-sm text-slate-500">{apt.scheduledTime || 'TBD'}</p>
                      </td>
                      <td className="px-6 py-4">{getTypeBadge(apt.appointmentType)}</td>
                      <td className="px-6 py-4">{getStatusBadge(apt.status)}</td>
                      <td className="px-6 py-4">
                        {apt.salesStaff ? (
                          <span className="text-slate-900 font-medium">{apt.salesStaff.firstName} {apt.salesStaff.lastName}</span>
                        ) : (
                          <span className="text-slate-400 text-sm">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setSelectedAppointment(apt); setShowDetailsModal(true); }}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {apt.status === 'pending' && (
                            <button
                              onClick={() => { setSelectedAppointment(apt); setShowAssignModal(true); }}
                              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Assign"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                              </svg>
                            </button>
                          )}
                          {['pending', 'assigned', 'confirmed', 'scheduled'].includes(apt.status) && (
                            <button
                              onClick={() => openCancelModal(apt)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancel"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filteredAppointments.map((apt) => (
                <div key={apt._id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-medium text-sm">
                        {apt.customer?.firstName?.[0] || 'C'}{apt.customer?.lastName?.[0] || ''}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{apt.customer?.firstName || 'Customer'} {apt.customer?.lastName || ''}</p>
                        <p className="text-sm text-slate-500">{format(new Date(apt.scheduledDate), 'MMM d')} • {apt.scheduledTime || 'TBD'}</p>
                      </div>
                    </div>
                    {getStatusBadge(apt.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {getTypeBadge(apt.appointmentType)}
                      {apt.salesStaff && (
                        <span className="text-xs text-slate-500">→ {apt.salesStaff.firstName}</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setSelectedAppointment(apt); setShowDetailsModal(true); }}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                      {apt.status === 'pending' && (
                        <button
                          onClick={() => { setSelectedAppointment(apt); setShowAssignModal(true); }}
                          className="p-2 text-blue-500 hover:text-blue-700 rounded-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                        </button>
                      )}
                      {['pending', 'assigned', 'confirmed', 'scheduled'].includes(apt.status) && (
                        <button
                          onClick={() => openCancelModal(apt)}
                          className="p-2 text-red-400 hover:text-red-600 rounded-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-600">Page {page} of {totalPages}</p>
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

      {/* Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Appointment Details</h3>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-medium">
                  {selectedAppointment.customer?.firstName?.[0] || 'C'}{selectedAppointment.customer?.lastName?.[0] || ''}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{selectedAppointment.customer?.firstName} {selectedAppointment.customer?.lastName}</p>
                  <p className="text-sm text-slate-500">{selectedAppointment.customer?.email}</p>
                  {selectedAppointment.customer?.phone && (
                    <p className="text-sm text-slate-500">{selectedAppointment.customer?.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Date</p>
                  <p className="font-medium text-slate-900">{format(new Date(selectedAppointment.scheduledDate), 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Time</p>
                  <p className="font-medium text-slate-900">{selectedAppointment.scheduledTime || 'TBD'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Type</p>
                  <div className="mt-1">{getTypeBadge(selectedAppointment.appointmentType)}</div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
                </div>
              </div>

              {selectedAppointment.interestedCategory && (
                <div>
                  <p className="text-sm text-slate-500">Interested In</p>
                  <p className="font-medium text-slate-900">{selectedAppointment.interestedCategory}</p>
                </div>
              )}

              {selectedAppointment.description && (
                <div>
                  <p className="text-sm text-slate-500">Description</p>
                  <p className="text-slate-900">{selectedAppointment.description}</p>
                </div>
              )}

              {selectedAppointment.siteAddress && (
                <div>
                  <p className="text-sm text-slate-500">Site Address</p>
                  <p className="text-slate-900">
                    {[selectedAppointment.siteAddress.street, selectedAppointment.siteAddress.city, selectedAppointment.siteAddress.province].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}

              {selectedAppointment.salesStaff && (
                <div>
                  <p className="text-sm text-slate-500">Assigned Sales Staff</p>
                  <p className="font-medium text-slate-900">{selectedAppointment.salesStaff.firstName} {selectedAppointment.salesStaff.lastName}</p>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3 justify-end">
              <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl">
                Close
              </button>
              {selectedAppointment.status === 'pending' && (
                <button
                  onClick={() => { setShowDetailsModal(false); setShowAssignModal(true); }}
                  className="px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800"
                >
                  Assign Staff
                </button>
              )}
              {selectedAppointment.status === 'confirmed' && (
                <>
                  <button
                    onClick={() => { handleComplete(selectedAppointment._id); setShowDetailsModal(false); }}
                    className="px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700"
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => { handleNoShow(selectedAppointment._id); setShowDetailsModal(false); }}
                    className="px-4 py-2.5 bg-slate-600 text-white text-sm font-medium rounded-xl hover:bg-slate-700"
                  >
                    No Show
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Assign Sales Staff</h3>
              <button onClick={() => { setShowAssignModal(false); setSelectedStaffId(''); setAgentNotes(''); }} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-2">Appointment for</p>
                <p className="font-medium text-slate-900">{selectedAppointment.customer?.firstName} {selectedAppointment.customer?.lastName}</p>
                <p className="text-sm text-slate-500">{format(new Date(selectedAppointment.scheduledDate), 'MMM d, yyyy')} • {selectedAppointment.scheduledTime || 'TBD'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Sales Staff *</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="rmv-select"
                >
                  <option value="">Choose a sales staff member</option>
                  {salesStaffList.map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      {staff.firstName} {staff.lastName} - {staff.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Agent Notes (Optional)</label>
                <textarea
                  value={agentNotes}
                  onChange={(e) => setAgentNotes(e.target.value)}
                  placeholder="Add any notes for the sales staff..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-none"
                />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3 justify-end">
              <button
                onClick={() => { setShowAssignModal(false); setSelectedStaffId(''); setAgentNotes(''); }}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={processing || !selectedStaffId}
                className="px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 disabled:opacity-50"
              >
                {processing ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={showCancelModal}
        onClose={() => { setShowCancelModal(false); setPendingCancel(null); }}
        title="Cancel Appointment"
        size="lg"
        variant="light"
      >
        <div className="space-y-5">
          {pendingCancel && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-sm font-medium text-slate-700">Cancelling for</p>
              <p className="text-lg font-semibold text-slate-900">{pendingCancel.customer?.firstName} {pendingCancel.customer?.lastName}</p>
              <p className="text-sm text-slate-600">{format(new Date(pendingCancel.scheduledDate), 'MMM d, yyyy')} • {pendingCancel.scheduledTime || 'TBD'} ({pendingCancel.appointmentType === 'ocular_visit' ? 'Ocular' : 'Office'})</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">Pick a message to send</p>
            <div className="space-y-2">
              {CANCEL_TEMPLATES.map((template) => (
                <label
                  key={template.id}
                  className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                    selectedTemplate === template.id
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    className="mt-1"
                    checked={selectedTemplate === template.id}
                    onChange={() => {
                      setSelectedTemplate(template.id);
                      setCancelReason(template.title);
                      setCancelMessage(template.id === 'custom' ? '' : template.message);
                    }}
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{template.title}</p>
                    <p className="text-sm text-slate-600">{template.message || 'Write a custom message below.'}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 mb-2">Message to customer</label>
            <textarea
              value={cancelMessage}
              onChange={(e) => setCancelMessage(e.target.value)}
              placeholder="Tell the customer why you’re cancelling and how to rebook..."
              rows={4}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">This message is emailed to the customer along with the cancellation notice.</p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setShowCancelModal(false); setPendingCancel(null); }}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl"
              disabled={processing}
            >
              Keep appointment
            </button>
            <button
              onClick={handleCancel}
              disabled={processing}
              className="px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 disabled:opacity-50"
            >
              {processing ? 'Cancelling...' : 'Cancel appointment'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AppointmentList;
