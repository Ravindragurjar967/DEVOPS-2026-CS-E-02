import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Heart, X, CheckCircle2, AlertCircle, UploadCloud, 
  ShieldCheck, FileText, Droplet, User, Phone, MapPin, Calendar
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const BloodDonorRegisterModal = ({ isOpen, onClose, onRegistered, existingDonor }) => {
  const { user } = useContext(AuthContext);

  const [donorName, setDonorName] = useState(existingDonor?.donorName || user?.name || '');
  const [patientHealthId, setPatientHealthId] = useState(existingDonor?.patientHealthId || user?.patientInfo?.healthId || user?.healthId || '');
  const [bloodGroup, setBloodGroup] = useState(existingDonor?.bloodGroup || user?.patientInfo?.bloodGroup || 'O+');
  const [age, setAge] = useState(existingDonor?.age || 26);
  const [gender, setGender] = useState(existingDonor?.gender || 'Male');
  const [phone, setPhone] = useState(existingDonor?.phone || user?.phone || '');
  const [email, setEmail] = useState(existingDonor?.email || user?.email || '');
  const [city, setCity] = useState(existingDonor?.city || 'Jaipur');
  const [state, setState] = useState(existingDonor?.state || 'Rajasthan');
  const [address, setAddress] = useState(existingDonor?.address || '');
  const [lastDonationDate, setLastDonationDate] = useState(
    existingDonor?.lastDonationDate ? new Date(existingDonor.lastDonationDate).toISOString().split('T')[0] : ''
  );

  // Medical Fitness Document
  const [certificateUrl, setCertificateUrl] = useState(existingDonor?.medicalCertificateUrl || '');
  const [certFileName, setCertFileName] = useState('');

  // Eligibility Checklist
  const [eligibility, setEligibility] = useState({
    weightAbove50Kg: existingDonor?.eligibilityQuestions?.weightAbove50Kg ?? true,
    noTattoosPast6Months: existingDonor?.eligibilityQuestions?.noTattoosPast6Months ?? true,
    noMajorSurgeryPast1Year: existingDonor?.eligibilityQuestions?.noMajorSurgeryPast1Year ?? true,
    notOnBloodThinners: existingDonor?.eligibilityQuestions?.notOnBloodThinners ?? true
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please select a smaller document or image.');
      return;
    }

    setCertFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCertificateUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!donorName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please provide a valid contact phone number');
      return;
    }
    if (!city.trim()) {
      setErrorMsg('Please specify your current city for donor matching');
      return;
    }

    if (!eligibility.weightAbove50Kg || !eligibility.noTattoosPast6Months || !eligibility.notOnBloodThinners) {
      setErrorMsg('Donors must meet basic health eligibility criteria (weight > 50kg, no recent tattoos or blood thinners).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        donorName,
        patientHealthId: patientHealthId || `HID-${new Date().getFullYear()}-0001`,
        bloodGroup,
        age: Number(age),
        gender,
        phone,
        email,
        city,
        state,
        address,
        lastDonationDate: lastDonationDate || null,
        medicalCertificateUrl: certificateUrl,
        eligibilityQuestions: eligibility
      };

      const res = await axios.post('/api/blood-bank/donors/register', payload);
      setSuccessMsg(res.data.message || 'Donor registration successful! Queued for Doctor verification.');
      setTimeout(() => {
        if (onRegistered) onRegistered(res.data.donor);
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <div className="glass-card" style={{
        width: '100%', maxWidth: '720px', maxHeight: '92vh', overflowY: 'auto',
        background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(239, 68, 68, 0.35)',
        boxShadow: '0 25px 60px rgba(239, 68, 68, 0.15)', borderRadius: '20px', padding: '2rem'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f87171', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Heart size={16} className="text-danger" /> Life Saver Registration
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, marginTop: '0.2rem' }}>
              {existingDonor ? 'Update Blood Donor Profile' : 'Register as a Voluntary Blood Donor'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Your profile will be reviewed & validated by a certified doctor before going live.
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
          {/* Blood Group Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Select Blood Group <span style={{ color: '#ef4444' }}>*</span>
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

          {/* Personal Info Grid */}
          <div className="grid-2" style={{ gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Donor Full Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Vikram Choudhary"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Universal Health ID (UHR)
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

          <div className="grid-3" style={{ gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Age (18-65) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                min="18"
                max="65"
                className="input-field"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Gender
              </label>
              <select className="input-field" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Contact Phone <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="tel"
                className="input-field"
                placeholder="+91 98290 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Location Grid */}
          <div className="grid-2" style={{ gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                City (For local emergency matching) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Jaipur"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                State
              </label>
              <input
                type="text"
                className="input-field"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Full Address / Landmark
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Near SMS Hospital, Mansarovar"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Last Whole Blood Donation Date (Leave empty if first time)
            </label>
            <input
              type="date"
              className="input-field"
              value={lastDonationDate}
              onChange={(e) => setLastDonationDate(e.target.value)}
            />
          </div>

          {/* Medical Fitness Certificate Upload */}
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={18} style={{ color: '#38bdf8' }} />
              <strong style={{ fontSize: '0.9rem', color: '#fff' }}>Medical Fitness Certificate / CBC Report (Optional but Recommended)</strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Uploading a recent CBC blood test or fitness certificate helps doctors verify your profile 2x faster.
            </p>

            <div style={{
              border: '2px dashed rgba(56, 189, 248, 0.4)', borderRadius: '12px',
              padding: '1rem', textAlign: 'center', background: 'rgba(14, 165, 233, 0.05)', cursor: 'pointer'
            }}>
              <input
                type="file"
                accept="image/*,application/pdf"
                id="donorCertFile"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <label htmlFor="donorCertFile" style={{ cursor: 'pointer', display: 'block' }}>
                <UploadCloud size={28} style={{ color: '#38bdf8', marginBottom: '0.3rem' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8' }}>
                  {certFileName ? certFileName : 'Click to Upload Fitness Certificate / Lab Report'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Supports JPG, PNG, PDF (Max 5MB)</div>
              </label>
            </div>

            {certificateUrl && (
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#10b981' }}>
                <CheckCircle2 size={16} /> Document attached and ready for doctor audit.
              </div>
            )}
          </div>

          {/* Health Eligibility Questionnaire */}
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff', marginBottom: '0.75rem' }}>
              🩺 Donor Health Screening Declarations:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={eligibility.weightAbove50Kg}
                  onChange={(e) => setEligibility({ ...eligibility, weightAbove50Kg: e.target.checked })}
                />
                My body weight is above 50 kg and I am in good overall physical health.
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={eligibility.noTattoosPast6Months}
                  onChange={(e) => setEligibility({ ...eligibility, noTattoosPast6Months: e.target.checked })}
                />
                I have NOT received any tattoos, ear piercings, or acupuncture in the past 6 months.
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={eligibility.noMajorSurgeryPast1Year}
                  onChange={(e) => setEligibility({ ...eligibility, noMajorSurgeryPast1Year: e.target.checked })}
                />
                I have NOT undergone any major surgery or hospital admission in the past 12 months.
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={eligibility.notOnBloodThinners}
                  onChange={(e) => setEligibility({ ...eligibility, notOnBloodThinners: e.target.checked })}
                />
                I am NOT currently on blood thinners, chronic cardiac medications, or antibiotics.
              </label>
            </div>
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
              <Heart size={16} /> {submitting ? 'Submitting to Doctor...' : existingDonor ? 'Update Donor Profile' : 'Register as Blood Donor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BloodDonorRegisterModal;
