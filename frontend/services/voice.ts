import { Language } from '../types';

export interface VoiceIntent {
  intent: string;
  en: string[];
  bn: string[];
  path: string;
}

export const VOICE_INTENTS: VoiceIntent[] = [
  { intent: 'dashboard', en: ['dashboard', 'home', 'main page', 'open dashboard'], bn: ['ড্যাশবোর্ড', 'হোম', 'মূল পাতা'], path: '/dashboard' },
  { intent: 'assistant', en: ['assistant', 'ask ai', 'chat', 'help'], bn: ['সহকারী', 'এআই', 'চ্যাট', 'সাহায্য'], path: '/assistant' },
  { intent: 'profile', en: ['profile', 'my profile', 'account', 'settings'], bn: ['প্রোফাইল', 'আমার প্রোফাইল', 'অ্যাকাউন্ট', 'সেটিংস'], path: '/profile' },
  { intent: 'appointments', en: ['appointment', 'doctor', 'book', 'appointments'], bn: ['অ্যাপয়েন্টমেন্ট', 'ডাক্তার', 'বুক'], path: '/appointments' },
  { intent: 'vaccines', en: ['vaccine', 'vaccines', 'tracker', 'immunization'], bn: ['ভ্যাকসিন', 'টিকা', 'ট্র্যাকার'], path: '/vaccines' },
  { intent: 'nutrition', en: ['nutrition', 'food', 'diet', 'eat'], bn: ['পুষ্টি', 'খাবার', 'ডায়েট'], path: '/nutrition' },
  { intent: 'pregnancy', en: ['pregnancy', 'baby growth', 'week'], bn: ['গর্ভাবস্থা', 'শিশুর বৃদ্ধি', 'সপ্তাহ'], path: '/pregnancy' },
  { intent: 'journal', en: ['journal', 'diary', 'log', 'write'], bn: ['জার্নাল', 'ডায়েরি', 'লগ', 'লিখুন'], path: '/journal' },
  { intent: 'community', en: ['community', 'forum', 'mothers', 'group'], bn: ['কমিউনিটি', 'ফোরাম', 'মা'], path: '/community' },
  { intent: 'emergency', en: ['emergency', 'hospital', 'ambulance', 'urgent'], bn: ['জরুরি', 'হাসপাতাল', 'অ্যাম্বুলেন্স', 'জরুরী'], path: '/hospitals' },
  { intent: 'pharmacy', en: ['pharmacy', 'medicine', 'buy', 'order'], bn: ['ফার্মেসি', 'ওষুধ', 'কিনুন', 'অর্ডার'], path: '/pharmacy' },
  { intent: 'donors', en: ['blood', 'donor', 'donors'], bn: ['রক্ত', 'রক্তদাতা'], path: '/donors' },
  { intent: 'myths', en: ['myth', 'myths', 'fact', 'truth'], bn: ['ভ্রান্ত ধারণা', 'সত্যি'], path: '/myths' },
];
