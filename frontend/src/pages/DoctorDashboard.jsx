import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FilePlus, Search, User, FileText, Calendar, CheckCircle2, Stethoscope, ArrowUpRight, Activity, Ticket, Clock, PlayCircle } from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await axios.get(`/api/patients/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)', border: '1px solid rgba(14, 165, 233, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem' }}>
            <Stethoscope size={16} /> Doctor Station
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700 }}>
            Welcome, {user?.name}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
            {user?.doctorInfo?.specialty || 'General Practitioner'} • {user?.doctorInfo?.hospital || 'Universal Health Network'}
          </p>
        </div>
        <Link to="/write-prescription" className="btn btn-primary">
          <FilePlus size={18} /> Write Digital Prescription
        </Link>
      </div>

      {/* Live Order-wise Appointments Token Queue */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Ticket size={22} className="text-primary" /> Live Sequential Token Appointments Queue
          </h3>
          <span className="badge badge-doctor">{appointments.filter(a => a.status !== 'completed').length} Pending Patients</span>
        </div>

        {appointments.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No appointment tokens booked for today yet.</p>
        ) : (
          <div className="grid-3">
            {appointments.map((a) => (
              <div key={a._id} className="glass-card" style={{ padding: '1rem', background: a.status === 'in_consultation' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(15, 23, 42, 0.6)', border: a.status === 'in_consultation' ? '1px solid #38bdf8' : '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', background: 'rgba(14, 165, 233, 0.15)', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                    Token #{a.tokenNumber}
                  </span>
                  <span className={`badge ${a.status === 'in_consultation' ? 'badge-doctor' : a.status === 'completed' ? 'badge-patient' : 'badge-pharmacist'}`}>
                    {a.status.replace('_', ' ')}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{a.patientName}</h4>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Health ID: <strong style={{ color: '#38bdf8' }}>{a.patientHealthId}</strong></div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Reason: {a.reason}</div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border-color)' }}>
                  {a.status === 'pending' && (
                    <button onClick={() => updateApptStatus(a._id, 'in_consultation')} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                      <PlayCircle size={14} /> Start Consultation
                    </button>
                  )}
                  {a.status === 'in_consultation' && (
                    <button onClick={() => updateApptStatus(a._id, 'completed')} className="btn btn-accent btn-sm" style={{ flex: 1 }}>
                      <CheckCircle2 size={14} /> Mark Completed
                    </button>
                  )}
                  <Link to={`/write-prescription?healthId=${a.patientHealthId}&patientName=${encodeURIComponent(a.patientName)}`} className="btn btn-secondary btn-sm">
                    <FilePlus size={14} /> Write RX
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Universal Patient Lookup Section */}
      <div className="glass-card">
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={20} className="text-primary" /> Universal Patient Health Lookup
        </h3>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search by Health ID (HID-2026-...), Name or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={searching}>
            {searching ? 'Searching...' : 'Search Record'}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Search Results ({searchResults.length}):</h4>
            <div className="grid-2">
              {searchResults.map((p) => (
                <div key={p._id} className="glass-card" style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.6)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{p.name}</h4>
                      <span className="badge badge-patient" style={{ marginTop: '0.3rem' }}>
                        ID: {p.patientInfo?.healthId || 'N/A'}
                      </span>
                    </div>
                    <Link to={`/write-prescription?healthId=${p.patientInfo?.healthId}&patientName=${encodeURIComponent(p.name)}`} className="btn btn-accent btn-sm">
                      <FilePlus size={14} /> Write RX
                    </Link>
                  </div>
                  <div style={{ marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border-color)', textAlign: 'right' }}>
                    <Link to={`/patient-record/${p.patientInfo?.healthId}`} style={{ fontSize: '0.82rem', color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      View Complete Universal Health Record <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Prescriptions Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>Recent Issued Prescriptions</h3>
          <Link to="/write-prescription" className="btn btn-secondary btn-sm">+ New Prescribe</Link>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading prescription records...</p>
        ) : prescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <p>No prescriptions written yet. Click 'Write Digital Prescription' to start.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Rx ID</th>
                  <th>Patient Name</th>
                  <th>Health ID</th>
                  <th>Diagnosis</th>
                  <th>Medicines</th>
                  <th>Issued Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((rx) => (
                  <tr key={rx._id}>
                    <td><strong style={{ color: '#38bdf8' }}>{rx.prescriptionId}</strong></td>
                    <td>{rx.patientName}</td>
                    <td><span className="badge badge-patient">{rx.patientHealthId}</span></td>
                    <td>{rx.diagnosis}</td>
                    <td>{rx.medicines?.length || 0} items</td>
                    <td>{new Date(rx.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${rx.status === 'active' ? 'badge-active' : 'badge-dispensed'}`}>
                        {rx.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/prescription/${rx._id}`} className="btn btn-secondary btn-sm">
                        View PDF / QR
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
  );
};

export default DoctorDashboard;
