import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../i18n/I18nContext';
import { db } from '../../services/db';
import { VerificationDocument, MedicalReport, DoctorVisit, Hospital, HealthIdVerificationRequest, HealthIdVerificationStatus, ConnectedDevice, DeviceType } from '../../types';
import { ShareHealthIdModal } from '../../components/ShareHealthIdModal';
import ProfileHero from './components/ProfileHero';
import ProfileTabs from './components/ProfileTabs';
import Toast from './components/Toast';
import LogVisitModal from './modals/LogVisitModal';
import VerificationRequestModal from './modals/VerificationRequestModal';
import RejectReasonModal from './modals/RejectReasonModal';
import EditEmergencyContactModal from './modals/EditEmergencyContactModal';
import SettingsModal from './modals/SettingsModal';

const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
]);
const ALLOWED_DOCUMENT_TYPES = new Set([
  ...ALLOWED_IMAGE_TYPES,
  'application/pdf'
]);

/**
 * Health Identity Hub - Main Profile Page
 * Refactored from large monolithic Profile component
 */
const ProfilePage: React.FC = () => {
  const { user, updateAvatar, updateName, updatePhone } = useAuth();
  const { t } = useTranslations();
  const navigate = useNavigate();
  const location = useLocation();
  const avatarRef = useRef<HTMLInputElement>(null) as React.MutableRefObject<HTMLInputElement>;

  // Core data state
  const [docs, setDocs] = useState<VerificationDocument[]>([]);
  const [medical, setMedical] = useState<MedicalReport>({
    bloodGroup: '',
    allergies: '',
    diabetesStatus: false,
    knownConditions: ''
  });
  const [visits, setVisits] = useState<DoctorVisit[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<HealthIdVerificationRequest[]>([]);
  const [healthIdStatus, setHealthIdStatus] = useState<HealthIdVerificationStatus>('unverified');
  const [isHospitalAccount, setIsHospitalAccount] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    phone: '',
    relation: ''
  });
  const [connectedHospitals, setConnectedHospitals] = useState<Hospital[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingMedical, setIsEditingMedical] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user?.name || '');
  const [showLogVisit, setShowLogVisit] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showEmergencyContactModal, setShowEmergencyContactModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [rejectingRequest, setRejectingRequest] = useState<HealthIdVerificationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);

  // Verification modal state
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [requestNote, setRequestNote] = useState('');
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('google_connected') === 'true') {
      setToast({ message: t('video.googleConnected'), type: 'success' });
      params.delete('google_connected');
      const search = params.toString();
      navigate(`${location.pathname}${search ? `?${search}` : ''}`, { replace: true });
    }
  }, [location.pathname, location.search, navigate, t]);

  // Visit form state
  const [visitForm, setVisitForm] = useState({
    doctorName: '',
    clinic: '',
    date: new Date().toISOString().split('T')[0],
    reason: '',
    notes: ''
  });

  // Emergency contact form state
  const [emergencyForm, setEmergencyForm] = useState({
    name: '',
    phone: '',
    relation: ''
  });

  // ===== Toast Utilities =====
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const validateUploadFile = (file: File, allowedTypes: Set<string>) => {
    if (!allowedTypes.has(file.type)) {
      return 'Unsupported file type.';
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return 'File is too large. Maximum size is 5MB.';
    }
    return null;
  };

  // ===== Data Loading =====
  const loadHealthIdStatus = async () => {
    if (!user) return;
    try {
      const data = await db.getHealthIdVerificationStatus();
      setHealthIdStatus(data.status as HealthIdVerificationStatus);
    } catch (err) {
      // Keep existing status if request fails
    }
  };

  const loadHospitals = async () => {
    try {
      const data = await db.getHospitals();
      setHospitals(data || []);
    } catch (err) {
      setHospitals([]);
    }
  };

  const loadHospitalRequests = async () => {
    if (!user) return;
    setIsLoadingRequests(true);
    try {
      const items = await db.getHospitalVerificationRequests();
      setVerificationRequests(items);
      setIsHospitalAccount(true);
    } catch (err) {
      setIsHospitalAccount(false);
      setVerificationRequests([]);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const loadEmergencyContact = async () => {
    if (!user) return;
    try {
      const profile = await db.getUserProfile?.(user.id);
      if (profile?.emergencyContact) {
        setEmergencyContact(profile.emergencyContact);
        setEmergencyForm(profile.emergencyContact);
      }
    } catch (err) {
      // No emergency contact yet
    }
  };

  const loadConnectedHospitals = async () => {
    try {
      const data = await db.getConnectedHospitals();
      setConnectedHospitals(data || []);
    } catch (err) {
      setConnectedHospitals([]);
    }
  };

  const loadDevices = async () => {
    try {
      const data = await db.getDevices();
      setConnectedDevices(data || []);
    } catch (err) {
      setConnectedDevices([]);
    }
  };

  const handleAddDevice = async (name: string, type: DeviceType) => {
    await db.addDevice(name, type);
    showToast(t('profile.success.deviceAdded'));
    await loadDevices();
  };

  const handleRemoveDevice = async (deviceId: string) => {
    await db.removeDevice(deviceId);
    showToast(t('profile.success.deviceRemoved'), 'info');
    await loadDevices();
  };

  const refreshData = async () => {
    if (!user) return;
    const [docsData, visitData, medicalData] = await Promise.all([
      db.getVerificationDocs(user.id),
      db.getVisitHistory(user.id),
      db.getMedicalReport(user.id)
    ]);
    setDocs(docsData);
    setVisits(visitData);
    setMedical(medicalData);
  };

  useEffect(() => {
    refreshData();
    loadHealthIdStatus();
    loadHospitalRequests();
    loadEmergencyContact();
    loadConnectedHospitals();
    loadDevices();
    const handleUpdate = () => {
      refreshData();
      loadHealthIdStatus();
    };
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, [user]);

  useEffect(() => {
    loadHospitals();
  }, []);

  // ===== Avatar Upload =====
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user) return;

    const validationError = validateUploadFile(file, ALLOWED_IMAGE_TYPES);
    if (validationError) {
      showToast(validationError, 'error');
      return;
    }

    try {
      await updateAvatar(file);
      showToast(t('profile.success.avatar'));
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile picture.', 'error');
    }
  };

  // ===== Name Editing =====
  const handleSaveName = async () => {
    const trimmed = tempName.trim();
    if (!/^[a-zA-Z0-9 ._]{3,30}$/.test(trimmed)) {
      showToast(t('profile.errors.nameValid'), 'error');
      return;
    }
    await updateName(trimmed);
    setIsEditingName(false);
    showToast(t('profile.success.updated'));
  };

  const handleCancelName = () => {
    setIsEditingName(false);
    setTempName(user?.name || '');
  };

  // ===== Phone Editing =====
  const handleSavePhone = async (phone: string) => {
    try {
      await updatePhone(phone);
      showToast(t('profile.success.phoneSaved'));
    } catch (err: any) {
      showToast(err.message || 'Failed to update phone number.', 'error');
    }
  };

  // ===== Document Upload =====
  const handleDocUpload = (type: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp,image/gif,application/pdf';
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      target.value = '';
      if (!file || !user) return;

      const validationError = validateUploadFile(file, ALLOWED_DOCUMENT_TYPES);
      if (validationError) {
        showToast(validationError, 'error');
        return;
      }

      try {
        await db.updateVerificationDoc(
          user.id,
          type as VerificationDocument['type'],
          file
        );
        showToast(t('profile.success.docUploaded'));
        await refreshData();
      } catch (err: any) {
        showToast(err.message || 'Failed to upload document.', 'error');
      }
    };
    input.click();
  };

  // ===== Medical Report =====
  const saveMedical = async () => {
    if (user) {
      await db.saveMedicalReport(user.id, medical);
      setIsEditingMedical(false);
      showToast(t('profile.success.medical'));
    }
  };

  // ===== Visit Management =====
  const handleLogVisitSubmit = async () => {
    if (!user || !visitForm.doctorName || !visitForm.clinic) return;
    await db.addVisitRecord(user.id, visitForm);
    setVisitForm({
      doctorName: '',
      clinic: '',
      date: new Date().toISOString().split('T')[0],
      reason: '',
      notes: ''
    });
    setShowLogVisit(false);
    showToast(t('profile.success.visit'));
    refreshData();
  };

  const handleDeleteVisit = async (id: string) => {
    if (user && window.confirm(t('profile.deleteVisitConfirm'))) {
      await db.deleteVisitRecord(user.id, id);
      showToast(t('profile.success.visit'), 'info');
      refreshData();
    }
  };

  // ===== Emergency Contact =====
  const handleSaveEmergencyContact = async () => {
    if (!user) return;
    try {
      if (db.updateUserProfile) {
        await db.updateUserProfile(user.id, {
          emergencyContact: emergencyForm
        });
      }
      setEmergencyContact(emergencyForm);
      setShowEmergencyContactModal(false);
      showToast(t('profile.success.emergencyContact'));
    } catch (err: any) {
      showToast(err.message || 'Failed to save emergency contact', 'error');
    }
  };

  // ===== Verification =====
  const handleSubmitVerification = async () => {
    // Marriage Certificate is mandatory
    const hasMarriageCert = docs.some(d => d.type === 'MARRIAGE_CERT');
    if (!hasMarriageCert) {
      showToast('You must upload your Marriage Certificate before requesting verification.', 'error');
      return;
    }
    setIsSubmittingVerification(true);
    try {
      await db.requestHealthIdVerification(requestNote);
      setHealthIdStatus('pending');
      showToast(t('profile.success.verificationSent'));
      setShowVerificationModal(false);
      setRequestNote('');
    } catch (err: any) {
      showToast(err.message || 'Failed to send request.', 'error');
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  const handleDecision = async (requestId: number, decision: 'accepted' | 'rejected', reason?: string) => {
    try {
      await db.decideHospitalVerificationRequest(requestId, decision, reason);
      setVerificationRequests((prev) => prev.filter((item) => item.id !== requestId));
      showToast(`Request ${decision}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update request.', 'error');
    }
  };

  // ===== Reset Health Data =====
  const confirmResetHealthData = async () => {
    if (!user) return;
    try {
      await db.resetUserHealthData(user.id);
      showToast(t('profile.success.reset'), 'success');
      setShowResetConfirm(false);
      setShowSettings(false);
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
    } catch (err) {
      console.error('Reset Error:', err);
      showToast(t('profile.errors.resetFail'), 'error');
    }
  };

  // ===== Computed Properties =====
  const hasUploadedDocs = docs.length > 0;
  const canRequestVerification = (healthIdStatus === 'unverified' || healthIdStatus === 'rejected');

  const filteredHospitals = hospitals.filter((hospital) => {
    if (!hospitalSearch.trim()) return true;
    const q = hospitalSearch.toLowerCase();
    return (
      hospital.name.toLowerCase().includes(q) ||
      hospital.location.toLowerCase().includes(q)
    );
  });

  const healthIdStatusLabels: Record<HealthIdVerificationStatus, string> = {
    unverified: t('profile.healthIdStatus.unverified'),
    pending: t('profile.healthIdStatus.pending'),
    accepted: t('profile.healthIdStatus.accepted'),
    rejected: t('profile.healthIdStatus.rejected')
  };

  const healthIdStatusClasses: Record<HealthIdVerificationStatus, string> = {
    unverified: 'text-gray-400',
    pending: 'text-orange-500',
    accepted: 'text-teal-600',
    rejected: 'text-red-500'
  };

  // Calculate profile completion
  const profileCompletion = () => {
    let score = 0;
    let total = 7;

    if (user?.name) score++;
    if (user?.avatar && user.avatar !== '') score++;
    if (medical.bloodGroup) score++;
    if (emergencyContact.name) score++;
    if (visits.length > 0 || docs.length > 0) score++;
    if (healthIdStatus === 'accepted') score++;
    // Phone would be 7th

    return Math.round((score / total) * 100);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#BFE6DA]/5 pb-20 relative overflow-x-hidden">
      <ShareHealthIdModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} user={user} />
      <Toast toast={toast} />

      {/* Hero Section */}
      <ProfileHero
        user={user}
        healthIdStatus={healthIdStatus}
        healthIdStatusLabels={healthIdStatusLabels}
        healthIdStatusClasses={healthIdStatusClasses}
        canRequestVerification={canRequestVerification}
        isEditingName={isEditingName}
        tempName={tempName}
        onStartEditName={() => {
          setTempName(user.name);
          setIsEditingName(true);
        }}
        onCancelEditName={handleCancelName}
        onSaveName={handleSaveName}
        onChangeName={(name) => setTempName(name)}
        onAvatarUpload={(e) => handleAvatarUpload(e)}
        avatarRef={avatarRef}
        onShareHealth={() => setShowShareModal(true)}
        onRequestVerification={() => setShowVerificationModal(true)}
        onOpenSettings={() => setShowSettings(!showSettings)}
        showSettings={showSettings}
        emergencyContact={emergencyContact}
        onEditEmergencyContact={() => setShowEmergencyContactModal(true)}
        onSavePhone={handleSavePhone}
      />

      {/* Tabs Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10">
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          user={user}
          // Overview tab data
          medical={medical}
          visits={visits}
          docs={docs}
          emergencyContact={emergencyContact}
          profileCompletion={profileCompletion()}
          healthIdStatus={healthIdStatus}
          // Medical Records tab data
          isEditingMedical={isEditingMedical}
          onToggleMedicalEdit={() => setIsEditingMedical(!isEditingMedical)}
          onSaveMedical={saveMedical}
          onMedicalChange={setMedical}
          onDocUpload={handleDocUpload}
          onLogVisit={() => setShowLogVisit(true)}
          onDeleteVisit={handleDeleteVisit}
          // Verification & Security tab data
          canRequestVerification={canRequestVerification}
          isHospitalAccount={isHospitalAccount}
          verificationRequests={verificationRequests}
          isLoadingRequests={isLoadingRequests}
          onRequestVerification={() => setShowVerificationModal(true)}
          onApproveRequest={(id) => handleDecision(id, 'accepted')}
          onRejectRequest={(req) => {
            setRejectingRequest(req);
            setRejectReason('');
          }}
          // Emergency contact
          onEditEmergencyContact={() => {
            setEmergencyForm(emergencyContact);
            setShowEmergencyContactModal(true);
          }}
          // Connections tab
          connectedHospitals={connectedHospitals}
          connectedDevices={connectedDevices}
          onAddDevice={handleAddDevice}
          onRemoveDevice={handleRemoveDevice}
        />
      </div>

      {/* Modals */}
      {showLogVisit && (
        <LogVisitModal
          visitForm={visitForm}
          onChangeVisitForm={setVisitForm}
          onSubmit={handleLogVisitSubmit}
          onClose={() => setShowLogVisit(false)}
        />
      )}

      {showVerificationModal && (
        <VerificationRequestModal
          requestNote={requestNote}
          onChangeRequestNote={setRequestNote}
          isSubmitting={isSubmittingVerification}
          onSubmit={handleSubmitVerification}
          onClose={() => {
            setShowVerificationModal(false);
            setRequestNote('');
          }}
          hasMarriageCert={docs.some(d => d.type === 'MARRIAGE_CERT')}
          hasNID={docs.some(d => d.type === 'NID')}
        />
      )}

      {rejectingRequest && (
        <RejectReasonModal
          onChangeReason={setRejectReason}
          rejectReason={rejectReason}
          onConfirm={() => {
            handleDecision(rejectingRequest.id, 'rejected', rejectReason);
            setRejectingRequest(null);
          }}
          onCancel={() => setRejectingRequest(null)}
        />
      )}

      {showEmergencyContactModal && (
        <EditEmergencyContactModal
          emergencyContact={emergencyForm}
          onChange={setEmergencyForm}
          onSave={handleSaveEmergencyContact}
          onClose={() => setShowEmergencyContactModal(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          showResetConfirm={showResetConfirm}
          onShowResetConfirm={() => setShowResetConfirm(true)}
          onCancelReset={() => setShowResetConfirm(false)}
          onConfirmReset={confirmResetHealthData}
          onChangePhoto={handleAvatarUpload}
          currentAvatar={user.avatar}
        />
      )}
    </div>
  );
};

export default ProfilePage;
