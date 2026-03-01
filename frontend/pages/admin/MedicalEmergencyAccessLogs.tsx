import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldAlert, RefreshCw, PlusCircle } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

interface EmergencyLog {
  id: string;
  accessor_email?: string;
  patient_email?: string;
  access_type?: string;
  reason?: string;
  emergency_level?: string;
  accessed_at?: string;
  ip_address?: string;
}

const MedicalEmergencyAccessLogs: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<EmergencyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    patientUserId: '',
    accessType: 'OVERRIDE',
    reason: '',
    emergencyLevel: 'CRITICAL',
    dataAccessed: ''
  });

  const fetchLogs = async () => {
    try {
      setRefreshing(true);
      const data = await adminApi.medical.getEmergencyAccessLogs();
      const items = data.logs || data.items || [];
      setLogs(items);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load emergency access logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleLog = async () => {
    if (!form.patientUserId || !form.reason) {
      setError('Patient ID and reason are required to log access.');
      return;
    }
    try {
      await adminApi.medical.logEmergencyAccess({
        patientUserId: form.patientUserId,
        accessType: form.accessType,
        reason: form.reason,
        emergencyLevel: form.emergencyLevel,
        dataAccessed: form.dataAccessed ? { details: form.dataAccessed } : {}
      });
      setForm({
        patientUserId: '',
        accessType: 'OVERRIDE',
        reason: '',
        emergencyLevel: 'CRITICAL',
        dataAccessed: ''
      });
      await fetchLogs();
    } catch (err: any) {
      setError(err.message || 'Failed to log emergency access');
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-logo-section">
            <button onClick={() => navigate('/admin/medical')} className="admin-btn admin-btn-secondary" style={{ marginRight: '1rem' }}>
              <ChevronLeft size={18} />
              Back
            </button>
            <div className="admin-logo-icon">
              <ShieldAlert size={26} style={{ color: '#f2f3f5' }} />
            </div>
            <div>
              <h1 className="admin-title">Emergency Access Logs</h1>
              <p className="admin-subtitle">Track emergency overrides and audits</p>
            </div>
          </div>
          <div className="admin-actions">
            <button onClick={fetchLogs} className="admin-notification-btn" disabled={refreshing} title="Refresh">
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Log Emergency Access</h2>
            <button className="admin-btn admin-btn-primary" onClick={handleLog}>
              <PlusCircle size={16} />
              Log Access
            </button>
          </div>
          <div className="admin-grid-2">
            <div>
              <label className="admin-label">Patient User ID</label>
              <input
                className="admin-input"
                value={form.patientUserId}
                onChange={(event) => setForm({ ...form, patientUserId: event.target.value })}
                placeholder="patient_user_id"
              />
            </div>
            <div>
              <label className="admin-label">Emergency Level</label>
              <select
                className="admin-select"
                value={form.emergencyLevel}
                onChange={(event) => setForm({ ...form, emergencyLevel: event.target.value })}
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
              </select>
            </div>
            <div>
              <label className="admin-label">Access Type</label>
              <input
                className="admin-input"
                value={form.accessType}
                onChange={(event) => setForm({ ...form, accessType: event.target.value })}
                placeholder="OVERRIDE"
              />
            </div>
            <div>
              <label className="admin-label">Data Accessed (summary)</label>
              <input
                className="admin-input"
                value={form.dataAccessed}
                onChange={(event) => setForm({ ...form, dataAccessed: event.target.value })}
                placeholder="Vitals, lab results, emergency notes"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="admin-label">Reason</label>
              <textarea
                className="admin-textarea"
                rows={3}
                value={form.reason}
                onChange={(event) => setForm({ ...form, reason: event.target.value })}
                placeholder="Describe emergency reason"
              />
            </div>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Recent Access Logs</h2>
          </div>
          {loading ? (
            <div className="admin-empty">Loading logs...</div>
          ) : error ? (
            <div className="admin-empty">{error}</div>
          ) : logs.length === 0 ? (
            <div className="admin-empty">No emergency access logs found.</div>
          ) : (
            <div className="admin-list">
              {logs.map((log) => (
                <div key={log.id} className="admin-list-item" style={{ alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                      <span className="text-cream" style={{ fontWeight: 700 }}>
                        {log.accessor_email || 'Accessor'} → {log.patient_email || 'Patient'}
                      </span>
                      <span className="admin-status admin-status-critical">
                        {log.emergency_level || 'CRITICAL'}
                      </span>
                    </div>
                    <p className="text-muted" style={{ margin: 0 }}>
                      {log.access_type || 'OVERRIDE'} • {log.reason || 'Reason not recorded'}
                    </p>
                    {log.accessed_at && (
                      <p className="text-muted" style={{ margin: '0.35rem 0 0 0', fontSize: '0.75rem' }}>
                        {new Date(log.accessed_at).toLocaleString()} • IP {log.ip_address || 'N/A'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MedicalEmergencyAccessLogs;


