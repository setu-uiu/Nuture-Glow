import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '../../i18n/I18nContext';

interface VideoSessionButtonProps {
  appointmentId: string;
  userRole?: string | null;
  isOnlineAppointment: boolean;
  meetingExists: boolean;
}

const VideoSessionButton: React.FC<VideoSessionButtonProps> = ({
  appointmentId,
  userRole,
  isOnlineAppointment,
  meetingExists
}) => {
  const navigate = useNavigate();
  const { t } = useTranslations();

  if (!isOnlineAppointment) return null;

  const handleNavigate = () => {
    navigate(`/appointments/${appointmentId}/video`);
  };

  if (!meetingExists && userRole !== 'doctor') {
    return (
      <div className="px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-xs font-bold">
        {t('video.roomNotReady')}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleNavigate}
      className={`px-6 py-2 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer ${
        meetingExists
          ? 'bg-teal-600 text-white hover:bg-teal-700'
          : 'bg-amber-500 text-white hover:bg-amber-600'
      }`}
    >
      {meetingExists ? t('video.joinSession') : t('video.createSession')}
    </button>
  );
};

export default VideoSessionButton;
