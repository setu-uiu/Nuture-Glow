"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MicOff, Sparkles, AlertCircle } from 'lucide-react';

export const LiveAssistant: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startSession = async () => {
    if (isConnecting || isActive) return;
    
    setIsConnecting(true);
    setErrorMessage(null);
    
    try {
      // For voice, we'll use browser's native speech recognition
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      
      if (!SpeechRecognition) {
        setErrorMessage('Voice recognition not supported in your browser. Please use Chrome, Edge, or Safari.');
        setIsConnecting(false);
        return;
      }

      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = 'en-US';

      recognizer.onstart = () => {
        setIsActive(true);
        setIsConnecting(false);
      };

      recognizer.onresult = async (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        
        if (transcript.trim()) {
          // Process voice command through our safe AI system
          try {
            const token = localStorage.getItem('ng_auth_token');
            if (!token) {
              setErrorMessage('Please log in first to use voice assistant');
              return;
            }

            const response = await fetch('http://localhost:4000/api/ai/chat', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify({ message: transcript, locale: 'en' })
            });
            
            if (response.ok) {
              const data = await response.json();
              // Use Web Speech API to speak the response
              const utterance = new SpeechSynthesisUtterance(data.text);
              utterance.rate = 0.9;
              utterance.pitch = 1;
              speechSynthesis.speak(utterance);
            } else {
              setErrorMessage('Failed to get response. Please try again.');
            }
          } catch (err) {
            console.error('Voice processing error:', err);
            setErrorMessage('Connection error. Please check your internet and try again.');
          }
        }
      };

      recognizer.onerror = (event: any) => {
        setErrorMessage(`Voice error: ${event.error}. Please try again.`);
        setIsActive(false);
      };

      recognizer.onend = () => {
        setIsActive(false);
      };

      recognizer.start();
    } catch (error) {
      console.error("Voice Session Error:", error);
      setErrorMessage((error as Error).message || "Failed to start voice assistant");
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setIsConnecting(false);
    onClose();
  };

  useEffect(() => {
    // Auto-start voice session when component mounts
    const timer = setTimeout(() => {
      startSession();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div 
        className="bg-white rounded-[28px] p-7 flex flex-col gap-4 shadow-2xl text-center animate-in zoom-in-95 duration-300 w-[clamp(360px,92vw,560px)] h-auto max-h-[80vh] md:max-h-[520px] overflow-y-auto relative"
      >
        {/* Close Button (X) */}
        <button
          onClick={stopSession}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 rounded-full"
          aria-label="Close voice assistant"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="relative mt-2">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto ring-8 transition-all ${isActive ? 'bg-[#BFE6DA]/20 ring-[#BFE6DA]/10' : 'bg-gray-50 ring-gray-100'}`}>
            {isActive ? (
              <div className="flex gap-1.5 items-end h-10">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1.5 bg-teal-500 rounded-full animate-bounce" 
                    style={{ animationDelay: `${i * 150}ms`, height: `${30 + Math.random() * 70}%` }}
                  />
                ))}
              </div>
            ) : isConnecting ? (
              <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <MicOff className="text-gray-300" size={48} />
            )}
          </div>
          {isActive && (
             <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full animate-pulse uppercase tracking-widest">
               Live
             </div>
          )}
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Sparkles className="text-[#E6C77A]" size={20} />
            {isConnecting ? 'Initializing...' : isActive ? 'Listening...' : 'Voice Assistant'}
          </h3>
          
          {errorMessage ? (
            <div className="mt-2 p-4 bg-red-50 rounded-2xl flex items-start gap-3 text-left">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 font-medium leading-relaxed">{errorMessage}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-1">
              {isActive 
                ? "I'm here for you. Ask me anything about your health journey." 
                : "Setting up a private, low-latency session..."}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {errorMessage ? (
            <button 
              onClick={startSession}
              className="w-full h-[52px] bg-teal-600 text-white rounded-3xl font-bold shadow-xl hover:bg-teal-700 transition-all uppercase tracking-widest text-xs flex items-center justify-center"
            >
              Retry Connection
            </button>
          ) : isActive && (
            <button 
              onClick={stopSession}
              className="w-full h-[52px] bg-red-600 text-white rounded-3xl font-bold shadow-xl shadow-red-600/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center justify-center"
            >
              End Session
            </button>
          )}
          
          {!errorMessage && !isActive && (
            <button 
              onClick={startSession}
              disabled={isConnecting}
              className="w-full h-[52px] bg-teal-600 text-white rounded-3xl font-bold shadow-xl shadow-teal-600/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center justify-center disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Start Listening'}
            </button>
          )}
          
          {!errorMessage && <p className="text-[10px] text-gray-400 font-medium">Encrypted care session.</p>}
        </div>
      </div>
    </div>
  );
};
