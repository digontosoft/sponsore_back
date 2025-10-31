const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/sponsors', require('./routes/sponsorRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/progress-reports', require('./routes/progressReportRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Swagger documentation endpoint
const swaggerDocument = require('./swagger.json');
const swaggerUi = require('swagger-ui-express');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Sponsorship Portal API',
    documentation: '/api-docs'
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
