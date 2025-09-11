const fetch = require('node-fetch').default; 

module.exports.fetchCustomers = async (tenant) => {
  if (!tenant.accessToken) return [];
  const res = await fetch(`https://${tenant.shopifyShop}/admin/api/2023-10/customers.json`, { headers: { 'X-Shopify-Access-Token': tenant.accessToken } });
  const j = await res.json();
  return j.customers || [];
};

module.exports.fetchProducts = async (tenant) => {
  if (!tenant.accessToken) return [];
  const res = await fetch(`https://${tenant.shopifyShop}/admin/api/2023-10/products.json`, { headers: { 'X-Shopify-Access-Token': tenant.accessToken } });
  const j = await res.json();
  return j.products || [];
};

module.exports.fetchOrders = async (tenant) => {
  if (!tenant.accessToken) return [];
  const res = await fetch(`https://${tenant.shopifyShop}/admin/api/2023-10/orders.json?status=any`, { headers: { 'X-Shopify-Access-Token': tenant.accessToken } });
  const j = await res.json();
  return j.orders || [];
};
