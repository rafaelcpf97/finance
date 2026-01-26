require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const { prometheusMiddleware, metricsHandler } = require('./middleware/prometheus');

const walletRoutes = require('./routes/walletRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(prometheusMiddleware);
app.use(logger);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'wallet-service' });
});

// Metrics endpoint
app.get('/metrics', metricsHandler);

// Routes
app.use('/wallets', walletRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Wallet Service running on port ${PORT}`);
});
