
import React, { useState, useEffect, useRef } from 'react';
import { Droplet, Search, Phone, MapPin, Filter, Plus, ShieldCheck, X, Send, CheckCircle2, Copy, Trash2, Clock, ChevronDown, Navigation, Globe2, LocateFixed, Loader2 } from 'lucide-react';
import { db } from '../services/db';
import { Donor, BloodRequest } from '../types';
import { ALL_DISTRICTS, DISTRICT_DONORS, BANGLADESH_DIVISIONS, getDivisionForDistrict, DemoDonor, findNearestDistrict } from '../data/bangladeshDonors';

const BloodDonors: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [showBecomeModal, setShowBecomeModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState<Donor | null>(null);
  const [showUrgentModal, setShowUrgentModal] = useState<Donor | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'detected' | 'error'>('idle');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form states
  const [newDonor, setNewDonor] = useState({ name: '', bloodGroup: 'O+', location: '', phone: '' });
  const [urgentRequest, setUrgentRequest] = useState({ requesterPhone: '', message: '' });

  const groups = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Auto-detect user location on mount
  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setIsDetectingLocation(true);
    setLocationStatus('detecting');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nearest = findNearestDistrict(latitude, longitude);
        setSelectedDistrict(nearest);
        setIsDetectingLocation(false);
        setLocationStatus('detected');
        showToast(`📍 Location detected: ${nearest}. Showing nearby donors!`, 'success');
      },
      (error) => {
        setIsDetectingLocation(false);
        setLocationStatus('error');
        // Don't show error toast on auto-detect, only on manual click
        console.log('Geolocation error:', error.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDistrictDropdown(false);
        setDistrictSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-detect location on page load
  useEffect(() => {
    // Check if location was previously saved in sessionStorage
    const savedDistrict = sessionStorage.getItem('nurture-glow-detected-district');
    if (savedDistrict && ALL_DISTRICTS.includes(savedDistrict)) {
      setSelectedDistrict(savedDistrict);
      setLocationStatus('detected');
    } else {
      detectUserLocation();
    }
  }, []);

  // Save detected district to session
  useEffect(() => {
    if (locationStatus === 'detected' && selectedDistrict !== 'All Districts') {
      sessionStorage.setItem('nurture-glow-detected-district', selectedDistrict);
    }
  }, [selectedDistrict, locationStatus]);

  // Filter districts based on search
  const filteredDistricts = districtSearch
    ? ALL_DISTRICTS.filter(d => d.toLowerCase().includes(districtSearch.toLowerCase()))
    : ALL_DISTRICTS;

  const refreshData = async () => {
    const [donorsData, requestsData] = await Promise.all([
      db.getDonors(),
      db.getBloodRequests()
    ]);
    setDonors(donorsData);
    setRequests(requestsData);
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => {
      refreshData();
    };
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), type === 'error' ? 5000 : 3000);
  };

  const handleBecomeDonor = async () => {
    // Validate form
    if (!newDonor.name.trim()) {
      setRegistrationError('Please enter your full name');
      return;
    }
    if (!newDonor.phone.trim()) {
      setRegistrationError('Please enter your phone number');
      return;
    }
    if (!newDonor.location.trim()) {
      setRegistrationError('Please enter your location');
      return;
    }

    // Validate phone format
    const phoneRegex = /^[\d\s+()-]+$/;
    if (!phoneRegex.test(newDonor.phone)) {
      setRegistrationError('Please enter a valid phone number');
      return;
    }

    setIsRegistering(true);
    setRegistrationError('');

    try {
      await db.addDonor({ 
        name: newDonor.name,
        bloodGroup: newDonor.bloodGroup,
        location: newDonor.location,
        phone: newDonor.phone,
        verified: false 
      });
      setShowBecomeModal(false);
      setNewDonor({ name: '', bloodGroup: 'O+', location: '', phone: '' });
      showToast("✅ You are now registered as a blood donor! Thank you for saving lives.", 'success');
      refreshData();
    } catch (err: any) {
      // Check if error is duplicate registration
      if (err?.message?.includes('already registered') || err?.status === 409) {
        setAlreadyRegistered(true);
        
        // Check if duplicate is by phone number
        if (err?.message?.includes('phone number') || err?.data?.reason === 'duplicate_phone') {
          setRegistrationError('This phone number is already registered as a blood donor. Each phone number can only be registered once.');
          showToast('Phone number already registered', 'error');
        } else {
          setRegistrationError('You are already registered as a blood donor!');
          showToast('You are already registered as a donor', 'error');
        }
      } else {
        setRegistrationError('Failed to register. Please try again.');
        showToast('Registration failed. Please try again.', 'error');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCallClick = (donor: Donor) => {
    if (!donor.phone) {
      showToast("Phone number not available", "info");
      return;
    }
    // Check if mobile
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      window.location.href = `tel:${donor.phone}`;
    } else {
      setShowCallModal(donor);
    }
  };

  const handleUrgentRequest = async () => {
    if (!showUrgentModal || !urgentRequest.requesterPhone) return;
    const req: BloodRequest = {
      id: Math.random().toString(36).substr(2, 9),
      donorId: showUrgentModal.id,
      donorName: showUrgentModal.name,
      bloodGroup: showUrgentModal.bloodGroup,
      area: showUrgentModal.location,
      requesterPhone: urgentRequest.requesterPhone,
      message: urgentRequest.message,
      createdAt: new Date().toISOString(),
      status: 'sent'
    };
    await db.addBloodRequest(req);
    setShowUrgentModal(null);
    setUrgentRequest({ requesterPhone: '', message: '' });
    showToast(`Urgent request sent to ${showUrgentModal.name}`);
    refreshData();
  };

  const handleDeleteRequest = async (id: string) => {
    await db.deleteBloodRequest(id);
    showToast("Request record removed", "info");
    refreshData();
  };

  // Merge API donors with demo district donors
  const allDonors: Donor[] = [
    ...donors,
    ...DISTRICT_DONORS
      .filter(dd => !donors.some(d => d.id === dd.id))
      .map(dd => ({
        id: dd.id,
        name: dd.name,
        bloodGroup: dd.bloodGroup,
        location: dd.location,
        phone: dd.phone,
        verified: dd.verified,
        lastDonation: dd.lastDonation,
      }))
  ];

  const queryLower = query.toLowerCase();
  const filtered = allDonors.filter(d => {
    const name = (d.name || '').toLowerCase();
    const location = (d.location || '').toLowerCase();
    const group = d.bloodGroup || '';

    // District filter
    const matchesDistrict = selectedDistrict === 'All Districts' || location.toLowerCase().includes(selectedDistrict.toLowerCase());

    return matchesDistrict &&
      (activeGroup === 'All' || group === activeGroup) &&
      (name.includes(queryLower) || location.includes(queryLower));
  });

  // Count donors per district for display
  const districtDonorCount = (district: string) => {
    return allDonors.filter(d => (d.location || '').toLowerCase().includes(district.toLowerCase())).length;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-500 pb-20 relative">
      {/* Toast Feedback */}
      {toast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 ${
          toast.type === 'success' ? 'bg-teal-600 text-white' : 
          toast.type === 'error' ? 'bg-red-600 text-white' : 
          'bg-[#E6C77A] text-teal-900'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18}/> : 
           toast.type === 'error' ? <X size={18}/> : 
           <Clock size={18}/>}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blood Donor Network</h1>
          <p className="text-gray-500">Connecting mothers with life-saving donors during emergencies.</p>
        </div>
        <button 
          onClick={() => setShowBecomeModal(true)}
          className="flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-2xl font-bold shadow-xl shadow-red-600/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20}/> Become a Donor
        </button>
      </div>

      {/* District Selector */}
      <div className="bg-white rounded-[40px] p-6 shadow-sm border border-gray-100 space-y-4">
        {/* Location detecting banner */}
        {isDetectingLocation && (
          <div className="flex items-center gap-3 px-5 py-3 bg-blue-50 rounded-2xl animate-pulse">
            <Loader2 size={16} className="text-blue-500 animate-spin"/>
            <span className="text-sm font-medium text-blue-600">Detecting your location to find nearby donors...</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              locationStatus === 'detected' ? 'bg-green-50 text-green-500' : 
              isDetectingLocation ? 'bg-blue-50 text-blue-500' : 
              'bg-red-50 text-red-500'
            }`}>
              {isDetectingLocation ? <Loader2 size={18} className="animate-spin"/> : <Navigation size={18}/>}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                Find Donors In
                {locationStatus === 'detected' && selectedDistrict !== 'All Districts' && (
                  <span className="text-[9px] text-green-500 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <LocateFixed size={8}/> Auto-detected
                  </span>
                )}
              </p>
              <p className="text-lg font-bold text-gray-800">
                {isDetectingLocation ? (
                  <span className="text-blue-500">Detecting...</span>
                ) : selectedDistrict === 'All Districts' ? 'All Districts' : selectedDistrict}
                {!isDetectingLocation && selectedDistrict !== 'All Districts' && (
                  <span className="text-sm font-normal text-gray-400 ml-2">
                    ({getDivisionForDistrict(selectedDistrict)} Division)
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Detect My Location button */}
            <button
              onClick={() => {
                detectUserLocation();
                if (locationStatus === 'error') {
                  showToast('Please allow location access in your browser settings', 'info');
                }
              }}
              disabled={isDetectingLocation}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isDetectingLocation
                  ? 'bg-blue-50 text-blue-400 cursor-wait'
                  : locationStatus === 'detected'
                    ? 'bg-green-50 text-green-600 hover:bg-green-100'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105 active:scale-95'
              }`}
            >
              {isDetectingLocation ? (
                <><Loader2 size={12} className="animate-spin"/> Detecting...</>
              ) : (
                <><LocateFixed size={12}/> {locationStatus === 'detected' ? 'Re-detect' : 'Detect My Location'}</>
              )}
            </button>
            {selectedDistrict !== 'All Districts' && (
              <span className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-xs font-bold">
                {districtDonorCount(selectedDistrict)} donors
              </span>
            )}
            {selectedDistrict !== 'All Districts' && (
              <button
                onClick={() => {
                  setSelectedDistrict('All Districts');
                  setLocationStatus('idle');
                  sessionStorage.removeItem('nurture-glow-detected-district');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-500 rounded-full text-xs font-bold hover:bg-gray-200 transition-all flex items-center gap-1"
              >
                <Globe2 size={12}/> Show All
              </button>
            )}
          </div>
        </div>

        {/* District Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDistrictDropdown(!showDistrictDropdown)}
            className="w-full flex items-center justify-between px-6 py-4 bg-[#F7F5EF] rounded-2xl hover:bg-gray-100 transition-all group"
          >
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-red-400"/>
              <span className="font-medium text-gray-700">
                {selectedDistrict === 'All Districts' ? 'Select your district...' : selectedDistrict}
              </span>
            </div>
            <ChevronDown size={18} className={`text-gray-400 transition-transform ${showDistrictDropdown ? 'rotate-180' : ''}`}/>
          </button>

          {showDistrictDropdown && (
            <div className="absolute z-50 w-full mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-200">
              {/* Search within districts */}
              <div className="p-4 border-b border-gray-50">
                <div className="flex items-center gap-3 px-4 py-3 bg-[#F7F5EF] rounded-2xl">
                  <Search size={16} className="text-gray-400"/>
                  <input
                    type="text"
                    placeholder="Search districts..."
                    className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-700"
                    value={districtSearch}
                    onChange={e => setDistrictSearch(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {/* All Districts option */}
                <button
                  onClick={() => {
                    setSelectedDistrict('All Districts');
                    setShowDistrictDropdown(false);
                    setDistrictSearch('');
                  }}
                  className={`w-full px-6 py-3 text-left hover:bg-red-50 transition-all flex items-center justify-between ${
                    selectedDistrict === 'All Districts' ? 'bg-red-50 text-red-600' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Globe2 size={16}/>
                    <span className="font-medium">All Districts</span>
                  </div>
                  <span className="text-xs text-gray-400">{allDonors.length} donors</span>
                </button>

                {/* Grouped by Division */}
                {Object.entries(BANGLADESH_DIVISIONS).map(([division, districts]) => {
                  const matchingDistricts = districts.filter(d =>
                    !districtSearch || d.toLowerCase().includes(districtSearch.toLowerCase())
                  );
                  if (matchingDistricts.length === 0) return null;
                  return (
                    <div key={division}>
                      <div className="px-6 py-2 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest sticky top-0">
                        {division} Division
                      </div>
                      {matchingDistricts.map(district => (
                        <button
                          key={district}
                          onClick={() => {
                            setSelectedDistrict(district);
                            setShowDistrictDropdown(false);
                            setDistrictSearch('');
                          }}
                          className={`w-full px-6 py-3 text-left hover:bg-red-50 transition-all flex items-center justify-between ${
                            selectedDistrict === district ? 'bg-red-50 text-red-600' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <MapPin size={14} className={selectedDistrict === district ? 'text-red-500' : 'text-gray-300'}/>
                            <span className="font-medium text-sm">{district}</span>
                          </div>
                          <span className="text-xs text-gray-400">{districtDonorCount(district)}</span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="pl-4 text-gray-400"><Search size={20}/></div>
          <input 
            type="text" 
            placeholder="Search by location or name..." 
            className="flex-1 py-3 bg-transparent outline-none font-medium text-gray-700"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          {groups.map(g => (
            <button 
              key={g} 
              onClick={() => setActiveGroup(g)}
              className={`px-5 py-4 rounded-2xl text-xs font-bold transition-all border shrink-0 ${activeGroup === g ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Results count and selected filters */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing <span className="font-bold text-gray-800">{filtered.length}</span> donor{filtered.length !== 1 ? 's' : ''}
          {selectedDistrict !== 'All Districts' && (
            <span> in <span className="font-bold text-red-600">{selectedDistrict}</span></span>
          )}
          {activeGroup !== 'All' && (
            <span> with blood group <span className="font-bold text-red-600">{activeGroup}</span></span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 space-y-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <MapPin size={32} className="text-gray-300"/>
            </div>
            <h3 className="text-xl font-bold text-gray-400">No donors found</h3>
            <p className="text-gray-400 text-sm">Try selecting a different district or blood group</p>
          </div>
        ) : filtered.map(d => (
          <div key={d.id} className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 flex flex-col gap-6 group hover:border-red-500 transition-all relative">
            <div className="flex justify-between items-start">
               <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center font-bold text-xl shadow-inner group-hover:bg-red-500 group-hover:text-white transition-all">
                  {d.bloodGroup || 'N/A'}
               </div>
               {d.verified && (
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    <ShieldCheck size={12}/> Verified
                 </div>
               )}
            </div>
            <div>
               <h3 className="text-xl font-bold text-gray-800">{d.name || 'Unknown Donor'}</h3>
               <p className="text-gray-400 flex items-center gap-2 mt-2 text-sm">
                  <MapPin size={14} className="text-red-400"/> {d.location || 'Unknown location'}
               </p>
            </div>
            <div className="pt-4 border-t border-gray-50 flex gap-3">
               <button 
                onClick={() => handleCallClick(d)}
                className="flex-1 py-4 bg-[#F7F5EF] text-gray-700 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2 active:scale-95"
               >
                  <Phone size={14}/> Call
               </button>
               <button 
                onClick={() => setShowUrgentModal(d)}
                className="px-6 py-4 bg-red-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all active:scale-95"
               >
                 Urgent Request
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Requests Section */}
      {requests.length > 0 && (
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
             <Clock className="text-orange-500" /> Recent Urgent Requests
          </h2>
          <div className="divide-y divide-gray-50">
             {requests.map(r => (
               <div key={r.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold text-xs">
                        {r.bloodGroup || 'N/A'}
                     </div>
                     <div>
                        <p className="font-bold text-gray-800">To: {r.donorName || 'Unknown Donor'}</p>
                        <p className="text-xs text-gray-400">Area: {r.area || 'Unknown'} • {new Date(r.createdAt).toLocaleString()}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                     <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Status: Sent</span>
                     <button onClick={() => handleDeleteRequest(r.id)} className="p-2 text-gray-300 hover:text-red-500 transition-all ml-auto md:ml-0"><Trash2 size={16}/></button>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* Become Donor Modal */}
      {showBecomeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Become a Donor</h2>
              <button onClick={() => { setShowBecomeModal(false); setRegistrationError(''); setAlreadyRegistered(false); }} className="p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button>
            </div>

            {/* Error/Warning Messages */}
            {alreadyRegistered && (
              <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
                <div className="flex gap-3">
                  <CheckCircle2 size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-800">Already Registered</p>
                    <p className="text-sm text-amber-700 mt-1">You're already registered as a blood donor. You can only register once per account.</p>
                  </div>
                </div>
              </div>
            )}

            {registrationError && !alreadyRegistered && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <div className="flex gap-3">
                  <X size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">{registrationError}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Full Name *</label>
                <input 
                  className={`w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none ${registrationError && !newDonor.name.trim() ? 'ring-2 ring-red-300' : ''}`}
                  placeholder="Enter your full name"
                  value={newDonor.name} 
                  onChange={e => { setNewDonor({...newDonor, name: e.target.value}); setRegistrationError(''); }} 
                  disabled={isRegistering || alreadyRegistered}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Blood Group *</label>
                  <select 
                    className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none" 
                    value={newDonor.bloodGroup} 
                    onChange={e => setNewDonor({...newDonor, bloodGroup: e.target.value})}
                    disabled={isRegistering || alreadyRegistered}
                  >
                    {groups.filter(g => g !== 'All').map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Phone Number *</label>
                  <input 
                    className={`w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none ${registrationError && !newDonor.phone.trim() ? 'ring-2 ring-red-300' : ''}`}
                    placeholder="+880..."
                    value={newDonor.phone} 
                    onChange={e => { setNewDonor({...newDonor, phone: e.target.value}); setRegistrationError(''); }} 
                    disabled={isRegistering || alreadyRegistered}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">District *</label>
                <select 
                  className={`w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none ${registrationError && !newDonor.location.trim() ? 'ring-2 ring-red-300' : ''}`}
                  value={newDonor.location} 
                  onChange={e => { setNewDonor({...newDonor, location: e.target.value}); setRegistrationError(''); }} 
                  disabled={isRegistering || alreadyRegistered}
                >
                  <option value="">Select your district...</option>
                  {ALL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              
              {!alreadyRegistered && (
                <button 
                  onClick={handleBecomeDonor} 
                  disabled={isRegistering}
                  className="w-full py-5 bg-red-600 text-white rounded-3xl font-bold shadow-xl hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isRegistering ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Registering...
                    </>
                  ) : (
                    'Submit Registration'
                  )}
                </button>
              )}

              {alreadyRegistered && (
                <button 
                  onClick={() => { setShowBecomeModal(false); setAlreadyRegistered(false); setRegistrationError(''); }}
                  className="w-full py-5 bg-gray-600 text-white rounded-3xl font-bold shadow-xl hover:bg-gray-700 transition-all"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Call Modal Desktop Fallback */}
      {showCallModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Phone size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Contact {showCallModal.name}</h3>
              <p className="text-gray-400 mt-2 font-mono text-lg">{showCallModal.phone}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(showCallModal.phone);
                  showToast("Number copied to clipboard");
                  setShowCallModal(null);
                }}
                className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                <Copy size={16}/> Copy Number
              </button>
              <button onClick={() => setShowCallModal(null)} className="px-6 py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Urgent Request Modal */}
      {showUrgentModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Urgent Request</h2>
              <button onClick={() => setShowUrgentModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button>
            </div>
            <div className="p-6 bg-red-50 rounded-3xl mb-8 space-y-2">
               <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Selected Donor</p>
               <p className="font-bold text-red-600">{showUrgentModal.name} ({showUrgentModal.bloodGroup})</p>
               <p className="text-xs text-red-400">{showUrgentModal.location}</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Your Phone Number *</label>
                <input 
                  className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none font-medium" 
                  placeholder="+880..."
                  value={urgentRequest.requesterPhone} 
                  onChange={e => setUrgentRequest({...urgentRequest, requesterPhone: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Message (Optional)</label>
                <textarea 
                  className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none h-24 resize-none text-sm" 
                  placeholder="Explain why the need is urgent..."
                  value={urgentRequest.message}
                  onChange={e => setUrgentRequest({...urgentRequest, message: e.target.value})}
                />
              </div>
              <button 
                onClick={handleUrgentRequest}
                disabled={!urgentRequest.requesterPhone}
                className="w-full py-5 bg-red-600 text-white rounded-3xl font-bold shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <Send size={20}/> Send Urgent Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodDonors;
