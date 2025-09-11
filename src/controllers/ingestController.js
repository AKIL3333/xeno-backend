const shopifyClient = require('../utils/shopifyClient');

module.exports.pollShopify = async (req, res) => {
  try {
    const tenant = req.tenant;
    if (!tenant.accessToken) return res.status(400).json({ error: 'tenant has no access token' });
    // fetch customers, products, orders - simple demo
    const customers = await shopifyClient.fetchCustomers(tenant);
    const products = await shopifyClient.fetchProducts(tenant);
    const orders = await shopifyClient.fetchOrders(tenant);
    // upsert logic should be implemented in shopifyClient or controller (omitted for brevity)
    res.json({ customers: customers.length, products: products.length, orders: orders.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'poll failed' });
  }
};
