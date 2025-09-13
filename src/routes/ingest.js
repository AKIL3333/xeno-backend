const express = require('express');
const router = express.Router();
const tenantMiddleware = require('../middleware/tenantMiddleware');
const { pollShopify } = require('../controllers/ingestController');
// Endpoint to trigger polling of Shopify data for the tenant if we are using webhooks
router.post('/poll', tenantMiddleware, pollShopify);

module.exports = router;