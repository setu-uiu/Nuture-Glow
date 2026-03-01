import React, { useState } from 'react';
import { Plus, Trash2, Save, FileText, X } from 'lucide-react';
import { DoctorDashboardService } from '../../../services/dashboardService';
import type { Prescription, Medication } from '../../../types/dashboard';

interface PrescriptionWriterProps {
  consultationId: string;
  patientId: string;
  patientName: string;
  onClose: () => void;
  onSave?: (prescription: Prescription) => void;
}

const PrescriptionWriter: React.FC<PrescriptionWriterProps> = ({
  consultationId,
  patientId,
  patientName,
  onClose,
  onSave
}) => {
  const [medications, setMedications] = useState<Medication[]>([{
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  }]);
  const [instructions, setInstructions] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddMedication = () => {
    setMedications([...medications, {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }]);
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleUpdateMedication = (index: number, field: keyof Medication, value: string) => {
    setMedications(medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    ));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const prescription = await DoctorDashboardService.createPrescription(consultationId, {
        patientId,
        medications: medications.filter(m => m.name.trim() !== ''),
        instructions,
        followUpDate: followUpDate || undefined,
        locale: 'en'
      });
      onSave?.(prescription);
      onClose();
    } catch (error) {
      console.error('Failed to save prescription:', error);
      alert('Failed to save prescription');
    } finally {
      setSaving(false);
    }
  };

  const isValid = medications.some(m => m.name.trim() !== '') && instructions.trim() !== '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Write Prescription</h2>
                <p className="text-white/90 text-sm mt-1">For {patientName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Medications */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Medications</h3>
              <button
                onClick={handleAddMedication}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-all"
              >
                <Plus size={18} />
                Add Medicine
              </button>
            </div>

            <div className="space-y-4">
              {medications.map((med, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-200/40"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-bold text-teal-600">Medicine #{index + 1}</span>
                    {medications.length > 1 && (
                      <button
                        onClick={() => handleRemoveMedication(index)}
                        className="text-red-500 hover:text-red-700 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Medicine Name */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Medicine Name *
                      </label>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => handleUpdateMedication(index, 'name', e.target.value)}
                        placeholder="e.g., Folic Acid"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200/40 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      />
                    </div>

                    {/* Dosage */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Dosage *
                      </label>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleUpdateMedication(index, 'dosage', e.target.value)}
                        placeholder="e.g., 5mg"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200/40 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      />
                    </div>

                    {/* Frequency */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Frequency *
                      </label>
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => handleUpdateMedication(index, 'frequency', e.target.value)}
                        placeholder="e.g., Once daily"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200/40 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      />
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Duration *
                      </label>
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => handleUpdateMedication(index, 'duration', e.target.value)}
                        placeholder="e.g., 30 days"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200/40 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      />
                    </div>

                    {/* Instructions */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Instructions
                      </label>
                      <input
                        type="text"
                        value={med.instructions}
                        onChange={(e) => handleUpdateMedication(index, 'instructions', e.target.value)}
                        placeholder="e.g., Take with food"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200/40 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Instructions */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              General Instructions *
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Enter general instructions for the patient..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200/40 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none"
            />
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Follow-up Date (Optional)
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200/40 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {medications.filter(m => m.name.trim() !== '').length} medicine(s) added
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isValid || saving}
                className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Prescription'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionWriter;
