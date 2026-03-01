
"use client";

import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Download, Share2, Check, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface ShareHealthIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const ShareHealthIdModal: React.FC<ShareHealthIdModalProps> = ({ isOpen, onClose, user }) => {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !user) return null;

  const shareText = `NurtureGlow Health ID: ${user.healthId}\nName: ${user.name}`;
  const qrValue = `NurtureGlow Health ID: ${user.healthId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `HealthID-${user.healthId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My NurtureGlow Health ID',
          text: shareText,
        });
      } catch (err) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-[40px] p-8 max-w-md w-full shadow-2xl space-y-8 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Share Health ID</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="bg-[#F7F5EF] p-8 rounded-[32px] flex flex-col items-center space-y-6 shadow-inner">
          <div ref={qrRef} className="p-4 bg-white rounded-3xl shadow-md border-8 border-white">
            <QRCodeSVG 
              value={qrValue} 
              size={180}
              level="H"
              includeMargin={false}
              fgColor="#1a1a1a"
            />
          </div>
          
          <div className="text-center space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Clinical Health Identity</p>
            <p className="text-2xl font-bold text-teal-700 font-mono tracking-tighter">{user.healthId}</p>
            <div className="flex items-center justify-center gap-1.5 pt-1">
               <ShieldCheck size={14} className={user.verified === 'Verified' ? 'text-teal-500' : 'text-orange-400'} />
               <p className={`text-[10px] font-bold uppercase tracking-widest ${user.verified === 'Verified' ? 'text-teal-600' : 'text-orange-500'}`}>
                 {user.verified}
               </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={handleCopy}
            className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
          >
            <div className="p-2 bg-white rounded-xl shadow-sm text-blue-500">
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button 
            onClick={handleDownload}
            className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
          >
            <div className="p-2 bg-white rounded-xl shadow-sm text-slate-600">
              <Download size={20} />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase">Save</span>
          </button>

          <button 
            onClick={handleShare}
            className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
          >
            <div className="p-2 bg-white rounded-xl shadow-sm text-teal-500">
              <Share2 size={20} />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase">Share</span>
          </button>
        </div>

        <p className="text-[10px] text-center text-gray-400 font-medium leading-relaxed italic">
          This ID provides medical professionals secure access to your validated maternal records.
        </p>
      </div>
    </div>
  );
};
