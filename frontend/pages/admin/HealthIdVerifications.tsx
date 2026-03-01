import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, RefreshCw, Check, X, FileText, ExternalLink, User, Clock, AlertCircle } from 'lucide-react';
import { db } from '../../services/db';

interface VerificationDoc {
  type: string;
  fileName: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
}

interface VerificationRequest {
  id: string | number;
  userId: string;
  userName: string;
  userEmail: string;
  healthId: string;
  hospitalId?: string;
  requestNote: string;
  requestedAt: string;
  status: string;
  documents: VerificationDoc[];
}

const HealthIdVerifications: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [rejectingId, setRejectingId] = useState<string | number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  const fetchRequests = async () => {
    try {
      setRefreshing(true);
      const items = await db.getHospitalVerificationRequests(statusFilter);
      setRequests(items as VerificationRequest[]);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load verification requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleApprove = async (id: string | number) => {
    try {
      await db.decideHospitalVerificationRequest(id as any, 'accepted');
      await fetchRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to approve request');
    }
  };

  const handleReject = async (id: string | number) => {
    try {
      await db.decideHospitalVerificationRequest(id as any, 'rejected', rejectReason);
      setRejectingId(null);
      setRejectReason('');
      await fetchRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to reject request');
    }
  };

  const getDocLabel = (type: string) => {
    const map: Record<string, string> = {
      'NID': 'National ID',
      'BIRTH_CERT': 'Birth Certificate',
      'MARRIAGE_CERT': 'Marriage Certificate',
      'MEDICAL_REPORT': 'Medical Report'
    };
    return map[type] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="admin-badge" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>Pending</span>;
      case 'accepted':
        return <span className="admin-badge" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>Accepted</span>;
      case 'rejected':
        return <span className="admin-badge" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>Rejected</span>;
      default:
        return <span className="admin-badge">{status}</span>;
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-logo-section">
            <button onClick={() => navigate(-1)} className="admin-btn admin-btn-secondary" style={{ marginRight: '1rem' }}>
              <ChevronLeft size={18} />
              Back
            </button>
            <div className="admin-logo-icon" style={{ background: '#047857' }}>
              <ShieldCheck size={26} style={{ color: '#f2f3f5' }} />
            </div>
            <div>
              <h1 className="admin-title">Health ID Verifications</h1>
              <p className="admin-subtitle">Review user documents and approve/reject verification requests</p>
            </div>
          </div>
          <div className="admin-actions">
            <button onClick={fetchRequests} className="admin-notification-btn" disabled={refreshing} title="Refresh">
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {error && (
          <div className="admin-panel" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#dc2626', padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="admin-panel" style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['pending', 'accepted', 'rejected', 'all'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`admin-btn ${statusFilter === s ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                style={{ textTransform: 'capitalize', fontSize: '0.8rem', padding: '0.4rem 1rem' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Requests list */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">
              Verification Requests ({requests.length})
            </h2>
          </div>

          {loading ? (
            <div className="admin-empty">Loading verification requests...</div>
          ) : requests.length === 0 ? (
            <div className="admin-empty">
              No {statusFilter !== 'all' ? statusFilter : ''} verification requests found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
              {requests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'white'
                  }}
                >
                  {/* Request header */}
                  <div
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      cursor: 'pointer',
                      background: expandedId === req.id ? '#f8fafc' : 'white',
                      transition: 'background 0.15s'
                    }}
                    onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.4rem', background: '#ecfdf5', borderRadius: '8px' }}>
                          <User size={16} style={{ color: '#047857' }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>{req.userName}</span>
                        {getStatusBadge(req.status)}
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#64748b' }}>
                        <span>Health ID: <strong style={{ color: '#047857' }}>{req.healthId}</strong></span>
                        {req.userEmail && <span>Email: {req.userEmail}</span>}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} />
                          {new Date(req.requestedAt).toLocaleString()}
                        </span>
                      </div>
                      {req.requestNote && (
                        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#475569', fontStyle: 'italic' }}>
                          Note: {req.requestNote}
                        </p>
                      )}
                      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                        {req.documents.length} document(s) submitted — click to {expandedId === req.id ? 'collapse' : 'view'}
                      </div>
                    </div>
                  </div>

                  {/* Expanded: Documents & Actions */}
                  {expandedId === req.id && (
                    <div style={{ borderTop: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', background: '#f8fafc' }}>
                      {/* Documents section */}
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                        Submitted Documents
                      </h4>
                      {req.documents.length === 0 ? (
                        <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '8px', color: '#dc2626', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <AlertCircle size={16} />
                          No documents were submitted with this request.
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                          {req.documents.map((doc, idx) => (
                            <div
                              key={idx}
                              style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                padding: '1rem',
                                background: 'white',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.75rem'
                              }}
                            >
                              <div style={{ padding: '0.4rem', background: '#eff6ff', borderRadius: '8px', flexShrink: 0 }}>
                                <FileText size={18} style={{ color: '#2563eb' }} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>{getDocLabel(doc.type)}</p>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.fileName}</p>
                                {doc.uploadedAt && (
                                  <p style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                                    Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              {doc.fileUrl && (
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    padding: '0.35rem',
                                    background: '#eff6ff',
                                    borderRadius: '6px',
                                    color: '#2563eb',
                                    flexShrink: 0
                                  }}
                                  title="View document"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action buttons (only for pending) */}
                      {req.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="admin-btn admin-btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#047857' }}
                          >
                            <Check size={16} /> Approve & Verify
                          </button>
                          {rejectingId === req.id ? (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1 }}>
                              <input
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Rejection reason (optional)"
                                className="admin-input"
                                style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                                autoFocus
                              />
                              <button
                                onClick={() => handleReject(req.id)}
                                className="admin-btn"
                                style={{ background: '#dc2626', color: 'white', fontSize: '0.8rem' }}
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => { setRejectingId(null); setRejectReason(''); }}
                                className="admin-btn admin-btn-secondary"
                                style={{ fontSize: '0.8rem' }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setRejectingId(req.id)}
                              className="admin-btn admin-btn-secondary"
                              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626', borderColor: '#fecaca' }}
                            >
                              <X size={16} /> Reject
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HealthIdVerifications;
