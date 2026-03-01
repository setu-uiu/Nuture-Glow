import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/adminApi';
import { 
  Shield, 
  Users, 
  Activity, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  UserCheck,
  Stethoscope,
  AlertCircle as Alert,
  Bell,
  LogOut,
  RefreshCw,
  Eye,
  Plus,
  Heart
} from 'lucide-react';

interface DashboardData {
  stats?: {
    pending_doctor_verifications?: number;
    high_risk_pregnancies?: number;
    pending_consultations?: number;
    emergency_cases_24h?: number;
  };
  recentVerifications?: Array<any>;
  highRiskCases?: Array<any>;
  recentConsultations?: Array<any>;
}

const MedicalAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const goToVerifications = () => navigate('/admin/medical/verifications');
  const goToHighRiskCases = () => navigate('/admin/medical/high-risk');
  const goToConsultationReviews = () => navigate('/admin/medical/consultations');
  const goToEmergencyLogs = () => navigate('/admin/medical/emergency-access');

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const fetchDashboardData = async () => {
    try {
      if (!loading) setRefreshing(true);
      const data = await adminApi.medical.getDashboard();
      setDashboardData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <p className="admin-loading-text">Loading Medical Dashboard...</p>
      </div>
    );
  }

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

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-logo-section">
            <div className="admin-logo-icon">
              <Stethoscope size={28} style={{ color: '#f2f3f5' }} />
            </div>
            <div>
              <h1 className="admin-title">Medical Administration</h1>
              <p className="admin-subtitle">Healthcare Quality & Clinical Oversight</p>
            </div>
          </div>
          
          <div className="admin-actions">
            <button 
              onClick={fetchDashboardData} 
              className="admin-notification-btn"
              disabled={refreshing}
              title="Refresh Data"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button className="admin-notification-btn" title="Notifications">
              <Bell size={18} />
              {stats.pending_doctor_verifications && stats.pending_doctor_verifications > 0 && (
                <span className="admin-notification-badge"></span>
              )}
            </button>
            <div className="admin-user-card">
              <p className="admin-user-greeting">Medical Director</p>
              <p className="admin-user-name">{user?.email?.split('@')[0] || 'Admin'}</p>
            </div>
            <button onClick={handleLogout} className="admin-logout-btn" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #2b2d31 0%, #00b0f4 100%)' }}>
                <UserCheck size={24} style={{ color: '#FFFFFF' }} />
              </div>
              <span className="admin-stat-change neutral">
                <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Pending
              </span>
            </div>
            <div className="admin-stat-value">{stats.pending_doctor_verifications || '0'}</div>
            <p className="admin-stat-label">Doctor Verifications</p>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #ed4245 0%, #ed4245 100%)' }}>
                <AlertTriangle size={24} style={{ color: '#FFFFFF' }} />
              </div>
              <span className="admin-stat-change negative">
                Requires monitoring
              </span>
            </div>
            <div className="admin-stat-value">{stats.high_risk_pregnancies || '0'}</div>
            <p className="admin-stat-label">High-Risk Cases</p>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #5865f2 0%, #5865f2 100%)' }}>
                <FileText size={24} style={{ color: '#FFFFFF' }} />
              </div>
              <span className="admin-stat-change neutral">
                Awaiting QA
              </span>
            </div>
            <div className="admin-stat-value">{stats.pending_consultations || '0'}</div>
            <p className="admin-stat-label">Consultation Reviews</p>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #5865f2 0%, #b8c2ff 100%)' }}>
                <Alert size={24} style={{ color: '#f2f3f5' }} />
              </div>
              <span className="admin-stat-change positive">
                <CheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                24h
              </span>
            </div>
            <div className="admin-stat-value">{stats.emergency_cases_24h || '0'}</div>
            <p className="admin-stat-label">Emergency Cases</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div className="admin-panel">
            <div className="admin-panel-header">
              <h2 className="admin-panel-title">Doctor Verification Queue</h2>
              <button className="admin-btn admin-btn-primary" onClick={goToVerifications}>
                <Eye size={14} />
                Review All
              </button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                <thead>
                  <tr style={{ color: '#b8c2ff', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Doctor Name</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Specialization</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Submitted</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData?.recentVerifications?.slice(0, 5).map((doctor, index) => (
                    <tr key={index} style={{ background: 'rgba(24, 29, 45, 0.3)' }}>
                      <td style={{ padding: '1rem', color: '#f2f3f5', fontWeight: 600, fontSize: '0.875rem', borderTopLeftRadius: '0.5rem', borderBottomLeftRadius: '0.5rem' }}>
                        {doctor.doctor_name || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', color: '#9aa0a6', fontSize: '0.875rem' }}>
                        {doctor.specialization || 'General'}
                      </td>
                      <td style={{ padding: '1rem', color: '#9aa0a6', fontSize: '0.875rem' }}>
                        {doctor.submitted_date || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.375rem 0.75rem',
                          background: 'rgba(88, 101, 242, 0.2)',
                          color: '#b8c2ff',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          PENDING
                        </span>
                      </td>
                      <td style={{ padding: '1rem', borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}>
                        <button
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={goToVerifications}
                        >
                          <Eye size={12} />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-panel-header" style={{ marginBottom: '1.5rem' }}>
              <h2 className="admin-panel-title">Quick Actions</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="admin-btn admin-btn-primary" style={{ width: '100%', justifyContent: 'space-between' }} onClick={goToVerifications}>
                <span>Review Doctor Applications</span>
                <span style={{ 
                  background: 'rgba(255, 255, 255, 0.2)', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '0.25rem', 
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {stats.pending_doctor_verifications || 0}
                </span>
              </button>
              <button className="admin-btn admin-btn-primary" style={{ width: '100%', justifyContent: 'space-between' }} onClick={goToHighRiskCases}>
                <span>High-Risk Cases</span>
                <span style={{ 
                  background: 'rgba(255, 255, 255, 0.2)', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '0.25rem', 
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {stats.high_risk_pregnancies || 0}
                </span>
              </button>
              <button className="admin-btn admin-btn-primary" style={{ width: '100%', justifyContent: 'space-between' }} onClick={goToConsultationReviews}>
                <span>Consultation Quality Review</span>
                <FileText size={18} />
              </button>
              <button className="admin-btn admin-btn-primary" style={{ width: '100%', justifyContent: 'space-between' }} onClick={goToEmergencyLogs}>
                <span>Emergency Access Logs</span>
                <Alert size={18} />
              </button>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(88, 101, 242, 0.15)' }}>
              <h3 style={{ color: '#b8c2ff', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Recent Alerts
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(237, 66, 69, 0.1)', border: '1px solid rgba(237, 66, 69, 0.3)', borderRadius: '0.5rem' }}>
                  <p style={{ color: '#f7a6a8', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
                    2 emergency overrides pending review
                  </p>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(88, 101, 242, 0.1)', border: '1px solid rgba(88, 101, 242, 0.3)', borderRadius: '0.5rem' }}>
                  <p style={{ color: '#b8c2ff', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
                    5 consultation reports flagged for QA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">High-Risk Pregnancy Cases</h2>
            <button className="admin-btn admin-btn-secondary" onClick={goToHighRiskCases}>
              <Heart size={14} />
              View All Cases
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {dashboardData?.highRiskCases?.slice(0, 4).map((caseItem, index) => (
              <div
                key={index}
                style={{
                  padding: '1.5rem',
                  background: 'rgba(24, 29, 45, 0.3)',
                  border: '1px solid rgba(88, 101, 242, 0.12)',
                  borderRadius: '0.75rem',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <AlertTriangle size={20} style={{ color: '#f7a6a8' }} />
                  <span style={{
                    padding: '0.25rem 0.625rem',
                    background: 'rgba(237, 66, 69, 0.2)',
                    color: '#f7a6a8',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    HIGH RISK
                  </span>
                </div>
                <h3 style={{ color: '#f2f3f5', fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  {caseItem.mother_name || `Mother #${caseItem.mother_id}`}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <div>
                    <p style={{ color: '#9aa0a6', margin: 0 }}>Condition</p>
                    <p style={{ color: '#b8c2ff', fontWeight: 700, margin: 0, marginTop: '0.25rem' }}>
                      {caseItem.condition || 'Hypertension'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#9aa0a6', margin: 0 }}>Week</p>
                    <p style={{ color: '#b8c2ff', fontWeight: 700, margin: 0, marginTop: '0.25rem' }}>
                      {caseItem.gestation_week || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MedicalAdminDashboard;


