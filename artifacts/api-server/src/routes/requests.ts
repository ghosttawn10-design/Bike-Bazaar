import { Router, type IRouter } from "express";
import { db, requestsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const { status, bikeId } = req.query as Record<string, string>;
    const conditions = [];

    if (status) conditions.push(eq(requestsTable.status, status));
    if (bikeId) conditions.push(eq(requestsTable.bikeId, parseInt(bikeId)));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const requests = await db.select().from(requestsTable)
      .where(whereClause)
      .orderBy(sql`${requestsTable.createdAt} DESC`);

    res.json(requests.map(formatRequest));
  } catch (err) {
    req.log.error({ err }, "Failed to get requests");
    res.status(500).json({ error: "internal_error", message: "Failed to fetch requests" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, location, bikeId, bikeName, message } = req.body;

    if (!name || !email || !phone || !location) {
      return res.status(400).json({ error: "validation_error", message: "Missing required fields" });
    }

    const [request] = await db.insert(requestsTable).values({
      name,
      email,
      phone,
      location,
      bikeId: bikeId ?? null,
      bikeName: bikeName ?? null,
      message: message ?? null,
      status: "pending",
    }).returning();

    res.status(201).json(formatRequest(request));
  } catch (err) {
    req.log.error({ err }, "Failed to create request");
    res.status(500).json({ error: "internal_error", message: "Failed to create request" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "invalid_id", message: "Invalid request ID" });

    const [request] = await db.select().from(requestsTable).where(eq(requestsTable.id, id));
    if (!request) return res.status(404).json({ error: "not_found", message: "Request not found" });

    res.json(formatRequest(request));
  } catch (err) {
    req.log.error({ err }, "Failed to get request");
    res.status(500).json({ error: "internal_error", message: "Failed to fetch request" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "invalid_id", message: "Invalid request ID" });

    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "validation_error", message: "Status is required" });

    const validStatuses = ["pending", "contacted", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "validation_error", message: "Invalid status. Must be: pending, contacted, or resolved" });
    }

    const [request] = await db.update(requestsTable).set({ status }).where(eq(requestsTable.id, id)).returning();
    if (!request) return res.status(404).json({ error: "not_found", message: "Request not found" });

    res.json(formatRequest(request));
  } catch (err) {
    req.log.error({ err }, "Failed to update request");
    res.status(500).json({ error: "internal_error", message: "Failed to update request" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "invalid_id", message: "Invalid request ID" });

    const [deleted] = await db.delete(requestsTable).where(eq(requestsTable.id, id)).returning();
    if (!deleted) return res.status(404).json({ error: "not_found", message: "Request not found" });

    res.json({ success: true, message: "Request deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete request");
    res.status(500).json({ error: "internal_error", message: "Failed to delete request" });
  }
});

function formatRequest(r: typeof requestsTable.$inferSelect) {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    location: r.location,
    bikeId: r.bikeId ?? null,
    bikeName: r.bikeName ?? null,
    message: r.message ?? null,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  };
}

export default router;
