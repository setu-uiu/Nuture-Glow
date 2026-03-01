import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, Mail, ShieldAlert, ExternalLink, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi';

type AdminNotification = {
  id: string;
  notification_type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | string;
  title: string;
  message: string;
  action_required: boolean;
  related_entity_type?: string | null;
  related_entity_id?: string | null;
  is_read: number | boolean;
  created_at: string;
  sender_email?: string | null;
};

const getPriorityColor = (priority: string) => {
  switch ((priority || '').toUpperCase()) {
    case 'URGENT':
      return { bg: 'rgba(220, 38, 38, 0.18)', text: '#F87171', border: 'rgba(220, 38, 38, 0.35)' };
    case 'HIGH':
      return { bg: 'rgba(230, 199, 122, 0.18)', text: '#E6C77A', border: 'rgba(230, 199, 122, 0.35)' };
    case 'LOW':
      return { bg: 'rgba(59, 130, 246, 0.18)', text: '#93C5FD', border: 'rgba(59, 130, 246, 0.35)' };
    default:
      return { bg: 'rgba(16, 185, 129, 0.18)', text: '#10B981', border: 'rgba(16, 185, 129, 0.35)' };
  }
};

const getTypeIcon = (type: string) => {
  const key = (type || '').toUpperCase();
  if (key.includes('SUSPENSION')) return <ShieldAlert size={16} />;
  if (key.includes('EMAIL')) return <Mail size={16} />;
  return <AlertTriangle size={16} />;
};

const getRelativeTime = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

const AdminNotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await adminApi.shared.getNotifications();
      setNotifications(data.notifications || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const markAsRead = async (id: string) => {
    try {
      await adminApi.shared.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.warn('Failed to mark notification read');
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    await Promise.all(unread.map((n) => markAsRead(n.id)));
  };

  const handleClick = async (n: AdminNotification) => {
    await markAsRead(n.id);
    setIsOpen(false);
    if (n.related_entity_type === 'suspension_appeal' || n.notification_type?.toUpperCase().includes('SUSPENSION_APPEAL')) {
      navigate('/admin/system/appeals');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-700 rounded-lg text-gray-400 relative"
        title="Admin notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-[18px] h-[18px] bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-800">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-4 w-[420px] rounded-2xl overflow-hidden shadow-2xl border border-primary-gold/20 bg-[#0B1220] z-[1000]"
        >
          <div className="px-5 py-4 border-b border-primary-gold/15 flex items-center justify-between">
            <div>
              <h4 className="m-0 text-primary-cream text-[0.95rem] font-bold">Admin Notifications</h4>
              <p className="m-0 text-gray-400 text-[0.7rem]">
                {unreadCount} unread
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={markAllRead}
                className="admin-btn admin-btn-secondary px-2.5 py-1.5 text-[0.7rem]"
              >
                <CheckCircle size={14} />
                Mark all
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="admin-btn admin-btn-ghost px-2.5 py-1.5 text-[0.7rem]"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-400">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => {
                const priority = getPriorityColor(n.priority);
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left px-5 py-4 border-b border-slate-400/[0.08] cursor-pointer ${
                      n.is_read ? 'bg-transparent' : 'bg-slate-900/60'
                    }`}
                  >
                    <div className="flex justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: priority.bg, color: priority.text }}
                        >
                          {getTypeIcon(n.notification_type)}
                        </span>
                        <span className="text-primary-cream text-[0.85rem] font-semibold">{n.title}</span>
                      </div>
                      <span className="text-slate-500 text-[0.65rem]">{getRelativeTime(n.created_at)}</span>
                    </div>
                    <p className="text-slate-300 text-[0.75rem] m-0 mb-1.5">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-wide" style={{ color: priority.text }}>
                      <span className="px-2 py-0.5 rounded-full" style={{ border: `1px solid ${priority.border}` }}>{n.priority}</span>
                      {n.action_required && <span>Action required</span>}
                      {(n.related_entity_type === 'suspension_appeal' || n.notification_type?.toUpperCase().includes('SUSPENSION_APPEAL')) && (
                        <span className="flex items-center gap-1">
                          View <ExternalLink size={10} />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationBell;
