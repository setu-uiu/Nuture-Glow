
import React, { useState } from 'react';
import { 
  Zap, 
  Search, 
  ShieldCheck, 
  HelpCircle, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Stethoscope, 
  Copy, 
  Check, 
  X 
} from 'lucide-react';
import { useTranslations } from '../i18n/I18nContext';
import { apiFetch } from '../services/api';

// Types kept compatible with the original mythEngine
type Verdict = "True" | "False" | "Mixed" | "Depends";

interface MythResult {
  claim: string;
  verdict: Verdict;
  explanation: string;
  safeAdvice: string[];
  whenToCallDoctor: string[];
  sourcesLabel: string;
}

const verdictColors: Record<Verdict, { bg: string, text: string, icon: any }> = {
  "True": { bg: "bg-green-500", text: "text-green-700", icon: CheckCircle2 },
  "False": { bg: "bg-red-500", text: "text-red-700", icon: AlertTriangle },
  "Mixed": { bg: "bg-orange-500", text: "text-orange-700", icon: Info },
  "Depends": { bg: "bg-blue-500", text: "text-blue-700", icon: HelpCircle }
};

const Myths: React.FC = () => {
  const { t } = useTranslations();
  const [statement, setStatement] = useState('');
  const [result, setResult] = useState<MythResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCheck = async () => {
    if (!statement.trim()) return;
    setLoading(true);
    
    try {
      // SQL: Call backend API which queries pregnancy_myths table
      const data = await apiFetch<{
        status: string;
        explanation: string;
        claim?: string;
        safeAdvice?: string;
        whenToCallDoctor?: string;
        sourcesLabel?: string;
      }>('/api/ai/check-myth', {
        method: 'POST',
        body: JSON.stringify({ statement, locale: 'en' })
      });

      // Map API response to MythResult format
      const verdict: Verdict = data.status === 'Myth' ? 'False' 
        : data.status === 'True' ? 'True'
        : data.status === 'Mixed' ? 'Mixed'
        : data.status === 'Depends' ? 'Depends'
        : 'Mixed';

      setResult({
        claim: data.claim || statement,
        verdict,
        explanation: data.explanation || 'No explanation available.',
        safeAdvice: data.safeAdvice ? (typeof data.safeAdvice === 'string' ? [data.safeAdvice] : data.safeAdvice) : ['Consult your healthcare provider for personalized advice.'],
        whenToCallDoctor: data.whenToCallDoctor ? (typeof data.whenToCallDoctor === 'string' ? [data.whenToCallDoctor] : data.whenToCallDoctor) : ['If you experience any concerning symptoms.'],
        sourcesLabel: data.sourcesLabel || 'Medical Database'
      });
    } catch (err) {
      console.error('Myth check API error:', err);
      setResult({
        claim: statement,
        verdict: 'Mixed',
        explanation: 'Unable to verify this claim at the moment. Please try again.',
        safeAdvice: ['Consult your healthcare provider.'],
        whenToCallDoctor: ['If you have any urgent concerns.'],
        sourcesLabel: 'Offline'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStatement('');
    setResult(null);
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `Myth Check: ${statement}\nVerdict: ${result.verdict}\nExplanation: ${result.explanation}\nSource: ${result.sourcesLabel}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-12 animate-in fade-in duration-500 pb-24">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-[#E6C77A]/20 text-[#D4B56A] rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
          <Zap size={40} />
        </div>
        <h1 className="text-4xl font-serif font-bold text-gray-900 tracking-tight">Health Myth Buster</h1>
        <p className="text-xl text-gray-400 font-light max-w-lg mx-auto leading-relaxed">
          Instant, offline verification of common health claims and Old Wives' tales.
        </p>
      </div>

      <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-8 relative overflow-hidden">
        <div className="space-y-4 relative z-10">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-6">Statement to verify</label>
          <div className="relative group">
            <textarea 
              value={statement}
              onChange={e => setStatement(e.target.value)}
              placeholder={t('ai.mythPaste')}
              className="w-full h-40 p-8 bg-[#F7F5EF] rounded-[40px] outline-none border-2 border-transparent focus:bg-white focus:border-[#BFE6DA] focus:ring-8 focus:ring-[#BFE6DA]/5 transition-all text-lg font-medium shadow-inner resize-none"
            />
            {statement && (
              <button 
                onClick={() => setStatement('')}
                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleCheck}
            disabled={loading || !statement.trim()}
            className="flex-1 py-6 bg-[#E6C77A] text-white rounded-[32px] font-bold shadow-2xl shadow-[#E6C77A]/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin" size={24}/> : <><Sparkles size={24}/> {t('ai.mythCheck')}</>}
          </button>
          
          {result && (
            <button 
              onClick={handleReset}
              className="px-8 py-6 bg-gray-50 text-gray-400 rounded-[32px] font-bold hover:bg-gray-100 transition-all active:scale-95"
            >
              Reset
            </button>
          )}
        </div>

        {result && !loading && (
          <div className="space-y-8 animate-in slide-in-from-top-6 duration-500">
            {/* Main Result Card */}
            <div className={`p-10 rounded-[48px] border-2 space-y-6 ${result.verdict === 'True' ? 'bg-green-50 border-green-100' : result.verdict === 'False' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${verdictColors[result.verdict].bg}`}>
                       {React.createElement(verdictColors[result.verdict].icon, { size: 32 })}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{result.verdict}!</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Expert Analysis Result</p>
                    </div>
                 </div>
                 <button 
                  onClick={handleCopy}
                  className="p-3 bg-white rounded-2xl text-gray-400 hover:text-teal-600 shadow-sm transition-all active:scale-90"
                  title="Copy result"
                 >
                   {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                 </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed text-lg font-medium">"{result.explanation}"</p>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-widest">
                  <ShieldCheck size={14}/> {result.sourcesLabel}
                </div>
              </div>
            </div>

            {/* Advice Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-teal-50/50 p-8 rounded-[40px] border border-teal-100/50 space-y-4">
                <div className="flex items-center gap-3 text-teal-700 font-bold uppercase tracking-widest text-xs">
                  <ShieldCheck size={18} /> Safe Advice
                </div>
                <ul className="space-y-3">
                  {result.safeAdvice.map((advice, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                      <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-1.5 shrink-0" />
                      {advice}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-orange-50/50 p-8 rounded-[40px] border border-orange-100/50 space-y-4">
                <div className="flex items-center gap-3 text-orange-700 font-bold uppercase tracking-widest text-xs">
                  <Stethoscope size={18} /> Clinical Warning
                </div>
                <ul className="space-y-3">
                  {result.whenToCallDoctor.map((warning, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 shrink-0" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-gray-50 text-center">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <Info size={12} /> General guidance, not a diagnosis. For urgent symptoms contact clinical services.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { q: "Can I drink coffee?", a: "Moderate amounts (200mg/day) are usually considered safe." },
          { q: "Is spicy food dangerous?", a: "Safe for baby, but might cause you severe heartburn." }
        ].map((item, i) => (
          <div 
            key={i} 
            onClick={() => setStatement(item.q)}
            className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex gap-6 hover:border-[#BFE6DA] cursor-pointer transition-all hover:translate-y-[-4px] group"
          >
            <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shrink-0 group-hover:scale-110 transition-transform">
              <HelpCircle size={24}/>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">{item.q}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Click to analyze instantly.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Myths;
