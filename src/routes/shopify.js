const express = require('express');
const router = express.Router();
const { installRedirect, oauthCallback } = require('../controllers/shopifyController');

router.get('/install', installRedirect);
router.get('/callback', oauthCallback);

module.exports = router;