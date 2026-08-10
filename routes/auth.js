const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'eprescription_super_secret_jwt_key_2026_health', {
    expiresIn: '30d'
  });
};

const generateHealthId = () => {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `HID-${new Date().getFullYear()}-${rand}`;
};

// @route   POST /api/auth/register
// @desc    Register a new user (Doctor, Patient, Pharmacist)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, doctorInfo, patientInfo, pharmacyInfo } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const userPayload = {
      name,
      email,
      password,
      role: role || 'patient',
      phone: phone || ''
    };

    if (role === 'doctor') {
      userPayload.doctorInfo = doctorInfo || {};
    } else if (role === 'pharmacist') {
      userPayload.pharmacyInfo = pharmacyInfo || {};
    } else {
      // Patient role
      userPayload.patientInfo = {
        ...(patientInfo || {}),
        healthId: generateHealthId()
      };
    }

    const user = await User.create(userPayload);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      healthId: user.patientInfo ? user.patientInfo.healthId : undefined,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        healthId: user.patientInfo ? user.patientInfo.healthId : undefined,
        doctorInfo: user.doctorInfo,
        patientInfo: user.patientInfo,
        pharmacyInfo: user.pharmacyInfo,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

module.exports = router;
