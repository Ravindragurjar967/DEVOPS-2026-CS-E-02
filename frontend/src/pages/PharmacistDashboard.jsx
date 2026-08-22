// import React, { useState } from 'react';
// import axios from 'axios';
// import { Pill, Search, CheckCircle, AlertCircle, QrCode, ShieldCheck, User, Calendar, Stethoscope, FilePlus, Activity } from 'lucide-react';

// const PharmacistDashboard = () => {
//   const [activeTab, setActiveTab] = useState('dispense'); // 'dispense' or 'upload_report'

//   // Verification & Dispense State
//   const [rxId, setRxId] = useState('');
//   const [prescription, setPrescription] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [dispensing, setDispensing] = useState(false);
//   const [error, setError] = useState('');
//   const [successMsg, setSuccessMsg] = useState('');

//   // Upload Lab Report State
//   const [patientHealthId, setPatientHealthId] = useState('');
//   const [reportTitle, setReportTitle] = useState('');
//   const [reportCategory, setReportCategory] = useState('Blood Test');
//   const [labName, setLabName] = useState('Pharmacy Diagnostics');
//   const [summary, setSummary] = useState('');
//   const [testName, setTestName] = useState('');
//   const [resultValue, setResultValue] = useState('');
//   const [normalRange, setNormalRange] = useState('');
//   const [uploading, setUploading] = useState(false);
//   const [uploadSuccess, setUploadSuccess] = useState('');

//   const handleVerify = async (e) => {
//     e.preventDefault();
//     if (!rxId.trim()) return;
//     setError('');
//     setSuccessMsg('');
//     setLoading(true);
//     setPrescription(null);

//     try {
//       let searchId = rxId.trim();
//       if (searchId.startsWith('{')) {
//         try {
//           const parsed = JSON.parse(searchId);
//           searchId = parsed.rxId || searchId;
//         } catch (e) {}
//       }

//       const res = await axios.get(`/api/prescriptions/verify/${encodeURIComponent(searchId)}`);
//       setPrescription(res.data);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Prescription not found or invalid Prescription ID.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDispense = async () => {
//     if (!prescription) return;
//     setDispensing(true);
//     setError('');
//     try {
//       const res = await axios.put(`/api/prescriptions/${prescription._id}/dispense`);
//       setPrescription(res.data.prescription);
//       setSuccessMsg('Prescription marked as DISPENSED successfully!');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to update dispense status.');
//     } finally {
//       setDispensing(false);
//     }
//   };

//   const handleUploadReport = async (e) => {
//     e.preventDefault();
//     setUploadSuccess('');
//     setError('');
//     setUploading(true);

//     try {
//       await axios.post('/api/reports', {
//         patientHealthId,
//         title: reportTitle,
//         category: reportCategory,
//         labName,
//         summary,
//         results: [
//           { testName: testName || reportTitle, resultValue, normalRange }
//         ]
//       });
//       setUploadSuccess(`Lab report "${reportTitle}" uploaded successfully for Patient ${patientHealthId}!`);
//       setReportTitle('');
//       setSummary('');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to upload lab report.');
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
//       {/* Header Banner */}
//       <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(14, 165, 233, 0.1) 100%)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
//         <div>
//           <span className="badge badge-pharmacist" style={{ marginBottom: '0.4rem' }}>
//             <Pill size={14} /> Medical Store & Pharmacy Portal
//           </span>
//           <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700 }}>
//             Pharmacy Counter & Diagnostic Hub
//           </h2>
//         </div>

//         {/* Tab Buttons */}
//         <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(15,23,42,0.6)', padding: '0.35rem', borderRadius: '10px' }}>
//           <button onClick={() => setActiveTab('dispense')} className={`btn btn-sm ${activeTab === 'dispense' ? 'btn-primary' : 'btn-secondary'}`}>
//             <Pill size={14} /> Verify & Dispense RX
//           </button>


//           {/*   ye lab report upload button ha headder ka */}

//           {/* <button onClick={() => setActiveTab('upload_report')} className={`btn btn-sm ${activeTab === 'upload_report' ? 'btn-primary' : 'btn-secondary'}`}>
//             <FilePlus size={14} /> Upload Lab Report
//           </button> */}



//         </div>
        
//       </div>

     

//       {activeTab === 'dispense' ? (
//         <>
//           {/* Lookup Bar */}
//           <div className="glass-card">
//             <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//               <QrCode size={20} className="text-primary" /> Scan QR / Enter Prescription ID
//             </h3>

//             <form onSubmit={handleVerify} style={{ display: 'flex', gap: '0.75rem' }}>
//               <input 
//                 type="text" 
//                 className="input-field" 
//                 placeholder="Enter Prescription ID (e.g. RX-2026-8839) or paste QR payload..." 
//                 value={rxId}
//                 onChange={(e) => setRxId(e.target.value)}
//                 required
//               />
//               <button type="submit" className="btn btn-primary" disabled={loading}>
//                 {loading ? 'Verifying...' : <><Search size={18} /> Verify Digital RX</>}
//               </button>
//             </form>
//           </div>

//           {error && (
//             <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
//               <AlertCircle size={20} />
//               <div>{error}</div>
//             </div>
//           )}

//           {successMsg && (
//             <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
//               <CheckCircle size={20} />
//               <div>{successMsg}</div>
//             </div>
//           )}  

//           {/* Verified Prescription Detail Card */}
//           {prescription && (
//             <div className="glass-card" style={{ border: prescription.status === 'dispensed' ? '2px solid rgba(139, 92, 246, 0.5)' : '2px solid rgba(16, 185, 129, 0.5)' }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
//                 <div>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                     <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8' }}>
//                       {prescription.prescriptionId}
//                     </span>
//                     <span className={`badge ${prescription.status === 'active' ? 'badge-active' : 'badge-dispensed'}`}>
//                       {prescription.status.toUpperCase()}
//                     </span>
//                   </div>
//                   <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
//                     Issued on {new Date(prescription.createdAt).toLocaleString()}
//                   </div>
//                 </div>

//                 <div style={{ textAlign: 'right' }}>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.88rem', fontWeight: 600 }}>
//                     <ShieldCheck size={18} /> Verified Authenticity
//                   </div>
//                 </div>
//               </div>

//               <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
//                 <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
//                   <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
//                     <Stethoscope size={14} /> Prescribing Doctor
//                   </h4>
//                   <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>Dr. {prescription.doctorName}</div>
//                   <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{prescription.doctorSpecialty}</div>
//                 </div>

//                 <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
//                   <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
//                     <User size={14} /> Patient Information
//                   </h4>
//                   <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{prescription.patientName}</div>
//                   <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
//                     Health ID: <strong style={{ color: '#38bdf8' }}>{prescription.patientHealthId}</strong>
//                   </div>
//                 </div>
//               </div>

//               <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.8rem', color: '#f59e0b' }}>
//                 💊 Prescribed Medicines:
//               </h4>
//               <table className="custom-table" style={{ marginBottom: '1.5rem' }}>
//                 <thead>
//                   <tr>
//                     <th>#</th>
//                     <th>Medicine Name</th>
//                     <th>Dosage</th>
//                     <th>Frequency</th>
//                     <th>Duration</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {prescription.medicines.map((med, i) => (
//                     <tr key={i}>
//                       <td>{i + 1}</td>
//                       <td><strong style={{ color: '#ffffff' }}>{med.name}</strong></td>
//                       <td><span className="badge badge-doctor">{med.dosage}</span></td>
//                       <td>{med.frequency}</td>
//                       <td>{med.duration}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>

//               {prescription.status === 'active' ? (
//                 <button onClick={handleDispense} className="btn btn-accent btn-lg" style={{ width: '100%' }} disabled={dispensing}>
//                   {dispensing ? 'Updating Status...' : <><CheckCircle size={20} /> Mark Prescription as DISPENSED</>}
//                 </button>
//               ) : (
//                 <div style={{ textAlign: 'center', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', padding: '1rem', borderRadius: '12px', fontWeight: 600 }}>
//                   ✓ Already Dispensed
//                 </div>
//               )}
//             </div>
//           )}
//         </>
//       ) : (
//         /* Upload Lab Report Tab */
//         <div className="glass-card">
//           <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8' }}>
//             <FilePlus size={22} /> Upload Diagnostic Lab Report for Patient
//           </h3>

//           {uploadSuccess && (
//             <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
//               {uploadSuccess}
//             </div>
//           )}

//           <form onSubmit={handleUploadReport}>
//             <div className="grid-2">
//               <div className="form-group">
//                 <label>Patient Universal Health ID *</label>
//                 <input 
//                   type="text" 
//                   className="input-field" 
//                   placeholder="e.g. HID-2026-8834"
//                   value={patientHealthId}
//                   onChange={(e) => setPatientHealthId(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Report Title *</label>
//                 <input 
//                   type="text" 
//                   className="input-field" 
//                   placeholder="e.g. Complete Blood Count (CBC) or Lipid Profile"
//                   value={reportTitle}
//                   onChange={(e) => setReportTitle(e.target.value)}
//                   required
//                 />
//               </div>
//             </div>

//             <div className="grid-2">
//               <div className="form-group">
//                 <label>Report Category</label>
//                 <select value={reportCategory} onChange={(e) => setReportCategory(e.target.value)}>
//                   <option value="Blood Test">Blood Test</option>
//                   <option value="X-Ray">X-Ray / Imaging</option>
//                   <option value="MRI/CT">MRI / CT Scan</option>
//                   <option value="ECG">ECG / Cardiac</option>
//                   <option value="Pathology">Pathology</option>
//                   <option value="General">General Diagnostics</option>
//                 </select>
//               </div>
//               <div className="form-group">
//                 <label>Pharmacy / Lab Name</label>
//                 <input 
//                   type="text" 
//                   className="input-field" 
//                   value={labName}
//                   onChange={(e) => setLabName(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="grid-2">
//               <div className="form-group">
//                 <label>Test Parameter & Result</label>
//                 <input 
//                   type="text" 
//                   className="input-field" 
//                   placeholder="e.g. Hemoglobin 14.5 g/dL"
//                   value={resultValue}
//                   onChange={(e) => setResultValue(e.target.value)}
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Normal Reference Range</label>
//                 <input 
//                   type="text" 
//                   className="input-field" 
//                   placeholder="e.g. 12.0 - 16.0"
//                   value={normalRange}
//                   onChange={(e) => setNormalRange(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="form-group">
//               <label>Lab Summary / Diagnostic Remarks</label>
//               <textarea 
//                 rows="2" 
//                 className="input-field" 
//                 placeholder="e.g. All parameters within normal reference range."
//                 value={summary}
//                 onChange={(e) => setSummary(e.target.value)}
//               />
//             </div>

//             <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={uploading}>
//               {uploading ? 'Uploading Digital Lab Report...' : 'Upload & Save to Patient Health Record'}
//             </button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PharmacistDashboard;





import React, { useState } from 'react';
import axios from 'axios';
import { Pill, Search, CheckCircle, AlertCircle, QrCode, ShieldCheck, User, Calendar, Stethoscope, Activity } from 'lucide-react';

const PharmacistDashboard = () => {
  // Verification & Dispense State
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
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(14, 165, 233, 0.1) 100%)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-pharmacist" style={{ marginBottom: '0.4rem' }}>
            <Pill size={14} /> Medical Store & Pharmacy Portal
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700 }}>
            Pharmacy Counter & Diagnostic Hub
          </h2>
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
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Stethoscope size={14} /> Prescribing Doctor
              </h4>
              <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>Dr. {prescription.doctorName}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{prescription.doctorSpecialty}</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={14} /> Patient Information
              </h4>
              <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{prescription.patientName}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Health ID: <strong style={{ color: '#38bdf8' }}>{prescription.patientHealthId}</strong>
              </div>
            </div>
          </div>

          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.8rem', color: '#f59e0b' }}>
            💊 Prescribed Medicines:
          </h4>
          <table className="custom-table" style={{ marginBottom: '1.5rem' }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine Name</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
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
                </tr>
              ))}
            </tbody>
          </table>

          {prescription.status === 'active' ? (
            <button onClick={handleDispense} className="btn btn-accent btn-lg" style={{ width: '100%' }} disabled={dispensing}>
              {dispensing ? 'Updating Status...' : <><CheckCircle size={20} /> Mark Prescription as DISPENSED</>}
            </button>
          ) : (
            <div style={{ textAlign: 'center', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', padding: '1rem', borderRadius: '12px', fontWeight: 600 }}>
              ✓ Already Dispensed
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PharmacistDashboard;



