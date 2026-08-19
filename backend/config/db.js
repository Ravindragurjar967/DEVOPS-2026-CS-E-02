const mongoose = require('mongoose');
const dns = require('dns');

// Configure Node.js to use Google Public DNS (8.8.8.8) to resolve MongoDB Atlas SRV records on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('DNS configuration note:', e.message);
}

let isConnected = false;

mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('✅ MongoDB Atlas connection established successfully!');
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️ MongoDB connection lost. Falling back to In-Memory mode.');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.warn('⚠️ MongoDB connection warning:', err.message);
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
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️ MongoDB Atlas Connection Note: ${error.message}`);
    console.warn('👉 Operating in In-Memory Fallback Mode for smooth zero-error performance!');
  }
};

const isDbConnected = () => {
  return isConnected && mongoose.connection.readyState === 1;
};

module.exports = { connectDB, isDbConnected };
