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
//not all routes are necessary for the basic functionality but can be used for future extensions
app.use('/api/auth', require('./routes/auth'));//use for jwt based authentication
app.use('/api/tenants', require('./routes/tenants'));//use for tenant creation and listing
app.use('/api/shopify', require('./routes/shopify'));//use for shopify oauth and app installation
app.use('/api/webhooks', require('./routes/webhooks'));//use when webhooks are needed
app.use('/api/ingest', require('./routes/ingest'));//use for manual data ingestion using a controller and access token
app.use('/api/dashboard', require('./routes/dashboard'));//use for fetch dashboard to view the trends and insights
app.use('/api/shopify/data', require('./routes/shopifyDataRoutes'));//use to fetch shopify data like customers, orders, products if needed

// health of the app
app.get('/health', (req, res) => res.json({ status: 'ok' }))

//scheduliing the poller job to run using cron
nodeCron.schedule('*/1 * * * *', async () => {
  try {
    console.log('[cron] running poller job');
    const poller = require('./jobs/poller');
    await poller.run(prisma);
  } catch (e) {
    console.error('Cron error', e);
  }
});

module.exports = app;
