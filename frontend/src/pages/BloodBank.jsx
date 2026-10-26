import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import BloodDonorSearchDirectory from '../components/BloodDonorSearchDirectory';
import BloodDonorRegisterModal from '../components/BloodDonorRegisterModal';
import BloodDonorProfileCard from '../components/BloodDonorProfileCard';
import BloodRequestModal from '../components/BloodRequestModal';
import { 
  Heart, Droplet, AlertTriangle, ShieldCheck, Clock, CheckCircle2, 
  X, Search, Phone, MessageSquare, MapPin, Hospital, FileText, 
  UserCheck, Plus, RefreshCw, Eye, ThumbsUp, ThumbsDown
} from 'lucide-react';

const BloodBank = () => {
  const { user } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('find_donors'); // 'find_donors' | 'emergency_feed' | 'my_profile' | 'clinical_audit'
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [myDonor, setMyDonor] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [pendingDonors, setPendingDonors] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);

  // Modal triggers
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Document Viewer Lightbox
  const [lightboxDoc, setLightboxDoc] = useState(null); // { title, url, type }

  // Action status notes
  const [auditNotes, setAuditNotes] = useState({});

  const isDoctorOrAdmin = user?.role === 'doctor' || user?.role === 'admin';

  useEffect(() => {
    fetchPublicData();
    if (user) {
      fetchUserData();
    }
    if (isDoctorOrAdmin) {
      fetchPendingAudit();
    }
  }, [user]);

  const fetchPublicData = async () => {
    setLoading(true);
    try {
      const [donorsRes, reqRes] = await Promise.all([
        axios.get('/api/blood-bank/donors'),
        axios.get('/api/blood-bank/requests')
      ]);
      setDonors(donorsRes.data || []);
      setRequests(reqRes.data || []);
    } catch (err) {
      console.error('Error fetching blood bank data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const [donorRes, userReqRes] = await Promise.all([
        axios.get('/api/blood-bank/donors/my'),
        axios.get('/api/blood-bank/requests/my')
      ]);
      setMyDonor(donorRes.data || null);
      setMyRequests(userReqRes.data || []);
    } catch (err) {
      console.error('Error fetching user blood bank data:', err);
    }
  };

  const fetchPendingAudit = async () => {
    setAuditLoading(true);
    try {
      const res = await axios.get('/api/blood-bank/clinical/pending');
      setPendingDonors(res.data.pendingDonors || []);
      setPendingRequests(res.data.pendingRequests || []);
    } catch (err) {
      console.error('Error fetching clinical audit data:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  // Doctor audit actions
  const handleVerifyDonor = async (donorId, status) => {
    const notes = auditNotes[donorId] || (status === 'verified' ? 'Medical fitness approved.' : 'Rejected due to clinical contraindications.');
    try {
      await axios.put(`/api/blood-bank/donors/${donorId}/verify`, { status, notes });
      fetchPendingAudit();
      fetchPublicData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify donor');
    }
  };

  const handleVerifyRequest = async (requestId, status) => {
    const notes = auditNotes[requestId] || (status === 'verified' ? 'Doctor prescription and hospital requisition verified.' : 'Prescription validation failed.');
    try {
      await axios.put(`/api/blood-bank/requests/${requestId}/verify`, { status, notes });
      fetchPendingAudit();
      fetchPublicData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify request');
    }
  };

  const criticalCount = requests.filter(r => r.urgency === 'critical').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        boxShadow: '0 15px 40px rgba(239, 68, 68, 0.15)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', padding: '1.75rem 2rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f87171', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            <Droplet size={18} className="text-danger" /> 100% Doctor-Verified Blood Network
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.85rem', fontWeight: 800, marginTop: '0.3rem', color: '#fff' }}>
            Universal Blood Bank & LifeSaver Ecosystem
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.2rem', maxWidth: '680px' }}>
            Directly connect voluntary blood donors with urgent hospital patients. Every donor certificate and emergency requisition is clinically audited by registered doctors.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowRequestModal(true)}
            className="btn"
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff',
              fontWeight: 700,
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
              border: 'none'
            }}
          >
            <AlertTriangle size={18} /> Request Blood Urgently
          </button>
          
          <button
            onClick={() => setShowRegisterModal(true)}
            className="btn btn-secondary"
            style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}
          >
            <Heart size={18} className="text-danger" /> {myDonor ? 'Update Donor Profile' : 'Become a Blood Donor'}
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid-3" style={{ gap: '1rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.9rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '14px', color: '#10b981' }}>
            <UserCheck size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff' }}>
              {donors.length}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Certified Ready Donors</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.9rem', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '14px', color: '#ef4444' }}>
            <AlertTriangle size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff' }}>
              {requests.length}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Active Hospital Requisitions ({criticalCount} Critical)
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.9rem', background: 'rgba(56, 189, 248, 0.15)', borderRadius: '14px', color: '#38bdf8' }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff' }}>
              100%
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Doctor Verified Documents</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('find_donors')}
          className={`btn btn-sm ${activeTab === 'find_donors' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '20px' }}
        >
          <Search size={14} /> Find Blood Donors ({donors.length})
        </button>

        <button
          onClick={() => setActiveTab('emergency_feed')}
          className={`btn btn-sm ${activeTab === 'emergency_feed' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '20px' }}
        >
          <AlertTriangle size={14} /> Live Emergency Requests ({requests.length})
        </button>

        <button
          onClick={() => setActiveTab('my_profile')}
          className={`btn btn-sm ${activeTab === 'my_profile' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '20px' }}
        >
          <Heart size={14} /> My Donor Status & Requisitions
        </button>

        {isDoctorOrAdmin && (
          <button
            onClick={() => { setActiveTab('clinical_audit'); fetchPendingAudit(); }}
            className={`btn btn-sm ${activeTab === 'clinical_audit' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              borderRadius: '20px',
              background: activeTab === 'clinical_audit' ? 'linear-gradient(135deg, #a855f7, #9333ea)' : 'rgba(168, 85, 247, 0.15)',
              borderColor: '#a855f7',
              color: '#fff'
            }}
          >
            <ShieldCheck size={14} /> Doctor Verification Desk ({pendingDonors.length + pendingRequests.length} Pending)
          </button>
        )}
      </div>

      {/* TAB 1: FIND BLOOD DONORS */}
      {activeTab === 'find_donors' && (
        <BloodDonorSearchDirectory
          donors={donors}
          loading={loading}
          onRequestBloodClick={() => setShowRequestModal(true)}
        />
      )}

      {/* TAB 2: LIVE EMERGENCY REQUESTS FEED */}
      {activeTab === 'emergency_feed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                🚨 Verified Emergency Blood Requisitions
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                Broadcasted only after a certified doctor verifies the hospital prescription receipt.
              </p>
            </div>
            <button onClick={() => setShowRequestModal(true)} className="btn btn-primary btn-sm">
              <Plus size={14} /> Post Emergency Requisition
            </button>
          </div>

          {requests.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={40} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
              <p>No open emergency blood requests at this time.</p>
            </div>
          ) : (
            <div className="grid-2" style={{ gap: '1.25rem' }}>
              {requests.map((req) => (
                <div key={req._id} className="glass-card" style={{
                  padding: '1.5rem',
                  border: req.urgency === 'critical' ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  background: req.urgency === 'critical' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(15, 23, 42, 0.7)',
                  borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          padding: '0.4rem 0.8rem', borderRadius: '10px',
                          background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                          color: '#fff', fontSize: '1.1rem', fontWeight: 800
                        }}>
                          {req.bloodGroup}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                            {req.patientName}
                          </h4>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Health ID: <strong style={{ color: '#38bdf8' }}>{req.patientHealthId}</strong>
                          </span>
                        </div>
                      </div>

                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '16px', fontSize: '0.72rem', fontWeight: 700,
                        background: req.urgency === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: req.urgency === 'critical' ? '#f87171' : '#fbbf24',
                        border: req.urgency === 'critical' ? '1px solid #ef4444' : '1px solid #f59e0b'
                      }}>
                        {req.urgency.toUpperCase()} • {req.unitsNeeded} Units
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                      <Hospital size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: '#38bdf8' }} />
                      <strong>{req.hospitalName}</strong>, {req.hospitalCity}
                      {req.hospitalAddress && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '18px' }}>{req.hospitalAddress}</div>}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Reason: {req.reasonForBlood}
                    </div>

                    {req.doctorNotes && (
                      <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.08)', padding: '0.4rem 0.6rem', borderRadius: '6px' }}>
                        <ShieldCheck size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        Verified: {req.doctorNotes}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                    <a
                      href={`tel:${req.contactPhone}`}
                      className="btn btn-sm"
                      style={{ flex: 1, background: '#10b981', color: '#fff', justifyContent: 'center', fontWeight: 700 }}
                    >
                      <Phone size={13} /> Call {req.contactPhone}
                    </a>
                    
                    {req.doctorPrescriptionUrl && (
                      <button
                        onClick={() => setLightboxDoc({ title: `Prescription Receipt for ${req.patientName}`, url: req.doctorPrescriptionUrl })}
                        className="btn btn-secondary btn-sm"
                        title="View Doctor Prescription"
                      >
                        <Eye size={13} /> View Rx Proof
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY DONOR PROFILE & REQUISITIONS */}
      {activeTab === 'my_profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {myDonor ? (
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Your Registered Blood Donor Card
              </h3>
              <BloodDonorProfileCard
                donor={myDonor}
                onUpdateStatus={(updated) => setMyDonor(updated)}
                onOpenEdit={() => setShowRegisterModal(true)}
              />
            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <Heart size={48} className="text-danger" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>You haven't registered as a blood donor yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '460px', margin: '0.4rem auto 1.25rem' }}>
                Join our certified lifesaver network. Fill in your blood group and medical declaration to help patients in emergency need.
              </p>
              <button onClick={() => setShowRegisterModal(true)} className="btn btn-primary">
                <Heart size={16} /> Register as Voluntary Donor
              </button>
            </div>
          )}

          {/* User's past requests */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#fff' }}>
              My Emergency Blood Requisitions ({myRequests.length})
            </h4>
            {myRequests.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>You have not posted any blood requisitions.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Patient</th>
                      <th>Group</th>
                      <th>Hospital</th>
                      <th>Urgency</th>
                      <th>Doctor Verification</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRequests.map((r) => (
                      <tr key={r._id}>
                        <td><strong style={{ color: '#38bdf8' }}>{r.requestId}</strong></td>
                        <td>{r.patientName}</td>
                        <td><span className="badge badge-patient">{r.bloodGroup}</span></td>
                        <td>{r.hospitalName}</td>
                        <td><span className={`badge ${r.urgency === 'critical' ? 'badge-danger' : 'badge-pharmacist'}`}>{r.urgency}</span></td>
                        <td>
                          <span style={{ color: r.verificationStatus === 'verified' ? '#34d399' : '#fbbf24', fontSize: '0.82rem', fontWeight: 600 }}>
                            {r.verificationStatus.toUpperCase()}
                          </span>
                        </td>
                        <td><span className="badge badge-secondary">{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DOCTOR CLINICAL AUDIT DESK (EXCLUSIVE FOR DOCTORS & ADMINS) */}
      {activeTab === 'clinical_audit' && isDoctorOrAdmin && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Audit Desk Banner */}
          <div className="glass-card" style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid #a855f7', padding: '1.25rem 1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc', fontWeight: 700, fontSize: '0.85rem' }}>
              <ShieldCheck size={18} /> DOCTOR CLINICAL AUDIT & REQUISITION VALIDATION
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>
              Pending Clinical Approvals Queue
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              As an attending doctor, review the applicant's medical declaration, CBC fitness test, or prescription slip before certifying and broadcasting to donors.
            </p>
          </div>

          {/* Section A: Pending Donors */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={18} style={{ color: '#38bdf8' }} /> Pending Blood Donors ({pendingDonors.length})
              </h4>
              <button onClick={fetchPendingAudit} className="btn btn-secondary btn-sm" title="Refresh">
                <RefreshCw size={13} /> Refresh
              </button>
            </div>

            {pendingDonors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                <CheckCircle2 size={32} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
                <p>All blood donors have been clinically certified!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingDonors.map((d) => (
                  <div key={d._id} className="glass-card" style={{
                    padding: '1.25rem', background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '8px', background: '#ef4444', color: '#fff', fontWeight: 800 }}>
                            {d.bloodGroup}
                          </span>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                            {d.donorName}
                          </h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            ({d.gender}, {d.age} yrs) • Health ID: <strong style={{ color: '#38bdf8' }}>{d.patientHealthId}</strong>
                          </span>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                          Contact: <strong>{d.phone}</strong> • City: <strong>{d.city}</strong>
                        </div>

                        {/* Health Screening summary */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                          <span className={`badge ${d.eligibilityQuestions?.weightAbove50Kg ? 'badge-patient' : 'badge-danger'}`}>
                            Weight &gt; 50kg: {d.eligibilityQuestions?.weightAbove50Kg ? 'YES' : 'NO'}
                          </span>
                          <span className={`badge ${d.eligibilityQuestions?.noTattoosPast6Months ? 'badge-patient' : 'badge-danger'}`}>
                            No Recent Tattoos: {d.eligibilityQuestions?.noTattoosPast6Months ? 'YES' : 'NO'}
                          </span>
                          <span className={`badge ${d.eligibilityQuestions?.notOnBloodThinners ? 'badge-patient' : 'badge-danger'}`}>
                            No Blood Thinners: {d.eligibilityQuestions?.notOnBloodThinners ? 'YES' : 'NO'}
                          </span>
                        </div>
                      </div>

                      {/* Document Preview & Action buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '220px' }}>
                        {d.medicalCertificateUrl ? (
                          <button
                            onClick={() => setLightboxDoc({ title: `Medical Fitness Cert: ${d.donorName}`, url: d.medicalCertificateUrl })}
                            className="btn btn-secondary btn-sm"
                            style={{ justifyContent: 'center' }}
                          >
                            <Eye size={14} /> View Fitness Certificate
                          </button>
                        ) : (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                            No certificate attached
                          </div>
                        )}

                        <input
                          type="text"
                          className="input-field"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
                          placeholder="Clinical notes (optional)..."
                          value={auditNotes[d._id] || ''}
                          onChange={(e) => setAuditNotes({ ...auditNotes, [d._id]: e.target.value })}
                        />

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleVerifyDonor(d._id, 'verified')}
                            className="btn btn-sm"
                            style={{ flex: 1, background: '#10b981', color: '#fff', justifyContent: 'center', fontWeight: 700 }}
                          >
                            <ThumbsUp size={13} /> Approve
                          </button>
                          <button
                            onClick={() => handleVerifyDonor(d._id, 'rejected')}
                            className="btn btn-sm btn-secondary"
                            style={{ flex: 1, color: '#f87171', borderColor: '#ef4444', justifyContent: 'center' }}
                          >
                            <ThumbsDown size={13} /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section B: Pending Emergency Blood Requests (Prescription Inspection) */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <AlertTriangle size={18} style={{ color: '#ef4444' }} /> Pending Emergency Requisitions ({pendingRequests.length})
            </h4>

            {pendingRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                <CheckCircle2 size={32} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
                <p>No pending prescription receipts awaiting validation.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingRequests.map((r) => (
                  <div key={r._id} className="glass-card" style={{
                    padding: '1.25rem', background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(239,68,68,0.3)', borderRadius: '14px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '8px', background: '#ef4444', color: '#fff', fontWeight: 800 }}>
                            {r.bloodGroup}
                          </span>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                            Patient: {r.patientName}
                          </h4>
                          <span className={`badge ${r.urgency === 'critical' ? 'badge-danger' : 'badge-pharmacist'}`}>
                            {r.urgency.toUpperCase()} • {r.unitsNeeded} Units
                          </span>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.4rem' }}>
                          Hospital: <strong>{r.hospitalName}</strong> ({r.hospitalCity}) • Attendant Phone: <strong>{r.contactPhone}</strong>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Indication: {r.reasonForBlood}
                        </div>
                      </div>

                      {/* Doctor Prescription Inspection & Approval */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '240px' }}>
                        <button
                          onClick={() => setLightboxDoc({ title: `Prescription Receipt for ${r.patientName}`, url: r.doctorPrescriptionUrl })}
                          className="btn btn-primary btn-sm"
                          style={{ justifyContent: 'center' }}
                        >
                          <Eye size={14} /> Inspect Doctor Rx Proof
                        </button>

                        <input
                          type="text"
                          className="input-field"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
                          placeholder="Audit verification remarks..."
                          value={auditNotes[r._id] || ''}
                          onChange={(e) => setAuditNotes({ ...auditNotes, [r._id]: e.target.value })}
                        />

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleVerifyRequest(r._id, 'verified')}
                            className="btn btn-sm"
                            style={{ flex: 1, background: '#10b981', color: '#fff', justifyContent: 'center', fontWeight: 700 }}
                          >
                            <CheckCircle2 size={13} /> Verify & Broadcast
                          </button>
                          <button
                            onClick={() => handleVerifyRequest(r._id, 'rejected')}
                            className="btn btn-sm btn-secondary"
                            style={{ flex: 1, color: '#f87171', borderColor: '#ef4444', justifyContent: 'center' }}
                          >
                            <X size={13} /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DOCUMENT LIGHTBOX MODAL */}
      {lightboxDoc && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.92)', backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: '1rem'
        }}>
          <div style={{
            width: '100%', maxWidth: '850px', background: '#0f172a',
            border: '1px solid #38bdf8', borderRadius: '16px', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', maxHeight: '90vh'
          }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 700 }}>
                <FileText size={18} /> {lightboxDoc.title}
              </div>
              <button onClick={() => setLightboxDoc(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>
            
            <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#020617' }}>
              <img
                src={lightboxDoc.url}
                alt="Document Verification Preview"
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* REGISTRATION MODAL */}
      <BloodDonorRegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        existingDonor={myDonor}
        onRegistered={(newDonor) => {
          setMyDonor(newDonor);
          fetchPublicData();
          if (isDoctorOrAdmin) fetchPendingAudit();
        }}
      />

      {/* EMERGENCY REQUEST MODAL */}
      <BloodRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onRequestCreated={() => {
          fetchPublicData();
          fetchUserData();
          if (isDoctorOrAdmin) fetchPendingAudit();
        }}
      />
    </div>
  );
};

export default BloodBank;
