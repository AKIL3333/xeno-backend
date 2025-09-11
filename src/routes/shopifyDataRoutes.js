const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const shopifyClient = require('../utils/shopifyClient');

// Middleware: fetch tenant by query param
async function getTenant(req, res, next) {
  const shop = req.query.shop;
  if (!shop) return res.status(400).json({ error: 'Missing shop query param' });

  const tenant = await prisma.tenant.findUnique({ where: { shopifyShop: shop } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  req.tenant = tenant;
  next();
}

// Fetch customers
router.get('/test', (req, res) => res.send('shopifyDataRoutes is mounted!'));

router.get('/customers', getTenant, async (req, res) => {
  try {
    const customers = await shopifyClient.fetchCustomers(req.tenant);
    res.json(customers);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error fetching customers' });
  }
});

// Fetch orders
router.get('/orders', getTenant, async (req, res) => {
  try {
    const orders = await shopifyClient.fetchOrders(req.tenant);
    res.json(orders);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

// Fetch products
router.get('/products', getTenant, async (req, res) => {
  try {
    const products = await shopifyClient.fetchProducts(req.tenant);
    res.json(products);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error fetching products' });
  }
});

module.exports = router;