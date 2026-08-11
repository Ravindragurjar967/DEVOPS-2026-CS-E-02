import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  FilePlus, Search, User, FileText, Calendar, CheckCircle2, Stethoscope, 
  ArrowUpRight, Activity, Ticket, PlayCircle, History, AlertTriangle, Lock, ShieldCheck 
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  // Left Side Patient History Search State
  const [patientSearchId, setPatientSearchId] = useState('');
  const [selectedPatientRecord, setSelectedPatientRecord] = useState(null);
  const [searchingHistory, setSearchingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      const [rxRes, apptRes] = await Promise.all([
        axios.get('/api/prescriptions/my'),
        axios.get('/api/appointments/my')
      ]);
      setPrescriptions(rxRes.data);
      setAppointments(apptRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Search Patient Previous Medical History by Health ID
  const handleFetchPatientHistory = async (e) => {
    if (e) e.preventDefault();
    if (!patientSearchId.trim()) return;

    setSearchingHistory(true);
    setHistoryError('');
    setSelectedPatientRecord(null);

    try {
      const cleanId = patientSearchId.trim();
      const res = await axios.get(`/api/patients/record/${encodeURIComponent(cleanId)}`);
      setSelectedPatientRecord(res.data);
    } catch (err) {
      setHistoryError(err.response?.data?.message || 'Patient record not found for this Health ID.');
    } finally {
      setSearchingHistory(false);
    }
  };

  const updateApptStatus = async (apptId, status) => {
    try {
      await axios.put(`/api/appointments/${apptId}/status`, { status });
      fetchDoctorData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Doctor Welcome Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)', border: '1px solid rgba(14, 165, 233, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem' }}>
            <Stethoscope size={16} /> Doctor Station & Universal Health Lookup
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700 }}>
            Dr. {user?.name}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            {user?.doctorInfo?.specialty || 'General Practitioner'} • {user?.doctorInfo?.hospital || 'Universal Health Network'}
          </p>
        </div>
        <Link to="/write-prescription" className="btn btn-primary">
          <FilePlus size={18} /> Write Digital Prescription
        </Link>
      </div>

      {/* Main 2-Column Grid: Left Side Patient History Search | Right Side Queue & RX */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem' }}>
        
        {/* LEFT COLUMN: Patient ID Search & Previous Medical History Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-card" style={{ border: '1px solid rgba(14, 165, 233, 0.4)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8' }}>
              <History size={20} /> Patient Record Lookup
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1rem' }}>
              Enter Patient Health ID (e.g. <strong>HID-2026-8834</strong>) to load full previous history.
            </p>

            <form onSubmit={handleFetchPatientHistory} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Health ID (e.g. HID-2026-8834)..."
                value={patientSearchId}
                onChange={(e) => setPatientSearchId(e.target.value)}
                style={{ fontSize: '0.88rem', padding: '0.65rem 0.85rem' }}
                required
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={searchingHistory}>
                {searchingHistory ? '...' : <Search size={16} />}
              </button>
            </form>

            {/* Error Display */}
            {historyError && (
              <div style={{ marginTop: '0.85rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem' }}>
                {historyError}
              </div>
            )}
          </div>

          {/* Detailed Patient History Display Container */}
          {selectedPatientRecord && (
            <div className="glass-card" style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '1.25rem' }}>
              {/* Patient Basic Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedPatientRecord.patient?.name}</h4>
                  <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
                    Health ID: {selectedPatientRecord.patient?.patientInfo?.healthId}
                  </div>
                </div>
                <Link to={`/write-prescription?healthId=${selectedPatientRecord.patient?.patientInfo?.healthId}&patientName=${encodeURIComponent(selectedPatientRecord.patient?.name)}`} className="btn btn-accent btn-sm" style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}>
                  <FilePlus size={13} /> Write RX
                </Link>
              </div>

              {/* Vitals & Allergies Summary */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem', background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '8px' }}>
                <span>Age: <strong style={{ color: '#fff' }}>{selectedPatientRecord.patient?.patientInfo?.age || 'N/A'}</strong></span>
                <span>Blood: <strong style={{ color: '#f43f5e' }}>{selectedPatientRecord.patient?.patientInfo?.bloodGroup || 'O+'}</strong></span>
                <span>Gender: <strong style={{ color: '#fff' }}>{selectedPatientRecord.patient?.patientInfo?.gender || 'Male'}</strong></span>
              </div>

              {selectedPatientRecord.patient?.patientInfo?.allergies?.length > 0 && (
                <div style={{ fontSize: '0.78rem', color: '#fbbf24', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <AlertTriangle size={14} /> Known Allergies: <strong>{selectedPatientRecord.patient.patientInfo.allergies.join(', ')}</strong>
                </div>
              )}

              {/* Patient Consent Check */}
              {selectedPatientRecord.consentRestricted ? (
                <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'center' }}>
                  <Lock size={20} style={{ margin: '0 auto 0.3rem' }} />
                  <strong>Access Restricted</strong>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                    Patient has restricted doctor access to medical history.
                  </div>
                </div>
              ) : (
                /* Prescriptions & Reports Previous History Tabs */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  
                  {/* Previous Prescriptions History */}
                  <div>
                    <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.5px', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <FileText size={14} /> Previous Prescriptions ({selectedPatientRecord.prescriptions?.length || 0})
                    </h5>

                    {selectedPatientRecord.prescriptions?.length === 0 ? (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No past prescriptions found.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.2rem' }}>
                        {selectedPatientRecord.prescriptions.map((rx) => (
                          <div key={rx._id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                              <strong style={{ color: '#38bdf8' }}>{rx.prescriptionId}</strong>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(rx.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '0.2rem' }}>{rx.diagnosis}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              Medicines: {rx.medicines?.map(m => m.name).join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Diagnostic Lab Reports History */}
                  <div>
                    <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.5px', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Activity size={14} /> Lab Reports ({selectedPatientRecord.reports?.length || 0})
                    </h5>

                    {selectedPatientRecord.reports?.length === 0 ? (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No lab reports uploaded.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                        {selectedPatientRecord.reports.map((rep) => (
                          <div key={rep._id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem', fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <strong>{rep.title}</strong>
                              <span className="badge badge-patient" style={{ fontSize: '0.65rem' }}>{rep.category}</span>
                            </div>
                            {rep.summary && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>{rep.summary}</div>}
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

        {/* RIGHT COLUMN: Live Token Queue & Recent Prescriptions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Live Order-wise Appointments Token Queue */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Ticket size={20} className="text-primary" /> Live Sequential Token Appointments Queue
              </h3>
              <span className="badge badge-doctor">{appointments.filter(a => a.status !== 'completed').length} Pending Patients</span>
            </div>

            {appointments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No appointment tokens booked for today yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.85rem' }}>
                {appointments.map((a) => (
                  <div key={a._id} className="glass-card" style={{ padding: '0.85rem', background: a.status === 'in_consultation' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(15, 23, 42, 0.6)', border: a.status === 'in_consultation' ? '1px solid #38bdf8' : '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', background: 'rgba(14, 165, 233, 0.15)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                        Token #{a.tokenNumber}
                      </span>
                      <span className={`badge ${a.status === 'in_consultation' ? 'badge-doctor' : a.status === 'completed' ? 'badge-patient' : 'badge-pharmacist'}`} style={{ fontSize: '0.7rem' }}>
                        {a.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.98rem', fontWeight: 600 }}>{a.patientName}</h4>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      ID: <strong style={{ color: '#38bdf8' }}>{a.patientHealthId}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                      {a.status === 'pending' && (
                        <button onClick={() => updateApptStatus(a._id, 'in_consultation')} className="btn btn-primary btn-sm" style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.78rem' }}>
                          <PlayCircle size={13} /> Start
                        </button>
                      )}
                      {a.status === 'in_consultation' && (
                        <button onClick={() => updateApptStatus(a._id, 'completed')} className="btn btn-accent btn-sm" style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.78rem' }}>
                          <CheckCircle2 size={13} /> Complete
                        </button>
                      )}
                      <button onClick={() => { setPatientSearchId(a.patientHealthId); handleFetchPatientHistory(); }} className="btn btn-secondary btn-sm" style={{ padding: '0.3rem 0.5rem', fontSize: '0.78rem' }} title="Load History">
                        <History size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Prescriptions Table */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem' }}>Recent Prescriptions</h3>
              <Link to="/write-prescription" className="btn btn-secondary btn-sm" style={{ fontSize: '0.8rem' }}>+ New Prescribe</Link>
            </div>

            {loading ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading prescription records...</p>
            ) : prescriptions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <FileText size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p>No prescriptions written yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Rx ID</th>
                      <th>Patient</th>
                      <th>Health ID</th>
                      <th>Diagnosis</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.slice(0, 8).map((rx) => (
                      <tr key={rx._id}>
                        <td><strong style={{ color: '#38bdf8' }}>{rx.prescriptionId}</strong></td>
                        <td>{rx.patientName}</td>
                        <td><span className="badge badge-patient" style={{ fontSize: '0.72rem' }}>{rx.patientHealthId}</span></td>
                        <td>{rx.diagnosis}</td>
                        <td>
                          <Link to={`/prescription/${rx._id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}>
                            PDF / QR
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default DoctorDashboard;
