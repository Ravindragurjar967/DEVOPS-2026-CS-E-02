const mongoose = require('mongoose');

const bloodDonorSchema = new mongoose.Schema({
  donorName: {
    type: String,
    required: true,
    trim: true
  },
  patientHealthId: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 65
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Male'
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    default: 'Rajasthan',
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  lastDonationDate: {
    type: Date
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  medicalCertificateUrl: {
    type: String,
    default: ''
  },
  eligibilityQuestions: {
    weightAbove50Kg: { type: Boolean, default: true },
    noTattoosPast6Months: { type: Boolean, default: true },
    noMajorSurgeryPast1Year: { type: Boolean, default: true },
    notOnBloodThinners: { type: Boolean, default: true }
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedByName: {
    type: String,
    default: ''
  },
  verifiedAt: {
    type: Date
  },
  doctorNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BloodDonor', bloodDonorSchema);
