import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Check, X, CheckCircle2, Clock, FileText } from 'lucide-react';
import { useTranslations } from '../../../../i18n/I18nContext';

interface VerificationSecurityTabProps {
  canRequestVerification: boolean;
  isHospitalAccount: boolean;
  verificationRequests: any[];
  isLoadingRequests: boolean;
  onRequestVerification: () => void;
  onApproveRequest: (id: number) => void;
  onRejectRequest: (req: any) => void;
  docs?: any[];
  healthIdStatus?: string;
  user?: any;
}

interface VerificationStep {
  id: string;
  label: string;
  description: string;
  status: 'completed' | 'pending' | 'in-progress';
  icon: React.ReactNode;
  timestamp?: string;
}

interface AuditEvent {
  id: string;
  type: 'verification_requested' | 'verification_approved' | 'verification_rejected' | 'document_uploaded' | 'health_id_shared';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
}

const VerificationSecurityTab: React.FC<VerificationSecurityTabProps> = ({
  canRequestVerification,
  isHospitalAccount,
  verificationRequests,
  isLoadingRequests,
  onRequestVerification,
  onApproveRequest,
  onRejectRequest,
  docs = [],
  healthIdStatus = 'unverified',
  user
}) => {
  const { t } = useTranslations();
  const [showAllAudit, setShowAllAudit] = useState(false);

  // Dynamically compute verification steps from actual data
  const hasNID = docs.some(d => d.type === 'NID' || d.document_type === 'NID');
  const hasMarriageCert = docs.some(d => d.type === 'MARRIAGE_CERT' || d.document_type === 'MARRIAGE_CERT');
  const hasBirthCert = docs.some(d => d.type === 'BIRTH_CERT' || d.document_type === 'BIRTH_CERT');
  const hasAnyDoc = docs.length > 0;
  const isPending = healthIdStatus === 'pending';
  const isVerified = healthIdStatus === 'accepted' || healthIdStatus === 'verified';

  const verificationSteps: VerificationStep[] = [
    {
      id: 'account',
      label: t('profile.verificationTab.steps.accountCreated'),
      description: t('profile.verificationTab.steps.accountDesc'),
      status: 'completed',
      icon: <Check size={18} className="text-green-600" />,
      timestamp: user?.created_at ? new Date(user.created_at).toLocaleDateString() : undefined
    },
    {
      id: 'documents',
      label: t('profile.verificationTab.steps.docsUploaded'),
      description: hasMarriageCert
        ? t('profile.verificationTab.steps.docsDescDone').replace('{count}', String(docs.length)).replace('{types}', [hasMarriageCert && 'Marriage Cert', hasNID && 'NID'].filter(Boolean).join(', ') || 'Other')
        : 'Upload your Marriage Certificate (required). NID is optional.',
      status: hasMarriageCert ? 'completed' : 'pending',
      icon: hasMarriageCert ? <Check size={18} className="text-green-600" /> : <Clock size={18} className="text-orange-500" />,
      timestamp: hasAnyDoc && docs[0]?.uploadedAt ? new Date(docs[0].uploadedAt).toLocaleDateString() : undefined
    },
    {
      id: 'request',
      label: t('profile.verificationTab.steps.requested'),
      description: isPending || isVerified
        ? t('profile.verificationTab.steps.requestedDescDone')
        : t('profile.verificationTab.steps.requestedDescPending'),
      status: isPending || isVerified ? 'completed' : hasAnyDoc ? 'in-progress' : 'pending',
      icon: isPending || isVerified ? <Check size={18} className="text-green-600" /> : hasAnyDoc ? <Clock size={18} className="text-orange-500" /> : <Clock size={18} className="text-gray-400" />,
      timestamp: undefined
    },
    {
      id: 'verified',
      label: t('profile.verificationTab.steps.verified'),
      description: isVerified
        ? t('profile.verificationTab.steps.verifiedDescDone')
        : isPending
        ? t('profile.verificationTab.steps.verifiedDescPending')
        : t('profile.verificationTab.steps.verifiedDescNotStarted'),
      status: isVerified ? 'completed' : isPending ? 'in-progress' : 'pending',
      icon: isVerified ? <CheckCircle2 size={18} className="text-green-600" /> : isPending ? <Clock size={18} className="text-orange-500" /> : <Clock size={18} className="text-gray-400" />,
      timestamp: undefined
    }
  ];

  // Build dynamic audit events from actual documents and status
  const auditEvents: AuditEvent[] = [];

  docs.forEach((doc, idx) => {
    auditEvents.push({
      id: `doc-${idx}`,
      type: 'document_uploaded',
      title: t('profile.verificationTab.docUploaded').replace('{type}', doc.type || doc.document_type || 'Document'),
      description: doc.fileName || doc.file_name || t('profile.verificationTab.docUploadedDesc'),
      timestamp: doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Recently',
      icon: <FileText size={16} className="text-teal-600" />
    });
  });

  if (isPending) {
    auditEvents.unshift({
      id: 'pending',
      type: 'verification_requested',
      title: t('profile.verificationTab.verificationRequested'),
      description: t('profile.verificationTab.verificationRequestedDesc'),
      timestamp: 'Pending',
      icon: <ShieldAlert size={16} className="text-orange-500" />
    });
  }

  if (isVerified) {
    auditEvents.unshift({
      id: 'verified',
      type: 'verification_approved',
      title: t('profile.verificationTab.verificationApproved'),
      description: t('profile.verificationTab.verificationApprovedDesc'),
      timestamp: 'Approved',
      icon: <ShieldCheck size={16} className="text-green-600" />
    });
  }

  // Calculate progress percentage
  const completedSteps = verificationSteps.filter(s => s.status === 'completed').length;
  const progressPercentage = (completedSteps / verificationSteps.length) * 100;

  return (
    <div className="space-y-8 overflow-x-hidden">
      {/* Verification Status */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-amber-50/30 px-8 py-6 border-b border-slate-200">
          <h3 className="text-2xl font-serif text-gray-900 mb-1">{t('profile.verificationTab.title')}</h3>
          <p className="text-sm text-gray-500">{t('profile.verificationTab.subtitle')}</p>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            {t('profile.verificationTab.desc')}
          </p>

          {canRequestVerification && (
            <button
              onClick={onRequestVerification}
              className="w-full px-6 py-4 bg-gradient-to-r from-amber-700 to-amber-800 text-white rounded-xl font-semibold shadow-lg shadow-amber-700/20 hover:shadow-xl hover:from-amber-800 hover:to-amber-900 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <ShieldCheck size={18} /> {t('profile.verificationTab.requestBtn')}
            </button>
          )}

          {!canRequestVerification && (
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-50/30 rounded-xl border border-emerald-200 flex items-center gap-4">
              <div className="p-3 bg-emerald-600 text-white rounded-lg flex-shrink-0">
                <Check size={20} />
              </div>
              <div>
                <p className="font-semibold text-emerald-900">{t('profile.verificationTab.complete')}</p>
                <p className="text-xs text-emerald-700 mt-1">{t('profile.verificationTab.completeDesc')}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Verification Progress Steps */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-amber-50/30 px-8 py-6 border-b border-slate-200">
          <h3 className="text-2xl font-serif text-gray-900 mb-1">{t('profile.verificationTab.progressTitle')}</h3>
          <p className="text-sm text-gray-500">{t('profile.verificationTab.progressCount').replace('{completed}', String(completedSteps)).replace('{total}', String(verificationSteps.length))}</p>
        </div>
        
        <div className="p-8">
          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-8">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-4">
          {verificationSteps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Connector line */}
              {index < verificationSteps.length - 1 && (
                <div className={`absolute left-6 top-16 w-0.5 h-8 ${
                  step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                }`} />
              )}

              {/* Step Card */}
              <div className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all group">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.status === 'completed'
                    ? 'bg-green-100'
                    : step.status === 'in-progress'
                    ? 'bg-orange-100'
                    : 'bg-gray-100'
                }`}>
                  {step.icon || <Clock size={18} className="text-gray-400" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-800">{step.label}</h4>
                    {step.status === 'completed' && (
                      <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded-full">
                        Verified
                      </span>
                    )}
                    {step.status === 'pending' && (
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{step.description}</p>
                  {step.timestamp && (
                    <p className="text-[10px] text-gray-400 font-medium">{step.timestamp}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* Audit Timeline */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-amber-50/30 px-8 py-6 border-b border-slate-200">
          <h3 className="text-2xl font-serif text-gray-900">{t('profile.verificationTab.timeline')}</h3>
        </div>
        
        <div className="p-8">
          {auditEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              {t('profile.verificationTab.timelineEmpty')}
            </div>
          ) : (
          (showAllAudit ? auditEvents : auditEvents.slice(0, 3)).map((event, index) => (
            <div key={event.id} className="relative">
              {/* Timeline line */}
              {index < auditEvents.length - 1 && (
                <div className="absolute left-6 top-14 w-0.5 h-8 bg-gray-100" />
              )}

              {/* Timeline item */}
              <div className="flex gap-4">
                {/* Timeline dot */}
                <div className="relative mt-1">
                  <div className="w-5 h-5 rounded-full bg-white border-4 border-gray-100 flex items-center justify-center flex-shrink-0" />
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-1">{event.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      <p className="text-xs text-gray-400 font-medium">{event.timestamp}</p>
                    </div>
                    <div className="text-gray-300 flex-shrink-0 mt-1">
                      {event.icon}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
          )}
        </div>

        {auditEvents.length > 3 && !showAllAudit && (
        <button
          onClick={() => setShowAllAudit(true)}
          className="w-full mt-8 px-4 py-3 border border-slate-200 text-gray-700 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm"
        >
          {t('profile.verificationTab.viewFullLog')}
        </button>
        )}
      </section>

      {/* Hospital Verification Queue */}
      {isHospitalAccount && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-purple-50/30 px-8 py-6 border-b border-slate-200">
            <h3 className="text-2xl font-serif text-gray-900 mb-1">{t('profile.verificationTab.hospitalQueue')}</h3>
            <p className="text-sm text-gray-500">{t('profile.verificationTab.hospitalQueueDesc')}</p>
          </div>
          
          <div className="p-8">
          <div className="divide-y divide-slate-200">
            {isLoadingRequests ? (
              <div className="p-10 text-center text-sm text-gray-400 font-medium">Loading requests...</div>
            ) : verificationRequests.length === 0 ? (
              <div className="p-12 text-center space-y-3 text-gray-400">
                <p className="text-sm font-bold">No pending verification requests</p>
              </div>
            ) : (
              verificationRequests.map((req) => (
                <div key={req.id} className="py-8 px-6 first:pt-0 last:pb-0 hover:bg-slate-50/50 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">{req.user_name}</h4>
                      <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">{req.health_id}</p>
                      {req.area && (
                        <p className="text-xs text-gray-500 font-medium">Area: {req.area}</p>
                      )}
                      {req.request_note && (
                        <p className="text-xs text-gray-600 italic">{req.request_note}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onApproveRequest(req.id)}
                        className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-emerald-800 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => onRejectRequest(req)}
                        className="px-6 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition-all cursor-pointer flex items-center gap-2 border border-red-200"
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-gray-500 mt-2">
                    Requested: {new Date(req.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        </section>
      )}
    </div>
  );
};

export default VerificationSecurityTab;
