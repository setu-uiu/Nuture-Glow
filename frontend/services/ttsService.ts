
export type TTSLang = "en" | "bn";

let voicesCache: SpeechSynthesisVoice[] = [];

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;

    const pick = () => {
      const v = synth.getVoices();
      if (v && v.length) {
        voicesCache = v;
        resolve(v);
        return true;
      }
      return false;
    };

    if (pick()) return;

    const onChange = () => {
      if (pick()) synth.removeEventListener("voiceschanged", onChange);
    };
    synth.addEventListener("voiceschanged", onChange);

    let tries = 0;
    const t = setInterval(() => {
      tries++;
      if (pick() || tries > 20) {
        clearInterval(t);
        synth.removeEventListener("voiceschanged", onChange);
        resolve(synth.getVoices() || []);
      }
    }, 150);
  });
}

function pickVoice(lang: TTSLang, voices: SpeechSynthesisVoice[]) {
  if (lang === "bn") {
    return (
      voices.find(v => /bn|bangla|bengali/i.test(v.lang + " " + v.name)) ||
      voices.find(v => /hi|ur/i.test(v.lang)) || 
      voices[0]
    );
  }
  return (
    voices.find(v => /^en/i.test(v.lang)) ||
    voices.find(v => /english/i.test(v.name)) ||
    voices[0]
  );
}

export async function speakTextNative(text: string, lang: TTSLang) {
  if (!("speechSynthesis" in window)) {
    throw new Error("Speech Synthesis not supported.");
  }

  const synth = window.speechSynthesis;
  synth.cancel();

  const voices = voicesCache.length ? voicesCache : await loadVoices();
  const utter = new SpeechSynthesisUtterance(text);

  utter.lang = lang === "bn" ? "bn-BD" : "en-US";
  utter.voice = pickVoice(lang, voices) || null;
  utter.rate = 1;
  utter.pitch = 1;
  utter.volume = 1;

  try { synth.resume(); } catch {}

  await new Promise<void>((resolve) => setTimeout(resolve, 60));

  return new Promise<void>((resolve, reject) => {
    utter.onend = () => resolve();
    utter.onerror = (e) => reject(e);
    synth.speak(utter);
  });
}

/**
 * Decodes raw PCM audio from Gemini API
 */
export async function playPcmAudio(base64Data: string, sampleRate: number = 24000) {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  
  const dataInt16 = new Int16Array(bytes.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
  
  return new Promise<void>((resolve) => {
    source.onended = () => {
      ctx.close();
      resolve();
    };
  });
}
