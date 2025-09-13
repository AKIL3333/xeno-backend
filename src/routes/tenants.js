const express = require('express');
const router = express.Router();
const { createTenant, listTenants } = require('../controllers/tenantController');
//this file defines routes to create and list tenants
router.post('/', createTenant);
router.get('/', listTenants);

module.exports = router;