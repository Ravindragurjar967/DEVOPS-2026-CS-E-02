const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

dotenv.config();

const app = express();

// Connect to MongoDB (with automatic fast fallback & DNS fix)
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/ai-chatbot', require('./routes/aiChatbot'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/diagnosis', require('./routes/diagnosis'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'E-Prescription Universal Platform Backend',
    timestamp: new Date()
  });
});

app.get('/', (req, res) => {
  res.send('E-Prescription Backend API is running smoothly.');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});