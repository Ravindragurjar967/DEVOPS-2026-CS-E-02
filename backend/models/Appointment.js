
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true, unique: true },
  state: { type: String, required: true,         color: '#135faa', },
  district: { type: String, required: true },
  hospitalId: { type: String, required: true },
  hospitalName: { type: String, required: true },
  department: { type: String, required: true },
  scheme: { 
    type: String, 
    required: true, 
    enum: ['RGHS', 'CGHS', 'PAID'] 
  },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctorName: { type: String, required: true },
  doctorSpecialty: { type: String },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  patientName: { type: String },
  patientHealthId: { type: String },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  tokenNumber: { type: Number, required: true },
  reason: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'in_consultation', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

appointmentSchema.index({ hospitalId: 1, date: 1, tokenNumber: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);