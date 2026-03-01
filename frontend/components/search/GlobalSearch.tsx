"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, LayoutDashboard, Calendar, Syringe, Apple, Baby, 
  BookOpen, Users, Droplet, Zap, Hospital, 
  ShoppingBag, User, Languages, BrainCircuit, X, Command, RefreshCw
} from 'lucide-react';
import { useTranslations } from '../../i18n/I18nContext';

interface SearchItem {
  label: string;
  keywords: string[];
  href: string;
  icon: React.ReactNode;
  category: 'Navigation' | 'Health' | 'Tools';
}

const SEARCH_ITEMS: SearchItem[] = [
  { label: 'Dashboard', keywords: ['dashboard', 'home', 'main page', 'ড্যাশবোর্ড', 'হোম', 'মূল পাতা'], href: '/dashboard', icon: <LayoutDashboard size={18} />, category: 'Navigation' },
  { label: 'Appointments', keywords: ['appointments', 'doctor', 'book visit', 'booking', 'অ্যাপয়েন্টমেন্ট', 'ডাক্তার', 'বুক'], href: '/appointments', icon: <Calendar size={18} />, category: 'Health' },
  { label: 'Vaccine Tracker', keywords: ['vaccines', 'tracker', 'immunization', 'ভ্যাকসিন', 'টিকা', 'ট্র্যাকার'], href: '/vaccines', icon: <Syringe size={18} />, category: 'Health' },
  { label: 'Nutrition', keywords: ['nutrition', 'food', 'diet', 'eat', 'নিউট্রিশন', 'পুষ্টি', 'খাবার', 'ডায়েট'], href: '/nutrition', icon: <Apple size={18} />, category: 'Health' },
  { label: 'Pregnancy Tracker', keywords: ['pregnancy', 'baby growth', 'week', 'প্রেগনেন্সি', 'গর্ভাবস্থা', 'শিশুর বৃদ্ধি'], href: '/pregnancy', icon: <Baby size={18} />, category: 'Health' },
  { label: 'Journal', keywords: ['journal', 'diary', 'log', 'write', 'জার্নাল', 'ডায়েরি', 'লগ', 'লিখুন'], href: '/journal', icon: <BookOpen size={18} />, category: 'Tools' },
  { label: 'Community', keywords: ['community', 'forum', 'mothers', 'group', 'কমিউনিটি', 'ফোরাম', 'মা'], href: '/community', icon: <Users size={18} />, category: 'Tools' },
  { label: 'Blood Donors', keywords: ['donors', 'blood', 'blood group', 'রক্তদাতা', 'রক্ত'], href: '/donors', icon: <Droplet size={18} />, category: 'Health' },
  { label: 'Myth Buster', keywords: ['myths', 'fact', 'truth', 'ভ্রান্ত ধারণা', 'সত্যি'], href: '/myths', icon: <Zap size={18} />, category: 'Tools' },
  { label: 'Hospitals', keywords: ['hospitals', 'emergency', 'clinic', 'হাসপাল', 'জরুরি', 'ক্লিনিক'], href: '/hospitals', icon: <Hospital size={18} />, category: 'Health' },
  { label: 'Pharmacy', keywords: ['pharmacy', 'medicine', 'buy', 'order', 'ফার্মেসি', 'ওষুধ', 'কিনুন', 'অর্ডার'], href: '/pharmacy', icon: <ShoppingBag size={18} />, category: 'Health' },
  { label: 'AI Translator', keywords: ['translator', 'translation', 'translate', 'অনুবাদ', 'অনুবাদক'], href: '/translator', icon: <Languages size={18} />, category: 'Tools' },
  { label: 'Ask Assistant', keywords: ['assistant', 'ai', 'chat', 'help', 'সহকারী', 'এআই সহকারী'], href: '/assistant', icon: <BrainCircuit size={18} />, category: 'Tools' },
  { label: 'My Profile', keywords: ['profile', 'settings', 'account', 'প্রোফাইল', 'সেটিং', 'অ্যাকাউন্ট'], href: '/profile', icon: <User size={18} />, category: 'Navigation' },
];

export const GlobalSearch: React.FC = () => {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Input debouncing effect
  useEffect(() => {
    if (query) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
      setDebouncedQuery('');
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const filteredItems = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const normalizedQuery = debouncedQuery.toLowerCase();
    return SEARCH_ITEMS.filter(item => 
      item.label.toLowerCase().includes(normalizedQuery) ||
      item.keywords.some(k => k.toLowerCase().includes(normalizedQuery))
    );
  }, [debouncedQuery]);

  useEffect(() => {
    setSelectedIndex(0);
    setIsOpen(filteredItems.length > 0);
  }, [filteredItems]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      if (filteredItems.length > 0) {
        navigate(filteredItems[selectedIndex].href);
        setIsOpen(false);
        setQuery('');
      } else {
        // Exact match check for Enter key even if dropdown isn't showing
        const exactMatch = SEARCH_ITEMS.find(item => 
          item.label.toLowerCase() === query.toLowerCase() ||
          item.keywords.includes(query.toLowerCase())
        );
        if (exactMatch) {
          navigate(exactMatch.href);
          setQuery('');
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors">
          {isSearching ? (
            <RefreshCw size={18} className="text-teal-500 animate-spin" />
          ) : (
            <Search className={`transition-colors ${query ? 'text-teal-500' : 'text-gray-400'}`} size={18} />
          )}
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(filteredItems.length > 0)}
          placeholder={t('common.search')}
          className="w-full pl-10 pr-10 py-2 bg-[#F7F5EF] border-2 border-transparent rounded-full focus:bg-white focus:ring-4 focus:ring-[#BFE6DA]/20 focus:border-[#BFE6DA] transition-all text-sm outline-none shadow-inner"
          aria-label="Search navigation and features"
          autoComplete="off"
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); setDebouncedQuery(''); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2">
            <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
              <span>Suggestions</span>
              <span className="flex items-center gap-1 text-gray-300">
                <Command size={10} /> Enter to select
              </span>
            </div>
            
            <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
              {filteredItems.map((item, index) => (
                <button
                  key={item.href}
                  onClick={() => {
                    navigate(item.href);
                    setIsOpen(false);
                    setQuery('');
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left ${
                    index === selectedIndex 
                      ? 'bg-[#BFE6DA]/20 text-teal-800' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-xl transition-colors ${
                    index === selectedIndex ? 'bg-white shadow-sm text-teal-600' : 'bg-gray-50 text-gray-400'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold leading-none mb-1">{item.label}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{item.category}</p>
                  </div>
                  {index === selectedIndex && (
                    <div className="text-teal-600 animate-in fade-in slide-in-from-right-1">
                      <LayoutDashboard size={14} className="opacity-40" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-3 bg-gray-50/50 border-t border-gray-100 flex justify-center">
            <p className="text-[10px] font-medium text-gray-400 italic">
              Try searching for "ভ্যাকসিন" or "doctor"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};