// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { Calendar, Stethoscope, Clock, CheckCircle2, Ticket, ArrowLeft, ShieldCheck } from 'lucide-react';

// const BookAppointment = () => {
//   const navigate = useNavigate();
//   const [doctors, setDoctors] = useState([]);
//   const [selectedDoctor, setSelectedDoctor] = useState('');
//   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
//   const [timeSlot, setTimeSlot] = useState('10:00 AM');
//   const [reason, setReason] = useState('General Consultation');
//   const [bookedAppointment, setBookedAppointment] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     fetchDoctors();
//   }, []);

//   const fetchDoctors = async () => {
//     try {
//       const res = await axios.get('/api/appointments/doctors');
//       setDoctors(res.data);
//       if (res.data.length > 0) {
//         setSelectedDoctor(res.data[0]._id);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleBook = async (e) => {
//     e.preventDefault();
//     setError('');
//     if (!selectedDoctor) {
//       setError('Please select a doctor');
//       return;
//     }
//     setLoading(true);

//     try {
//       const res = await axios.post('/api/appointments/book', {
//         doctorId: selectedDoctor,
//         date,
//         timeSlot,
//         reason
//       });
//       setBookedAppointment(res.data);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to book appointment');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ maxWidth: '800px', margin: '0 auto' }}>
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
//         <button onClick={() => navigate('/')} className="btn btn-secondary btn-sm">
//           <ArrowLeft size={16} /> Back to Portal
//         </button>
//         <span className="badge badge-patient"><Ticket size={14} /> Sequential Token Booking</span>
//       </div>

//       <div className="glass-card">
//         <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//           <Calendar className="text-primary" /> Book Sequential Doctor Appointment
//         </h2>
//         <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
//           Appointments are allocated order-wise with a live Token Number (e.g. Token #1, #2, #3...).
//         </p>

//         {error && (
//           <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
//             {error}
//           </div>
//         )}

//         {bookedAppointment ? (
//           <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2rem', borderRadius: '16px', textAlign: 'center' }}>
//             <CheckCircle2 size={48} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
//             <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981' }}>Appointment Confirmed!</h3>
            
//             <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', color: '#ffffff', padding: '0.75rem 1.75rem', borderRadius: '30px', fontSize: '1.4rem', fontWeight: 800, margin: '1.25rem 0' }}>
//               Your Token Number: #{bookedAppointment.tokenNumber}
//             </div>

//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem', textAlign: 'left', fontSize: '0.9rem' }}>
//               <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
//                 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DOCTOR</span>
//                 <div style={{ fontWeight: 600 }}>{bookedAppointment.doctorName}</div>
//               </div>
//               <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
//                 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DATE & SLOT</span>
//                 <div style={{ fontWeight: 600 }}>{bookedAppointment.date} ({bookedAppointment.timeSlot})</div>
//               </div>
//               <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
//                 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>APPOINTMENT ID</span>
//                 <div style={{ fontWeight: 600, color: '#38bdf8' }}>{bookedAppointment.appointmentId}</div>
//               </div>
//             </div>

//             <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
//               Return to Dashboard
//             </button>
//           </div>
//         ) : (
//           <form onSubmit={handleBook}>
//             <div className="form-group">
//               <label>Select Specialist Doctor *</label>
//               <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} required>
//                 {doctors.length === 0 ? (
//                   <option value="">No doctors registered yet (Login as Doctor to create doctor profile)</option>
//                 ) : (
//                   doctors.map((doc) => (
//                     <option key={doc._id} value={doc._id}>
//                       {doc.name} — {doc.doctorInfo?.specialty || 'General Practitioner'} ({doc.doctorInfo?.hospital || 'City Hospital'})
//                     </option>
//                   ))
//                 )}
//               </select>
//             </div>

//             <div className="grid-2">
//               <div className="form-group">
//                 <label>Appointment Date *</label>
//                 <input 
//                   type="date" 
//                   className="input-field" 
//                   value={date} 
//                   min={new Date().toISOString().split('T')[0]}
//                   onChange={(e) => setDate(e.target.value)}
//                   required 
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Preferred Time Slot</label>
//                 <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
//                   <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
//                   <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
//                   <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
//                   <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
//                   <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
//                 </select>
//               </div>
//             </div>

//             <div className="form-group">
//               <label>Reason for Visit / Health Symptoms</label>
//               <textarea 
//                 rows="2" 
//                 className="input-field" 
//                 placeholder="e.g. Chest tightness, Fever & body pain since yesterday"
//                 value={reason} 
//                 onChange={(e) => setReason(e.target.value)}
//               />
//             </div>

//             <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
//               {loading ? 'Allocating Sequential Order Token...' : <>Confirm & Get Token Number</>}
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BookAppointment;



















//  new code for booking appointment page



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar, Stethoscope, Clock, CheckCircle2, Ticket, ArrowLeft, 
  MapPin, Building2, Briefcase, ShieldCheck, User 
} from 'lucide-react';

// ─── Mock Data (Replace with API calls when backend ready) ───
const STATE_DISTRICT_DATA = {
  "Rajasthan":["Jaipur", "Jodhpur", "Udaipur", "Bikaner", "Kota"],
  "Chhattisgarh": ["Raipur", "Bilaspur", "Durg", "Korba"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi"],
};

const HOSPITAL_DATA = {
  "Jaipur": [
    { id: "h1", name: "SMS Hospital", departments: ["Cardiology", "Orthopedics", "General Medicine", "Pediatrics"] },
    { id: "h2", name: "Fortis Escorts", departments: ["Cardiology", "Neurology", "Oncology"] },
    { id: "h3", name: "Mahatma Gandhi Hospital", departments: ["General Medicine", "Gynecology", "Dermatology"] },
  ],
  "Raipur": [
    { id: "h4", name: "AIIMS Raipur", departments: ["Cardiology", "Orthopedics", "General Medicine", "Neurosurgery"] },
    { id: "h5", name: "Dr. B.R. Ambedkar Hospital", departments: ["General Medicine", "Pediatrics", "ENT"] },
  ],
  "Bhopal": [
    { id: "h6", name: "Hamidia Hospital", departments: ["General Medicine", "Orthopedics", "Radiology"] },
    { id: "h7", name: "Bansal Hospital", departments: ["Cardiology", "Neurology", "Gastroenterology"] },
  ],
  // Default fallback for other districts
  "default": [
    { id: "hd1", name: "District Government Hospital", departments: ["General Medicine", "Pediatrics", "Gynecology"] },
    { id: "hd2", name: "City Care Hospital", departments: ["Cardiology", "Orthopedics", "ENT"] },
  ]
};

const SCHEMES = [
  { id: "RGHS", name: "RGHS (Rajasthan Government Health Scheme)", color: "#0ea5e9" },
  { id: "CGHS", name: "CGHS (Central Government Health Scheme)", color: "#10b981" },
  { id: "PAID", name: "Paid Appointment (Self Pay)", color: "#f59e0b" },
];

const TIME_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "02:00 PM - 03:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
];

// ─── Component ───
const BookAppointment = () => {
  const navigate = useNavigate();

  // ── Cascading Selection States ──
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedScheme, setSelectedScheme] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');

  // ── Other States ──
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[1]);
  const [reason, setReason] = useState('');
  
  const [doctors, setDoctors] = useState([]);
  const [bookedAppointment, setBookedAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Derived Data ──
  const states = Object.keys(STATE_DISTRICT_DATA);
  const districts = selectedState ? STATE_DISTRICT_DATA[selectedState] || [] : [];
  const hospitals = selectedDistrict ? (HOSPITAL_DATA[selectedDistrict] || HOSPITAL_DATA["default"]) : [];
  const selectedHospitalObj = hospitals.find(h => h.id === selectedHospital);
  const departments = selectedHospitalObj ? selectedHospitalObj.departments : [];

  // ── Fetch Doctors when Department + Hospital selected ──
  useEffect(() => {
    if (selectedDepartment && selectedHospital) {
      fetchDoctors();
    } else {
      setDoctors([]);
      setSelectedDoctor('');
    }
  }, [selectedDepartment, selectedHospital]);

  const fetchDoctors = async () => {
    try {
      // API call: backend se hospital & department ke hisaab se doctors lao
      const res = await axios.get('/api/appointments/doctors', {
        params: { 
          hospitalId: selectedHospital, 
          department: selectedDepartment 
        }
      });
      setDoctors(res.data);
      if (res.data.length > 0) setSelectedDoctor(res.data[0]._id);
    } catch (err) {
      // Fallback mock doctors agar API fail ho
      setDoctors([
        { _id: "d1", name: "Dr. Rajesh Sharma", doctorInfo: { specialty: selectedDepartment, experience: "15 years" } },
        { _id: "d2", name: "Dr. Priya Patel", doctorInfo: { specialty: selectedDepartment, experience: "10 years" } },
        { _id: "d3", name: "Dr. Amit Kumar", doctorInfo: { specialty: selectedDepartment, experience: "8 years" } },
      ]);
      setSelectedDoctor("d1");
    }
  };

  // ── Reset Handlers ──
  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
    setSelectedDistrict('');
    setSelectedHospital('');
    setSelectedDepartment('');
    setSelectedScheme('');
    setSelectedDoctor('');
    setDoctors([]);
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
    setSelectedHospital('');
    setSelectedDepartment('');
    setSelectedScheme('');
    setSelectedDoctor('');
    setDoctors([]);
  };

  const handleHospitalChange = (e) => {
    setSelectedHospital(e.target.value);
    setSelectedDepartment('');
    setSelectedScheme('');
    setSelectedDoctor('');
    setDoctors([]);
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
    setSelectedScheme('');
    setSelectedDoctor('');
  };

  // ── Submit ──
  const handleBook = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedState || !selectedDistrict || !selectedHospital || 
        !selectedDepartment || !selectedScheme || !selectedDoctor) {
      setError('Please complete all selections (State → District → Hospital → Department → Scheme → Doctor)');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/appointments/book', {
        state: selectedState,
        district: selectedDistrict,
        hospitalId: selectedHospital,
        department: selectedDepartment,
        scheme: selectedScheme,
        doctorId: selectedDoctor,
        date,
        timeSlot,
        reason
      });
      setBookedAppointment(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  // ── UI Helpers ──
  const renderSelect = ({ label, icon: Icon, value, onChange, options, placeholder, disabled }) => (
    <div className="form-group" style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
        <Icon size={14} /> {label}
      </label>
      <select 
        value={value} 
        onChange={onChange} 
        disabled={disabled}
        style={{
          width: '100%',
          padding: '0.65rem 0.75rem',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',

          //  ye background ha jo book appointment ke colum ke andar ka background change karta ha
          // background: disabled ? 'rgba(255, 255,255, 0.03)' : 'rgba(255,255,255,0.05)',
              
          //  ye color line se bookappotment ka text color change kar sakte ha
          color: disabled ? 'var(--text-muted)' : 'inherit',   
           // color:"red",
          fontSize: '0.9rem',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.id || opt} value={opt.id || opt}>
            {opt.name || opt}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/')} className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back to Portal
        </button>
        <span className="badge badge-patient"><Ticket size={14} /> Government Health Portal</span>
      </div>

      <div className="glass-card">
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar className="text-primary" /> Book Government Hospital Appointment
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Select your location, hospital, department & scheme to get a sequential token.
        </p>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        {bookedAppointment ? (
          <div style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2rem', borderRadius: '16px', textAlign: 'center' }}>
            <CheckCircle2 size={48} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981' }}>Appointment Confirmed!</h3>
            
            <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', color: '#ffffff', padding: '0.75rem 1.75rem', borderRadius: '30px', fontSize: '1.4rem', fontWeight: 800, margin: '1.25rem 0' }}>
              Token #{bookedAppointment.tokenNumber}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginTop: '1rem', textAlign: 'left', fontSize: '0.85rem' }}>
              {[
                { label: 'STATE', value: bookedAppointment.state },
                { label: 'DISTRICT', value: bookedAppointment.district },
                { label: 'HOSPITAL', value: bookedAppointment.hospitalName },
                { label: 'DEPARTMENT', value: bookedAppointment.department },
                { label: 'SCHEME', value: bookedAppointment.scheme },
                { label: 'DOCTOR', value: bookedAppointment.doctorName },
                { label: 'DATE & SLOT', value: `${bookedAppointment.date} (${bookedAppointment.timeSlot})` },
                { label: 'APPOINTMENT ID', value: bookedAppointment.appointmentId, color: '#38bdf8' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.label}</span>
                  <div style={{ fontWeight: 600, color: item.color || 'inherit', fontSize: '0.85rem' }}>{item.value}</div>
                </div>
              ))}
            </div>

            <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
              Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleBook}>
            
            {/* ── Location Cascade ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {renderSelect({
                label: 'Select State *',
                icon: MapPin,
                value: selectedState,
                onChange: handleStateChange,
                options: states.map(s => ({ id: s, name: s })),
                placeholder: '-- Select State --',
                disabled: false
              })}

              {renderSelect({
                label: 'Select District *',
                icon: MapPin,
                value: selectedDistrict,
                onChange: handleDistrictChange,
                options: districts.map(d => ({ id: d, name: d })),
                placeholder: selectedState ? '-- Select District --' : 'First select State',
                disabled: !selectedState
              })}
            </div>

            {/* ── Hospital & Department ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
              {renderSelect({
                label: 'Select Hospital *',
                icon: Building2,
                value: selectedHospital,
                onChange: handleHospitalChange,
                options: hospitals.map(h => ({ id: h.id, name: h.name })),
                placeholder: selectedDistrict ? '-- Select Hospital --' : 'First select District',
                disabled: !selectedDistrict
              })}

              {renderSelect({
                label: 'Select Department *',
                icon: Briefcase,
                value: selectedDepartment,
                onChange: handleDepartmentChange,
                options: departments.map(d => ({ id: d, name: d })),
                placeholder: selectedHospital ? '-- Select Department --' : 'First select Hospital',
                disabled: !selectedHospital
              })}
            </div>

            {/* ── Scheme Selection ── */}
            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={14} /> Select Health Scheme *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {SCHEMES.map(scheme => (
                  <div
                    key={scheme.id}
                    onClick={() => setSelectedScheme(scheme.id)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: `2px solid ${selectedScheme === scheme.id ? scheme.color : 'rgba(255, 255, 255, 0.1)'}`,
                      background: selectedScheme === scheme.id ? `${scheme.color}15` : 'rgba(255, 255, 255, 0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      border: `2px solid ${scheme.color}`,
                      background: selectedScheme === scheme.id ? scheme.color : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {selectedScheme === scheme.id && <div style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%' }} />}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: selectedScheme === scheme.id ? scheme.color : 'inherit' }}>
                      {scheme.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Doctor Selection ── */}
            <div style={{ marginTop: '1rem' }}>
              {renderSelect({
                label: 'Select Doctor *',
                icon: Stethoscope,
                value: selectedDoctor,
                onChange: (e) => setSelectedDoctor(e.target.value),
                options: doctors.map(d => ({ 
                  id: d._id, 
                  name: `${d.name} — ${d.doctorInfo?.specialty || selectedDepartment} (${d.doctorInfo?.experience || 'Senior'})` 
                })),
                placeholder: selectedDepartment ? (doctors.length ? '-- Select Doctor --' : 'Loading doctors...') : 'First select Department',
                disabled: !selectedDepartment || !doctors.length
              })}
            </div>

            {/* ── Date, Time, Reason ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}><Calendar size={14} style={{display:'inline', marginRight:'4px'}}/> Appointment Date *</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={date} 
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  required 
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', marginTop: '0.3rem' }}
                />
              </div>
                                  
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color:   'var(--text-muted)' }}><Clock size={14} style={{display:'inline', marginRight:'4px'}}/> Time Slot *</label>
                <select 
                  value={timeSlot} 
                  onChange={(e) => setTimeSlot(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', marginTop: '0.3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {TIME_SLOTS.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}><Stethoscope size={14} style={{display:'inline', marginRight:'4px'}}/> Reason / Symptoms</label>
              <textarea 
                rows="2" 
                className="input-field" 
                placeholder="e.g. Chest tightness, Fever since 2 days"
                value={reason} 
                onChange={(e) => setReason(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', marginTop: '0.3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', resize: 'vertical' }}
              />
            </div>

            {/* ── Submit ── */}
            <button 
              type="submit" 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%', marginTop: '1.25rem', padding: '0.85rem' }} 
              disabled={loading}
            >
              {loading ? 'Generating Token...' : <><Ticket size={18} style={{display:'inline', marginRight:'6px'}}/> Confirm & Get Token Number</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;         
