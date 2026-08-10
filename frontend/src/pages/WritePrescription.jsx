import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, FileCheck, Stethoscope, Activity, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const WritePrescription = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [patientHealthId, setPatientHealthId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');

  // Vitals
  const [bp, setBp] = useState('120/80 mmHg');
  const [pulse, setPulse] = useState('72 bpm');
  const [weight, setWeight] = useState('68 kg');
  const [temp, setTemp] = useState('98.6 °F');

  // Dynamic Medicine List
  const [medicines, setMedicines] = useState([
    { name: 'Paracetamol', dosage: '650mg', frequency: '1-0-1', duration: '5 Days', instructions: 'Take after meal' }
  ]);

  // Lab Tests & Advice
  const [labTests, setLabTests] = useState('Complete Blood Count (CBC)');
  const [advice, setAdvice] = useState('Drink plenty of water and rest well.');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const hid = searchParams.get('healthId');
    const pname = searchParams.get('patientName');
    if (hid) setPatientHealthId(hid);
    if (pname) setPatientName(pname);
  }, [searchParams]);

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      { name: '', dosage: '', frequency: '1-0-1', duration: '3 Days', instructions: 'Take after meal' }
    ]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!patientHealthId.trim()) {
      setError('Please enter or select a Patient Health ID.');
      return;
    }

    if (medicines.length === 0) {
      setError('Please add at least one prescribed medicine.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        patientHealthId,
        patientName: patientName || 'Patient',
        diagnosis,
        vitals: { bp, pulse, weight, temp },
        medicines,
        labTestsRecommended: labTests ? labTests.split(',').map(s => s.trim()) : [],
        advice
      };

      const res = await axios.post('/api/prescriptions', payload);
      navigate(`/prescription/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue digital prescription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <span className="badge badge-doctor" style={{ marginBottom: '0.4rem' }}>
            <Stethoscope size={14} /> Doctor Station
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700 }}>
            Create Online Digital Prescription
          </h2>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Section 1: Patient Information */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8' }}>
            <Activity size={18} /> 1. Patient Details
          </h3>
          <div className="grid-2">
            <div className="form-group">
              <label>Patient Universal Health ID *</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. HID-2026-8834"
                value={patientHealthId}
                onChange={e=>setPatientHealthId(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Patient Full Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Amit Kumar"
                value={patientName}
                onChange={e=>setPatientName(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Clinical Vitals & Diagnosis */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
            <Activity size={18} /> 2. Clinical Vitals & Primary Diagnosis
          </h3>
          <div className="grid-4" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label>Blood Pressure</label>
              <input type="text" className="input-field" value={bp} onChange={e=>setBp(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Pulse Rate</label>
              <input type="text" className="input-field" value={pulse} onChange={e=>setPulse(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Weight</label>
              <input type="text" className="input-field" value={weight} onChange={e=>setWeight(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Body Temp</label>
              <input type="text" className="input-field" value={temp} onChange={e=>setTemp(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Diagnosis / Clinical Findings *</label>
            <textarea 
              rows="2" 
              className="input-field" 
              placeholder="e.g. Acute Viral Fever with mild throat infection"
              value={diagnosis}
              onChange={e=>setDiagnosis(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Section 3: Prescribed Medicines */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
              💊 3. Rx Prescribed Medicines
            </h3>
            <button type="button" onClick={handleAddMedicine} className="btn btn-secondary btn-sm">
              <Plus size={16} /> Add Medicine Row
            </button>
          </div>

          {medicines.map((med, index) => (
            <div key={index} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Medicine #{index + 1}</span>
                {medicines.length > 1 && (
                  <button type="button" onClick={() => handleRemoveMedicine(index)} style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="grid-4">
                <div className="form-group">
                  <label>Medicine Name & Strength</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Amoxicillin" 
                    value={med.name} 
                    onChange={e=>handleMedicineChange(index, 'name', e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Dosage</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. 500mg" 
                    value={med.dosage} 
                    onChange={e=>handleMedicineChange(index, 'dosage', e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Frequency</label>
                  <select value={med.frequency} onChange={e=>handleMedicineChange(index, 'frequency', e.target.value)}>
                    <option value="1-0-1">1-0-1 (Morning & Night)</option>
                    <option value="1-1-1">1-1-1 (Thrice daily)</option>
                    <option value="1-0-0">1-0-0 (Morning only)</option>
                    <option value="0-0-1">0-0-1 (Night only)</option>
                    <option value="SOS">SOS (As needed)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. 5 Days" 
                    value={med.duration} 
                    onChange={e=>handleMedicineChange(index, 'duration', e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Instructions</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Take after meals with warm water" 
                  value={med.instructions} 
                  onChange={e=>handleMedicineChange(index, 'instructions', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Section 4: Recommended Lab Tests & Advice */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#a78bfa' }}>
            🔬 4. Recommended Lab Investigations & Dietary Advice
          </h3>
          <div className="form-group">
            <label>Lab Tests / Scans (Comma separated)</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Complete Blood Count (CBC), Urine Routine"
              value={labTests}
              onChange={e=>setLabTests(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>General Advice / Doctor Notes</label>
            <textarea 
              rows="2" 
              className="input-field" 
              placeholder="e.g. Avoid cold food, re-check after 5 days if fever persists."
              value={advice}
              onChange={e=>setAdvice(e.target.value)}
            />
          </div>
        </div>

        {/* Live Verification Stamp Preview */}
        <div className="glass-card" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px dashed rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h4 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={18} /> Automated Digital Signature & Verification QR
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Upon submission, a unique encrypted QR code & digital seal will be generated automatically for instant online pharmacy verification.
            </p>
          </div>
          <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '8px' }}>
            <QRCodeSVG value={`VERIFY-LIVE-RX-${patientHealthId || 'HID'}`} size={64} />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} disabled={loading}>
          {loading ? 'Generating Digital Prescription...' : <><FileCheck size={20} /> Issue Digital Prescription & Create PDF</>}
        </button>
      </form>
    </div>
  );
};

export default WritePrescription;
