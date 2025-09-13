const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
//here we handle tenant creation where we store shopifyShop and accessToken
module.exports.createTenant = async (req, res) => {
  try {
    const { name, shopifyShop, accessToken } = req.body;
    if (!name || !shopifyShop) return res.status(400).json({ error: 'name and shopifyShop required' });
    const t = await prisma.tenant.create({ data: { name, shopifyShop, accessToken } });
    res.json(t);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
};
//list all tenants - for admin purposes
module.exports.listTenants = async (req, res) => {
  const tenants = await prisma.tenant.findMany();
  res.json(tenants);
};