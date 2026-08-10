const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['doctor', 'patient', 'pharmacist', 'admin'], 
    default: 'patient' 
  },
  phone: { type: String, default: '' },
  // Role specific extra metadata
  doctorInfo: {
    licenseNumber: { type: String, default: '' },
    specialty: { type: String, default: '' },
    hospital: { type: String, default: '' }
  },
  patientInfo: {
    healthId: { type: String, unique: true, sparse: true },
    age: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''] },
    bloodGroup: { type: String, default: '' },
    allergies: [{ type: String }],
    medicalHistory: [{ type: String }]
  },
  pharmacyInfo: {
    pharmacyName: { type: String, default: '' },
    licenseNo: { type: String, default: '' },
    address: { type: String, default: '' }
  }
}, { timestamps: true });


userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});







// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });








userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
