import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, isWeekend } from 'date-fns';
import { appointmentApi } from '../../../api/services';
import { Modal } from '../../../components/ui';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, User, Phone, Mail, Briefcase, CheckCircle2, XCircle, AlertCircle, Eye, RefreshCw } from 'lucide-react';

interface Appointment {
  _id: string;
  customer?: {
    _id: string;
    profile?: {
      firstName: string;
      lastName: string;
      phone?: string;
    };
    email: string;
  };
  assignedSalesStaff?: {
    _id: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
  scheduledDate: string;
  appointmentType: 'office_consultation' | 'ocular_visit';
  status: 'pending' | 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'declined';
  interestedCategory?: string;
  description?: string;
  siteAddress?: {
    street?: string;
    city?: string;
    province?: string;
  };
}

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Pending' },
  scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Scheduled' },
  confirmed: { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500', label: 'Confirmed' },
  in_progress: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', label: 'In Progress' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Completed' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Cancelled' },
  declined: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', label: 'Declined' },
  no_show: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400', label: 'No Show' },
};

const CalendarView: React.FC = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [currentMonth]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      
      const response = await appointmentApi.getCalendar(
        format(start, 'yyyy-MM-dd'),
        format(end, 'yyyy-MM-dd')
      );
      // API returns either { success, data: { appointments } } or { success, data: { calendar } }
      const calendarMap = response?.data?.calendar;
      if (calendarMap && typeof calendarMap === 'object') {
        const normalized = Object.entries(calendarMap).flatMap(([dateKey, items]) => {
          if (!Array.isArray(items)) return [];
          return items.map((item) => {
            const fullName = (item?.customer || '').trim();
            const [firstName = 'Customer', ...rest] = fullName.split(' ');
            const lastName = rest.join(' ').trim() || undefined;
            const time = item?.time || '00:00';
            return {
              _id: item?.id || item?._id || `${dateKey}-${time}`,
              customer: {
                profile: { firstName, lastName },
                email: '',
              },
              assignedSalesStaff: item?.salesStaff
                ? { profile: { firstName: item.salesStaff.split(' ')[0] || '', lastName: item.salesStaff.split(' ').slice(1).join(' ') || '' } }
                : undefined,
              scheduledDate: `${dateKey}T${time}:00`,
              appointmentType: item?.type || 'office_consultation',
              status: item?.status || 'pending',
              interestedCategory: item?.category || undefined,
            } as Appointment;
          });
        });
        setAppointments(normalized);
      } else {
        const appointmentList = response?.data?.appointments || response?.appointments || (Array.isArray(response) ? response : []);
        setAppointments(appointmentList);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    appointments.forEach(apt => {
      const dateKey = format(new Date(apt.scheduledDate), 'yyyy-MM-dd');
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(apt);
    });
    return grouped;
  }, [appointments]);

  const renderHeader = () => (
    <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 relative z-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Appointment Calendar</h1>
        <p className="text-slate-500 text-sm mt-1">Visual overview of all scheduled appointments</p>
      </div>
      <div className="flex items-center gap-2 bg-slate-50/80 p-1.5 rounded-xl border border-slate-200/50 backdrop-blur-md">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600 hover:text-indigo-600"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="px-4 py-2 min-w-[160px] text-center">
          <span className="font-bold text-slate-800">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
        </div>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600 hover:text-indigo-600"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-slate-200 mx-2"></div>
        <button
          onClick={() => setCurrentMonth(new Date())}
          className="px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white hover:text-indigo-600 rounded-lg transition-all hover:shadow-sm"
        >
            Today
        </button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    return (
      <div className="grid grid-cols-5 mb-2 bg-slate-50/50 rounded-xl p-2 border border-slate-100/50">
        {days.map(day => (
          <div key={day} className="py-2 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        // Skip weekends
        if (isWeekend(day)) {
          day = addDays(day, 1);
          continue;
        }

        const dateKey = format(day, 'yyyy-MM-dd');
        const dayAppointments = appointmentsByDate[dateKey] || [];
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());
        const cloneDay = day;

        days.push(
          <div
            key={dateKey}
            onClick={() => {
              if (dayAppointments.length > 0) {
                setSelectedDate(cloneDay);
                setShowDayModal(true);
              }
            }}
            className={`
              min-h-[140px] p-2 border rounded-xl transition-all cursor-pointer flex flex-col gap-2 group relative overflow-hidden
              ${!isCurrentMonth ? 'bg-slate-50/30 border-slate-100 opacity-60 text-slate-400' : 'bg-white/80 border-slate-100 hover:border-indigo-200 hover:shadow-md hover:bg-white'}
              ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2 z-10' : ''}
              ${dayAppointments.length > 0 ? '' : 'hover:bg-slate-50/50'}
            `}
          >
            <div className="flex items-center justify-between relative z-10">
              <span className={`
                text-sm font-bold transition-all
                ${isToday ? 'bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30' : 'text-slate-700 group-hover:text-slate-900'}
              `}>
                {format(day, 'd')}
              </span>
              {dayAppointments.length > 0 && (
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                  {dayAppointments.length} Appts
                </span>
              )}
            </div>
            <div className="space-y-1.5 overflow-hidden flex-1 relative z-10">
              {dayAppointments.slice(0, 3).map((apt) => {
                const config = statusConfig[apt.status] || statusConfig.pending;
                return (
                  <div
                    key={apt._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAppointment(apt);
                      setShowDetailModal(true);
                    }}
                    className={`
                      ${config.bg} ${config.text} border border-transparent hover:border-current
                      text-[10px] px-2 py-1.5 rounded-lg truncate flex items-center gap-1.5
                      hover:shadow-sm transition-all cursor-pointer font-bold
                    `}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot} flex-shrink-0 animate-pulse`} />
                    <span className="truncate">
                      {format(new Date(apt.scheduledDate), 'HH:mm')} • {apt.customer?.profile?.firstName || 'Customer'}
                    </span>
                  </div>
                );
              })}
              {dayAppointments.length > 3 && (
                <div className="text-[10px] font-bold text-slate-400 text-center py-1 group-hover:text-indigo-600 transition-colors">
                  +{dayAppointments.length - 3} more appointments
                </div>
              )}
            </div>
            {/* Hover effect background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-50/0 group-hover:to-indigo-50/30 transition-all duration-500" />
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-5 gap-4">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="space-y-4">{rows}</div>;
  };

  const renderLegend = () => (
    <div className="mt-6 p-5 bg-white/50 backdrop-blur-sm border border-white rounded-2xl shadow-sm">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
         <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
         Status Legend
      </h3>
      <div className="flex flex-wrap gap-4">
        {Object.entries(statusConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-100 shadow-sm transition-transform hover:-translate-y-0.5">
            <span className={`w-2 h-2 rounded-full ${config.dot}`} />
            <span className="text-xs font-bold text-slate-600">{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStats = () => {
    const pending = appointments.filter(a => a.status === 'pending').length;
    const scheduled = appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled' || a.status === 'declined').length;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative z-10">
        {[
          { label: 'Pending', value: pending, color: 'amber', icon: AlertCircle },
          { label: 'Scheduled', value: scheduled, color: 'blue', icon: Calendar },
          { label: 'Completed', value: completed, color: 'emerald', icon: CheckCircle2 },
          { label: 'Cancelled', value: cancelled, color: 'red', icon: XCircle },
        ].map(stat => (
          <div key={stat.label} className={`bg-white/70 backdrop-blur-sm border border-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-${stat.color}-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <div>
                <p className={`text-2xl font-bold text-slate-900`}>{stat.value}</p>
                <p className={`text-xs font-bold uppercase tracking-wider text-${stat.color}-600/80`}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const dayAppointments = selectedDate ? (appointmentsByDate[format(selectedDate, 'yyyy-MM-dd')] || []) : [];

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 min-h-screen p-4 md:p-6 lg:p-8 relative overflow-x-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 -z-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {renderHeader()}
      {renderLegend()}
      {renderStats()}
      
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 relative z-10">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-medium animate-pulse">Loading calendar...</p>
        </div>
      ) : (
        <>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white p-6 shadow-xl shadow-slate-200/50 relative z-10">
            {renderDays()}
            {renderCells()}
          </div>
        </>
      )}

      {/* Day Details Modal */}
      <Modal
        isOpen={showDayModal}
        onClose={() => setShowDayModal(false)}
        title={selectedDate ? `Appointments - ${format(selectedDate, 'EEEE, MMMM d')}` : 'Appointments'}
        size="lg"
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto p-1">
          {dayAppointments.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/50 rounded-xl dashed border-2 border-slate-200 flex flex-col items-center">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                   <Calendar className="w-8 h-8 text-slate-300" />
               </div>
               <p className="text-slate-500 font-bold">No appointments scheduled</p>
               <p className="text-xs text-slate-400 mt-1">Check back later or schedule a new one</p>
            </div>
          ) : (
            dayAppointments.map(apt => {
              const config = statusConfig[apt.status] || statusConfig.pending;
              return (
                <div
                  key={apt._id}
                  className="p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${config.bg} ${config.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
                          {config.label}
                        </span>
                        <span className="text-sm font-bold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {format(new Date(apt.scheduledDate), 'h:mm a')}
                        </span>
                      </div>
                      <h4 className="font-bold text-lg text-slate-900 group-hover:text-indigo-700 transition-colors">
                        {apt.customer?.profile?.firstName} {apt.customer?.profile?.lastName}
                      </h4>
                      <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        {apt.appointmentType === 'ocular_visit' ? 'Ocular Visit' : 'Office Consultation'}
                        {apt.interestedCategory && ` • ${apt.interestedCategory}`}
                      </p>
                    </div>
                    <div className="flex gap-2 self-center">
                      <button
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setShowDayModal(false);
                          setShowDetailModal(true);
                        }}
                        className="p-2.5 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Quick View"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/agent/appointments?id=${apt._id}`)}
                        className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 hover:-translate-y-0.5"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Modal>

      {/* Appointment Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Appointment Details"
        size="md"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center border border-white shadow-sm">
                <User className="w-8 h-8 text-slate-500" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-900">
                  {selectedAppointment.customer?.profile?.firstName} {selectedAppointment.customer?.profile?.lastName}
                </h3>
                <p className="text-slate-500 flex items-center gap-2 text-sm mt-1">
                   <Mail className="w-3.5 h-3.5" />
                   {selectedAppointment.customer?.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date & Time</p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {format(new Date(selectedAppointment.scheduledDate), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {format(new Date(selectedAppointment.scheduledDate), 'h:mm a')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Type</p>
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 w-fit">
                     <Briefcase className="w-4 h-4 text-slate-500" />
                     <p className="text-sm font-bold text-slate-900">
                        {selectedAppointment.appointmentType === 'ocular_visit' ? 'Ocular Visit' : 'Office Consultation'}
                     </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status</p>
                  <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${statusConfig[selectedAppointment.status]?.bg} ${statusConfig[selectedAppointment.status]?.text}`}>
                    {statusConfig[selectedAppointment.status]?.label}
                  </span>
                </div>
                {selectedAppointment.interestedCategory && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Interest</p>
                    <p className="text-sm font-bold text-slate-900">{selectedAppointment.interestedCategory}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedAppointment.assignedSalesStaff && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Assigned Sales Agent</p>
                <div className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                   <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
                       {selectedAppointment.assignedSalesStaff.profile?.firstName?.[0]}
                   </div>
                   <div>
                       <p className="text-sm font-bold text-indigo-900">
                         {selectedAppointment.assignedSalesStaff.profile?.firstName} {selectedAppointment.assignedSalesStaff.profile?.lastName}
                       </p>
                       <p className="text-xs text-indigo-600/80">Sales Representative</p>
                   </div>
                </div>
              </div>
            )}

            {selectedAppointment.siteAddress && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Site Address</p>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2 font-medium">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  {[selectedAppointment.siteAddress.street, selectedAppointment.siteAddress.city, selectedAppointment.siteAddress.province].filter(Boolean).join(', ')}
                </p>
              </div>
            )}

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  navigate(`/dashboard/agent/appointments?id=${selectedAppointment._id}`);
                }}
                className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5"
              >
                Manage Appointment
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CalendarView;
