import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Video, MapPin, User, ChevronLeft, ChevronRight, 
  CheckCircle2, XCircle, Search, Globe, AlertCircle, Info, ChevronDown, Trash2, Star
} from 'lucide-react';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { Appointment, Doctor, DoctorReview } from '../types';
import { useTranslations } from '../i18n/I18nContext';
import VideoSessionButton from '../components/appointments/VideoSessionButton';

const Appointments: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState<'online' | 'offline' | 'my'>('online');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingData, setBookingData] = useState({ time: '', notes: '' });
  const [userReviews, setUserReviews] = useState<DoctorReview[]>([]);
  const [reviewingAppointment, setReviewingAppointment] = useState<Appointment | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  
  // Calendar States
  const [selectedFilterDate, setSelectedFilterDate] = useState<Date>(new Date());
  const [currentViewMonth, setCurrentViewMonth] = useState<Date>(new Date());

  // Cancel States
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [cancellingStatus, setCancellingStatus] = useState(false);
  
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  const refreshAppointments = async () => {
    if (!user) return;
    const data = await db.getAppointments(user.id);
    setAppointments(data || []);
  };

  const refreshReviews = async () => {
    if (!user) return;
    const data = await db.getDoctorReviews(user.id);
    setUserReviews(data || []);
  };

  const refreshDoctors = async () => {
    const data = await db.getDoctors();
    setDoctors(data || []);
  };

  useEffect(() => {
    refreshAppointments();
    refreshReviews();
    const handleUpdate = () => {
      refreshAppointments();
      refreshReviews();
    };
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, [user]);

  useEffect(() => {
    refreshDoctors();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredDoctors = doctors.filter(doc => {
    if (activeTab === 'online') return doc.type === 'Online' || doc.type === 'Both';
    if (activeTab === 'offline') return doc.type === 'Offline' || doc.type === 'Both';
    return true;
  });

  const reviewByAppointmentId = useMemo(() => {
    const map = new Map<string, DoctorReview>();
    userReviews.forEach((review) => {
      if (review.appointmentId) {
        map.set(review.appointmentId, review);
      }
    });
    return map;
  }, [userReviews]);


  const normalizeAppointmentStatus = (status: Appointment['status'] | string) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized.includes('cancel')) return 'Cancelled';
    if (normalized.includes('complete')) return 'Completed';
    if (normalized.includes('pending') || normalized.includes('request')) return 'Pending';
    if (normalized.includes('scheduled') || normalized.includes('upcoming') || normalized.includes('in-progress') || normalized.includes('in progress')) {
      return 'Upcoming';
    }
    return 'Upcoming';
  };
  const isReviewEligible = (app: Appointment) => {
    const status = normalizeAppointmentStatus(app.status);
    if (status === 'Cancelled' || status === 'Pending') return false;
    if (status === 'Completed') return true;
    const dateValue = app.date && app.time ? `${app.date}T${app.time}` : app.date;
    if (!dateValue) return false;
    const date = new Date(dateValue);
    if (!Number.isFinite(date.getTime())) return false;
    return date.getTime() < Date.now();
  };

  const openReviewModal = (app: Appointment) => {
    setReviewingAppointment(app);
    setReviewRating(0);
    setReviewText('');
  };

  const submitReview = async () => {
    if (!user || !reviewingAppointment) return;
    if (reviewRating < 1) {
      showToast('Please select a rating.', 'error');
      return;
    }
    setReviewSubmitting(true);
    try {
      await db.addDoctorReview(user.id, {
        doctorId: reviewingAppointment.doctorId,
        doctorName: reviewingAppointment.doctorName,
        appointmentId: reviewingAppointment.id,
        rating: reviewRating,
        reviewText: reviewText || undefined
      });
      showToast('Thanks for sharing your feedback!');
      setReviewingAppointment(null);
      setReviewRating(0);
      setReviewText('');
      await refreshReviews();
      await refreshDoctors();
    } catch (e: any) {
      showToast(e?.message || "Couldn't submit review. Try again.", 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const formatRating = (value?: number) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric.toFixed(1) : null;
  };

  const parseSlotToMinutes = (slot: string) => {
    const raw = String(slot || '').trim();
    if (!raw) return null;
    const match12 = raw.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
    if (match12) {
      let hours = Number(match12[1]);
      const minutes = Number(match12[2]);
      const meridiem = match12[3].toLowerCase();
      if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;
      if (meridiem === 'pm' && hours !== 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }
    const match24 = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
      const hours = Number(match24[1]);
      const minutes = Number(match24[2]);
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
      return hours * 60 + minutes;
    }
    return null;
  };

  const handleBook = async () => {
    if (!user || !selectedDoctor) return;
    
    // Normalize dates to ignore time for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDateStart = new Date(selectedFilterDate);
    selectedDateStart.setHours(0, 0, 0, 0);

    // Hard validation check
    if (selectedDateStart < today) {
      showToast("You can't book appointments for past dates.", "error");
      return;
    }

    const slotMinutes = parseSlotToMinutes(bookingData.time);
    if (slotMinutes === null) {
      showToast("Please select a valid time slot.", "error");
      return;
    }

    const scheduledAt = new Date(selectedDateStart);
    scheduledAt.setHours(Math.floor(slotMinutes / 60), slotMinutes % 60, 0, 0);
    if (scheduledAt.getTime() <= Date.now()) {
      showToast("Please choose a future time for today.", "error");
      return;
    }

    const isOnline = activeTab === 'online';
    const appointmentStatus: Appointment['status'] = isOnline ? 'Pending' : 'Upcoming';
    
    const newAppointmentData: Omit<Appointment, 'id' | 'userId'> = {
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      date: selectedFilterDate.toISOString().split('T')[0],
      time: bookingData.time,
      status: appointmentStatus,
      type: isOnline ? 'Online' : 'Offline',
      notes: bookingData.notes
    };

    try {
      await db.addAppointment(user.id, newAppointmentData);
      setIsModalOpen(false);
      setSelectedDoctor(null);
      setBookingData({ time: '', notes: '' });
      showToast(isOnline ? "Appointment request sent. Awaiting approval." : "Appointment scheduled successfully.");
      refreshAppointments();
    } catch (e: any) {
      showToast(e?.message || "Couldn't book appointment. Try again.", "error");
    }
  };

  const confirmCancel = async () => {
    if (!user || !cancelConfirmId) return;
    setCancellingStatus(true);
    try {
      await db.updateAppointmentStatus(user.id, cancelConfirmId, 'Cancelled');
      showToast("Appointment cancelled", "success");
      setCancelConfirmId(null);
      refreshAppointments();
    } catch (e) {
      showToast("Couldn't cancel appointment. Try again.", "error");
    } finally {
      setCancellingStatus(false);
    }
  };

  // Calendar Helper Logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Padding for previous month
    for (let i = 0; i < firstDay; i++) days.push(null);
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    
    return days;
  };

  const calendarDays = useMemo(() => getDaysInMonth(currentViewMonth), [currentViewMonth]);

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const dateStr = selectedFilterDate.toISOString().split('T')[0];
  const minDateStr = new Date().toISOString().split('T')[0];
  const dailyAppointments = appointments.filter(
    (a) => a.date === dateStr && normalizeAppointmentStatus(a.status) !== 'Cancelled'
  );
  const bookedAppointments = dailyAppointments.filter(
    (a) => normalizeAppointmentStatus(a.status) === 'Upcoming'
  );
  const pendingAppointments = dailyAppointments.filter(
    (a) => normalizeAppointmentStatus(a.status) === 'Pending'
  );

  const handleModalDateChange = (value: string) => {
    if (!value) return;
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return;
    const nextDate = new Date(year, month - 1, day);
    setSelectedFilterDate(nextDate);
    setCurrentViewMonth(new Date(year, month - 1, 1));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20 relative">
      {toast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success' ? 'bg-teal-600 text-white' : 
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18}/> : toast.type === 'error' ? <AlertCircle size={18}/> : <Info size={18}/>}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelConfirmId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
               <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">Cancel appointment?</h3>
              <p className="text-sm text-gray-500">This will remove your booked slot. Are you sure you want to proceed?</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setCancelConfirmId(null)}
                className="flex-1 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all cursor-pointer"
              >
                No, keep
              </button>
              <button 
                onClick={confirmCancel}
                disabled={cancellingStatus}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200 cursor-pointer disabled:opacity-50"
              >
                {cancellingStatus ? "Cancelling..." : "Yes, cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Appointments</h1>
          <p className="text-gray-500">Connect with expert healthcare professionals.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {(['online', 'offline', 'my'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all cursor-pointer ${activeTab === tab ? 'bg-[#E6C77A] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {tab === 'my' ? 'My Appointments' : `${tab} Consult`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar: Calendar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <CalendarIcon size={18} className="text-[#E6C77A]" /> Select Date
              </h3>
              <div className="flex gap-1">
                <button 
                  onClick={() => setCurrentViewMonth(new Date(currentViewMonth.getFullYear(), currentViewMonth.getMonth() - 1))}
                  className="p-1 hover:bg-gray-50 rounded-lg text-gray-400"
                >
                  <ChevronLeft size={20}/>
                </button>
                <button 
                  onClick={() => setCurrentViewMonth(new Date(currentViewMonth.getFullYear(), currentViewMonth.getMonth() + 1))}
                  className="p-1 hover:bg-gray-50 rounded-lg text-gray-400"
                >
                  <ChevronRight size={20}/>
                </button>
              </div>
            </div>
            
            <div className="text-center mb-4">
              <p className="text-sm font-bold text-teal-800 uppercase tracking-widest">
                {currentViewMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <div key={d} className="text-[10px] font-bold text-gray-300 py-2">{d}</div>
              ))}
              {calendarDays.map((date, i) => {
                const isPast = date ? isPastDate(date) : false;
                return (
                  <div key={i} className="aspect-square flex items-center justify-center">
                    {date ? (
                      <button
                        onClick={() => setSelectedFilterDate(date)}
                        disabled={isPast}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSameDay(date, selectedFilterDate)
                            ? 'bg-teal-600 text-white shadow-lg shadow-teal-100 scale-110'
                            : isSameDay(date, new Date())
                              ? 'bg-teal-50 text-teal-600'
                              : isPast 
                                ? 'text-gray-200 cursor-not-allowed' 
                                : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    ) : <div className="w-9 h-9" />}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-gray-50">
              <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                <div className="w-2 h-2 rounded-full bg-teal-600"></div>
                Selected Date
                <div className="w-2 h-2 rounded-full bg-teal-50 ml-2"></div>
                Today
              </div>
            </div>
          </div>
        </div>

        {/* Main: Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab !== 'my' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDoctors.map(doc => (
                <div key={doc.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:border-[#BFE6DA] transition-all group">
                  <div className="flex gap-4 mb-6">
                  {doc.image ? (
                    <img src={doc.image} loading="lazy" className="w-20 h-20 rounded-2xl object-cover ring-4 ring-gray-50" alt={doc.name} />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-[#F7F5EF] ring-4 ring-gray-50 flex items-center justify-center text-xl font-bold text-gray-500">
                      {(doc.name || '?').toString().trim().charAt(0).toUpperCase()}
                    </div>
                  )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">{doc.name}</h3>
                      <p className="text-sm text-teal-600 font-medium">{doc.specialty}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><MapPin size={10}/> {doc.hospital || 'Independent practice'}</p>
                         <span className="text-gray-200 mx-1">-</span>
                         <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest flex items-center gap-1">
                           {doc.type === 'Online' ? <Video size={10}/> : <Globe size={10}/>} {doc.type}
                         </p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-gray-700">
                          {formatRating(doc.rating) || 'New'}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {doc.reviewCount ? `${doc.reviewCount} reviews` : 'No reviews yet'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Consult Fee</p>
                      <p className="text-lg font-bold text-gray-800">BDT {doc.fee}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Slots</p>
                      <p className="text-sm font-bold text-teal-600">{doc.availableSlots.length} Available</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => { 
                      setSelectedDoctor(doc); 
                      setIsModalOpen(true); 
                    }}
                    className="w-full py-4 bg-[#BFE6DA] text-teal-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#A8D8C9] transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                  >
                    {activeTab === 'online' ? 'Request Appointment' : 'Book Appointment'} <ChevronRight size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                 <h3 className="text-xl font-bold text-gray-800">
                    Schedule for {selectedFilterDate.toLocaleDateString('default', { day: 'numeric', month: 'long' })}
                 </h3>
                 <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
                      {bookedAppointments.length} Booked
                    </span>
                    {pendingAppointments.length > 0 && (
                      <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                        {pendingAppointments.length} Pending
                      </span>
                    )}
                 </div>
              </div>
              
              {dailyAppointments.length === 0 ? (
                <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-gray-100 space-y-4 animate-in fade-in">
                   <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                      <CalendarIcon size={32} />
                   </div>
                   <p className="text-gray-400 font-medium text-lg italic">No appointments for this date.</p>
                </div>
              ) : (
                dailyAppointments.map((app) => {
                  const statusLabel = normalizeAppointmentStatus(app.status);
                  const isPending = statusLabel === 'Pending';
                  const isUpcoming = statusLabel === 'Upcoming';
                  const statusBadge = isPending ? 'Pending approval' : statusLabel;
                  const iconClass = isPending
                    ? 'bg-amber-50 text-amber-600'
                    : isUpcoming
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-green-50 text-green-600';
                  const statusClass = isPending
                    ? 'bg-amber-50 text-amber-700'
                    : isUpcoming
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-green-50 text-green-600';

                  return (
                    <div key={app.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-[#BFE6DA] transition-all relative overflow-hidden animate-in slide-in-from-bottom-2">
                      <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className={`p-4 rounded-2xl ${iconClass}`}>
                          {app.type === 'Online' ? <Video size={24} /> : <CalendarIcon size={24} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">{app.doctorName}</h4>
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">{app.specialty} - {app.type} Consult</p>
                          <span className={`mt-2 inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusClass}`}>
                            {statusBadge}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 md:gap-8 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                          <Clock className="text-teal-500" size={18} />
                          <span className="text-sm font-bold text-gray-700">{app.time}</span>
                        </div>
                        <div className="flex gap-2">
                          {(isUpcoming || isPending) && app.type === 'Online' && (
                            <VideoSessionButton
                              appointmentId={app.id}
                              userRole={user?.role || null}
                              isOnlineAppointment={true}
                              meetingExists={Boolean(app.meetingData)}
                            />
                          )}
                          {(isUpcoming || isPending) && (
                            <button 
                              type="button"
                              onClick={() => setCancelConfirmId(app.id)} 
                              className="px-6 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                          {isReviewEligible(app) && !reviewByAppointmentId.get(app.id) && (
                            <button
                              type="button"
                              onClick={() => openReviewModal(app)}
                              className="px-6 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-100 transition-all cursor-pointer"
                            >
                              Rate Doctor
                            </button>
                          )}
                          {reviewByAppointmentId.get(app.id) && (
                            <div className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold flex items-center gap-2">
                              <Star size={14} className="text-amber-400 fill-amber-400" />
                              {reviewByAppointmentId.get(app.id)?.rating.toFixed(1)} Rated
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {reviewingAppointment && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Rate Doctor</h2>
              <button onClick={() => setReviewingAppointment(null)} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"><XCircle size={24} /></button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-amber-50/60 border border-amber-100 rounded-3xl mb-8">
              <Star size={20} className="text-amber-500" />
              <div>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Appointment</p>
                <p className="text-sm font-bold text-gray-800">{reviewingAppointment.doctorName}</p>
                <p className="text-xs text-gray-500">{reviewingAppointment.date} • {reviewingAppointment.time}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setReviewRating(value)}
                      className={`p-3 rounded-xl border-2 transition-all ${reviewRating >= value ? 'border-amber-200 bg-amber-50 text-amber-600' : 'border-gray-100 bg-gray-50 text-gray-300'} cursor-pointer`}
                    >
                      <Star size={18} className={reviewRating >= value ? 'text-amber-500 fill-amber-400' : 'text-gray-300'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Feedback (optional)</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none focus:ring-2 focus:ring-amber-200 h-24 resize-none text-sm font-medium"
                  placeholder="Share a quick note about the service"
                />
              </div>

              <button
                type="button"
                onClick={submitReview}
                disabled={reviewSubmitting}
                className="w-full py-5 bg-amber-500 text-white rounded-3xl font-bold shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-amber-200"
              >
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Booking Modal */}
      {isModalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Book Visit</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"><XCircle size={24}/></button>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-teal-50/50 border border-teal-100 rounded-3xl mb-8">
               <CalendarIcon size={20} className="text-teal-600" />
               <div>
                  <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Booking for</p>
                  <p className="text-sm font-bold text-gray-800">{selectedFilterDate.toDateString()}</p>
               </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl mb-8">
              {selectedDoctor.image ? (
                <img src={selectedDoctor.image} loading="lazy" className="w-16 h-16 rounded-2xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#F7F5EF] flex items-center justify-center text-lg font-bold text-gray-500">
                  {(selectedDoctor.name || '?').toString().trim().charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-bold text-gray-800">{selectedDoctor.name}</p>
                <p className="text-xs text-teal-600 font-bold uppercase tracking-widest">{selectedDoctor.specialty}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Appointment Date</label>
                <input
                  type="date"
                  value={dateStr}
                  min={minDateStr}
                  onChange={(e) => handleModalDateChange(e.target.value)}
                  className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none focus:ring-2 focus:ring-[#E6C77A] text-sm font-medium text-gray-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Select Slot</label>
                <div className="grid grid-cols-3 gap-2">
                  {selectedDoctor.availableSlots.map(slot => (
                    <button 
                      key={slot}
                      type="button"
                      onClick={() => setBookingData({...bookingData, time: slot})}
                      className={`py-3 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${bookingData.time === slot ? 'bg-[#E6C77A] border-[#E6C77A] text-white shadow-lg' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Notes for Doctor</label>
                <textarea className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none focus:ring-2 focus:ring-[#E6C77A] h-24 resize-none text-sm font-medium" placeholder="Any specific symptoms or concerns?" onChange={e => setBookingData({...bookingData, notes: e.target.value})} />
              </div>
              <button 
                type="button"
                onClick={handleBook}
                disabled={!bookingData.time}
                className="w-full py-5 bg-[#E6C77A] text-white rounded-3xl font-bold shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-[#E6C77A]/20"
              >
                {activeTab === 'online' ? 'Request Appointment' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;

