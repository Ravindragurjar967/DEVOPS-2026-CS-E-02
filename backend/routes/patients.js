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

// @route   GET /api/patients/record/:healthId
// @desc    Get complete universal medical history of a patient by Health ID (Enforces Patient Consent Check)
router.get('/record/:healthId', protect, async (req, res) => {
  try {
    const healthId = req.params.healthId;
    let patient = null;

    if (isDbConnected()) {
      patient = await User.findOne({ 'patientInfo.healthId': healthId, role: 'patient' }).select('-password');
    } else {
      patient = memoryStore.users.find(u => u.patientInfo?.healthId === healthId && u.role === 'patient');
    }

    if (!patient) {
      return res.status(404).json({ message: 'Patient with given Health ID not found' });
    }

    // Patient Consent Check: If requester is a doctor and consent is revoked
    const isConsentGranted = patient.patientInfo?.doctorConsentGranted !== false;
    const isOwner = req.user._id.toString() === patient._id.toString() || req.user.healthId === healthId;

    if (!isConsentGranted && !isOwner && req.user.role === 'doctor') {
      return res.json({
        patient: {
          _id: patient._id,
          name: patient.name,
          patientInfo: {
            healthId: patient.patientInfo.healthId,
            doctorConsentGranted: false
          }
        },
        prescriptions: [],
        reports: [],
        consentRestricted: true,
        message: 'Patient has revoked doctor access to full medical history. Ask patient to enable consent.'
      });
    }

    let prescriptions = [];
    let reports = [];

    if (isDbConnected()) {
      prescriptions = await Prescription.find({ patientHealthId: healthId }).sort({ createdAt: -1 });
      reports = await MedicalReport.find({ patientHealthId: healthId }).sort({ createdAt: -1 });
    } else {
      prescriptions = memoryStore.prescriptions.filter(p => p.patientHealthId === healthId);
      reports = memoryStore.reports.filter(r => r.patientHealthId === healthId);
    }

    return res.json({ patient, prescriptions, reports, consentRestricted: false });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medical record' });
  }
});

// @route   PUT /api/patients/toggle-consent
// @desc    Patient enables or revokes permission for doctors to view full medical history
router.put('/toggle-consent', protect, async (req, res) => {
  try {
    const { granted } = req.body;
    
    if (isDbConnected()) {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (!user.patientInfo) user.patientInfo = {};
      user.patientInfo.doctorConsentGranted = Boolean(granted);
      await user.save();
      return res.json({ message: `Doctor access consent updated to ${granted}`, patientInfo: user.patientInfo });
    } else {
      const user = memoryStore.users.find(u => u._id.toString() === req.user._id.toString());
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (!user.patientInfo) user.patientInfo = {};
      user.patientInfo.doctorConsentGranted = Boolean(granted);
      return res.json({ message: `Doctor access consent updated to ${granted}`, patientInfo: user.patientInfo });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error toggling consent' });
  }
});

module.exports = router;
