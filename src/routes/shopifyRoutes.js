const express = require("express");
const router = express.Router();
const shopifyController = require("../controllers/shopifyController");

// Route to start install flow
router.get("/install", shopifyController.installRedirect);

// OAuth callback route
router.get("/callback", shopifyController.oauthCallback);

module.exports = router;
