import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { appointmentApi } from '../../../api/services';
import toast from 'react-hot-toast';
import { Modal } from '../../../components/ui';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase,
  CheckCircle2,
  AlertCircle,
  FileText,
  MapPinned,
  RefreshCw,
  ChevronRight,
  ClipboardList,
  Package,
  Clipboard,
  UserX
} from 'lucide-react';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

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
  scheduledDate: string;
  scheduledTime?: string;
  appointmentType: 'office_consultation' | 'ocular_visit';
  status: string;
  interestedCategory?: string;
  description?: string;
  notes?: {
    customerNotes?: string;
    agentNotes?: string;
    salesNotes?: string;
  };
  siteAddress?: {
    street?: string;
    barangay?: string;
    city?: string;
    province?: string;
    zipCode?: string;
    landmark?: string;
    coordinates?: {
      lat?: number;
      lng?: number;
    };
  };
  salesAcceptance?: {
    accepted: boolean;
    acceptedAt?: string;
    rescheduleRequested?: boolean;
    rescheduleReason?: string;
  };
  ocularVisit?: {
    status: 'not_started' | 'in_progress' | 'completed';
  };
  projectSubmission?: {
    submitted: boolean;
  };
  workflowStage?: string;
}

const SalesAppointments: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [processing, setProcessing] = useState(false);
  const [mapPreviewCoords, setMapPreviewCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapPreviewLoading, setMapPreviewLoading] = useState(false);
  const [mapPreviewError, setMapPreviewError] = useState<string | null>(null);
  
  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignReason, setReassignReason] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadMapPreview = async () => {
      if (!showDetailsModal || !selectedAppointment) {
        setMapPreviewCoords(null);
        setMapPreviewError(null);
        setMapPreviewLoading(false);
        return;
      }

      if (selectedAppointment.appointmentType !== 'ocular_visit' || !selectedAppointment.siteAddress) {
        setMapPreviewCoords(null);
        setMapPreviewError(null);
        setMapPreviewLoading(false);
        return;
      }

      const savedCoords = selectedAppointment.siteAddress.coordinates;
      if (savedCoords?.lat && savedCoords?.lng) {
        setMapPreviewCoords({ lat: savedCoords.lat, lng: savedCoords.lng });
        setMapPreviewError(null);
        setMapPreviewLoading(false);
        return;
      }

      const address = [
        selectedAppointment.siteAddress.street,
        selectedAppointment.siteAddress.barangay,
        selectedAppointment.siteAddress.city,
        selectedAppointment.siteAddress.province,
        selectedAppointment.siteAddress.zipCode,
      ].filter(Boolean).join(', ');

      if (!address) {
        setMapPreviewCoords(null);
        setMapPreviewError('No address data available for map preview.');
        setMapPreviewLoading(false);
        return;
      }

      setMapPreviewLoading(true);
      setMapPreviewError(null);
      try {
        const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: { q: address, format: 'json', limit: 1 },
        });

        if (cancelled) return;

        const first = Array.isArray(data) ? data[0] : null;
        if (first?.lat && first?.lon) {
          setMapPreviewCoords({ lat: parseFloat(first.lat), lng: parseFloat(first.lon) });
          setMapPreviewError(null);
        } else {
          setMapPreviewCoords(null);
          setMapPreviewError('Unable to locate this address on the map.');
        }
      } catch (error) {
        if (!cancelled) {
          setMapPreviewCoords(null);
          setMapPreviewError('Unable to load map preview.');
        }
      } finally {
        if (!cancelled) setMapPreviewLoading(false);
      }
    };

    loadMapPreview();

    return () => {
      cancelled = true;
    };
  }, [showDetailsModal, selectedAppointment]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentApi.getAll({ limit: 100 });
      // Handle nested response structure
      const data = response?.data || response;
      const appointments = data?.appointments || data || [];
      console.log('Fetched appointments data:', appointments); // Debug log
      setAppointments(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load your assigned appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (appointment: Appointment) => {
    setProcessing(true);
    try {
      const result = await appointmentApi.accept(appointment._id);
      
      // Update local state immediately
      setAppointments(prev => prev.map(apt => 
        apt._id === appointment._id 
          ? { ...apt, salesAcceptance: { ...apt.salesAcceptance, accepted: true, acceptedAt: new Date().toISOString() } }
          : apt
      ));
      
      // Update selected appointment if it's the one we just accepted
      if (selectedAppointment?._id === appointment._id) {
        setSelectedAppointment({
          ...selectedAppointment,
          salesAcceptance: { ...selectedAppointment.salesAcceptance, accepted: true, acceptedAt: new Date().toISOString() }
        });
      }
      
      toast.success('Appointment accepted successfully! You can now start recording project details.');
    } catch (error: any) {
      console.error('Accept error:', error);
      toast.error(error.response?.data?.message || 'Failed to accept appointment');
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestReassign = async () => {
    if (!selectedAppointment || !reassignReason.trim()) {
      toast.error('Please provide a reason for reassignment');
      return;
    }
    setProcessing(true);
    try {
      await appointmentApi.requestReschedule(selectedAppointment._id, reassignReason);
      toast.success('Reassignment request submitted to agent');
      setShowReassignModal(false);
      setShowDetailsModal(false);
      setReassignReason('');
      fetchAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to request reassignment');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (appointment: Appointment) => {
    // Check if waiting for acceptance
    if (!appointment.salesAcceptance?.accepted && appointment.status !== 'cancelled' && appointment.status !== 'completed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
          Awaiting Your Acceptance
        </span>
      );
    }
    
    if (appointment.salesAcceptance?.rescheduleRequested) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-[10px] font-black uppercase tracking-widest">
          Reassignment Requested
        </span>
      );
    }

    const variants: Record<string, { bg: string; text: string; label: string }> = {
      scheduled: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Scheduled' },
      confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Confirmed' },
      in_progress: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'In Progress' },
      completed: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Completed' },
      cancelled: { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelled' },
    };
    const variant = variants[appointment.status] || { bg: 'bg-slate-50', text: 'text-slate-600', label: appointment.status };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${variant.bg} ${variant.text} rounded-full text-[10px] font-black uppercase tracking-widest`}>
        {variant.label}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    return type === 'ocular_visit' ? (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-[10px] font-black uppercase tracking-widest">
        <MapPinned className="w-3 h-3" />
        Site Visit
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-black uppercase tracking-widest">
        <Briefcase className="w-3 h-3" />
        Office
      </span>
    );
  };

  const resolvedMapCoords = selectedAppointment?.siteAddress?.coordinates?.lat && selectedAppointment?.siteAddress?.coordinates?.lng
    ? {
        lat: selectedAppointment.siteAddress.coordinates.lat,
        lng: selectedAppointment.siteAddress.coordinates.lng,
      }
    : mapPreviewCoords;

  // Stats
  const pendingAcceptance = appointments.filter(a => !a.salesAcceptance?.accepted && a.status !== 'cancelled' && a.status !== 'completed').length;
  const accepted = appointments.filter(a => a.salesAcceptance?.accepted).length;
  const pendingRecording = appointments.filter(a => a.salesAcceptance?.accepted && !a.projectSubmission?.submitted).length;
  const submitted = appointments.filter(a => a.projectSubmission?.submitted).length;

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
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-purple-50/40 rounded-full blur-3xl opacity-60 mix-blend-multiply animate-blob" />
      <div className="absolute bottom-0 left-0 -z-10 w-64 h-64 bg-slate-100/50 rounded-full blur-3xl opacity-60 mix-blend-multiply animate-blob animation-delay-2000" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 hero-fade-up">
        <div>
          <h1 className="text-4xl xs:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none mb-2">
            Visits<span className="text-slate-300">.</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-light tracking-wide">
            Manage your assigned appointments and project recording
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 hero-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-[0_8px_30_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{pendingAcceptance}</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-[0_8px_30_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accepted</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{accepted}</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-[0_8px_30_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Clipboard className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To Record</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{pendingRecording}</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-[0_8px_30_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{submitted}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-[0_8px_30_rgb(0,0,0,0.04)] overflow-hidden hero-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="p-6 md:p-8 border-b border-slate-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Your Appointments</h2>
            </div>
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            </div>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
              <Calendar className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Appointments Assigned</h3>
            <p className="text-slate-500 text-sm max-w-md font-light leading-relaxed">
              When the appointment agent assigns new visits to you, they will appear here instantly.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100/50">
            {appointments.map((apt) => {
              const customerFirstName = apt.customer?.profile?.firstName || apt.customer?.firstName || 'Unknown';
              const customerLastName = apt.customer?.profile?.lastName || apt.customer?.lastName || '';
              const customerPhone = apt.customer?.profile?.phone || apt.customer?.phone;
              
              return (
              <div 
                key={apt._id} 
                className="p-6 md:p-8 hover:bg-slate-50/50 transition-all cursor-pointer group"
                onClick={() => { setSelectedAppointment(apt); setShowDetailsModal(true); }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Left: Customer & Date Info */}
                  <div className="flex items-start gap-5 flex-1">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 font-black text-xl group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm group-hover:shadow-md group-hover:scale-110">
                      {customerFirstName?.[0] || 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h3 className="font-bold text-slate-900 text-lg">
                          {customerFirstName} {customerLastName}
                        </h3>
                        {getTypeBadge(apt.appointmentType)}
                        {getStatusBadge(apt)}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 font-light">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {format(new Date(apt.scheduledDate), 'MMMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {apt.scheduledTime || 'TBD'}
                        </span>
                        {apt.interestedCategory && (
                          <span className="flex items-center gap-2 px-2 py-0.5 bg-slate-50 rounded-full text-xs font-medium">
                            <Package className="w-3 h-3 text-slate-400" />
                            {apt.interestedCategory}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-slate-100">
                    {/* Go to Recording button - only if accepted and not cancelled */}
                    {apt.salesAcceptance?.accepted && !apt.projectSubmission?.submitted && apt.status !== 'cancelled' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/sales/recording/${apt._id}`); }}
                        className="flex-1 md:flex-none px-5 py-2.5 bg-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                      >
                        Record Data
                      </button>
                    )}
                    {/* Accept button - only if not accepted */}
                    {!apt.salesAcceptance?.accepted && apt.status !== 'cancelled' && apt.status !== 'completed' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAccept(apt); }}
                        disabled={processing}
                        className="flex-1 md:flex-none px-5 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                      >
                        Accept
                      </button>
                    )}
                    <div className="p-2.5 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>

      {/* ==================== DETAILS MODAL ==================== */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Appointment Details"
        size="md"
      >
        {selectedAppointment && (() => {
          const customerFirstName = selectedAppointment.customer?.profile?.firstName || selectedAppointment.customer?.firstName || 'Unknown';
          const customerLastName = selectedAppointment.customer?.profile?.lastName || selectedAppointment.customer?.lastName || '';
          const customerPhone = selectedAppointment.customer?.profile?.phone || selectedAppointment.customer?.phone;
          
          return (
            <div className="space-y-6">
            {/* Customer Header */}
            <div className="flex items-center gap-5 p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                <User className="w-8 h-8 text-indigo-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {customerFirstName} {customerLastName}
                </h3>
                <div className="flex flex-wrap gap-3 mt-2">
                  {selectedAppointment.customer?.email && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Mail className="w-3.5 h-3.5" />
                      {selectedAppointment.customer.email}
                    </span>
                  )}
                  {customerPhone && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Phone className="w-3.5 h-3.5" />
                      {customerPhone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Appointment Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Date & Time</p>
                <p className="font-bold text-slate-900">{format(new Date(selectedAppointment.scheduledDate), 'MMMM d, yyyy')}</p>
                <p className="text-sm text-slate-500">{selectedAppointment.scheduledTime || 'Time TBD'}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Type</p>
                {getTypeBadge(selectedAppointment.appointmentType)}
                {selectedAppointment.interestedCategory && (
                  <p className="text-sm text-slate-500 mt-1">{selectedAppointment.interestedCategory}</p>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Status</p>
              {getStatusBadge(selectedAppointment)}
            </div>

            {/* Site Address (for ocular visits) */}
            {selectedAppointment.appointmentType === 'ocular_visit' && selectedAppointment.siteAddress && (
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  <p className="text-[9px] font-black text-purple-600 uppercase tracking-[0.2em]">Site Location</p>
                </div>
                <p className="font-medium text-purple-900">
                  {[
                    selectedAppointment.siteAddress.street,
                    selectedAppointment.siteAddress.barangay,
                    selectedAppointment.siteAddress.city,
                    selectedAppointment.siteAddress.province,
                    selectedAppointment.siteAddress.zipCode,
                  ].filter(Boolean).join(', ')}
                </p>
                {selectedAppointment.siteAddress.landmark && (
                  <p className="text-sm text-purple-700 mt-1">Landmark: {selectedAppointment.siteAddress.landmark}</p>
                )}
                {mapPreviewLoading && (
                  <p className="text-xs text-purple-600 mt-2">Locating map pin...</p>
                )}
                {!mapPreviewLoading && resolvedMapCoords ? (
                  <div className="mt-3 h-[220px] w-full overflow-hidden rounded-xl border border-purple-100">
                    <MapContainer
                      center={[resolvedMapCoords.lat, resolvedMapCoords.lng]}
                      zoom={16}
                      scrollWheelZoom={false}
                      className="h-full w-full"
                    >
                      <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[resolvedMapCoords.lat, resolvedMapCoords.lng]} />
                    </MapContainer>
                  </div>
                ) : null}
                {!mapPreviewLoading && !resolvedMapCoords && (
                  <p className="text-xs text-purple-600 mt-2">{mapPreviewError || 'No map pin was provided for this booking.'}</p>
                )}
              </div>
            )}

            {/* Customer's Description */}
            {selectedAppointment.description && (
              <div className="p-4 rounded-xl bg-white border border-slate-100 relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-xl" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-3">Customer's Request</p>
                <p className="text-sm text-slate-700 italic ml-3">"{selectedAppointment.description}"</p>
              </div>
            )}

            {/* Agent Notes */}
            {selectedAppointment.notes?.agentNotes && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <p className="text-[9px] font-black text-amber-600 uppercase tracking-[0.2em]">Notes from Agent</p>
                </div>
                <p className="text-sm text-amber-900">{selectedAppointment.notes.agentNotes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex flex-wrap gap-3">
                {/* Accept Button - only if not yet accepted */}
                {!selectedAppointment.salesAcceptance?.accepted && selectedAppointment.status !== 'cancelled' && (
                  <>
                    <button
                      onClick={() => handleAccept(selectedAppointment)}
                      disabled={processing}
                      className="flex-1 px-5 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Accept Appointment
                    </button>
                    <button
                      onClick={() => setShowReassignModal(true)}
                      className="px-5 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
                    >
                      <UserX className="w-5 h-5" />
                      Request Reassign
                    </button>
                  </>
                )}

                {/* Go to Recording - only if accepted and not cancelled */}
                {selectedAppointment.salesAcceptance?.accepted && selectedAppointment.status !== 'cancelled' && (
                  <button
                    onClick={() => navigate(`/dashboard/sales/recording/${selectedAppointment._id}`)}
                    className="flex-1 px-5 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Clipboard className="w-5 h-5" />
                    {selectedAppointment.projectSubmission?.submitted ? 'View Recording' : 'Go to Recording'}
                  </button>
                )}

                <button 
                  onClick={() => setShowDetailsModal(false)} 
                  className="px-5 py-3 text-slate-500 hover:text-slate-700 font-bold transition-colors"
                >
                  Close
                </button>
              </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ==================== REASSIGN REQUEST MODAL ==================== */}
      <Modal
        isOpen={showReassignModal}
        onClose={() => { setShowReassignModal(false); setReassignReason(''); }}
        title="Request Reassignment"
        size="md"
      >
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <div className="flex items-start gap-3">
              <UserX className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">Request Reassignment</p>
                <p className="text-sm text-amber-700 mt-1">
                  This will notify the appointment agent that you need this appointment reassigned to another sales staff. 
                  Please provide a reason for the request.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
              Reason for Reassignment *
            </label>
            <textarea
              value={reassignReason}
              onChange={(e) => setReassignReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
              placeholder="e.g., Schedule conflict, location too far, already have too many appointments, etc."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => { setShowReassignModal(false); setReassignReason(''); }}
              className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRequestReassign}
              disabled={processing || !reassignReason.trim()}
              className="flex-1 px-5 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${processing ? 'animate-spin' : ''}`} />
              Submit Request
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SalesAppointments;
