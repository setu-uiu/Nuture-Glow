import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import {
  ChevronLeft,
  MessageSquare,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface Appeal {
  id: string;
  userId: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  submittedAt: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  resolutionMessage?: string | null;
  userEmail?: string | null;
  userPhone?: string | null;
  userName?: string | null;
  suspension?: {
    reason?: string | null;
    suspendedAt?: string | null;
  } | null;
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'approved':
      return { text: 'Approved', color: '#57f287', bg: 'rgba(87, 242, 135, 0.15)' };
    case 'rejected':
      return { text: 'Rejected', color: '#ff7b7b', bg: 'rgba(237, 66, 69, 0.15)' };
    default:
      return { text: 'Pending', color: '#5865f2', bg: 'rgba(88, 101, 242, 0.2)' };
  }
};

const formatDateTime = (value?: string | null) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString();
};

const SuspensionAppeals: React.FC = () => {
  const navigate = useNavigate();
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionStatus, setResolutionStatus] = useState<'approved' | 'rejected'>('approved');
  const [resolutionMessage, setResolutionMessage] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchAppeals();
  }, []);

  const fetchAppeals = async () => {
    try {
      setLoading(true);
      const data = await adminApi.system.getSuspensionAppeals();
      setAppeals(data.appeals || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load appeals');
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(() => {
    return appeals.reduce(
      (acc, appeal) => {
        acc.total += 1;
        if (appeal.status === 'approved') acc.approved += 1;
        else if (appeal.status === 'rejected') acc.rejected += 1;
        else acc.pending += 1;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0 }
    );
  }, [appeals]);

  const displayedAppeals = useMemo(() => {
    return appeals.filter((appeal) => {
      if (statusFilter !== 'all' && appeal.status !== statusFilter) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        appeal.userEmail?.toLowerCase().includes(term) ||
        appeal.userName?.toLowerCase().includes(term) ||
        appeal.userPhone?.toLowerCase().includes(term) ||
        appeal.message?.toLowerCase().includes(term)
      );
    });
  }, [appeals, statusFilter, searchTerm]);

  const openResolveModal = (appeal: Appeal, status: 'approved' | 'rejected') => {
    setSelectedAppeal(appeal);
    setResolutionStatus(status);
    setResolutionMessage('');
    setShowResolveModal(true);
  };

  const handleResolve = async () => {
    if (!selectedAppeal) return;
    try {
      setResolving(true);
      await adminApi.system.resolveSuspensionAppeal(selectedAppeal.id, {
        status: resolutionStatus,
        resolutionMessage: resolutionMessage.trim() || undefined
      });
      setShowResolveModal(false);
      setSelectedAppeal(null);
      await fetchAppeals();
    } catch (err: any) {
      alert('Failed to resolve appeal: ' + err.message);
    } finally {
      setResolving(false);
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
              <MessageSquare size={28} style={{ color: '#f2f3f5' }} />
            </div>
            <div>
              <h1 className="admin-title">Suspension Appeals</h1>
              <p className="admin-subtitle">Review and resolve user appeals</p>
            </div>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {/* Summary */}
        <div className="admin-stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #00b0f4 0%, #00b0f4 100%)' }}>
                <MessageSquare size={22} />
              </div>
              <span className="admin-stat-badge positive">Total</span>
            </div>
            <div className="admin-stat-value">{counts.total}</div>
            <p className="admin-stat-label">Appeals</p>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #fee75c 0%, #fee75c 100%)' }}>
                <AlertTriangle size={22} />
              </div>
              <span className="admin-stat-badge warning">Pending</span>
            </div>
            <div className="admin-stat-value">{counts.pending}</div>
            <p className="admin-stat-label">Awaiting Review</p>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #3ba55c 0%, #57f287 100%)' }}>
                <CheckCircle size={22} />
              </div>
              <span className="admin-stat-badge positive">Resolved</span>
            </div>
            <div className="admin-stat-value">{counts.approved + counts.rejected}</div>
            <p className="admin-stat-label">Closed</p>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-panel" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <input
                type="text"
                placeholder="Search by user, email, phone, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(24, 29, 45, 0.3)',
                  border: '1px solid rgba(88, 101, 242, 0.2)',
                  borderRadius: '0.5rem',
                  color: '#f2f3f5',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              style={{
                padding: '0.75rem 1rem',
                background: 'rgba(24, 29, 45, 0.3)',
                border: '1px solid rgba(88, 101, 242, 0.2)',
                borderRadius: '0.5rem',
                color: '#f2f3f5',
                fontSize: '0.875rem'
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button onClick={fetchAppeals} className="admin-btn admin-btn-secondary" disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Appeals List */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Appeals ({displayedAppeals.length})</h2>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9aa0a6' }}>
              <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem' }} />
              <p>Loading appeals...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <AlertTriangle size={48} style={{ color: '#f7a6a8', margin: '0 auto 1rem' }} />
              <p style={{ color: '#f7a6a8' }}>{error}</p>
            </div>
          ) : displayedAppeals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9aa0a6' }}>
              <MessageSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No appeals found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {displayedAppeals.map((appeal) => {
                const badge = statusLabel(appeal.status);
                return (
                  <div
                    key={appeal.id}
                    style={{
                      padding: '1.5rem',
                      background: 'rgba(24, 29, 45, 0.3)',
                      border: '1px solid rgba(88, 101, 242, 0.12)',
                      borderRadius: '0.75rem',
                      display: 'flex',
                      gap: '1.5rem',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ minWidth: '260px', flex: '1 1 320px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '999px',
                            background: badge.bg,
                            color: badge.color,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}
                        >
                          {badge.text}
                        </span>
                        <span style={{ color: '#9aa0a6', fontSize: '0.75rem' }}>ID: {appeal.id}</span>
                      </div>
                      <h3 style={{ color: '#f2f3f5', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {appeal.userName || appeal.userEmail || 'Unknown User'}
                      </h3>
                      <div style={{ color: '#9aa0a6', fontSize: '0.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <span>Email: {appeal.userEmail || 'N/A'}</span>
                        <span>Phone: {appeal.userPhone || 'N/A'}</span>
                      </div>
                      <div style={{ marginTop: '0.75rem', color: '#b8c2ff', fontSize: '0.8rem', fontWeight: 600 }}>
                        Appeal Message
                      </div>
                      <p style={{ color: '#f2f3f5', fontSize: '0.85rem', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>
                        {appeal.message || 'No message provided.'}
                      </p>
                      {appeal.suspension?.reason && (
                        <>
                          <div style={{ marginTop: '0.75rem', color: '#00b0f4', fontSize: '0.8rem', fontWeight: 600 }}>
                            Suspension Reason
                          </div>
                          <p style={{ color: '#8ea1e1', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                            {appeal.suspension.reason}
                          </p>
                        </>
                      )}
                    </div>
                    <div style={{ minWidth: '220px', flex: '0 1 260px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ color: '#9aa0a6', fontSize: '0.75rem' }}>
                        <div>Submitted: {formatDateTime(appeal.submittedAt)}</div>
                        <div>Suspended: {formatDateTime(appeal.suspension?.suspendedAt)}</div>
                        {appeal.resolvedAt && <div>Resolved: {formatDateTime(appeal.resolvedAt)}</div>}
                      </div>

                      {appeal.resolutionMessage && (
                        <div style={{ background: 'rgba(17, 20, 29, 0.5)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                          <div style={{ color: '#b8c2ff', fontSize: '0.75rem', fontWeight: 600 }}>Resolution</div>
                          <p style={{ color: '#f2f3f5', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                            {appeal.resolutionMessage}
                          </p>
                        </div>
                      )}

                      {appeal.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => openResolveModal(appeal, 'approved')}
                            className="admin-btn admin-btn-primary"
                            style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
                          >
                            <CheckCircle size={14} />
                            Approve
                          </button>
                          <button
                            onClick={() => openResolveModal(appeal, 'rejected')}
                            className="admin-btn admin-btn-danger"
                            style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Resolve Modal */}
      {showResolveModal && selectedAppeal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(16, 19, 26, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div className="admin-panel" style={{ maxWidth: '640px', width: '90%' }}>
            <div className="admin-panel-header">
              <h2 className="admin-panel-title">Resolve Appeal</h2>
              <button onClick={() => setShowResolveModal(false)} className="admin-btn admin-btn-secondary">
                <XCircle size={16} />
              </button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <div style={{ marginBottom: '1rem', color: '#9aa0a6', fontSize: '0.85rem' }}>
                <strong style={{ color: '#f2f3f5' }}>{selectedAppeal.userName || selectedAppeal.userEmail}</strong>
                <div>Appeal message: {selectedAppeal.message || 'No message provided.'}</div>
              </div>

              <label className="admin-label">Decision</label>
              <select
                value={resolutionStatus}
                onChange={(e) => setResolutionStatus(e.target.value as 'approved' | 'rejected')}
                className="admin-select"
                style={{ marginBottom: '1rem' }}
              >
                <option value="approved">Approve appeal</option>
                <option value="rejected">Reject appeal</option>
              </select>

              <label className="admin-label">Resolution message (optional)</label>
              <textarea
                value={resolutionMessage}
                onChange={(e) => setResolutionMessage(e.target.value)}
                className="admin-textarea"
                rows={4}
                placeholder="Provide a reason or next steps for the user..."
                style={{ marginBottom: '1.5rem' }}
              />

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleResolve}
                  className="admin-btn admin-btn-primary"
                  disabled={resolving}
                  style={{ flex: 1 }}
                >
                  {resolving ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  Resolve Appeal
                </button>
                <button
                  onClick={() => setShowResolveModal(false)}
                  className="admin-btn admin-btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuspensionAppeals;


