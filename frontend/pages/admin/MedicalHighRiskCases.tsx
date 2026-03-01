import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, RefreshCw, CalendarClock, CheckCircle, AlertOctagon } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

interface HighRiskCase {
  id: string;
  patient_email?: string;
  patient_phone?: string;
  risk_level?: string;
  risk_factors?: any;
  symptoms?: string;
  current_week?: number;
  status?: string;
  flagged_at?: string;
  assigned_doctor_id?: string;
  notes?: string;
}

const statusOptions = ['ACTIVE', 'RESOLVED', 'EMERGENCY', 'HOSPITALIZED'];

const MedicalHighRiskCases: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('ACTIVE');
  const [cases, setCases] = useState<HighRiskCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const parseRiskFactors = (raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const fetchCases = async () => {
    try {
      setRefreshing(true);
      const data = await adminApi.medical.getHighRiskCases(status);
      const items = data.cases || data.items || [];
      setCases(items);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load high-risk cases');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [status]);

  const updateCase = async (caseId: string, payload: any) => {
    try {
      setProcessingId(caseId);
      await adminApi.medical.updateHighRiskCase(caseId, payload);
      await fetchCases();
    } catch (err) {
      console.error('Failed to update case:', err);
    } finally {
      setProcessingId(null);
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
              <AlertTriangle size={26} style={{ color: '#f2f3f5' }} />
            </div>
            <div>
              <h1 className="admin-title">High-Risk Cases</h1>
              <p className="admin-subtitle">Monitor critical maternal cases</p>
            </div>
          </div>
          <div className="admin-actions">
            <button onClick={fetchCases} className="admin-notification-btn" disabled={refreshing} title="Refresh">
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Case Status</h2>
            <select
              className="admin-select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              style={{ maxWidth: 220 }}
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="admin-empty">Loading high-risk cases...</div>
          ) : error ? (
            <div className="admin-empty">{error}</div>
          ) : cases.length === 0 ? (
            <div className="admin-empty">No cases in this status.</div>
          ) : (
            <div className="admin-list">
              {cases.map((item) => {
                const factors = parseRiskFactors(item.risk_factors);
                return (
                  <div key={item.id} className="admin-list-item" style={{ alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                        <span className="text-cream" style={{ fontWeight: 700 }}>
                          {item.patient_email || item.patient_phone || 'Patient'}
                        </span>
                        <span className="admin-status admin-status-critical">
                          {item.risk_level || 'HIGH'}
                        </span>
                        <span className="admin-status admin-status-warning">
                          {item.status || 'ACTIVE'}
                        </span>
                      </div>
                      <p className="text-muted" style={{ margin: 0 }}>
                        Week {item.current_week || 'N/A'} • {item.symptoms || 'No symptoms noted'}
                      </p>
                      {factors.length > 0 && (
                        <p className="text-muted" style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem' }}>
                          Risk factors: {factors.join(', ')}
                        </p>
                      )}
                      {item.flagged_at && (
                        <p className="text-muted" style={{ margin: '0.35rem 0 0 0', fontSize: '0.75rem' }}>
                          Flagged: {new Date(item.flagged_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        className="admin-btn admin-btn-primary"
                        disabled={processingId === item.id || item.status === 'RESOLVED'}
                        onClick={() => updateCase(item.id, { status: 'RESOLVED' })}
                      >
                        <CheckCircle size={16} />
                        Resolve
                      </button>
                      <button
                        className="admin-btn admin-btn-danger"
                        disabled={processingId === item.id || item.status === 'EMERGENCY'}
                        onClick={() => updateCase(item.id, { status: 'EMERGENCY' })}
                      >
                        <AlertOctagon size={16} />
                        Escalate
                      </button>
                      <button
                        className="admin-btn admin-btn-secondary"
                        disabled={processingId === item.id}
                        onClick={() => {
                          const nextCheckup = window.prompt('Next checkup date (YYYY-MM-DD):');
                          if (nextCheckup) updateCase(item.id, { nextCheckup });
                        }}
                      >
                        <CalendarClock size={16} />
                        Next Checkup
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MedicalHighRiskCases;


