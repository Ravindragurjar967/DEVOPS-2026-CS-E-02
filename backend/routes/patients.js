const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Prescription = require('../models/Prescription');
const MedicalReport = require('../models/MedicalReport');
const { protect, authorize } = require('../middleware/auth');
const { isDbConnected } = require('../config/db');
const memoryStore = require('../config/memoryStore');

// @route   GET /api/patients/search
router.get('/search', protect, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    if (isDbConnected()) {
      const regex = new RegExp(query, 'i');
      const patients = await User.find({
        role: 'patient',
        $or: [
          { name: regex },
          { phone: regex },
          { email: regex },
          { 'patientInfo.healthId': regex }
        ]
      }).select('-password').limit(15);
      return res.json(patients);
    } else {
      const q = query.toLowerCase();
      const patients = memoryStore.users.filter(u => 
        u.role === 'patient' && (
          u.name.toLowerCase().includes(q) ||
          u.phone.includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.patientInfo && u.patientInfo.healthId && u.patientInfo.healthId.toLowerCase().includes(q))
        )
      );
      return res.json(patients);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error searching patients' });
  }
});

// @route   GET /api/patients/all
router.get('/all', protect, authorize('doctor', 'admin', 'pharmacist'), async (req, res) => {
  try {
    if (isDbConnected()) {
      const patients = await User.find({ role: 'patient' }).select('-password').sort({ createdAt: -1 }).limit(50);
      return res.json(patients);
    } else {
      const patients = memoryStore.users.filter(u => u.role === 'patient');
      return res.json(patients);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients list' });
  }
});

// @route   GET /api/patients/record/:healthId
router.get('/record/:healthId', protect, async (req, res) => {
  try {
    const healthId = req.params.healthId;

    if (isDbConnected()) {
      const patient = await User.findOne({ 'patientInfo.healthId': healthId, role: 'patient' }).select('-password');
      if (!patient) {
        return res.status(404).json({ message: 'Patient with given Health ID not found' });
      }
      const prescriptions = await Prescription.find({ patientHealthId: healthId }).sort({ createdAt: -1 });
      const reports = await MedicalReport.find({ patientHealthId: healthId }).sort({ createdAt: -1 });

      return res.json({ patient, prescriptions, reports });
    } else {
      const patient = memoryStore.users.find(u => u.patientInfo?.healthId === healthId && u.role === 'patient');
      if (!patient) {
        return res.status(404).json({ message: 'Patient with given Health ID not found' });
      }
      const prescriptions = memoryStore.prescriptions.filter(p => p.patientHealthId === healthId);
      const reports = memoryStore.reports.filter(r => r.patientHealthId === healthId);

      return res.json({ patient, prescriptions, reports });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medical record' });
  }
});

module.exports = router;
