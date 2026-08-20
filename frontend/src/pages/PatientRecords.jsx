import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, User, FileText, Activity, Stethoscope, FilePlus, 
  History, AlertTriangle, Lock, ShieldCheck, ArrowRight, Phone 
} from 'lucide-react';

const PatientRecords = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatientRecord, setSelectedPatientRecord] = useState(null);
  const [searching, setSearching] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState('');

  // 1. Search Patients by Health ID, Name, or Mobile Number
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError('');
    setSearchResults([]);
    setSelectedPatientRecord(null);

    try {
      const cleanQuery = searchQuery.trim();
      
      // Check if exact Health ID was typed (e.g. HID-2026-8834)
      if (cleanQuery.toUpperCase().startsWith('HID-')) {
        await fetchPatientFullHistory(cleanQuery);
      } else {
        const res = await axios.get(`/api/patients/search?query=${encodeURIComponent(cleanQuery)}`);
        setSearchResults(res.data);
        if (res.data.length === 1 && res.data[0].patientInfo?.healthId) {
          await fetchPatientFullHistory(res.data[0].patientInfo.healthId);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error searching patient records.');
    } finally {
      setSearching(false);
    }
  };

  // 2. Fetch Full Universal History for selected Patient by Health ID
  const fetchPatientFullHistory = async (healthId) => {
    setLoadingHistory(true);
    setError('');
    try {
      const res = await axios.get(`/api/patients/record/${encodeURIComponent(healthId)}`);
      setSelectedPatientRecord(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Universal Health Record not found for this Patient ID.');
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)', border: '1px solid rgba(14, 165, 233, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-doctor" style={{ marginBottom: '0.3rem' }}>
            <Search size={14} /> Medical Record Vault
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700 }}>
            Patient Universal History & Record Lookup
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Enter Patient Health ID (e.g. <strong>HID-2026-8834</strong>), Name, or Mobile Number to load complete medical history.
          </p>
        </div>
      </div>

      {/* Main 2-Column Split: Left Side Patient Search & List | Right Side Full History Display */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem' }}>
        
        {/* LEFT COLUMN: Search Bar & Patient Results Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-card">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8' }}>
              <Search size={18} /> Search Patient ID
            </h3>

            <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Enter Health ID (HID-2026-...), Name or Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={searching}>
                {searching ? 'Searching Records...' : <><Search size={16} /> Load Patient History</>}
              </button>
            </form>

            {error && (
              <div style={{ marginTop: '1rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}
          </div>

          {/* Search Matches List */}
          {searchResults.length > 0 && (
            <div className="glass-card" style={{ padding: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.5px' }}>
                Search Matches ({searchResults.length}):
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '400px', overflowY: 'auto' }}>
                {searchResults.map((p) => (
                  <div 
                    key={p._id} 
                    onClick={() => p.patientInfo?.healthId && fetchPatientFullHistory(p.patientInfo.healthId)}
                    style={{ 
                      background: selectedPatientRecord?.patient?.patientInfo?.healthId === p.patientInfo?.healthId ? 'rgba(14, 165, 233, 0.2)' : 'rgba(255,255,255,0.03)', 
                      border: selectedPatientRecord?.patient?.patientInfo?.healthId === p.patientInfo?.healthId ? '1px solid #38bdf8' : '1px solid var(--border-color)', 
                      borderRadius: '10px', 
                      padding: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '0.2rem' }}>
                      ID: {p.patientInfo?.healthId || 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', gap: '0.8rem' }}>
                      <span>Age: {p.patientInfo?.age || '30'}</span>
                      <span>Blood: <strong style={{ color: '#f43f5e' }}>{p.patientInfo?.bloodGroup || 'O+'}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Full Patient Previous History Viewer */}
        <div>
          {loadingHistory ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <Activity size={40} className="text-primary" style={{ marginBottom: '0.5rem' }} />
              <p>Fetching complete universal health history for patient...</p>
            </div>
          ) : !selectedPatientRecord ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <History size={54} style={{ opacity: 0.3, marginBottom: '0.8rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>No Patient Record Selected</h3>
              <p style={{ fontSize: '0.88rem', marginTop: '0.4rem', maxWidth: '420px', margin: '0.4rem auto 0' }}>
                Enter a Patient Health ID in the search box on the left or select a patient to view full previous prescriptions, diagnostic lab reports, and vitals.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Patient Basic Profile Card */}
              <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)', border: '1px solid rgba(14, 165, 233, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span className="badge badge-patient"><ShieldCheck size={13} /> Verified Patient Profile</span>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, marginTop: '0.3rem' }}>
                      {selectedPatientRecord.patient?.name}
                    </h2>
                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginTop: '0.6rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      <span>Health ID: <strong style={{ color: '#38bdf8' }}>{selectedPatientRecord.patient?.patientInfo?.healthId}</strong></span>
                      <span>Blood Group: <strong style={{ color: '#f43f5e' }}>{selectedPatientRecord.patient?.patientInfo?.bloodGroup || 'O+'}</strong></span>
                      <span>Age: {selectedPatientRecord.patient?.patientInfo?.age || 'N/A'} yrs</span>
                      <span>Phone: {selectedPatientRecord.patient?.phone}</span>
                    </div>

                    {selectedPatientRecord.patient?.patientInfo?.allergies?.length > 0 && (
                      <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontSize: '0.85rem' }}>
                        <AlertTriangle size={15} /> Known Allergies: <strong>{selectedPatientRecord.patient.patientInfo.allergies.join(', ')}</strong>
                      </div>
                    )}
                  </div>

                  <Link to={`/write-prescription?healthId=${selectedPatientRecord.patient?.patientInfo?.healthId}&patientName=${encodeURIComponent(selectedPatientRecord.patient?.name)}`} className="btn btn-accent">
                    <FilePlus size={16} /> + Issue New Prescription
                  </Link>
                </div>
              </div>

              {/* Consent Restriction Warning Banner */}
              {selectedPatientRecord.consentRestricted ? (
                <div className="glass-card" style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.4)', textAlign: 'center', padding: '2.5rem' }}>
                  <Lock size={48} style={{ color: '#f43f5e', marginBottom: '0.75rem' }} />
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f43f5e' }}>Medical History Access Restricted</h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.4rem', maxWidth: '540px', margin: '0.4rem auto 0' }}>
                    {selectedPatientRecord.message || 'The patient has disabled doctor permission to view their full past medical prescriptions & lab reports. Please ask the patient to enable doctor access from their patient portal.'}
                  </p>
                </div>
              ) : (
                /* Medical History Grid */
                <div className="grid-2">
                  {/* Previous Prescriptions History */}
                  <div className="glass-card">
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8' }}>
                      <FileText size={18} /> Prescriptions History ({selectedPatientRecord.prescriptions?.length || 0})
                    </h3>

                    {selectedPatientRecord.prescriptions?.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No past prescriptions recorded.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {selectedPatientRecord.prescriptions.map((rx) => (
                          <div key={rx._id} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.85rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <strong style={{ color: '#38bdf8', fontSize: '0.85rem' }}>{rx.prescriptionId}</strong>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '0.15rem' }}>Dr. {rx.doctorName}</div>
                                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>Diagnosis: {rx.diagnosis}</div>
                              </div>
                              <span className={`badge ${rx.status === 'active' ? 'badge-active' : 'badge-dispensed'}`}>
                                {rx.status}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                              <strong>Medicines ({rx.medicines?.length || 0}):</strong>
                              <ul style={{ paddingLeft: '1.1rem', marginTop: '0.2rem' }}>
                                {rx.medicines?.map((m, idx) => (
                                  <li key={idx}><strong style={{ color: '#fff' }}>{m.name}</strong> ({m.dosage}) - {m.frequency} for {m.duration}</li>
                                ))}
                              </ul>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Date: {new Date(rx.createdAt).toLocaleDateString()}</span>
                              <Link to={`/prescription/${rx._id}`} style={{ color: '#38bdf8', fontWeight: 600 }}>
                                View PDF / QR →
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Diagnostic Lab Reports History */}
                  <div className="glass-card">
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
                      <Activity size={18} /> Lab Reports ({selectedPatientRecord.reports?.length || 0})
                    </h3>

                    {selectedPatientRecord.reports?.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No diagnostic lab reports uploaded.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {selectedPatientRecord.reports.map((rep) => (
                          <div key={rep._id} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.85rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>{rep.title}</strong>
                              <span className="badge badge-patient">{rep.category}</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              Lab: {rep.labName} • Date: {new Date(rep.reportDate).toLocaleDateString()}
                            </div>
                            {rep.summary && (
                              <div style={{ fontSize: '0.82rem', marginTop: '0.4rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '6px' }}>
                                <strong>Summary:</strong> {rep.summary}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientRecords;
