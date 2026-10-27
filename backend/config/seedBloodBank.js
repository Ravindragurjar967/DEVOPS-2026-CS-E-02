const BloodDonor = require('../models/BloodDonor');
const BloodRequest = require('../models/BloodRequest');
const memoryStore = require('./memoryStore');

const defaultDonorsList = [
  {
    donorName: 'Vikram Choudhary',
    patientHealthId: 'HID-2026-9102',
    bloodGroup: 'O+',
    age: 28,
    gender: 'Male',
    phone: '+91 98290 12345',
    email: 'vikram.donor@gmail.com',
    city: 'Jaipur',
    state: 'Rajasthan',
    address: 'Mansarovar, Jaipur',
    lastDonationDate: new Date('2026-06-15'),
    isAvailable: true,
    medicalCertificateUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60',
    eligibilityQuestions: {
      weightAbove50Kg: true,
      noTattoosPast6Months: true,
      noMajorSurgeryPast1Year: true,
      notOnBloodThinners: true
    },
    verificationStatus: 'verified',
    verifiedByName: 'Dr. Rahul Sharma',
    verifiedAt: new Date('2026-07-01'),
    doctorNotes: 'Clinically tested and verified fit for whole blood donation. Hemoglobin 14.8 g/dL.'
  },
  {
    donorName: 'Priya Sharma',
    patientHealthId: 'HID-2026-4431',
    bloodGroup: 'B+',
    age: 24,
    gender: 'Female',
    phone: '+91 98765 99881',
    email: 'priya.sharma99@gmail.com',
    city: 'Jaipur',
    state: 'Rajasthan',
    address: 'Malviya Nagar, Jaipur',
    lastDonationDate: new Date('2026-04-10'),
    isAvailable: true,
    medicalCertificateUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=60',
    eligibilityQuestions: {
      weightAbove50Kg: true,
      noTattoosPast6Months: true,
      noMajorSurgeryPast1Year: true,
      notOnBloodThinners: true
    },
    verificationStatus: 'verified',
    verifiedByName: 'Dr. Rahul Sharma',
    verifiedAt: new Date('2026-05-02'),
    doctorNotes: 'Fitness certificate approved. Regular voluntary donor.'
  },
  {
    donorName: 'Rohan Joshi',
    patientHealthId: 'HID-2026-3391',
    bloodGroup: 'O-',
    age: 32,
    gender: 'Male',
    phone: '+91 97850 33441',
    email: 'rohan.joshi@gmail.com',
    city: 'Jaipur',
    state: 'Rajasthan',
    address: 'C-Scheme, Jaipur',
    lastDonationDate: new Date('2026-03-20'),
    isAvailable: true,
    medicalCertificateUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=60',
    eligibilityQuestions: {
      weightAbove50Kg: true,
      noTattoosPast6Months: true,
      noMajorSurgeryPast1Year: true,
      notOnBloodThinners: true
    },
    verificationStatus: 'verified',
    verifiedByName: 'Dr. Rahul Sharma',
    verifiedAt: new Date('2026-04-05'),
    doctorNotes: 'Universal O-Negative donor verified with clear clinical lab screening.'
  },
  {
    donorName: 'Rahul Verma',
    patientHealthId: 'HID-2026-1182',
    bloodGroup: 'A+',
    age: 30,
    gender: 'Male',
    phone: '+91 94140 55667',
    email: 'rahul.verma@outlook.com',
    city: 'Jaipur',
    state: 'Rajasthan',
    address: 'Vaishali Nagar, Jaipur',
    lastDonationDate: new Date('2026-05-12'),
    isAvailable: true,
    medicalCertificateUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=60',
    eligibilityQuestions: {
      weightAbove50Kg: true,
      noTattoosPast6Months: true,
      noMajorSurgeryPast1Year: true,
      notOnBloodThinners: true
    },
    verificationStatus: 'verified',
    verifiedByName: 'Dr. Rahul Sharma',
    verifiedAt: new Date('2026-05-25'),
    doctorNotes: 'Clinically certified. Hemoglobin level 15.1 g/dL.'
  },
  {
    donorName: 'Anjali Mehta',
    patientHealthId: 'HID-2026-7842',
    bloodGroup: 'AB+',
    age: 26,
    gender: 'Female',
    phone: '+91 98281 44556',
    email: 'anjali.mehta@gmail.com',
    city: 'Jaipur',
    state: 'Rajasthan',
    address: 'Raja Park, Jaipur',
    lastDonationDate: new Date('2026-02-18'),
    isAvailable: true,
    medicalCertificateUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60',
    eligibilityQuestions: {
      weightAbove50Kg: true,
      noTattoosPast6Months: true,
      noMajorSurgeryPast1Year: true,
      notOnBloodThinners: true
    },
    verificationStatus: 'verified',
    verifiedByName: 'Dr. Rahul Sharma',
    verifiedAt: new Date('2026-03-01'),
    doctorNotes: 'Universal recipient AB+ donor certified for whole blood and plasma donation.'
  },
  {
    donorName: 'Kavita Singh',
    patientHealthId: 'HID-2026-2219',
    bloodGroup: 'A-',
    age: 27,
    gender: 'Female',
    phone: '+91 99299 88772',
    email: 'kavita.singh@gmail.com',
    city: 'Jaipur',
    state: 'Rajasthan',
    address: 'Tonk Road, Jaipur',
    lastDonationDate: new Date('2026-01-14'),
    isAvailable: true,
    medicalCertificateUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=60',
    eligibilityQuestions: {
      weightAbove50Kg: true,
      noTattoosPast6Months: true,
      noMajorSurgeryPast1Year: true,
      notOnBloodThinners: true
    },
    verificationStatus: 'verified',
    verifiedByName: 'Dr. Rahul Sharma',
    verifiedAt: new Date('2026-02-01'),
    doctorNotes: 'Rare A-Negative donor fitness certified.'
  },
  {
    donorName: 'Deepak Gurjar',
    patientHealthId: 'HID-2026-6651',
    bloodGroup: 'B-',
    age: 29,
    gender: 'Male',
    phone: '+91 98295 66778',
    email: 'deepak.gurjar@gmail.com',
    city: 'Jaipur',
    state: 'Rajasthan',
    address: 'Vidhyadhar Nagar, Jaipur',
    lastDonationDate: new Date('2026-05-08'),
    isAvailable: true,
    medicalCertificateUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=60',
    eligibilityQuestions: {
      weightAbove50Kg: true,
      noTattoosPast6Months: true,
      noMajorSurgeryPast1Year: true,
      notOnBloodThinners: true
    },
    verificationStatus: 'verified',
    verifiedByName: 'Dr. Rahul Sharma',
    verifiedAt: new Date('2026-05-20'),
    doctorNotes: 'Verified fit for voluntary donation. Excellent vitals.'
  },
  {
    donorName: 'Sunil Rathore',
    patientHealthId: 'HID-2026-9932',
    bloodGroup: 'AB-',
    age: 35,
    gender: 'Male',
    phone: '+91 94142 11223',
    email: 'sunil.rathore@outlook.com',
    city: 'Jaipur',
    state: 'Rajasthan',
    address: 'Ajmer Road, Jaipur',
    lastDonationDate: null,
    isAvailable: true,
    medicalCertificateUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60',
    eligibilityQuestions: {
      weightAbove50Kg: true,
      noTattoosPast6Months: true,
      noMajorSurgeryPast1Year: true,
      notOnBloodThinners: true
    },
    verificationStatus: 'verified',
    verifiedByName: 'Dr. Rahul Sharma',
    verifiedAt: new Date('2026-06-10'),
    doctorNotes: 'Extremely rare AB-Negative blood donor registered & certified.'
  },
  // Pending donor for doctor verification audit testing
  {
    donorName: 'Suresh Meena',
    patientHealthId: 'HID-2026-8812',
    bloodGroup: 'O+',
    age: 23,
    gender: 'Male',
    phone: '+91 97821 99001',
    email: 'suresh.meena@gmail.com',
    city: 'Jaipur',
    state: 'Rajasthan',
    address: 'Jagatpura, Jaipur',
    lastDonationDate: null,
    isAvailable: true,
    medicalCertificateUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60',
    eligibilityQuestions: {
      weightAbove50Kg: true,
      noTattoosPast6Months: true,
      noMajorSurgeryPast1Year: true,
      notOnBloodThinners: true
    },
    verificationStatus: 'pending',
    verifiedByName: '',
    verifiedAt: null,
    doctorNotes: 'Awaiting clinical review and medical certificate audit.'
  }
];

const defaultRequestsList = [
  {
    requestId: 'BLD-REQ-2026-1001',
    patientName: 'Sunita Devi',
    patientHealthId: 'HID-2026-5521',
    requestedByName: 'Amit Kumar',
    bloodGroup: 'O+',
    unitsNeeded: 2,
    urgency: 'critical',
    hospitalName: 'SMS Hospital & Medical College',
    hospitalCity: 'Jaipur',
    hospitalAddress: 'Emergency Ward Bed 14, SMS Hospital, Jaipur',
    contactPhone: '+91 91234 56789',
    reasonForBlood: 'Emergency cardiac surgery scheduled tomorrow morning',
    doctorPrescriptionUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=60',
    additionalDocsUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60',
    verificationStatus: 'verified',
    verifiedByName: 'Dr. Rahul Sharma',
    verifiedAt: new Date(),
    doctorNotes: 'Prescription slip verified from SMS Hospital Cardio Dept. Genuine emergency case.',
    status: 'open'
  },
  {
    requestId: 'BLD-REQ-2026-1002',
    patientName: 'Mohan Lal Sharma',
    patientHealthId: 'HID-2026-8841',
    requestedByName: 'Rajesh Sharma',
    bloodGroup: 'B-',
    unitsNeeded: 1,
    urgency: 'urgent',
    hospitalName: 'Fortis Escorts Hospital',
    hospitalCity: 'Jaipur',
    hospitalAddress: 'Jawahar Lal Nehru Marg, Jaipur',
    contactPhone: '+91 98290 88776',
    reasonForBlood: 'Low platelet count & severe dengue treatment',
    doctorPrescriptionUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=60',
    additionalDocsUrl: '',
    verificationStatus: 'verified',
    verifiedByName: 'Dr. Rahul Sharma',
    verifiedAt: new Date(),
    doctorNotes: 'Clinical requisition verified by Dr. Rahul Sharma. Urgent B-Negative requirement.',
    status: 'open'
  },
  {
    requestId: 'BLD-REQ-2026-1003',
    patientName: 'Aarav Gupta (Child)',
    patientHealthId: 'HID-2026-4412',
    requestedByName: 'Manoj Gupta',
    bloodGroup: 'A+',
    unitsNeeded: 2,
    urgency: 'critical',
    hospitalName: 'Narayana Multispeciality Hospital',
    hospitalCity: 'Jaipur',
    hospitalAddress: 'Kumbha Marg, Sector 5, Pratap Nagar, Jaipur',
    contactPhone: '+91 98760 12345',
    reasonForBlood: 'Thalassemia major routine blood transfusion',
    doctorPrescriptionUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60',
    additionalDocsUrl: '',
    verificationStatus: 'verified',
    verifiedByName: 'Dr. Rahul Sharma',
    verifiedAt: new Date(),
    doctorNotes: 'Thalassemia pediatric patient prescription verified.',
    status: 'open'
  },
  // Pending request for Doctor verification audit testing
  {
    requestId: 'BLD-REQ-2026-1004',
    patientName: 'Kamla Bai',
    patientHealthId: 'HID-2026-7731',
    requestedByName: 'Rameshwar',
    bloodGroup: 'AB-',
    unitsNeeded: 1,
    urgency: 'urgent',
    hospitalName: 'Apex Hospital',
    hospitalCity: 'Jaipur',
    hospitalAddress: 'Malviya Nagar, Jaipur',
    contactPhone: '+91 94145 66778',
    reasonForBlood: 'Orthopedic hip replacement surgery',
    doctorPrescriptionUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=60',
    additionalDocsUrl: '',
    verificationStatus: 'pending',
    verifiedByName: '',
    verifiedAt: null,
    doctorNotes: 'Awaiting doctor clinical review of orthopedic prescription slip.',
    status: 'open'
  }
];

const seedBloodBankData = async () => {
  try {
    const verifiedDonorsCount = await BloodDonor.countDocuments({ verificationStatus: 'verified' });
    if (verifiedDonorsCount < 3) {
      console.log('🩸 Seeding dummy verified blood donors into MongoDB Atlas...');
      for (const donor of defaultDonorsList) {
        const exists = await BloodDonor.findOne({ patientHealthId: donor.patientHealthId });
        if (!exists) {
          await BloodDonor.create(donor);
        }
      }
      console.log('✅ Dummy Blood Donors successfully seeded in MongoDB Atlas!');
    }

    const verifiedRequestsCount = await BloodRequest.countDocuments({ verificationStatus: 'verified' });
    if (verifiedRequestsCount < 2) {
      console.log('🩸 Seeding dummy blood requests into MongoDB Atlas...');
      for (const req of defaultRequestsList) {
        try {
          const exists = await BloodRequest.findOne({ requestId: req.requestId });
          if (!exists) {
            await BloodRequest.create(req);
          }
        } catch (e) {
          // ignore duplicate
        }
      }
      console.log('✅ Dummy Blood Requests successfully seeded in MongoDB Atlas!');
    }
  } catch (err) {
    console.warn('Note: Blood Bank auto-seeding:', err.message);
  }
};

module.exports = {
  seedBloodBankData,
  defaultDonorsList,
  defaultRequestsList
};
