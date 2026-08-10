const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows DNS querySrv ECONNREFUSED error with MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('DNS server configuration warning:', e.message);
}

let isConnected = false;

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error event:', err.message);
  isConnected = false;
});

const connectDB = async () => {
  try {
    mongoose.set('bufferCommands', false);

    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eprescription';
    console.log(`Connecting to MongoDB Atlas...`);

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      family: 4 // Force IPv4
    });

    isConnected = true;
    console.log(`✅ MongoDB Atlas Connected Successfully! Host: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️ MongoDB Connection Warning: ${error.message}`);
    console.warn('👉 Switching to Hybrid In-Memory Fallback Mode so the portal works smoothly!');
  }
};

const isDbConnected = () => isConnected;

module.exports = { connectDB, isDbConnected };
