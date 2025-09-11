const axios = require("axios");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const API_KEY = process.env.SHOPIFY_API_KEY;
const API_SECRET = process.env.SHOPIFY_API_SECRET;
const SCOPES = process.env.SHOPIFY_SCOPES || "read_customers,read_orders,read_products";
const APP_URL = process.env.APP_URL;

module.exports.installRedirect = async (req, res) => {
  const { shop } = req.query;
  if (!shop) return res.status(400).send("Missing shop param");

  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${APP_URL}/api/shopify/callback`;

  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${API_KEY}&scope=${encodeURIComponent(
    SCOPES
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&grant_options[]=per-user`;

  console.log(`[INSTALL] Redirecting to: ${installUrl}`);
  res.redirect(installUrl);
};

module.exports.oauthCallback = async (req, res) => {
  const { shop, code, hmac } = req.query;
  if (!shop || !code || !hmac) return res.status(400).send("Missing params");

  // HMAC verification
  const { hmac: receivedHmac, ...params } = req.query;
  const message = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  const generatedHmac = crypto
    .createHmac("sha256", API_SECRET)
    .update(message)
    .digest("hex");

  if (generatedHmac !== hmac) {
    console.error("[CALLBACK] HMAC validation failed");
    return res.status(400).send("HMAC validation failed");
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: API_KEY,
      client_secret: API_SECRET,
      code,
    });

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) return res.status(400).send("No access token returned");

    // Save tenant in DB
    const tenant = await prisma.tenant.upsert({
      where: { shopifyShop: shop },
      update: { accessToken },
      create: { name: shop.split(".")[0], shopifyShop: shop, accessToken },
    });

    console.log("[CALLBACK] Tenant saved in DB:", tenant);

    res.send("✅ App installed successfully! You can close this tab.");
  } catch (err) {
    console.error("[CALLBACK] OAuth error:", err.response?.data || err.message);
    res.status(500).send("OAuth failed");
  }
};
