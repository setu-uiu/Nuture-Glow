"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Language } from '../../types';
import { VOICE_INTENTS } from '../../services/voice';

interface UseVoiceCommandsProps {
  lang: Language;
  onCommand: (path: string, intent: string) => void;
}

export const useVoiceCommands = ({ lang, onCommand }: UseVoiceCommandsProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastIntent, setLastIntent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang === 'bn' ? 'bn-BD' : 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);

      if (event.results[0].isFinal) {
        handleIntent(currentTranscript.toLowerCase());
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [lang]);

  const handleIntent = useCallback((text: string) => {
    const matched = VOICE_INTENTS.find(item => 
      item.en.some(phrase => text.includes(phrase.toLowerCase())) ||
      item.bn.some(phrase => text.includes(phrase))
    );

    if (matched) {
      setLastIntent(matched.intent);
      onCommand(matched.path, matched.intent);
    } else {
      setLastIntent('unknown');
    }
  }, [onCommand]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Failed to start recognition", e);
      }
    }
  }, [isListening]);

  return {
    isListening,
    transcript,
    lastIntent,
    error,
    isSupported,
    toggleListening
  };
};
