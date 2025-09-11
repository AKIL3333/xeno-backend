const express = require('express');
const router = express.Router();
const tenantMiddleware = require('../middleware/tenantMiddleware');
const { pollShopify } = require('../controllers/ingestController');

router.post('/poll', tenantMiddleware, pollShopify);

module.exports = router;