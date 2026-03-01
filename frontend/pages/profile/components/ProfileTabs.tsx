import React from 'react';
import { BarChart3, FileText, ShieldAlert, Link2 } from 'lucide-react';
import { useTranslations } from '../../../i18n/I18nContext';
import OverviewTab from './tabs/OverviewTab';
import MedicalRecordsTab from './tabs/MedicalRecordsTab';
import VerificationSecurityTab from './tabs/VerificationSecurityTab';
import ConnectionsTab from './tabs/ConnectionsTab';
import type { Hospital, ConnectedDevice, DeviceType } from '../../../types';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: any;
  // Overview tab
  medical: any;
  visits: any[];
  docs: any[];
  emergencyContact: any;
  profileCompletion: number;
  healthIdStatus: string;
  // Medical Records tab
  isEditingMedical: boolean;
  onToggleMedicalEdit: () => void;
  onSaveMedical: () => void;
  onMedicalChange: (medical: any) => void;
  onDocUpload: (type: string) => void;
  onLogVisit: () => void;
  onDeleteVisit: (id: string) => void;
  // Verification & Security tab
  canRequestVerification: boolean;
  isHospitalAccount: boolean;
  verificationRequests: any[];
  isLoadingRequests: boolean;
  onRequestVerification: () => void;
  onApproveRequest: (id: number) => void;
  onRejectRequest: (req: any) => void;
  onEditEmergencyContact: () => void;
  // Connections tab
  connectedHospitals: Hospital[];
  connectedDevices: ConnectedDevice[];
  onAddDevice: (name: string, type: DeviceType) => Promise<void>;
  onRemoveDevice: (deviceId: string) => Promise<void>;
}

const ProfileTabs: React.FC<ProfileTabsProps> = (props) => {
  const { t } = useTranslations();

  const tabs = [
    { id: 'overview', label: t('profile.tabs.overview'), icon: BarChart3 },
    { id: 'medical', label: t('profile.tabs.medical'), icon: FileText },
    { id: 'verification', label: t('profile.tabs.verification'), icon: ShieldAlert },
    { id: 'connections', label: t('profile.tabs.connections'), icon: Link2 }
  ];

  return (
    <div className="space-y-8 overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = props.activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => props.onTabChange(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all border-b-2 ${
                isActive
                  ? 'text-amber-600 border-amber-600'
                  : 'text-slate-600 border-transparent hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="overflow-hidden">
        {props.activeTab === 'overview' && <OverviewTab {...props} />}
        {props.activeTab === 'medical' && <MedicalRecordsTab {...props} />}
        {props.activeTab === 'verification' && <VerificationSecurityTab {...props} />}
        {props.activeTab === 'connections' && (
          <ConnectionsTab
            hospitals={props.connectedHospitals}
            devices={props.connectedDevices}
            onAddDevice={props.onAddDevice}
            onRemoveDevice={props.onRemoveDevice}
          />
        )}
      </div>
    </div>
  );
};

export default ProfileTabs;
