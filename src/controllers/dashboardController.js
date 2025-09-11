const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.summary = async (req, res) => {
  const tenantId = req.tenant.id;
  const totalCustomers = await prisma.customer.count({ where: { tenantId } });
  const totalOrders = await prisma.order.count({ where: { tenantId } });
  const revenueAgg = await prisma.order.aggregate({ where: { tenantId }, _sum: { totalPriceCents: true } });
  const revenue = (revenueAgg._sum.totalPriceCents || 0) / 100;
  res.json({ totalCustomers, totalOrders, revenue });
};

module.exports.ordersByDate = async (req, res) => {
  const tenantId = req.tenant.id;
  const { dateFrom, dateTo } = req.query;
  const orders = await prisma.order.findMany({ where: { tenantId }, select: { createdAt: true, totalPriceCents: true } });
  const groups = {};
  for (const o of orders) {
    const d = o.createdAt.toISOString().slice(0,10);
    groups[d] = groups[d] || { orders: 0, revenueCents: 0 };
    groups[d].orders += 1;
    groups[d].revenueCents += o.totalPriceCents || 0;
  }
  const resArr = Object.entries(groups).map(([date, v]) => ({ date, orders: v.orders, revenue: v.revenueCents / 100 }));
  res.json(resArr.sort((a,b) => a.date.localeCompare(b.date)));
};

module.exports.topCustomers = async (req, res) => {
  const tenantId = req.tenant.id;
  const limit = parseInt(req.query.limit || '5', 10);
  const orders = await prisma.order.findMany({ where: { tenantId }, select: { totalPriceCents: true, customerId: true } });
  const map = new Map();
  for (const o of orders) {
    const cid = o.customerId || 'unknown';
    map.set(cid, (map.get(cid) || 0) + (o.totalPriceCents || 0));
  }
  const arr = Array.from(map.entries()).map(([cid, cents]) => ({ customerId: cid, spend: cents / 100 }));
  arr.sort((a,b) => b.spend - a.spend);
  const top = arr.slice(0, limit);
  const detailed = [];
  for (const t of top) {
    const c = await prisma.customer.findFirst({ where: { tenantId, OR: [{ shopifyId: t.customerId }, { id: t.customerId }] } });
    detailed.push({ customer: c ? (c.name || c.email || c.id) : t.customerId, spend: t.spend });
  }
  res.json(detailed);
};
// dashboardController.js (add these below your existing exports)
module.exports.newCustomersByDate = async (req, res) => {
  const tenantId = req.tenant.id;
  const { dateFrom, dateTo } = req.query;

  const customers = await prisma.customer.findMany({
    where: { tenantId },
    select: { createdAt: true }
  });

  const groups = {};
  for (const c of customers) {
    const d = c.createdAt.toISOString().slice(0, 10);
    if ((!dateFrom || d >= dateFrom) && (!dateTo || d <= dateTo)) {
      groups[d] = (groups[d] || 0) + 1;
    }
  }

  const resArr = Object.entries(groups).map(([date, count]) => ({ date, newCustomers: count }));
  res.json(resArr.sort((a,b) => a.date.localeCompare(b.date)));
};

module.exports.avgOrderValueByDate = async (req, res) => {
  const tenantId = req.tenant.id;
  const { dateFrom, dateTo } = req.query;

  const orders = await prisma.order.findMany({
    where: { tenantId },
    select: { createdAt: true, totalPriceCents: true }
  });

  const groups = {};
  for (const o of orders) {
    const d = o.createdAt.toISOString().slice(0, 10);
    if ((!dateFrom || d >= dateFrom) && (!dateTo || d <= dateTo)) {
      groups[d] = groups[d] || { totalRevenue: 0, count: 0 };
      groups[d].totalRevenue += o.totalPriceCents || 0;
      groups[d].count += 1;
    }
  }

  const resArr = Object.entries(groups).map(([date, v]) => ({
    date,
    avgOrderValue: v.count ? (v.totalRevenue / v.count / 100) : 0
  }));

  res.json(resArr.sort((a,b) => a.date.localeCompare(b.date)));
};

