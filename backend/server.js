const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { register, metricsMiddleware } = require('./config/metrics');

dotenv.config();

const app = express();

// Connect to MongoDB (with automatic fast fallback & DNS fix)
connectDB();

// Middleware
app.use(cors());
app.use(metricsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Prometheus Metrics Endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/ai-chatbot', require('./routes/aiChatbot'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/diagnosis', require('./routes/diagnosis'));
app.use('/api/blood-bank', require('./routes/bloodBank'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'E-Prescription Universal Platform Backend',
    timestamp: new Date()
  });
});

// Static frontend serving in production
const path = require('path');
const fs = require('fs');
const frontendDistPath = path.join(__dirname, '../frontend/dist');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('E-Prescription Backend API is running smoothly.');
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});