const express = require("express");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

// Verify HMAC
function verifyShopifyWebhook(req, res, next) {
  try {
    const hmacHeader = req.get("X-Shopify-Hmac-Sha256");
    const body = req.rawBody;

    const hash = crypto
      .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
      .update(body, "utf8")
      .digest("base64");

    if (hash === hmacHeader) {
      return next();
    } else {
      console.error("🚨 Invalid HMAC");
      return res.status(401).send("Unauthorized");
    }
  } catch (err) {
    console.error("Webhook verification error:", err);
    return res.status(500).send("Server Error");
  }
}

router.post("/shopify", verifyShopifyWebhook, async (req, res) => {
  const topic = req.get("X-Shopify-Topic");
  const shop = req.get("X-Shopify-Shop-Domain");
  const payload = req.body;

  console.log(`📩 Webhook received: ${topic} from ${shop}`);

  try {
    if (topic.startsWith("customers/")) {
      await prisma.customer.upsert({
        where: {
          tenantId_shopifyId: {
            tenantId: payload.tenant_id || 1, // TODO: map shop → tenant
            shopifyId: payload.id.toString(),
          },
        },
        update: {
          email: payload.email,
          name: `${payload.first_name || ""} ${payload.last_name || ""}`.trim(),
          updatedAt: new Date(),
        },
        create: {
          tenantId: payload.tenant_id || 1,
          shopifyId: payload.id.toString(),
          email: payload.email,
          name: `${payload.first_name || ""} ${payload.last_name || ""}`.trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } else if (topic.startsWith("products/")) {
      await prisma.product.upsert({
        where: {
          tenantId_shopifyId: {
            tenantId: payload.tenant_id || 1,
            shopifyId: payload.id.toString(),
          },
        },
        update: {
          title: payload.title,
          sku: payload.variants[0]?.sku || null,
          priceCents: Math.round(parseFloat(payload.variants[0]?.price || 0) * 100),
          updatedAt: new Date(),
        },
        create: {
          tenantId: payload.tenant_id || 1,
          shopifyId: payload.id.toString(),
          title: payload.title,
          sku: payload.variants[0]?.sku || null,
          priceCents: Math.round(parseFloat(payload.variants[0]?.price || 0) * 100),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } else if (topic.startsWith("orders/")) {
      await prisma.order.upsert({
        where: {
          tenantId_shopifyId: {
            tenantId: payload.tenant_id || 1,
            shopifyId: payload.id.toString(),
          },
        },
        update: {
          totalPriceCents: Math.round(parseFloat(payload.total_price) * 100),
          currency: payload.currency,
          status: payload.financial_status,
          updatedAt: new Date(),
        },
        create: {
          tenantId: payload.tenant_id || 1,
          shopifyId: payload.id.toString(),
          totalPriceCents: Math.round(parseFloat(payload.total_price) * 100),
          currency: payload.currency,
          status: payload.financial_status,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } else {
      console.log("⚠️ Ignored topic:", topic);
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Webhook save error:", err);
    res.status(500).send("Error");
  }
});

module.exports = router;
