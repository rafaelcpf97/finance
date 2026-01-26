require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const { prometheusMiddleware, metricsHandler } = require('./middleware/prometheus');

const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(prometheusMiddleware);
app.use(logger);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'transaction-service' });
});

// Metrics endpoint
app.get('/metrics', metricsHandler);

// Routes
app.use('/transactions', transactionRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Transaction Service running on port ${PORT}`);
});
