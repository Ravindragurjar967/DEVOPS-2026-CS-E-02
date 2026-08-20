const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Prescription = require('../models/Prescription');
const MedicalReport = require('../models/MedicalReport');
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');
const { isDbConnected } = require('../config/db');
const memoryStore = require('../config/memoryStore');

// Middleware to ensure Admin role
const adminOnly = [protect, authorize('admin')];

// @route   GET /api/admin/stats
// @desc    Get overall system stats for Super Admin
router.get('/stats', adminOnly, async (req, res) => {
  try {
    if (isDbConnected()) {
      const [totalUsers, doctors, patients, pharmacists, totalPrescriptions, totalReports, totalAppointments] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'doctor' }),
        User.countDocuments({ role: 'patient' }),
        User.countDocuments({ role: 'pharmacist' }),
        Prescription.countDocuments(),
        MedicalReport.countDocuments(),
        Appointment.countDocuments()
      ]);

      return res.json({
        totalUsers,
        doctors,
        patients,
        pharmacists,
        totalPrescriptions,
        totalReports,
        totalAppointments
      });
    } else {
      const users = memoryStore.users || [];
      return res.json({
        totalUsers: users.length,
        doctors: users.filter(u => u.role === 'doctor').length,
        patients: users.filter(u => u.role === 'patient').length,
        pharmacists: users.filter(u => u.role === 'pharmacist').length,
        totalPrescriptions: (memoryStore.prescriptions || []).length,
        totalReports: (memoryStore.reports || []).length,
        totalAppointments: (memoryStore.appointments || []).length
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin stats' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all registered users across all roles
router.get('/users', adminOnly, async (req, res) => {
  try {
    if (isDbConnected()) {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      return res.json(users);
    } else {
      const users = memoryStore.users.map(u => {
        const { password, ...withoutPass } = u;
        return withoutPass;
      });
      return res.json(users);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Admin edit user details (Name, Email, Role, Doctor/Pharmacy metadata)
router.put('/users/:id', adminOnly, async (req, res) => {
  try {
    const { name, email, role, phone, doctorInfo, patientInfo, pharmacyInfo } = req.body;

    if (isDbConnected()) {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (name) user.name = name;
      if (email) user.email = email;
      if (role) user.role = role;
      if (phone !== undefined) user.phone = phone;
      if (doctorInfo) user.doctorInfo = { ...user.doctorInfo, ...doctorInfo };
      if (patientInfo) user.patientInfo = { ...user.patientInfo, ...patientInfo };
      if (pharmacyInfo) user.pharmacyInfo = { ...user.pharmacyInfo, ...pharmacyInfo };

      await user.save();
      const updatedUser = user.toObject();
      delete updatedUser.password;
      return res.json(updatedUser);
    } else {
      const userIndex = memoryStore.users.findIndex(u => u._id.toString() === req.params.id.toString());
      if (userIndex === -1) return res.status(404).json({ message: 'User not found' });

      const user = memoryStore.users[userIndex];
      if (name) user.name = name;
      if (email) user.email = email;
      if (role) user.role = role;
      if (phone !== undefined) user.phone = phone;
      if (doctorInfo) user.doctorInfo = { ...user.doctorInfo, ...doctorInfo };
      if (patientInfo) user.patientInfo = { ...user.patientInfo, ...patientInfo };
      if (pharmacyInfo) user.pharmacyInfo = { ...user.pharmacyInfo, ...pharmacyInfo };

      const { password, ...updatedUser } = user;
      return res.json(updatedUser);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Admin delete a user
router.delete('/users/:id', adminOnly, async (req, res) => {
  try {
    if (isDbConnected()) {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json({ message: 'User deleted successfully' });
    } else {
      const index = memoryStore.users.findIndex(u => u._id.toString() === req.params.id.toString());
      if (index === -1) return res.status(404).json({ message: 'User not found' });
      memoryStore.users.splice(index, 1);
      return res.json({ message: 'User deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// @route   GET /api/admin/prescriptions
// @desc    Get all prescriptions across platform
router.get('/prescriptions', adminOnly, async (req, res) => {
  try {
    if (isDbConnected()) {
      const prescriptions = await Prescription.find().sort({ createdAt: -1 });
      return res.json(prescriptions);
    } else {
      return res.json(memoryStore.prescriptions || []);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prescriptions' });
  }
});

// @route   PUT /api/admin/prescriptions/:id
// @desc    Admin edit prescription details (Diagnosis, Medicines, Status)
router.put('/prescriptions/:id', adminOnly, async (req, res) => {
  try {
    const { diagnosis, medicines, advice, status } = req.body;

    if (isDbConnected()) {
      const rx = await Prescription.findById(req.params.id);
      if (!rx) return res.status(404).json({ message: 'Prescription not found' });

      if (diagnosis) rx.diagnosis = diagnosis;
      if (medicines) rx.medicines = medicines;
      if (advice !== undefined) rx.advice = advice;
      if (status) rx.status = status;

      await rx.save();
      return res.json(rx);
    } else {
      const rx = (memoryStore.prescriptions || []).find(p => p._id.toString() === req.params.id.toString());
      if (!rx) return res.status(404).json({ message: 'Prescription not found' });

      if (diagnosis) rx.diagnosis = diagnosis;
      if (medicines) rx.medicines = medicines;
      if (advice !== undefined) rx.advice = advice;
      if (status) rx.status = status;

      return res.json(rx);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating prescription' });
  }
});

// @route   DELETE /api/admin/prescriptions/:id
// @desc    Admin delete a prescription
router.delete('/prescriptions/:id', adminOnly, async (req, res) => {
  try {
    if (isDbConnected()) {
      const rx = await Prescription.findByIdAndDelete(req.params.id);
      if (!rx) return res.status(404).json({ message: 'Prescription not found' });
      return res.json({ message: 'Prescription deleted successfully' });
    } else {
      const index = (memoryStore.prescriptions || []).findIndex(p => p._id.toString() === req.params.id.toString());
      if (index === -1) return res.status(404).json({ message: 'Prescription not found' });
      memoryStore.prescriptions.splice(index, 1);
      return res.json({ message: 'Prescription deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting prescription' });
  }
});

// @route   GET /api/admin/reports
// @desc    Get all diagnostic lab reports across platform
router.get('/reports', adminOnly, async (req, res) => {
  try {
    if (isDbConnected()) {
      const reports = await MedicalReport.find().sort({ createdAt: -1 });
      return res.json(reports);
    } else {
      return res.json(memoryStore.reports || []);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports' });
  }
});

// @route   DELETE /api/admin/reports/:id
// @desc    Admin delete a lab report
router.delete('/reports/:id', adminOnly, async (req, res) => {
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
