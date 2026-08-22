const express = require('express');
const router = express.Router();
const MedicalReport = require('../models/MedicalReport');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { isDbConnected } = require('../config/db');
const memoryStore = require('../config/memoryStore');

// Helper to sanitize patient Health ID
const sanitizeHealthId = (hid) => hid ? hid.trim().toUpperCase() : '';

// @route   POST /api/diagnosis/upload
// @desc    Upload multi-format diagnostic report (X-Ray, CT Scan, MRI, CBC, Ultrasound)
router.post('/upload', protect, async (req, res) => {
  try {
    const { 
      patientHealthId, 
      title, 
      category, 
      labName, 
      reportDate, 
      summary, 
      fileUrl, 
      fileName, 
      fileType, 
      fileSize, 
      isAbnormal,
      results 
    } = req.body;

    if (!patientHealthId || !title || !category) {
      return res.status(400).json({ message: 'Patient Health ID, Title, and Category are required.' });
    }

    const cleanHealthId = sanitizeHealthId(patientHealthId);

    // Verify Patient exists or get name
    let patientName = 'Patient';
    let patientObjId = null;

    if (isDbConnected()) {
      const patientUser = await User.findOne({ 'patientInfo.healthId': cleanHealthId });
      if (patientUser) {
        patientName = patientUser.name;
        patientObjId = patientUser._id;
      }
    } else {
      const memPatient = (memoryStore.users || []).find(u => u.patientInfo?.healthId === cleanHealthId);
      if (memPatient) {
        patientName = memPatient.name;
        patientObjId = memPatient._id;
      }
    }

    const reportData = {
      patient: patientObjId || cleanHealthId,
      patientHealthId: cleanHealthId,
      uploadedBy: req.user._id,
      uploadedByName: req.user.name,
      title,
      category, // 'X-Ray', 'CT Scan', 'MRI', 'Blood Test (CBC)', 'Ultrasound', 'ECG', 'Pathology'
      labName: labName || 'Central Diagnostic Center',
      reportDate: reportDate ? new Date(reportDate) : new Date(),
      summary: summary || '',
      fileUrl: fileUrl || '',
      fileName: fileName || '',
      fileType: fileType || 'image/png',
      fileSize: fileSize || 0,
      isAbnormal: Boolean(isAbnormal),
      results: results || [],
      createdAt: new Date()
    };

    if (isDbConnected()) {
      const newReport = await MedicalReport.create(reportData);
      return res.status(201).json(newReport);
    } else {
      const newId = 'rep_' + Date.now();
      const newReport = { _id: newId, ...reportData };
      if (!memoryStore.reports) memoryStore.reports = [];
      memoryStore.reports.unshift(newReport);
      return res.status(201).json(newReport);
    }
  } catch (error) {
    console.error('Diagnosis report upload error:', error);
    res.status(500).json({ message: 'Failed to upload diagnostic report: ' + error.message });
  }
});

// @route   GET /api/diagnosis/patient/:healthId
// @desc    Get all multi-format diagnostic reports for a specific patient
router.get('/patient/:healthId', protect, async (req, res) => {
  try {
    const cleanHealthId = sanitizeHealthId(req.params.healthId);

    if (isDbConnected()) {
      const reports = await MedicalReport.find({ patientHealthId: cleanHealthId }).sort({ reportDate: -1 });
      return res.json(reports);
    } else {
      const reports = (memoryStore.reports || []).filter(r => r.patientHealthId === cleanHealthId);
      return res.json(reports);
    }
  } catch (error) {
    console.error('Fetch patient diagnosis error:', error);
    res.status(500).json({ message: 'Error fetching patient diagnostic reports' });
  }
});

// @route   GET /api/diagnosis/all
// @desc    Get all multi-format diagnostic reports across platform
router.get('/all', protect, async (req, res) => {
  try {
    if (isDbConnected()) {
      const reports = await MedicalReport.find().sort({ reportDate: -1 });
      return res.json(reports);
    } else {
      return res.json(memoryStore.reports || []);
    }
  } catch (error) {
    console.error('Fetch all diagnosis error:', error);
    res.status(500).json({ message: 'Error fetching diagnostic reports' });
  }
});

// @route   DELETE /api/diagnosis/:id
// @desc    Delete a diagnostic report
router.delete('/:id', protect, async (req, res) => {
  try {
    if (isDbConnected()) {
      const report = await MedicalReport.findByIdAndDelete(req.params.id);
      if (!report) return res.status(404).json({ message: 'Report not found' });
      return res.json({ message: 'Report deleted successfully' });
    } else {
      const index = (memoryStore.reports || []).findIndex(r => r._id.toString() === req.params.id.toString());
      if (index === -1) return res.status(404).json({ message: 'Report not found' });
      memoryStore.reports.splice(index, 1);
      return res.json({ message: 'Report deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting report' });
  }
});

module.exports = router;
