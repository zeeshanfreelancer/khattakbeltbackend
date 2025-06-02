// server/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Connection pool size
      socketTimeoutMS: 45000, // Close idle connections
    });
    console.log('✅ MongoDB Atlas Connected');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;