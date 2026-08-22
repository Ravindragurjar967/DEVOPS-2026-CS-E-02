import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Activity, UploadCloud, FileText, Image, Eye, Download, Search, 
  Filter, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, X, Plus, Calendar, Building, File
} from 'lucide-react';

const DiagnosisCenter = () => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload Form State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [patientHealthId, setPatientHealthId] = useState(user?.patientInfo?.healthId || '');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('X-Ray');
  const [labName, setLabName] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState('');
  const [isAbnormal, setIsAbnormal] = useState(false);

  // File State
  const [fileDataUrl, setFileDataUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Lightbox Modal State
  const [selectedReportModal, setSelectedReportModal] = useState(null);

  useEffect(() => {
    fetchDiagnosisReports();
  }, []);

  const fetchDiagnosisReports = async () => {
    setLoading(true);
    try {
      let res;
      if (user?.role === 'patient' && user?.patientInfo?.healthId) {
        res = await axios.get(`/api/diagnosis/patient/${encodeURIComponent(user.patientInfo.healthId)}`);
      } else {
        res = await axios.get('/api/diagnosis/all');
      }
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching diagnosis reports:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle File Selection (Images, PDFs, Medical Scans)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setFileType(file.type);
    setFileSize(file.size);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileDataUrl(reader.result);
      if (file.type.startsWith('image/')) {
        setFilePreview(reader.result);
      } else {
        setFilePreview(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Diagnostic Report Upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!patientHealthId || !title) {
      alert('Please fill in Patient Health ID and Report Title.');
      return;
    }

    setUploading(true);
    try {
      const payload = {
        patientHealthId,
        title,
        category,
        labName: labName || 'Universal Imaging & Diagnostic Center',
        reportDate,
        summary,
        fileUrl: fileDataUrl,
        fileName,
        fileType,
        fileSize,
        isAbnormal
      };

      await axios.post('/api/diagnosis/upload', payload);
      alert('Diagnostic Report uploaded successfully to Patient Universal Health Record!');
      setShowUploadModal(false);
      
      // Reset form
      setTitle('');
      setSummary('');
      setFileDataUrl('');
      setFileName('');
      setFilePreview(null);
      
      fetchDiagnosisReports();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload report.');
    } finally {
      setUploading(false);
    }
  };

  // Filter Reports by Category Tab & Search Query
  const filteredReports = reports.filter((r) => {
    const matchesCategory = activeCategory === 'ALL' || r.category === activeCategory;
    const matchesSearch = 
      r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.patientHealthId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.labName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner Header */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)', border: '1px solid rgba(14, 165, 233, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-doctor" style={{ marginBottom: '0.4rem' }}>
            <Activity size={14} /> Universal Imaging & Diagnosis Vault
          </span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700 }}>
            Diagnosis & Medical Scans Center
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Multi-format healthcare vault for X-Rays, CT Scans, MRI Scans, CBC Blood Tests, Ultrasound & Pathology Reports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setShowUploadModal(true)} className="btn btn-accent">
            <UploadCloud size={18} /> + Upload Diagnostic Report
          </button>
          <button onClick={fetchDiagnosisReports} className="btn btn-secondary">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Category Filter Tabs & Search Bar */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          {/* Modality Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', background: 'rgba(15,23,42,0.6)', padding: '0.35rem', borderRadius: '12px' }}>
            {['ALL', 'X-Ray', 'CT Scan', 'MRI', 'Blood Test (CBC)', 'Ultrasound', 'ECG'].map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              >
                {cat === 'ALL' ? 'All Scans' : cat === 'X-Ray' ? '📸 X-Rays' : cat === 'CT Scan' ? '🧠 CT Scans' : cat === 'MRI' ? '🧠 MRI Scans' : cat === 'Blood Test (CBC)' ? '🩸 CBC Tests' : cat === 'Ultrasound' ? '📊 Ultrasound' : '📈 ECG'}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input-field"
              placeholder="Search Health ID, X-Ray, MRI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ maxWidth: '260px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Diagnostic Reports Gallery Grid */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Activity size={36} className="text-primary" style={{ marginBottom: '0.5rem' }} />
            <p>Loading multi-format diagnostic reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ opacity: 0.3, marginBottom: '0.6rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff' }}>No Reports Found</h3>
            <p style={{ fontSize: '0.88rem', marginTop: '0.3rem' }}>
              No diagnostic reports found for the selected category. Click "+ Upload Diagnostic Report" to add X-Rays, CT Scans, MRIs, or CBC reports.
            </p>
          </div>
        ) : (
          <div className="grid-3">
            {filteredReports.map((rep) => (
              <div 
                key={rep._id} 
                className="glass-card" 
                style={{ 
                  padding: '1.1rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justify: 'space-between',
                  border: rep.isAbnormal ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--border-color)',
                  background: rep.isAbnormal ? 'rgba(244, 63, 94, 0.05)' : 'rgba(15, 23, 42, 0.6)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <span className="badge badge-patient" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
                      {rep.category}
                    </span>
                    {rep.isAbnormal && (
                      <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.4)' }}>
                        <AlertTriangle size={12} /> Clinical Attention
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.3rem' }}>
                    {rep.title}
                  </h3>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.8rem' }}>
                    <span>Health ID: <strong style={{ color: '#38bdf8' }}>{rep.patientHealthId}</strong></span>
                    <span>Diagnostic Center: {rep.labName}</span>
                    <span>Date: {new Date(rep.reportDate).toLocaleDateString()}</span>
                  </div>

                  {/* Thumbnail / Image Preview */}
                  {rep.fileUrl && rep.fileUrl.startsWith('data:image') ? (
                    <div 
                      onClick={() => setSelectedReportModal(rep)}
                      style={{ 
                        width: '100%', 
                        height: '140px', 
                        borderRadius: '10px', 
                        overflow: 'hidden', 
                        marginBottom: '0.8rem',
                        cursor: 'pointer',
                        border: '1px solid var(--border-color)',
                        background: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'center'
                      }}
                    >
                      <img src={rep.fileUrl} alt={rep.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                  ) : (
                    <div 
                      onClick={() => setSelectedReportModal(rep)}
                      style={{ 
                        width: '100%', 
                        height: '100px', 
                        borderRadius: '10px', 
                        marginBottom: '0.8rem',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px dashed var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justify: 'center',
                        cursor: 'pointer',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <FileText size={28} style={{ color: '#38bdf8', marginBottom: '0.3rem' }} />
                      <span style={{ fontSize: '0.78rem' }}>{rep.fileName || 'View Diagnostic PDF Document'}</span>
                    </div>
                  )}

                  {rep.summary && (
                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '8px', marginBottom: '0.8rem' }}>
                      <strong>Clinical Impression:</strong> {rep.summary}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border-color)' }}>
                  <button onClick={() => setSelectedReportModal(rep)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                    <Eye size={14} /> Full View Lightbox
                  </button>
                  {rep.fileUrl && (
                    <a href={rep.fileUrl} download={rep.fileName || 'diagnostic_report'} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.6rem' }} title="Download Report">
                      <Download size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* UPLOAD DIAGNOSTIC REPORT MODAL */}
      {showUploadModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', background: 'var(--bg-surface)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UploadCloud size={20} className="text-primary" /> Upload Diagnostic Imaging & Lab Report
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Patient Health ID *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. HID-2026-8834"
                    value={patientHealthId}
                    onChange={(e) => setPatientHealthId(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category (Modality) *</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="X-Ray">📸 X-Ray Scan</option>
                    <option value="CT Scan">🧠 CT Scan</option>
                    <option value="MRI">🧠 MRI Scan</option>
                    <option value="Blood Test (CBC)">🩸 Blood Test (CBC / Pathology)</option>
                    <option value="Ultrasound">📊 Ultrasound</option>
                    <option value="ECG">📈 ECG Graph</option>
                    <option value="Pathology">🔬 Pathology Report</option>
                    <option value="Other">🏥 Other Diagnostic Scan</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Report Title *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Chest X-Ray PA View / Brain MRI Scan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Lab / Scan Center Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. City Diagnostic Center"
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Scan Date</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Clinical Impression / Summary</label>
                <textarea 
                  className="input-field" 
                  rows="3"
                  placeholder="Enter radiologist impressions, key findings, or diagnosis notes..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </div>

              {/* Drag & Drop File Upload Area */}
              <div className="form-group">
                <label>Attach Scan Image / PDF File (X-Ray, CT, MRI, CBC PDF)</label>
                <div style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)' }}>
                  <input 
                    type="file" 
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    id="diag-file-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="diag-file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <UploadCloud size={32} className="text-primary" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Click to browse X-Ray Image or PDF Report</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Supports JPG, PNG, WEBP, and PDF files</span>
                  </label>
                </div>

                {fileName && (
                  <div style={{ marginTop: '0.6rem', fontSize: '0.85rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={16} /> Attached File: <strong>{fileName}</strong> ({(fileSize/1024).toFixed(1)} KB)
                  </div>
                )}

                {filePreview && (
                  <div style={{ marginTop: '0.8rem', textAlign: 'center' }}>
                    <img src={filePreview} alt="Preview" style={{ maxHeight: '160px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={uploading}>
                  {uploading ? 'Uploading to Vault...' : 'Upload Diagnostic Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL-SCREEN HD LIGHTBOX & DOCUMENT VIEWER MODAL */}
      {selectedReportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', zIndex: 1100, padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
            <div>
              <span className="badge badge-patient">{selectedReportModal.category}</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '0.2rem', color: '#fff' }}>
                {selectedReportModal.title}
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Patient ID: <strong style={{ color: '#38bdf8' }}>{selectedReportModal.patientHealthId}</strong> • {selectedReportModal.labName}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {selectedReportModal.fileUrl && (
                <a href={selectedReportModal.fileUrl} download={selectedReportModal.fileName || 'scan_report'} className="btn btn-accent btn-sm">
                  <Download size={16} /> Download File
                </a>
              )}
              <button onClick={() => setSelectedReportModal(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem' }}>
                <X size={20} /> Close
              </button>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
            {selectedReportModal.fileUrl && selectedReportModal.fileUrl.startsWith('data:image') ? (
              <img 
                src={selectedReportModal.fileUrl} 
                alt={selectedReportModal.title} 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }} 
              />
            ) : selectedReportModal.fileUrl && selectedReportModal.fileUrl.startsWith('data:application/pdf') ? (
              <iframe 
                src={selectedReportModal.fileUrl} 
                title={selectedReportModal.title} 
                style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }} 
              />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <FileText size={64} style={{ marginBottom: '1rem', color: '#38bdf8' }} />
                <h3>Diagnostic Summary Document</h3>
                <p style={{ marginTop: '0.4rem', maxWidth: '500px' }}>{selectedReportModal.summary || 'No digital file attachment included with this report.'}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosisCenter;
