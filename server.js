import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

import authRoutes from './routes/authRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Setup __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// ✅ Enhanced Security Middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ✅ Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(apiLimiter);

// ✅ Comprehensive CORS Configuration
const allowedOrigins = [
  'https://khattakbelt.site',
  'https://www.khattakbelt.site',
  'https://khattak-belt.railway.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Auth-Token'
  ],
  exposedHeaders: ['Authorization', 'X-Auth-Token'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight for all routes

// ✅ Database Connection with Retry Logic
const connectDB = async (retries = 5, interval = 5000) => {
  try {
    console.log('Connecting to MongoDB...');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 50,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('✅ MongoDB Connected');
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    if (retries > 0) {
      console.log(`Retrying connection (${retries} left)...`);
      await new Promise(resolve => setTimeout(resolve, interval));
      return connectDB(retries - 1, interval);
    } else {
      process.exit(1);
    }
  }
};

// ✅ Routes
app.use('/auth', authRoutes);
app.use('/news', newsRoutes);
app.use('/users', userRoutes);

// ✅ Enhanced Health Check Endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    status: 'UP',
    database: dbStatus,
    uptime: process.uptime(),
    memory: {
      rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    },
    timestamp: new Date()
  });
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    requestedUrl: req.originalUrl,
    method: req.method
  });
});

// ✅ Enhanced Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', {
    error: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });
  
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;
  
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? {
      message: err.message,
      stack: err.stack
    } : undefined
  });
});

// ✅ Server Startup
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🛡️  CORS allowed for origins: ${allowedOrigins.join(', ')}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n🔴 Shutting down server gracefully...');
    server.close(async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
      process.exit(0);
    });
    
    setTimeout(() => {
      console.error('⚠️ Forcing shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});