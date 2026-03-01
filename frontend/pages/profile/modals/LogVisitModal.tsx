import React from 'react';
import { Plus, XCircle } from 'lucide-react';
import { useTranslations } from '../../../i18n/I18nContext';

interface LogVisitModalProps {
  visitForm: any;
  onChangeVisitForm: (form: any) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const LogVisitModal: React.FC<LogVisitModalProps> = ({
  visitForm,
  onChangeVisitForm,
  onSubmit,
  onClose
}) => {
  const { t } = useTranslations();

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800">{t('profile.visits.logBtn')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <XCircle size={28} />
          </button>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">
                Doctor Name
              </label>
              <input
                className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none focus:ring-2 focus:ring-teal-100 font-bold"
                value={visitForm.doctorName}
                onChange={(e) => onChangeVisitForm({ ...visitForm, doctorName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Date</label>
              <input
                type="date"
                className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none focus:ring-2 focus:ring-teal-100 font-bold"
                value={visitForm.date}
                onChange={(e) => onChangeVisitForm({ ...visitForm, date: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">
              Clinic/Hospital
            </label>
            <input
              className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none focus:ring-2 focus:ring-teal-100 font-bold"
              value={visitForm.clinic}
              onChange={(e) => onChangeVisitForm({ ...visitForm, clinic: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Reason</label>
            <input
              className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none focus:ring-2 focus:ring-teal-100 font-bold"
              placeholder="Routine checkup, pain, etc."
              value={visitForm.reason}
              onChange={(e) => onChangeVisitForm({ ...visitForm, reason: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Notes</label>
            <textarea
              className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none h-24 resize-none text-sm font-medium"
              placeholder="Doctor suggestions..."
              value={visitForm.notes}
              onChange={(e) => onChangeVisitForm({ ...visitForm, notes: e.target.value })}
            />
          </div>
          <button
            onClick={onSubmit}
            className="w-full py-5 bg-teal-600 text-white rounded-3xl font-bold shadow-xl shadow-teal-600/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs"
          >
            {t('profile.visits.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogVisitModal;
