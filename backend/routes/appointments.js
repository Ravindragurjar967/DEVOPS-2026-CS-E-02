//  root book appontment code

const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { isDbConnected } = require('../config/db');
const memoryStore = require('../config/memoryStore');

if (!memoryStore.appointments) {
  memoryStore.appointments = [];
}

// ─── Mock Data ───
const HOSPITAL_DATA = {
  h1: { name: "SMS Hospital", departments: ["Cardiology", "Orthopedics", "General Medicine", "Pediatrics"] , },
  h2: { name: "Fortis Escorts", departments: ["Cardiology", "Neurology", "Oncology"] },
  h3: { name: "Mahatma Gandhi Hospital", departments: ["General Medicine", "Gynecology", "Dermatology"] },
  h4: { name: "AIIMS Raipur", departments: ["Cardiology", "Orthopedics", "General Medicine", "Neurosurgery"] },
  h5: { name: "Dr. B.R. Ambedkar Hospital", departments: ["General Medicine", "Pediatrics", "ENT"] },
  h6: { name: "Hamidia Hospital", departments: ["General Medicine", "Orthopedics", "Radiology"] },
  h7: { name: "Bansal Hospital", departments: ["Cardiology", "Neurology", "Gastroenterology"] },
  hd1: { name: "District Government Hospital", departments: ["General Medicine", "Pediatrics", "Gynecology"] },
  hd2: { name: "City Care Hospital", departments: ["Cardiology", "Orthopedics", "ENT"] }
};

// ─── Helpers ───
const getHospitalName = (id) => HOSPITAL_DATA[id]?.name || id;

const generateMockDoctors = (department, hospitalId) => [
  { _id: `d1_${department.replace(/\s/g, '')}`, name: 'Dr. Rajesh Sharma', role: 'doctor', doctorInfo: { specialty: department, experience: '15 years', hospitalId } },
  { _id: `d2_${department.replace(/\s/g, '')}`, name: 'Dr. Priya Patel', role: 'doctor', doctorInfo: { specialty: department, experience: '10 years', hospitalId } },
  { _id: `d3_${department.replace(/\s/g, '')}`, name: 'Dr. Amit Kumar', role: 'doctor', doctorInfo: { specialty: department, experience: '8 years', hospitalId } },
];

const getNextToken = (hospitalId, date) => {
  const hospitalAppts = memoryStore.appointments.filter(
    a => a.hospitalId === hospitalId && a.date === date
  );
  return hospitalAppts.length > 0 
    ? Math.max(...hospitalAppts.map(a => a.tokenNumber || 0)) + 1 
    : 1;
};


// @route   GET /api/appointments/doctors
router.get('/doctors', protect, async (req, res) => {
  try {
    const { hospitalId, department } = req.query;
    
    if (isDbConnected()) {
      // Step 1: Try exact match (hospital + department)
      let query = { role: 'doctor' };
      if (hospitalId) query['doctorInfo.hospitalId'] = hospitalId;
      if (department) query['doctorInfo.specialty'] = department;
      
      let doctors = await User.find(query).select('-password');
      console.log('🔍 Exact match doctors:', doctors.length);
      
      // Step 2: Agar exact match mein koi nahi, to sirf department se search karo
      if (!doctors.length && department) {
        doctors = await User.find({ 
          role: 'doctor', 
          'doctorInfo.specialty': department 
        }).select('-password');
        console.log('🔍 Department-only match:', doctors.length);
      }
      
      // Step 3: Agar ab bhi koi nahi, to saare doctors lao
      if (!doctors.length) {
        doctors = await User.find({ role: 'doctor' }).select('-password');
        console.log('🔍 All doctors:', doctors.length);
      }
      
      // Step 4: Agar DB mein hi koi doctor nahi hai, to mock data
      if (!doctors.length && department) {
        console.log('⚠️ No doctors in DB, returning mock doctors');
        doctors = generateMockDoctors(department, hospitalId);
      }
      
      return res.json(doctors);
    }

    // ── In-Memory Mode ──
    let doctors = memoryStore.users.filter(u => u.role === 'doctor');
    
    if (hospitalId) {
      doctors = doctors.filter(d => d.doctorInfo?.hospitalId === hospitalId);
    }
    if (department) {
      doctors = doctors.filter(d => d.doctorInfo?.specialty === department);
    }
    
    // Agar memory mein bhi match nahi kiya, to mock fallback
    if (!doctors.length && department) {
      doctors = generateMockDoctors(department, hospitalId);
    }
    
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});







// @route   GET /api/appointments/hospitals
router.get('/hospitals', async (req, res) => {
  try {
    const hospitals = Object.entries(HOSPITAL_DATA).map(([id, data]) => ({
      id, name: data.name, departments: data.departments
    }));
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hospitals' });
  }
});

// @route   POST /api/appointments/book
router.post('/book', protect, async (req, res) => {
  try {
    const { state, district, hospitalId, department, scheme, doctorId, date, timeSlot, reason } = req.body;

    if (!state || !district || !hospitalId || !department || !scheme || !doctorId) {
      return res.status(400).json({ 
        message: 'Required: state, district, hospitalId, department, scheme, doctorId' 
      });
    }

    let doctorObj;
    if (isDbConnected()) {
      doctorObj = await User.findById(doctorId);
    } else {
      doctorObj = memoryStore.users.find(u => u._id?.toString() === doctorId.toString());
      if (!doctorObj) {
        doctorObj = { _id: doctorId, name: 'Dr. Assigned Physician', doctorInfo: { specialty: department, hospitalId } };
      }
    }

    if (!doctorObj) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const appointmentDate = date || new Date().toISOString().split('T')[0];
    let nextToken = 1;

    if (isDbConnected()) {
      try {
        const last = await Appointment.findOne({ hospitalId, date: appointmentDate })
          .sort({ tokenNumber: -1 }).lean();
        if (last?.tokenNumber) nextToken = last.tokenNumber + 1;
        console.log('✅ MongoDB token:', nextToken);
      } catch (dbError) {
        console.error('❌ MongoDB query failed:', dbError.message);
        nextToken = getNextToken(hospitalId, appointmentDate);
      }
    } else {
      nextToken = getNextToken(hospitalId, appointmentDate);
      console.log('⚠️ Memory token:', nextToken);
    }

    const apptData = {
      appointmentId: `GOV-${Date.now().toString(36).toUpperCase()}`,
      state, district, hospitalId,
      hospitalName: getHospitalName(hospitalId),
      department, scheme,
      doctor: doctorObj._id,
      doctorName: doctorObj.name,
      doctorSpecialty: doctorObj.doctorInfo?.specialty || department,
      patient: req.user._id,
      patientName: req.user.name,
      patientHealthId: req.user.healthId || req.user.patientInfo?.healthId || 'HID-2026-DEMO',
      date: appointmentDate,
      tokenNumber: nextToken,
      timeSlot: timeSlot || '10:00 AM - 11:00 AM',
      reason: reason || 'General Checkup',
      status: 'pending',
      createdAt: new Date()
    };

    if (isDbConnected()) {
      const appointment = await Appointment.create(apptData);
      console.log('✅ Saved to MongoDB:', appointment.appointmentId);
      return res.status(201).json(appointment);
    }

    apptData._id = 'apt_' + Date.now();
    memoryStore.appointments.push(apptData);
    console.log('⚠️ Saved to Memory:', apptData.appointmentId);
    res.status(201).json(apptData);
  } catch (error) {
    console.error('❌ Booking error:', error);
    res.status(500).json({ message: 'Failed to book appointment' });
  }
});

// @route   GET /api/appointments/my
router.get('/my', protect, async (req, res) => {
  try {
    if (isDbConnected()) {
      const query = req.user.role === 'doctor' 
        ? { doctor: req.user._id } 
        : { patient: req.user._id };
      const sort = req.user.role === 'doctor' 
        ? { date: 1, tokenNumber: 1 } 
        : { date: -1, tokenNumber: 1 };
      const list = await Appointment.find(query).sort(sort);
      return res.json(list);
    }

    let list = memoryStore.appointments;
    if (req.user.role === 'doctor') {
      list = list.filter(a => a.doctor?.toString() === req.user._id.toString());
    } else {
      list = list.filter(a => a.patient?.toString() === req.user._id.toString());
    }
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

// @route   GET /api/appointments/queue/:hospitalId
router.get('/queue/:hospitalId', protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let list = [];

    if (isDbConnected()) {
      list = await Appointment.find({ hospitalId: req.params.hospitalId, date: today })
        .sort({ tokenNumber: 1 }).lean();
    } else {
      list = memoryStore.appointments.filter(
        a => a.hospitalId === req.params.hospitalId && a.date === today
      ).sort((a, b) => a.tokenNumber - b.tokenNumber);
    }

    res.json({
      hospitalId: req.params.hospitalId,
      date: today,
      totalTokens: list.length,
      pending: list.filter(a => a.status === 'pending').length,
      inConsultation: list.filter(a => a.status === 'in_consultation').length,
      completed: list.filter(a => a.status === 'completed').length,
      queue: list
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching queue' });
  }
});

// @route   PUT /api/appointments/:id/status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'in_consultation', 'completed', 'cancelled'];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    let appt;
    if (isDbConnected()) {
      appt = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    } else {
      appt = memoryStore.appointments.find(a => a._id?.toString() === req.params.id);
      if (appt) appt.status = status;
    }

    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appt);
  } catch (error) {
    res.status(500).json({ message: 'Error updating status' });
  }
});

// @route   GET /api/appointments/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    if (isDbConnected()) {
      const [total, todayCount, schemeStats] = await Promise.all([
        Appointment.countDocuments(),
        Appointment.countDocuments({ date: today }),
        Appointment.aggregate([{ $group: { _id: '$scheme', count: { $sum: 1 } } }])
      ]);
      return res.json({ total, today: todayCount, schemeBreakdown: schemeStats });
    }

    const schemeStats = {};
    memoryStore.appointments.forEach(a => {
      schemeStats[a.scheme] = (schemeStats[a.scheme] || 0) + 1;
    });

    res.json({
      total: memoryStore.appointments.length,
      today: memoryStore.appointments.filter(a => a.date === today).length,
      schemeBreakdown: schemeStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

module.exports = router;