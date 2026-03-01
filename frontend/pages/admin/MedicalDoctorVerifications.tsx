import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, RefreshCw, UserCheck, CheckCircle, XCircle, Filter } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

interface DoctorVerification {
  id: string;
  doctor_name?: string;
  doctor_email?: string;
  specialty?: string;
  bmdc_reg_number?: string;
  experience_years?: number;
  hospital_affiliation?: string;
  status?: string;
  submitted_at?: string;
}

const statusOptions = [
  'PENDING',
  'UNDER_REVIEW',
  'ADDITIONAL_INFO_REQUIRED',
  'APPROVED',
  'REJECTED'
];

const MedicalDoctorVerifications: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('PENDING');
  const [verifications, setVerifications] = useState<DoctorVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchVerifications = async () => {
    try {
      setRefreshing(true);
      const data = await adminApi.medical.getDoctorVerifications(status);
      const items = data.verifications || data.items || [];
      setVerifications(items);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load verification requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [status]);

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      await adminApi.medical.reviewDoctorVerification(id, {
        status: 'APPROVED',
        reviewNotes: 'Approved via medical admin dashboard'
      });
      await fetchVerifications();
    } catch (err) {
      console.error('Failed to approve verification:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Rejection reason (required):', 'Incomplete documentation');
    if (!reason) return;
    try {
      setProcessingId(id);
      await adminApi.medical.reviewDoctorVerification(id, {
        status: 'REJECTED',
        reviewNotes: reason,
        rejectionReason: reason
      });
      await fetchVerifications();
    } catch (err) {
      console.error('Failed to reject verification:', err);
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
              <UserCheck size={26} style={{ color: '#f2f3f5' }} />
            </div>
            <div>
              <h1 className="admin-title">Doctor Verifications</h1>
              <p className="admin-subtitle">Review pending medical credentials</p>
            </div>
          </div>
          <div className="admin-actions">
            <button onClick={fetchVerifications} className="admin-notification-btn" disabled={refreshing} title="Refresh">
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">
              <Filter size={18} /> Filter
            </h2>
            <select
              className="admin-select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              style={{ maxWidth: 240 }}
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="admin-empty">Loading verification requests...</div>
          ) : error ? (
            <div className="admin-empty">{error}</div>
          ) : verifications.length === 0 ? (
            <div className="admin-empty">No verification requests for this status.</div>
          ) : (
            <div className="admin-list">
              {verifications.map((item) => (
                <div key={item.id} className="admin-list-item" style={{ alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span className="text-cream" style={{ fontWeight: 700 }}>
                        {item.doctor_name || 'Doctor'}
                      </span>
                      <span className="admin-status admin-status-warning">{item.status || 'PENDING'}</span>
                    </div>
                    <p className="text-muted" style={{ margin: 0 }}>
                      {item.specialty || 'General'} • {item.hospital_affiliation || 'Hospital not listed'}
                    </p>
                    <p className="text-muted" style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem' }}>
                      {item.doctor_email || 'Email unavailable'} • BMDC {item.bmdc_reg_number || 'N/A'} • {item.experience_years || 0} yrs
                    </p>
                    {item.submitted_at && (
                      <p className="text-muted" style={{ margin: '0.35rem 0 0 0', fontSize: '0.75rem' }}>
                        Submitted: {new Date(item.submitted_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      className="admin-btn admin-btn-primary"
                      disabled={processingId === item.id || item.status === 'APPROVED'}
                      onClick={() => handleApprove(item.id)}
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      className="admin-btn admin-btn-danger"
                      disabled={processingId === item.id || item.status === 'REJECTED'}
                      onClick={() => handleReject(item.id)}
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
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

export default MedicalDoctorVerifications;


