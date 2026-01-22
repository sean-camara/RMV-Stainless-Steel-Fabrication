import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { appointmentApi } from '../../../api/services';

interface SiteAddress {
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  landmark?: string;
}

interface Appointment {
  _id: string;
  scheduledDate: string;
  scheduledTime?: string;
  appointmentType?: string;
  projectCategory?: string;
  siteAddress?: SiteAddress;
  status: string;
  notes?: {
    customerNotes?: string;
    agentNotes?: string;
  };
  assignedAgent?: {
    firstName?: string;
    lastName?: string;
  };
  travelFee?: number;
  createdAt: string;
}

const MyAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const detailsContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    const el = detailsContentRef.current;
    if (!el || !showDetailModal) return;

    const updateHint = () => {
      const remaining = el.scrollHeight - el.clientHeight - el.scrollTop;
      setShowScrollHint(remaining > 12);
    };

    updateHint();
    el.addEventListener('scroll', updateHint);
    return () => el.removeEventListener('scroll', updateHint);
  }, [showDetailModal, selectedAppointment]);

  const scrollDetails = () => {
    const el = detailsContentRef.current;
    if (!el) return;
    el.scrollBy({ top: el.clientHeight * 0.75, behavior: 'smooth' });
  };

  const fetchAppointments = async () => {
    try {
      const response = await appointmentApi.getMine();
      setAppointments(response.data?.appointments || []);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusStyles = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'scheduled':
        return 'text-blue-700 bg-blue-50 border-blue-200'; // Standard blue instead of cyan
      case 'completed':
        return 'text-slate-600 bg-slate-100 border-slate-200';
      case 'cancelled':
      case 'declined':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'pending':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'rescheduled':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const formatStatus = (status: string) => {
    const statusLabels: Record<string, string> = {
      pending: 'Awaiting Approval',
      scheduled: 'Scheduled',
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled',
      declined: 'Declined',
      rescheduled: 'Rescheduled',
    };
    return statusLabels[status] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAddress = (address?: SiteAddress) => {
    if (!address) return null;
    const parts = [
      address.street,
      address.barangay,
      address.city,
      address.province,
    ].filter(Boolean);
    return parts.join(', ');
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const aptDate = new Date(dateString);
    aptDate.setHours(0, 0, 0, 0);
    const diffTime = aptDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const openDetailModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const now = new Date();
  const filteredAppointments = appointments
    .filter(apt => {
      const aptDate = new Date(apt.scheduledDate);
      if (filter === 'upcoming') return aptDate >= now && apt.status !== 'cancelled';
      if (filter === 'past') return aptDate < now || apt.status === 'cancelled' || apt.status === 'completed';
      return true;
    })
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const nextAppointment = appointments.find(apt => {
    const aptDate = new Date(apt.scheduledDate);
    return aptDate >= now && (apt.status === 'confirmed' || apt.status === 'scheduled');
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage your consultations and site visits</p>
        </div>
        <Link
          to="/dashboard/customer/appointments/new"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Book Appointment
        </Link>
      </div>

      {/* Next Appointment Card (Clean Design) */}
      {nextAppointment && filter !== 'past' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="border-l-4 border-slate-900 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-900 flex-shrink-0">
                <span className="text-2xl font-bold leading-none">{new Date(nextAppointment.scheduledDate).getDate()}</span>
                <span className="text-xs font-semibold uppercase mt-1">{new Date(nextAppointment.scheduledDate).toLocaleDateString('en-PH', { month: 'short' })}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Next Up</span>
                  {getDaysUntil(nextAppointment.scheduledDate) === 0 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Today" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {nextAppointment.appointmentType?.replace(/_/g, ' ') || 'Consultation'}
                </h3>
                <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {nextAppointment.scheduledTime || 'Time TBD'} 
                  {nextAppointment.projectCategory && (
                   <span className="text-slate-300">•</span>
                  )}
                  {nextAppointment.projectCategory && (
                    <span className="capitalize">{nextAppointment.projectCategory.replace(/_/g, ' ')}</span>
                  )}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => openDetailModal(nextAppointment)}
              className="w-full md:w-auto px-4 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium border border-slate-200 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6 overflow-x-auto pb-px">
          {(['all', 'upcoming', 'past'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                filter === tab 
                  ? 'text-slate-900 text-base' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'all' ? 'All Appointments' : tab === 'upcoming' ? 'Upcoming' : 'Past History'}
              {filter === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="py-12 bg-white rounded-xl border border-dashed border-slate-300 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-slate-900 font-medium">No appointments found</p>
            <p className="text-slate-500 text-sm mt-1">
              There are no {filter !== 'all' ? filter : ''} appointments to show.
            </p>
          </div>
        ) : (
          filteredAppointments.map((apt) => {
            const isPast = getDaysUntil(apt.scheduledDate) < 0 || apt.status === 'completed' || apt.status === 'cancelled';
            
            return (
              <div 
                key={apt._id}
                onClick={() => openDetailModal(apt)}
                className={`group bg-white p-4 rounded-xl border border-slate-200 transition-all hover:border-slate-300 hover:shadow-sm cursor-pointer ${
                  isPast ? 'opacity-80' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Date Badge */}
                  <div className={`flex-shrink-0 w-14 h-14 rounded-lg flex flex-col items-center justify-center border ${
                    !isPast && getDaysUntil(apt.scheduledDate) === 0
                      ? 'bg-slate-900 border-slate-900 text-white' 
                      : 'bg-white border-slate-100 text-slate-700'
                  }`}>
                    <span className="text-lg font-bold">{new Date(apt.scheduledDate).getDate()}</span>
                    <span className={`text-[10px] uppercase font-medium ${!isPast && getDaysUntil(apt.scheduledDate) === 0 ? 'text-slate-300' : 'text-slate-400'}`}>
                      {new Date(apt.scheduledDate).toLocaleDateString('en-PH', { month: 'short' })}
                    </span>
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-base font-semibold text-slate-900 truncate pr-2">
                        {apt.appointmentType?.replace(/_/g, ' ') || 'Consultation'}
                      </h4>
                      <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyles(apt.status)}`}>
                        {formatStatus(apt.status)}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center text-sm text-slate-500 gap-1 sm:gap-4">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {apt.scheduledTime || 'Time TBD'}
                      </span>
                      {apt.projectCategory && (
                        <span className="hidden sm:inline text-slate-300">•</span>
                      )}
                      {apt.projectCategory && (
                        <span className="capitalize">{apt.projectCategory.replace(/_/g, ' ')}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Chev */}
                  <div className="text-slate-300 group-hover:text-slate-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 transition-opacity backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white">
              <h2 className="text-lg font-bold text-slate-900">Appointment Details</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Scroll area */}
            <div ref={detailsContentRef} className="p-6 overflow-y-auto">
              <div className="flex flex-col gap-6">
                
                {/* Main Status Block */}
                <div className="flex sm:items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                   <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-slate-900 leading-none">
                        {new Date(selectedAppointment.scheduledDate).getDate()}
                      </span>
                      <span className="text-[10px] uppercase text-slate-500 font-medium">
                        {new Date(selectedAppointment.scheduledDate).toLocaleDateString('en-PH', { month: 'short' })}
                      </span>
                   </div>
                   <div>
                      <h3 className="font-semibold text-slate-900">
                        {selectedAppointment.appointmentType?.replace(/_/g, ' ') || 'Consultation'}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 mb-2">
                        {formatFullDate(selectedAppointment.scheduledDate)} at {selectedAppointment.scheduledTime || 'Time TBD'}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles(selectedAppointment.status)}`}>
                        {formatStatus(selectedAppointment.status)}
                      </span>
                   </div>
                </div>

                {/* Info Grid */}
                <div className="grid gap-4">
                  {selectedAppointment.siteAddress && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</label>
                      <div className="text-sm text-slate-900 bg-white p-3 border border-slate-200 rounded-lg">
                        <p className="font-medium">{selectedAppointment.siteAddress.street || 'Street not specified'}</p>
                        <p className="text-slate-500">{formatAddress(selectedAppointment.siteAddress)}</p>
                        {selectedAppointment.siteAddress.landmark && (
                           <p className="text-xs text-slate-400 mt-1">Landmark: {selectedAppointment.siteAddress.landmark}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedAppointment.assignedAgent && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigned To</label>
                      <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                          {selectedAppointment.assignedAgent.firstName?.[0]}{selectedAppointment.assignedAgent.lastName?.[0]}
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {selectedAppointment.assignedAgent.firstName} {selectedAppointment.assignedAgent.lastName}
                        </span>
                      </div>
                    </div>
                  )}

                  {(selectedAppointment.notes?.customerNotes || selectedAppointment.notes?.agentNotes) && (
                    <div className="space-y-3 pt-2">
                      {selectedAppointment.notes?.customerNotes && (
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Your Notes</label>
                          <p className="mt-1 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            {selectedAppointment.notes.customerNotes}
                          </p>
                        </div>
                      )}
                      
                      {selectedAppointment.notes?.agentNotes && (
                         <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Agent Response</label>
                          <p className="mt-1 text-sm text-slate-700 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                            {selectedAppointment.notes.agentNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-white text-slate-700 font-medium text-sm border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
