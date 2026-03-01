import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import { 
  Activity, 
  ChevronLeft,
  Server,
  Database,
  Wifi,
  Mail,
  Cpu,
  HardDrive,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Clock
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: string;
  uptime: string;
  lastCheck: string;
}

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_connections: number;
  requests_per_minute: number;
  error_rate: number;
  avg_response_time: number;
}

const SystemMonitoring: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemHealth();
    
    const interval = setInterval(fetchSystemHealth, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      const [healthData, metricsData] = await Promise.all([
        adminApi.system.getHealth(),
        adminApi.system.getMetrics()
      ]);
      
      setServices(healthData.services || []);
      setMetrics(metricsData.metrics || null);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch system health:', err);
      setLoading(false);
    }
  };

  const getServiceIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'database': return <Database size={20} />;
      case 'api': return <Server size={20} />;
      case 'storage': return <HardDrive size={20} />;
      case 'email': return <Mail size={20} />;
      default: return <Wifi size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#57f287';
      case 'offline': return '#ff7b7b';
      case 'degraded': return '#b8c2ff';
      default: return '#9aa0a6';
    }
  };

  const getMetricColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return '#ff7b7b';
    if (value >= thresholds.warning) return '#b8c2ff';
    return '#57f287';
  };

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/admin/system')} 
            className="admin-btn admin-btn-ghost"
            style={{ padding: '0.5rem 1rem' }}
          >
            <ChevronLeft size={18} />
            Back
          </button>
        </div>
        <button 
          onClick={fetchSystemHealth} 
          className="admin-btn admin-btn-primary"
          disabled={loading}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.75rem 1.5rem'
          }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Service Status Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        {services.length > 0 ? services.map((service) => (
          <div key={service.name} className="admin-stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
              <div style={{
                padding: '0.75rem',
                background: 'rgba(59, 165, 92, 0.15)',
                borderRadius: '0.75rem',
                color: '#57f287'
              }}>
                {getServiceIcon(service.name)}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.75rem',
                background: `${getStatusColor(service.status)}20`,
                borderRadius: '1rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: getStatusColor(service.status),
                textTransform: 'uppercase' as const
              }}>
                {service.status === 'online' && <CheckCircle size={14} />}
                {service.status === 'offline' && <AlertCircle size={14} />}
                {service.status}
              </div>
            </div>
            <h3 style={{ color: '#f2f3f5', fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              {service.name}
            </h3>
            <div style={{ fontSize: '0.85rem', color: '#9aa0a6', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Uptime:</span>
                <span style={{ color: '#8ea1e1', fontWeight: 500 }}>{service.uptime}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Last Check:</span>
                <span style={{ color: '#8ea1e1', fontWeight: 500 }}>{service.lastCheck}</span>
              </div>
            </div>
          </div>
        )) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#9aa0a6' }}>
            <Server size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No services data available</p>
          </div>
        )}
      </div>

        {/* System Metrics */}
        {metrics && (
          <>
            <div className="admin-panel" style={{ marginBottom: '2rem' }}>
              <div className="admin-panel-header">
                <h2 className="admin-panel-title">System Resources</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {/* CPU Usage */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Cpu size={18} style={{ color: '#57f287' }} />
                    <span style={{ color: '#f2f3f5', fontSize: '0.875rem', fontWeight: 700 }}>CPU Usage</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: getMetricColor(metrics.cpu_usage, { warning: 70, critical: 90 }), marginBottom: '0.5rem' }}>
                    {metrics.cpu_usage.toFixed(1)}%
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(24, 29, 45, 0.5)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${metrics.cpu_usage}%`,
                      height: '100%',
                      background: getMetricColor(metrics.cpu_usage, { warning: 70, critical: 90 }),
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                {/* Memory Usage */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Activity size={18} style={{ color: '#57f287' }} />
                    <span style={{ color: '#f2f3f5', fontSize: '0.875rem', fontWeight: 700 }}>Memory Usage</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: getMetricColor(metrics.memory_usage, { warning: 75, critical: 90 }), marginBottom: '0.5rem' }}>
                    {metrics.memory_usage.toFixed(1)}%
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(24, 29, 45, 0.5)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${metrics.memory_usage}%`,
                      height: '100%',
                      background: getMetricColor(metrics.memory_usage, { warning: 75, critical: 90 }),
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                {/* Disk Usage */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <HardDrive size={18} style={{ color: '#57f287' }} />
                    <span style={{ color: '#f2f3f5', fontSize: '0.875rem', fontWeight: 700 }}>Disk Usage</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: getMetricColor(metrics.disk_usage, { warning: 80, critical: 95 }), marginBottom: '0.5rem' }}>
                    {metrics.disk_usage.toFixed(1)}%
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(24, 29, 45, 0.5)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${metrics.disk_usage}%`,
                      height: '100%',
                      background: getMetricColor(metrics.disk_usage, { warning: 80, critical: 95 }),
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="admin-panel">
              <div className="admin-panel-header">
                <h2 className="admin-panel-title">Performance Metrics</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div className="admin-stat-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Wifi size={16} style={{ color: '#57f287' }} />
                    <span style={{ color: '#9aa0a6', fontSize: '0.75rem' }}>Active Connections</span>
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f2f3f5' }}>
                    {metrics.active_connections}
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <TrendingUp size={16} style={{ color: '#57f287' }} />
                    <span style={{ color: '#9aa0a6', fontSize: '0.75rem' }}>Requests/Min</span>
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f2f3f5' }}>
                    {metrics.requests_per_minute}
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <AlertCircle size={16} style={{ color: '#5865f2' }} />
                    <span style={{ color: '#9aa0a6', fontSize: '0.75rem' }}>Error Rate</span>
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: getMetricColor(metrics.error_rate, { warning: 2, critical: 5 }) }}>
                    {metrics.error_rate.toFixed(2)}%
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Clock size={16} style={{ color: '#57f287' }} />
                    <span style={{ color: '#9aa0a6', fontSize: '0.75rem' }}>Avg Response Time</span>
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f2f3f5' }}>
                    {metrics.avg_response_time}ms
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {loading && !metrics && services.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9aa0a6' }}>
            <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem', color: '#57f287' }} />
            <p>Loading system metrics...</p>
          </div>
        )}

        {!loading && !metrics && services.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9aa0a6' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Unable to load system data. Please check your connection and try again.</p>
            <button onClick={fetchSystemHealth} className="admin-btn admin-btn-primary" style={{ marginTop: '1rem' }}>
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}
    </div>
  );
};

export default SystemMonitoring;


