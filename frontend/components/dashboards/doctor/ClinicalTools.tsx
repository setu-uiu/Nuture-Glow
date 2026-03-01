import React, { useMemo, useState } from 'react';
import { Activity, Calculator, Clipboard, FileText, Search, ShieldAlert } from 'lucide-react';

const ClinicalTools: React.FC = () => {
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [lmpDate, setLmpDate] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [symptomResult, setSymptomResult] = useState<string | null>(null);
  const [medA, setMedA] = useState('');
  const [medB, setMedB] = useState('');
  const [interactionResult, setInteractionResult] = useState<string | null>(null);
  const templates: Array<{ title: string; summary: string; body: string }> = [];
  const hasTemplates = templates.length > 0;

  const bmi = useMemo(() => {
    const weight = parseFloat(weightKg);
    const height = parseFloat(heightCm) / 100;
    if (!weight || !height) return null;
    return weight / (height * height);
  }, [weightKg, heightCm]);

  const bmiLabel = useMemo(() => {
    if (!bmi) return '';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'High';
  }, [bmi]);

  const dueDate = useMemo(() => {
    if (!lmpDate) return '';
    const base = new Date(lmpDate);
    base.setDate(base.getDate() + 280);
    return base.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [lmpDate]);

  const gestationalAge = useMemo(() => {
    if (!lmpDate) return '';
    const diff = Date.now() - new Date(lmpDate).getTime();
    const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    const weeks = Math.floor(days / 7);
    const extraDays = days % 7;
    return `${weeks}w ${extraDays}d`;
  }, [lmpDate]);


  const handleSymptomAnalyze = () => {
    const text = symptoms.toLowerCase();
    if (!text.trim()) {
      setSymptomResult(null);
      return;
    }
    if (text.includes('bleeding') || text.includes('severe') || text.includes('faint')) {
      setSymptomResult('High priority: escalate to emergency protocol and verify vitals immediately.');
      return;
    }
    if (text.includes('headache') || text.includes('swelling')) {
      setSymptomResult('Moderate risk: monitor blood pressure and schedule follow-up within 24 hours.');
      return;
    }
    setSymptomResult('Low risk: provide reassurance and share home-care guidance.');
  };

  const handleInteractionCheck = () => {
    const a = medA.toLowerCase();
    const b = medB.toLowerCase();
    if (!a || !b) {
      setInteractionResult(null);
      return;
    }
    if ((a.includes('aspirin') && b.includes('warfarin')) || (a.includes('ibuprofen') && b.includes('heparin'))) {
      setInteractionResult('Potential interaction: increased bleeding risk. Review alternatives.');
      return;
    }
    if (a.includes(b) || b.includes(a)) {
      setInteractionResult('Duplicate therapy detected. Consider consolidating.');
      return;
    }
    setInteractionResult('No high-risk interactions detected. Continue standard monitoring.');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-b from-white/90 via-white/80 to-white/70 rounded-3xl border border-gray-200/50 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="text-emerald-600" />
            <h3 className="text-xl font-bold text-gray-900">Medical Calculators</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/40">
              <p className="text-xs uppercase tracking-widest text-emerald-600 mb-2">BMI</p>
              <div className="space-y-2">
                <input
                  value={weightKg}
                  onChange={(event) => setWeightKg(event.target.value)}
                  placeholder="Weight (kg)"
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white text-sm"
                />
                <input
                  value={heightCm}
                  onChange={(event) => setHeightCm(event.target.value)}
                  placeholder="Height (cm)"
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white text-sm"
                />
                <div className="text-sm text-emerald-700 font-semibold">
                  {bmi ? `${bmi.toFixed(1)} - ${bmiLabel}` : 'Enter vitals'}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/40">
              <p className="text-xs uppercase tracking-widest text-blue-600 mb-2">Due Date</p>
              <input
                type="date"
                value={lmpDate}
                onChange={(event) => setLmpDate(event.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-white text-sm"
              />
              <p className="mt-3 text-sm font-semibold text-blue-700">
                {dueDate || 'Select LMP date'}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/40">
              <p className="text-xs uppercase tracking-widest text-amber-600 mb-2">Gestational Age</p>
              <div className="text-sm text-gray-600">Based on LMP</div>
              <p className="mt-3 text-lg font-semibold text-amber-700">{gestationalAge || '--'}</p>
              <p className="text-xs text-gray-500 mt-2">Update LMP to refresh.</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 via-white to-white rounded-3xl border border-emerald-100/70 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Clipboard className="text-emerald-600" />
            <h3 className="text-lg font-bold text-gray-900">Clinical Templates</h3>
          </div>
          {hasTemplates ? (
            <>
              <div className="space-y-3">
                {templates.map((template) => (
                  <div key={template.title} className="w-full text-left p-3 rounded-2xl border border-gray-200 bg-white">
                    <p className="font-semibold text-gray-900">{template.title}</p>
                    <p className="text-xs text-gray-500">{template.summary}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 rounded-2xl bg-white border border-emerald-100">
                <p className="text-xs uppercase tracking-widest text-emerald-600">Template Preview</p>
                <p className="text-sm text-gray-700 mt-2">{templates[0].body}</p>
              </div>
            </>
          ) : (
            <div className="p-4 rounded-2xl border border-emerald-100 bg-white text-sm text-gray-600">
              No templates configured yet.
            </div>
          )}
        </div>
      </div>

      {/* Symptom + Interaction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-b from-white/90 via-white/80 to-white/70 rounded-3xl border border-gray-200/50 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Search className="text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">Symptom Checker</h3>
          </div>
          <textarea
            value={symptoms}
            onChange={(event) => setSymptoms(event.target.value)}
            rows={4}
            placeholder="Describe symptoms (e.g. headache, dizziness, swelling)..."
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSymptomAnalyze}
            className="mt-3 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all"
          >
            Analyze Symptoms
          </button>
          {symptomResult && (
            <div className="mt-4 p-4 rounded-2xl border border-purple-100 bg-purple-50/50 text-sm text-purple-700 flex gap-3">
              <ShieldAlert size={18} />
              <p>{symptomResult}</p>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-3">
            AI guidance is assistive only. Always validate with clinical judgment.
          </p>
        </div>

        <div className="bg-gradient-to-b from-white/90 via-white/80 to-white/70 rounded-3xl border border-gray-200/50 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Drug Interaction Checker</h3>
          </div>
          <div className="space-y-3">
            <input
              value={medA}
              onChange={(event) => setMedA(event.target.value)}
              placeholder="Medication A"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
            />
            <input
              value={medB}
              onChange={(event) => setMedB(event.target.value)}
              placeholder="Medication B"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
            />
            <button
              onClick={handleInteractionCheck}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all"
            >
              Check Interactions
            </button>
            {interactionResult && (
              <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/60 text-sm text-blue-700 flex gap-3">
                <FileText size={18} />
                <p>{interactionResult}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalTools;
