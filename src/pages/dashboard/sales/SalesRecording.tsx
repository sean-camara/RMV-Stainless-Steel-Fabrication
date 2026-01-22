import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { appointmentApi } from '../../../api/services';
import toast from 'react-hot-toast';
import { 
  ArrowLeft,
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2,
  AlertCircle,
  MapPinned,
  Send,
  Package,
  Save,
  Loader2
} from 'lucide-react';

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
  assignedSalesStaff?: {
    _id: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
  scheduledDate: string;
  appointmentType: 'office_consultation' | 'ocular_visit';
  status: string;
  interestedCategory?: string;
  description?: string;
  siteAddress?: {
    street?: string;
    barangay?: string;
    city?: string;
    province?: string;
    landmark?: string;
  };
  salesAcceptance?: {
    accepted: boolean;
    acceptedAt?: string;
  };
  ocularVisit?: {
    status: 'not_started' | 'in_progress' | 'completed';
    measurements?: string;
    feasibilityAssessment?: 'feasible' | 'needs_adjustment' | 'not_feasible';
    observations?: string;
  };
  projectSubmission?: {
    submitted: boolean;
    submittedAt?: string;
    projectType?: string;
    dimensions?: string;
    preferredMaterials?: string;
    specialInstructions?: string;
  };
  workflowStage?: string;
}

const PROJECT_TYPES = [
  { value: 'kitchen', label: 'Kitchen Counter' },
  { value: 'railing', label: 'Stainless Steel Railing' },
  { value: 'gate', label: 'Gate' },
  { value: 'grills', label: 'Grills' },
  { value: 'fence', label: 'Fence' },
  { value: 'staircase', label: 'Staircase' },
  { value: 'door', label: 'Door' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'custom', label: 'Custom Fabrication' },
];

const SalesRecording: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Single unified form
  const [form, setForm] = useState({
    // Ocular/Site data
    measurements: '',
    feasibilityAssessment: '' as '' | 'feasible' | 'needs_adjustment' | 'not_feasible',
    observations: '',
    // Project data
    projectType: '',
    preferredMaterials: '',
    specialInstructions: '',
  });

  useEffect(() => {
    if (id) fetchAppointment();
  }, [id]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await appointmentApi.getById(id!);
      const apt = response?.data?.appointment || response?.appointment || response?.data || response;
      setAppointment(apt);
      
      // Pre-fill form from existing data
      setForm({
        measurements: apt.ocularVisit?.measurements || apt.projectSubmission?.dimensions || '',
        feasibilityAssessment: apt.ocularVisit?.feasibilityAssessment || '',
        observations: apt.ocularVisit?.observations || '',
        projectType: apt.projectSubmission?.projectType || apt.interestedCategory || '',
        preferredMaterials: apt.projectSubmission?.preferredMaterials || '',
        specialInstructions: apt.projectSubmission?.specialInstructions || '',
      });
    } catch (error) {
      console.error('Error fetching appointment:', error);
      toast.error('Failed to load appointment details');
      navigate('/dashboard/sales/appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!appointment) return;
    if (!form.measurements.trim()) {
      toast.error('Please enter measurements/dimensions');
      return;
    }
    setSaving(true);
    try {
      await appointmentApi.updateOcularVisit(appointment._id, {
        status: 'in_progress',
        measurements: form.measurements,
        feasibilityAssessment: form.feasibilityAssessment || undefined,
        observations: form.observations,
        // Also save project draft fields
        projectType: form.projectType || undefined,
        preferredMaterials: form.preferredMaterials || undefined,
        specialInstructions: form.specialInstructions || undefined,
      });
      toast.success('All data saved successfully!');
      fetchAppointment();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save data');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitToEngineer = async () => {
    if (!appointment) return;
    if (!form.projectType) {
      toast.error('Please select a project type');
      return;
    }
    if (!form.measurements.trim()) {
      toast.error('Please enter measurements/dimensions');
      return;
    }
    
    setSubmitting(true);
    try {
      // First save ocular data if not saved
      await appointmentApi.updateOcularVisit(appointment._id, {
        status: 'completed',
        measurements: form.measurements,
        feasibilityAssessment: form.feasibilityAssessment || undefined,
        observations: form.observations,
      });
      
      // Then submit project
      await appointmentApi.submitProjectDetails(appointment._id, {
        projectType: form.projectType,
        dimensions: form.measurements, // Use measurements as dimensions
        preferredMaterials: form.preferredMaterials,
        specialInstructions: form.specialInstructions,
      });
      toast.success('Project submitted to engineering team!');
      fetchAppointment();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to submit project');
    } finally {
      setSubmitting(false);
    }
  };

  const isDataSaved = appointment?.ocularVisit?.measurements === form.measurements;
  const isSubmitted = appointment?.projectSubmission?.submitted;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Appointment not found</h2>
        <button onClick={() => navigate('/dashboard/sales/appointments')} className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800">
          Back to Appointments
        </button>
      </div>
    );
  }

  if (!appointment.salesAcceptance?.accepted) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <AlertCircle className="w-16 h-16 text-amber-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Appointment Not Accepted</h2>
        <p className="text-slate-500 mt-2">You must accept this appointment before recording data.</p>
        <button onClick={() => navigate('/dashboard/sales/appointments')} className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800">
          Back to Appointments
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-purple-50/40 rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-0 left-0 -z-10 w-64 h-64 bg-slate-100/50 rounded-full blur-3xl opacity-60" />

      {/* Header */}
      <div className="flex items-center gap-6 hero-fade-up">
        <button onClick={() => navigate('/dashboard/sales/appointments')} className="p-3 bg-white/70 backdrop-blur-sm border border-white rounded-xl shadow-sm hover:shadow-md transition-all group">
          <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
        </button>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Project Recording<span className="text-slate-300">.</span></h1>
          <p className="text-slate-500 text-sm font-light">Record site data and submit to engineering</p>
        </div>
      </div>

      {/* Submitted Banner */}
      {isSubmitted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center gap-4 hero-fade-up">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-900">Project Submitted to Engineering</h3>
            <p className="text-sm text-emerald-700">Submitted on {appointment.projectSubmission?.submittedAt ? format(new Date(appointment.projectSubmission.submittedAt), 'MMMM d, yyyy h:mm a') : 'N/A'}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-sm p-6 space-y-6 hero-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-xl text-slate-400">
              {appointment.customer?.profile?.firstName?.[0] || 'C'}
            </div>
            <div>
              <h2 className="font-bold text-slate-900">
                {appointment.customer?.profile?.firstName} {appointment.customer?.profile?.lastName}
              </h2>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Customer</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            {appointment.customer?.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">{appointment.customer.email}</span>
              </div>
            )}
            {appointment.customer?.profile?.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">{appointment.customer.profile.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{format(new Date(appointment.scheduledDate), 'MMMM d, yyyy')}</span>
            </div>
            {appointment.interestedCategory && (
              <div className="flex items-center gap-3 text-sm">
                <Package className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600 capitalize">{appointment.interestedCategory}</span>
              </div>
            )}
          </div>

          {appointment.siteAddress && (
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-400 uppercase">Site Location</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {[appointment.siteAddress.street, appointment.siteAddress.barangay, appointment.siteAddress.city, appointment.siteAddress.province].filter(Boolean).join(', ')}
              </p>
            </div>
          )}

          {appointment.description && (
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Customer Request</p>
              <p className="text-sm text-slate-600 italic">"{appointment.description}"</p>
            </div>
          )}

          {/* Progress */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-4">Progress</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${appointment.salesAcceptance?.accepted ? 'bg-emerald-500 text-white' : 'bg-slate-100'}`}>
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <span className="text-xs font-medium text-slate-600">Accepted</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isDataSaved ? 'bg-emerald-500 text-white' : 'bg-slate-100'}`}>
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <span className="text-xs font-medium text-slate-600">Data Recorded</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSubmitted ? 'bg-emerald-500 text-white' : 'bg-slate-100'}`}>
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <span className="text-xs font-medium text-slate-600">Submitted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recording Form */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-sm p-6 md:p-8 space-y-8 hero-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <MapPinned className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Site & Project Details</h3>
              <p className="text-xs text-slate-500">Fill in all details then submit to engineering</p>
            </div>
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Project Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {PROJECT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setForm({ ...form, projectType: type.value })}
                  disabled={isSubmitted}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
                    form.projectType === type.value
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Measurements / Dimensions */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Measurements & Dimensions <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.measurements}
              onChange={(e) => setForm({ ...form, measurements: e.target.value })}
              rows={5}
              disabled={isSubmitted}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
              placeholder="Enter detailed measurements (Length x Width x Height)&#10;Example:&#10;- Main gate: 3.5m x 2.1m&#10;- Side panels: 1.2m x 2.1m (2 pcs)"
            />
          </div>

          {/* Feasibility Assessment */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Feasibility Assessment
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: 'feasible', label: 'Feasible', color: 'emerald' },
                { val: 'needs_adjustment', label: 'Needs Adjustment', color: 'amber' },
                { val: 'not_feasible', label: 'Not Feasible', color: 'red' }
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setForm({ ...form, feasibilityAssessment: opt.val as 'feasible' | 'needs_adjustment' | 'not_feasible' })}
                  disabled={isSubmitted}
                  className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
                    form.feasibilityAssessment === opt.val
                      ? opt.color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : opt.color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Materials */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Preferred Materials & Finish
            </label>
            <textarea
              value={form.preferredMaterials}
              onChange={(e) => setForm({ ...form, preferredMaterials: e.target.value })}
              rows={2}
              disabled={isSubmitted}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
              placeholder="e.g., Stainless Steel 304, Hairline Finish, Powder Coated Black..."
            />
          </div>

          {/* Observations / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Site Observations & Notes
            </label>
            <textarea
              value={form.observations}
              onChange={(e) => setForm({ ...form, observations: e.target.value })}
              rows={3}
              disabled={isSubmitted}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
              placeholder="Notes about site access, constraints, existing structures, special conditions..."
            />
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Special Instructions for Engineer
            </label>
            <textarea
              value={form.specialInstructions}
              onChange={(e) => setForm({ ...form, specialInstructions: e.target.value })}
              rows={2}
              disabled={isSubmitted}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
              placeholder="Timeline urgency, design preferences, budget considerations..."
            />
          </div>

          {/* Action Buttons */}
          {!isSubmitted && (
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
              <button
                onClick={handleSave}
                disabled={saving || !form.measurements.trim()}
                className="flex-1 px-6 py-4 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Draft
              </button>
              <button
                onClick={handleSubmitToEngineer}
                disabled={submitting || !form.projectType || !form.measurements.trim()}
                className="flex-1 px-6 py-4 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit to Engineering
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesRecording;
