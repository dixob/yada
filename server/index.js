/**
 * server/index.js
 *
 * Express server entry point for the Yada game backend.
 *
 * Start with: node index.js  (or: npm run dev  for nodemon)
 *
 * IMPORTANT: The Stripe webhook route uses express.raw() and is registered
 * before the global express.json() middleware. Do not change this order.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const stripeRoutes = require('./stripe/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// Stripe webhook — must be registered BEFORE express.json()
// express.raw() is applied inline on the /webhook route in stripe/routes.js
// ---------------------------------------------------------------------------
app.use('/api/stripe', stripeRoutes);

// ---------------------------------------------------------------------------
// Global middleware (after webhook route)
// ---------------------------------------------------------------------------
app.use(cors({ origin: process.env.APP_URL || '*' }));
app.use(express.json());

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Yada server running on port ${PORT}`);
  console.log(`Stripe mode: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_test') ? 'TEST' : 'LIVE'}`);
});

module.exports = app;
