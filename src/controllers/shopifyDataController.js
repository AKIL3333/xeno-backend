const shopifyClient = require('../utils/shopifyClient');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.getCustomers = async (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).json({ error: 'Missing shop query param' });
  const tenant = await prisma.tenant.findUnique({ where: { shopifyShop: shop } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  const customers = await shopifyClient.fetchCustomers(tenant);
  res.json(customers);
};

module.exports.getProducts = async (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).json({ error: 'Missing shop query param' });
  const tenant = await prisma.tenant.findUnique({ where: { shopifyShop: shop } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  const products = await shopifyClient.fetchProducts(tenant);
  res.json(products);
};

module.exports.getOrders = async (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).json({ error: 'Missing shop query param' });
  const tenant = await prisma.tenant.findUnique({ where: { shopifyShop: shop } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  const orders = await shopifyClient.fetchOrders(tenant);
  res.json(orders);
};
