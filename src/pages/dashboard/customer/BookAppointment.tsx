import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { appointmentApi } from '../../../api/services';
import { useNotification } from '../../../contexts/NotificationContext';
import { Calendar, Clock, MapPin, User, Briefcase, FileText, Info, CheckCircle2, ChevronRight, AlignLeft, Lightbulb, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import MapSelector from '../../../components/MapSelector';
import axios from 'axios';


interface ExistingAppointment {
  _id: string;
  scheduledDate: string;
  status: string;
  appointmentType: string;
}

const TIME_SLOTS = [
  { time: '09:00', label: '9:00 AM' },
  { time: '10:00', label: '10:00 AM' },
  { time: '11:00', label: '11:00 AM' },
  { time: '13:00', label: '1:00 PM' },
  { time: '14:00', label: '2:00 PM' },
  { time: '15:00', label: '3:00 PM' },
  { time: '16:00', label: '4:00 PM' },
  { time: '17:00', label: '5:00 PM' },
];

interface SiteAddress {
  street: string;
  barangay: string;
  city: string;
  province: string;
  zipCode: string;
  landmark: string;
  coordinates?: {
     lat: number;
     lng: number;
  };
}

const BookAppointment: React.FC = () => {
  const navigate = useNavigate();
  const { notify } = useNotification();

  // Load saved state
  // eslint-disable-next-line
  const savedState = React.useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('RMV_BOOKING_FORM') || '{}');
    } catch {
      return {};
    }
  }, []);

  const [step, setStep] = useState(savedState.step || 1);
  const [appointmentType, setAppointmentType] = useState<'office_consultation' | 'ocular_visit'>(savedState.appointmentType || 'office_consultation');
  const [projectInterest, setProjectInterest] = useState(savedState.projectInterest || '');
  const [selectedDate, setSelectedDate] = useState(savedState.selectedDate || '');
  const [selectedTime, setSelectedTime] = useState(savedState.selectedTime || '');
  const [description, setDescription] = useState(savedState.description || '');
  const [siteAddress, setSiteAddress] = useState<SiteAddress>(savedState.siteAddress || {
    street: '',
    barangay: '',
    city: '',
    province: '',
    zipCode: '',
    landmark: '',
  });
  const [isOutsideNCR, setIsOutsideNCR] = useState(savedState.isOutsideNCR || false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showTravelFeeInfo, setShowTravelFeeInfo] = useState(false);
  const [existingAppointment, setExistingAppointment] = useState<ExistingAppointment | null>(null);
  const [checkingAppointment, setCheckingAppointment] = useState(true);
  const [availableTimes, setAvailableTimes] = useState<string[]>(TIME_SLOTS.map((s) => s.time));
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [availableStaff, setAvailableStaff] = useState<string[]>([]);
  const [availableStaffByTime, setAvailableStaffByTime] = useState<Record<string, string[]>>({});

  // Save form state to sessionStorage
  useEffect(() => {
    const state = {
      step,
      appointmentType,
      projectInterest,
      selectedDate,
      selectedTime,
      description,
      siteAddress,
      isOutsideNCR
    };
    sessionStorage.setItem('RMV_BOOKING_FORM', JSON.stringify(state));
  }, [step, appointmentType, projectInterest, selectedDate, selectedTime, description, siteAddress, isOutsideNCR]);

  // Check for existing active appointments
  useEffect(() => {
    const checkExistingAppointment = async () => {
      try {
        const response = await appointmentApi.getAll({ limit: 10 });
        const appointments = response.data?.appointments || [];
        // Find any appointment that hasn't reached its scheduled date yet and is not cancelled/completed
        const activeAppointment = appointments.find((apt: ExistingAppointment) => {
          const scheduledDate = new Date(apt.scheduledDate);
          const now = new Date();
          const isUpcoming = scheduledDate > now;
          const isActive = ['pending', 'scheduled', 'confirmed'].includes(apt.status);
          return isUpcoming && isActive;
        });
        setExistingAppointment(activeAppointment || null);
      } catch (error) {
        console.error('Failed to check existing appointments:', error);
      } finally {
        setCheckingAppointment(false);
      }
    };
    checkExistingAppointment();
  }, []);

  // Load availability for the selected date
  useEffect(() => {
    if (!selectedDate) return;

    let cancelled = false;
    const loadSlots = async () => {
      setLoadingSlots(true);
      setSlotsError('');
      try {
        const response = await appointmentApi.getSlots(selectedDate);
        if (cancelled) return;

        const availability = response.data?.availability;
        if (availability && Array.isArray(availability)) {
          const times = new Set<string>();
          const staffWithSlots: string[] = [];
          const staffByTime: Record<string, Set<string>> = {};
          availability.forEach((staff: any) => {
            (staff.slots || []).forEach((slot: any) => {
              if (slot.isAvailable && slot.start) {
                const start = new Date(slot.start);
                const hh = String(start.getHours()).padStart(2, '0');
                const mm = String(start.getMinutes()).padStart(2, '0');
                times.add(`${hh}:${mm}`);
                if (staff.salesStaff?.name) {
                  const key = `${hh}:${mm}`;
                  if (!staffByTime[key]) staffByTime[key] = new Set();
                  staffByTime[key].add(staff.salesStaff.name);
                }
              }
            });
            const hasAvailability = (staff.slots || []).some((slot: any) => slot.isAvailable);
            if (hasAvailability && staff.salesStaff?.name) {
              staffWithSlots.push(staff.salesStaff.name);
            }
          });
          const list = Array.from(times).sort();
          const normalizedStaffByTime: Record<string, string[]> = {};
          Object.entries(staffByTime).forEach(([time, names]) => {
            normalizedStaffByTime[time] = Array.from(names).sort();
          });
          setAvailableTimes(list);
          setAvailableStaff(staffWithSlots.slice(0, 3));
          setAvailableStaffByTime(normalizedStaffByTime);
          if (list.length === 0) {
            setSlotsError('No staff available for this date. Please pick another date.');
          }
        } else {
          // Fallback: allow default slots if API shape changes
          setAvailableTimes(TIME_SLOTS.map((s) => s.time));
          setAvailableStaff([]);
          setAvailableStaffByTime({});
        }
      } catch (err) {
        if (!cancelled) {
          setSlotsError('Could not load availability. Please try another date.');
          setAvailableTimes([]);
          setAvailableStaff([]);
          setAvailableStaffByTime({});
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    };

    loadSlots();
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  // NCR provinces/cities
  const NCR_AREAS = ['Metro Manila', 'NCR', 'Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig', 'Mandaluyong', 'Pasay', 'Parañaque', 'Las Piñas', 'Muntinlupa', 'Caloocan', 'Malabon', 'Navotas', 'Valenzuela', 'Marikina', 'San Juan', 'Pateros'];

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Check if selected date is weekend
  const isWeekend = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    if (isWeekend(date)) {
      setError('We are closed on weekends. Please select a weekday.');
      return;
    }
    setError('');
    setSelectedDate(date);
    setSelectedTime('');
    setSlotsError('');
    setAvailableStaff([]);
    setAvailableStaffByTime({});
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    setSiteAddress(prev => ({ ...prev, coordinates: { lat, lng } }));
    
    // Reverse Geocode to fill address fields if possible
    try {
      const { data } = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const addr = data.address;
      
      setSiteAddress(prev => ({
         ...prev,
         street: addr.road || addr.house_number || prev.street,
         city: addr.city || addr.town || addr.village || prev.city,
         province: addr.state || addr.region || prev.province,
         barangay: addr.quarter || addr.suburb || prev.barangay,
         zipCode: addr.postcode || prev.zipCode
      }));

       // Check if outside NCR
       const location = addr.state || addr.region || '';
       const cityValue = addr.city || addr.town || addr.village || '';
       if (location || cityValue) {
          const isNCR = NCR_AREAS.some(area => 
            (location && location.toLowerCase().includes(area.toLowerCase())) ||
            (cityValue && cityValue.toLowerCase().includes(area.toLowerCase()))
          );
          setIsOutsideNCR(!isNCR);
       }

    } catch (e) {
      console.error("Failed to reverse geocode", e);
    }
  };

  const handleAddressChange = (field: keyof SiteAddress, value: string) => {
    setSiteAddress(prev => ({ ...prev, [field]: value }));
    // Check if outside NCR
    if (field === 'city' || field === 'province') {
      const location = field === 'province' ? value : siteAddress.province;
      const cityValue = field === 'city' ? value : siteAddress.city;
      const isNCR = NCR_AREAS.some(area => 
        location.toLowerCase().includes(area.toLowerCase()) ||
        cityValue.toLowerCase().includes(area.toLowerCase())
      );
      setIsOutsideNCR(!isNCR && (location.length > 0 || cityValue.length > 0));
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time');
      return;
    }

    if (!availableTimes.includes(selectedTime)) {
      setError('Selected time is no longer available. Please pick another slot.');
      return;
    }

    if (appointmentType === 'ocular_visit' && (!siteAddress.city || !siteAddress.street)) {
      setError('Please provide your site address for the ocular visit');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Combine date and time into ISO string
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      
      const appointmentData: any = {
        scheduledDate: scheduledDateTime.toISOString(),
        appointmentType,
      };
      
      // Combine projectInterest and description if both exist, or use one
      const finalDescription = [projectInterest, description].filter(Boolean).join('\n\nNotes: ');
      if (finalDescription) {
          appointmentData.description = finalDescription;
          appointmentData.notes = finalDescription;
      }

      if (appointmentType === 'ocular_visit' && siteAddress.street) {
        appointmentData.siteAddress = siteAddress;
      }
      
      const response = await appointmentApi.create(appointmentData);
      const created = response?.data?.appointment || response?.data?.data?.appointment || response?.appointment;
      const appointmentId = created?._id || '—';

      notify({
        type: 'success',
        title: 'Request Submitted',
        message: `Your appointment request has been submitted. Please wait for agent approval.`,
        persist: true,
      });

      // Clear saved state
      sessionStorage.removeItem('RMV_BOOKING_FORM');

      navigate('/dashboard/customer/appointments', {
        state: { success: 'Appointment request submitted! Our agent will review and approve your request shortly.' }
      });
    } catch (err: any) {
      console.error('Appointment booking error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to book appointment. Please try again.');
      notify({ type: 'error', title: 'Booking failed', message: err.response?.data?.message || 'Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const staffForSelectedTime = selectedTime ? availableStaffByTime[selectedTime] || [] : [];

  // Show loading while checking for existing appointment
  if (checkingAppointment) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Book an Appointment</h1>
          <p className="text-slate-500 mt-1">Schedule a consultation to discuss your stainless steel project</p>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // Show message if user already has an active appointment
  if (existingAppointment) {
    const scheduledDate = new Date(existingAppointment.scheduledDate);
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Book an Appointment</h1>
          <p className="text-slate-500 mt-1">Schedule a consultation to discuss your stainless steel project</p>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-amber-900">You Already Have an Upcoming Appointment</h2>
              <p className="text-amber-800 mt-2">
                You can only book one appointment at a time. Please wait for your current appointment to be completed before booking a new one.
              </p>
              
              <div className="mt-6 p-4 bg-white rounded-xl border border-amber-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-500">Scheduled Date</span>
                  <span className="font-medium text-slate-900">
                    {scheduledDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-500">Time</span>
                  <span className="font-medium text-slate-900">
                    {scheduledDate.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Type</span>
                  <span className="font-medium text-slate-900 capitalize">
                    {existingAppointment.appointmentType === 'office_consultation' ? 'Office Consultation' : 'Ocular Visit'}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/dashboard/customer/appointments"
                  className="flex-1 px-5 py-3 bg-slate-900 text-white rounded-xl font-medium text-center hover:bg-slate-800 transition-colors"
                >
                  View My Appointments
                </Link>
                <Link
                  to="/dashboard/customer"
                  className="flex-1 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-center hover:bg-slate-50 transition-colors"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Book an Appointment</h1>
        <p className="text-slate-500 mt-1">Schedule a consultation to discuss your stainless steel project</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${
                step >= s
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-slate-900' : 'bg-slate-100'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Appointment Type */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Choose Service Type</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Office Consultation Option */}
              <button
                onClick={() => setAppointmentType('office_consultation')}
                className={`relative group p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                  appointmentType === 'office_consultation'
                    ? 'border-slate-900 bg-slate-50 shadow-sm'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                }`}
              >
                {appointmentType === 'office_consultation' && (
                  <div className="absolute top-4 right-4 text-slate-900">
                    <CheckCircle2 className="w-6 h-6 fill-slate-900 text-white" />
                  </div>
                )}
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                   appointmentType === 'office_consultation' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
                }`}>
                  <Briefcase className="w-7 h-7" />
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2">Office Consultation</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  Visit our showroom to discuss designs. Perfect for initial planning and material selection.
                </p>
                
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 py-1.5 px-3 rounded-lg w-fit">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Free of Charge</span>
                </div>
              </button>

              {/* Ocular Visit Option */}
              <button
                onClick={() => {
                  setAppointmentType('ocular_visit');
                  setShowTravelFeeInfo(true);
                }}
                className={`relative group p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                  appointmentType === 'ocular_visit'
                    ? 'border-slate-900 bg-slate-50 shadow-sm'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                }`}
              >
                {appointmentType === 'ocular_visit' && (
                  <div className="absolute top-4 right-4 text-slate-900">
                    <CheckCircle2 className="w-6 h-6 fill-slate-900 text-white" />
                  </div>
                )}
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                   appointmentType === 'ocular_visit' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-600 group-hover:bg-purple-100'
                }`}>
                  <MapPin className="w-7 h-7" />
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2">Ocular Site Visit</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  We visit your location for precise measurements and site conditions assessment.
                </p>
                
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 py-1.5 px-3 rounded-lg w-fit">
                  <Info className="w-3.5 h-3.5" />
                  <span>Travel Fee May Apply</span>
                </div>
              </button>
            </div>
          </div>

          {/* Travel Fee Info Modal - Styled nicely inline */}
          {showTravelFeeInfo && appointmentType === 'ocular_visit' && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 animate-in fade-in slide-in-from-top-2">
              <div className="flex gap-4">
                <div className="p-2 bg-amber-100 rounded-xl h-fit">
                  <Info className="w-5 h-5 text-amber-700" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-amber-900 mb-2">Travel Fee Policy</h4>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm text-amber-800">
                    <div className="space-y-1">
                      <p className="font-semibold">Within Metro Manila (NCR)</p>
                      <p className="text-amber-700 opacity-80">Free ocular visit</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold">Outside NCR</p>
                      <p className="text-amber-700 opacity-80">Starts at ₱350 (base 6km) + ₱60/km</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowTravelFeeInfo(false)}
                    className="mt-4 text-xs font-bold uppercase tracking-wider text-amber-900 hover:text-amber-700 flex items-center gap-1"
                  >
                    Dismiss <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Project Interest Description */}
          <div className="bg-slate-50 rounded-2xl p-6 md:p-8 space-y-4">
             <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm flex-shrink-0">
                  <FileText className="w-5 h-5 text-slate-600" />
               </div>
               <div className="flex-1">
                  <label className="block text-slate-900 font-bold mb-2">What are you interested in?</label>
                  <p className="text-sm text-slate-500 mb-4">Briefly describe your requirements (e.g., Gate dimensions, Window grill type, Kitchen layout).</p>
                  <textarea
                    value={projectInterest}
                    onChange={(e) => setProjectInterest(e.target.value)}
                    placeholder="E.g. I need a stainless steel gate for a 4-meter driveway, modern design..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none shadow-sm text-sm"
                  />
               </div>
             </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              disabled={!projectInterest.trim()}
              className="group flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:shadow-slate-900/10 active:transform active:scale-95"
            >
              <span>Continue to Schedule</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Date & Time (+ Address for Ocular) */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex flex-col md:flex-row gap-8">
              {/* Left Column: Calendar & Date */}
              <div className="md:w-1/3 space-y-6">
                 <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">Select Date</h2>
                    <p className="text-sm text-slate-500 mb-4">Choose a convenient day for your schedule.</p>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                       <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Calendar</label>
                       <input
                         type="date"
                         min={getMinDate()}
                         value={selectedDate}
                         onChange={handleDateChange}
                         className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-medium"
                       />
                       <div className="mt-3 flex items-start gap-2 text-xs text-slate-500">
                          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p>We are closed on weekends. Please pick a weekday (Mon-Fri).</p>
                       </div>
                    </div>
                 </div>

                 {/* Business Hours Info - Moved here for sidebar feel */}
                 <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                       <Clock className="w-5 h-5 text-blue-600 mt-1" />
                       <div>
                          <p className="font-bold text-blue-900 text-sm">Business Hours</p>
                          <p className="text-sm text-blue-700 leading-relaxed mt-1">
                             Monday - Friday<br/>
                             9:00 AM - 6:00 PM
                          </p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Right Column: Time Slots & Address (Layout Adjusted) */}
              <div className="md:w-2/3 space-y-8">


                 {/* Time Slots Section */}
                 {selectedDate ? (
                   <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Available Time Slots</h3>
                      
                      {loadingSlots && (
                        <div className="flex items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                           <Loader2 className="w-5 h-5 animate-spin text-slate-400 mr-2" />
                           <span className="text-slate-500 font-medium">Checking availability...</span>
                        </div>
                      )}

                      {slotsError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-2">
                           <Info className="w-4 h-4" />
                           <span>{slotsError}</span>
                        </div>
                      )}

                      {!loadingSlots && !slotsError && (
                         <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {TIME_SLOTS.map((slot) => {
                               const isAvailable = availableTimes.includes(slot.time);
                               const isSelected = selectedTime === slot.time;
                               return (
                                  <button
                                    key={slot.time}
                                    onClick={() => isAvailable && setSelectedTime(slot.time)}
                                    disabled={!isAvailable}
                                    className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                                       isSelected
                                          ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 transform scale-105'
                                          : isAvailable
                                             ? 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'
                                             : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                    }`}
                                  >
                                    {slot.label}
                                  </button>
                               );
                            })}
                         </div>
                      )}
                      
                      {/* Available Staff Indicator */}
                      {selectedTime && staffForSelectedTime.length > 0 && (
                        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl inline-flex items-center gap-2">
                           <div className="flex -space-x-2">
                              {staffForSelectedTime.slice(0, 3).map((_, i) => (
                                 <div key={i} className="w-6 h-6 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center text-[10px] text-emerald-700 font-bold">
                                    <User className="w-3 h-3" />
                                 </div>
                              ))}
                           </div>
                           <span className="text-xs font-semibold text-emerald-700">
                              {staffForSelectedTime.length} specialist{staffForSelectedTime.length > 1 ? 's' : ''} available
                           </span>
                        </div>
                      )}
                   </div>
                 ) : (
                    /* Prompt to select date first */
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                       <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-6 ring-4 ring-slate-100">
                          <Calendar className="w-8 h-8 text-slate-400" />
                       </div>
                       <h3 className="text-lg font-bold text-slate-900 mb-2">Select a Date to Continue</h3>
                       <p className="text-slate-500 max-w-xs mx-auto leading-relaxed text-sm">
                          Please choose your preferred appointment date from the calendar to view available time slots for our specialists.
                       </p>
                       
                       <div className={`mt-8 grid gap-4 w-full max-w-sm ${appointmentType === 'ocular_visit' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                          {appointmentType !== 'ocular_visit' && (
                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                  <Clock className="w-4 h-4" />
                               </div>
                               <div className="text-left">
                                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Duration</p>
                                  <p className="text-xs font-bold text-slate-700">~60 Mins</p>
                               </div>
                            </div>
                          )}
                          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <User className="w-4 h-4" />
                             </div>
                             <div className="text-left">
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Specialists</p>
                                <p className="text-xs font-bold text-slate-700">Expert Team</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 )}
              </div>
           </div>

           {/* Address Section (Moved for better UX - Shows below date selection) */}
           {appointmentType === 'ocular_visit' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                 <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                       <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                          <MapPin className="w-5 h-5" />
                       </div>
                       <div>
                          <h3 className="font-bold text-slate-900">Site Location</h3>
                          <p className="text-xs text-slate-500">Where should we visit?</p>
                       </div>
                    </div>
                    
                     {/* Map Selector */}
                     <div className="mb-6 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                         <div className="h-[300px] w-full relative z-0">
                            <MapSelector 
                                initialLat={siteAddress.coordinates?.lat} 
                                initialLng={siteAddress.coordinates?.lng}
                                onLocationSelect={handleLocationSelect}
                            />
                         </div>
                     </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Street Address</label>
                          <input
                            type="text"
                            value={siteAddress.street}
                            onChange={(e) => handleAddressChange('street', e.target.value)}
                            placeholder="House/Building No., Street Name"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all focus:bg-white"
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Barangay</label>
                          <input
                            type="text"
                            value={siteAddress.barangay}
                            onChange={(e) => handleAddressChange('barangay', e.target.value)}
                            placeholder="Brgy."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all focus:bg-white"
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">City/Municipality</label>
                          <input
                            type="text"
                            value={siteAddress.city}
                            onChange={(e) => handleAddressChange('city', e.target.value)}
                            placeholder="City"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all focus:bg-white"
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Province</label>
                          <input
                            type="text"
                            value={siteAddress.province}
                            onChange={(e) => handleAddressChange('province', e.target.value)}
                            placeholder="Province"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all focus:bg-white"
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Zip Code</label>
                          <input
                            type="text"
                            value={siteAddress.zipCode}
                            onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                            placeholder="Zip"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all focus:bg-white"
                          />
                       </div>
                       <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Landmark</label>
                          <input
                            type="text"
                            value={siteAddress.landmark}
                            onChange={(e) => handleAddressChange('landmark', e.target.value)}
                            placeholder="Nearby landmark for easier location finding"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all focus:bg-white"
                          />
                       </div>
                    </div>
                    
                    {/* Travel Fee Notice */}
                    {isOutsideNCR && (
                       <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                          <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700">
                             <Info className="w-4 h-4" />
                          </div>
                          <div>
                             <p className="font-bold text-amber-900 text-sm">Outside NCR Fee Applies</p>
                             <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                                Additional travel fee of ₱350+ will be collected on-site.
                             </p>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
           )}

           {/* Navigation Buttons */}
           <div className="flex justify-between pt-6 border-t border-slate-100">
             <button
               onClick={() => setStep(1)}
               className="flex items-center gap-2 px-6 py-3 text-slate-600 font-semibold hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
             >
               <ArrowLeft className="w-5 h-5" />
               <span>Back</span>
             </button>
             <button
               onClick={() => setStep(3)}
               disabled={!selectedDate || !selectedTime || !availableTimes.includes(selectedTime) || (appointmentType === 'ocular_visit' && (!siteAddress.street || !siteAddress.city))}
               className="group flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:shadow-slate-900/10 active:transform active:scale-95"
             >
               <span>Review Details</span>
               <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </button>
           </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Confirm Your Appointment</h2>
          
          {/* Summary Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header Strip */}
            <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Date</p>
                    <p className="font-semibold">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Time</p>
                    <p className="font-semibold">{TIME_SLOTS.find(s => s.time === selectedTime)?.label}</p>
                  </div>
               </div>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                 {/* Type */}
                 <div>
                    <label className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 block">Service Type</label>
                    <div className="flex items-start gap-4">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                         appointmentType === 'office_consultation' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                       }`}>
                          {appointmentType === 'office_consultation' ? <Briefcase className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                       </div>
                       <div>
                          <p className="font-bold text-slate-900 text-lg">
                            {appointmentType === 'office_consultation' ? 'Office Consultation' : 'Ocular Site Visit'}
                          </p>
                          <p className="text-sm text-slate-500 leading-relaxed mt-1">
                            {appointmentType === 'office_consultation' 
                              ? 'In-person meeting at our showroom to discuss designs and requirements.' 
                              : 'Site inspection and measurement at your provided location.'}
                          </p>
                       </div>
                    </div>
                 </div>

                 {/* Interest */}
                 <div>
                    <label className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 block">Project Interest</label>
                    <div className="pl-4 border-l-4 border-slate-900 py-1">
                       <p className="text-xl font-bold text-slate-900">{projectInterest}</p>
                    </div>
                 </div>
              </div>

              {/* Specialist Assignment Info */}
              <div className="pt-6 border-t border-slate-100">
                 <label className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 block">Specialist Assignment</label>
                 <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                       <User className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="font-medium text-blue-900">To be assigned</p>
                       <p className="text-sm text-blue-700">Our agent will assign a specialist after reviewing your request</p>
                    </div>
                 </div>
              </div>
              
              {/* Site Address for Ocular */}
              {appointmentType === 'ocular_visit' && (
                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-start gap-3">
                     <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                     <div>
                        <label className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1 block">Site Location</label>
                        <p className="font-medium text-slate-900">
                          {siteAddress.street}, {siteAddress.barangay && `${siteAddress.barangay}, `}{siteAddress.city}
                          {siteAddress.province && `, ${siteAddress.province}`}
                          {siteAddress.zipCode && ` ${siteAddress.zipCode}`}
                        </p>
                        {siteAddress.landmark && (
                          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                             <span className="font-medium">Landmark:</span> {siteAddress.landmark}
                          </p>
                        )}
                        
                        {isOutsideNCR && (
                          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-100 text-sm font-medium">
                             <Info className="w-4 h-4" />
                             <span>Out-of-town fee applies (₱350+)</span>
                          </div>
                        )}
                     </div>
                  </div>
                </div>
              )}
            </div>
          </div>

            {/* Project Description (Enhanced) */}
            <div className="bg-slate-50 rounded-2xl p-6 md:p-8 space-y-4">
               <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm flex-shrink-0">
                    <AlignLeft className="w-5 h-5 text-slate-600" />
                 </div>
                 <div className="flex-1">
                    <label className="block text-slate-900 font-bold mb-2">Project Notes (Optional)</label>
                    <p className="text-sm text-slate-500 mb-4">You can provide extra details, measurements, or specific focus areas for our discussion.</p>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="e.g. I prefer modern industrial style, approximate size is 30sqm..."
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none shadow-sm text-sm"
                    />
                 </div>
               </div>
            </div>

            {/* Preparation Tips */}
            {appointmentType === 'office_consultation' ? (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                 <div className="flex gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg h-fit text-blue-600">
                       <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                       <h4 className="font-bold text-blue-900 mb-2">To maximize your consultation:</h4>
                       <ul className="space-y-2">
                          {[
                            'Bring photos or videos of the project area',
                            'Have approximate dimensions/measurements ready',
                            'Save reference photos of designs you like'
                          ].map((tip, i) => (
                             <li key={i} className="flex items-center gap-2 text-sm text-blue-800">
                                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                <span>{tip}</span>
                             </li>
                          ))}
                       </ul>
                    </div>
                 </div>
              </div>
            ) : (
               <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
                 <div className="flex gap-4">
                    <div className="p-2 bg-purple-100 rounded-lg h-fit text-purple-600">
                       <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                       <h4 className="font-bold text-purple-900 mb-2">Preparing for our site visit:</h4>
                       <ul className="space-y-2">
                          {[
                            'Ensure the area is accessible for inspection',
                            'Have any building rules/permits ready if usually required',
                            'Prepare a list of specific concerns you want addressed'
                          ].map((tip, i) => (
                             <li key={i} className="flex items-center gap-2 text-sm text-purple-800">
                                <CheckCircle2 className="w-4 h-4 text-purple-500" />
                                <span>{tip}</span>
                             </li>
                          ))}
                       </ul>
                    </div>
                 </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
               <button
                 onClick={() => setStep(2)}
                 className="flex items-center gap-2 px-6 py-3 text-slate-600 font-semibold hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
               >
                 <ArrowLeft className="w-5 h-5" />
                 <span>Back to Schedule</span>
               </button>
               
               <button
                 onClick={handleSubmit}
                 disabled={submitting}
                 className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 active:transform active:scale-95 transition-all shadow-lg hover:shadow-xl hover:shadow-slate-900/10 disabled:opacity-70 disabled:cursor-not-allowed"
               >
                 {submitting ? (
                   <>
                     <Loader2 className="w-5 h-5 animate-spin" />
                     <span>Processing...</span>
                   </>
                 ) : (
                   <>
                     <span>Confirm Appointment</span>
                     <ArrowRight className="w-5 h-5" />
                   </>
                 )}
               </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
