const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true }, // e.g. "500mg"
  frequency: { type: String, required: true }, // e.g. "1-0-1" or "Twice daily after meal"
  duration: { type: String, required: true }, // e.g. "5 Days"
  instructions: { type: String, default: '' } // e.g. "Take after food"
});

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: { type: String, required: true, unique: true },
  doctor: { type: mongoose.Schema.Types.Mixed, ref: 'User', required: true }, // Mixed to accept both ObjectId & Custom String IDs
  patient: { type: mongoose.Schema.Types.Mixed, ref: 'User', required: true }, // Mixed to accept both ObjectId & Custom String IDs
  patientHealthId: { type: String, required: true },
  patientName: { type: String, required: true },
  doctorName: { type: String, required: true },
  doctorSpecialty: { type: String, default: 'General Physician' },
  diagnosis: { type: String, required: true },
  vitals: {
    bp: { type: String, default: '' },
    pulse: { type: String, default: '' },
    weight: { type: String, default: '' },
    temp: { type: String, default: '' }
  },
  medicines: [medicineSchema],
  labTestsRecommended: [{ type: String }],
  advice: { type: String, default: '' },
  qrCodeData: { type: String }, // Base64 or JSON payload for verification
  status: { 
    type: String, 
    enum: ['active', 'dispensed', 'cancelled'], 
    default: 'active' 
  },
  dispensedBy: { type: mongoose.Schema.Types.Mixed, ref: 'User' },
  dispensedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
