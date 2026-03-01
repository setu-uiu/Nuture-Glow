import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, RefreshCw, Phone, Plus, CheckCircle } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

interface SupportTicket {
  id: string;
  ticket_number: string;
  user_name: string;
  user_phone: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  status: string;
  created_at?: string;
}

const OperationsSupportTickets: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [form, setForm] = useState({
    userId: '',
    userName: '',
    userPhone: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    subject: '',
    description: ''
  });

  const fetchTickets = async () => {
    try {
      setRefreshing(true);
      const data = await adminApi.operations.getSupportTickets(filters.status || undefined, filters.priority || undefined);
      setTickets(data.tickets || data.items || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters.status, filters.priority]);

  const handleCreate = async () => {
    if (!form.userName || !form.userPhone || !form.subject) {
      setError('User name, phone, and subject are required.');
      return;
    }
    try {
      await adminApi.operations.createSupportTicket({
        userId: form.userId || undefined,
        userName: form.userName,
        userPhone: form.userPhone,
        category: form.category,
        priority: form.priority,
        subject: form.subject,
        description: form.description
      });
      setForm({
        userId: '',
        userName: '',
        userPhone: '',
        category: 'GENERAL',
        priority: 'MEDIUM',
        subject: '',
        description: ''
      });
      await fetchTickets();
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket');
    }
  };

  const handleResolve = async (ticketId: string) => {
    const notes = window.prompt('Resolution notes (optional):', '');
    try {
      await adminApi.operations.updateSupportTicket(ticketId, { status: 'RESOLVED', resolutionNotes: notes || undefined });
      await fetchTickets();
    } catch (err: any) {
      setError(err.message || 'Failed to update ticket');
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-logo-section">
            <button onClick={() => navigate('/admin/operations')} className="admin-btn admin-btn-secondary" style={{ marginRight: '1rem' }}>
              <ChevronLeft size={18} />
              Back
            </button>
            <div className="admin-logo-icon">
              <Phone size={26} style={{ color: '#f2f3f5' }} />
            </div>
            <div>
              <h1 className="admin-title">Support Tickets</h1>
              <p className="admin-subtitle">Track and resolve service issues</p>
            </div>
          </div>
          <div className="admin-actions">
            <button onClick={fetchTickets} className="admin-notification-btn" disabled={refreshing} title="Refresh">
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Create Ticket</h2>
            <button className="admin-btn admin-btn-primary" onClick={handleCreate}>
              <Plus size={14} />
              Create Ticket
            </button>
          </div>
          <div className="admin-grid-2">
            <div>
              <label className="admin-label">User Name</label>
              <input className="admin-input" value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">User Phone</label>
              <input className="admin-input" value={form.userPhone} onChange={(e) => setForm({ ...form, userPhone: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">Category</label>
              <select className="admin-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="GENERAL">GENERAL</option>
                <option value="CARD_ISSUE">CARD_ISSUE</option>
                <option value="HOSPITAL_ACCESS">HOSPITAL_ACCESS</option>
                <option value="TECHNICAL">TECHNICAL</option>
              </select>
            </div>
            <div>
              <label className="admin-label">Priority</label>
              <select className="admin-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
            <div>
              <label className="admin-label">Subject</label>
              <input className="admin-input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">User ID (optional)</label>
              <input className="admin-input" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="admin-label">Description</label>
              <textarea className="admin-textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          {error && <div className="admin-empty">{error}</div>}
        </div>

        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Ticket Queue</h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select className="admin-select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All Status</option>
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
              <select className="admin-select" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
                <option value="">All Priority</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="admin-empty">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="admin-empty">No tickets found.</div>
          ) : (
            <div className="admin-list">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="admin-list-item" style={{ alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div className="text-cream" style={{ fontWeight: 700 }}>{ticket.ticket_number} • {ticket.subject}</div>
                    <p className="text-muted" style={{ margin: 0 }}>
                      {ticket.user_name} • {ticket.category} • {ticket.priority} • {ticket.status}
                    </p>
                    {ticket.created_at && (
                      <p className="text-muted" style={{ margin: '0.35rem 0 0 0', fontSize: '0.75rem' }}>
                        {new Date(ticket.created_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  {(ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
                    <button className="admin-btn admin-btn-primary" onClick={() => handleResolve(ticket.id)}>
                      <CheckCircle size={16} />
                      Resolve
                    </button>
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

export default OperationsSupportTickets;


