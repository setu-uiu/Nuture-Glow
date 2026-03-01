import React from 'react';
import { XCircle } from 'lucide-react';
import { useTranslations } from '../../../i18n/I18nContext';

interface RejectReasonModalProps {
  rejectReason: string;
  onChangeReason: (reason: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  rejectReason,
  onChangeReason,
  onConfirm,
  onCancel
}) => {
  const { t } = useTranslations();

  return (
    <div className="fixed inset-0 z-[430] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{t('profile.verificationRequests.rejectTitle')}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <XCircle size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <textarea
            className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none focus:ring-2 focus:ring-red-100 h-24 resize-none text-sm font-medium"
            placeholder={t('profile.verificationRequests.rejectPlaceholder')}
            value={rejectReason}
            onChange={(e) => onChangeReason(e.target.value)}
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-600 transition-all"
            >
              {t('profile.verificationRequests.confirmReject')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectReasonModal;
