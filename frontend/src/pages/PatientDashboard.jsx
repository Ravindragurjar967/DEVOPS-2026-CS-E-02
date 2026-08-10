import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { FileText, User, Activity, QrCode, Download, ExternalLink, ShieldCheck, Heart, AlertTriangle } from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      const [rxRes, reportRes] = await Promise.all([
        axios.get('/api/prescriptions/my'),
        axios.get('/api/reports/my')
      ]);
      setPrescriptions(rxRes.data);
      setReports(reportRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Patient Universal Health ID Card Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', border: '1px solid rgba(14, 165, 233, 0.4)', borderRadius: '20px', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 10 }}>
          <div>
            <span className="badge badge-patient" style={{ marginBottom: '0.5rem' }}>
              <ShieldCheck size={14} /> National Universal Digital Health Card
            </span>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, marginTop: '0.3rem' }}>
              {user?.name}
            </h1>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.8rem', fontSize: '0.9rem', color: '#94a3b8' }}>
              <span>Health ID: <strong style={{ color: '#38bdf8' }}>{user?.healthId || 'HID-2026-PENDING'}</strong></span>
              <span>Blood Group: <strong style={{ color: '#f43f5e' }}>{user?.patientInfo?.bloodGroup || 'O+'}</strong></span>
              <span>Age: {user?.patientInfo?.age || '32'} yrs</span>
              <span>Gender: {user?.patientInfo?.gender || 'Male'}</span>
            </div>

            {user?.patientInfo?.allergies && user.patientInfo.allergies.length > 0 && (
              <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontSize: '0.85rem' }}>
                <AlertTriangle size={15} /> Known Allergies: <strong>{user.patientInfo.allergies.join(', ')}</strong>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', background: '#ffffff', padding: '1rem', borderRadius: '14px', border: '2px solid #38bdf8', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
            <QRCodeSVG value={JSON.stringify({ healthId: user?.healthId, name: user?.name })} size={100} />
            <div style={{ fontSize: '0.72rem', color: '#1e293b', fontWeight: 700, marginTop: '0.4rem' }}>
              SCAN HEALTH CARD
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid-3">
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.9rem', background: 'rgba(14, 165, 233, 0.15)', borderRadius: '14px', color: '#0ea5e9' }}>
            <FileText size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{prescriptions.length}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Digital Prescriptions</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.9rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '14px', color: '#10b981' }}>
            <Activity size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{reports.length}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Lab Reports Uploaded</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.9rem', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '14px', color: '#f59e0b' }}>
            <Heart size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>100% Digital</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Paperless Universal Access</div>
          </div>
        </div>
      </div>

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

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                    <strong>Prescribed Medicines ({rx.medicines?.length || 0}):</strong>
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem' }}>
                      {rx.medicines?.map((m, i) => (
                        <li key={i} style={{ marginBottom: '0.2rem' }}>
                          <strong style={{ color: '#f8fafc' }}>{m.name}</strong> ({m.dosage}) - {m.frequency} for {m.duration}
                        </li>
                      ))}
                    </ul>
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

      {/* Reports Section Link Banner */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem' }}>Medical & Diagnostic Reports</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>View lab results, blood tests, X-rays, and diagnostic reports online.</p>
        </div>
        <Link to="/my-reports" className="btn btn-secondary">
          <ExternalLink size={16} /> View Lab Reports Portal
        </Link>
      </div>
    </div>
  );
};

export default PatientDashboard;
