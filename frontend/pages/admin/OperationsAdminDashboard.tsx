import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/adminApi';
import { 
  Settings, 
  CreditCard, 
  Building2, 
  Users, 
  Heart,
  TrendingUp,
  Phone,
  Package,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  BarChart3,
  Bell,
  LogOut,
  Shield,
  RefreshCw,
  AlertTriangle,
  Clock,
  Eye,
  Plus,
  Star
} from 'lucide-react';

interface DashboardData {
  stats?: {
    active_cards?: number;
    active_hospitals?: number;
    pending_hospitals?: number;
    total_programs?: number;
    active_programs?: number;
    urgent_tickets?: number;
    open_tickets?: number;
  };
  cardBatches?: Array<any>;
  hospitals?: Array<any>;
  csrPrograms?: Array<any>;
  tickets?: Array<any>;
  doctorRatings?: Array<{
    doctorId: string;
    doctorName: string;
    averageRating: number;
    reviewCount: number;
  }>;
  recentDoctorReviews?: Array<{
    id: string;
    doctorName?: string;
    rating: number;
    reviewText?: string;
    reviewerName?: string;
    createdAt?: string;
  }>;
}

const OperationsAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const goToBatches = () => navigate('/admin/operations/batches');
  const goToHospitals = () => navigate('/admin/operations/hospitals');
  const goToCSR = () => navigate('/admin/operations/csr-programs');
  const goToTickets = () => navigate('/admin/operations/support-tickets');

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const data = await adminApi.operations.getDashboard();
      setDashboardData(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
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

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <p className="admin-loading-text">Loading Operations Dashboard...</p>
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
  const doctorRatings = dashboardData?.doctorRatings || [];
  const recentDoctorReviews = dashboardData?.recentDoctorReviews || [];

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-logo-section">
            <div className="admin-logo-icon">
              <Settings size={28} style={{ color: '#f2f3f5' }} />
            </div>
            <div>
              <h1 className="admin-title">Operations Management</h1>
              <p className="admin-subtitle">Service Delivery & Partner Relations</p>
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
              {stats.open_tickets && stats.open_tickets > 0 && (
                <span className="admin-notification-badge"></span>
              )}
            </button>
            <div className="admin-user-card">
              <p className="admin-user-greeting">Operations Manager</p>
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
              <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #ed4245 0%, #ed4245 100%)' }}>
                <CreditCard size={24} style={{ color: '#FFFFFF' }} />
              </div>
              <span className="admin-stat-change positive">
                <TrendingUp size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Active
              </span>
            </div>
            <div className="admin-stat-value">{stats.active_cards?.toLocaleString() || '0'}</div>
            <p className="admin-stat-label">Active Health Cards</p>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #2b2d31 0%, #00b0f4 100%)' }}>
                <Building2 size={24} style={{ color: '#FFFFFF' }} />
              </div>
              <span className="admin-stat-change neutral">
                {stats.pending_hospitals || 0} pending
              </span>
            </div>
            <div className="admin-stat-value">{stats.active_hospitals || '0'}</div>
            <p className="admin-stat-label">Partner Hospitals</p>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #21412a 0%, #2f6f4b 100%)' }}>
                <Heart size={24} style={{ color: '#FFFFFF' }} />
              </div>
              <span className="admin-stat-change positive">
                {stats.active_programs || 0} active
              </span>
            </div>
            <div className="admin-stat-value">{stats.total_programs || '0'}</div>
            <p className="admin-stat-label">CSR Programs</p>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #5865f2 0%, #b8c2ff 100%)' }}>
                <Phone size={24} style={{ color: '#f2f3f5' }} />
              </div>
              <span className="admin-stat-change negative">
                {stats.urgent_tickets || 0} urgent
              </span>
            </div>
            <div className="admin-stat-value">{stats.open_tickets || '0'}</div>
            <p className="admin-stat-label">Support Tickets</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div className="admin-panel">
            <div className="admin-panel-header">
              <h2 className="admin-panel-title">Card Batch Management</h2>
              <button className="admin-btn admin-btn-primary" onClick={goToBatches}>
                <Plus size={14} />
                New Batch
              </button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                <thead>
                  <tr style={{ color: '#b8c2ff', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Batch Number</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Type</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Quantity</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData?.cardBatches?.slice(0, 5).map((batch, index) => (
                    <tr key={index} style={{ background: 'rgba(24, 29, 45, 0.3)' }}>
                      <td style={{ padding: '1rem', color: '#f2f3f5', fontWeight: 600, fontSize: '0.875rem', borderTopLeftRadius: '0.5rem', borderBottomLeftRadius: '0.5rem' }}>
                        {batch.batch_number}
                      </td>
                      <td style={{ padding: '1rem', color: '#9aa0a6', fontSize: '0.875rem' }}>
                        {batch.card_type}
                      </td>
                      <td style={{ padding: '1rem', color: '#9aa0a6', fontSize: '0.875rem' }}>
                        {batch.quantity}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.375rem 0.75rem',
                          background: batch.status === 'ACTIVE' ? 'rgba(59, 165, 92, 0.2)' : batch.status === 'PENDING' ? 'rgba(88, 101, 242, 0.2)' : 'rgba(237, 66, 69, 0.2)',
                          color: batch.status === 'ACTIVE' ? '#8ea1e1' : batch.status === 'PENDING' ? '#b8c2ff' : '#f7a6a8',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {batch.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}>
                        <button className="admin-btn admin-btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                          <Eye size={12} />
                          View
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
              <button className="admin-btn admin-btn-primary" style={{ width: '100%', justifyContent: 'space-between' }} onClick={goToBatches}>
                <span>Create Card Batch</span>
                <CreditCard size={18} />
              </button>
              <button className="admin-btn admin-btn-primary" style={{ width: '100%', justifyContent: 'space-between' }} onClick={goToHospitals}>
                <span>Onboard Hospital</span>
                <Building2 size={18} />
              </button>
              <button className="admin-btn admin-btn-primary" style={{ width: '100%', justifyContent: 'space-between' }} onClick={goToCSR}>
                <span>New CSR Program</span>
                <Heart size={18} />
              </button>
              <button className="admin-btn admin-btn-primary" style={{ width: '100%', justifyContent: 'space-between' }} onClick={goToTickets}>
                <span>Support Tickets</span>
                <Phone size={18} />
              </button>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(88, 101, 242, 0.15)' }}>
              <h3 style={{ color: '#b8c2ff', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Pending Approvals
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {stats.pending_hospitals && stats.pending_hospitals > 0 && (
                  <div style={{ padding: '0.75rem', background: 'rgba(88, 101, 242, 0.1)', border: '1px solid rgba(88, 101, 242, 0.3)', borderRadius: '0.5rem' }}>
                    <p style={{ color: '#b8c2ff', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
                      {stats.pending_hospitals} hospitals awaiting review
                    </p>
                  </div>
                )}
                {stats.urgent_tickets && stats.urgent_tickets > 0 && (
                  <div style={{ padding: '0.75rem', background: 'rgba(237, 66, 69, 0.1)', border: '1px solid rgba(237, 66, 69, 0.3)', borderRadius: '0.5rem' }}>
                    <p style={{ color: '#f7a6a8', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
                      {stats.urgent_tickets} urgent support tickets
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Hospital Performance</h2>
            <button className="admin-btn admin-btn-secondary">
              <BarChart3 size={14} />
              View Analytics
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {dashboardData?.hospitals?.slice(0, 4).map((hospital, index) => (
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
                  <Building2 size={20} style={{ color: '#00b0f4' }} />
                  <span style={{
                    padding: '0.25rem 0.625rem',
                    background: 'rgba(59, 165, 92, 0.2)',
                    color: '#8ea1e1',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    ACTIVE
                  </span>
                </div>
                <h3 style={{ color: '#f2f3f5', fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  {hospital.hospital_name}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <div>
                    <p style={{ color: '#9aa0a6', margin: 0 }}>Services</p>
                    <p style={{ color: '#b8c2ff', fontWeight: 700, margin: 0, marginTop: '0.25rem' }}>
                      {hospital.total_services || 0}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#9aa0a6', margin: 0 }}>Mothers</p>
                    <p style={{ color: '#b8c2ff', fontWeight: 700, margin: 0, marginTop: '0.25rem' }}>
                      {hospital.total_mothers || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-panel" style={{ marginTop: '2rem' }}>
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Doctor Service Ratings</h2>
            <button className="admin-btn admin-btn-secondary" onClick={fetchDashboardData}>
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            <div>
              <h3 style={{ color: '#b8c2ff', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Top Rated Doctors
              </h3>
              {doctorRatings.length === 0 ? (
                <div style={{ padding: '1rem', border: '1px dashed rgba(88, 101, 242, 0.3)', borderRadius: '0.75rem', color: '#9aa0a6' }}>
                  No ratings submitted yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {doctorRatings.map((doctor) => (
                    <div
                      key={doctor.doctorId}
                      style={{
                        padding: '1rem',
                        background: 'rgba(24, 29, 45, 0.3)',
                        border: '1px solid rgba(88, 101, 242, 0.15)',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <p style={{ color: '#f2f3f5', fontWeight: 700, margin: 0 }}>{doctor.doctorName || 'Doctor'}</p>
                        <p style={{ color: '#9aa0a6', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                          {doctor.reviewCount} reviews
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Star size={16} style={{ color: '#b8c2ff', fill: '#b8c2ff' }} />
                        <span style={{ color: '#f2f3f5', fontWeight: 700 }}>{doctor.averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 style={{ color: '#b8c2ff', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Recent Reviews
              </h3>
              {recentDoctorReviews.length === 0 ? (
                <div style={{ padding: '1rem', border: '1px dashed rgba(88, 101, 242, 0.3)', borderRadius: '0.75rem', color: '#9aa0a6' }}>
                  Reviews will appear here once submitted.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recentDoctorReviews.map((review) => (
                    <div
                      key={review.id}
                      style={{
                        padding: '1rem',
                        background: 'rgba(24, 29, 45, 0.3)',
                        border: '1px solid rgba(88, 101, 242, 0.12)',
                        borderRadius: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <p style={{ color: '#f2f3f5', fontWeight: 700, margin: 0 }}>{review.doctorName || 'Doctor'}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Star size={14} style={{ color: '#b8c2ff', fill: '#b8c2ff' }} />
                          <span style={{ color: '#b8c2ff', fontWeight: 700 }}>{review.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p style={{ color: '#9aa0a6', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        {review.reviewText ? review.reviewText.slice(0, 140) : 'No written feedback provided.'}
                      </p>
                      <p style={{ color: '#8b9098', fontSize: '0.75rem', margin: 0 }}>
                        {review.reviewerName || 'User'}
                        {review.createdAt ? ` • ${new Date(review.createdAt).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OperationsAdminDashboard;


