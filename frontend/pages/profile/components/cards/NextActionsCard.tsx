import React from 'react';
import { CheckCircle2, AlertCircle, Phone } from 'lucide-react';

interface NextActionsCardProps {
  medical: any;
  emergencyContact: any;
  healthIdStatus: string;
  hasVisits: boolean;
  hasDocs: boolean;
  onEditEmergencyContact: () => void;
}

const NextActionsCard: React.FC<NextActionsCardProps> = ({
  medical,
  emergencyContact,
  healthIdStatus,
  hasVisits,
  hasDocs,
  onEditEmergencyContact
}) => {
  const actions = [];

  if (!medical.bloodGroup) {
    actions.push({ text: 'Add blood group', type: 'medical' });
  }
  if (!emergencyContact.name) {
    actions.push({ text: 'Add emergency contact', type: 'contact', action: onEditEmergencyContact });
  }
  if (healthIdStatus === 'unverified' || healthIdStatus === 'rejected') {
    actions.push({ text: 'Request verification', type: 'verification' });
  }
  if (!hasVisits && !hasDocs) {
    actions.push({ text: 'Upload documents or log a visit', type: 'content' });
  }

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-amber-100 to-[#E6C77A]/40 rounded-2xl text-amber-600">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">Next Actions</h3>
      </div>

      {actions.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle2 size={48} className="mx-auto text-teal-500 mb-3" />
          <p className="text-sm font-bold text-gray-600">All set!</p>
          <p className="text-xs text-gray-500 mt-1">Your profile is complete</p>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.action}
              className="w-full p-4 bg-gradient-to-r from-amber-50 to-[#F7F5EF] rounded-2xl border border-amber-100 hover:border-amber-200 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg text-amber-600 group-hover:bg-amber-50">
                  <AlertCircle size={16} />
                </div>
                <p className="text-sm font-bold text-gray-700 group-hover:text-amber-700 transition-colors">
                  {action.text}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NextActionsCard;
