import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { FileText, User, Activity, QrCode, Download, ExternalLink, ShieldCheck, Heart, AlertTriangle, Calendar, Bot, Lock, Unlock } from 'lucide-react';
import AIChatbotModal from '../components/AIChatbotModal';

const PatientDashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAiBot, setShowAiBot] = useState(false);
  const [doctorConsent, setDoctorConsent] = useState(
    user?.patientInfo?.doctorConsentGranted !== false
  );
  const [togglingConsent, setTogglingConsent] = useState(false);

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      const [rxRes, reportRes, apptRes] = await Promise.all([
        axios.get('/api/prescriptions/my'),
        axios.get('/api/reports/my'),
        axios.get('/api/appointments/my')
      ]);
      setPrescriptions(rxRes.data);
      setReports(reportRes.data);
      setAppointments(apptRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConsent = async () => {
    const newConsent = !doctorConsent;
    setTogglingConsent(true);
    try {
      await axios.put('/api/patients/toggle-consent', { granted: newConsent });
      setDoctorConsent(newConsent);
      if (user && user.patientInfo) {
        const updatedUser = { ...user, patientInfo: { ...user.patientInfo, doctorConsentGranted: newConsent } };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingConsent(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Patient Universal Health ID Card Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', border: '1px solid rgba(14, 165, 233, 0.4)', borderRadius: '20px', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 10 }}>
          <div>
            <span className="badge badge-patient" style={{ marginBottom: '0.5rem' }}>
              <ShieldCheck size={14} /> National Universal Digital Health Card
            </span>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, marginTop: '0.3rem' }}>
              {user?.name}
            </h1>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.8rem', fontSize: '0.9rem', color: '#94a3b8' }}>
              <span>Health ID: <strong style={{ color: '#38bdf8' }}>{user?.healthId || user?.patientInfo?.healthId || 'HID-2026-DEMO'}</strong></span>
              <span>Blood Group: <strong style={{ color: '#f43f5e' }}>{user?.patientInfo?.bloodGroup || 'O+'}</strong></span>
              <span>Age: {user?.patientInfo?.age || '32'} yrs</span>
            </div>

            {/* Doctor Access Permission Toggle */}
            <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem' }}>
              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ color: doctorConsent ? '#10b981' : '#f43f5e', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {doctorConsent ? <Unlock size={16} /> : <Lock size={16} />}
                  Doctor Record Permission: {doctorConsent ? 'GRANTED (Doctors can view history)' : 'RESTRICTED (Doctors cannot view history)'}
                </strong>
              </div>
              <button onClick={handleToggleConsent} className={`btn btn-sm ${doctorConsent ? 'btn-secondary' : 'btn-accent'}`} disabled={togglingConsent}>
                {doctorConsent ? 'Revoke Doctor Access' : 'Grant Doctor Access'}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', background: '#ffffff', padding: '1rem', borderRadius: '14px', border: '2px solid #38bdf8' }}>
            <QRCodeSVG value={JSON.stringify({ healthId: user?.healthId || user?.patientInfo?.healthId, name: user?.name })} size={100} />
            <div style={{ fontSize: '0.72rem', color: '#1e293b', fontWeight: 700, marginTop: '0.4rem' }}>
              SCAN HEALTH CARD
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA Grid */}
      <div className="grid-3">
        <Link to="/book-appointment" className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(14, 165, 233, 0.05) 100%)', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
          <div style={{ padding: '0.9rem', background: '#0ea5e9', borderRadius: '14px', color: '#fff' }}>
            <Calendar size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Book Appointment</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Get sequential token number</div>
          </div>
        </Link>

        <div onClick={() => setShowAiBot(true)} className="glass-card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
          <div style={{ padding: '0.9rem', background: '#8b5cf6', borderRadius: '14px', color: '#fff' }}>
            <Bot size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>AI Personal Health Bot</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Ask symptoms & disease advice</div>
          </div>
        </div>

        <Link to="/my-reports" className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.9rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '14px', color: '#10b981' }}>
            <Activity size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{reports.length} Lab Reports</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>View online diagnostic tests</div>
          </div>
        </Link>
      </div>

      {/* Booked Appointments Tokens List */}
      {appointments.length > 0 && (
        <div className="glass-card">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} className="text-primary" /> My Booked Doctor Appointments
          </h3>
          <div className="grid-3">
            {appointments.map((a) => (
              <div key={a._id} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8' }}>Token #{a.tokenNumber}</span>
                  <span className="badge badge-doctor">{a.status}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Dr. {a.doctorName}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{a.date} ({a.timeSlot})</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prescriptions List */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} className="text-primary" /> My Digital Prescriptions
          </h3>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading records...</p>
        ) : prescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <p>No prescriptions online yet. Your doctor will issue digital prescriptions here.</p>
          </div>
        ) : (
          <div className="grid-2">
            {prescriptions.map((rx) => (
              <div key={rx._id} className="glass-card" style={{ padding: '1.25rem', background: 'rgba(15, 23, 42, 0.6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>Rx ID: {rx.prescriptionId}</span>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '0.1rem' }}>Dr. {rx.doctorName}</h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{rx.doctorSpecialty}</p>
                    </div>
                    <span className={`badge ${rx.status === 'active' ? 'badge-active' : 'badge-dispensed'}`}>
                      {rx.status}
                    </span>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.8rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Diagnosis:</div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{rx.diagnosis}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <Link to={`/prescription/${rx._id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                    <Download size={14} /> Download PDF / QR
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating AI Chatbot Modal */}
      {showAiBot && <AIChatbotModal onClose={() => setShowAiBot(false)} />}
    </div>
  );
};

export default PatientDashboard;
