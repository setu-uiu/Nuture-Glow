
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  BrainCircuit, Send, Sparkles, MapPin, 
  MessageSquare, History, Globe, ExternalLink, Mic, X, Volume2
} from 'lucide-react';
import { useTranslations } from '../i18n/I18nContext';
import { AIService, RiskLevel } from '../services/aiService';
import { LiveAssistant } from '../components/ai/LiveAssistant';
import { speakTextNative, playPcmAudio } from '../services/ttsService';

type ChatEntry = {
  role: 'user' | 'bot';
  text: string;
  sources?: any[];
  modelUsed?: string;
  intent?: string;
  riskLevel?: RiskLevel;
};

export const Assistant: React.FC = () => {
  const { t, locale } = useTranslations();
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState<ChatEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [includeContext] = useState(true);
  const [showLive, setShowLive] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, loading]);

  const handleSend = async () => {
    if(!msg.trim()) return;
    const userMsg = msg;
    setMsg('');
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await AIService.chatAssistant(userMsg, locale, includeContext);
      setChat(prev => [
        ...prev,
        {
          role: 'bot',
          text: response.text,
          sources: response.sources,
          modelUsed: response.model_used,
          intent: response.intent,
          riskLevel: response.risk_level
        }
      ]);
    } catch (error) {
      setChat(prev => [...prev, { role: 'bot', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async (text: string, index: number) => {
    if (speakingIdx !== null) return;
    setSpeakingIdx(index);
    try {
      const audioBase64 = await AIService.generateSpeech(text, locale);
      await playPcmAudio(audioBase64);
    } catch (err) {
      await speakTextNative(text, locale);
    } finally {
      setSpeakingIdx(null);
    }
  };

  const formatModelLabel = (model?: string) => {
    switch (model) {
      case 'gpt4':
        return 'GPT-4';
      case 'biogpt':
        return 'BioGPT';
      case 'risk-predictor':
        return 'Risk Predictor';
      case 'ollama':
        return 'Ollama';
      case 'fallback':
        return 'Fallback';
      default:
        return model ? model.toUpperCase() : '';
    }
  };

  const formatIntentLabel = (intent?: string) => {
    if (!intent) return '';
    return intent.replace('-', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatRiskLabel = (risk?: RiskLevel) => {
    if (!risk) return '';
    if (locale === 'bn') {
      const labels = { low: 'à¦•à¦®', medium: 'à¦®à¦¾à¦à¦¾à¦°à¦¿', high: 'à¦‰à¦šà§à¦š' } as const;
      return labels[risk] || risk;
    }
    return risk.charAt(0).toUpperCase() + risk.slice(1);
  };

  const riskBadgeClass = (risk?: RiskLevel) => {
    if (risk === 'high') return 'bg-rose-100 text-rose-700 border-rose-200';
    if (risk === 'medium') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (risk === 'low') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-[40px] shadow-lg border border-gray-100 overflow-hidden mb-8 p-8 flex flex-col">
      {showLive && <LiveAssistant onClose={() => setShowLive(false)} />}
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#BFE6DA] text-teal-800 rounded-xl"><BrainCircuit size={24}/></div>
          <div className="space-y-1">
            <h2 className="font-bold text-gray-800 text-lg">{t('ai.askAssistant')}</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-[11px] text-gray-500 font-medium tracking-wide">AI Care Expert Active</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
          {/* Voice button hidden - use text chat instead which is more reliable */}
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-teal-600 text-white shadow-md">
            <MessageSquare size={14}/> {t('ai.contextAware')}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="mt-8 mb-8">
        <div className="h-64 w-full bg-gradient-to-b from-[#FAFAFC]/30 to-[#F7F5EF]/20 rounded-[24px] border border-gray-100 overflow-hidden">
        <div className="h-full overflow-hidden px-6 py-5 space-y-5">
          {chat.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 py-8">
              <div className="w-20 h-20 bg-white rounded-[28px] shadow-md flex items-center justify-center text-[#E6C77A]">
                <Sparkles size={40} className="animate-pulse"/>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-bold text-gray-800">Hello, I'm your Nurture Glow AI.</p>
                <p className="text-sm text-gray-600 leading-relaxed">I can help with health logs, symptom analysis, and finding nearby hospitals. How can I assist you today?</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-4 w-full">
                {["Common symptoms in Week 24?", "Nearby Gynaecologists", "Summarize my journal", "Vaccine schedule help"].map(q => (
                  <button 
                    key={q} 
                    onClick={() => { setMsg(q); }}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-medium text-gray-600 hover:border-[#BFE6DA] hover:text-teal-700 hover:shadow-sm transition-all text-left active:scale-95"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {chat.map((c, i) => (
            <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[75%] p-4 rounded-[24px] shadow-sm space-y-3 relative group ${c.role === 'user' ? 'bg-teal-600 text-white rounded-tr-lg' : 'bg-white text-gray-800 rounded-tl-lg border border-gray-100'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{c.text}</p>

                {c.role === 'bot' && (c.modelUsed || c.intent || c.riskLevel) && (
                  <div className="flex flex-wrap gap-2 text-[10px] font-semibold">
                    {c.modelUsed && (
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                        Model: {formatModelLabel(c.modelUsed)}
                      </span>
                    )}
                    {c.intent && (
                      <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        Intent: {formatIntentLabel(c.intent)}
                      </span>
                    )}
                    {c.riskLevel && (
                      <span className={`px-2 py-1 rounded-full border ${riskBadgeClass(c.riskLevel)}`}>
                        Risk: {formatRiskLabel(c.riskLevel)}
                      </span>
                    )}
                  </div>
                )}
                
                {c.role === 'bot' && (
                  <button 
                    onClick={() => handleSpeak(c.text, i)}
                    className={`absolute -right-12 top-0 p-2 rounded-xl transition-all ${speakingIdx === i ? 'text-teal-600 scale-110' : 'text-gray-300 hover:text-teal-500 opacity-0 group-hover:opacity-100'}`}
                  >
                    <Volume2 size={20} className={speakingIdx === i ? 'animate-pulse' : ''} />
                  </button>
                )}

                {c.sources && c.sources.length > 0 && (
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified Sources:</p>
                    <div className="flex flex-wrap gap-2">
                      {c.sources.map((chunk, idx) => (
                        chunk.web && (
                          <a 
                            key={idx} 
                            href={chunk.web.uri} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 hover:bg-teal-50 text-[9px] font-bold text-teal-700 rounded-full border border-gray-100 transition-all"
                          >
                            <Globe size={10}/> {chunk.web.title || 'Source'} <ExternalLink size={8}/>
                          </a>
                        )
                      ))}
                      {c.sources.map((chunk, idx) => (
                        chunk.maps && (
                          <a 
                            key={idx} 
                            href={chunk.maps.uri} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-[9px] font-bold text-blue-700 rounded-full border border-blue-100 transition-all"
                          >
                            <MapPin size={10}/> {chunk.maps.title || 'Location'} <ExternalLink size={8}/>
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 p-5 rounded-[28px] rounded-tl-none flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="w-1 h-1 bg-teal-500 rounded-full animate-bounce"></span>
                  <span className="w-1 h-1 bg-teal-500 rounded-full animate-bounce delay-150"></span>
                  <span className="w-1 h-1 bg-teal-500 rounded-full animate-bounce delay-300"></span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Analyzing...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        </div>
      </div>

      {/* Input Section with Equal Spacing */}
      <div className="flex gap-4 relative mb-8">
        <div className="flex-1 relative">
          <input 
            value={msg} 
            onChange={e => setMsg(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleSend()} 
            placeholder={t('ai.chatPlaceholder')} 
            className="w-full bg-[#F7F5EF] border-2 border-transparent rounded-[28px] px-7 py-5 text-sm focus:bg-white focus:ring-4 focus:ring-[#BFE6DA]/20 focus:border-[#BFE6DA] transition-all outline-none shadow-inner" 
          />        </div>
        <button 
          onClick={handleSend} 
          disabled={loading || !msg.trim()} 
          className="p-5 bg-teal-600 text-white rounded-3xl hover:bg-teal-700 active:scale-95 transition-all shadow-xl shadow-teal-600/25 disabled:opacity-50 disabled:shadow-none"
        >
          <Send size={24}/>
        </button>
      </div>
    </div>
  );
};

export default Assistant;



