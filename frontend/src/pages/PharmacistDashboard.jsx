import React, { useState } from 'react';
import axios from 'axios';
import { Pill, Search, CheckCircle, AlertCircle, QrCode, ShieldCheck, User, Calendar, Stethoscope } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const PharmacistDashboard = () => {
  const [rxId, setRxId] = useState('');
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dispensing, setDispensing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!rxId.trim()) return;
    setError('');
    setSuccessMsg('');
    setLoading(true);
    setPrescription(null);

    try {
      // Extract rxId if full JSON QR string was pasted or entered
      let searchId = rxId.trim();
      if (searchId.startsWith('{')) {
        try {
          const parsed = JSON.parse(searchId);
          searchId = parsed.rxId || searchId;
        } catch (e) {}
      }

      const res = await axios.get(`/api/prescriptions/verify/${encodeURIComponent(searchId)}`);
      setPrescription(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Prescription not found or invalid Prescription ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async () => {
    if (!prescription) return;
    setDispensing(true);
    setError('');
    try {
      const res = await axios.put(`/api/prescriptions/${prescription._id}/dispense`);
      setPrescription(res.data.prescription);
      setSuccessMsg('Prescription marked as DISPENSED successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update dispense status.');
    } finally {
      setDispensing(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(14, 165, 233, 0.1) 100%)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="badge badge-pharmacist" style={{ marginBottom: '0.4rem' }}>
            <Pill size={14} /> Medical Store & Pharmacy Portal
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700 }}>
            Prescription Verification & Dispensing Counter
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Scan customer QR Code or type Prescription ID to verify digital authenticity before dispensing medicines.
          </p>
        </div>
      </div>

      {/* Lookup Bar */}
      <div className="glass-card">
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <QrCode size={20} className="text-primary" /> Scan QR / Enter Prescription ID
        </h3>

        <form onSubmit={handleVerify} style={{ display: 'flex', gap: '0.75rem' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Enter Prescription ID (e.g. RX-2026-8839) or paste QR payload..." 
            value={rxId}
            onChange={(e) => setRxId(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Verifying...' : <><Search size={18} /> Verify Digital RX</>}
          </button>
        </form>
      </div>

      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <div>{error}</div>
        </div>
      )}

      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle size={20} />
          <div>{successMsg}</div>
        </div>
      )}

      {/* Verified Prescription Detail Card */}
      {prescription && (
        <div className="glass-card" style={{ border: prescription.status === 'dispensed' ? '2px solid rgba(139, 92, 246, 0.5)' : '2px solid rgba(16, 185, 129, 0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8' }}>
                  {prescription.prescriptionId}
                </span>
                <span className={`badge ${prescription.status === 'active' ? 'badge-active' : 'badge-dispensed'}`}>
                  {prescription.status.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Issued on {new Date(prescription.createdAt).toLocaleString()}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.88rem', fontWeight: 600 }}>
                <ShieldCheck size={18} /> Verified Authenticity
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Universal Health Network</div>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            {/* Doctor Info */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Stethoscope size={14} /> Prescribing Doctor
              </h4>
              <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>Dr. {prescription.doctorName}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{prescription.doctorSpecialty}</div>
              <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginTop: '0.3rem' }}>
                License: {prescription.doctor?.doctorInfo?.licenseNumber || 'Verified Medical Officer'}
              </div>
            </div>

            {/* Patient Info */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={14} /> Patient Information
              </h4>
              <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{prescription.patientName}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Health ID: <strong style={{ color: '#38bdf8' }}>{prescription.patientHealthId}</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Diagnosis: <strong style={{ color: '#f8fafc' }}>{prescription.diagnosis}</strong>
              </div>
            </div>
          </div>

          {/* Medicines Checklist */}
          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.8rem', color: '#f59e0b' }}>
            💊 Prescribed Medicines to Dispense:
          </h4>
          <table className="custom-table" style={{ marginBottom: '1.5rem' }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine Name</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              {prescription.medicines.map((med, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td><strong style={{ color: '#ffffff' }}>{med.name}</strong></td>
                  <td><span className="badge badge-doctor">{med.dosage}</span></td>
                  <td>{med.frequency}</td>
                  <td>{med.duration}</td>
                  <td style={{ color: '#94a3b8' }}>{med.instructions || 'Standard'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {prescription.advice && (
            <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <strong>Doctor Advice:</strong> {prescription.advice}
            </div>
          )}

          {/* Action Button */}
          {prescription.status === 'active' ? (
            <button onClick={handleDispense} className="btn btn-accent btn-lg" style={{ width: '100%' }} disabled={dispensing}>
              {dispensing ? 'Updating Status...' : <><CheckCircle size={20} /> Mark Prescription as DISPENSED</>}
            </button>
          ) : (
            <div style={{ textAlign: 'center', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', padding: '1rem', borderRadius: '12px', fontWeight: 600 }}>
              ✓ Already Dispensed on {new Date(prescription.dispensedAt || prescription.updatedAt).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PharmacistDashboard;
