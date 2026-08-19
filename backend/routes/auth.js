const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { isDbConnected } = require('../config/db');
const memoryStore = require('../config/memoryStore');

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
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, doctorInfo, patientInfo, pharmacyInfo } = req.body;

    if (isDbConnected()) {
      try {
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
          userPayload.patientInfo = {
            ...(patientInfo || {}),
            healthId: generateHealthId()
          };
        }

        const user = await User.create(userPayload);

        return res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          healthId: user.patientInfo ? user.patientInfo.healthId : undefined,
          token: generateToken(user._id)
        });
      } catch (dbErr) {
        console.warn('DB register error, using fallback:', dbErr.message);
      }
    }

    // In-Memory Fallback
    const existing = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newId = 'user_' + Date.now();
    const healthId = role === 'patient' ? generateHealthId() : undefined;

    const newUser = {
      _id: newId,
      name,
      email,
      password: hashedPassword,
      role: role || 'patient',
      phone: phone || '',
      doctorInfo: role === 'doctor' ? (doctorInfo || {}) : undefined,
      patientInfo: role === 'patient' ? { ...(patientInfo || {}), healthId, doctorConsentGranted: true } : undefined,
      pharmacyInfo: role === 'pharmacist' ? (pharmacyInfo || {}) : undefined,
      createdAt: new Date()
    };

    memoryStore.users.push(newUser);

    return res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      healthId,
      token: generateToken(newUser._id)
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (isDbConnected()) {
      try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
          return res.json({
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
        }
      } catch (dbErr) {
        console.warn('DB login error, trying fallback:', dbErr.message);
      }
    }

    // In-Memory Fallback Check
    const user = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return res.json({
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
      }
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

module.exports = router;
