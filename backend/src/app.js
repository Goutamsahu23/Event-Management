
const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const routes = require('./routes/routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.use(cors({
  origin: config.frontendOrigin,
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Root health
app.get('/', (req, res) => res.json({ status: 'ok', env: config.nodeEnv }));

// API routes (mounted under /api)
app.use('/api', routes);

// 404 for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ status: 'error', code: 'NOT_FOUND', message: 'Endpoint not found' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
