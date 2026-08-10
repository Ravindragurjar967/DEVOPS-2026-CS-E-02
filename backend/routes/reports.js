const express = require('express');
const router = express.Router();
const MedicalReport = require('../models/MedicalReport');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { isDbConnected } = require('../config/db');
const memoryStore = require('../config/memoryStore');

// @route   POST /api/reports
router.post('/', protect, async (req, res) => {
  try {
    const { patientHealthId, title, category, labName, summary, results, fileUrl } = req.body;

    const reportData = {
      patientHealthId,
      title,
      category: category || 'General',
      labName: labName || 'Central Diagnostics Lab',
      summary: summary || '',
      results: results || [],
      fileUrl: fileUrl || '',
      uploadedBy: req.user._id,
      reportDate: new Date(),
      createdAt: new Date()
    };

    if (isDbConnected()) {
      const patient = await User.findOne({ 'patientInfo.healthId': patientHealthId });
      if (patient) reportData.patient = patient._id;

      const report = await MedicalReport.create(reportData);
      return res.status(201).json(report);
    } else {
      reportData._id = 'rep_' + Date.now();
      reportData.patient = req.user._id;
      memoryStore.reports.unshift(reportData);
      return res.status(201).json(reportData);
    }
  } catch (error) {
    console.error('Report create error:', error);
    res.status(500).json({ message: 'Failed to create report' });
  }
});

// @route   GET /api/reports/my
router.get('/my', protect, async (req, res) => {
  try {
    if (isDbConnected()) {
      const reports = await MedicalReport.find({ patient: req.user._id }).sort({ createdAt: -1 });
      return res.json(reports);
    } else {
      const reports = memoryStore.reports.filter(r => r.patientHealthId === req.user.healthId || r.patient.toString() === req.user._id.toString());
      return res.json(reports);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

// @route   GET /api/reports/patient/:healthId
router.get('/patient/:healthId', protect, async (req, res) => {
  try {
    if (isDbConnected()) {
      const reports = await MedicalReport.find({ patientHealthId: req.params.healthId }).sort({ createdAt: -1 });
      return res.json(reports);
    } else {
      const reports = memoryStore.reports.filter(r => r.patientHealthId === req.params.healthId);
      return res.json(reports);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch patient reports' });
  }
});

module.exports = router;
