const express = require('express');
const router = express.Router();
const tenantMiddleware = require('../middleware/tenantMiddleware');
const { summary, ordersByDate, topCustomers } = require('../controllers/dashboardController');
//these are the functionalities which gets carried out in the dashboard page
router.get('/summary', tenantMiddleware, summary);
router.get('/orders-by-date', tenantMiddleware, ordersByDate);
router.get('/top-customers', tenantMiddleware, topCustomers);

router.get('/new-customers-by-date', tenantMiddleware, require('../controllers/dashboardController').newCustomersByDate);
router.get('/avg-order-value-by-date', tenantMiddleware, require('../controllers/dashboardController').avgOrderValueByDate);


module.exports = router;
