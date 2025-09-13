// poller.js
const shopifyClient = require('../utils/shopifyClient');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { nanoid } = require('nanoid');
// Poller job to fetch data from Shopify for all tenants and upsert into DB
module.exports.run = async (prismaArg) => {
  const db = prismaArg || prisma;

  try {
    const tenants = await db.tenant.findMany();//fetch all tenants
    console.log(`[poller] Tenants found: ${tenants.length}`);
    tenants.forEach(t => console.log('  -', t.shopifyShop));//list all tenant shops

    if (!tenants.length) {
      console.warn('[poller] No tenants found. Exiting poller.');
      return;
    }

    for (const t of tenants) {
      try {
        console.log(`\n[poller] Polling tenant: ${t.shopifyShop}`);

        // Customers 
        const customers = await shopifyClient.fetchCustomers(t);
        console.log(`[poller] Customers fetched: ${customers.length}`);
        // Upsert customers
        for (const c of customers) {
          await db.customer.upsert({
            where: { tenantId_shopifyId: { tenantId: t.id, shopifyId: c.id.toString() } },
            update: {
              email: c.email,
              name: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
              updatedAt: new Date(),
            },
            create: {
              id:nanoid(),
              tenantId: t.id,
              shopifyId: c.id.toString(),
              email: c.email,
              name: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        }

        // Products
        const products = await shopifyClient.fetchProducts(t);
        console.log(`[poller] Products fetched: ${products.length}`);
        for (const p of products) {
          await db.product.upsert({
            where: { tenantId_shopifyId: { tenantId: t.id, shopifyId: p.id.toString() } },
            update: {
              title: p.title,
              sku: p.variants[0]?.sku || null,
              priceCents: Math.round(parseFloat(p.variants[0]?.price || 0) * 100),
              updatedAt: new Date(),
            },
            create: {
              id:nanoid(),
              tenantId: t.id,
              shopifyId: p.id.toString(),
              title: p.title,
              sku: p.variants[0]?.sku || null,
              priceCents: Math.round(parseFloat(p.variants[0]?.price || 0) * 100),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        }

        // Orders 
        const orders = await shopifyClient.fetchOrders(t);
        console.log(`[poller] Orders fetched: ${orders.length}`);
        for (const o of orders) {
          const customer = o.customer
            ? await db.customer.findUnique({
                where: { tenantId_shopifyId: { tenantId: t.id, shopifyId: o.customer.id.toString() } },
              })
            : null;

          await db.order.upsert({
            where: { tenantId_shopifyId: { tenantId: t.id, shopifyId: o.id.toString() } },
            update: {
              customerId: customer?.id || null,
              totalPriceCents: Math.round(parseFloat(o.total_price) * 100),
              currency: o.currency,
              status: o.financial_status,
              updatedAt: new Date(),
            },
            create: {
              id:nanoid(),
              tenantId: t.id,
              shopifyId: o.id.toString(),
              customerId: customer?.id || null,
              totalPriceCents: Math.round(parseFloat(o.total_price) * 100),
              currency: o.currency,
              status: o.financial_status,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        }

        console.log(`[poller] Completed for tenant: ${t.shopifyShop}`);
      } catch (e) {
        console.error(`[poller] Error for tenant ${t.shopifyShop}:`, e);
      }
    }
  } catch (err) {
    console.error('[poller] Fatal error:', err);
  }
};

if (require.main === module) {
  module.exports.run()
    .then(() => {
      console.log('Poller run completed');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Poller run failed', err);
      process.exit(1);
    });
}
