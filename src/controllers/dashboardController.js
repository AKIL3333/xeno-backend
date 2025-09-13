const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
//getting summary stats for dashboard
module.exports.summary = async (req, res) => {
  const tenantId = req.tenant.id;
  const totalCustomers = await prisma.customer.count({ where: { tenantId } });
  const totalOrders = await prisma.order.count({ where: { tenantId } });
  const revenueAgg = await prisma.order.aggregate({ where: { tenantId }, _sum: { totalPriceCents: true } });//revenue in cents
  const revenue = (revenueAgg._sum.totalPriceCents || 0) / 100;//convert cents to dollars
  res.json({ totalCustomers, totalOrders, revenue });
};
//orders and revenue by date
module.exports.ordersByDate = async (req, res) => {
  const tenantId = req.tenant.id;
  const { dateFrom, dateTo } = req.query;
  const orders = await prisma.order.findMany({ where: { tenantId }, select: { createdAt: true, totalPriceCents: true } });//fetch all orders for tenant
  const groups = {};
  for (const o of orders) {
    const d = o.createdAt.toISOString().slice(0,10);//here we group by date only (YYYY-MM-DD)
    groups[d] = groups[d] || { orders: 0, revenueCents: 0 };//initialize if not present
    groups[d].orders += 1;
    groups[d].revenueCents += o.totalPriceCents || 0;//sum revenue in cents
  }
  const resArr = Object.entries(groups).map(([date, v]) => ({ date, orders: v.orders, revenue: v.revenueCents / 100 }));//here we convert cents to dollars
  res.json(resArr.sort((a,b) => a.date.localeCompare(b.date)));//sort by dates in ascending order
};
//top customers by spend
module.exports.topCustomers = async (req, res) => {
  const tenantId = req.tenant.id;//get tenant id from request
  const limit = parseInt(req.query.limit || '5', 10);//default limit to 5
  const orders = await prisma.order.findMany({ where: { tenantId }, select: { totalPriceCents: true, customerId: true } });//fetch all orders for tenant
  const map = new Map();
  for (const o of orders) {
    const cid = o.customerId || 'unknown';
    map.set(cid, (map.get(cid) || 0) + (o.totalPriceCents || 0));//sum spend in cents
  }
  const arr = Array.from(map.entries()).map(([cid, cents]) => ({ customerId: cid, spend: cents / 100 }));
  arr.sort((a,b) => b.spend - a.spend);
  const top = arr.slice(0, limit);
  const detailed = [];
  //fetch customer details for top customers
  for (const t of top) {
    const c = await prisma.customer.findFirst({ where: { tenantId, OR: [{ shopifyId: t.customerId }, { id: t.customerId }] } });
    detailed.push({ customer: c ? (c.name || c.email || c.id) : t.customerId, spend: t.spend });
  }
  res.json(detailed);
};
//new customers by date
module.exports.newCustomersByDate = async (req, res) => {
  const tenantId = req.tenant.id;
  const { dateFrom, dateTo } = req.query;

  const customers = await prisma.customer.findMany({
    where: { tenantId },
    select: { createdAt: true }
  });
//group by date
  const groups = {};
  for (const c of customers) {
    const d = c.createdAt.toISOString().slice(0, 10);//YYYY-MM-DD
    if ((!dateFrom || d >= dateFrom) && (!dateTo || d <= dateTo)) {
      groups[d] = (groups[d] || 0) + 1;
    }
  }

  const resArr = Object.entries(groups).map(([date, count]) => ({ date, newCustomers: count }));//map to desired format
  res.json(resArr.sort((a,b) => a.date.localeCompare(b.date)));//sort by date ascending
};
//average order value by date
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
