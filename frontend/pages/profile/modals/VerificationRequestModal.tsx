import React from 'react';
import { XCircle, FileCheck, AlertCircle } from 'lucide-react';
import { useTranslations } from '../../../i18n/I18nContext';

interface VerificationRequestModalProps {
  requestNote: string;
  onChangeRequestNote: (note: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
  hasMarriageCert: boolean;
  hasNID: boolean;
}

const VerificationRequestModal: React.FC<VerificationRequestModalProps> = ({
  requestNote,
  onChangeRequestNote,
  isSubmitting,
  onSubmit,
  onClose,
  hasMarriageCert,
  hasNID
}) => {
  const { t } = useTranslations();

  return (
    <div className="fixed inset-0 z-[420] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">{t('profile.requestVerification')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <XCircle size={28} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Document checklist */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">
              Required Documents
            </label>

            <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 ${
              hasMarriageCert ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              {hasMarriageCert
                ? <FileCheck size={20} className="text-green-600 flex-shrink-0" />
                : <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
              }
              <div>
                <div className={`text-sm font-bold ${hasMarriageCert ? 'text-green-700' : 'text-red-700'}`}>
                  Marriage Certificate {hasMarriageCert ? '✓' : '(Required)'}
                </div>
                <div className="text-xs text-gray-500">
                  {hasMarriageCert ? 'Uploaded' : 'Please upload your Marriage Certificate from the Medical Records tab'}
                </div>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 ${
              hasNID ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50'
            }`}>
              {hasNID
                ? <FileCheck size={20} className="text-green-600 flex-shrink-0" />
                : <FileCheck size={20} className="text-gray-400 flex-shrink-0" />
              }
              <div>
                <div className={`text-sm font-bold ${hasNID ? 'text-green-700' : 'text-gray-500'}`}>
                  NID Card {hasNID ? '✓' : '(Optional)'}
                </div>
                <div className="text-xs text-gray-500">
                  {hasNID ? 'Uploaded' : 'Not required, but recommended for faster verification'}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">
              {t('profile.verificationRequests.note')}
            </label>
            <textarea
              className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none focus:ring-2 focus:ring-teal-100 h-24 resize-none text-sm font-medium"
              placeholder={t('profile.verificationRequests.notePlaceholder')}
              value={requestNote}
              onChange={(e) => onChangeRequestNote(e.target.value)}
            />
          </div>

          {!hasMarriageCert && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800 font-medium">
              You must upload your Marriage Certificate before submitting a verification request. Go to the Medical Records tab to upload it.
            </div>
          )}

          <button
            onClick={onSubmit}
            disabled={isSubmitting || !hasMarriageCert}
            className="w-full py-5 bg-teal-600 text-white rounded-3xl font-bold shadow-xl shadow-teal-600/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
          >
            {isSubmitting ? t('profile.verificationRequests.submitting') : t('profile.verificationRequests.submit')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationRequestModal;
