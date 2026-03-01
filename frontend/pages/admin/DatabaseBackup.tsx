import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import { 
  Database, 
  ChevronLeft,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  HardDrive,
  Trash2,
  RotateCcw
} from 'lucide-react';

interface Backup {
  id: string;
  filename: string;
  size_mb: number | string | null;
  created_at: string;
  created_by: string;
  status: string;
}

const formatSizeMb = (value: number | string | null | undefined) => {
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : value ?? 0;
  if (!Number.isFinite(parsed)) return '0.00';
  return parsed.toFixed(2);
};

const DatabaseBackup: React.FC = () => {
  const navigate = useNavigate();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const data = await adminApi.system.getBackups();
      setBackups(data.backups || []);
    } catch (err) {
      console.error('Failed to fetch backups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!confirm('Create a new database backup? This may take a few minutes.')) return;
    
    try {
      setCreating(true);
      await adminApi.system.createBackup();
      alert('Backup created successfully!');
      await fetchBackups();
    } catch (err: any) {
      alert('Failed to create backup: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (backupId: string, filename: string) => {
    try {
      const blob = await adminApi.system.downloadBackup(backupId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
    } catch (err: any) {
      alert('Failed to download backup: ' + err.message);
    }
  };

  const handleRestore = async (backupId: string, filename: string) => {
    if (!confirm(`⚠️ WARNING: Restoring backup "${filename}" will replace all current data.\n\nThis action cannot be undone. Are you sure you want to proceed?`)) {
      return;
    }
    
    if (!confirm('Please confirm again: This will OVERWRITE all current database data.')) {
      return;
    }

    try {
      setRestoring(backupId);
      await adminApi.system.restoreBackup(backupId);
      alert('Backup restored successfully! The system will use the restored data.');
      await fetchBackups();
    } catch (err: any) {
      alert('Failed to restore backup: ' + err.message);
    } finally {
      setRestoring(null);
    }
  };

  const handleDelete = async (backupId: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete backup "${filename}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(backupId);
      await adminApi.system.deleteBackup(backupId);
      alert('Backup deleted successfully');
      await fetchBackups();
    } catch (err: any) {
      alert('Failed to delete backup: ' + err.message);
    } finally {
      setDeleting(null);
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
              <Database size={28} style={{ color: '#f2f3f5' }} />
            </div>
            <div>
              <h1 className="admin-title">Database Backup</h1>
              <p className="admin-subtitle">Backup and restore database</p>
            </div>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {/* Actions */}
        <div className="admin-panel" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ color: '#f2f3f5', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Database Backups
              </h3>
              <p style={{ color: '#9aa0a6', fontSize: '0.875rem', margin: 0 }}>
                Create and manage database backups for disaster recovery
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={fetchBackups} className="admin-btn admin-btn-secondary" disabled={loading}>
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button onClick={handleCreateBackup} className="admin-btn admin-btn-primary" disabled={creating}>
                {creating ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Database size={16} />
                    Create Backup
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Backups List */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Recent Backups ({backups.length})</h2>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9aa0a6' }}>
              <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem' }} />
              <p>Loading backups...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  style={{
                    padding: '1.5rem',
                    background: 'rgba(24, 29, 45, 0.3)',
                    border: '1px solid rgba(88, 101, 242, 0.12)',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      padding: '0.75rem',
                      background: 'rgba(0, 176, 244, 0.2)',
                      borderRadius: '0.5rem'
                    }}>
                      <HardDrive size={24} style={{ color: '#00b0f4' }} />
                    </div>
                    <div>
                      <h3 style={{ color: '#f2f3f5', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {backup.filename}
                      </h3>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#9aa0a6' }}>
                        <span>Size: {formatSizeMb(backup.size_mb)} MB</span>
                        <span>Created: {new Date(backup.created_at).toLocaleString()}</span>
                        <span>By: {backup.created_by}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleDownload(backup.id, backup.filename)}
                      className="admin-btn admin-btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                    >
                      <Download size={14} />
                      Download
                    </button>
                    <button
                      onClick={() => handleRestore(backup.id, backup.filename)}
                      disabled={restoring === backup.id}
                      className="admin-btn admin-btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                    >
                      {restoring === backup.id ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <RotateCcw size={14} />
                      )}
                      Restore
                    </button>
                    <button
                      onClick={() => handleDelete(backup.id, backup.filename)}
                      disabled={deleting === backup.id}
                      className="admin-btn"
                      style={{ 
                        padding: '0.5rem 1rem', 
                        fontSize: '0.75rem',
                        background: 'rgba(237, 66, 69, 0.2)',
                        border: '1px solid rgba(237, 66, 69, 0.4)',
                        color: '#f7a6a8'
                      }}
                    >
                      {deleting === backup.id ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {backups.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#9aa0a6' }}>
                  <Database size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>No backups available</p>
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Create your first backup to get started</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Warning Notice */}
        <div className="admin-panel" style={{ background: 'rgba(88, 101, 242, 0.1)', border: '1px solid rgba(88, 101, 242, 0.3)' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
            <AlertTriangle size={24} style={{ color: '#b8c2ff', flexShrink: 0 }} />
            <div>
              <h3 style={{ color: '#b8c2ff', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Important Backup Guidelines
              </h3>
              <ul style={{ color: '#9aa0a6', fontSize: '0.75rem', paddingLeft: '1.25rem', margin: 0 }}>
                <li>Backups are stored securely and encrypted</li>
                <li>Regular backups are recommended (daily or weekly)</li>
                <li>Keep backups in multiple locations for safety</li>
                <li>Test restore procedures periodically</li>
                <li>Backups older than 30 days are automatically archived</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DatabaseBackup;


