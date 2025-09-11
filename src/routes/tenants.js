const express = require('express');
const router = express.Router();
const { createTenant, listTenants } = require('../controllers/tenantController');

router.post('/', createTenant);
router.get('/', listTenants);

module.exports = router;