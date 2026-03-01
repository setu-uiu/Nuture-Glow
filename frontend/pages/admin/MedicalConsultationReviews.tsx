import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, RefreshCw, CheckCircle, Flag, Filter } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

interface ConsultationReview {
  id: string;
  doctor_email?: string;
  patient_email?: string;
  review_status?: string;
  quality_score?: number;
  completeness_score?: number;
  professionalism_score?: number;
  created_at?: string;
}

const statusOptions = ['PENDING', 'IN_REVIEW', 'APPROVED', 'FLAGGED', 'ESCALATED'];

const MedicalConsultationReviews: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('PENDING');
  const [reviews, setReviews] = useState<ConsultationReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setRefreshing(true);
      const data = await adminApi.medical.getConsultationReviews(status);
      const items = data.reviews || data.items || [];
      setReviews(items);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load consultation reviews');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [status]);

  const promptScore = (label: string, fallback = 0) => {
    const value = window.prompt(`${label} (0-100):`, `${fallback}`);
    if (!value) return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const handleReview = async (reviewId: string, reviewStatus: 'APPROVED' | 'FLAGGED') => {
    const qualityScore = promptScore('Quality score');
    const completenessScore = promptScore('Completeness score');
    const professionalismScore = promptScore('Professionalism score');
    const reviewNotes = window.prompt('Review notes:', '') || '';

    try {
      setProcessingId(reviewId);
      await adminApi.medical.reviewConsultation(reviewId, {
        reviewStatus,
        qualityScore,
        completenessScore,
        professionalismScore,
        reviewNotes,
        flaggedIssues: reviewStatus === 'FLAGGED' ? { reason: reviewNotes } : undefined
      });
      await fetchReviews();
    } catch (err) {
      console.error('Failed to update review:', err);
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
              <FileText size={26} style={{ color: '#f2f3f5' }} />
            </div>
            <div>
              <h1 className="admin-title">Consultation Reviews</h1>
              <p className="admin-subtitle">Quality audits for clinical consultations</p>
            </div>
          </div>
          <div className="admin-actions">
            <button onClick={fetchReviews} className="admin-notification-btn" disabled={refreshing} title="Refresh">
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">
              <Filter size={18} /> Review Status
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
            <div className="admin-empty">Loading consultation reviews...</div>
          ) : error ? (
            <div className="admin-empty">{error}</div>
          ) : reviews.length === 0 ? (
            <div className="admin-empty">No reviews for this status.</div>
          ) : (
            <div className="admin-list">
              {reviews.map((item) => (
                <div key={item.id} className="admin-list-item" style={{ alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                      <span className="text-cream" style={{ fontWeight: 700 }}>
                        {item.doctor_email || 'Doctor'} → {item.patient_email || 'Patient'}
                      </span>
                      <span className="admin-status admin-status-info">
                        {item.review_status || 'PENDING'}
                      </span>
                    </div>
                    <p className="text-muted" style={{ margin: 0 }}>
                      Quality: {item.quality_score ?? 'N/A'} • Completeness: {item.completeness_score ?? 'N/A'} • Professionalism: {item.professionalism_score ?? 'N/A'}
                    </p>
                    {item.created_at && (
                      <p className="text-muted" style={{ margin: '0.35rem 0 0 0', fontSize: '0.75rem' }}>
                        Created: {new Date(item.created_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      className="admin-btn admin-btn-primary"
                      disabled={processingId === item.id}
                      onClick={() => handleReview(item.id, 'APPROVED')}
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      className="admin-btn admin-btn-danger"
                      disabled={processingId === item.id}
                      onClick={() => handleReview(item.id, 'FLAGGED')}
                    >
                      <Flag size={16} />
                      Flag
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

export default MedicalConsultationReviews;


