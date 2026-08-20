const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { isDbConnected } = require('../config/db');
const memoryStore = require('../config/memoryStore');

// Knowledge base rules for common health queries
const diseaseKnowledge = [
  {
    keywords: ['fever', 'temperature', 'bukhar', 'hot'],
    disease: 'Viral Fever / Hyperthermia',
    advice: 'Stay hydrated, rest adequately, take paracetamol if prescribed. Avoid cold water baths.',
    precautions: 'Monitor temperature every 4 hours. Seek immediate care if temperature exceeds 102°F.'
  },
  {
    keywords: ['headache', 'head pain', 'sir dard', 'migraine'],
    disease: 'Tension Headache / Dehydration / Stress',
    advice: 'Drink 2 glasses of water, rest in a quiet dark room. Reduce screen time.',
    precautions: 'Consult a doctor if accompanied by blurred vision or neck stiffness.'
  },
  {
    keywords: ['cough', 'cold', 'sore throat', 'khansi', 'gala'],
    disease: 'Upper Respiratory Infection / Common Cold',
    advice: 'Do warm salt-water gargles 3 times a day. Drink warm ginger tea and steam inhalation.',
    precautions: 'Check if you have allergies to penicillin or antibiotics before taking medication.'
  },
  {
    keywords: ['stomach', 'acidity', 'gas', 'indigestion', 'pet dard'],
    disease: 'Gastritis / Dyspepsia',
    advice: 'Eat small non-spicy meals. Avoid oily, fried foods and caffeine.',
    precautions: 'Take prescribed antacids after consulting a doctor.'
  },
  {
    keywords: ['bp', 'blood pressure', 'hypertension'],
    disease: 'Hypertension Management',
    advice: 'Reduce sodium (salt) intake to less than 1 tsp per day. Engage in 30 mins moderate walking.',
    precautions: 'Do not skip your prescribed BP medications.'
  }
];

// @route   POST /api/ai-chatbot/query
// @desc    Personalized Health AI Assistant analyzing query against Patient's medical profile
router.post('/query', protect, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Query message is required' });
    }

    const queryLower = message.toLowerCase();

    // 1. Fetch Patient's personal health background
    let healthId = req.user.healthId || req.user.patientInfo?.healthId;
    let allergies = req.user.patientInfo?.allergies || [];
    let bloodGroup = req.user.patientInfo?.bloodGroup || 'Not specified';
    let prescriptions = [];

    if (isDbConnected()) {
      if (healthId) {
        prescriptions = await Prescription.find({ patientHealthId: healthId }).limit(5);
      }
    } else {
      if (healthId) {
        prescriptions = memoryStore.prescriptions.filter(p => p.patientHealthId === healthId);
      }
    }

    const activeMedicines = prescriptions.flatMap(p => p.medicines?.map(m => m.name) || []);
    const pastDiagnoses = prescriptions.map(p => p.diagnosis);

    // 2. Symptom & Disease Matcher
    let matchedKnowledge = diseaseKnowledge.find(k => 
      k.keywords.some(word => queryLower.includes(word))
    );

    let replyText = '';
    let category = 'General Health Guidance';

    if (matchedKnowledge) {
      category = matchedKnowledge.disease;
      replyText = `Based on your query, this appears related to **${matchedKnowledge.disease}**.\n\n` +
        `💡 **Recommended Care**: ${matchedKnowledge.advice}\n\n` +
        `🛡️ **Precautions**: ${matchedKnowledge.precautions}`;
    } else {
      replyText = `Thank you for sharing. For "${message}", I recommend monitoring your symptoms closely, staying hydrated, and consulting your doctor for a formal diagnosis.`;
    }

    // 3. Add Personalized Warning based on Patient's specific Allergies & Current Medicines
    let allergyAlert = '';
    if (allergies.length > 0) {
      allergyAlert = `\n\n⚠️ **Personal Allergy Alert**: Your medical record shows allergies to [${allergies.join(', ')}]. Always inform your physician before taking new medications.`;
    }

    let rxContext = '';
    if (activeMedicines.length > 0) {
      rxContext = `\n\n💊 **Active Prescriptions Summary**: You currently have ${activeMedicines.length} active medicine(s) prescribed (${activeMedicines.slice(0, 3).join(', ')}).`;
    }

    const finalBotResponse = {
      userQuery: message,
      botResponse: replyText + rxContext + allergyAlert,
      category,
      patientProfile: {
        healthId,
        allergies,
        bloodGroup,
        activeMedicineCount: activeMedicines.length,
        recentDiagnoses: pastDiagnoses.slice(0, 2)
      },
      timestamp: new Date()
    };

    res.json(finalBotResponse);
  } catch (error) {
    console.error('AI Chatbot error:', error);
    res.status(500).json({ message: 'Error processing AI query' });
  }
});

module.exports = router;




// who goi data api



// services/whoGhoService.js
// const axios = require('axios');

// const BASE_URL = 'https://ghoapi.azureedge.net/api';

// class WhoGhoService {
  
//   // Sab indicators ki list le aao
//   async getIndicators() {
//     const res = await axios.get(`${BASE_URL}/Indicator`);
//     return res.data.value; // Array of {IndicatorCode, IndicatorName}
//   }

//   // Kisi specific indicator ka data
//   async getIndicatorData(indicatorCode, filters = {}) {
//     let url = `${BASE_URL}/${indicatorCode}`;
    
//     // OData filter banayein
//     const filterParts = [];
//     if (filters.country) filterParts.push(`SpatialDim eq '${filters.country}'`);
//     if (filters.year) filterParts.push(`TimeDim eq ${filters.year}`);
//     if (filters.sex) filterParts.push(`Dim1 eq '${filters.sex}'`); // MLE/FMLE/BTSX
    
//     if (filterParts.length > 0) {
//       url += `?$filter=${filterParts.join(' and ')}`;
//     }
    
//     const res = await axios.get(url);
//     return res.data.value;
//   }

//   // Popular health data fetch karo
//   async getLifeExpectancy(countryCode = 'IND', year = 2019) {
//     // WHOSIS_000001 = Life expectancy at birth
//     return this.getIndicatorData('WHOSIS_000001', { country: countryCode, year });
//   }

//   async getMalariaDeaths(countryCode = 'IND', year = 2020) {
//     // Malaria deaths
//     return this.getIndicatorData('MALARIA_EST_DEATHS', { country: countryCode, year });
//   }

//   async getCovidData(countryCode = 'IND') {
//     // COVID-19 related (check latest indicator codes)
//     return this.getIndicatorData('WHS3_62', { country: countryCode });
//   }
// }

// module.exports = new WhoGhoService(); 




// //   goi route data



// // routes/healthRoutes.js
// // const express = require('express');
// const router = express.Router();
// const whoService = require('../services/whoGhoService');

// // GET /api/health/life-expectancy?country=IND&year=2019
// router.get('/life-expectancy', async (req, res) => {
//   try {
//     const { country = 'IND', year = 2019 } = req.query;
//     const data = await whoService.getLifeExpectancy(country, parseInt(year));
    
//     // Chatbot-friendly response
//     const latest = data[0];
//     res.json({
//       success: true,
//       message: `${latest.SpatialDim} mein ${latest.TimeDim} ka life expectancy: ${latest.NumericValue} saal`,
//       data: latest
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // GET /api/health/indicator/:code
// router.get('/indicator/:code', async (req, res) => {
//   try {
//     const { code } = req.params;
//     const { country, year } = req.query;
//     const data = await whoService.getIndicatorData(code, { country, year });
//     res.json({ success: true, count: data.length, data });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // GET /api/health/indicators (search indicators)
// router.get('/indicators', async (req, res) => {
//   try {
//     const { search } = req.query;
//     const all = await whoService.getIndicators();
    
//     const filtered = search 
//       ? all.filter(i => i.IndicatorName.toLowerCase().includes(search.toLowerCase()))
//       : all.slice(0, 50); // Pehle 50
    
//     res.json({ success: true, count: filtered.length, indicators: filtered });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // module.exports = router;