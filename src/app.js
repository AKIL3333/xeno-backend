const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const nodeCron = require('node-cron');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(
  bodyParser.json({
    limit: "1mb",
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);


// in app.js
const session = require("express-session");
app.use(session({
  secret: "shopify_secret_key",
  resave: false,
  saveUninitialized: true,
}));


// mount routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tenants', require('./routes/tenants'));
app.use('/api/shopify', require('./routes/shopify'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/ingest', require('./routes/ingest'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/shopify/data', require('./routes/shopifyDataRoutes'));

// health
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// simple cron: demo polling
nodeCron.schedule('*/15 * * * *', async () => {
  try {
    console.log('[cron] running poller job');
    const poller = require('./jobs/poller');
    await poller.run(prisma);
  } catch (e) {
    console.error('Cron error', e);
  }
});

module.exports = app;