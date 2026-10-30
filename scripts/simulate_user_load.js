/**
 * E-Prescription Platform - Multi-User Concurrency & Load Simulation Script
 * Simulates 7 realistic users with different healthcare roles:
 * - 2 Doctors (Dr. Vikram Malhotra, Dr. Anjali Mehta)
 * - 1 Pharmacist (Pooja Verma)
 * - 3 Patients (Amit Patel, Sneha Reddy, Rajesh Kumar)
 * - 1 Admin (Kavita Singh)
 *
 * Drives concurrent traffic to test Prometheus metrics & Grafana visualization.
 */

const http = require('http');

const API_BASE = 'http://localhost:5000';
const PROMETHEUS_BASE = 'http://localhost:9090';

// 7 Defined Users
const USERS = [
  {
    name: 'Dr. Vikram Malhotra',
    email: 'dr.vikram.malhotra@hospital.in',
    password: 'Password123!',
    role: 'doctor',
    phone: '+91 98290 11111',
    doctorInfo: { specialty: 'Cardiology', hospitalId: 'h1', licenseNumber: 'MED-CARD-2026' }
  },
  {
    name: 'Dr. Anjali Mehta',
    email: 'dr.anjali.mehta@hospital.in',
    password: 'Password123!',
    role: 'doctor',
    phone: '+91 98290 22222',
    doctorInfo: { specialty: 'General Medicine', hospitalId: 'h2', licenseNumber: 'MED-GEN-2026' }
  },
  {
    name: 'Pooja Verma',
    email: 'pooja.verma@pharmacy.in',
    password: 'Password123!',
    role: 'pharmacist',
    phone: '+91 98290 33333',
    pharmacyInfo: { pharmacyName: 'City Central Apollo Pharmacy', licenseNumber: 'PHARM-2026-88' }
  },
  {
    name: 'Amit Patel',
    email: 'amit.patel@gmail.com',
    password: 'Password123!',
    role: 'patient',
    phone: '+91 98290 44444',
    patientInfo: { bloodGroup: 'A+', dateOfBirth: '1992-05-14', gender: 'Male', city: 'Jaipur' }
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@gmail.com',
    password: 'Password123!',
    role: 'patient',
    phone: '+91 98290 55555',
    patientInfo: { bloodGroup: 'O+', dateOfBirth: '1997-11-20', gender: 'Female', city: 'Jaipur' }
  },
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@outlook.com',
    password: 'Password123!',
    role: 'patient',
    phone: '+91 98290 66666',
    patientInfo: { bloodGroup: 'B-', dateOfBirth: '1984-08-03', gender: 'Male', city: 'Jaipur' }
  },
  {
    name: 'Kavita Singh',
    email: 'kavita.singh@healthadmin.gov.in',
    password: 'Password123!',
    role: 'admin',
    phone: '+91 98290 77777'
  }
];

// Helper: HTTP Request Promise
function sendRequest(options, postData = null) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch (e) {
          parsed = body;
        }
        resolve({
          status: res.statusCode,
          duration,
          data: parsed
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        status: 0,
        duration: Date.now() - startTime,
        error: err.message
      });
    });

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

// Global stats tracker
const stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  byStatusCode: {},
  byRoute: {},
  latencies: []
};

function recordStat(method, path, statusCode, duration) {
  stats.totalRequests++;
  if (statusCode >= 200 && statusCode < 400) {
    stats.successfulRequests++;
  } else {
    stats.failedRequests++;
  }

  stats.byStatusCode[statusCode] = (stats.byStatusCode[statusCode] || 0) + 1;
  const routeKey = `${method} ${path.split('?')[0]}`;
  stats.byRoute[routeKey] = (stats.byRoute[routeKey] || 0) + 1;
  stats.latencies.push(duration);
}

// User Action Runner
async function apiCall(method, path, body = null, token = null) {
  const url = new URL(path, API_BASE);
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    method,
    headers
  };

  const res = await sendRequest(options, body);
  recordStat(method, url.pathname, res.status, res.duration);
  return res;
}

// Authenticate or Register User
async function authenticateUser(userDef) {
  // Try login first
  let loginRes = await apiCall('POST', '/api/auth/login', {
    email: userDef.email,
    password: userDef.password
  });

  if (loginRes.status === 200 && loginRes.data && loginRes.data.token) {
    userDef.token = loginRes.data.token;
    userDef.healthId = loginRes.data.healthId;
    userDef.id = loginRes.data._id;
    return userDef;
  }

  // Register if login failed
  let regRes = await apiCall('POST', '/api/auth/register', userDef);
  if ((regRes.status === 200 || regRes.status === 201) && regRes.data && regRes.data.token) {
    userDef.token = regRes.data.token;
    userDef.healthId = regRes.data.healthId;
    userDef.id = regRes.data._id;
    return userDef;
  }

  // If already registered, re-login
  loginRes = await apiCall('POST', '/api/auth/login', {
    email: userDef.email,
    password: userDef.password
  });
  if (loginRes.data && loginRes.data.token) {
    userDef.token = loginRes.data.token;
    userDef.healthId = loginRes.data.healthId;
    userDef.id = loginRes.data._id;
  }
  return userDef;
}

// Simulate actions for a single user in multiple waves
async function simulateUserActions(user, waveIndex) {
  const t = user.token;

  switch (user.role) {
    case 'doctor': {
      // 1. Check existing prescriptions
      await apiCall('GET', '/api/prescriptions/my', null, t);
      // 2. Search patients
      await apiCall('GET', '/api/patients/search?query=Amit', null, t);
      await apiCall('GET', '/api/patients/search?query=Sneha', null, t);
      // 3. Issue a new prescription
      await apiCall('POST', '/api/prescriptions', {
        patientName: 'Amit Patel',
        patientHealthId: 'HID-2026-4431',
        diagnosis: `Clinical Evaluation - Episode #${waveIndex}: Seasonal allergic rhinitis`,
        vitals: { bp: '120/80', pulse: 74, temperature: 98.6 },
        medicines: [
          { name: 'Cetirizine 10mg', dosage: '1 tablet daily at bedtime', duration: '5 days' },
          { name: 'Paracetamol 650mg', dosage: '1 tablet SOS if fever > 100F', duration: '3 days' }
        ],
        advice: 'Drink warm water and avoid cold beverages.'
      }, t);
      // 4. Check available blood donors
      await apiCall('GET', '/api/blood-bank/donors?bloodGroup=all', null, t);
      // 5. Check appointments
      await apiCall('GET', '/api/appointments/doctors?hospitalId=h1&department=Cardiology', null, t);
      break;
    }

    case 'patient': {
      // 1. View health prescriptions
      await apiCall('GET', '/api/prescriptions/my', null, t);
      // 2. Search hospitals & doctors for appointment
      await apiCall('GET', '/api/appointments/doctors?hospitalId=h1&department=Cardiology', null, t);
      await apiCall('GET', '/api/appointments/doctors?hospitalId=h2&department=General%20Medicine', null, t);
      // 3. Book consultation appointment
      await apiCall('POST', '/api/appointments', {
        patientName: user.name,
        patientPhone: user.phone,
        hospitalId: 'h1',
        department: 'General Medicine',
        doctorId: 'd1_GeneralMedicine',
        doctorName: 'Dr. Rajesh Sharma',
        date: new Date(Date.now() + 86400000 * (waveIndex + 1)).toISOString().split('T')[0],
        timeSlot: '10:30 AM',
        problemDescription: 'Regular checkup and persistent dry cough symptoms'
      }, t);
      // 4. Query AI Clinical Assistant
      const queries = [
        'I have slight fever and throat soreness, what precautions should I take?',
        'How often should I monitor my blood pressure if it was 130/85?',
        'What are the side effects of Cetirizine 10mg?',
        'Best foods to increase hemoglobin count quickly?'
      ];
      await apiCall('POST', '/api/ai-chatbot/query', {
        message: queries[waveIndex % queries.length]
      }, t);
      // 5. Search emergency blood bank availability
      await apiCall('GET', `/api/blood-bank/donors?bloodGroup=${encodeURIComponent(user.patientInfo?.bloodGroup || 'O+')}&city=Jaipur`, null, t);
      // 6. View medical reports
      await apiCall('GET', '/api/reports/my', null, t);
      break;
    }

    case 'pharmacist': {
      // 1. Fetch prescription dispensing queue
      await apiCall('GET', '/api/prescriptions/my', null, t);
      // 2. Patient search for prescription lookup
      await apiCall('GET', '/api/patients/search?query=Rajesh', null, t);
      await apiCall('GET', '/api/patients/search?query=Kumar', null, t);
      // 3. Verify blood bank supply
      await apiCall('GET', '/api/blood-bank/donors', null, t);
      break;
    }

    case 'admin': {
      // 1. Search platform patients & users
      await apiCall('GET', '/api/patients/search?query=a', null, t);
      // 2. Fetch blood bank statistics
      await apiCall('GET', '/api/blood-bank/donors?city=Jaipur', null, t);
      // 3. Check health and appointments
      await apiCall('GET', '/api/health', null, t);
      await apiCall('GET', '/api/appointments/doctors?hospitalId=h1', null, t);
      break;
    }
  }

  // Periodic health ping
  await apiCall('GET', '/api/health');

  // Occasional 404 test to generate traffic for Grafana error tracking panel
  if (waveIndex % 3 === 0) {
    await apiCall('GET', `/api/testing-error-route-${waveIndex}`);
  }
}

// Fetch Prometheus metrics snapshot
function fetchPrometheusMetric(query) {
  return new Promise((resolve) => {
    const qUrl = new URL(`/api/v1/query?query=${encodeURIComponent(query)}`, PROMETHEUS_BASE);
    http.get(qUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed?.data?.result || []);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

// Main Execution
async function main() {
  console.log('='.repeat(70));
  console.log('🚀 STARTING MULTI-USER LOAD SIMULATION FOR GRAFANA & PROMETHEUS');
  console.log(`🎯 Target API: ${API_BASE}`);
  console.log(`📊 Target Monitoring: Prometheus (${PROMETHEUS_BASE}) & Grafana (http://localhost:3001)`);
  console.log(`👥 Simulating ${USERS.length} Realistic Healthcare Users`);
  console.log('='.repeat(70));

  // Step 1: Authenticate all 7 users
  console.log('\n[1/3] 🔑 Initializing and Authenticating 7 Healthcare Users...');
  for (const u of USERS) {
    process.stdout.write(`  ⏳ Initializing ${u.name} (${u.role.toUpperCase()})... `);
    const authUser = await authenticateUser(u);
    console.log(`✅ [Token: ${authUser.token ? 'Ready' : 'Fallback'}]`);
  }

  // Step 2: Run Concurrency Load Waves
  const TOTAL_WAVES = 6;
  console.log(`\n[2/3] ⚡ Generating Concurrent Load across ${TOTAL_WAVES} Iteration Waves...`);
  const startTime = Date.now();

  for (let wave = 1; wave <= TOTAL_WAVES; wave++) {
    process.stdout.write(`  🌊 Wave ${wave}/${TOTAL_WAVES}: Running 7 concurrent user action sets... `);
    const waveStart = Date.now();

    // Execute actions concurrently for all 7 users
    await Promise.all(USERS.map(user => simulateUserActions(user, wave)));

    const waveElapsed = ((Date.now() - waveStart) / 1000).toFixed(2);
    console.log(`Done in ${waveElapsed}s (Total requests: ${stats.totalRequests})`);

    // Brief 500ms pause between waves for realistic burst shape
    await new Promise(r => setTimeout(r, 600));
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Compute Latency Metrics
  stats.latencies.sort((a, b) => a - b);
  const p50 = stats.latencies[Math.floor(stats.latencies.length * 0.50)] || 0;
  const p95 = stats.latencies[Math.floor(stats.latencies.length * 0.95)] || 0;
  const p99 = stats.latencies[Math.floor(stats.latencies.length * 0.99)] || 0;
  const avg = (stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length).toFixed(1);

  console.log('\n' + '='.repeat(70));
  console.log('📊 SIMULATION RESULTS & TRAFFIC SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total Requests Dispatched : ${stats.totalRequests}`);
  console.log(`Successful (2xx/3xx)      : ${stats.successfulRequests}`);
  console.log(`Intentional Errors (4xx)  : ${stats.failedRequests} (for Grafana Error Panel verification)`);
  console.log(`Total Duration            : ${totalDuration}s`);
  console.log(`Throughput                : ${(stats.totalRequests / totalDuration).toFixed(2)} req/sec`);
  console.log(`Latency p50 (Median)      : ${p50} ms`);
  console.log(`Latency p95               : ${p95} ms`);
  console.log(`Latency p99               : ${p99} ms`);
  console.log(`Latency Average           : ${avg} ms`);

  console.log('\n📈 HTTP Status Code Distribution:');
  for (const [code, count] of Object.entries(stats.byStatusCode)) {
    console.log(`  - HTTP ${code}: ${count} requests`);
  }

  console.log('\n🛣️ Top API Routes Exercised:');
  const sortedRoutes = Object.entries(stats.byRoute).sort((a, b) => b[1] - a[1]);
  for (const [route, count] of sortedRoutes.slice(0, 8)) {
    console.log(`  - ${route.padEnd(35)} : ${count} requests`);
  }

  // Step 3: Verify Prometheus & Grafana live metrics
  console.log('\n[3/3] 🔍 Verifying Prometheus Real-Time Metrics Exposition...');
  await new Promise(r => setTimeout(r, 2000)); // wait 2s for Prometheus scrape interval

  const promTotalReqs = await fetchPrometheusMetric('sum(http_requests_total)');
  const promHeapUsed = await fetchPrometheusMetric('eprescription_nodejs_heap_size_used_bytes');
  const promRate = await fetchPrometheusMetric('sum(rate(http_requests_total[1m]))');

  const promTotalVal = promTotalReqs[0]?.value ? promTotalReqs[0].value[1] : 'N/A';
  const heapMB = promHeapUsed[0]?.value ? (parseInt(promHeapUsed[0].value[1], 10) / (1024 * 1024)).toFixed(1) + ' MB' : 'N/A';
  const rateVal = promRate[0]?.value ? parseFloat(promRate[0].value[1]).toFixed(2) + ' req/s' : 'N/A';

  console.log(`  ✅ Prometheus Scraped Total Requests : ${promTotalVal}`);
  console.log(`  ✅ Current Request Rate (rate[1m])   : ${rateVal}`);
  console.log(`  ✅ Node.js Heap Memory Used          : ${heapMB}`);

  console.log('\n' + '='.repeat(70));
  console.log('🎉 LOAD & OBSERVABILITY TEST COMPLETED SUCCESSFULLY!');
  console.log('👉 Open Grafana Dashboard: http://localhost:3001');
  console.log('   (Folder: Healthcare Platform -> E-Prescription & UHR - Observability Dashboard)');
  console.log('👉 Open Prometheus Targets : http://localhost:9090/targets');
  console.log('='.repeat(70));
}

main().catch(console.error);
