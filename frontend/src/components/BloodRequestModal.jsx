import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  AlertTriangle, X, CheckCircle2, AlertCircle, UploadCloud, 
  FileText, Hospital, Droplet, User, Phone, MapPin, ShieldCheck
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const BloodRequestModal = ({ isOpen, onClose, onRequestCreated }) => {
  const { user } = useContext(AuthContext);

  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientHealthId, setPatientHealthId] = useState(user?.patientInfo?.healthId || user?.healthId || '');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [unitsNeeded, setUnitsNeeded] = useState(1);
  const [urgency, setUrgency] = useState('urgent');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalCity, setHospitalCity] = useState('Jaipur');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [reasonForBlood, setReasonForBlood] = useState('Surgical / Emergency requirement');

  // Doctor Prescription Proof Upload
  const [rxFileUrl, setRxFileUrl] = useState('');
  const [rxFileName, setRxFileName] = useState('');
  const [additionalDocsUrl, setAdditionalDocsUrl] = useState('');
  const [addFileName, setAddFileName] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleRxFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Prescription file size exceeds 5MB limit.');
      return;
    }

    setRxFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setRxFileUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAddFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAdditionalDocsUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!patientName.trim()) {
      setErrorMsg('Patient name is required');
      return;
    }
    if (!hospitalName.trim()) {
      setErrorMsg('Hospital name is required to verify blood requisition');
      return;
    }
    if (!contactPhone.trim()) {
      setErrorMsg('Attending relative / emergency contact phone is required');
      return;
    }
    if (!rxFileUrl) {
      setErrorMsg('Doctor prescription or hospital requisition slip upload is required for clinical verification');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patientName,
        patientHealthId: patientHealthId || 'HID-GUEST',
        bloodGroup,
        unitsNeeded: Number(unitsNeeded),
        urgency,
        hospitalName,
        hospitalCity,
        hospitalAddress,
        contactPhone,
        reasonForBlood,
        doctorPrescriptionUrl: rxFileUrl,
        additionalDocsUrl
      };

      const res = await axios.post('/api/blood-bank/requests/create', payload);
      setSuccessMsg(res.data.message || 'Emergency blood requisition submitted! A doctor will review your prescription.');
      setTimeout(() => {
        if (onRequestCreated) onRequestCreated(res.data.request);
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit blood request. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(11, 15, 25, 0.88)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <div className="glass-card" style={{
        width: '100%', maxWidth: '750px', maxHeight: '92vh', overflowY: 'auto',
        background: 'rgba(15, 23, 42, 0.96)', border: '1px solid rgba(239, 68, 68, 0.4)',
        boxShadow: '0 25px 60px rgba(239, 68, 68, 0.2)', borderRadius: '20px', padding: '2rem'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f87171', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              <AlertTriangle size={16} className="text-danger" /> Emergency Requisition
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, marginTop: '0.2rem' }}>
              Create Emergency Blood Request
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Upload your doctor's prescription receipt to broadcast this urgent need to verified donors.
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '10px', color: '#fca5a5', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '0.85rem 1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '10px', color: '#6ee7b7', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <CheckCircle2 size={18} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Blood Group Required */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Required Blood Group <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
              {BLOOD_GROUPS.map((bg) => (
                <button
                  type="button"
                  key={bg}
                  onClick={() => setBloodGroup(bg)}
                  style={{
                    padding: '0.65rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: bloodGroup === bg ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(30, 41, 59, 0.7)',
                    color: bloodGroup === bg ? '#fff' : '#cbd5e1',
                    border: bloodGroup === bg ? '2px solid #f87171' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: bloodGroup === bg ? '0 4px 15px rgba(239, 68, 68, 0.4)' : 'none'
                  }}
                >
                  <Droplet size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Units & Urgency */}
          <div className="grid-2" style={{ gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Units Needed (Bags) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                min="1"
                max="10"
                className="input-field"
                value={unitsNeeded}
                onChange={(e) => setUnitsNeeded(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Urgency Level <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                className="input-field"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
              >
                <option value="critical">🔴 Critical (Immediate / Within 6 Hours)</option>
                <option value="urgent">🟠 Urgent (Within 24 Hours)</option>
                <option value="normal">🟡 Standard (Scheduled Surgery)</option>
              </select>
            </div>
          </div>

          {/* Patient Details */}
          <div className="grid-2" style={{ gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Patient Full Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Sunita Devi"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Patient Health ID (UHR)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="HID-2026-XXXX"
                value={patientHealthId}
                onChange={(e) => setPatientHealthId(e.target.value)}
              />
            </div>
          </div>

          {/* Hospital Info */}
          <div className="grid-2" style={{ gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Hospital Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. SMS Hospital & Medical College"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Hospital City <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Jaipur"
                value={hospitalCity}
                onChange={(e) => setHospitalCity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid-2" style={{ gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Emergency Attendant Phone <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="tel"
                className="input-field"
                placeholder="+91 91234 56789"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Hospital Ward / Bed / Room No
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. ICU Ward 3, Bed #12"
                value={hospitalAddress}
                onChange={(e) => setHospitalAddress(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Reason / Clinical Indication
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Emergency bypass surgery scheduled"
              value={reasonForBlood}
              onChange={(e) => setReasonForBlood(e.target.value)}
            />
          </div>

          {/* DOCTOR PRESCRIPTION / HOSPITAL REQUISITION PROOF UPLOAD */}
          <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(239,68,68,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <ShieldCheck size={18} style={{ color: '#ef4444' }} />
              <strong style={{ fontSize: '0.9rem', color: '#fff' }}>
                Doctor Prescription / Hospital Blood Requisition Slip <span style={{ color: '#ef4444' }}>*</span>
              </strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Doctor prescription or blood bank requisition receipt is <strong>strictly required</strong> so our panel of doctors can verify patient legitimacy before broadcasting to voluntary donors.
            </p>

            <div style={{
              border: '2px dashed rgba(239, 68, 68, 0.4)', borderRadius: '12px',
              padding: '1.25rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)', cursor: 'pointer'
            }}>
              <input
                type="file"
                accept="image/*,application/pdf"
                id="rxProofFile"
                style={{ display: 'none' }}
                onChange={handleRxFileUpload}
                required={!rxFileUrl}
              />
              <label htmlFor="rxProofFile" style={{ cursor: 'pointer', display: 'block' }}>
                <UploadCloud size={30} style={{ color: '#ef4444', marginBottom: '0.3rem' }} />
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f87171' }}>
                  {rxFileName ? rxFileName : 'Click to Upload Doctor Prescription / Requisition Slip'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Required: JPG, PNG, PDF (Max 5MB)</div>
              </label>
            </div>

            {rxFileUrl && (
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#10b981' }}>
                <CheckCircle2 size={16} /> Prescription proof uploaded. Doctor audit enabled.
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: '#fff',
                padding: '0.6rem 1.4rem',
                border: 'none',
                fontWeight: 700
              }}
            >
              <AlertTriangle size={16} /> {submitting ? 'Submitting to Clinical Audit...' : 'Publish Emergency Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BloodRequestModal;
