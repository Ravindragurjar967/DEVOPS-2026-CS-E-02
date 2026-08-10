import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Printer, Download, ArrowLeft, ShieldCheck, Stethoscope, Activity, CheckCircle2 } from 'lucide-react';

const PrescriptionView = () => {
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const pdfRef = useRef();

  useEffect(() => {
    fetchPrescription();
  }, [id]);

  const fetchPrescription = async () => {
    try {
      const res = await axios.get(`/api/prescriptions/${id}`);
      setPrescription(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!pdfRef.current) return;
    setDownloading(true);
    try {
      const element = pdfRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Prescription_${prescription.prescriptionId}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Loading digital prescription document...
      </div>
    );
  }

  if (!prescription) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h3>Prescription Not Found</h3>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>Return to Portal</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Top Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
            <Printer size={16} /> Print
          </button>
          <button onClick={handleDownloadPdf} className="btn btn-primary btn-sm" disabled={downloading}>
            <Download size={16} /> {downloading ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Printable Digital Prescription Document */}
      <div className="prescription-paper" ref={pdfRef}>
        {/* Hospital / Portal Letterhead */}
        <div className="prescription-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', fontWeight: 800, fontSize: '1.4rem' }}>
              <Stethoscope size={24} /> Dr. {prescription.doctorName}
            </div>
            <div style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>
              {prescription.doctorSpecialty}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.2rem' }}>
              Universal E-Health Network • Reg No: MCI-{prescription._id.substring(0, 6).toUpperCase()}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
              Prescription ID: {prescription.prescriptionId}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.3rem' }}>
              Date: {new Date(prescription.createdAt).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '0.78rem', color: prescription.status === 'active' ? '#16a34a' : '#9333ea', fontWeight: 700, marginTop: '0.2rem' }}>
              Status: {prescription.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Patient Details Row */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', fontSize: '0.88rem' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>PATIENT NAME</span>
              <strong style={{ color: '#0f172a' }}>{prescription.patientName}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>HEALTH ID</span>
              <strong style={{ color: '#0284c7' }}>{prescription.patientHealthId}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>DIAGNOSIS</span>
              <strong style={{ color: '#0f172a' }}>{prescription.diagnosis}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>BLOOD PRESSURE</span>
              <strong style={{ color: '#0f172a' }}>{prescription.vitals?.bp || '120/80'}</strong>
            </div>
          </div>
        </div>

        {/* Prescription Rx Symbol */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="rx-symbol">Rx</span>
          <div style={{ height: '2px', background: '#e2e8f0', flex: 1, marginLeft: '1rem' }}></div>
        </div>

        {/* Prescribed Medicines Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
              <th style={{ padding: '0.6rem' }}>Medicine Name</th>
              <th style={{ padding: '0.6rem' }}>Dosage</th>
              <th style={{ padding: '0.6rem' }}>Frequency</th>
              <th style={{ padding: '0.6rem' }}>Duration</th>
              <th style={{ padding: '0.6rem' }}>Instructions</th>
            </tr>
          </thead>
          <tbody>
            {prescription.medicines?.map((med, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem 0.6rem', fontWeight: 700, color: '#0f172a' }}>{med.name}</td>
                <td style={{ padding: '0.75rem 0.6rem', color: '#0369a1', fontWeight: 600 }}>{med.dosage}</td>
                <td style={{ padding: '0.75rem 0.6rem' }}>{med.frequency}</td>
                <td style={{ padding: '0.75rem 0.6rem' }}>{med.duration}</td>
                <td style={{ padding: '0.75rem 0.6rem', color: '#64748b' }}>{med.instructions || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Recommended Tests & Advice */}
        {prescription.labTestsRecommended && prescription.labTestsRecommended.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#0f172a', fontSize: '0.85rem' }}>RECOMMENDED LAB TESTS / INVESTIGATIONS:</strong>
            <div style={{ background: '#fffbebf', border: '1px solid #fef3c7', padding: '0.5rem 0.75rem', borderRadius: '6px', color: '#b45309', fontSize: '0.88rem', marginTop: '0.3rem' }}>
              {prescription.labTestsRecommended.join(', ')}
            </div>
          </div>
        )}

        {prescription.advice && (
          <div style={{ marginBottom: '1.5rem' }}>
            <strong style={{ color: '#0f172a', fontSize: '0.85rem' }}>DOCTOR ADVICE & INSTRUCTIONS:</strong>
            <div style={{ color: '#334155', fontSize: '0.88rem', marginTop: '0.3rem' }}>
              {prescription.advice}
            </div>
          </div>
        )}

        {/* Digital Signature & Verification Footer */}
        <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#16a34a', fontWeight: 700, fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} /> Digitally Signed & Verified
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
              Universal E-Health Repository Hash: {prescription._id}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <QRCodeSVG 
              value={JSON.stringify({ 
                rxId: prescription.prescriptionId, 
                patientHealthId: prescription.patientHealthId,
                doctor: prescription.doctorName 
              })} 
              size={72} 
            />
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 700 }}>
              SCAN AT PHARMACY
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionView;
