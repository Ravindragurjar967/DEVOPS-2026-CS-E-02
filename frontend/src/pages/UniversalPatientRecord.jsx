import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { User, FileText, Activity, ShieldCheck, Calendar, ArrowLeft, Pill, AlertTriangle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const UniversalPatientRecord = () => {
  const { healthId } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecord();
  }, [healthId]);

  const fetchRecord = async () => {
    try {
      const res = await axios.get(`/api/patients/record/${healthId}`);
      setRecord(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Universal Health Record not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Universal Health Record...</div>;
  }

  if (error || !record) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h3>{error || 'Record Not Found'}</h3>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>Return to Portal</Link>
      </div>
    );
  }

  const { patient, prescriptions, reports } = record;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back
        </Link>
        <Link to={`/write-prescription?healthId=${patient.patientInfo?.healthId}&patientName=${encodeURIComponent(patient.name)}`} className="btn btn-primary btn-sm">
          + Issue New Prescription
        </Link>
      </div>

      {/* Patient Profile Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge badge-patient"><ShieldCheck size={14} /> Universal Electronic Health Record (EHR)</span>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, marginTop: '0.4rem' }}>
              {patient.name}
            </h1>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.6rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span>Health ID: <strong style={{ color: '#38bdf8' }}>{patient.patientInfo?.healthId}</strong></span>
              <span>Blood Group: <strong style={{ color: '#f43f5e' }}>{patient.patientInfo?.bloodGroup || 'O+'}</strong></span>
              <span>Age: {patient.patientInfo?.age || 'N/A'} yrs</span>
              <span>Phone: {patient.phone}</span>
              <span>Email: {patient.email}</span>
            </div>

            {patient.patientInfo?.allergies && patient.patientInfo.allergies.length > 0 && (
              <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontSize: '0.85rem' }}>
                <AlertTriangle size={15} /> Known Allergies: <strong>{patient.patientInfo.allergies.join(', ')}</strong>
              </div>
            )}
          </div>

          <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '10px' }}>
            <QRCodeSVG value={JSON.stringify({ healthId: patient.patientInfo?.healthId, name: patient.name })} size={80} />
          </div>
        </div>
      </div>

      {/* Medical History Timeline */}
      <div className="grid-2">
        {/* Prescriptions Column */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8' }}>
            <FileText size={20} /> Prescriptions History ({prescriptions.length})
          </h3>
          {prescriptions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No prescription history recorded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {prescriptions.map((rx) => (
                <div key={rx._id} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ color: '#38bdf8' }}>{rx.prescriptionId}</strong>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '0.2rem' }}>Dr. {rx.doctorName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rx.diagnosis}</div>
                    </div>
                    <span className={`badge ${rx.status === 'active' ? 'badge-active' : 'badge-dispensed'}`}>
                      {rx.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Issued: {new Date(rx.createdAt).toLocaleDateString()} • {rx.medicines?.length || 0} medicines
                  </div>
                  <Link to={`/prescription/${rx._id}`} style={{ fontSize: '0.8rem', color: '#38bdf8', marginTop: '0.5rem', display: 'inline-block' }}>
                    View Full Digital Prescription →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lab Reports Column */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
            <Activity size={20} /> Diagnostic Lab Reports ({reports.length})
          </h3>
          {reports.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No diagnostic reports uploaded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reports.map((rep) => (
                <div key={rep._id} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ color: '#ffffff' }}>{rep.title}</strong>
                    <span className="badge badge-patient">{rep.category}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Lab: {rep.labName} • Date: {new Date(rep.reportDate).toLocaleDateString()}
                  </div>
                  {rep.summary && (
                    <div style={{ fontSize: '0.85rem', marginTop: '0.4rem', color: '#cbd5e1' }}>
                      Summary: {rep.summary}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversalPatientRecord;
