import React from 'react';
import { useTranslations } from '../../../../i18n/I18nContext';
import ProfileStrengthCard from '../cards/ProfileStrengthCard';
import HealthSnapshotCard from '../cards/HealthSnapshotCard';
import NextActionsCard from '../cards/NextActionsCard';

interface CompletionChecklistItem {
  label: string;
  completed: boolean;
  required: boolean;
}

interface OverviewTabProps {
  user: any;
  medical: any;
  visits: any[];
  docs: any[];
  emergencyContact: any;
  profileCompletion: number;
  healthIdStatus: string;
  onEditEmergencyContact: () => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  user,
  medical,
  visits,
  docs,
  emergencyContact,
  profileCompletion,
  healthIdStatus,
  onEditEmergencyContact
}) => {
  const { t } = useTranslations();
  const lastVisit = visits.length > 0 ? new Date(visits[0].date).toLocaleDateString() : null;

  // Build completion checklist
  const completionItems: CompletionChecklistItem[] = [
    {
      label: t('profile.overview.items.fullName'),
      completed: !!(user?.name && user.name.trim().length > 0),
      required: true
    },
    {
      label: t('profile.overview.items.profilePicture'),
      completed: !!(user?.avatar && user.avatar !== 'default-avatar'),
      required: true
    },
    {
      label: t('profile.overview.items.bloodGroup'),
      completed: !!(medical?.bloodGroup && medical.bloodGroup.trim().length > 0),
      required: false
    },
    {
      label: t('profile.overview.items.emergencyContact'),
      completed: !!(emergencyContact?.name && emergencyContact?.phone && emergencyContact?.relation),
      required: false
    },
    {
      label: t('profile.overview.items.medicalRecords'),
      completed: visits.length > 0 || docs.length > 0,
      required: false
    },
    {
      label: t('profile.overview.items.healthIdVerified'),
      completed: healthIdStatus === 'accepted',
      required: false
    }
  ];

  return (
    <div className="space-y-8 overflow-x-hidden">
      {/* Overview Header */}
      <div>
        <h2 className="text-3xl font-serif text-gray-900 mb-2">{t('profile.overview.title')}</h2>
        <p className="text-gray-500">{t('profile.overview.subtitle')}</p>
      </div>
      
      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Strength */}
        <ProfileStrengthCard completion={profileCompletion} items={completionItems} />

        {/* Health Snapshot */}
        <HealthSnapshotCard
          medical={medical}
          healthIdStatus={healthIdStatus}
          lastVisit={lastVisit}
        />

        {/* Next Actions */}
        <NextActionsCard
          medical={medical}
          emergencyContact={emergencyContact}
          healthIdStatus={healthIdStatus}
          hasVisits={visits.length > 0}
          hasDocs={docs.length > 0}
          onEditEmergencyContact={onEditEmergencyContact}
        />
      </div>
    </div>
  );
};

export default OverviewTab;
