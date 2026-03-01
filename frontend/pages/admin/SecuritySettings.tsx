import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import { 
  Shield, 
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Filter,
  Download,
  Eye,
  Ban,
  Plus,
  Trash2,
  FileText
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  event_type: string;
  description: string;
  severity: string;
  user_id?: string;
  ip_address?: string;
  created_at: string;
  resolved: boolean;
}

interface BlacklistedIP {
  id: string;
  ip_address: string;
  reason: string;
  blocked_by: string;
  created_at: string;
  expires_at?: string;
}

const SecuritySettings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'events' | 'blacklist'>('events');
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [blacklistedIPs, setBlacklistedIPs] = useState<BlacklistedIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [resolvedFilter, setResolvedFilter] = useState<boolean | undefined>(undefined);
  
  // IP Blacklist form
  const [showAddIP, setShowAddIP] = useState(false);
  const [newIP, setNewIP] = useState({ ip_address: '', reason: '', expires_at: '' });
  const [addingIP, setAddingIP] = useState(false);
  
  // Export state
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchSecurityEvents();
    fetchBlacklistedIPs();
  }, [severityFilter, resolvedFilter]);

  const fetchSecurityEvents = async () => {
    try {
      setLoading(true);
      const data = await adminApi.system.getSecurityEvents(resolvedFilter, severityFilter);
      setEvents(data.events || []);
    } catch (err) {
      console.error('Failed to fetch security events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlacklistedIPs = async () => {
    try {
      const data = await adminApi.system.getBlacklistedIPs();
      setBlacklistedIPs(data.blacklist || []);
    } catch (err) {
      console.error('Failed to fetch blacklisted IPs:', err);
    }
  };

  const handleResolve = async (eventId: string) => {
    try {
      await adminApi.system.resolveSecurityEvent(eventId);
      await fetchSecurityEvents();
    } catch (err: any) {
      alert('Failed to resolve event: ' + err.message);
    }
  };

  const handleAddIP = async () => {
    if (!newIP.ip_address || !newIP.reason) {
      alert('Please enter IP address and reason');
      return;
    }
    
    try {
      setAddingIP(true);
      await adminApi.system.addBlacklistedIP(newIP);
      alert('IP address blacklisted successfully');
      setNewIP({ ip_address: '', reason: '', expires_at: '' });
      setShowAddIP(false);
      await fetchBlacklistedIPs();
    } catch (err: any) {
      alert('Failed to blacklist IP: ' + err.message);
    } finally {
      setAddingIP(false);
    }
  };

  const handleRemoveIP = async (id: string) => {
    if (!confirm('Are you sure you want to remove this IP from the blacklist?')) return;
    
    try {
      await adminApi.system.removeBlacklistedIP(id);
      await fetchBlacklistedIPs();
    } catch (err: any) {
      alert('Failed to remove IP: ' + err.message);
    }
  };

  const handleExportAuditTrail = async () => {
    try {
      setExporting(true);
      const blob = await adminApi.system.exportAuditTrail();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_trail_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (err: any) {
      alert('Failed to export audit trail: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return { bg: 'rgba(237, 66, 69, 0.2)', text: '#f7a6a8', border: 'rgba(237, 66, 69, 0.4)' };
      case 'HIGH': return { bg: 'rgba(88, 101, 242, 0.2)', text: '#b8c2ff', border: 'rgba(88, 101, 242, 0.4)' };
      case 'MEDIUM': return { bg: 'rgba(88, 101, 242, 0.2)', text: '#b8c2ff', border: 'rgba(88, 101, 242, 0.4)' };
      default: return { bg: 'rgba(59, 165, 92, 0.2)', text: '#8ea1e1', border: 'rgba(59, 165, 92, 0.4)' };
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-logo-section">
            <button onClick={() => navigate('/admin/system')} className="admin-btn admin-btn-secondary" style={{ marginRight: '1rem' }}>
              <ChevronLeft size={18} />
              Back
            </button>
            <div className="admin-logo-icon">
              <Shield size={28} style={{ color: '#f2f3f5' }} />
            </div>
            <div>
              <h1 className="admin-title">Security Settings</h1>
              <p className="admin-subtitle">Security events and audit logs</p>
            </div>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('events')}
            className={`admin-btn ${activeTab === 'events' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
          >
            <AlertTriangle size={16} />
            Security Events
          </button>
          <button
            onClick={() => setActiveTab('blacklist')}
            className={`admin-btn ${activeTab === 'blacklist' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
          >
            <Ban size={16} />
            IP Blacklist
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={handleExportAuditTrail}
            className="admin-btn admin-btn-secondary"
            disabled={exporting}
          >
            {exporting ? <RefreshCw size={16} className="animate-spin" /> : <FileText size={16} />}
            Export Audit Trail
          </button>
        </div>

        {activeTab === 'events' && (
          <>
            {/* Filters */}
            <div className="admin-panel" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(24, 29, 45, 0.3)',
                    border: '1px solid rgba(88, 101, 242, 0.2)',
                    borderRadius: '0.5rem',
                color: '#f2f3f5',
                fontSize: '0.875rem'
              }}
            >
              <option value="">All Severities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>

            <select
              value={resolvedFilter === undefined ? '' : resolvedFilter ? 'true' : 'false'}
              onChange={(e) => setResolvedFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
              style={{
                padding: '0.75rem 1rem',
                background: 'rgba(24, 29, 45, 0.3)',
                border: '1px solid rgba(88, 101, 242, 0.2)',
                borderRadius: '0.5rem',
                color: '#f2f3f5',
                fontSize: '0.875rem'
              }}
            >
              <option value="">All Events</option>
              <option value="false">Unresolved</option>
              <option value="true">Resolved</option>
            </select>

            <button onClick={fetchSecurityEvents} className="admin-btn admin-btn-secondary">
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Security Events */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Security Events ({events.length})</h2>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9aa0a6' }}>
              <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem' }} />
              <p>Loading security events...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {events.map((event) => {
                const colors = getSeverityColor(event.severity);
                return (
                  <div
                    key={event.id}
                    style={{
                      padding: '1.5rem',
                      background: 'rgba(24, 29, 45, 0.3)',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                          <h3 style={{ color: '#f2f3f5', fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                            {event.event_type}
                          </h3>
                          <span style={{
                            padding: '0.375rem 0.75rem',
                            background: colors.bg,
                            color: colors.text,
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}>
                            {event.severity}
                          </span>
                          {event.resolved && (
                            <span style={{
                              padding: '0.375rem 0.75rem',
                              background: 'rgba(59, 165, 92, 0.2)',
                              color: '#8ea1e1',
                              borderRadius: '0.375rem',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              <CheckCircle size={12} />
                              RESOLVED
                            </span>
                          )}
                        </div>
                        <p style={{ color: '#9aa0a6', fontSize: '0.875rem', margin: 0, marginBottom: '0.75rem' }}>
                          {event.description}
                        </p>
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: '#9aa0a6' }}>
                          <span>IP: {event.ip_address || 'N/A'}</span>
                          <span>Time: {new Date(event.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      {!event.resolved && (
                        <button
                          onClick={() => handleResolve(event.id)}
                          className="admin-btn admin-btn-primary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                        >
                          <CheckCircle size={14} />
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {events.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#9aa0a6' }}>
                  <Shield size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>No security events found</p>
                </div>
              )}
            </div>
          )}
        </div>
          </>
        )}

        {activeTab === 'blacklist' && (
          <>
            {/* Add IP Form */}
            <div className="admin-panel" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showAddIP ? '1.5rem' : 0 }}>
                <div>
                  <h3 style={{ color: '#f2f3f5', fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    IP Blacklist Management
                  </h3>
                  <p style={{ color: '#9aa0a6', fontSize: '0.75rem', margin: 0 }}>
                    Block malicious IP addresses from accessing the system
                  </p>
                </div>
                <button
                  onClick={() => setShowAddIP(!showAddIP)}
                  className="admin-btn admin-btn-primary"
                >
                  <Plus size={16} />
                  {showAddIP ? 'Cancel' : 'Block IP'}
                </button>
              </div>

              {showAddIP && (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr auto', 
                  gap: '1rem', 
                  padding: '1.5rem',
                  background: 'rgba(24, 29, 45, 0.3)',
                  borderRadius: '0.5rem'
                }}>
                  <div>
                    <label style={{ display: 'block', color: '#9aa0a6', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                      IP Address *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 192.168.1.100"
                      value={newIP.ip_address}
                      onChange={(e) => setNewIP({ ...newIP, ip_address: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(16, 19, 26, 0.5)',
                        border: '1px solid rgba(88, 101, 242, 0.2)',
                        borderRadius: '0.5rem',
                        color: '#f2f3f5',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#9aa0a6', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                      Reason *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Brute force attempts"
                      value={newIP.reason}
                      onChange={(e) => setNewIP({ ...newIP, reason: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(16, 19, 26, 0.5)',
                        border: '1px solid rgba(88, 101, 242, 0.2)',
                        borderRadius: '0.5rem',
                        color: '#f2f3f5',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#9aa0a6', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                      Expires At (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={newIP.expires_at}
                      onChange={(e) => setNewIP({ ...newIP, expires_at: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(16, 19, 26, 0.5)',
                        border: '1px solid rgba(88, 101, 242, 0.2)',
                        borderRadius: '0.5rem',
                        color: '#f2f3f5',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                      onClick={handleAddIP}
                      disabled={addingIP}
                      className="admin-btn admin-btn-primary"
                      style={{ height: '42px' }}
                    >
                      {addingIP ? <RefreshCw size={16} className="animate-spin" /> : <Ban size={16} />}
                      Block
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Blacklisted IPs List */}
            <div className="admin-panel">
              <div className="admin-panel-header">
                <h2 className="admin-panel-title">Blocked IPs ({blacklistedIPs.length})</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {blacklistedIPs.map((ip) => (
                  <div
                    key={ip.id}
                    style={{
                      padding: '1.25rem',
                      background: 'rgba(237, 66, 69, 0.1)',
                      border: '1px solid rgba(237, 66, 69, 0.3)',
                      borderRadius: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        padding: '0.75rem',
                        background: 'rgba(237, 66, 69, 0.2)',
                        borderRadius: '0.5rem'
                      }}>
                        <Ban size={20} style={{ color: '#f7a6a8' }} />
                      </div>
                      <div>
                        <h4 style={{ color: '#f2f3f5', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                          {ip.ip_address}
                        </h4>
                        <p style={{ color: '#f7a6a8', fontSize: '0.75rem', margin: 0, marginBottom: '0.25rem' }}>
                          {ip.reason}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem', color: '#9aa0a6' }}>
                          <span>Blocked: {new Date(ip.created_at).toLocaleString()}</span>
                          {ip.expires_at && <span>Expires: {new Date(ip.expires_at).toLocaleString()}</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveIP(ip.id)}
                      className="admin-btn admin-btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                    >
                      <Trash2 size={14} />
                      Unblock
                    </button>
                  </div>
                ))}

                {blacklistedIPs.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#9aa0a6' }}>
                    <CheckCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5, color: '#8ea1e1' }} />
                    <p>No blocked IP addresses</p>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>The system is currently not blocking any IPs</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SecuritySettings;


