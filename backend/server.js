const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const { initializeDatabase, db } = require('./models/database'); // Assuming db is exported
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const queueRoutes = require('./routes/queue');
const patientRoutes = require('./routes/patients');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Explicitly set host for wider accessibility

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost and replit domains
    if (origin.includes('localhost') ||
        origin.includes('replit.') ||
        origin.includes('repl.co')) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/patients', patientRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Clinic Front Desk API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize DB and start server
// Initialize DB (synchronous)
try {
  initializeDatabase();
  console.log('✅ Database initialized successfully.');

  // Start server
  app.listen(PORT, HOST, () => {
    console.log(`🏥 Clinic API server running on port ${PORT}`);
    console.log(`📊 Health check: http://${HOST}:${PORT}/api/health`);
  });
} catch (err) {
  console.error('❌ Failed to initialize database:', err.message);
  process.exit(1);
}

// The following is a replacement for the server start logic to include default user creation
const bcrypt = require('bcryptjs'); // Require bcryptjs for hashing

// Initialize database
initializeDatabase()
  .then(async () => {
    console.log('✅ Database initialized successfully.');

    // Create default users if they don't exist
    try {
      const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@clinic.com');

      if (!existingAdmin) {
        const adminHash = await bcrypt.hash('admin123', 10);
        const frontdeskHash = await bcrypt.hash('frontdesk123', 10);

        db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run('Admin User', 'admin@clinic.com', adminHash, 'admin');
        db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run('Front Desk User', 'frontdesk@clinic.com', frontdeskHash, 'front_desk');

        console.log('👤 Default users created');
        console.log('   Admin: admin@clinic.com / admin123');
        console.log('   Front Desk: frontdesk@clinic.com / frontdesk123');
      }
    } catch (error) {
      console.error('❌ Failed to create default users:', error);
    }

    app.listen(PORT, HOST, () => {
      console.log(`🏥 Clinic API server running on port ${PORT}`);
      console.log(`📊 Health check: http://${HOST}:${PORT}/api/health`);
    });
  })
  .catch(error => {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  });