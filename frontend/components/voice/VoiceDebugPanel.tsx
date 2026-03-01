"use client";

import React from 'react';
import { Language } from '../../types';

interface VoiceDebugPanelProps {
  isSupported: boolean;
  isListening: boolean;
  lang: Language;
  transcript: string;
  lastIntent: string;
  error: string | null;
}

export const VoiceDebugPanel: React.FC<VoiceDebugPanelProps> = ({
  isSupported,
  isListening,
  lang,
  transcript,
  lastIntent,
  error
}) => {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-black/80 backdrop-blur-md text-white p-4 rounded-2xl text-[10px] font-mono w-64 shadow-2xl border border-white/10 pointer-events-none">
      <h4 className="text-[#E6C77A] font-bold mb-2 uppercase tracking-widest border-b border-white/10 pb-1">Voice Debug</h4>
      <div className="space-y-1">
        <p><span className="text-gray-400">Supported:</span> <span className={isSupported ? 'text-green-400' : 'text-red-400'}>{String(isSupported)}</span></p>
        <p><span className="text-gray-400">Listening:</span> <span className={isListening ? 'text-green-400 animate-pulse' : 'text-gray-400'}>{String(isListening)}</span></p>
        <p><span className="text-gray-400">Language:</span> {lang === 'bn' ? 'bn-BD' : 'en-US'}</p>
        <p><span className="text-gray-400">Secure:</span> <span className={window.isSecureContext ? 'text-green-400' : 'text-red-400'}>{String(window.isSecureContext)}</span></p>
        <p className="mt-2 border-t border-white/10 pt-1"><span className="text-[#E6C77A]">Transcript:</span></p>
        <p className="bg-white/5 p-1 rounded min-h-[1.5rem] italic text-gray-200">"{transcript || '...'}"</p>
        <p><span className="text-[#E6C77A]">Intent:</span> <span className="font-bold">{lastIntent || 'none'}</span></p>
        {error && <p className="text-red-400 mt-1 uppercase font-bold">Error: {error}</p>}
      </div>
    </div>
  );
};
