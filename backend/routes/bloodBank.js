const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const BloodDonor = require('../models/BloodDonor');
const BloodRequest = require('../models/BloodRequest');
const { protect, authorize } = require('../middleware/auth');
const { isDbConnected } = require('../config/db');
const memoryStore = require('../config/memoryStore');

const generateRequestId = () => {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BLD-REQ-${new Date().getFullYear()}-${rand}`;
};

// ==========================================
// 1. DONOR REGISTRATION & PROFILE ENDPOINTS
// ==========================================

// @route   POST /api/blood-bank/donors/register
// @desc    Register as a blood donor with optional medical fitness certificate
router.post('/donors/register', protect, async (req, res) => {
  try {
    const {
      donorName,
      patientHealthId,
      bloodGroup,
      age,
      gender,
      phone,
      email,
      city,
      state,
      address,
      lastDonationDate,
      medicalCertificateUrl,
      eligibilityQuestions
    } = req.body;

    if (!donorName || !bloodGroup || !phone || !city) {
      return res.status(400).json({ message: 'Name, Blood Group, Phone, and City are required' });
    }

    const payload = {
      donorName: donorName || req.user.name,
      patientHealthId: patientHealthId || req.user.healthId || `HID-${new Date().getFullYear()}-0001`,
      userId: req.user._id,
      bloodGroup,
      age: Number(age) || 25,
      gender: gender || 'Male',
      phone: phone || req.user.phone,
      email: email || req.user.email,
      city,
      state: state || 'Rajasthan',
      address: address || '',
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
      isAvailable: true,
      medicalCertificateUrl: medicalCertificateUrl || '',
      eligibilityQuestions: eligibilityQuestions || {
        weightAbove50Kg: true,
        noTattoosPast6Months: true,
        noMajorSurgeryPast1Year: true,
        notOnBloodThinners: true
      },
      verificationStatus: 'pending',
      doctorNotes: 'Awaiting clinical review and medical certificate audit.'
    };

    if (isDbConnected()) {
      // Check if user is already registered as donor
      const existing = await BloodDonor.findOne({ userId: req.user._id });
      if (existing) {
        Object.assign(existing, payload);
        existing.verificationStatus = 'pending';
        await existing.save();
        return res.status(200).json({ message: 'Donor profile updated and queued for doctor verification', donor: existing });
      }
      const donor = await BloodDonor.create(payload);
      return res.status(201).json({ message: 'Blood Donor registration successful! Queued for doctor verification', donor });
    } else {
      const idx = memoryStore.bloodDonors.findIndex(d => d.userId?.toString() === req.user._id.toString());
      if (idx !== -1) {
        memoryStore.bloodDonors[idx] = { ...memoryStore.bloodDonors[idx], ...payload, _id: memoryStore.bloodDonors[idx]._id };
        return res.status(200).json({ message: 'Donor profile updated and queued for doctor verification', donor: memoryStore.bloodDonors[idx] });
      }
      const newDonor = { ...payload, _id: 'donor_' + Date.now(), createdAt: new Date() };
      memoryStore.bloodDonors.unshift(newDonor);
      return res.status(201).json({ message: 'Blood Donor registration successful! Queued for doctor verification', donor: newDonor });
    }
  } catch (err) {
    console.error('Donor registration error:', err);
    res.status(500).json({ message: err.message || 'Server error registering donor' });
  }
});

// @route   GET /api/blood-bank/donors
// @desc    Search verified & available blood donors
router.get('/donors', async (req, res) => {
  try {
    const { bloodGroup, city, search } = req.query;

    if (isDbConnected()) {
      const filter = {
        verificationStatus: 'verified',
        isAvailable: true
      };
      if (bloodGroup && bloodGroup !== 'all') {
        filter.bloodGroup = bloodGroup;
      }
      if (city) {
        filter.city = new RegExp(city, 'i');
      }
      if (search) {
        filter.$or = [
          { donorName: new RegExp(search, 'i') },
          { city: new RegExp(search, 'i') },
          { patientHealthId: new RegExp(search, 'i') }
        ];
      }
      const donors = await BloodDonor.find(filter).sort({ updatedAt: -1 }).limit(50);
      return res.json(donors);
    } else {
      let list = memoryStore.bloodDonors.filter(d => d.verificationStatus === 'verified' && d.isAvailable);
      if (bloodGroup && bloodGroup !== 'all') {
        list = list.filter(d => d.bloodGroup === bloodGroup);
      }
      if (city) {
        list = list.filter(d => d.city.toLowerCase().includes(city.toLowerCase()));
      }
      if (search) {
        const s = search.toLowerCase();
        list = list.filter(d => 
          d.donorName.toLowerCase().includes(s) || 
          d.city.toLowerCase().includes(s) || 
          (d.patientHealthId && d.patientHealthId.toLowerCase().includes(s))
        );
      }
      return res.json(list);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching blood donors' });
  }
});

// @route   GET /api/blood-bank/donors/my
// @desc    Get current user's donor profile
router.get('/donors/my', protect, async (req, res) => {
  try {
    if (isDbConnected()) {
      const donor = await BloodDonor.findOne({ userId: req.user._id });
      return res.json(donor || null);
    } else {
      const donor = memoryStore.bloodDonors.find(d => d.userId?.toString() === req.user._id.toString() || d.phone === req.user.phone);
      return res.json(donor || null);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching donor profile' });
  }
});

// @route   PUT /api/blood-bank/donors/:id/availability
// @desc    Toggle donor availability status
router.put('/donors/:id/availability', protect, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    if (isDbConnected()) {
      const donor = await BloodDonor.findById(req.params.id);
      if (!donor) return res.status(404).json({ message: 'Donor record not found' });
      donor.isAvailable = Boolean(isAvailable);
      await donor.save();
      return res.json({ message: `Availability status set to ${isAvailable ? 'Available' : 'Paused'}`, donor });
    } else {
      const donor = memoryStore.bloodDonors.find(d => d._id.toString() === req.params.id.toString());
      if (!donor) return res.status(404).json({ message: 'Donor record not found' });
      donor.isAvailable = Boolean(isAvailable);
      return res.json({ message: `Availability status set to ${isAvailable ? 'Available' : 'Paused'}`, donor });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error updating availability' });
  }
});


// ==========================================
// 2. RECIPIENT EMERGENCY REQUEST ENDPOINTS
// ==========================================

// @route   POST /api/blood-bank/requests/create
// @desc    Create emergency blood requisition with doctor prescription slip
router.post('/requests/create', protect, async (req, res) => {
  try {
    const {
      patientName,
      patientHealthId,
      bloodGroup,
      unitsNeeded,
      urgency,
      hospitalName,
      hospitalCity,
      hospitalAddress,
      contactPhone,
      reasonForBlood,
      doctorPrescriptionUrl,
      additionalDocsUrl
    } = req.body;

    if (!patientName || !bloodGroup || !hospitalName || !contactPhone || !doctorPrescriptionUrl) {
      return res.status(400).json({
        message: 'Patient Name, Blood Group, Hospital Name, Contact Phone, and Doctor Prescription Proof are required.'
      });
    }

    const requestId = generateRequestId();

    const payload = {
      requestId,
      patientName,
      patientHealthId: patientHealthId || req.user.healthId || 'HID-GUEST',
      requestedBy: req.user._id,
      requestedByName: req.user.name,
      bloodGroup,
      unitsNeeded: Number(unitsNeeded) || 1,
      urgency: urgency || 'urgent',
      hospitalName,
      hospitalCity: hospitalCity || 'Jaipur',
      hospitalAddress: hospitalAddress || '',
      contactPhone: contactPhone || req.user.phone,
      reasonForBlood: reasonForBlood || 'Emergency clinical requirement',
      doctorPrescriptionUrl,
      additionalDocsUrl: additionalDocsUrl || '',
      verificationStatus: 'pending',
      doctorNotes: 'Awaiting attending doctor verification of hospital requisition.',
      status: 'open'
    };

    if (isDbConnected()) {
      const request = await BloodRequest.create(payload);
      return res.status(201).json({ message: 'Blood Request submitted! A doctor will verify the prescription shortly.', request });
    } else {
      const newRequest = { ...payload, _id: 'req_' + Date.now(), createdAt: new Date() };
      memoryStore.bloodRequests.unshift(newRequest);
      return res.status(201).json({ message: 'Blood Request submitted! A doctor will verify the prescription shortly.', request: newRequest });
    }
  } catch (err) {
    console.error('Request creation error:', err);
    res.status(500).json({ message: err.message || 'Server error creating blood request' });
  }
});

// @route   GET /api/blood-bank/requests
// @desc    Get all verified active blood requests (for potential donors)
router.get('/requests', async (req, res) => {
  try {
    const { bloodGroup, urgency } = req.query;

    if (isDbConnected()) {
      const filter = {
        verificationStatus: 'verified',
        status: 'open'
      };
      if (bloodGroup && bloodGroup !== 'all') {
        filter.bloodGroup = bloodGroup;
      }
      if (urgency && urgency !== 'all') {
        filter.urgency = urgency;
      }
      const requests = await BloodRequest.find(filter).sort({ urgency: -1, createdAt: -1 });
      return res.json(requests);
    } else {
      let list = memoryStore.bloodRequests.filter(r => r.verificationStatus === 'verified' && r.status === 'open');
      if (bloodGroup && bloodGroup !== 'all') {
        list = list.filter(r => r.bloodGroup === bloodGroup);
      }
      if (urgency && urgency !== 'all') {
        list = list.filter(r => r.urgency === urgency);
      }
      return res.json(list);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching blood requests' });
  }
});

// @route   GET /api/blood-bank/requests/my
// @desc    Get logged in user's blood requests
router.get('/requests/my', protect, async (req, res) => {
  try {
    if (isDbConnected()) {
      const requests = await BloodRequest.find({ requestedBy: req.user._id }).sort({ createdAt: -1 });
      return res.json(requests);
    } else {
      const requests = memoryStore.bloodRequests.filter(r => r.requestedBy?.toString() === req.user._id.toString());
      return res.json(requests);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user requests' });
  }
});

// @route   PUT /api/blood-bank/requests/:id/status
// @desc    Update request status (fulfilled / cancelled)
router.put('/requests/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (isDbConnected()) {
      const reqDoc = await BloodRequest.findById(req.params.id);
      if (!reqDoc) return res.status(404).json({ message: 'Request not found' });
      reqDoc.status = status;
      await reqDoc.save();
      return res.json({ message: `Request marked as ${status}`, request: reqDoc });
    } else {
      const reqDoc = memoryStore.bloodRequests.find(r => r._id.toString() === req.params.id.toString());
      if (!reqDoc) return res.status(404).json({ message: 'Request not found' });
      reqDoc.status = status;
      return res.json({ message: `Request marked as ${status}`, request: reqDoc });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error updating request status' });
  }
});


// ==========================================
// 3. DOCTOR & ADMIN CLINICAL AUDIT ENDPOINTS
// ==========================================

// @route   GET /api/blood-bank/clinical/pending
// @desc    Get all pending donors and pending blood requests for doctor review
router.get('/clinical/pending', protect, authorize('doctor', 'admin'), async (req, res) => {
  try {
    if (isDbConnected()) {
      const [pendingDonors, pendingRequests] = await Promise.all([
        BloodDonor.find({ verificationStatus: 'pending' }).sort({ createdAt: -1 }),
        BloodRequest.find({ verificationStatus: 'pending' }).sort({ createdAt: -1 })
      ]);
      return res.json({ pendingDonors, pendingRequests });
    } else {
      const pendingDonors = memoryStore.bloodDonors.filter(d => d.verificationStatus === 'pending');
      const pendingRequests = memoryStore.bloodRequests.filter(r => r.verificationStatus === 'pending');
      return res.json({ pendingDonors, pendingRequests });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pending clinical records' });
  }
});

// @route   PUT /api/blood-bank/donors/:id/verify
// @desc    Doctor approves or rejects a blood donor with clinical notes
router.put('/donors/:id/verify', protect, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { status, notes } = req.body; // status: 'verified' | 'rejected'

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be verified or rejected' });
    }

    if (isDbConnected()) {
      const donor = await BloodDonor.findById(req.params.id);
      if (!donor) return res.status(404).json({ message: 'Donor record not found' });
      
      donor.verificationStatus = status;
      donor.verifiedBy = req.user._id;
      donor.verifiedByName = req.user.name;
      donor.verifiedAt = new Date();
      donor.doctorNotes = notes || (status === 'verified' ? 'Medical fitness certificate verified and approved.' : 'Rejected due to clinical contraindications.');
      
      await donor.save();
      return res.json({ message: `Donor successfully ${status}`, donor });
    } else {
      const donor = memoryStore.bloodDonors.find(d => d._id.toString() === req.params.id.toString());
      if (!donor) return res.status(404).json({ message: 'Donor record not found' });
      
      donor.verificationStatus = status;
      donor.verifiedBy = req.user._id;
      donor.verifiedByName = req.user.name;
      donor.verifiedAt = new Date();
      donor.doctorNotes = notes || (status === 'verified' ? 'Medical fitness certificate verified and approved.' : 'Rejected due to clinical contraindications.');
      
      return res.json({ message: `Donor successfully ${status}`, donor });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error verifying donor' });
  }
});

// @route   PUT /api/blood-bank/requests/:id/verify
// @desc    Doctor reviews patient prescription slip and approves/rejects request
router.put('/requests/:id/verify', protect, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { status, notes } = req.body; // status: 'verified' | 'rejected'

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be verified or rejected' });
    }

    if (isDbConnected()) {
      const reqDoc = await BloodRequest.findById(req.params.id);
      if (!reqDoc) return res.status(404).json({ message: 'Blood request not found' });

      reqDoc.verificationStatus = status;
      reqDoc.verifiedBy = req.user._id;
      reqDoc.verifiedByName = req.user.name;
      reqDoc.verifiedAt = new Date();
      reqDoc.doctorNotes = notes || (status === 'verified' ? 'Hospital doctor prescription and requisition slip verified.' : 'Prescription validation failed.');

      await reqDoc.save();
      return res.json({ message: `Blood request successfully ${status}`, request: reqDoc });
    } else {
      const reqDoc = memoryStore.bloodRequests.find(r => r._id.toString() === req.params.id.toString());
      if (!reqDoc) return res.status(404).json({ message: 'Blood request not found' });

      reqDoc.verificationStatus = status;
      reqDoc.verifiedBy = req.user._id;
      reqDoc.verifiedByName = req.user.name;
      reqDoc.verifiedAt = new Date();
      reqDoc.doctorNotes = notes || (status === 'verified' ? 'Hospital doctor prescription and requisition slip verified.' : 'Prescription validation failed.');

      return res.json({ message: `Blood request successfully ${status}`, request: reqDoc });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error verifying blood request' });
  }
});

module.exports = router;
