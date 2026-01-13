import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { appointmentApi } from '../../../api/services';
import { useNotification } from '../../../contexts/NotificationContext';

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
}

const BookAppointment: React.FC = () => {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [step, setStep] = useState(1);
  const [appointmentType, setAppointmentType] = useState<'office_consultation' | 'ocular_visit'>('office_consultation');
  const [projectInterest, setProjectInterest] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [description, setDescription] = useState('');
  const [siteAddress, setSiteAddress] = useState<SiteAddress>({
    street: '',
    barangay: '',
    city: '',
    province: '',
    zipCode: '',
    landmark: '',
  });
  const [isOutsideNCR, setIsOutsideNCR] = useState(false);
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
      
      // Only add optional fields if they have values
      if (projectInterest) appointmentData.description = projectInterest;
      if (projectInterest) appointmentData.notes = projectInterest;
      if (appointmentType === 'ocular_visit' && siteAddress.street) {
        appointmentData.siteAddress = siteAddress;
      }
      
      const response = await appointmentApi.create(appointmentData);
      const created = response?.data?.appointment || response?.data?.data?.appointment || response?.appointment;
      const appointmentId = created?._id || '—';

      notify({
        type: 'success',
        title: 'Appointment booked',
        message: `We will confirm your schedule shortly. Appointment ID: ${appointmentId}`,
        persist: true,
      });
      navigate('/dashboard/customer/appointments', {
        state: { success: 'Appointment booked successfully! Our team will confirm your schedule shortly.' }
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
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Select Appointment Type</h2>
          
          {/* Office Consultation Option */}
          <button
            onClick={() => setAppointmentType('office_consultation')}
            className={`w-full p-5 md:p-6 rounded-2xl border-2 text-left transition-all ${
              appointmentType === 'office_consultation'
                ? 'border-slate-900 bg-slate-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                appointmentType === 'office_consultation' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">Office Consultation</p>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    appointmentType === 'office_consultation' ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                  }`}>
                    {appointmentType === 'office_consultation' && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-1">Visit our office to discuss your project. Bring photos or approximate measurements.</p>
                <div className="mt-3 flex items-center text-sm text-emerald-600 font-medium">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  No travel fee
                </div>
              </div>
            </div>
          </button>

          {/* Ocular Visit Option */}
          <button
            onClick={() => {
              setAppointmentType('ocular_visit');
              setShowTravelFeeInfo(true);
            }}
            className={`w-full p-5 md:p-6 rounded-2xl border-2 text-left transition-all ${
              appointmentType === 'ocular_visit'
                ? 'border-slate-900 bg-slate-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                appointmentType === 'ocular_visit' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">Ocular Visit</p>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    appointmentType === 'ocular_visit' ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                  }`}>
                    {appointmentType === 'ocular_visit' && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-1">Our sales staff will visit your location to assess the project site and take measurements.</p>
                <div className="mt-3 text-sm text-amber-600 font-medium">
                  Travel fee may apply for areas outside NCR
                </div>
              </div>
            </div>
          </button>

          {/* Travel Fee Info Modal */}
          {showTravelFeeInfo && appointmentType === 'ocular_visit' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-amber-900">Travel Fee Policy</p>
                  <ul className="text-sm text-amber-800 mt-2 space-y-1">
                    <li>• <strong>Metro Manila:</strong> FREE ocular visit</li>
                    <li>• <strong>Outside NCR:</strong> ₱350 for up to 6 km</li>
                    <li>• Additional ₱60 per km beyond 6 km</li>
                    <li>• Fee is collected on-site during the visit</li>
                  </ul>
                  <button 
                    onClick={() => setShowTravelFeeInfo(false)}
                    className="mt-3 text-sm text-amber-700 hover:text-amber-900 font-medium"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Project Interest Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">What are you interested in?</label>
            <textarea
              value={projectInterest}
              onChange={(e) => setProjectInterest(e.target.value)}
              placeholder="Describe what you're looking for... (e.g., Stainless steel gate for my driveway, Kitchen equipment for my restaurant, Window grills for 3 windows, etc.)"
              rows={4}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
            />
            <p className="text-xs text-slate-500 mt-2">
              Be as specific as possible - include dimensions, quantity, or any special requirements you have in mind.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStep(2)}
              disabled={!projectInterest.trim()}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Date & Time (+ Address for Ocular) */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {appointmentType === 'ocular_visit' ? 'Site Details & Schedule' : 'Select Date & Time'}
          </h2>
          
          {/* Site Address for Ocular Visit */}
          {appointmentType === 'ocular_visit' && (
            <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Site Address
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-600 mb-1.5">Street Address *</label>
                  <input
                    type="text"
                    value={siteAddress.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="House/Building No., Street Name"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">Barangay</label>
                  <input
                    type="text"
                    value={siteAddress.barangay}
                    onChange={(e) => handleAddressChange('barangay', e.target.value)}
                    placeholder="Barangay"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">City/Municipality *</label>
                  <input
                    type="text"
                    value={siteAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="City or Municipality"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">Province</label>
                  <input
                    type="text"
                    value={siteAddress.province}
                    onChange={(e) => handleAddressChange('province', e.target.value)}
                    placeholder="Province"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">Zip Code</label>
                  <input
                    type="text"
                    value={siteAddress.zipCode}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                    placeholder="Zip Code"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-600 mb-1.5">Landmark (for easier navigation)</label>
                  <input
                    type="text"
                    value={siteAddress.landmark}
                    onChange={(e) => handleAddressChange('landmark', e.target.value)}
                    placeholder="Near school, church, etc."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Travel Fee Notice */}
              {isOutsideNCR && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-medium text-amber-900">Outside NCR Travel Fee</p>
                    <p className="text-sm text-amber-700 mt-1">
                      A travel fee of ₱350 (up to 6 km) plus ₱60/km beyond will apply. 
                      This covers transportation and assessment time.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-blue-900">Business Hours</p>
                <p className="text-sm text-blue-700">Monday - Friday, 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Date</label>
            <input
              type="date"
              min={getMinDate()}
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Select Time</label>
              {loadingSlots && (
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
                  Checking availability...
                </div>
              )}
              {slotsError && (
                <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                  {slotsError}
                </div>
              )}
              {availableStaff.length > 0 && (
                <div className="mb-3 text-xs text-slate-500">
                  Available staff for this date: {availableStaff.join(', ')}
                  {availableStaff.length >= 3 && ' …'}
                </div>
              )}
              <div className="grid grid-cols-4 gap-2 md:gap-3">
                {TIME_SLOTS.map((slot) => {
                  const isAvailable = availableTimes.includes(slot.time);
                  return (
                    <button
                      key={slot.time}
                      onClick={() => isAvailable && setSelectedTime(slot.time)}
                      disabled={!isAvailable}
                      className={`p-2.5 md:p-3 rounded-xl text-xs md:text-sm font-medium transition-all ${
                        selectedTime === slot.time
                          ? 'bg-slate-900 text-white'
                          : isAvailable
                            ? 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                            : 'bg-slate-50 text-slate-400 border border-dashed border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
              {selectedTime && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Staff who can take this time</p>
                  {staffForSelectedTime.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {staffForSelectedTime.map((name) => (
                        <span
                          key={name}
                          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No staff shown yet for this slot.</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 text-slate-600 font-medium hover:text-slate-900 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedDate || !selectedTime || !availableTimes.includes(selectedTime) || (appointmentType === 'ocular_visit' && (!siteAddress.street || !siteAddress.city))}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Confirm Your Appointment</h2>
          
          {/* Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-500">Type</span>
                <span className="font-medium text-slate-900 capitalize">
                  {appointmentType === 'office_consultation' ? 'Office Consultation' : 'Ocular Visit'}
                </span>
              </div>
              <div className="py-3 border-b border-slate-100">
                <span className="text-slate-500 block mb-2">Project Interest</span>
                <p className="font-medium text-slate-900 text-sm">
                  {projectInterest}
                </p>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-slate-900">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-500">Time</span>
                <span className="font-medium text-slate-900">
                  {TIME_SLOTS.find(s => s.time === selectedTime)?.label}
                </span>
              </div>
              {staffForSelectedTime.length > 0 && (
                <div className="py-3 border-b border-slate-100">
                  <span className="text-slate-500 block mb-2">Staff for this time</span>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {staffForSelectedTime.map((name) => (
                      <span key={name} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Site Address for Ocular */}
              {appointmentType === 'ocular_visit' && (
                <div className="py-3 border-b border-slate-100">
                  <span className="text-slate-500 block mb-2">Location</span>
                  <p className="font-medium text-slate-900">
                    {siteAddress.street}, {siteAddress.barangay && `${siteAddress.barangay}, `}{siteAddress.city}
                    {siteAddress.province && `, ${siteAddress.province}`}
                    {siteAddress.zipCode && ` ${siteAddress.zipCode}`}
                  </p>
                  {siteAddress.landmark && (
                    <p className="text-sm text-slate-500 mt-1">Near: {siteAddress.landmark}</p>
                  )}
                </div>
              )}

              {/* Travel Fee Notice */}
              {appointmentType === 'ocular_visit' && isOutsideNCR && (
                <div className="flex items-center justify-between py-3 bg-amber-50 -mx-5 md:-mx-6 px-5 md:px-6">
                  <span className="text-amber-800 font-medium">Travel Fee (Outside NCR)</span>
                  <span className="font-semibold text-amber-900">₱350+</span>
                </div>
              )}
            </div>
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Project Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Tell us about your project, specific requirements, preferred materials, or any reference designs you have in mind..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
            />
          </div>

          {/* Tips based on appointment type */}
          {appointmentType === 'office_consultation' && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="font-medium text-blue-900 mb-2">💡 Tips for your office visit:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Bring photos of the project area</li>
                <li>• Prepare approximate measurements if available</li>
                <li>• Have reference designs or samples ready</li>
              </ul>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 text-slate-600 font-medium hover:text-slate-900 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Booking...
                </span>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
