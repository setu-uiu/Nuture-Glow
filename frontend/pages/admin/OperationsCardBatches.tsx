import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, RefreshCw, CreditCard, Plus, CheckCircle } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

interface CardBatch {
  id: string;
  batch_number: string;
  card_type: string;
  quantity: number;
  status: string;
  created_at?: string;
  expiry_date?: string;
}

const OperationsCardBatches: React.FC = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<CardBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    batchNumber: '',
    cardType: 'PREMIUM',
    quantity: 0,
    expiryDate: ''
  });

  const fetchBatches = async () => {
    try {
      setRefreshing(true);
      const data = await adminApi.operations.getCardBatches();
      setBatches(data.batches || data.items || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load card batches');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleCreate = async () => {
    if (!form.batchNumber || !form.cardType || !form.quantity) {
      setError('Batch number, card type, and quantity are required.');
      return;
    }
    try {
      await adminApi.operations.createCardBatch({
        batchNumber: form.batchNumber,
        cardType: form.cardType,
        quantity: Number(form.quantity),
        expiryDate: form.expiryDate
      });
      setForm({ batchNumber: '', cardType: 'PREMIUM', quantity: 0, expiryDate: '' });
      await fetchBatches();
    } catch (err: any) {
      setError(err.message || 'Failed to create batch');
    }
  };

  const handleActivate = async (batchId: string) => {
    try {
      await adminApi.operations.activateCardBatch(batchId);
      await fetchBatches();
    } catch (err: any) {
      setError(err.message || 'Failed to activate batch');
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
              <CreditCard size={26} style={{ color: '#f2f3f5' }} />
            </div>
            <div>
              <h1 className="admin-title">Card Batches</h1>
              <p className="admin-subtitle">Create and activate health card batches</p>
            </div>
          </div>
          <div className="admin-actions">
            <button onClick={fetchBatches} className="admin-notification-btn" disabled={refreshing} title="Refresh">
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Create New Batch</h2>
            <button className="admin-btn admin-btn-primary" onClick={handleCreate}>
              <Plus size={14} />
              Create Batch
            </button>
          </div>
          <div className="admin-grid-2">
            <div>
              <label className="admin-label">Batch Number</label>
              <input className="admin-input" value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">Card Type</label>
              <select className="admin-select" value={form.cardType} onChange={(e) => setForm({ ...form, cardType: e.target.value })}>
                <option value="PREMIUM">PREMIUM</option>
                <option value="STANDARD">STANDARD</option>
              </select>
            </div>
            <div>
              <label className="admin-label">Quantity</label>
              <input className="admin-input" type="number" value={form.quantity || ''} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            </div>
            <div>
              <label className="admin-label">Expiry Date</label>
              <input className="admin-input" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            </div>
          </div>
          {error && <div className="admin-empty">{error}</div>}
        </div>

        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Recent Batches</h2>
          </div>
          {loading ? (
            <div className="admin-empty">Loading batches...</div>
          ) : batches.length === 0 ? (
            <div className="admin-empty">No batches found.</div>
          ) : (
            <div className="admin-list">
              {batches.map((batch) => (
                <div key={batch.id} className="admin-list-item" style={{ alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div className="text-cream" style={{ fontWeight: 700 }}>{batch.batch_number}</div>
                    <p className="text-muted" style={{ margin: 0 }}>
                      {batch.card_type} • {batch.quantity} cards • {batch.status}
                    </p>
                    {batch.created_at && (
                      <p className="text-muted" style={{ margin: '0.35rem 0 0 0', fontSize: '0.75rem' }}>
                        Created: {new Date(batch.created_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  {batch.status === 'PENDING' && (
                    <button className="admin-btn admin-btn-primary" onClick={() => handleActivate(batch.id)}>
                      <CheckCircle size={16} />
                      Activate
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

export default OperationsCardBatches;


