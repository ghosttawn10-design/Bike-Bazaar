import { Router, type IRouter } from "express";
import { db, productsTable, requestsTable } from "@workspace/db";
import { eq, sql, gte } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard", async (req, res) => {
  try {
    const [
      totalProductsResult,
      totalRequestsResult,
      pendingRequestsResult,
      featuredProductsResult,
      requestsByStatusResult,
      productsByCategoryResult,
      recentRequestsResult,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(productsTable),
      db.select({ count: sql<number>`count(*)::int` }).from(requestsTable),
      db.select({ count: sql<number>`count(*)::int` }).from(requestsTable).where(eq(requestsTable.status, "pending")),
      db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(eq(productsTable.featured, true)),
      db.select({ status: requestsTable.status, count: sql<number>`count(*)::int` })
        .from(requestsTable).groupBy(requestsTable.status),
      db.select({ category: productsTable.category, count: sql<number>`count(*)::int` })
        .from(productsTable).groupBy(productsTable.category).orderBy(sql`count(*) DESC`),
      db.select({ count: sql<number>`count(*)::int` }).from(requestsTable)
        .where(gte(requestsTable.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))),
    ]);

    const popularCategory = productsByCategoryResult[0]?.category ?? "Superbike";

    res.json({
      totalProducts: totalProductsResult[0]?.count ?? 0,
      totalRequests: totalRequestsResult[0]?.count ?? 0,
      pendingRequests: pendingRequestsResult[0]?.count ?? 0,
      featuredProducts: featuredProductsResult[0]?.count ?? 0,
      popularCategory,
      recentRequestsCount: recentRequestsResult[0]?.count ?? 0,
      requestsByStatus: requestsByStatusResult,
      productsByCategory: productsByCategoryResult,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "internal_error", message: "Failed to fetch dashboard stats" });
  }
});

router.get("/activity", async (req, res) => {
  try {
    const days = parseInt((req.query.days as string) ?? "30");
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [requestActivity, productActivity] = await Promise.all([
      db.select({
        date: sql<string>`date_trunc('day', ${requestsTable.createdAt})::date::text`,
        count: sql<number>`count(*)::int`,
      }).from(requestsTable)
        .where(gte(requestsTable.createdAt, since))
        .groupBy(sql`date_trunc('day', ${requestsTable.createdAt})`),
      db.select({
        date: sql<string>`date_trunc('day', ${productsTable.createdAt})::date::text`,
        count: sql<number>`count(*)::int`,
      }).from(productsTable)
        .where(gte(productsTable.createdAt, since))
        .groupBy(sql`date_trunc('day', ${productsTable.createdAt})`),
    ]);

    const dateMap = new Map<string, { requests: number; products: number }>();

    for (const r of requestActivity) {
      const entry = dateMap.get(r.date) ?? { requests: 0, products: 0 };
      entry.requests = r.count;
      dateMap.set(r.date, entry);
    }
    for (const p of productActivity) {
      const entry = dateMap.get(p.date) ?? { requests: 0, products: 0 };
      entry.products = p.count;
      dateMap.set(p.date, entry);
    }

    const result = Array.from(dateMap.entries())
      .map(([date, val]) => ({ date, ...val }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get activity data");
    res.status(500).json({ error: "internal_error", message: "Failed to fetch activity data" });
  }
});

export default router;
