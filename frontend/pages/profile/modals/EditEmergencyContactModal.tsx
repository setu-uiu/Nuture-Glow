import React from 'react';
import { XCircle, Phone } from 'lucide-react';
import { useTranslations } from '../../../i18n/I18nContext';

interface EditEmergencyContactModalProps {
  emergencyContact: any;
  onChange: (contact: any) => void;
  onSave: () => void;
  onClose: () => void;
}

const EditEmergencyContactModal: React.FC<EditEmergencyContactModalProps> = ({
  emergencyContact,
  onChange,
  onSave,
  onClose
}) => {
  const { t } = useTranslations();

  return (
    <div className="fixed inset-0 z-[410] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-2xl text-red-600">
              <Phone size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Emergency Contact</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <XCircle size={28} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">
              Contact Name
            </label>
            <input
              className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none focus:ring-2 focus:ring-teal-100 font-bold"
              placeholder="e.g., John Doe"
              value={emergencyContact.name}
              onChange={(e) => onChange({ ...emergencyContact, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">
              Phone Number
            </label>
            <input
              type="tel"
              className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none focus:ring-2 focus:ring-teal-100 font-bold"
              placeholder="e.g., +1234567890"
              value={emergencyContact.phone}
              onChange={(e) => onChange({ ...emergencyContact, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">
              Relation
            </label>
            <select
              className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none focus:ring-2 focus:ring-teal-100 font-bold"
              value={emergencyContact.relation}
              onChange={(e) => onChange({ ...emergencyContact, relation: e.target.value })}
            >
              <option value="">Select a relation</option>
              <option value="Family">Family</option>
              <option value="Friend">Friend</option>
              <option value="Spouse">Spouse</option>
              <option value="Parent">Parent</option>
              <option value="Sibling">Sibling</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-teal-600/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Save Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEmergencyContactModal;
