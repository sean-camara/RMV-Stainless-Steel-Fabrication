import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { appointmentApi, userApi } from '../../../api/services';
import toast from 'react-hot-toast';
import { Modal } from '../../../components/ui';
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  User, 
  Mail, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  ArrowRight,
  Phone,
  MapPin,
  FileText
} from 'lucide-react';

// Helper function to get customer name from nested profile or direct properties
const getCustomerName = (customer: any) => {
  const firstName = customer?.profile?.firstName || customer?.firstName || 'Unknown';
  const lastName = customer?.profile?.lastName || customer?.lastName || '';
  return { firstName, lastName, fullName: `${firstName} ${lastName}`.trim() };
};

interface Appointment {
  _id: string;
  customer?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      phone?: string;
    };
  };
  salesStaff?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
  assignedSalesStaff?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
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
  salesAcceptance?: {
    accepted: boolean;
    acceptedAt?: string;
    rescheduleRequested?: boolean;
    rescheduleReason?: string;
  };
}

interface SalesStaff {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
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
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement | null>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [agentNotes, setAgentNotes] = useState('');
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pendingCancel, setPendingCancel] = useState<Appointment | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(CANCEL_TEMPLATES[0].id);
  const [cancelMessage, setCancelMessage] = useState(CANCEL_TEMPLATES[0].message);
  const [cancelReason, setCancelReason] = useState(CANCEL_TEMPLATES[0].title);

  useEffect(() => {
    fetchAppointments();
    fetchSalesStaff();
  }, [page, statusFilter, dateFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setStatusMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      // Only fetch if we don't have data already
      if (salesStaffList.length > 0) return;
      
      const response = await userApi.getByRole('sales_staff');
      const staffList = response?.data?.users || response?.users || (Array.isArray(response) ? response : []);
      console.log('Fetched sales staff:', staffList); // Debug log
      setSalesStaffList(staffList);
    } catch (error: any) {
      console.error('Error fetching sales staff:', error);
      // Don't show error toast if it's a rate limit issue, just log it
      if (error.response?.status !== 429) {
        toast.error('Failed to load sales staff');
      }
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

  const getStatusBadge = (status: string, apt?: Appointment) => {
    // Check if assigned but waiting for sales staff acceptance
    if (apt && apt.assignedSalesStaff && !apt.salesAcceptance?.accepted && status !== 'cancelled' && status !== 'completed') {
      if (apt.salesAcceptance?.rescheduleRequested) {
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border ring-1 ring-inset bg-orange-50 text-orange-700 border-orange-200 ring-orange-500/30">
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-orange-500 animate-pulse"></span>
            Reassignment Requested
          </span>
        );
      }
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border ring-1 ring-inset bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-amber-500 animate-pulse"></span>
          Waiting for Sales Approval
        </span>
      );
    }
    
    const styles: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/30',
      assigned: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/30',
      confirmed: 'bg-cyan-50 text-cyan-700 border-cyan-200 ring-cyan-500/30',
      scheduled: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/30',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/30',
      cancelled: 'bg-red-50 text-red-700 border-red-200 ring-red-500/30',
      no_show: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/30',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border ring-1 ring-inset ${styles[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-current opacity-60'}`}></span>
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const isOffice = type === 'office_consultation';
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border ${
        isOffice 
          ? 'bg-purple-50 text-purple-700 border-purple-200' 
          : 'bg-orange-50 text-orange-700 border-orange-200'
      }`}>
        <Briefcase className="w-3 h-3" />
        {isOffice ? 'Office' : 'Ocular'}
      </span>
    );
  };

  const filteredAppointments = appointments.filter(apt => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const { firstName, lastName } = getCustomerName(apt.customer);
    return (
      firstName.toLowerCase().includes(search) ||
      lastName.toLowerCase().includes(search) ||
      (apt.customer?.email || '').toLowerCase().includes(search)
    );
  });

  const statusPriority: Record<string, number> = {
    pending: 0,
    scheduled: 1,
    assigned: 2,
    confirmed: 3,
    in_progress: 4,
    completed: 5,
    cancelled: 6,
    no_show: 7,
  };

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const priorityA = statusPriority[a.status] ?? 99;
    const priorityB = statusPriority[b.status] ?? 99;
    if (priorityA !== priorityB) return priorityA - priorityB;
    const timeA = new Date(a.scheduledDate).getTime();
    const timeB = new Date(b.scheduledDate).getTime();
    return timeB - timeA;
  });

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    assigned: appointments.filter(a => a.status === 'assigned').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no_show', label: 'No Show' },
  ];

  const selectedStatusLabel =
    statusOptions.find((option) => option.value === statusFilter)?.label || 'All Status';

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 min-h-screen p-4 md:p-6 lg:p-8 space-y-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointment Management</h1>
          <p className="text-slate-500 text-sm mt-1">Review and manage customer appointments</p>
        </div>
        <button
          onClick={() => fetchAppointments()}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:bg-slate-50 transition-all active:scale-95"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Appointments', value: stats.total, icon: Calendar, color: 'blue' },
          { label: 'Pending Action', value: stats.pending, icon: AlertCircle, color: 'amber' },
          { label: 'Assigned', value: stats.assigned, icon: UserPlus, color: 'indigo' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'emerald' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/70 backdrop-blur-sm border border-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-${stat.color}-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className={`text-xs font-bold uppercase tracking-wider text-${stat.color}-600/80`}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white p-4 shadow-sm relative z-30 overflow-visible">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
          <div className="flex gap-4 relative z-30">
            <div className="relative min-w-[180px] z-40" ref={statusMenuRef}>
              <button
                type="button"
                onClick={() => setStatusMenuOpen((open) => !open)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
              >
                <span>{selectedStatusLabel}</span>
                <ChevronRight
                  className={`w-4 h-4 text-slate-500 transition-transform ${statusMenuOpen ? 'rotate-90' : ''}`}
                />
              </button>
              {statusMenuOpen && (
                <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                  <div className="px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-slate-400 font-bold bg-slate-50">
                    Filter Status
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value || 'all'}
                        type="button"
                        onClick={() => {
                          setStatusFilter(option.value);
                          setPage(1);
                          setStatusMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                          statusFilter === option.value
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer hover:bg-slate-50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white overflow-hidden shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium animate-pulse">Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <Calendar className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No appointments found</h3>
            <p className="text-slate-500 mt-1 max-w-sm">
              We couldn't find any appointments matching your filters. Try adjusting your search criteria.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter(''); setDateFilter(''); }}
              className="mt-6 px-6 py-2 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-xl hover:bg-indigo-100 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Schedule</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedAppointments.map((apt) => {
                    const customer = getCustomerName(apt.customer);
                    return (
                    <tr key={apt._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm border border-indigo-100">
                            {customer.firstName?.[0] || 'C'}{customer.lastName?.[0] || ''}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{customer.fullName}</p>
                            <p className="text-xs text-slate-500 font-medium">{apt.customer?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <Calendar className="w-4 h-4 text-slate-400" />
                           <span className="font-medium text-slate-700">{format(new Date(apt.scheduledDate), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                           <Clock className="w-4 h-4 text-slate-400" />
                           <span className="text-xs font-medium text-slate-500">{apt.scheduledTime || 'TBD'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getTypeBadge(apt.appointmentType)}</td>
                      <td className="px-6 py-4">{getStatusBadge(apt.status, apt)}</td>
                      <td className="px-6 py-4">
                        {(apt.assignedSalesStaff || apt.salesStaff) ? (
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600">
                                {(() => {
                                  const staff = apt.assignedSalesStaff || apt.salesStaff;
                                  const firstName = staff?.firstName || staff?.profile?.firstName;
                                  return firstName?.[0]?.toUpperCase() || 'S';
                                })()}
                             </div>
                             <span className="text-slate-700 font-medium text-sm">
                               {(() => {
                                 const staff = apt.assignedSalesStaff || apt.salesStaff;
                                 const firstName = staff?.firstName || staff?.profile?.firstName || '';
                                 const lastName = staff?.lastName || staff?.profile?.lastName || '';
                                 return `${firstName} ${lastName}`.trim() || 'Sales Staff';
                               })()}
                             </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm italic flex items-center gap-1">
                             <AlertCircle className="w-3 h-3" />
                             Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setSelectedAppointment(apt); setShowDetailsModal(true); }}
                            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                            title="View Details"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {apt.status === 'pending' && !apt.assignedSalesStaff && (
                            <button
                              onClick={() => { setSelectedAppointment(apt); setShowAssignModal(true); }}
                              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                              title="Assign Agent"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                          )}
                          {['pending', 'assigned', 'confirmed', 'scheduled'].includes(apt.status) && (
                            <button
                              onClick={() => openCancelModal(apt)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                              title="Cancel"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-slate-100">
              {sortedAppointments.map((apt) => {
                const customer = getCustomerName(apt.customer);
                return (
                <div key={apt._id} className="p-4 bg-white/50 hover:bg-white transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm border border-indigo-100">
                        {customer.firstName?.[0] || 'C'}{customer.lastName?.[0] || ''}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{customer.fullName}</p>
                        <p className="text-xs font-medium text-slate-500">{format(new Date(apt.scheduledDate), 'MMM d')} • {apt.scheduledTime || 'TBD'}</p>
                      </div>
                    </div>
                    {getStatusBadge(apt.status, apt)}
                  </div>
                  <div className="flex items-center justify-between pl-[52px]">
                    <div className="flex gap-2">
                      {getTypeBadge(apt.appointmentType)}
                      {(apt.assignedSalesStaff || apt.salesStaff) && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                          <span className={`w-1.5 h-1.5 rounded-full ${apt.salesAcceptance?.accepted ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>
                          <span className="text-xs font-medium text-slate-600">{(apt.assignedSalesStaff || apt.salesStaff)?.firstName}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setSelectedAppointment(apt); setShowDetailsModal(true); }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-sm font-medium text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Appointment Details"
        size="md"
      >
        {selectedAppointment && (() => {
          const customer = getCustomerName(selectedAppointment.customer);
          return (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center gap-5 p-5 rounded-2xl bg-slate-50 border border-slate-100">
               <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-colors" />
                  <User className="w-10 h-10 text-indigo-200 group-hover:text-indigo-300 transition-colors" />
               </div>
               <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase italic underline decoration-indigo-500/30 decoration-4 underline-offset-4 mb-3">
                    {customer.fullName}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                     <div className="flex items-center gap-1.5 px-2 bg-white/50 backdrop-blur-sm rounded-lg border border-slate-100">
                        <Mail className="w-3 h-3 text-indigo-500" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none py-1">
                            {selectedAppointment.customer?.email}
                        </span>
                     </div>
                     {selectedAppointment.customer?.phone && (
                        <div className="flex items-center gap-1.5 px-2 bg-white/50 backdrop-blur-sm rounded-lg border border-slate-100">
                           <Phone className="w-3 h-3 text-indigo-500" />
                           <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none py-1">
                               {selectedAppointment.customer?.phone}
                           </span>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {/* Left column */}
               <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                     <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Scheduled For</p>
                     </div>
                     <div className="space-y-1.5">
                        <p className="text-sm font-black text-slate-900 uppercase">
                          {format(new Date(selectedAppointment.scheduledDate), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {selectedAppointment.scheduledTime || 'TBD'}
                        </p>
                     </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
                     <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Appointment Type</p>
                     </div>
                     <div className="scale-90 origin-left">{getTypeBadge(selectedAppointment.appointmentType)}</div>
                  </div>
               </div>

               {/* Right column */}
               <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</p>
                     </div>
                     <div className="scale-90 origin-left">{getStatusBadge(selectedAppointment.status, selectedAppointment)}</div>
                  </div>

                  {selectedAppointment.interestedCategory && (
                     <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                        <div className="flex items-center gap-2">
                           <FileText className="w-3.5 h-3.5 text-indigo-500" />
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Interest</p>
                        </div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{selectedAppointment.interestedCategory}</p>
                     </div>
                  )}
               </div>
            </div>

            {selectedAppointment.description && (
               <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Service Description</p>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{selectedAppointment.description}"</p>
               </div>
            )}

            {selectedAppointment.siteAddress && (
               <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                     <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Project Location</p>
                  </div>
                  <p className="text-xs font-bold text-slate-700 ml-5">
                    {[selectedAppointment.siteAddress.street, selectedAppointment.siteAddress.city, selectedAppointment.siteAddress.province].filter(Boolean).join(', ')}
                  </p>
               </div>
            )}

            {/* Assignment Section */}
            <div className="pt-4 border-t border-slate-100">
              {(selectedAppointment.assignedSalesStaff || selectedAppointment.salesStaff) ? (() => {
                const staff = selectedAppointment.assignedSalesStaff || selectedAppointment.salesStaff;
                const staffFirstName = staff?.profile?.firstName || staff?.firstName || 'Unknown';
                const staffLastName = staff?.profile?.lastName || staff?.lastName || '';
                return (
                <div className="group transition-all">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Assigned Sales Staff</p>
                  <div className={`flex items-center gap-4 p-4 rounded-2xl border shadow-sm transition-colors ${
                    selectedAppointment.salesAcceptance?.accepted 
                      ? 'bg-emerald-50 border-emerald-100/50 hover:border-emerald-200' 
                      : selectedAppointment.salesAcceptance?.rescheduleRequested
                        ? 'bg-orange-50 border-orange-100/50 hover:border-orange-200'
                        : 'bg-amber-50 border-amber-100/50 hover:border-amber-200'
                  }`}>
                     <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-lg border shadow-sm ${
                       selectedAppointment.salesAcceptance?.accepted 
                         ? 'text-emerald-600 border-emerald-100' 
                         : selectedAppointment.salesAcceptance?.rescheduleRequested
                           ? 'text-orange-600 border-orange-100'
                           : 'text-amber-600 border-amber-100'
                     }`}>
                        {staffFirstName?.[0] || 'S'}
                     </div>
                     <div className="flex-1">
                        <p className={`text-sm font-black uppercase tracking-tight group-hover:translate-x-1 transition-transform ${
                          selectedAppointment.salesAcceptance?.accepted 
                            ? 'text-emerald-900' 
                            : selectedAppointment.salesAcceptance?.rescheduleRequested
                              ? 'text-orange-900'
                              : 'text-amber-900'
                        }`}>
                          {staffFirstName} {staffLastName}
                        </p>
                        <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-0.5 ${
                          selectedAppointment.salesAcceptance?.accepted 
                            ? 'text-emerald-500' 
                            : selectedAppointment.salesAcceptance?.rescheduleRequested
                              ? 'text-orange-500'
                              : 'text-amber-500'
                        }`}>
                          {selectedAppointment.salesAcceptance?.accepted 
                            ? 'Accepted • Sales Representative' 
                            : selectedAppointment.salesAcceptance?.rescheduleRequested
                              ? 'Reassignment Requested'
                              : 'Waiting for Acceptance'}
                        </p>
                        {selectedAppointment.salesAcceptance?.rescheduleRequested && selectedAppointment.salesAcceptance?.rescheduleReason && (
                          <p className="text-xs text-orange-700 mt-2 italic">
                            Reason: "{selectedAppointment.salesAcceptance.rescheduleReason}"
                          </p>
                        )}
                     </div>
                     <div className={`px-3 py-1 bg-white rounded-full border ${
                       selectedAppointment.salesAcceptance?.accepted 
                         ? 'border-emerald-100' 
                         : selectedAppointment.salesAcceptance?.rescheduleRequested
                           ? 'border-orange-100'
                           : 'border-amber-100'
                     }`}>
                        <span className={`text-[8px] font-black uppercase ${
                          selectedAppointment.salesAcceptance?.accepted 
                            ? 'text-emerald-600' 
                            : selectedAppointment.salesAcceptance?.rescheduleRequested
                              ? 'text-orange-600'
                              : 'text-amber-600'
                        }`}>
                          {selectedAppointment.salesAcceptance?.accepted 
                            ? 'Active' 
                            : selectedAppointment.salesAcceptance?.rescheduleRequested
                              ? 'Needs Reassign'
                              : 'Pending'}
                        </span>
                     </div>
                  </div>
                </div>
                );
              })() : (
                <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 bg-slate-50/50 group hover:border-indigo-200 hover:bg-slate-50 transition-all">
                   <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                      <AlertCircle className="w-5 h-5 text-slate-300 group-hover:text-indigo-400" />
                   </div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No assigned sales personnel</span>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-3 justify-end">
              <button onClick={() => setShowDetailsModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                Close
              </button>
              {selectedAppointment.status === 'pending' && (
                <button
                  onClick={() => { setShowDetailsModal(false); setShowAssignModal(true); }}
                  className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5"
                >
                  Assign Staff
                </button>
              )}
              {selectedAppointment.status === 'confirmed' && (
                <>
                  <button
                    onClick={() => { handleComplete(selectedAppointment._id); setShowDetailsModal(false); }}
                    className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => { handleNoShow(selectedAppointment._id); setShowDetailsModal(false); }}
                    className="px-5 py-2.5 bg-slate-600 text-white text-sm font-bold rounded-xl hover:bg-slate-700 shadow-lg shadow-slate-600/20 transition-all hover:-translate-y-0.5"
                  >
                    No Show
                  </button>
                </>
              )}
            </div>
          </div>
          );
        })()}
      </Modal>

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => { setShowAssignModal(false); setSelectedStaffId(''); setAgentNotes(''); setStaffSearchTerm(''); }}
        title="Assign Sales Staff"
        size="md"
      >
         {selectedAppointment && (() => {
            const customer = getCustomerName(selectedAppointment.customer);
            return (
            <div className="space-y-6">
               <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer</p>
                  <p className="font-bold text-slate-900 text-lg">{customer.fullName}</p>
                  <p className="text-sm text-slate-500 mt-1">{format(new Date(selectedAppointment.scheduledDate), 'MMMM d, yyyy')} • {selectedAppointment.scheduledTime || 'TBD'}</p>
               </div>

               <div className="space-y-4">
                  <div>
                     <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-black uppercase tracking-widest text-slate-400">Select Sales Staff</label>
                        {selectedStaffId && (
                           <button 
                              onClick={() => setSelectedStaffId('')}
                              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                           >
                              Clear selection
                           </button>
                        )}
                     </div>
                     
                     {/* Custom Staff Selector */}
                     <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                           type="text"
                           placeholder="Search staff members..."
                           value={staffSearchTerm}
                           onChange={(e) => setStaffSearchTerm(e.target.value)}
                           className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                     </div>

                     <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                        {salesStaffList
                          .filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(staffSearchTerm.toLowerCase()))
                          .map((staff) => (
                           <button
                              key={staff._id}
                              type="button"
                              onClick={() => setSelectedStaffId(staff._id)}
                              className={`flex items-center gap-4 p-3 rounded-xl border transition-all text-left group ${
                                 selectedStaffId === staff._id
                                 ? 'border-indigo-600 bg-indigo-50 shadow-sm ring-1 ring-indigo-600'
                                 : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'
                              }`}
                           >
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                 selectedStaffId === staff._id 
                                   ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' 
                                   : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                              }`}>
                                 {(() => {
                                   const firstName = staff?.firstName || staff?.profile?.firstName;
                                   return firstName?.[0]?.toUpperCase() || 'S';
                                 })()}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className={`font-bold text-sm transition-colors ${selectedStaffId === staff._id ? 'text-indigo-900' : 'text-slate-900 uppercase tracking-tight'}`}>
                                    {staff.firstName} {staff.lastName}
                                 </p>
                                 <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-0.5">SALES REPRESENTATIVE</p>
                              </div>
                              {selectedStaffId === staff._id ? (
                                 <div className="bg-indigo-600 rounded-full p-1 animate-in zoom-in duration-300">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                 </div>
                              ) : (
                                 <div className="w-5 h-5 rounded-full border-2 border-slate-100 group-hover:border-slate-200 transition-colors" />
                              )}
                           </button>
                        ))}
                        {salesStaffList.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(staffSearchTerm.toLowerCase())).length === 0 && (
                           <div className="text-center py-8">
                              <p className="text-sm text-slate-400 font-medium">No staff members found</p>
                           </div>
                        )}
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Note for Agent <span className="text-slate-400 font-normal">(Optional)</span></label>
                     <textarea
                        value={agentNotes}
                        onChange={(e) => setAgentNotes(e.target.value)}
                        placeholder="Add any specific instructions or context..."
                        rows={3}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                     />
                  </div>
               </div>

               <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
                  <button
                     onClick={() => { setShowAssignModal(false); setSelectedStaffId(''); setAgentNotes(''); }}
                     className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                     Cancel
                  </button>
                  <button
                     onClick={handleAssign}
                     disabled={processing || !selectedStaffId}
                     className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
                  >
                     {processing ? 'Assigning...' : 'Confirm Assignment'}
                  </button>
               </div>
            </div>
            );
         })()}
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => { setShowCancelModal(false); setPendingCancel(null); }}
        title="Cancel Appointment"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
             <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
             <div>
                <h4 className="font-bold text-red-900">Cancellation Warning</h4>
                <p className="text-sm text-red-700 mt-1">This action will cancel the appointment and notify the customer via email. This cannot be undone.</p>
             </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Select Cancellation Reason</p>
            <div className="grid grid-cols-1 gap-3">
              {CANCEL_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    setCancelReason(template.title);
                    setCancelMessage(template.id === 'custom' ? '' : template.message);
                  }}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all text-left group ${
                    selectedTemplate === template.id
                      ? 'border-red-600 bg-red-50/30 ring-1 ring-red-600 shadow-sm'
                      : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedTemplate === template.id
                      ? 'border-red-600 bg-red-600'
                      : 'border-slate-200 group-hover:border-slate-300'
                  }`}>
                    {selectedTemplate === template.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-black transition-colors uppercase tracking-tight ${selectedTemplate === template.id ? 'text-red-900' : 'text-slate-900'}`}>
                      {template.title}
                    </p>
                    {template.message && <p className="text-[11px] font-medium text-slate-500 mt-1 italic line-clamp-2">"{template.message}"</p>}
                  </div>
                  {selectedTemplate === template.id && (
                     <div className="bg-red-100 rounded-lg px-2 py-0.5 self-center">
                        <span className="text-[8px] font-black text-red-600 uppercase tracking-widest">Selected</span>
                     </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Message to customer</label>
            <textarea
              value={cancelMessage}
              onChange={(e) => setCancelMessage(e.target.value)}
              placeholder="Tell the customer why you’re cancelling..."
              rows={4}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              onClick={() => { setShowCancelModal(false); setPendingCancel(null); }}
              className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              disabled={processing}
            >
              Keep Appointment
            </button>
            <button
              onClick={handleCancel}
              disabled={processing}
              className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
            >
              {processing ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AppointmentList;

