import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Activity, Plus, FileText, CheckCircle2, Upload, Calendar, Building2 } from 'lucide-react';

const MyReports = () => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form for uploading new report
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Blood Test');
  const [labName, setLabName] = useState('');
  const [summary, setSummary] = useState('');
  const [testName, setTestName] = useState('');
  const [resultValue, setResultValue] = useState('');
  const [normalRange, setNormalRange] = useState('');
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get('/api/reports/my');
      setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/reports', {
        patientHealthId: user.healthId || 'HID-2026-DEMO',
        title,
        category,
        labName: labName || 'Central Pathlabs',
        summary,
        results: [
          { testName: testName || title, resultValue, normalRange, isAbnormal }
        ]
      });
      setShowModal(false);
      setTitle('');
      setSummary('');
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-patient" style={{ marginBottom: '0.4rem' }}>
            <Activity size={14} /> Diagnostic Health Vault
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700 }}>
            Online Medical & Lab Reports
          </h2>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
          <Plus size={16} /> Add Digital Lab Report
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading medical reports...</p>
      ) : reports.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
          <Activity size={48} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
          <h3>No Lab Reports Saved Yet</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Click 'Add Digital Lab Report' to store your blood tests, X-Rays, or diagnostic findings online.
          </p>
        </div>
      ) : (
        <div className="grid-2">
          {reports.map((rep) => (
            <div key={rep._id} className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <span className="badge badge-patient" style={{ marginBottom: '0.3rem' }}>{rep.category}</span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{rep.title}</h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <Building2 size={14} /> {rep.labName} • {new Date(rep.reportDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {rep.summary && (
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.8rem', fontSize: '0.88rem' }}>
                  <strong>Summary:</strong> {rep.summary}
                </div>
              )}

              {rep.results && rep.results.length > 0 && (
                <div style={{ fontSize: '0.85rem' }}>
                  <strong style={{ color: 'var(--text-muted)' }}>Test Results:</strong>
                  {rep.results.map((res, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span>{res.testName}</span>
                      <strong style={{ color: res.isAbnormal ? '#f43f5e' : '#10b981' }}>
                        {res.resultValue} {res.normalRange && `(${res.normalRange})`}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '520px', background: 'var(--bg-surface)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '1.25rem' }}>
              Add Digital Diagnostic Report
            </h3>

            <form onSubmit={handleCreateReport}>
              <div className="form-group">
                <label>Report Title *</label>
                <input type="text" className="input-field" placeholder="e.g. Complete Blood Count (CBC)" value={title} onChange={e=>setTitle(e.target.value)} required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Category</label>
                  <select value={category} onChange={e=>setCategory(e.target.value)}>
                    <option value="Blood Test">Blood Test</option>
                    <option value="X-Ray">X-Ray</option>
                    <option value="MRI/CT">MRI / CT Scan</option>
                    <option value="ECG">ECG</option>
                    <option value="Pathology">Pathology</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Lab / Hospital Name</label>
                  <input type="text" className="input-field" placeholder="e.g. Apollo Diagnostics" value={labName} onChange={e=>setLabName(e.target.value)} />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Test Result Value</label>
                  <input type="text" className="input-field" placeholder="e.g. 14.5 g/dL" value={resultValue} onChange={e=>setResultValue(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Normal Reference Range</label>
                  <input type="text" className="input-field" placeholder="e.g. 12.0 - 16.0" value={normalRange} onChange={e=>setNormalRange(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label>Clinical Notes / Summary</label>
                <textarea rows="2" className="input-field" placeholder="e.g. All parameters within normal limits." value={summary} onChange={e=>setSummary(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReports;
