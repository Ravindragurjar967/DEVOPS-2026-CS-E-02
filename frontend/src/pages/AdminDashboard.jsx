import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ShieldCheck, Users, Stethoscope, User, Pill, FileText, Activity, 
  Trash2, Edit, CheckCircle, Search, AlertCircle, Eye, Settings, Plus, RefreshCw, CheckCircle2, Lock, Unlock, ArrowUpRight 
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeSection, setActiveSection] = useState('doctors'); // 'doctors' | 'patients' | 'pharmacies' | 'prescriptions' | 'reports'
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // User Edit Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('doctor');
  
  // Doctor metadata edit
  const [editSpecialty, setEditSpecialty] = useState('');
  const [editHospital, setEditHospital] = useState('');
  const [editDoctorLicense, setEditDoctorLicense] = useState('');

  // Patient metadata edit
  const [editHealthId, setEditHealthId] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editGender, setEditGender] = useState('Male');
  const [editBloodGroup, setEditBloodGroup] = useState('O+');
  const [editAllergies, setEditAllergies] = useState('');

  // Pharmacy metadata edit
  const [editPharmacyName, setEditPharmacyName] = useState('');
  const [editPharmacyLicense, setEditPharmacyLicense] = useState('');

  const [savingUser, setSavingUser] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, rxRes, repRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/users'),
        axios.get('/api/admin/prescriptions'),
        axios.get('/api/admin/reports')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPrescriptions(rxRes.data);
      setReports(repRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Modal & Populate Form
  const openEditUser = (user) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
    setEditRole(user.role || 'patient');

    if (user.role === 'doctor') {
      setEditSpecialty(user.doctorInfo?.specialty || '');
      setEditHospital(user.doctorInfo?.hospital || '');
      setEditDoctorLicense(user.doctorInfo?.licenseNumber || '');
    } else if (user.role === 'patient') {
      setEditHealthId(user.patientInfo?.healthId || '');
      setEditAge(user.patientInfo?.age || '');
      setEditGender(user.patientInfo?.gender || 'Male');
      setEditBloodGroup(user.patientInfo?.bloodGroup || 'O+');
      setEditAllergies(user.patientInfo?.allergies ? user.patientInfo.allergies.join(', ') : '');
    } else if (user.role === 'pharmacist') {
      setEditPharmacyName(user.pharmacyInfo?.pharmacyName || '');
      setEditPharmacyLicense(user.pharmacyInfo?.licenseNo || '');
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingUser(true);

    const payload = {
      name: editName,
      email: editEmail,
      role: editRole,
      phone: editPhone,
      doctorInfo: editRole === 'doctor' ? { specialty: editSpecialty, hospital: editHospital, licenseNumber: editDoctorLicense } : undefined,
      patientInfo: editRole === 'patient' ? { 
        healthId: editHealthId, 
        age: Number(editAge), 
        gender: editGender, 
        bloodGroup: editBloodGroup, 
        allergies: editAllergies ? editAllergies.split(',').map(s => s.trim()) : [] 
      } : undefined,
      pharmacyInfo: editRole === 'pharmacist' ? { pharmacyName: editPharmacyName, licenseNo: editPharmacyLicense } : undefined
    };

    try {
      await axios.put(`/api/admin/users/${editingUser._id}`, payload);
      setEditingUser(null);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSavingUser(false);
    }
  };

  // Delete Handlers
  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;
    try {
      await axios.delete(`/api/admin/users/${id}`);
      fetchAdminData();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleDeleteRx = async (id, rxId) => {
    if (!window.confirm(`Are you sure you want to delete Prescription "${rxId}"?`)) return;
    try {
      await axios.delete(`/api/admin/prescriptions/${id}`);
      fetchAdminData();
    } catch (err) {
      alert('Failed to delete prescription');
    }
  };

  const handleDeleteReport = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete Lab Report "${title}"?`)) return;
    try {
      await axios.delete(`/api/admin/reports/${id}`);
      fetchAdminData();
    } catch (err) {
      alert('Failed to delete report');
    }
  };

  // Filter Users by Role & Search
  const doctorsList = users.filter(u => u.role === 'doctor' && (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())));
  const patientsList = users.filter(u => u.role === 'patient' && (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || u.patientInfo?.healthId?.toLowerCase().includes(searchTerm.toLowerCase())));
  const pharmaciesList = users.filter(u => u.role === 'pharmacist' && (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || u.pharmacyInfo?.pharmacyName?.toLowerCase().includes(searchTerm.toLowerCase())));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Super Admin Top Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(14, 165, 233, 0.15) 100%)', border: '1px solid rgba(139, 92, 246, 0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-doctor" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.4)', marginBottom: '0.4rem' }}>
            <ShieldCheck size={14} /> Super System Admin Portal
          </span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700 }}>
            Universal Health Management Console
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Separate Dedicated Management for Doctors, Patients, and Pharmacy Staff.
          </p>
        </div>

        <button onClick={fetchAdminData} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid-4">
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.9rem', background: 'rgba(14, 165, 233, 0.15)', borderRadius: '14px', color: '#0ea5e9' }}>
            <Stethoscope size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              {stats?.doctors || 0}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Registered Doctors</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.9rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '14px', color: '#10b981' }}>
            <User size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              {stats?.patients || 0}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Registered Patients</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.9rem', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '14px', color: '#f59e0b' }}>
            <Pill size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              {stats?.pharmacists || 0}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Pharmacy Outlets</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.9rem', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '14px', color: '#a78bfa' }}>
            <FileText size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              {stats?.totalPrescriptions || 0}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Total Prescriptions</div>
          </div>
        </div>
      </div>

      {/* DISTINCT DEDICATED SECTIONS TABS */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Main Sub-Section Switcher Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(15,23,42,0.6)', padding: '0.35rem', borderRadius: '12px' }}>
            <button 
              onClick={() => setActiveSection('doctors')} 
              className={`btn btn-sm ${activeSection === 'doctors' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Stethoscope size={16} /> 👨‍⚕️ Doctors Section ({doctorsList.length})
            </button>
            <button 
              onClick={() => setActiveSection('patients')} 
              className={`btn btn-sm ${activeSection === 'patients' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <User size={16} /> 🧑‍💼 Patients Section ({patientsList.length})
            </button>
            <button 
              onClick={() => setActiveSection('pharmacies')} 
              className={`btn btn-sm ${activeSection === 'pharmacies' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Pill size={16} /> 💊 Pharmacy Section ({pharmaciesList.length})
            </button>
            <button 
              onClick={() => setActiveSection('prescriptions')} 
              className={`btn btn-sm ${activeSection === 'prescriptions' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <FileText size={16} /> Prescriptions ({prescriptions.length})
            </button>
            <button 
              onClick={() => setActiveSection('reports')} 
              className={`btn btn-sm ${activeSection === 'reports' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Activity size={16} /> Lab Reports ({reports.length})
            </button>
          </div>

          <input 
            type="text" 
            className="input-field" 
            placeholder="Search by name, email, or ID..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '280px', fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
          />
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading Admin Data...</p>
        ) : activeSection === 'doctors' ? (

          /* ── SECTION 1: SEPARATE DEDICATED DOCTORS MANAGEMENT ── */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Stethoscope size={20} /> Registered Doctors Directory & Control
              </h3>
              <span className="badge badge-doctor">{doctorsList.length} Active Doctors</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Doctor Name</th>
                    <th>Specialty</th>
                    <th>Hospital / Clinic</th>
                    <th>Medical License No</th>
                    <th>Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorsList.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No doctors registered in this category.</td></tr>
                  ) : (
                    doctorsList.map((doc) => (
                      <tr key={doc._id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Dr. {doc.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{doc.email}</div>
                        </td>
                        <td><span className="badge badge-doctor">{doc.doctorInfo?.specialty || 'General Practitioner'}</span></td>
                        <td>{doc.doctorInfo?.hospital || 'City Hospital'}</td>
                        <td><strong style={{ color: '#38bdf8' }}>{doc.doctorInfo?.licenseNumber || 'MCI-VERIFIED'}</strong></td>
                        <td>{doc.phone || 'N/A'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => openEditUser(doc)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem' }}>
                              <Edit size={14} /> Edit Doctor
                            </button>
                            <button onClick={() => handleDeleteUser(doc._id, doc.name)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem', color: '#f43f5e' }}>
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        ) : activeSection === 'patients' ? (

          /* ── SECTION 2: SEPARATE DEDICATED PATIENTS MANAGEMENT ── */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={20} /> Universal Patient Records Directory & Control
              </h3>
              <span className="badge badge-patient">{patientsList.length} Active Patients</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Health ID</th>
                    <th>Age / Gender</th>
                    <th>Blood Group</th>
                    <th>Allergies</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patientsList.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No patients registered.</td></tr>
                  ) : (
                    patientsList.map((pat) => (
                      <tr key={pat._id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{pat.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{pat.email}</div>
                        </td>
                        <td><span className="badge badge-patient">{pat.patientInfo?.healthId || 'HID-2026-DEMO'}</span></td>
                        <td>{pat.patientInfo?.age || '30'} yrs / {pat.patientInfo?.gender || 'Male'}</td>
                        <td><strong style={{ color: '#f43f5e' }}>{pat.patientInfo?.bloodGroup || 'O+'}</strong></td>
                        <td>{pat.patientInfo?.allergies?.length > 0 ? pat.patientInfo.allergies.join(', ') : 'None'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Link to={`/patient-record/${pat.patientInfo?.healthId}`} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem' }}>
                              <Eye size={14} /> Full Record
                            </Link>
                            <button onClick={() => openEditUser(pat)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem' }}>
                              <Edit size={14} /> Edit Patient
                            </button>
                            <button onClick={() => handleDeleteUser(pat._id, pat.name)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem', color: '#f43f5e' }}>
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        ) : activeSection === 'pharmacies' ? (

          /* ── SECTION 3: SEPARATE DEDICATED PHARMACY MANAGEMENT ── */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Pill size={20} /> Pharmacy & Medical Store Outlets Directory
              </h3>
              <span className="badge badge-pharmacist">{pharmaciesList.length} Active Pharmacies</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Pharmacy Name & Staff</th>
                    <th>Email</th>
                    <th>Pharmacy License No</th>
                    <th>Contact Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pharmaciesList.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No pharmacy staff registered.</td></tr>
                  ) : (
                    pharmaciesList.map((pharm) => (
                      <tr key={pharm._id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fbbf24' }}>
                            {pharm.pharmacyInfo?.pharmacyName || pharm.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Staff: {pharm.name}</div>
                        </td>
                        <td>{pharm.email}</td>
                        <td><strong style={{ color: '#f59e0b' }}>{pharm.pharmacyInfo?.licenseNo || 'PH-LIC-VERIFIED'}</strong></td>
                        <td>{pharm.phone || 'N/A'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => openEditUser(pharm)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem' }}>
                              <Edit size={14} /> Edit Pharmacy
                            </button>
                            <button onClick={() => handleDeleteUser(pharm._id, pharm.name)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem', color: '#f43f5e' }}>
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        ) : activeSection === 'prescriptions' ? (

          /* PRESCRIPTIONS CONTROL TABLE */
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Rx ID</th>
                  <th>Doctor</th>
                  <th>Patient</th>
                  <th>Diagnosis</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((rx) => (
                  <tr key={rx._id}>
                    <td><strong style={{ color: '#38bdf8' }}>{rx.prescriptionId}</strong></td>
                    <td>Dr. {rx.doctorName}</td>
                    <td>{rx.patientName} ({rx.patientHealthId})</td>
                    <td>{rx.diagnosis}</td>
                    <td>
                      <span className={`badge ${rx.status === 'active' ? 'badge-active' : 'badge-dispensed'}`}>
                        {rx.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/prescription/${rx._id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem' }}>
                          <Eye size={14} /> PDF
                        </Link>
                        <button onClick={() => handleDeleteRx(rx._id, rx.prescriptionId)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem', color: '#f43f5e' }}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        ) : (

          /* LAB REPORTS CONTROL TABLE */
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Report Title</th>
                  <th>Category</th>
                  <th>Health ID</th>
                  <th>Lab Name</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((rep) => (
                  <tr key={rep._id}>
                    <td><strong>{rep.title}</strong></td>
                    <td><span className="badge badge-patient">{rep.category}</span></td>
                    <td><span style={{ color: '#38bdf8' }}>{rep.patientHealthId}</span></td>
                    <td>{rep.labName}</td>
                    <td>{new Date(rep.reportDate).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => handleDeleteReport(rep._id, rep.title)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem', color: '#f43f5e' }}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        )}
      </div>

      {/* DEDICATED USER EDIT MODAL */}
      {editingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '560px', background: 'var(--bg-surface)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Edit size={20} className="text-primary" /> Edit {editingUser.role.toUpperCase()} Details
            </h3>

            <form onSubmit={handleSaveUser}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" className="input-field" value={editName} onChange={e=>setEditName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" className="input-field" value={editEmail} onChange={e=>setEditEmail(e.target.value)} required />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Role</label>
                  <select value={editRole} onChange={e=>setEditRole(e.target.value)}>
                    <option value="doctor">Doctor</option>
                    <option value="patient">Patient</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="admin">Super Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" className="input-field" value={editPhone} onChange={e=>setEditPhone(e.target.value)} />
                </div>
              </div>

              {/* Role specific editing fields */}
              {editRole === 'doctor' && (
                <div className="grid-3">
                  <div className="form-group">
                    <label>Specialty</label>
                    <input type="text" className="input-field" value={editSpecialty} onChange={e=>setEditSpecialty(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Hospital</label>
                    <input type="text" className="input-field" value={editHospital} onChange={e=>setEditHospital(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>License No</label>
                    <input type="text" className="input-field" value={editDoctorLicense} onChange={e=>setEditDoctorLicense(e.target.value)} />
                  </div>
                </div>
              )}

              {editRole === 'patient' && (
                <>
                  <div className="grid-3">
                    <div className="form-group">
                      <label>Health ID</label>
                      <input type="text" className="input-field" value={editHealthId} onChange={e=>setEditHealthId(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Age</label>
                      <input type="number" className="input-field" value={editAge} onChange={e=>setEditAge(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Blood Group</label>
                      <select value={editBloodGroup} onChange={e=>setEditBloodGroup(e.target.value)}>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Known Allergies (Comma separated)</label>
                    <input type="text" className="input-field" value={editAllergies} onChange={e=>setEditAllergies(e.target.value)} />
                  </div>
                </>
              )}

              {editRole === 'pharmacist' && (
                <div className="grid-2">
                  <div className="form-group">
                    <label>Pharmacy Name</label>
                    <input type="text" className="input-field" value={editPharmacyName} onChange={e=>setEditPharmacyName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Pharmacy License No</label>
                    <input type="text" className="input-field" value={editPharmacyLicense} onChange={e=>setEditPharmacyLicense(e.target.value)} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setEditingUser(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={savingUser}>
                  {savingUser ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
