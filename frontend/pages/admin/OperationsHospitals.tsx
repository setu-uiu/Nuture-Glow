import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, RefreshCw, Building2, Plus, CheckCircle } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

interface HospitalOnboarding {
  id: string;
  hospital_name: string;
  hospital_type: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  address?: string;
  city: string;
  district: string;
  bed_capacity?: number;
  license_number?: string;
  status: string;
  created_at?: string;
}

const OperationsHospitals: React.FC = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<HospitalOnboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    hospital_name: '',
    hospital_type: 'PRIVATE',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    city: '',
    district: '',
    bed_capacity: 0,
    license_number: '',
    status: 'PENDING'
  });
  const [form, setForm] = useState({
    hospitalName: '',
    hospitalType: 'PRIVATE',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    district: '',
    bedCapacity: 0,
    licenseNumber: ''
  });

  const fetchHospitals = async () => {
    try {
      setRefreshing(true);
      const data = await adminApi.operations.getPendingHospitals();
      setHospitals(data.hospitals || data.items || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load hospital onboarding requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleCreate = async () => {
    if (!form.hospitalName || !form.contactPerson || !form.contactEmail) {
      setError('Hospital name, contact person, and email are required.');
      return;
    }
    try {
      await adminApi.operations.createHospital({
        hospitalName: form.hospitalName,
        hospitalType: form.hospitalType,
        contactPerson: form.contactPerson,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        address: form.address,
        city: form.city,
        district: form.district,
        bedCapacity: Number(form.bedCapacity),
        licenseNumber: form.licenseNumber
      });
      setForm({
        hospitalName: '',
        hospitalType: 'PRIVATE',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        city: '',
        district: '',
        bedCapacity: 0,
        licenseNumber: ''
      });
      await fetchHospitals();
    } catch (err: any) {
      setError(err.message || 'Failed to submit hospital onboarding');
    }
  };

  const handleApprove = async (hospitalId: string) => {
    try {
      await adminApi.operations.approveHospital(hospitalId, 'Approved by operations admin');
      await fetchHospitals();
    } catch (err: any) {
      setError(err.message || 'Failed to approve hospital');
    }
  };

  const startEdit = (hospital: HospitalOnboarding) => {
    setEditingId(hospital.id);
    setEditForm({
      hospital_name: hospital.hospital_name || '',
      hospital_type: hospital.hospital_type || 'PRIVATE',
      contact_person: hospital.contact_person || '',
      contact_email: hospital.contact_email || '',
      contact_phone: hospital.contact_phone || '',
      address: hospital.address || '',
      city: hospital.city || '',
      district: hospital.district || '',
      bed_capacity: hospital.bed_capacity || 0,
      license_number: hospital.license_number || '',
      status: hospital.status || 'PENDING'
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (hospitalId: string) => {
    try {
      await adminApi.operations.updateHospital(hospitalId, {
        ...editForm,
        bed_capacity: Number(editForm.bed_capacity || 0)
      });
      setEditingId(null);
      await fetchHospitals();
    } catch (err: any) {
      setError(err.message || 'Failed to update hospital');
    }
  };

  const handleDelete = async (hospitalId: string) => {
    if (!window.confirm('Delete this hospital onboarding request?')) return;
    try {
      await adminApi.operations.deleteHospital(hospitalId);
      await fetchHospitals();
    } catch (err: any) {
      setError(err.message || 'Failed to delete hospital');
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
              <Building2 size={26} style={{ color: '#f2f3f5' }} />
            </div>
            <div>
              <h1 className="admin-title">Hospital Onboarding</h1>
              <p className="admin-subtitle">Review and create hospital requests</p>
            </div>
          </div>
          <div className="admin-actions">
            <button onClick={fetchHospitals} className="admin-notification-btn" disabled={refreshing} title="Refresh">
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Create Onboarding Request</h2>
            <button className="admin-btn admin-btn-primary" onClick={handleCreate}>
              <Plus size={14} />
              Submit Request
            </button>
          </div>
          <div className="admin-grid-2">
            <div>
              <label className="admin-label">Hospital Name</label>
              <input className="admin-input" value={form.hospitalName} onChange={(e) => setForm({ ...form, hospitalName: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">Hospital Type</label>
              <select className="admin-select" value={form.hospitalType} onChange={(e) => setForm({ ...form, hospitalType: e.target.value })}>
                <option value="PRIVATE">PRIVATE</option>
                <option value="PUBLIC">PUBLIC</option>
              </select>
            </div>
            <div>
              <label className="admin-label">Contact Person</label>
              <input className="admin-input" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">Contact Email</label>
              <input className="admin-input" type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">Contact Phone</label>
              <input className="admin-input" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">Bed Capacity</label>
              <input className="admin-input" type="number" value={form.bedCapacity || ''} onChange={(e) => setForm({ ...form, bedCapacity: Number(e.target.value) })} />
            </div>
            <div>
              <label className="admin-label">City</label>
              <input className="admin-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">District</label>
              <input className="admin-input" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">License Number</label>
              <input className="admin-input" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">Address</label>
              <input className="admin-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>
          {error && <div className="admin-empty">{error}</div>}
        </div>

        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Pending Requests</h2>
          </div>
          {loading ? (
            <div className="admin-empty">Loading hospital requests...</div>
          ) : hospitals.length === 0 ? (
            <div className="admin-empty">No pending hospitals.</div>
          ) : (
            <div className="admin-list">
              {hospitals.map((hospital) => (
                <div key={hospital.id} className="admin-list-item" style={{ alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    {editingId === hospital.id ? (
                      <div className="admin-grid-2" style={{ marginBottom: '0.75rem' }}>
                        <div>
                          <label className="admin-label">Hospital Name</label>
                          <input
                            className="admin-input"
                            value={editForm.hospital_name}
                            onChange={(e) => setEditForm({ ...editForm, hospital_name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="admin-label">Hospital Type</label>
                          <select
                            className="admin-select"
                            value={editForm.hospital_type}
                            onChange={(e) => setEditForm({ ...editForm, hospital_type: e.target.value })}
                          >
                            <option value="PRIVATE">PRIVATE</option>
                            <option value="PUBLIC">PUBLIC</option>
                          </select>
                        </div>
                        <div>
                          <label className="admin-label">Contact Person</label>
                          <input
                            className="admin-input"
                            value={editForm.contact_person}
                            onChange={(e) => setEditForm({ ...editForm, contact_person: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="admin-label">Contact Email</label>
                          <input
                            className="admin-input"
                            value={editForm.contact_email}
                            onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="admin-label">Contact Phone</label>
                          <input
                            className="admin-input"
                            value={editForm.contact_phone}
                            onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="admin-label">Bed Capacity</label>
                          <input
                            className="admin-input"
                            type="number"
                            value={editForm.bed_capacity || ''}
                            onChange={(e) => setEditForm({ ...editForm, bed_capacity: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <label className="admin-label">City</label>
                          <input
                            className="admin-input"
                            value={editForm.city}
                            onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="admin-label">District</label>
                          <input
                            className="admin-input"
                            value={editForm.district}
                            onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="admin-label">Address</label>
                          <input
                            className="admin-input"
                            value={editForm.address}
                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="admin-label">License Number</label>
                          <input
                            className="admin-input"
                            value={editForm.license_number}
                            onChange={(e) => setEditForm({ ...editForm, license_number: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="admin-label">Status</label>
                          <select
                            className="admin-select"
                            value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-cream" style={{ fontWeight: 700 }}>{hospital.hospital_name}</div>
                        <p className="text-muted" style={{ margin: 0 }}>
                          {hospital.hospital_type} • {hospital.city}, {hospital.district}
                        </p>
                        <p className="text-muted" style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem' }}>
                          {hospital.contact_person} • {hospital.contact_email}
                        </p>
                      </>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {editingId === hospital.id ? (
                      <>
                        <button className="admin-btn admin-btn-secondary" onClick={() => saveEdit(hospital.id)}>
                          Save
                        </button>
                        <button className="admin-btn admin-btn-ghost" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="admin-btn admin-btn-secondary" onClick={() => startEdit(hospital)}>
                          Edit
                        </button>
                        <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(hospital.id)}>
                          Delete
                        </button>
                        <button className="admin-btn admin-btn-primary" onClick={() => handleApprove(hospital.id)}>
                          <CheckCircle size={16} />
                          Approve
                        </button>
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

export default OperationsHospitals;


