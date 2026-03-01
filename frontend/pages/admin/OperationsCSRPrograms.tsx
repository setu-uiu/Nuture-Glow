import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, RefreshCw, HeartHandshake, Plus } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

interface CsrProgram {
  id: string;
  program_name: string;
  sponsor_name: string;
  program_type: string;
  budget: number;
  status: string;
  start_date?: string;
  end_date?: string;
}

const OperationsCSRPrograms: React.FC = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<CsrProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    program_name: '',
    sponsor_name: '',
    sponsor_contact: '',
    program_type: 'HEALTH',
    budget: 0,
    target_beneficiaries: 0,
    start_date: '',
    end_date: '',
    description: '',
    status: 'ACTIVE'
  });
  const [form, setForm] = useState({
    programName: '',
    sponsorName: '',
    sponsorContact: '',
    programType: 'HEALTH',
    budget: 0,
    targetBeneficiaries: 0,
    startDate: '',
    endDate: '',
    description: ''
  });

  const fetchPrograms = async () => {
    try {
      setRefreshing(true);
      const data = await adminApi.operations.getCsrPrograms();
      setPrograms(data.programs || data.items || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load CSR programs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleCreate = async () => {
    if (!form.programName || !form.sponsorName || !form.budget) {
      setError('Program name, sponsor name, and budget are required.');
      return;
    }
    try {
      await adminApi.operations.createCsrProgram({
        programName: form.programName,
        sponsorName: form.sponsorName,
        sponsorContact: form.sponsorContact,
        programType: form.programType,
        budget: Number(form.budget),
        targetBeneficiaries: Number(form.targetBeneficiaries),
        startDate: form.startDate,
        endDate: form.endDate,
        description: form.description
      });
      setForm({
        programName: '',
        sponsorName: '',
        sponsorContact: '',
        programType: 'HEALTH',
        budget: 0,
        targetBeneficiaries: 0,
        startDate: '',
        endDate: '',
        description: ''
      });
      await fetchPrograms();
    } catch (err: any) {
      setError(err.message || 'Failed to create CSR program');
    }
  };

  const startEdit = (program: CsrProgram) => {
    setEditingId(program.id);
    setEditForm({
      program_name: program.program_name || '',
      sponsor_name: program.sponsor_name || '',
      sponsor_contact: '',
      program_type: program.program_type || 'HEALTH',
      budget: program.budget || 0,
      target_beneficiaries: 0,
      start_date: program.start_date || '',
      end_date: program.end_date || '',
      description: '',
      status: program.status || 'ACTIVE'
    });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (programId: string) => {
    try {
      await adminApi.operations.updateCsrProgram(programId, {
        ...editForm,
        budget: Number(editForm.budget || 0),
        target_beneficiaries: Number(editForm.target_beneficiaries || 0)
      });
      setEditingId(null);
      await fetchPrograms();
    } catch (err: any) {
      setError(err.message || 'Failed to update CSR program');
    }
  };

  const handleDelete = async (programId: string) => {
    if (!window.confirm('Delete this CSR program?')) return;
    try {
      await adminApi.operations.deleteCsrProgram(programId);
      await fetchPrograms();
    } catch (err: any) {
      setError(err.message || 'Failed to delete CSR program');
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
              <HeartHandshake size={26} style={{ color: '#f2f3f5' }} />
            </div>
            <div>
              <h1 className="admin-title">CSR Programs</h1>
              <p className="admin-subtitle">Manage community support initiatives</p>
            </div>
          </div>
          <div className="admin-actions">
            <button onClick={fetchPrograms} className="admin-notification-btn" disabled={refreshing} title="Refresh">
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Create CSR Program</h2>
            <button className="admin-btn admin-btn-primary" onClick={handleCreate}>
              <Plus size={14} />
              Create Program
            </button>
          </div>
          <div className="admin-grid-2">
            <div>
              <label className="admin-label">Program Name</label>
              <input className="admin-input" value={form.programName} onChange={(e) => setForm({ ...form, programName: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">Program Type</label>
              <select className="admin-select" value={form.programType} onChange={(e) => setForm({ ...form, programType: e.target.value })}>
                <option value="HEALTH">HEALTH</option>
                <option value="NUTRITION">NUTRITION</option>
                <option value="EDUCATION">EDUCATION</option>
                <option value="EMERGENCY">EMERGENCY</option>
              </select>
            </div>
            <div>
              <label className="admin-label">Sponsor Name</label>
              <input className="admin-input" value={form.sponsorName} onChange={(e) => setForm({ ...form, sponsorName: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">Sponsor Contact</label>
              <input className="admin-input" value={form.sponsorContact} onChange={(e) => setForm({ ...form, sponsorContact: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">Budget</label>
              <input className="admin-input" type="number" value={form.budget || ''} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} />
            </div>
            <div>
              <label className="admin-label">Target Beneficiaries</label>
              <input className="admin-input" type="number" value={form.targetBeneficiaries || ''} onChange={(e) => setForm({ ...form, targetBeneficiaries: Number(e.target.value) })} />
            </div>
            <div>
              <label className="admin-label">Start Date</label>
              <input className="admin-input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">End Date</label>
              <input className="admin-input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
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
            <h2 className="admin-panel-title">Recent Programs</h2>
          </div>
          {loading ? (
            <div className="admin-empty">Loading programs...</div>
          ) : programs.length === 0 ? (
            <div className="admin-empty">No CSR programs found.</div>
          ) : (
            <div className="admin-list">
              {programs.map((program) => (
                <div key={program.id} className="admin-list-item" style={{ alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    {editingId === program.id ? (
                      <div className="admin-grid-2" style={{ marginBottom: '0.75rem' }}>
                        <div>
                          <label className="admin-label">Program Name</label>
                          <input
                            className="admin-input"
                            value={editForm.program_name}
                            onChange={(e) => setEditForm({ ...editForm, program_name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="admin-label">Program Type</label>
                          <select
                            className="admin-select"
                            value={editForm.program_type}
                            onChange={(e) => setEditForm({ ...editForm, program_type: e.target.value })}
                          >
                            <option value="HEALTH">HEALTH</option>
                            <option value="NUTRITION">NUTRITION</option>
                            <option value="EDUCATION">EDUCATION</option>
                            <option value="EMERGENCY">EMERGENCY</option>
                          </select>
                        </div>
                        <div>
                          <label className="admin-label">Sponsor Name</label>
                          <input
                            className="admin-input"
                            value={editForm.sponsor_name}
                            onChange={(e) => setEditForm({ ...editForm, sponsor_name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="admin-label">Sponsor Contact</label>
                          <input
                            className="admin-input"
                            value={editForm.sponsor_contact}
                            onChange={(e) => setEditForm({ ...editForm, sponsor_contact: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="admin-label">Budget</label>
                          <input
                            className="admin-input"
                            type="number"
                            value={editForm.budget || ''}
                            onChange={(e) => setEditForm({ ...editForm, budget: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <label className="admin-label">Target Beneficiaries</label>
                          <input
                            className="admin-input"
                            type="number"
                            value={editForm.target_beneficiaries || ''}
                            onChange={(e) => setEditForm({ ...editForm, target_beneficiaries: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <label className="admin-label">Start Date</label>
                          <input
                            className="admin-input"
                            type="date"
                            value={editForm.start_date}
                            onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="admin-label">End Date</label>
                          <input
                            className="admin-input"
                            type="date"
                            value={editForm.end_date}
                            onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="admin-label">Status</label>
                          <select
                            className="admin-select"
                            value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="PLANNING">PLANNING</option>
                            <option value="COMPLETED">COMPLETED</option>
                          </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label className="admin-label">Description</label>
                          <textarea
                            className="admin-textarea"
                            rows={3}
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-cream" style={{ fontWeight: 700 }}>{program.program_name}</div>
                        <p className="text-muted" style={{ margin: 0 }}>
                          {program.sponsor_name} • {program.program_type} • Budget {program.budget}
                        </p>
                        {program.start_date && (
                          <p className="text-muted" style={{ margin: '0.35rem 0 0 0', fontSize: '0.75rem' }}>
                            {program.start_date} → {program.end_date || 'TBD'}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {editingId === program.id ? (
                      <>
                        <button className="admin-btn admin-btn-secondary" onClick={() => saveEdit(program.id)}>
                          Save
                        </button>
                        <button className="admin-btn admin-btn-ghost" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="admin-btn admin-btn-secondary" onClick={() => startEdit(program)}>
                          Edit
                        </button>
                        <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(program.id)}>
                          Delete
                        </button>
                        <span className="admin-status admin-status-info">{program.status || 'ACTIVE'}</span>
                      </>
                    )}
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

export default OperationsCSRPrograms;


