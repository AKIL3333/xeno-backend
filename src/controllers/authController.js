const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// SIGNUP
module.exports.signup = async (req, res) => {
  try {
    const { email, password, shopifyShop } = req.body;
    if (!email || !password || !shopifyShop) {
      return res.status(400).json({ error: 'email, password, and shopifyShop required' });
    }

    // Find tenant by Shopify URL
    const tenant = await prisma.tenant.findUnique({ where: { shopifyShop } });
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found. Install the app first.' });
    }

    // Check if email already exists
    if (tenant.email) {
      return res.status(400).json({ error: 'Account already exists for this tenant. Please login.' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Update tenant credentials
    await prisma.tenant.update({
      where: { shopifyShop },
      data: { email, passwordHash: hashed },
    });

    res.json({ message: 'Signup successful. Please login.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
};


// LOGIN
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    // Find tenant by email
    const tenant = await prisma.tenant.findFirst({ where: { email } });
    if (!tenant || !tenant.passwordHash) return res.status(401).json({ error: 'invalid credentials' });

    // Compare password
    const ok = await bcrypt.compare(password, tenant.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    // Generate JWT
    const token = jwt.sign({ tenantId: tenant.id, email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      tenantId: tenant.id,
      tenantName: tenant.name, 
      email: tenant.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
};
