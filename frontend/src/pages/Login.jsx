import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Stethoscope, User, Pill, ArrowRight, ShieldCheck, Activity, Shield, UploadCloud } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick seed / demo login helper
  const handleQuickDemo = async (role) => {
    setError('');
    setLoading(true);
    let demoEmail = '';
    let demoPass = 'Password123!';
    let demoData = {};

    if (role === 'admin') {
      demoEmail = 'admin@medilink.com';
      demoData = {
        name: 'Super System Admin',
        email: demoEmail,
        password: demoPass,
        role: 'admin',
        phone: '+91 90000 00000'
      };
    } else if (role === 'doctor') {
      demoEmail = 'dr.smith@medilink.com';
      demoData = {
        name: 'Dr. Rahul Sharma',
        email: demoEmail,
        password: demoPass,
        role: 'doctor',
        phone: '+91 98765 43210',
        doctorInfo: { specialty: 'Cardiologist', hospital: 'City Max Hospital', licenseNumber: 'MCI-884920' }
      };
    } else if (role === 'patient') {
      demoEmail = 'patient.amit@gmail.com';
      demoData = {
        name: 'Amit Kumar',
        email: demoEmail,
        password: demoPass,
        role: 'patient',
        phone: '+91 91234 56789',
        patientInfo: { age: 34, gender: 'Male', bloodGroup: 'O+', allergies: ['Penicillin'] }
      };
    } else if (role === 'pharmacist') {
      demoEmail = 'pharmacy.apollo@medilink.com';
      demoData = {
        name: 'Apollo Pharmacy Staff',
        email: demoEmail,
        password: demoPass,
        role: 'pharmacist',
        phone: '+91 99887 76655',
        pharmacyInfo: { pharmacyName: 'Apollo MedPlus Pharmacy', licenseNo: 'PH-33921' }
      };
    } else if (role === 'diagnostic_center') {
      demoEmail = 'lab.diagnostic@medilink.com';
      demoData = {
        name: 'Central Diagnostic Radiology Staff',
        email: demoEmail,
        password: demoPass,
        role: 'diagnostic_center',
        phone: '+91 99000 11223',
        diagnosticCenterInfo: { labName: 'Central MRI & Pathology Scan Center', licenseNo: 'RAD-88391' }
      };
    }

    try {
      // Try login first
      await login(demoEmail, demoPass);
      navigate('/');
    } catch (err) {
      // If user doesn't exist yet, auto register demo account
      try {
        await register(demoData);
        navigate('/');
      } catch (regErr) {
        setError('Could not complete demo login. ' + (regErr.response?.data?.message || regErr.message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', padding: '0.8rem', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '16px', color: '#0ea5e9', marginBottom: '1rem' }}>
            <Activity size={36} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700 }}>
            Universal Health Portal
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Sign in to access digital prescriptions, reports, & universal records
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="e.g. doctor@medilink.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : <>Sign In <ArrowRight size={18} /></>}
          </button>
        </form>

        <div style={{ margin: '1.75rem 0', borderTop: '1px solid var(--border-color)', position: 'relative', textAlign: 'center' }}>
          <span style={{ position: 'relative', top: '-0.7rem', background: 'var(--bg-surface)', padding: '0 0.75rem', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Or Instant Demo Access
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <button onClick={() => handleQuickDemo('admin')} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
            <Shield size={16} style={{ color: '#a78bfa' }} /> Login as <strong>Super Admin (Control Portal)</strong>
          </button>
          <button onClick={() => handleQuickDemo('doctor')} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
            <Stethoscope size={16} className="text-primary" /> Login as <strong>Doctor (Dr. Rahul)</strong>
          </button>
          <button onClick={() => handleQuickDemo('diagnostic_center')} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', border: '1px solid rgba(14, 165, 233, 0.4)' }}>
            <UploadCloud size={16} style={{ color: '#38bdf8' }} /> Login as <strong>Diagnostic Center (Scans / Lab Staff)</strong>
          </button>
          <button onClick={() => handleQuickDemo('patient')} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
            <User size={16} style={{ color: '#10b981' }} /> Login as <strong>Patient (Amit Kumar)</strong>
          </button>
          <button onClick={() => handleQuickDemo('pharmacist')} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
            <Pill size={16} style={{ color: '#f59e0b' }} /> Login as <strong>Pharmacy Staff</strong>
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Don't have a Universal Health Account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
