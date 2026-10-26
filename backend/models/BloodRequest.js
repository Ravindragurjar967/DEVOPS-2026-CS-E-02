const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  patientHealthId: {
    type: String,
    default: 'HID-GUEST',
    trim: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  requestedByName: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  unitsNeeded: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  urgency: {
    type: String,
    enum: ['normal', 'urgent', 'critical'],
    default: 'urgent'
  },
  hospitalName: {
    type: String,
    required: true,
    trim: true
  },
  hospitalCity: {
    type: String,
    required: true,
    trim: true
  },
  hospitalAddress: {
    type: String,
    default: '',
    trim: true
  },
  contactPhone: {
    type: String,
    required: true,
    trim: true
  },
  reasonForBlood: {
    type: String,
    default: 'Surgical / Emergency Medical Need',
    trim: true
  },
  doctorPrescriptionUrl: {
    type: String,
    required: true // Doctor receipt / requisition slip proof
  },
  additionalDocsUrl: {
    type: String,
    default: ''
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending' // Doctor must review & certify
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
  },
  status: {
    type: String,
    enum: ['open', 'fulfilled', 'cancelled'],
    default: 'open'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
