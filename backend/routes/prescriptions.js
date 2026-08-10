const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { isDbConnected } = require('../config/db');
const memoryStore = require('../config/memoryStore');

const generateRxId = () => {
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `RX-${new Date().getFullYear()}-${rand}`;
};

// @route   POST /api/prescriptions
router.post('/', protect, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { 
      patientId, 
      patientHealthId, 
      patientName, 
      diagnosis, 
      vitals, 
      medicines, 
      labTestsRecommended, 
      advice 
    } = req.body;

    let targetPatientId = patientId;
    let targetHealthId = patientHealthId;
    let targetPatientName = patientName;

    if (isDbConnected()) {
      if (!targetPatientId && targetHealthId) {
        const p = await User.findOne({ 'patientInfo.healthId': targetHealthId, role: 'patient' });
        if (p) {
          targetPatientId = p._id;
          targetPatientName = p.name;
        }
      } else if (targetPatientId) {
        const p = await User.findById(targetPatientId);
        if (p) {
          targetHealthId = p.patientInfo ? p.patientInfo.healthId : 'N/A';
          targetPatientName = p.name;
        }
      }
    } else {
      if (!targetPatientId && targetHealthId) {
        const p = memoryStore.users.find(u => u.patientInfo?.healthId === targetHealthId && u.role === 'patient');
        if (p) {
          targetPatientId = p._id;
          targetPatientName = p.name;
        } else {
          targetPatientId = 'pat_' + Date.now();
        }
      }
    }

    const prescriptionId = generateRxId();
    
    const verificationPayload = JSON.stringify({
      rxId: prescriptionId,
      doctor: req.user.name,
      patient: targetPatientName || 'Patient',
      patientHealthId: targetHealthId,
      date: new Date().toISOString().split('T')[0],
      diagnosis
    });

    const qrCodeData = await QRCode.toDataURL(verificationPayload);

    const rxData = {
      prescriptionId,
      doctor: req.user._id,
      patient: targetPatientId || 'pat_demo',
      patientHealthId: targetHealthId || 'HID-2026-8834',
      patientName: targetPatientName || 'Patient',
      doctorName: req.user.name,
      doctorSpecialty: req.user.doctorInfo ? req.user.doctorInfo.specialty : 'General Physician',
      diagnosis,
      vitals: vitals || {},
      medicines: medicines || [],
      labTestsRecommended: labTestsRecommended || [],
      advice: advice || '',
      qrCodeData,
      status: 'active',
      createdAt: new Date()
    };

    if (isDbConnected()) {
      const prescription = await Prescription.create(rxData);
      return res.status(201).json(prescription);
    } else {
      rxData._id = 'rx_' + Date.now();
      memoryStore.prescriptions.unshift(rxData);
      return res.status(201).json(rxData);
    }
  } catch (error) {
    console.error('Prescription creation error:', error);
    res.status(500).json({ message: error.message || 'Failed to create prescription' });
  }
});

// @route   GET /api/prescriptions/my
router.get('/my', protect, async (req, res) => {
  try {
    if (isDbConnected()) {
      let prescriptions = [];
      if (req.user.role === 'doctor') {
        prescriptions = await Prescription.find({ doctor: req.user._id }).sort({ createdAt: -1 });
      } else if (req.user.role === 'patient') {
        prescriptions = await Prescription.find({ patient: req.user._id }).sort({ createdAt: -1 });
      } else {
        prescriptions = await Prescription.find().sort({ createdAt: -1 }).limit(50);
      }
      return res.json(prescriptions);
    } else {
      let list = memoryStore.prescriptions;
      if (req.user.role === 'doctor') {
        list = list.filter(p => p.doctor.toString() === req.user._id.toString() || p.doctorName === req.user.name);
      } else if (req.user.role === 'patient') {
        list = list.filter(p => p.patientHealthId === req.user.healthId || p.patient.toString() === req.user._id.toString());
      }
      return res.json(list);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching prescriptions' });
  }
});

// @route   GET /api/prescriptions/patient/:healthId
router.get('/patient/:healthId', protect, async (req, res) => {
  try {
    if (isDbConnected()) {
      const prescriptions = await Prescription.find({ patientHealthId: req.params.healthId }).sort({ createdAt: -1 });
      return res.json(prescriptions);
    } else {
      const list = memoryStore.prescriptions.filter(p => p.patientHealthId === req.params.healthId);
      return res.json(list);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient prescriptions' });
  }
});

// @route   GET /api/prescriptions/verify/:prescriptionId
router.get('/verify/:prescriptionId', protect, async (req, res) => {
  try {
    if (isDbConnected()) {
      const prescription = await Prescription.findOne({ prescriptionId: req.params.prescriptionId })
        .populate('doctor', 'name doctorInfo phone email')
        .populate('patient', 'name phone patientInfo');

      if (!prescription) {
        return res.status(404).json({ message: 'Prescription not found or invalid QR code' });
      }
      return res.json(prescription);
    } else {
      const rx = memoryStore.prescriptions.find(p => p.prescriptionId === req.params.prescriptionId);
      if (!rx) {
        return res.status(404).json({ message: 'Prescription not found or invalid QR code' });
      }
      return res.json(rx);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error verifying prescription' });
  }
});

// @route   PUT /api/prescriptions/:id/dispense
router.put('/:id/dispense', protect, authorize('pharmacist', 'admin'), async (req, res) => {
  try {
    if (isDbConnected()) {
      const prescription = await Prescription.findById(req.params.id);
      if (!prescription) {
        return res.status(404).json({ message: 'Prescription not found' });
      }

      if (prescription.status === 'dispensed') {
        return res.status(400).json({ message: 'Prescription has already been dispensed' });
      }

      prescription.status = 'dispensed';
      prescription.dispensedBy = req.user._id;
      prescription.dispensedAt = new Date();

      await prescription.save();
      return res.json({ message: 'Prescription successfully marked as dispensed', prescription });
    } else {
      const rx = memoryStore.prescriptions.find(p => p._id.toString() === req.params.id.toString());
      if (!rx) {
        return res.status(404).json({ message: 'Prescription not found' });
      }
      if (rx.status === 'dispensed') {
        return res.status(400).json({ message: 'Prescription has already been dispensed' });
      }
      rx.status = 'dispensed';
      rx.dispensedBy = req.user._id;
      rx.dispensedAt = new Date();
      return res.json({ message: 'Prescription successfully marked as dispensed', prescription: rx });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating prescription status' });
  }
});

// @route   GET /api/prescriptions/:id
router.get('/:id', protect, async (req, res) => {
  try {
    if (isDbConnected()) {
      const prescription = await Prescription.findById(req.params.id);
      if (!prescription) {
        return res.status(404).json({ message: 'Prescription not found' });
      }
      return res.json(prescription);
    } else {
      const rx = memoryStore.prescriptions.find(p => p._id.toString() === req.params.id.toString());
      if (!rx) {
        return res.status(404).json({ message: 'Prescription not found' });
      }
      return res.json(rx);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prescription' });
  }
});

module.exports = router;
