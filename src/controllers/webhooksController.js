const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

const SHOPIFY_SECRET = process.env.SHOPIFY_API_SECRET || '';

function verifyHmac(req) {
  const hmac = req.header('x-shopify-hmac-sha256');
  const body = JSON.stringify(req.body);
  const digest = crypto.createHmac('sha256', SHOPIFY_SECRET).update(body, 'utf8').digest('base64');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac || ''));
}

module.exports.shopifyWebhookHandler = async (req, res) => {
  try {
    // Optional HMAC verify
    if (SHOPIFY_SECRET) {
      const ok = verifyHmac(req);
      if (!ok) {
        console.warn('Webhook HMAC verification failed');
        return res.status(401).send('hmac invalid');
      }
    }

    const topic = req.header('x-shopify-topic') || 'unknown';
    const shop = req.header('x-shopify-shop-domain');
    const payload = req.body;

    const tenant = await prisma.tenant.findUnique({ where: { shopifyShop: shop } });
    if (!tenant) {
      console.warn('Webhook from unknown shop', shop);
      return res.status(200).send('ok');
    }

    // store event
    await prisma.event.create({ data: { tenantId: tenant.id, type: topic, payload } });

    // ingest depending on topic
    if (topic.includes('customers')) {
      const c = payload;
      await prisma.customer.upsert({
        where: { tenantId_shopifyId: { tenantId: tenant.id, shopifyId: c.id.toString() } },
        create: { tenantId: tenant.id, shopifyId: c.id.toString(), email: c.email || null, name: `${c.first_name || ''} ${c.last_name || ''}` },
        update: { email: c.email || null, name: `${c.first_name || ''} ${c.last_name || ''}` }
      });
    }

    if (topic.includes('products')) {
      const p = payload;
      await prisma.product.upsert({
        where: { tenantId_shopifyId: { tenantId: tenant.id, shopifyId: p.id.toString() } },
        create: { tenantId: tenant.id, shopifyId: p.id.toString(), title: p.title, priceCents: Math.round((p.variants?.[0]?.price || 0) * 100) },
        update: { title: p.title, priceCents: Math.round((p.variants?.[0]?.price || 0) * 100) }
      });
    }

    if (topic.includes('orders')) {
      const o = payload;
      await prisma.order.upsert({
        where: { tenantId_shopifyId: { tenantId: tenant.id, shopifyId: o.id.toString() } },
        create: { tenantId: tenant.id, shopifyId: o.id.toString(), totalPriceCents: Math.round((o.total_price || 0) * 100), currency: o.currency || o.currency_code || 'USD', status: o.financial_status || 'unknown', customerId: o.customer?.id?.toString() || null },
        update: { totalPriceCents: Math.round((o.total_price || 0) * 100), status: o.financial_status || 'unknown' }
      });
    }

    res.status(200).send('ok');
  } catch (e) {
    console.error('webhook error', e);
    res.status(500).send('error');
  }
};
