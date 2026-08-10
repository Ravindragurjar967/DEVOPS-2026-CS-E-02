const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.Mixed, ref: 'User', required: true },
  patientHealthId: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, enum: ['Blood Test', 'X-Ray', 'MRI/CT', 'ECG', 'Pathology', 'General'], default: 'General' },
  reportDate: { type: Date, default: Date.now },
  uploadedBy: { type: mongoose.Schema.Types.Mixed, ref: 'User' }, // Doctor, Patient, or Admin
  labName: { type: String, default: '' },
  summary: { type: String, default: '' },
  results: [
    {
      testName: String,
      resultValue: String,
      normalRange: String,
      unit: String,
      isAbnormal: Boolean
    }
  ],
  fileUrl: { type: String, default: '' } // Base64 or URL
}, { timestamps: true });

module.exports = mongoose.model('MedicalReport', medicalReportSchema);
