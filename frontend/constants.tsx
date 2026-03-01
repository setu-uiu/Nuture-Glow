
import React from 'react';

export const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:4000';

export const COLORS = {
  softGold: '#E6C77A',
  pastelMint: '#BFE6DA',
  ivory: '#F7F5EF',
  offWhite: '#FAFAFC',
  lavender: '#E8E4F8',
};

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '' }) => (
  <div className={`relative flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm ${className}`.trim()}>
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#E6C77A" strokeWidth="1.5" />
      <path d="M12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16Z" fill="#BFE6DA" />
      <path d="M12 9C12.5523 9 13 8.55228 13 8C13 7.44772 12.5523 7 12 7C11.4477 7 11 7.44772 11 8C11 8.55228 11.4477 9 12 9Z" fill="#E6C77A" />
    </svg>
    <div className="absolute -top-1 right-0 text-[#E6C77A]">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.784 1.4 8.168L12 18.897l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192L12 .587z" />
      </svg>
    </div>
  </div>
);
