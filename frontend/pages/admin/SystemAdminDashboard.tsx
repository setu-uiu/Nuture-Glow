import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/adminApi';
import { systemAdminFeatures } from '../../services/systemAdminFeatures';
import { realtimeUpdateService } from '../../services/realtimeUpdateService';
import { 
  Terminal, 
  Users, 
  Shield, 
  Database,
  Lock,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Server,
  Key,
  FileText,
  Clock,
  TrendingUp,
  Bell,
  LogOut,
  Eye,
  UserX,
  Zap,
  HardDrive,
  RefreshCw,
  UserCog,
  BarChart3,
  Send,
  Settings,
  MessageSquare,
  Pause,
  Play
} from 'lucide-react';

interface DashboardData {
  stats: {
    total_active_users?: number;
    new_users_week?: number;
    critical_security_alerts?: number;
    avg_uptime_24h?: number;
    admin_actions_24h?: number;
  };
  userBreakdown: Array<{ role: string; count: number }>;
  securityLogs: Array<{
    event_type: string;
    description: string;
    severity: string;
    created_at: string;
    user_id?: string;
    ip_address?: string;
  }>;
  systemHealth: Array<{
    component: string;
    status: string;
    uptime: number;
    response: number;
  }>;
  recentActions: Array<{
    action_type: string;
    description: string;
    admin_email?: string;
    severity: string;
    created_at: string;
  }>;
}

interface SystemMessage {
  id: string;
  title: string;
  content: string;
  severity: 'info' | 'warning' | 'error';
  broadcast_to: 'all_users' | 'specific_role' | 'specific_user';
  created_at: string;
  created_by: string;
}

interface SystemSetting {
  key: string;
  value: string;
}

interface SystemMessageForm {
  title: string;
  content: string;
  severity: 'info' | 'warning' | 'error';
  broadcast_to: 'all_users' | 'specific_role' | 'specific_user';
  target_role: string;
  target_user_id: string;
}

type TabType = 'overview' | 'monitoring' | 'messages' | 'settings';

const SystemAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: {
      total_active_users: 0,
      new_users_week: 0,
      critical_security_alerts: 0,
      avg_uptime_24h: 99.8,
      admin_actions_24h: 0,
    },
    userBreakdown: [],
    securityLogs: [],
    systemHealth: [],
    recentActions: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [pendingAppealsCount, setPendingAppealsCount] = useState<number | null>(null);
  
  // System Messages
  const [systemMessages, setSystemMessages] = useState<SystemMessage[]>([]);
  const [messageForm, setMessageForm] = useState<SystemMessageForm>({
    title: '',
    content: '',
    severity: 'info',
    broadcast_to: 'all_users',
    target_role: '',
    target_user_id: ''
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState<Array<{ key: string; value: string }>>([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  // Real-time updates
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      // Fetch real data from API
      const data = await adminApi.system.getDashboard();
      setDashboardData(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPendingAppealsCount = async () => {
    try {
      const data = await adminApi.system.getSuspensionAppeals();
      const appeals = data.appeals || [];
      const pending = appeals.filter((appeal: any) => (appeal?.status || '').toLowerCase() === 'pending').length;
      setPendingAppealsCount(pending);
    } catch (err) {
      console.warn('Failed to fetch pending appeals:', err);
      setPendingAppealsCount(null);
    }
  };

  const fetchSystemMessages = async () => {
    try {
      const messages = await systemAdminFeatures.messages.getAll(50);
      setSystemMessages(messages);
    } catch (err) {
      console.error('Failed to fetch system messages:', err);
      setSystemMessages([]);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const settings = await systemAdminFeatures.settings.getAll();
      setSystemSettings(settings);
      
      const maintenanceModeSetting = settings.find((s: SystemSetting) => s.key === 'maintenance_mode');
      if (maintenanceModeSetting) {
        setMaintenanceMode(maintenanceModeSetting.value === 'true');
      }
    } catch (err) {
      console.error('Failed to fetch system settings:', err);
    }
  };

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    const initializeRealtime = async () => {
      try {
        await realtimeUpdateService.connect();
        setRealtimeConnected(true);

        // Subscribe to dashboard updates
        const unsubDashboard = realtimeUpdateService.subscribe('dashboard_update', (data) => {
          console.log('Dashboard update received:', data);
          setDashboardData(prev => ({ ...prev, ...data }));
        });

        // Subscribe to system messages
        const unsubMessages = realtimeUpdateService.subscribe('system_message', (data) => {
          console.log('System message received:', data);
          setSystemMessages(prev => [data, ...prev]);
        });

        // Subscribe to security alerts
        const unsubSecurity = realtimeUpdateService.subscribe('security_alert', (data) => {
          console.log('Security alert received:', data);
          setDashboardData(prev => ({
            ...prev,
            securityLogs: [data, ...prev.securityLogs.slice(0, 4)]
          }));
        });

        // Subscribe to settings updates
        const unsubSettings = realtimeUpdateService.subscribe('settings_update', (data) => {
          console.log('Settings update received:', data);
          fetchSystemSettings();
        });

        return () => {
          unsubDashboard();
          unsubMessages();
          unsubSecurity();
          unsubSettings();
        };
      } catch (err) {
        console.warn('Real-time updates not available (backend not ready):', err);
        setRealtimeConnected(false);
      }
    };

    initializeRealtime();

    return () => {
      try {
        realtimeUpdateService.disconnect();
      } catch (e) {
        console.warn('Error disconnecting realtime:', e);
      }
    };
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchSystemMessages();
    fetchSystemSettings();
    fetchPendingAppealsCount();
    
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchPendingAppealsCount();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return { bg: 'rgba(237, 66, 69, 0.2)', border: 'rgba(237, 66, 69, 0.4)', text: '#f7a6a8' };
      case 'high': return { bg: 'rgba(88, 101, 242, 0.2)', border: 'rgba(88, 101, 242, 0.4)', text: '#b8c2ff' };
      case 'medium': return { bg: 'rgba(88, 101, 242, 0.2)', border: 'rgba(88, 101, 242, 0.4)', text: '#5865f2' };
      case 'warning': return { bg: 'rgba(88, 101, 242, 0.2)', border: 'rgba(88, 101, 242, 0.4)', text: '#5865f2' };
      default: return { bg: 'rgba(59, 165, 92, 0.2)', border: 'rgba(59, 165, 92, 0.4)', text: '#57f287' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy': return <CheckCircle size={16} className="text-green-400" />;
      case 'warning': return <AlertTriangle size={16} className="text-yellow-400" />;
      default: return <AlertTriangle size={16} className="text-red-400" />;
    }
  };

  // Handler for sending system message
  const handleSendMessage = async () => {
    if (!messageForm.title || !messageForm.content) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await systemAdminFeatures.messages.send({
        title: messageForm.title,
        content: messageForm.content,
        severity: messageForm.severity,
        broadcast_to: messageForm.broadcast_to,
        target_role: messageForm.target_role || undefined,
        target_user_id: messageForm.target_user_id || undefined
      });

      alert('System message sent successfully!');
      setMessageForm({
        title: '',
        content: '',
        severity: 'info',
        broadcast_to: 'all_users',
        target_role: '',
        target_user_id: ''
      });
      fetchSystemMessages();
    } catch (err: any) {
      alert('Failed to send message: ' + (err.message || 'Unknown error'));
    }
  };

  // Handler for updating system settings
  const handleSaveSettings = async () => {
    try {
      const settingUpdates = [
        { key: 'maintenance_mode', value: maintenanceMode ? 'true' : 'false' },
        { key: 'maintenance_message', value: maintenanceMessage }
      ];

      await systemAdminFeatures.settings.update(settingUpdates);
      alert('System settings updated successfully!');
      fetchSystemSettings();
    } catch (err: any) {
      alert('Failed to save settings: ' + (err.message || 'Unknown error'));
    }
  };

  const handleToggleMaintenance = async () => {
    try {
      await systemAdminFeatures.monitoring.setMaintenanceMode(!maintenanceMode, maintenanceMessage);
      setMaintenanceMode(!maintenanceMode);
      alert('Maintenance mode updated successfully!');
    } catch (err: any) {
      alert('Failed to update maintenance mode: ' + (err.message || 'Unknown error'));
    }
  };

  if (error) {
    return (
      <div className="admin-error">
        <div className="admin-error-card">
          <AlertTriangle size={64} className="admin-error-icon" style={{ margin: '0 auto 1.5rem' }} />
          <h2 className="admin-error-title">Error Loading Dashboard</h2>
          <p className="admin-error-message">{error}</p>
          <button onClick={fetchDashboardData} className="admin-btn admin-btn-primary">
            <RefreshCw size={16} />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const criticalSecurityAlerts = stats.critical_security_alerts ?? 0;

  return (
    <div className="admin-dashboard" style={{ 
      padding: 'clamp(1rem, 3vw, 2.5rem)'
    }}>
      {/* Page Header */}
      <div style={{
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid rgba(88, 101, 242, 0.15)'
      }}>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: 600,
          color: '#f2f3f5',
          margin: '0 0 0.5rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #3ba55c 0%, #3ba55c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(59, 165, 92, 0.3)'
          }}>
            <Shield size={24} style={{ color: '#FFFFFF' }} />
          </span>
          System Administration
        </h1>
        <p style={{ color: '#9aa0a6', margin: 0, fontSize: '0.9rem' }}>
          Monitor, manage, and configure your Nurture Glow platform
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        {(['overview', 'monitoring', 'messages', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
          >
            {tab === 'overview' && <BarChart3 size={18} />}
            {tab === 'monitoring' && <Activity size={18} />}
            {tab === 'messages' && <Bell size={18} />}
            {tab === 'settings' && <Settings size={18} />}
            <span style={{ textTransform: 'capitalize' }}>{tab}</span>
          </button>
        ))}
        
        {/* Real-time Status */}
        <div className="admin-realtime" style={{ marginLeft: 'auto' }}>
          <div className={`admin-realtime-dot ${realtimeConnected ? 'connected' : 'disconnected'}`}></div>
          <span style={{ color: realtimeConnected ? '#3ba55c' : '#ed4245' }}>
            {realtimeConnected ? 'Live Updates' : 'Offline'}
          </span>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="overview-content">
          {/* Stats Grid - Enhanced Cards */}
          <div className="admin-stats-grid">
            {/* Active Users Card */}
            <div className="admin-stat-card" style={{
              background: 'linear-gradient(165deg, rgba(59, 165, 92, 0.08) 0%, rgba(11, 13, 19, 0.95) 100%)',
              border: '1px solid rgba(59, 165, 92, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #3ba55c, #57f287, #80f3a2)'
              }} />
              <div className="admin-stat-header">
                <div className="admin-stat-icon" style={{ 
                  background: 'linear-gradient(135deg, #3ba55c 0%, #3ba55c 100%)',
                  boxShadow: '0 8px 20px rgba(59, 165, 92, 0.35)'
                }}>
                  <Users size={24} style={{ color: '#FFFFFF' }} />
                </div>
                <span className="admin-stat-badge positive" style={{ background: 'rgba(87, 242, 135, 0.2)' }}>Active</span>
              </div>
              <div className="admin-stat-value" style={{ color: '#57f287' }}>{stats.total_active_users?.toLocaleString() || '0'}</div>
              <p className="admin-stat-label">Active Users</p>
            </div>

            {/* New Users Card */}
            <div className="admin-stat-card" style={{
              background: 'linear-gradient(165deg, rgba(142, 161, 225, 0.05) 0%, rgba(11, 13, 19, 0.95) 100%)',
              border: '1px solid rgba(142, 161, 225, 0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #8ea1e1, #00b0f4)'
              }} />
              <div className="admin-stat-header">
                <div className="admin-stat-icon" style={{ 
                  background: 'linear-gradient(135deg, #00b0f4 0%, #00b0f4 100%)',
                  boxShadow: '0 8px 20px rgba(0, 176, 244, 0.35)'
                }}>
                  <UserCog size={24} style={{ color: '#FFFFFF' }} />
                </div>
                <span className="admin-stat-badge positive" style={{ background: 'rgba(142, 161, 225, 0.2)', color: '#8ea1e1' }}>+{stats.new_users_week || 0}</span>
              </div>
              <div className="admin-stat-value" style={{ color: '#8ea1e1' }}>{stats.new_users_week || '0'}</div>
              <p className="admin-stat-label">New This Week</p>
            </div>

            {/* Security Alerts Card */}
            <div className="admin-stat-card" style={{
              background: 'linear-gradient(165deg, rgba(237, 66, 69, 0.05) 0%, rgba(11, 13, 19, 0.95) 100%)',
              border: `1px solid ${criticalSecurityAlerts > 0 ? 'rgba(237, 66, 69, 0.3)' : 'rgba(87, 242, 135, 0.2)'}`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: criticalSecurityAlerts > 0 
                  ? 'linear-gradient(90deg, #ed4245, #f04747)' 
                  : 'linear-gradient(90deg, #57f287, #80f3a2)'
              }} />
              <div className="admin-stat-header">
                <div className="admin-stat-icon" style={{ 
                  background: criticalSecurityAlerts > 0 
                    ? 'linear-gradient(135deg, #ed4245 0%, #f04747 100%)'
                    : 'linear-gradient(135deg, #3ba55c 0%, #57f287 100%)',
                  boxShadow: criticalSecurityAlerts > 0 
                    ? '0 8px 20px rgba(237, 66, 69, 0.35)'
                    : '0 8px 20px rgba(59, 165, 92, 0.35)'
                }}>
                  <AlertTriangle size={24} style={{ color: '#FFFFFF' }} />
                </div>
                <span className={`admin-stat-badge ${criticalSecurityAlerts > 0 ? 'negative' : 'positive'}`}>
                  {criticalSecurityAlerts} Alert{criticalSecurityAlerts !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="admin-stat-value" style={{ color: criticalSecurityAlerts > 0 ? '#ff7b7b' : '#57f287' }}>{criticalSecurityAlerts}</div>
              <p className="admin-stat-label">Security Alerts</p>
            </div>

            {/* System Uptime Card */}
            <div className="admin-stat-card" style={{
              background: 'linear-gradient(165deg, rgba(88, 101, 242, 0.08) 0%, rgba(11, 13, 19, 0.95) 100%)',
              border: '1px solid rgba(88, 101, 242, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #5865f2, #5865f2, #5865f2)'
              }} />
              <div className="admin-stat-header">
                <div className="admin-stat-icon" style={{ 
                  background: 'linear-gradient(135deg, #5865f2 0%, #5865f2 100%)',
                  boxShadow: '0 8px 20px rgba(88, 101, 242, 0.35)'
                }}>
                  <Activity size={24} style={{ color: '#0b0d13' }} />
                </div>
                <span className="admin-stat-badge positive" style={{ background: 'rgba(88, 101, 242, 0.2)', color: '#5865f2' }}>Healthy</span>
              </div>
              <div className="admin-stat-value" style={{ color: '#5865f2' }}>{stats.avg_uptime_24h?.toFixed(1) || '0'}%</div>
              <p className="admin-stat-label">System Uptime</p>
            </div>
          </div>

          {/* Shortcut Spotlight */}
          <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '1.25rem',
                border: '1px solid rgba(88, 101, 242, 0.2)',
                background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.14) 0%, rgba(11, 13, 19, 0.95) 45%, rgba(87, 242, 135, 0.12) 100%)',
                padding: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem',
                flexWrap: 'wrap',
                boxShadow: '0 18px 40px rgba(0, 0, 0, 0.25)'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-80px',
                right: '-60px',
                width: '220px',
                height: '220px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(87, 242, 135, 0.25) 0%, rgba(87, 242, 135, 0) 70%)',
                pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-120px',
                left: '-80px',
                width: '260px',
                height: '260px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(88, 101, 242, 0.28) 0%, rgba(88, 101, 242, 0) 70%)',
                pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: '1 1 320px', minWidth: '260px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #00b0f4 0%, #00b0f4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 12px 24px rgba(0, 176, 244, 0.35)',
                  flexShrink: 0
                }}>
                  <MessageSquare size={28} style={{ color: '#FFFFFF' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: '999px',
                      background: 'rgba(87, 242, 135, 0.18)',
                      color: '#57f287',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em'
                    }}>
                      Priority
                    </span>
                    <span style={{ color: '#9aa0a6', fontSize: '0.75rem' }}>Review incoming appeals fast</span>
                  </div>
                  <h3 style={{
                    margin: 0,
                    color: '#f2f3f5',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    fontFamily: "var(--font-display)"
                  }}>
                    Suspension Appeals Hub
                  </h3>
                  <p style={{ margin: '0.4rem 0 0 0', color: '#8ea1e1', fontSize: '0.9rem', maxWidth: '520px' }}>
                    Handle show-cause requests with resolution notes and restore access in one click.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{
                  padding: '0.6rem 0.9rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(11, 13, 19, 0.6)',
                  border: '1px solid rgba(142, 161, 225, 0.2)',
                  color: '#8ea1e1',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertTriangle size={14} />
                  Pending: {pendingAppealsCount === null ? '—' : pendingAppealsCount}
                </div>
                <button
                  onClick={() => navigate('/admin/system/appeals')}
                  className="admin-btn admin-btn-primary"
                  style={{
                    padding: '0.75rem 1.25rem',
                    fontSize: '0.85rem',
                    boxShadow: '0 8px 20px rgba(59, 165, 92, 0.35)'
                  }}
                >
                  <MessageSquare size={16} />
                  Review Appeals
                </button>
              </div>
            </div>
          </div>

          {/* System Health & Security Logs - Two Column Layout */}
          <div className="admin-grid-2" style={{ marginTop: '2rem' }}>
            {/* System Health Panel */}
            <div style={{
              background: 'linear-gradient(165deg, rgba(11, 13, 19, 0.95) 0%, rgba(21, 24, 31, 0.9) 100%)',
              borderRadius: '1.25rem',
              border: '1px solid rgba(59, 165, 92, 0.2)',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}>
              {/* Panel Header */}
              <div style={{
                padding: '1.25rem 1.5rem',
                background: 'linear-gradient(135deg, rgba(59, 165, 92, 0.15) 0%, rgba(87, 242, 135, 0.05) 100%)',
                borderBottom: '1px solid rgba(59, 165, 92, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #3ba55c 0%, #3ba55c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(59, 165, 92, 0.3)'
                }}>
                  <Server size={20} style={{ color: '#FFFFFF' }} />
                </div>
                <div>
                  <h2 style={{ 
                    color: '#f2f3f5', 
                    margin: 0, 
                    fontSize: '1.1rem', 
                    fontWeight: 600,
                    fontFamily: "var(--font-display)"
                  }}>System Health</h2>
                  <p style={{ color: '#9aa0a6', margin: 0, fontSize: '0.75rem' }}>Real-time component status</p>
                </div>
              </div>
              
              {/* Panel Content */}
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {dashboardData.systemHealth && dashboardData.systemHealth.length > 0 ? (
                  dashboardData.systemHealth.map((component, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        background: 'rgba(59, 165, 92, 0.08)',
                        border: '1px solid rgba(59, 165, 92, 0.15)',
                        borderRadius: '0.75rem',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: '#f2f3f5', fontWeight: 600, margin: 0, marginBottom: '0.375rem', fontSize: '0.9rem' }}>
                          {component.component}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#9aa0a6', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <TrendingUp size={12} style={{ color: '#57f287' }} />
                            {component.uptime}% uptime
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Zap size={12} style={{ color: '#5865f2' }} />
                            {component.response}ms
                          </span>
                        </div>
                      </div>
                      <div style={{
                        padding: '0.375rem 0.75rem',
                        borderRadius: '2rem',
                        background: component.status === 'healthy' ? 'rgba(87, 242, 135, 0.15)' : 'rgba(237, 66, 69, 0.15)',
                        color: component.status === 'healthy' ? '#57f287' : '#ff7b7b',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        {component.status === 'healthy' ? '● Online' : '● Issue'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <Server size={40} style={{ color: '#5f6670', marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{ color: '#8b9098', margin: 0 }}>No system health data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Security Events Panel */}
            <div style={{
              background: 'linear-gradient(165deg, rgba(11, 13, 19, 0.95) 0%, rgba(21, 24, 31, 0.9) 100%)',
              borderRadius: '1.25rem',
              border: '1px solid rgba(88, 101, 242, 0.15)',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}>
              {/* Panel Header */}
              <div style={{
                padding: '1.25rem 1.5rem',
                background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.1) 0%, rgba(88, 101, 242, 0.05) 100%)',
                borderBottom: '1px solid rgba(88, 101, 242, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #5865f2 0%, #5865f2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(88, 101, 242, 0.3)'
                }}>
                  <Shield size={20} style={{ color: '#0b0d13' }} />
                </div>
                <div>
                  <h2 style={{ 
                    color: '#f2f3f5', 
                    margin: 0, 
                    fontSize: '1.1rem', 
                    fontWeight: 600,
                    fontFamily: "var(--font-display)"
                  }}>Security Events</h2>
                  <p style={{ color: '#9aa0a6', margin: 0, fontSize: '0.75rem' }}>Recent activity log</p>
                </div>
              </div>
              
              {/* Panel Content */}
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto' }}>
                {dashboardData.securityLogs && dashboardData.securityLogs.length > 0 ? (
                  dashboardData.securityLogs.slice(0, 5).map((log, idx) => {
                    const colors = getSeverityColor(log.severity);
                    const severityIcon = log.severity === 'critical' ? '🚨' : log.severity === 'warning' ? '⚠️' : 'ℹ️';
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '0.875rem 1rem',
                          background: colors.bg,
                          border: `1px solid ${colors.border}`,
                          borderLeft: `3px solid ${log.severity === 'critical' ? '#ed4245' : log.severity === 'warning' ? '#5865f2' : '#57f287'}`,
                          borderRadius: '0.5rem',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                          <span style={{ fontSize: '1rem' }}>{severityIcon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: '#f2f3f5', fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.375rem 0', wordBreak: 'break-word' }}>
                              {log.description || log.event_type}
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', color: '#9aa0a6', flexWrap: 'wrap' }}>
                              <span>{log.ip_address || 'System'}</span>
                              <span>•</span>
                              <span>{formatTimeAgo(log.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <Shield size={40} style={{ color: '#5f6670', marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{ color: '#8b9098', margin: 0 }}>No security events recorded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

        {/* MONITORING TAB */}
        {activeTab === 'monitoring' && (
          <div style={{
            background: 'linear-gradient(165deg, rgba(11, 13, 19, 0.95) 0%, rgba(21, 24, 31, 0.9) 100%)',
            borderRadius: '1.25rem',
            border: '1px solid rgba(59, 165, 92, 0.2)',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            {/* Panel Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(135deg, rgba(59, 165, 92, 0.15) 0%, rgba(87, 242, 135, 0.05) 100%)',
              borderBottom: '1px solid rgba(59, 165, 92, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3ba55c 0%, #3ba55c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(59, 165, 92, 0.3)'
                }}>
                  <Activity size={22} style={{ color: '#FFFFFF' }} />
                </div>
                <div>
                  <h2 style={{ 
                    color: '#f2f3f5', 
                    margin: 0, 
                    fontSize: '1.25rem', 
                    fontWeight: 600,
                    fontFamily: "var(--font-display)"
                  }}>System Logs & Monitoring</h2>
                  <p style={{ color: '#9aa0a6', margin: 0, fontSize: '0.8rem' }}>
                    {dashboardData.securityLogs?.length || 0} events recorded
                  </p>
                </div>
              </div>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(87, 242, 135, 0.15)',
                  borderRadius: '2rem',
                  color: '#57f287',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  ● Live Monitoring
                </span>
              </div>
            </div>

            {/* Logs Content */}
            <div style={{ padding: '1.25rem', maxHeight: '600px', overflowY: 'auto' }}>
              {dashboardData.securityLogs && dashboardData.securityLogs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {dashboardData.securityLogs.map((log, idx) => {
                    const colors = getSeverityColor(log.severity);
                    const severityIcon = log.severity === 'critical' ? '🚨' : log.severity === 'warning' ? '⚠️' : 'ℹ️';
                    const severityColor = log.severity === 'critical' ? '#ed4245' : log.severity === 'warning' ? '#5865f2' : '#57f287';
                    
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '1rem',
                          padding: '1.25rem',
                          background: colors.bg,
                          border: `1px solid ${colors.border}`,
                          borderLeft: `4px solid ${severityColor}`,
                          borderRadius: '0.75rem',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{severityIcon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ 
                            color: '#f2f3f5', 
                            fontSize: '0.95rem', 
                            fontWeight: 600, 
                            margin: '0 0 0.5rem 0',
                            wordBreak: 'break-word'
                          }}>
                            {log.description || log.event_type}
                          </p>
                          <div style={{ 
                            display: 'flex', 
                            gap: '1rem', 
                            flexWrap: 'wrap', 
                            fontSize: '0.8rem', 
                            color: '#9aa0a6' 
                          }}>
                            {log.user_id && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                <Users size={12} />
                                User: {log.user_id}
                              </span>
                            )}
                            {log.ip_address && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                <Server size={12} />
                                IP: {log.ip_address}
                              </span>
                            )}
                            <span style={{ 
                              padding: '0.25rem 0.625rem',
                              borderRadius: '1rem',
                              background: colors.bg,
                              border: `1px solid ${colors.border}`,
                              color: severityColor,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              textTransform: 'uppercase'
                            }}>
                              {log.severity}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                              <Clock size={12} />
                              {formatTimeAgo(log.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ 
                  padding: '4rem 2rem', 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(59, 165, 92, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <Activity size={36} style={{ color: '#3ba55c', opacity: 0.5 }} />
                  </div>
                  <h3 style={{ color: '#9aa0a6', margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 500 }}>
                    No Events Logged
                  </h3>
                  <p style={{ color: '#8b9098', margin: 0, fontSize: '0.9rem', maxWidth: '300px' }}>
                    Security events and system logs will appear here when activity is detected.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="messages-layout">
            {/* Compose Message Panel */}
            <div className="compose-panel" style={{
              background: 'linear-gradient(165deg, rgba(11, 13, 19, 0.95) 0%, rgba(21, 24, 31, 0.9) 100%)',
              borderRadius: '1.25rem',
              border: '1px solid rgba(88, 101, 242, 0.15)',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)'
            }}>
              {/* Header */}
              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(59, 165, 92, 0.15) 0%, rgba(142, 161, 225, 0.08) 100%)',
                borderBottom: '1px solid rgba(88, 101, 242, 0.12)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #3ba55c 0%, #3ba55c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(59, 165, 92, 0.3)'
                  }}>
                    <Send size={20} style={{ color: '#FFFFFF' }} />
                  </div>
                  <div>
                    <h2 style={{ 
                      color: '#f2f3f5', 
                      margin: 0, 
                      fontSize: '1.125rem', 
                      fontWeight: 600,
                      fontFamily: "var(--font-display)"
                    }}>
                      Compose Message
                    </h2>
                    <p style={{ color: '#9aa0a6', margin: 0, fontSize: '0.8rem' }}>
                      Broadcast to users
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Title Input */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    color: '#5865f2', 
                    fontSize: '0.75rem', 
                    marginBottom: '0.5rem', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    value={messageForm.title}
                    onChange={(e) => setMessageForm({ ...messageForm, title: e.target.value })}
                    placeholder="Enter message subject..."
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      background: 'rgba(11, 13, 19, 0.6)',
                      border: '1px solid rgba(88, 101, 242, 0.2)',
                      borderRadius: '0.75rem',
                      color: '#f2f3f5',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(88, 101, 242, 0.5)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(88, 101, 242, 0.2)'}
                  />
                </div>

                {/* Content Textarea */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    color: '#5865f2', 
                    fontSize: '0.75rem', 
                    marginBottom: '0.5rem', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Message
                  </label>
                  <textarea
                    value={messageForm.content}
                    onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                    placeholder="Write your message here..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(11, 13, 19, 0.6)',
                      border: '1px solid rgba(88, 101, 242, 0.2)',
                      borderRadius: '0.75rem',
                      color: '#f2f3f5',
                      fontSize: '0.9rem',
                      fontFamily: "var(--font-primary)",
                      boxSizing: 'border-box',
                      resize: 'vertical',
                      minHeight: '100px',
                      lineHeight: '1.5'
                    }}
                  />
                </div>

                {/* Severity & Broadcast Row - Responsive */}
                <div className="form-row-responsive" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                  gap: '0.75rem' 
                }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      color: '#5865f2', 
                      fontSize: '0.7rem', 
                      marginBottom: '0.375rem', 
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Priority
                    </label>
                    <select
                      value={messageForm.severity}
                      onChange={(e) => setMessageForm({ ...messageForm, severity: e.target.value as any })}
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.75rem',
                        background: 'rgba(11, 13, 19, 0.6)',
                        border: '1px solid rgba(88, 101, 242, 0.2)',
                        borderRadius: '0.5rem',
                        color: '#f2f3f5',
                        fontSize: '0.85rem',
                        boxSizing: 'border-box',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="info">ℹ️ Info</option>
                      <option value="warning">⚠️ Important</option>
                      <option value="error">🚨 Critical</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      color: '#5865f2', 
                      fontSize: '0.7rem', 
                      marginBottom: '0.375rem', 
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Recipients
                    </label>
                    <select
                      value={messageForm.broadcast_to}
                      onChange={(e) => setMessageForm({ ...messageForm, broadcast_to: e.target.value as any })}
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.75rem',
                        background: 'rgba(11, 13, 19, 0.6)',
                        border: '1px solid rgba(88, 101, 242, 0.2)',
                        borderRadius: '0.5rem',
                        color: '#f2f3f5',
                        fontSize: '0.85rem',
                        boxSizing: 'border-box',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="all_users">👥 All</option>
                      <option value="specific_role">🎭 Role</option>
                      <option value="specific_user">👤 User</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Target Fields */}
                {messageForm.broadcast_to === 'specific_role' && (
                  <div style={{
                    padding: '0.75rem',
                    background: 'rgba(59, 165, 92, 0.1)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(59, 165, 92, 0.2)'
                  }}>
                    <label style={{ 
                      display: 'block', 
                      color: '#57f287', 
                      fontSize: '0.7rem', 
                      marginBottom: '0.375rem', 
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Select Role
                    </label>
                    <select
                      value={messageForm.target_role}
                      onChange={(e) => setMessageForm({ ...messageForm, target_role: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(11, 13, 19, 0.8)',
                        border: '1px solid rgba(87, 242, 135, 0.3)',
                        borderRadius: '0.5rem',
                        color: '#f2f3f5',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">Choose a role...</option>
                      <option value="mother">Mothers</option>
                      <option value="donor">Donors</option>
                      <option value="patient">Patients</option>
                      <option value="doctor">Doctors</option>
                      <option value="pharmacist">Pharmacists</option>
                      <option value="medical_admin">Medical Admins</option>
                    </select>
                  </div>
                )}

                {messageForm.broadcast_to === 'specific_user' && (
                  <div style={{
                    padding: '1rem',
                    background: 'rgba(59, 165, 92, 0.1)',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(59, 165, 92, 0.2)'
                  }}>
                    <label style={{ 
                      display: 'block', 
                      color: '#57f287', 
                      fontSize: '0.75rem', 
                      marginBottom: '0.5rem', 
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      User ID or Email
                    </label>
                    <input
                      type="text"
                      value={messageForm.target_user_id}
                      onChange={(e) => setMessageForm({ ...messageForm, target_user_id: e.target.value })}
                      placeholder="Enter user ID or email address"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(11, 13, 19, 0.8)',
                        border: '1px solid rgba(87, 242, 135, 0.3)',
                        borderRadius: '0.5rem',
                        color: '#f2f3f5',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                )}

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #5865f2 0%, #5865f2 100%)',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: '#0b0d13',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 14px rgba(88, 101, 242, 0.25)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(88, 101, 242, 0.35)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(88, 101, 242, 0.25)';
                  }}
                >
                  <Send size={18} />
                  Send Broadcast
                </button>
              </div>
            </div>

            {/* Messages Feed Panel */}
            <div className="messages-feed-panel" style={{
              background: 'linear-gradient(165deg, rgba(11, 13, 19, 0.95) 0%, rgba(21, 24, 31, 0.9) 100%)',
              borderRadius: '1.25rem',
              border: '1px solid rgba(88, 101, 242, 0.15)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
              minHeight: '400px'
            }}>
              {/* Header */}
              <div style={{
                padding: '1rem 1.25rem',
                background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.1) 0%, rgba(142, 161, 225, 0.05) 100%)',
                borderBottom: '1px solid rgba(88, 101, 242, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #5865f2 0%, #5865f2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(88, 101, 242, 0.3)'
                  }}>
                    <MessageSquare size={20} style={{ color: '#0b0d13' }} />
                  </div>
                  <div>
                    <h2 style={{ 
                      color: '#f2f3f5', 
                      margin: 0, 
                      fontSize: '1.125rem', 
                      fontWeight: 600,
                      fontFamily: "var(--font-display)"
                    }}>
                      Message History
                    </h2>
                    <p style={{ color: '#9aa0a6', margin: 0, fontSize: '0.8rem' }}>
                      {systemMessages.length} broadcasts sent
                    </p>
                  </div>
                </div>
                <div style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(87, 242, 135, 0.15)',
                  borderRadius: '2rem',
                  color: '#57f287',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}>
                  <div style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    background: '#57f287',
                    animation: 'pulse 2s infinite'
                  }} />
                  Live
                </div>
              </div>

              {/* Messages List */}
              <div style={{ 
                flex: 1, 
                padding: '1rem', 
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {systemMessages.length > 0 ? (
                  systemMessages.map((msg, index) => {
                    const getSeverityStyles = (severity: string) => {
                      switch (severity) {
                        case 'error':
                          return { 
                            accent: '#ed4245', 
                            bg: 'rgba(237, 66, 69, 0.1)', 
                            border: 'rgba(237, 66, 69, 0.25)',
                            icon: '🚨'
                          };
                        case 'warning':
                          return { 
                            accent: '#5865f2', 
                            bg: 'rgba(88, 101, 242, 0.1)', 
                            border: 'rgba(88, 101, 242, 0.25)',
                            icon: '⚠️'
                          };
                        default:
                          return { 
                            accent: '#57f287', 
                            bg: 'rgba(87, 242, 135, 0.1)', 
                            border: 'rgba(87, 242, 135, 0.25)',
                            icon: 'ℹ️'
                          };
                      }
                    };
                    const styles = getSeverityStyles(msg.severity);
                    
                    return (
                      <div
                        key={msg.id}
                        style={{
                          padding: '1.25rem',
                          background: styles.bg,
                          border: `1px solid ${styles.border}`,
                          borderLeft: `4px solid ${styles.accent}`,
                          borderRadius: '0.75rem',
                          transition: 'all 0.3s ease',
                          cursor: 'default'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateX(4px)';
                          e.currentTarget.style.background = styles.bg.replace('0.1', '0.15');
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.background = styles.bg;
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap',
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start', 
                          gap: '0.5rem',
                          marginBottom: '0.75rem' 
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: '1 1 auto' }}>
                            <span style={{ fontSize: '1rem', flexShrink: 0 }}>{styles.icon}</span>
                            <h4 style={{ 
                              color: '#f2f3f5', 
                              margin: 0, 
                              fontSize: '0.9rem', 
                              fontWeight: 600,
                              fontFamily: "var(--font-primary)",
                              wordBreak: 'break-word'
                            }}>
                              {msg.title}
                            </h4>
                          </div>
                          <span style={{ 
                            fontSize: '0.65rem', 
                            color: '#8b9098',
                            background: 'rgba(255,255,255,0.05)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            flexShrink: 0,
                            whiteSpace: 'nowrap'
                          }}>
                            {formatTimeAgo(msg.created_at)}
                          </span>
                        </div>
                        
                        <p style={{ 
                          color: '#c9ccd1', 
                          fontSize: '0.875rem', 
                          margin: '0 0 1rem 0', 
                          lineHeight: '1.6',
                          paddingLeft: '1.5rem',
                          wordBreak: 'break-word'
                        }}>
                          {msg.content}
                        </p>
                        
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap',
                          gap: '0.75rem 1.5rem', 
                          paddingLeft: '1.5rem',
                          borderTop: '1px solid rgba(255,255,255,0.05)',
                          paddingTop: '0.75rem',
                          marginTop: '0.5rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <Users size={12} style={{ color: '#8b9098' }} />
                            <span style={{ fontSize: '0.7rem', color: '#9aa0a6' }}>
                              {msg.broadcast_to === 'all_users' ? 'All Users' : 
                               msg.broadcast_to === 'specific_role' ? 'Role-based' : 'Direct'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <Shield size={12} style={{ color: '#8b9098' }} />
                            <span style={{ fontSize: '0.7rem', color: '#9aa0a6' }}>
                              {msg.created_by || 'System Admin'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    padding: '2rem 1.5rem',
                    color: '#8b9098'
                  }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'rgba(88, 101, 242, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem'
                    }}>
                      <MessageSquare size={28} style={{ color: '#5865f2', opacity: 0.5 }} />
                    </div>
                    <h3 style={{ 
                      color: '#9aa0a6', 
                      margin: '0 0 0.5rem 0', 
                      fontSize: '0.95rem',
                      fontWeight: 500
                    }}>
                      No Messages Yet
                    </h3>
                    <p style={{ 
                      color: '#8b9098', 
                      margin: 0, 
                      fontSize: '0.8rem',
                      textAlign: 'center',
                      maxWidth: '250px',
                      lineHeight: '1.5'
                    }}>
                      Start by composing a broadcast message to communicate with your users.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div style={{
            background: 'linear-gradient(165deg, rgba(11, 13, 19, 0.95) 0%, rgba(21, 24, 31, 0.9) 100%)',
            borderRadius: '1.25rem',
            border: '1px solid rgba(88, 101, 242, 0.15)',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            {/* Panel Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.1) 0%, rgba(88, 101, 242, 0.05) 100%)',
              borderBottom: '1px solid rgba(88, 101, 242, 0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #5865f2 0%, #5865f2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(88, 101, 242, 0.3)'
              }}>
                <Settings size={22} style={{ color: '#0b0d13' }} />
              </div>
              <div>
                <h2 style={{ 
                  color: '#f2f3f5', 
                  margin: 0, 
                  fontSize: '1.25rem', 
                  fontWeight: 600,
                  fontFamily: "var(--font-display)"
                }}>System Configuration</h2>
                <p style={{ color: '#9aa0a6', margin: 0, fontSize: '0.8rem' }}>Manage platform settings</p>
              </div>
            </div>

            {/* Settings Content */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Maintenance Mode Card */}
              <div style={{
                padding: '1.5rem',
                background: maintenanceMode 
                  ? 'linear-gradient(165deg, rgba(237, 66, 69, 0.08) 0%, rgba(11, 13, 19, 0.6) 100%)'
                  : 'linear-gradient(165deg, rgba(59, 165, 92, 0.08) 0%, rgba(11, 13, 19, 0.6) 100%)',
                border: `1px solid ${maintenanceMode ? 'rgba(237, 66, 69, 0.2)' : 'rgba(59, 165, 92, 0.2)'}`,
                borderRadius: '1rem',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: maintenanceMode 
                    ? 'linear-gradient(90deg, #ed4245, #f04747)'
                    : 'linear-gradient(90deg, #3ba55c, #57f287)'
                }} />
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start', 
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {maintenanceMode ? (
                        <AlertTriangle size={20} style={{ color: '#ff7b7b' }} />
                      ) : (
                        <CheckCircle size={20} style={{ color: '#57f287' }} />
                      )}
                      <h3 style={{ 
                        color: maintenanceMode ? '#ff7b7b' : '#57f287', 
                        margin: 0, 
                        fontSize: '1.1rem', 
                        fontWeight: 600 
                      }}>
                        Maintenance Mode
                      </h3>
                    </div>
                    <p style={{ color: '#9aa0a6', margin: 0, fontSize: '0.85rem', lineHeight: '1.5' }}>
                      {maintenanceMode 
                        ? 'Platform is currently in maintenance mode. Users cannot access the system.'
                        : 'Enable to temporarily disable user access for system updates or maintenance.'}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleMaintenance}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: maintenanceMode 
                        ? 'linear-gradient(135deg, #3ba55c 0%, #3ba55c 100%)'
                        : 'linear-gradient(135deg, #5865f2 0%, #5865f2 100%)',
                      border: 'none',
                      color: maintenanceMode ? '#FFFFFF' : '#0b0d13',
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: maintenanceMode 
                        ? '0 4px 15px rgba(59, 165, 92, 0.3)'
                        : '0 4px 15px rgba(88, 101, 242, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {maintenanceMode ? <Play size={18} /> : <Pause size={18} />}
                    {maintenanceMode ? 'Go Live' : 'Enable Maintenance'}
                  </button>
                </div>

                {maintenanceMode && (
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ 
                      display: 'block', 
                      color: '#5865f2', 
                      fontSize: '0.75rem', 
                      marginBottom: '0.5rem', 
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Message to Users
                    </label>
                    <textarea
                      value={maintenanceMessage}
                      onChange={(e) => setMaintenanceMessage(e.target.value)}
                      placeholder="Enter message to display to users during maintenance..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        background: 'rgba(11, 13, 19, 0.6)',
                        border: '1px solid rgba(88, 101, 242, 0.2)',
                        borderRadius: '0.75rem',
                        color: '#f2f3f5',
                        fontSize: '0.9rem',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                        resize: 'vertical',
                        lineHeight: '1.5'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* System Settings Card */}
              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(165deg, rgba(142, 161, 225, 0.05) 0%, rgba(11, 13, 19, 0.6) 100%)',
                border: '1px solid rgba(142, 161, 225, 0.15)',
                borderRadius: '1rem',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #8ea1e1, #00b0f4)'
                }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Database size={20} style={{ color: '#8ea1e1' }} />
                  <h3 style={{ color: '#8ea1e1', margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                    System Settings
                  </h3>
                </div>
                <p style={{ color: '#9aa0a6', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                  Current system configuration. Changes are synchronized in real-time across all users.
                </p>
                
                <div style={{ 
                  maxHeight: '280px', 
                  overflowY: 'auto',
                  background: 'rgba(11, 13, 19, 0.4)',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(142, 161, 225, 0.1)'
                }}>
                  {systemSettings && systemSettings.length > 0 ? (
                    systemSettings.map((setting, idx) => (
                      <div 
                        key={setting.key} 
                        style={{ 
                          padding: '1rem 1.25rem', 
                          borderBottom: idx < systemSettings.length - 1 ? '1px solid rgba(142, 161, 225, 0.08)' : 'none',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.5rem'
                        }}
                      >
                        <div>
                          <p style={{ 
                            color: '#8ea1e1', 
                            margin: '0 0 0.25rem 0', 
                            fontSize: '0.85rem', 
                            fontWeight: 600,
                            textTransform: 'capitalize'
                          }}>
                            {setting.key.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <span style={{ 
                          color: '#9aa0a6', 
                          fontSize: '0.8rem',
                          padding: '0.375rem 0.75rem',
                          background: 'rgba(142, 161, 225, 0.1)',
                          borderRadius: '0.5rem'
                        }}>
                          {setting.value || '(not set)'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                      <Key size={32} style={{ color: '#5f6670', marginBottom: '0.75rem', opacity: 0.5 }} />
                      <p style={{ color: '#8b9098', margin: 0, fontSize: '0.9rem' }}>No settings configured</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveSettings}
                style={{
                  width: '100%',
                  padding: '1rem 1.5rem',
                  background: 'linear-gradient(135deg, #3ba55c 0%, #3ba55c 100%)',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: '#FFFFFF',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.625rem',
                  boxShadow: '0 4px 15px rgba(59, 165, 92, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 165, 92, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 165, 92, 0.3)';
                }}
              >
                <CheckCircle size={20} />
                Save All Changes
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default SystemAdminDashboard;



