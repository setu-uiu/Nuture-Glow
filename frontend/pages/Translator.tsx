import React, { useState } from 'react';
import { Languages, ArrowRightLeft, Send, RefreshCw, Copy, Check, Volume2, Activity, AlertCircle, Search } from 'lucide-react';
import { translateOffline } from '../services/phrases';

const Translator: React.FC = () => {
  const [text, setText] = useState('');
  const [translated, setTranslated] = useState('');
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState<'en-bn' | 'bn-en'>('en-bn');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const [ttsToast, setTtsToast] = useState<string | null>(null);

  const handleTranslate = (inputText: string = text) => {
    const cleanText = inputText.trim();
    if (!cleanText) {
      setTranslated('');
      setError(false);
      return;
    }
    
    setLoading(true);
    setError(false);
    
    // Artificial delay to mimic AI feel
    setTimeout(() => {
      const result = translateOffline(cleanText, direction);
      if (result) {
        setTranslated(result);
        setError(false);
      } else {
        setTranslated('');
        setError(true);
      }
      setLoading(false);
    }, 400);
  };

  const handleSpeak = () => {
    if (!translated || !window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(translated);

    // Auto-detect language from translated output
    const isBangla = /[\u0980-\u09FF]/.test(translated);
    utterance.lang = isBangla ? "bn-BD" : "en-US";

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v =>
      isBangla
        ? v.lang.startsWith("bn")
        : v.lang.startsWith("en")
    );

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    } else if (isBangla) {
      setTtsToast("Bangla voice not supported on this browser");
      setTimeout(() => setTtsToast(null), 3000);
      return;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = () => {
    if (!translated) return;
    navigator.clipboard.writeText(translated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickSymptoms = [
    { en: "Fever", bn: "জ্বর" },
    { en: "Cough", bn: "কাশি" },
    { en: "Headache", bn: "মাথাব্যথা" },
    { en: "Nausea", bn: "বমি বমি ভাব" }
  ];

  const handleQuickSymptom = (s: { en: string, bn: string }) => {
    const selectedText = direction === 'en-bn' ? s.en : s.bn;
    setText(selectedText);
    handleTranslate(selectedText);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-12 animate-in fade-in duration-500 pb-20">
      {/* Speaker Logic Toast */}
      {ttsToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-full bg-[#E6C77A] text-teal-900 shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <AlertCircle size={18}/>
          <span className="text-sm font-bold">{ttsToast}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Languages className="text-[#E6C77A]"/> AI Health Translator
          </h1>
          <p className="text-gray-500">Seamlessly translate symptoms between English and Bangla (Offline).</p>
        </div>
        <button 
          onClick={() => {
            setDirection(d => d === 'en-bn' ? 'bn-en' : 'en-bn');
            setTranslated('');
            setError(false);
            setText('');
          }}
          className="flex items-center gap-4 px-8 py-4 bg-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-sm border border-gray-100 hover:border-teal-500 transition-all active:scale-95"
        >
          {direction === 'en-bn' ? 'English' : 'Bengali'}
          <ArrowRightLeft className="text-teal-500" />
          {direction === 'en-bn' ? 'Bengali' : 'English'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-6">
            <div className="relative">
              <textarea 
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={direction === 'en-bn' ? "Type a symptom or common medical phrase..." : "আপনার শারীরিক সমস্যার কথা বাংলায় লিখুন..."}
                className="w-full h-64 p-8 bg-[#F7F5EF] rounded-[40px] outline-none border-2 border-transparent focus:bg-white focus:border-[#BFE6DA] focus:ring-4 focus:ring-[#BFE6DA]/10 transition-all text-lg font-medium resize-none shadow-inner"
              />
              {text && (
                <button 
                  onClick={() => { setText(''); setTranslated(''); setError(false); }}
                  className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={() => handleTranslate()}
                disabled={loading || !text.trim()}
                className="w-full py-5 bg-teal-600 text-white rounded-[32px] font-bold shadow-xl shadow-teal-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="animate-spin" size={24}/> : <><Send size={20}/> Translate</>}
              </button>
              
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 leading-relaxed font-medium">
                    Offline translator supports health symptoms and common medical phrases only. 
                    Try: <strong>fever, cough, sore throat, runny nose, pregnancy cramps...</strong>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-2 ml-4">
                <Activity size={16} className="text-[#E6C77A]" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Common Symptoms</p>
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickSymptoms.map(s => (
                  <button 
                    key={s.en} 
                    onClick={() => handleQuickSymptom(s)}
                    className="px-4 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-bold text-gray-500 hover:border-[#BFE6DA] hover:text-teal-600 transition-all text-center capitalize shadow-sm active:scale-95"
                  >
                    {direction === 'en-bn' ? s.en : s.bn}
                  </button>
                ))}
             </div>
          </div>
        </div>

        <div className={`bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 flex flex-col ${!translated && !error && 'justify-center items-center opacity-30'}`}>
          {translated ? (
            <div className="h-full flex flex-col animate-in fade-in duration-700">
               <div className="flex-1 p-8 bg-[#F7F5EF] rounded-[40px] mb-6 shadow-inner border-2 border-transparent hover:border-[#BFE6DA]/20 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full">Output Result</span>
                  </div>
                  <p className="text-2xl font-bold text-teal-900 leading-relaxed">{translated}</p>
               </div>
               <div className="flex justify-between items-center px-4">
                  <div className="flex gap-2">
                     <button 
                      onClick={handleSpeak}
                      className="p-4 bg-gray-50 text-gray-400 hover:text-teal-600 rounded-2xl hover:bg-teal-50 transition-all active:scale-90"
                      title="Listen"
                     >
                       <Volume2 size={24}/>
                     </button>
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-8 py-4 bg-teal-50 text-teal-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-teal-100 transition-all active:scale-95"
                  >
                    {copied ? <><Check size={16}/> Copied</> : <><Copy size={16}/> Copy Result</>}
                  </button>
               </div>
            </div>
          ) : error ? (
            <div className="text-center space-y-4 animate-in fade-in">
               <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-400">
                  <Search size={48}/>
               </div>
               <p className="text-lg font-bold text-gray-400">No offline translation found</p>
               <p className="text-sm text-gray-300 max-w-xs mx-auto">This tool is designed for strict clinical terms only to ensure accuracy.</p>
            </div>
          ) : (
            <div className="text-center space-y-4">
               <div className="w-20 h-20 bg-[#F7F5EF] rounded-[32px] flex items-center justify-center mx-auto text-gray-300">
                  <Languages size={40}/>
               </div>
               <p className="text-lg font-bold text-gray-300">Translation will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Translator;