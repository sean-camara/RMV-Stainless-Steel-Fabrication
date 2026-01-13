import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { appointmentApi } from '../../../api/services';
import { useNotification } from '../../../contexts/NotificationContext';

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
  const { notify } = useNotification();
  const seenNotifications = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    appointments.forEach((appt) => {
      const key = `${appt._id}-${appt.status}`;
      if (seenNotifications.current.has(key)) return;

      if (appt.status === 'cancelled') {
        notify({
          type: 'warning',
          title: 'Appointment cancelled',
          message: `Your appointment ${appt._id} was cancelled by our team.`,
          persist: true,
        });
        seenNotifications.current.add(key);
      } else if (appt.status === 'scheduled' || appt.status === 'confirmed') {
        notify({
          type: 'success',
          title: 'Appointment accepted',
          message: `Your appointment ${appt._id} has been scheduled.`,
          persist: true,
        });
        seenNotifications.current.add(key);
      }
    });
  }, [appointments, notify]);

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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      scheduled: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      completed: 'bg-slate-100 text-slate-700 border-slate-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      rescheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return colors[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'confirmed':
      case 'scheduled':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getAppointmentTypeIcon = (type?: string) => {
    if (type === 'ocular_visit') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );
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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  // Find next upcoming appointment
  const nextAppointment = appointments.find(apt => {
    const aptDate = new Date(apt.scheduledDate);
    return aptDate >= now && (apt.status === 'confirmed' || apt.status === 'pending');
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">My Appointments</h1>
          <p className="text-slate-500 text-sm md:text-base mt-0.5 md:mt-1">View and manage your consultation appointments</p>
        </div>
        <Link
          to="/dashboard/customer/appointments/new"
          className="inline-flex items-center justify-center px-4 md:px-5 py-2.5 md:py-3 bg-slate-900 text-white rounded-xl text-sm md:text-base font-medium hover:bg-slate-800 transition-all"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Book Appointment
        </Link>
      </div>

      {/* Next Appointment Card - Highlighted */}
      {nextAppointment && filter !== 'past' && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 md:p-6 text-white">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs md:text-sm font-medium text-slate-300 uppercase tracking-wide">Next Appointment</span>
            {getDaysUntil(nextAppointment.scheduledDate) === 0 && (
              <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-medium rounded-full animate-pulse">
                Today
              </span>
            )}
            {getDaysUntil(nextAppointment.scheduledDate) === 1 && (
              <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-medium rounded-full">
                Tomorrow
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg md:text-xl font-bold">
                  {new Date(nextAppointment.scheduledDate).getDate()}
                </p>
                <p className="text-[10px] md:text-xs text-slate-300 uppercase">
                  {new Date(nextAppointment.scheduledDate).toLocaleDateString('en-PH', { month: 'short' })}
                </p>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm md:text-base">
                {nextAppointment.scheduledTime || 'Time TBD'}
              </p>
              <p className="text-slate-300 text-xs md:text-sm mt-0.5 capitalize">
                {nextAppointment.appointmentType?.replace(/_/g, ' ') || 'Office Consultation'}
              </p>
              {nextAppointment.projectCategory && (
                <p className="text-slate-400 text-xs mt-1 capitalize">
                  {nextAppointment.projectCategory.replace(/_/g, ' ')} Project
                </p>
              )}
            </div>
            <button
              onClick={() => openDetailModal(nextAppointment)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          {nextAppointment.appointmentType === 'ocular_visit' && nextAppointment.siteAddress && (
            <div className="mt-3 pt-3 border-t border-white/20 flex items-start gap-2">
              <svg className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-xs text-slate-300">{formatAddress(nextAppointment.siteAddress)}</p>
            </div>
          )}
        </div>
      )}

      {/* Filters - Mobile Scrollable */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
        {(['all', 'upcoming', 'past'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              filter === f
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'All' : f === 'upcoming' ? 'Upcoming' : 'Past'}
            {f === 'upcoming' && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                {appointments.filter(a => new Date(a.scheduledDate) >= now && a.status !== 'cancelled').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 md:p-12 text-center">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 md:w-8 md:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-2">No appointments found</h3>
          <p className="text-slate-500 mb-6 text-sm md:text-base">
            {filter === 'upcoming' 
              ? "You don't have any upcoming appointments."
              : filter === 'past'
              ? "You don't have any past appointments."
              : "You haven't booked any appointments yet."}
          </p>
          <Link
            to="/dashboard/customer/appointments/new"
            className="inline-flex items-center text-slate-900 font-medium hover:underline text-sm md:text-base"
          >
            Book your first appointment →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((appointment) => {
            const daysUntil = getDaysUntil(appointment.scheduledDate);
            const isToday = daysUntil === 0;
            const isTomorrow = daysUntil === 1;
            const isPast = daysUntil < 0 || appointment.status === 'completed' || appointment.status === 'cancelled';

            return (
              <button
                key={appointment._id}
                onClick={() => openDetailModal(appointment)}
                className={`w-full text-left bg-white rounded-2xl border p-4 md:p-5 hover:border-slate-200 transition-all ${
                  isToday && !isPast
                    ? 'border-emerald-200 ring-2 ring-emerald-100'
                    : isPast
                      ? 'border-slate-100 opacity-75'
                      : 'border-slate-100'
                }`}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  {/* Date Box */}
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                    isPast 
                      ? 'bg-slate-100 text-slate-500'
                      : isToday
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-900'
                  }`}>
                    <span className="text-lg md:text-xl font-bold leading-none">
                      {new Date(appointment.scheduledDate).getDate()}
                    </span>
                    <span className="text-[10px] md:text-xs uppercase mt-0.5">
                      {new Date(appointment.scheduledDate).toLocaleDateString('en-PH', { month: 'short' })}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Appointment Type Icon */}
                      <div className={`p-1 rounded-lg ${
                        appointment.appointmentType === 'ocular_visit'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {getAppointmentTypeIcon(appointment.appointmentType)}
                      </div>
                      <span className="text-sm md:text-base font-medium text-slate-900">
                        {appointment.scheduledTime || 'Time TBD'}
                      </span>
                      {isToday && !isPast && (
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-medium rounded">
                          Today
                        </span>
                      )}
                      {isTomorrow && !isPast && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">
                          Tomorrow
                        </span>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-slate-500 capitalize truncate">
                      {appointment.appointmentType?.replace(/_/g, ' ') || 'Office Consultation'}
                      {appointment.projectCategory && (
                        <> • {appointment.projectCategory.replace(/_/g, ' ')}</>
                      )}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex flex-col items-end gap-2">
                    <span className={`flex items-center gap-1 px-2 md:px-2.5 py-1 text-[10px] md:text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      <span className="hidden sm:inline">{formatStatus(appointment.status)}</span>
                    </span>
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Address for ocular visit */}
                {appointment.appointmentType === 'ocular_visit' && appointment.siteAddress && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-xs text-slate-500 line-clamp-1">{formatAddress(appointment.siteAddress)}</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetailModal(false)} />
          <div className="relative bg-white w-full md:max-w-md md:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Appointment Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div ref={detailsContentRef} className="relative p-4 md:p-6 overflow-y-auto max-h-[70vh] scrollbar-light">
              {/* Date & Time */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">
                    {new Date(selectedAppointment.scheduledDate).getDate()}
                  </span>
                  <span className="text-xs text-slate-500 uppercase">
                    {new Date(selectedAppointment.scheduledDate).toLocaleDateString('en-PH', { month: 'short' })}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {formatFullDate(selectedAppointment.scheduledDate)}
                  </p>
                  <p className="text-slate-500">{selectedAppointment.scheduledTime || 'Time to be confirmed'}</p>
                </div>
              </div>

              {/* Status */}
              <div className="mb-6">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border ${getStatusColor(selectedAppointment.status)}`}>
                  {getStatusIcon(selectedAppointment.status)}
                  {formatStatus(selectedAppointment.status)}
                </span>
              </div>

              {/* Appointment Type */}
              <div className="mb-6">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Type</p>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className={`p-2 rounded-lg ${
                    selectedAppointment.appointmentType === 'ocular_visit'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {getAppointmentTypeIcon(selectedAppointment.appointmentType)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 capitalize">
                      {selectedAppointment.appointmentType?.replace(/_/g, ' ') || 'Office Consultation'}
                    </p>
                    {selectedAppointment.projectCategory && (
                      <p className="text-sm text-slate-500 capitalize">
                        {selectedAppointment.projectCategory.replace(/_/g, ' ')} Project
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Site Address for Ocular Visit */}
              {selectedAppointment.appointmentType === 'ocular_visit' && selectedAppointment.siteAddress && (
                <div className="mb-6">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Site Location</p>
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="text-sm">
                        <p className="text-slate-900">{selectedAppointment.siteAddress.street}</p>
                        {selectedAppointment.siteAddress.barangay && (
                          <p className="text-slate-600">Brgy. {selectedAppointment.siteAddress.barangay}</p>
                        )}
                        <p className="text-slate-600">
                          {selectedAppointment.siteAddress.city}
                          {selectedAppointment.siteAddress.province && `, ${selectedAppointment.siteAddress.province}`}
                          {selectedAppointment.siteAddress.zipCode && ` ${selectedAppointment.siteAddress.zipCode}`}
                        </p>
                        {selectedAppointment.siteAddress.landmark && (
                          <p className="text-slate-500 mt-1">
                            <span className="text-xs">Landmark:</span> {selectedAppointment.siteAddress.landmark}
                          </p>
                        )}
                      </div>
                    </div>
                    {selectedAppointment.travelFee !== undefined && selectedAppointment.travelFee > 0 && (
                      <div className="mt-3 pt-3 border-t border-blue-200 flex items-center justify-between">
                        <span className="text-sm text-blue-700">Travel Fee</span>
                        <span className="font-medium text-blue-900">₱{selectedAppointment.travelFee.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Agent Info */}
              {selectedAppointment.assignedAgent && (
                <div className="mb-6">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Assigned Agent</p>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-slate-600">
                        {selectedAppointment.assignedAgent.firstName?.[0]}{selectedAppointment.assignedAgent.lastName?.[0]}
                      </span>
                    </div>
                    <p className="font-medium text-slate-900">
                      {selectedAppointment.assignedAgent.firstName} {selectedAppointment.assignedAgent.lastName}
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {(selectedAppointment.notes?.customerNotes || selectedAppointment.notes?.agentNotes) && (
                <div className="mb-6">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Notes</p>
                  {selectedAppointment.notes?.customerNotes && (
                    <div className="p-3 bg-slate-50 rounded-xl mb-2">
                      <p className="text-xs text-slate-500 mb-1">Your notes:</p>
                      <p className="text-sm text-slate-700">{selectedAppointment.notes.customerNotes}</p>
                    </div>
                  )}
                  {selectedAppointment.notes?.agentNotes && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <p className="text-xs text-emerald-600 mb-1">Agent notes:</p>
                      <p className="text-sm text-emerald-800">{selectedAppointment.notes.agentNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tips for Office Consultation */}
              {selectedAppointment.appointmentType !== 'ocular_visit' && selectedAppointment.status !== 'completed' && selectedAppointment.status !== 'cancelled' && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-sm font-medium text-amber-800 mb-2">What to bring:</p>
                  <ul className="text-xs text-amber-700 space-y-1">
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Photos of the installation area</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Measurements (if available)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Design inspirations or references</span>
                    </li>
                  </ul>
                </div>
              )}

              {showScrollHint && (
                <>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
                    <button
                      type="button"
                      onClick={scrollDetails}
                      className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800"
                    >
                      Scroll to see more
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            {selectedAppointment.status === 'pending' && (
              <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50">
                <p className="text-xs text-slate-500 text-center">
                  Your appointment is being reviewed. You'll receive a confirmation soon.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
