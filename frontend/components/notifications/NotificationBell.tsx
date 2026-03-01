
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Calendar, Syringe, Users, Hospital, ShieldCheck, FileText, Settings, X, ExternalLink, Package, Truck, CheckCircle } from 'lucide-react';
import { db } from '../../services/db';
import { Notification, NotificationType } from '../../types';
import { useNavigate } from 'react-router-dom';

const typeIcons: Record<NotificationType, React.ReactNode> = {
  APPOINTMENT: <Calendar className="text-orange-500" size={16} />,
  APPOINTMENT_CANCELED: <Calendar className="text-red-500" size={16} />,
  VACCINE: <Syringe className="text-blue-500" size={16} />,
  COMMUNITY: <Users className="text-slate-600" size={16} />,
  HOSPITAL: <Hospital className="text-red-500" size={16} />,
  VERIFICATION: <ShieldCheck className="text-teal-500" size={16} />,
  REPORT: <FileText className="text-indigo-500" size={16} />,
  SYSTEM: <Settings className="text-gray-500" size={16} />,
  ORDER_PLACED: <Package className="text-emerald-500" size={16} />,
  ORDER_STATUS: <Truck className="text-blue-500" size={16} />,
  NEW_ORDER: <Package className="text-amber-500" size={16} />,
  ORDER_CANCELLED: <Package className="text-red-500" size={16} />,
  NEW_APPOINTMENT: <Calendar className="text-teal-500" size={16} />,
  health_id_verification_request: <ShieldCheck className="text-teal-500" size={16} />,
  health_id_verification_accepted: <ShieldCheck className="text-teal-500" size={16} />,
  health_id_verification_rejected: <ShieldCheck className="text-red-500" size={16} />,
};

const getRelativeTime = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const data = await db.getNotifications();
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();

    const handleUpdate = () => fetchNotifications();
    window.addEventListener('new-notification', handleUpdate);
    window.addEventListener('notification-updated', handleUpdate);

    return () => {
      window.removeEventListener('new-notification', handleUpdate);
      window.removeEventListener('notification-updated', handleUpdate);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Mark all as read when the panel is opened
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      db.markAllAsRead();
    }
  }, [isOpen, unreadCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  const handleNotificationClick = async (n: Notification) => {
    await db.markAsRead(n.id);
    setIsOpen(false);
    if (n.link) {
      navigate(n.link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-teal-600 relative transition-all active:scale-90"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-96 bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-800">Notifications</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => db.markAllAsRead()}
                className="p-2 text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                title="Mark all as read"
              >
                <Check size={18} />
              </button>
            </div>
          </div>

          <div className="flex p-2 bg-gray-50/50">
            <button 
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 text-xs font-bold rounded-2xl transition-all ${activeTab === 'all' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-400'}`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveTab('unread')}
              className={`flex-1 py-2 text-xs font-bold rounded-2xl transition-all ${activeTab === 'unread' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-400'}`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                  <Bell size={32} />
                </div>
                <p className="text-gray-400 text-sm">No notifications found.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredNotifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => handleNotificationClick(n)}
                    className={`p-5 flex gap-4 cursor-pointer hover:bg-teal-50/30 transition-all group ${!n.isRead ? 'bg-teal-50/10 border-l-4 border-teal-500' : ''}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center shadow-sm ${!n.isRead ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                      {typeIcons[n.type]}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-sm font-bold leading-tight ${!n.isRead ? 'text-gray-800' : 'text-gray-500'}`}>{n.title}</p>
                        <span className="text-[10px] font-bold text-gray-300 shrink-0 uppercase tracking-tighter">{getRelativeTime(n.createdAt)}</span>
                      </div>
                      <p className={`text-xs leading-relaxed ${!n.isRead ? 'text-gray-600' : 'text-gray-400'}`}>{n.message}</p>
                      {n.link && (
                        <div className="pt-1 flex items-center gap-1 text-[10px] font-bold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          View details <ExternalLink size={10} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50/50 text-center border-t border-gray-50">
             <button onClick={() => setIsOpen(false)} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600">Close Panel</button>
          </div>
        </div>
      )}
    </div>
  );
};
