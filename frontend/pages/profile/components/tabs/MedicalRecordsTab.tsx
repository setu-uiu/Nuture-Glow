import React from 'react';
import { Heart, FileText, Plus, Upload, Trash2, Edit3, Check, X, Calendar, MapPin } from 'lucide-react';
import { useTranslations } from '../../../../i18n/I18nContext';
import { MedicalReport, VerificationDocument } from '../../../../types';

interface MedicalRecordsTabProps {
  user: any;
  medical: MedicalReport;
  visits: any[];
  docs: VerificationDocument[];
  isEditingMedical: boolean;
  onToggleMedicalEdit: () => void;
  onSaveMedical: () => void;
  onMedicalChange: (medical: MedicalReport) => void;
  onDocUpload: (type: string) => void;
  onLogVisit: () => void;
  onDeleteVisit: (id: string) => void;
}

const MedicalRecordsTab: React.FC<MedicalRecordsTabProps> = ({
  user,
  medical,
  visits,
  docs,
  isEditingMedical,
  onToggleMedicalEdit,
  onSaveMedical,
  onMedicalChange,
  onDocUpload,
  onLogVisit,
  onDeleteVisit
}) => {
  const { t } = useTranslations();
  const getDocStatusMeta = (status?: VerificationDocument['status']) => {
    const normalized = (status || 'NOT_SUBMITTED').toUpperCase();
    if (normalized === 'VERIFIED') {
      return { label: 'Verified', badgeClass: 'bg-emerald-100 text-emerald-700' };
    }
    if (normalized === 'REJECTED') {
      return { label: 'Rejected', badgeClass: 'bg-red-100 text-red-700' };
    }
    if (normalized === 'PENDING') {
      return { label: 'Pending', badgeClass: 'bg-amber-100 text-amber-700' };
    }
    return { label: 'Not Submitted', badgeClass: 'bg-slate-100 text-slate-600' };
  };

  return (
    <div className="space-y-8 overflow-x-hidden">
      {/* Medical Information Section */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header with decorative top bar */}
        <div className="bg-gradient-to-r from-slate-50 to-amber-50/30 px-8 py-6 border-b border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-serif text-gray-900 mb-1">{t('profile.medicalTab.title')}</h3>
              <p className="text-sm text-gray-500">{t('profile.medicalTab.subtitle')}</p>
            </div>
            <button
              onClick={isEditingMedical ? onSaveMedical : onToggleMedicalEdit}
              className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
                isEditingMedical 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20' 
                  : 'bg-gradient-to-r from-amber-700 to-amber-800 text-white hover:from-amber-800 hover:to-amber-900 shadow-lg shadow-amber-700/20'
              }`}
            >
              {isEditingMedical ? `✓ ${t('profile.medicalTab.save')}` : `✎ ${t('profile.medicalTab.edit')}`}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Main Medical Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { label: t('profile.medicalTab.bloodGroup'), key: 'bloodGroup', placeholder: t('profile.medicalTab.bloodPlaceholder') },
              { label: t('profile.medicalTab.allergies'), key: 'allergies', placeholder: t('profile.medicalTab.allergiesPlaceholder') },
              { label: t('profile.medicalTab.knownConditions'), key: 'knownConditions', placeholder: t('profile.medicalTab.conditionsPlaceholder') }
            ].map((field, idx) => (
              <div key={field.key} className={idx === 2 ? 'md:col-span-2' : ''}>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-[1.5px] mb-3 block">
                  {field.label}
                </label>
                <input
                  value={medical[field.key as keyof MedicalReport] as string}
                  disabled={!isEditingMedical}
                  onChange={(e) => onMedicalChange({ ...medical, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full px-5 py-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed transition-all border border-slate-200 focus:border-amber-300"
                />
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-slate-200 via-amber-200 to-transparent"></div>

          {/* Diabetes Status - Premium Card Style */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/30 border border-emerald-200/50 rounded-xl p-6">
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={medical.diabetesStatus as boolean}
                  disabled={!isEditingMedical}
                  onChange={(e) => onMedicalChange({ ...medical, diabetesStatus: e.target.checked })}
                  className="w-5 h-5 rounded-md accent-emerald-600 cursor-pointer mt-0.5"
                />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t('profile.medicalTab.diabetesStatus')}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('profile.medicalTab.diabetesDesc')}</p>
                </div>
              </div>
              {medical.diabetesStatus && (
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white flex-shrink-0 text-xs font-bold">✓</div>
              )}
            </label>
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header with decorative top bar */}
        <div className="bg-gradient-to-r from-slate-50 to-amber-50/30 px-8 py-6 border-b border-slate-200">
          <h3 className="text-2xl font-serif text-gray-900 mb-1">{t('profile.medicalTab.docsTitle')}</h3>
          <p className="text-sm text-gray-500">{t('profile.medicalTab.docsSubtitle')}</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { type: 'NID', label: t('profile.medicalTab.nid') },
              { type: 'BIRTH_CERT', label: t('profile.medicalTab.birthCert') },
              { type: 'MARRIAGE_CERT', label: t('profile.medicalTab.marriageCert') }
            ].map((item) => {
              const doc = docs.find((d) => d.type === (item.type as any));
              const statusMeta = getDocStatusMeta(doc?.status);
              return (
                <div
                  key={item.type}
                  className={`group relative rounded-xl border-2 transition-all duration-300 overflow-hidden cursor-pointer ${
                    doc
                      ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-50/30 shadow-md hover:shadow-lg'
                      : 'border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100/30 hover:border-amber-300 hover:from-amber-50 hover:to-amber-50/20'
                  }`}
                >
                  {/* Decorative corner accent */}
                  {doc && (
                    <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-emerald-200 to-transparent opacity-50"></div>
                  )}

                  <div className="p-8 flex flex-col items-center justify-between text-center h-full relative z-10">
                    {/* Icon */}
                    <div className={`p-4 rounded-lg mb-4 transition-all ${
                      doc
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                        : 'bg-slate-200 text-slate-400 group-hover:bg-amber-200 group-hover:text-amber-600'
                    }`}>
                      <FileText size={24} />
                    </div>

                    {/* Document Label */}
                    <h4 className="font-serif text-base font-semibold text-gray-900 mb-2">
                      {item.label}
                    </h4>

                    {/* Status Badge */}
                    <div className={`inline-block px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${
                      statusMeta.badgeClass
                    }`}>
                      {statusMeta.label}
                    </div>

                    {/* Upload Button */}
                    <button
                      onClick={() => onDocUpload(item.type)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all w-full ${
                        doc
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20'
                          : 'bg-gradient-to-r from-amber-700 to-amber-800 text-white hover:from-amber-800 hover:to-amber-900 shadow-lg shadow-amber-700/20'
                      }`}
                    >
                      {doc ? `↻ ${t('profile.medicalTab.replace')}` : `↑ ${t('profile.medicalTab.upload')}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Visit History Section - Premium Old Money Design */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-serif text-gray-900">{t('profile.medicalTab.reportTitle')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('profile.medicalTab.recordsCount').replace('{count}', String(visits.length))}</p>
          </div>
          <button
            onClick={onLogVisit}
            className="px-8 py-3 bg-gradient-to-r from-amber-700 to-amber-800 text-white rounded-xl font-semibold text-sm tracking-wide shadow-lg hover:shadow-xl hover:from-amber-800 hover:to-amber-900 transition-all active:scale-95"
          >
            + {t('profile.medicalTab.newEntry')}
          </button>
        </div>

        {visits.length === 0 ? (
          <div className="p-16 text-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-200">
              <Heart size={28} className="text-slate-400" />
            </div>
            <p className="font-serif text-gray-600 text-lg mb-2">{t('profile.medicalTab.noRecords')}</p>
            <p className="text-sm text-gray-500">{t('profile.medicalTab.noRecordsDesc')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((visit, index) => (
              <div 
                key={visit.id}
                className="group relative bg-white rounded-2xl border border-slate-200 hover:border-amber-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Decorative left border */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-600 to-amber-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="p-8">
                  <div className="flex justify-between items-start gap-6 mb-6">
                    <div className="flex-1">
                      {/* Doctor Name */}
                      <h4 className="text-xl font-serif text-gray-900 mb-4">Dr. {visit.doctorName}</h4>
                      
                      {/* Meta info - Date and Location */}
                      <div className="flex flex-wrap gap-6 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} className="text-amber-600" />
                          <span className="font-medium">
                            {new Date(visit.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        {visit.clinic && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin size={16} className="text-amber-600" />
                            <span className="font-medium">{visit.clinic}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteVisit(visit.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Delete visit"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-slate-200 to-transparent my-6"></div>

                  {/* Visit Details */}
                  <div className="space-y-6">
                    {visit.reason && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[2px] mb-3">{t('profile.medicalTab.chiefComplaint')}</p>
                        <p className="text-base text-gray-800 leading-relaxed">
                          {visit.reason}
                        </p>
                      </div>
                    )}

                    {visit.notes && (
                      <div className="pl-6 border-l-2 border-amber-200 bg-gradient-to-r from-amber-50 to-transparent py-4 rounded-r-lg">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[2px] mb-2">{t('profile.medicalTab.doctorNotes')}</p>
                        <p className="text-sm text-gray-700 italic font-light leading-relaxed">
                          "{visit.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );

  function handleDeleteVisit(id: string) {
    onDeleteVisit(id);
  }
};

export default MedicalRecordsTab;

