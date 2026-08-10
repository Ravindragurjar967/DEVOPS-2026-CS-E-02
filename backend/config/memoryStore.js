const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');

// Pre-seeded Hash for demo password "Password123!"
const defaultPasswordHash = bcrypt.hashSync('Password123!', 10);

const memoryUsers = [
  {
    _id: 'doc_1',
    name: 'Dr. Rahul Sharma',
    email: 'dr.smith@medilink.com',
    password: defaultPasswordHash,
    role: 'doctor',
    phone: '+91 98765 43210',
    doctorInfo: { specialty: 'Cardiologist', hospital: 'City Max Hospital', licenseNumber: 'MCI-884920' },
    createdAt: new Date()
  },
  {
    _id: 'pat_1',
    name: 'Amit Kumar',
    email: 'patient.amit@gmail.com',
    password: defaultPasswordHash,
    role: 'patient',
    phone: '+91 91234 56789',
    patientInfo: { healthId: 'HID-2026-8834', age: 34, gender: 'Male', bloodGroup: 'O+', allergies: ['Penicillin'] },
    createdAt: new Date()
  },
  {
    _id: 'pharm_1',
    name: 'Apollo Pharmacy Staff',
    email: 'pharmacy.apollo@medilink.com',
    password: defaultPasswordHash,
    role: 'pharmacist',
    phone: '+91 99887 76655',
    pharmacyInfo: { pharmacyName: 'Apollo MedPlus Pharmacy', licenseNo: 'PH-33921' },
    createdAt: new Date()
  }
];

const memoryPrescriptions = [
  {
    _id: 'rx_sample_1',
    prescriptionId: 'RX-2026-8839',
    doctor: 'doc_1',
    patient: 'pat_1',
    patientHealthId: 'HID-2026-8834',
    patientName: 'Amit Kumar',
    doctorName: 'Dr. Rahul Sharma',
    doctorSpecialty: 'Cardiologist',
    diagnosis: 'Acute Hypertension & Mild Fever',
    vitals: { bp: '130/85 mmHg', pulse: '76 bpm', weight: '70 kg', temp: '99.1 °F' },
    medicines: [
      { name: 'Amlodipine', dosage: '5mg', frequency: '1-0-0', duration: '30 Days', instructions: 'Take in morning after breakfast' },
      { name: 'Paracetamol', dosage: '650mg', frequency: '1-0-1', duration: '5 Days', instructions: 'Take after meal' }
    ],
    labTestsRecommended: ['Lipid Profile', 'ECG Routine'],
    advice: 'Low salt diet, morning walk 30 mins, drink plenty of water.',
    status: 'active',
    createdAt: new Date()
  }
];

const memoryReports = [
  {
    _id: 'rep_1',
    patient: 'pat_1',
    patientHealthId: 'HID-2026-8834',
    title: 'Complete Blood Count (CBC)',
    category: 'Blood Test',
    labName: 'Central Diagnostics Lab',
    summary: 'Hemoglobin and WBC within normal limits.',
    results: [
      { testName: 'Hemoglobin', resultValue: '14.2 g/dL', normalRange: '13.0 - 17.0', isAbnormal: false },
      { testName: 'Platelet Count', resultValue: '2.5 Lakhs', normalRange: '1.5 - 4.5', isAbnormal: false }
    ],
    reportDate: new Date(),
    createdAt: new Date()
  }
];

module.exports = {
  users: memoryUsers,
  prescriptions: memoryPrescriptions,
  reports: memoryReports
};
