import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/adminApi';
import { useDebounce } from '../../hooks/useDebounce';
import { 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Plus, 
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Shield,
  RefreshCw,
  Download
} from 'lucide-react';

interface User {
  id: string;
  phone: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  health_id?: string;
}

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const roles = ['mother', 'doctor', 'pharmacist', 'hospital_admin', 'system_admin', 'ops_admin', 'medical_admin'];
  const statuses = ['active', 'suspended', 'pending'];

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.system.getUsers(currentPage, 50, roleFilter, statusFilter);
      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, updates: { role?: string; status?: string }) => {
    try {
      await adminApi.system.updateUser(userId, updates);
      await fetchUsers();
      setShowEditModal(false);
      setEditingUser(null);
    } catch (err: any) {
      alert('Failed to update user: ' + err.message);
    }
  };

  const handleExport = async () => {
    try {
      const data = await adminApi.system.exportUsers();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString()}.json`;
      a.click();
    } catch (err: any) {
      alert('Failed to export users: ' + err.message);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    u.phone?.includes(debouncedSearch) ||
    u.health_id?.includes(debouncedSearch)
  );

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
              <Users size={28} style={{ color: '#f2f3f5' }} />
            </div>
            <div>
              <h1 className="admin-title">User Management</h1>
              <p className="admin-subtitle">Manage users, roles and permissions</p>
            </div>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {/* Filters and Actions */}
        <div className="admin-panel" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9aa0a6' }} />
              <input
                type="text"
                placeholder="Search by email, phone or health ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  background: 'rgba(24, 29, 45, 0.3)',
                  border: '1px solid rgba(88, 101, 242, 0.2)',
                  borderRadius: '0.5rem',
                  color: '#f2f3f5',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                background: 'rgba(24, 29, 45, 0.3)',
                border: '1px solid rgba(88, 101, 242, 0.2)',
                borderRadius: '0.5rem',
                color: '#f2f3f5',
                fontSize: '0.875rem'
              }}
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                background: 'rgba(24, 29, 45, 0.3)',
                border: '1px solid rgba(88, 101, 242, 0.2)',
                borderRadius: '0.5rem',
                color: '#f2f3f5',
                fontSize: '0.875rem'
              }}
            >
              <option value="">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <button onClick={fetchUsers} className="admin-btn admin-btn-secondary">
              <RefreshCw size={16} />
              Refresh
            </button>

            <button onClick={handleExport} className="admin-btn admin-btn-primary">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Users ({filteredUsers.length})</h2>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9aa0a6' }}>
              <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem' }} />
              <p>Loading users...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <AlertTriangle size={48} style={{ color: '#f7a6a8', margin: '0 auto 1rem' }} />
              <p style={{ color: '#f7a6a8' }}>{error}</p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                  <thead>
                    <tr style={{ color: '#b8c2ff', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Email</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Phone</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Role</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Status</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Joined</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} style={{ background: 'rgba(24, 29, 45, 0.3)' }}>
                        <td style={{ padding: '1rem', color: '#f2f3f5', fontSize: '0.875rem', borderTopLeftRadius: '0.5rem', borderBottomLeftRadius: '0.5rem' }}>
                          {u.email || 'N/A'}
                        </td>
                        <td style={{ padding: '1rem', color: '#9aa0a6', fontSize: '0.875rem' }}>
                          {u.phone}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.375rem 0.75rem',
                            background: 'rgba(0, 176, 244, 0.2)',
                            color: '#00b0f4',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.375rem 0.75rem',
                            background: u.status === 'active' ? 'rgba(59, 165, 92, 0.2)' : 'rgba(237, 66, 69, 0.2)',
                            color: u.status === 'active' ? '#8ea1e1' : '#f7a6a8',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}>
                            {u.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#9aa0a6', fontSize: '0.75rem' }}>
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '1rem', borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}>
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setShowEditModal(true);
                            }}
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', marginRight: '0.5rem' }}
                          >
                            <Edit size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(88, 101, 242, 0.15)' }}>
                <p style={{ color: '#9aa0a6', fontSize: '0.875rem' }}>
                  Page {currentPage} of {totalPages}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="admin-btn admin-btn-secondary"
                    style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="admin-btn admin-btn-secondary"
                    style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div style={{
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
        }}>
          <div className="admin-panel" style={{ maxWidth: '500px', width: '90%' }}>
            <div className="admin-panel-header">
              <h2 className="admin-panel-title">Edit User</h2>
              <button onClick={() => setShowEditModal(false)} className="admin-btn admin-btn-secondary">
                <X size={16} />
              </button>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#b8c2ff', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Email</label>
                <input
                  type="text"
                  value={editingUser.email || ''}
                  disabled
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(24, 29, 45, 0.3)',
                    border: '1px solid rgba(88, 101, 242, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#9aa0a6',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#b8c2ff', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(24, 29, 45, 0.3)',
                    border: '1px solid rgba(88, 101, 242, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#f2f3f5',
                    fontSize: '0.875rem'
                  }}
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#b8c2ff', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(24, 29, 45, 0.3)',
                    border: '1px solid rgba(88, 101, 242, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#f2f3f5',
                    fontSize: '0.875rem'
                  }}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => handleUpdateUser(editingUser.id, { role: editingUser.role, status: editingUser.status })}
                  className="admin-btn admin-btn-primary"
                  style={{ flex: 1 }}
                >
                  <CheckCircle size={16} />
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
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

export default UserManagement;


