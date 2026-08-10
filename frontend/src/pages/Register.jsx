import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, Stethoscope, User, Pill, ArrowRight } from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Doctor specific fields
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [hospital, setHospital] = useState('');

  // Patient specific fields
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('');

  // Pharmacist specific fields
  const [pharmacyName, setPharmacyName] = useState('');
  const [pharmacyLicense, setPharmacyLicense] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = {
      name,
      email,
      password,
      role,
      phone,
      doctorInfo: role === 'doctor' ? { licenseNumber, specialty, hospital } : undefined,
      patientInfo: role === 'patient' ? { 
        age: Number(age), 
        gender, 
        bloodGroup, 
        allergies: allergies ? allergies.split(',').map(s => s.trim()) : [] 
      } : undefined,
      pharmacyInfo: role === 'pharmacist' ? { pharmacyName, licenseNo: pharmacyLicense } : undefined
    };

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '580px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700 }}>
            Join Universal Health Platform
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Select your role to set up your online digital health profile
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.5)', padding: '0.35rem', borderRadius: '12px' }}>
          <button 
            type="button"
            className={`btn btn-sm ${role === 'patient' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setRole('patient')}
          >
            <User size={15} /> Patient
          </button>
          <button 
            type="button"
            className={`btn btn-sm ${role === 'doctor' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setRole('doctor')}
          >
            <Stethoscope size={15} /> Doctor
          </button>
          <button 
            type="button"
            className={`btn btn-sm ${role === 'pharmacist' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setRole('pharmacist')}
          >
            <Pill size={15} /> Pharmacy
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" className="input-field" placeholder="e.g. Dr. Rajesh or Amit" value={name} onChange={e=>setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="tel" className="input-field" placeholder="+91 9876543210" value={phone} onChange={e=>setPhone(e.target.value)} required />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" className="input-field" placeholder="user@example.com" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input type="password" className="input-field" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>
          </div>

          {/* Role specific inputs */}
          {role === 'doctor' && (
            <div className="grid-3">
              <div className="form-group">
                <label>Medical License No</label>
                <input type="text" className="input-field" placeholder="MCI-12345" value={licenseNumber} onChange={e=>setLicenseNumber(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Specialty</label>
                <input type="text" className="input-field" placeholder="Cardiology / General" value={specialty} onChange={e=>setSpecialty(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Hospital / Clinic</label>
                <input type="text" className="input-field" placeholder="City Clinic" value={hospital} onChange={e=>setHospital(e.target.value)} />
              </div>
            </div>
          )}

          {role === 'patient' && (
            <>
              <div className="grid-3">
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" className="input-field" placeholder="30" value={age} onChange={e=>setAge(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select value={gender} onChange={e=>setGender(e.target.value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Blood Group</label>
                  <select value={bloodGroup} onChange={e=>setBloodGroup(e.target.value)}>
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
                <label>Known Allergies (comma separated)</label>
                <input type="text" className="input-field" placeholder="Penicillin, Dust, Sulfa" value={allergies} onChange={e=>setAllergies(e.target.value)} />
              </div>
            </>
          )}

          {role === 'pharmacist' && (
            <div className="grid-2">
              <div className="form-group">
                <label>Pharmacy Name *</label>
                <input type="text" className="input-field" placeholder="Apollo Meds" value={pharmacyName} onChange={e=>setPharmacyName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Pharmacy License No *</label>
                <input type="text" className="input-field" placeholder="PH-78901" value={pharmacyLicense} onChange={e=>setPharmacyLicense(e.target.value)} required />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Creating Digital Profile...' : <>Register Account <ArrowRight size={18} /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
