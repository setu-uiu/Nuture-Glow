import React from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface ToastProps {
  toast: {message: string, type: 'success' | 'info' | 'error'} | null;
}

const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) return null;

  return (
    <div
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 ${
        toast.type === 'success'
          ? 'bg-teal-600 text-white'
          : toast.type === 'error'
          ? 'bg-red-600 text-white'
          : 'bg-[#E6C77A] text-teal-900'
      }`}
    >
      {toast.type === 'success' ? (
        <CheckCircle2 size={18} />
      ) : toast.type === 'error' ? (
        <AlertTriangle size={18} />
      ) : (
        <Info size={18} />
      )}
      <span className="text-sm font-bold">{toast.message}</span>
    </div>
  );
};

export default Toast;
