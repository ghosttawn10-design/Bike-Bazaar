import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, ilike, and, gte, lte, sql, or } from "drizzle-orm";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../../uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `product-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const { category, brand, minPrice, maxPrice, search, featured, limit = "20", offset = "0" } = req.query as Record<string, string>;

    const conditions = [];

    if (category) conditions.push(eq(productsTable.category, category));
    if (brand) conditions.push(eq(productsTable.brand, brand));
    if (minPrice) conditions.push(gte(productsTable.price, minPrice));
    if (maxPrice) conditions.push(lte(productsTable.price, maxPrice));
    if (featured === "true") conditions.push(eq(productsTable.featured, true));
    if (search) {
      conditions.push(
        or(
          ilike(productsTable.name, `%${search}%`),
          ilike(productsTable.brand, `%${search}%`),
          ilike(productsTable.description, `%${search}%`)
        )!
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [products, countResult] = await Promise.all([
      db.select().from(productsTable)
        .where(whereClause)
        .orderBy(sql`${productsTable.featured} DESC, ${productsTable.createdAt} DESC`)
        .limit(parseInt(limit))
        .offset(parseInt(offset)),
      db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(whereClause),
    ]);

    res.json({
      products: products.map(formatProduct),
      total: countResult[0]?.count ?? 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get products");
    res.status(500).json({ error: "internal_error", message: "Failed to fetch products" });
  }
});

router.get("/featured", async (req, res) => {
  try {
    const products = await db.select().from(productsTable)
      .where(eq(productsTable.featured, true))
      .orderBy(sql`${productsTable.createdAt} DESC`)
      .limit(8);
    res.json(products.map(formatProduct));
  } catch (err) {
    req.log.error({ err }, "Failed to get featured products");
    res.status(500).json({ error: "internal_error", message: "Failed to fetch featured products" });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const result = await db.select({
      category: productsTable.category,
      count: sql<number>`count(*)::int`,
    }).from(productsTable).groupBy(productsTable.category).orderBy(sql`count(*) DESC`);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get categories");
    res.status(500).json({ error: "internal_error", message: "Failed to fetch categories" });
  }
});

router.get("/brands", async (req, res) => {
  try {
    const result = await db.selectDistinct({ brand: productsTable.brand })
      .from(productsTable).orderBy(productsTable.brand);
    res.json(result.map((r) => r.brand));
  } catch (err) {
    req.log.error({ err }, "Failed to get brands");
    res.status(500).json({ error: "internal_error", message: "Failed to fetch brands" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "invalid_id", message: "Invalid product ID" });

    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (!product) return res.status(404).json({ error: "not_found", message: "Product not found" });

    res.json(formatProduct(product));
  } catch (err) {
    req.log.error({ err }, "Failed to get product");
    res.status(500).json({ error: "internal_error", message: "Failed to fetch product" });
  }
});

router.get("/:id/related", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "invalid_id", message: "Invalid product ID" });

    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (!product) return res.status(404).json({ error: "not_found", message: "Product not found" });

    const related = await db.select().from(productsTable)
      .where(and(eq(productsTable.category, product.category), sql`${productsTable.id} != ${id}`))
      .orderBy(sql`RANDOM()`)
      .limit(4);

    res.json(related.map(formatProduct));
  } catch (err) {
    req.log.error({ err }, "Failed to get related products");
    res.status(500).json({ error: "internal_error", message: "Failed to fetch related products" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, brand, price, category, description, engineCapacity, topSpeed, images, model3dUrl, featured, specs } = req.body;

    if (!name || !brand || !price || !category || !description) {
      return res.status(400).json({ error: "validation_error", message: "Missing required fields" });
    }

    const [product] = await db.insert(productsTable).values({
      name,
      brand,
      price: String(price),
      category,
      description,
      engineCapacity: engineCapacity ?? null,
      topSpeed: topSpeed ?? null,
      images: images ?? [],
      model3dUrl: model3dUrl ?? null,
      featured: featured ?? false,
      specs: specs ?? {},
    }).returning();

    res.status(201).json(formatProduct(product));
  } catch (err) {
    req.log.error({ err }, "Failed to create product");
    res.status(500).json({ error: "internal_error", message: "Failed to create product" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "invalid_id", message: "Invalid product ID" });

    const { name, brand, price, category, description, engineCapacity, topSpeed, images, model3dUrl, featured, specs } = req.body;

    const updateData: Partial<typeof productsTable.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (brand !== undefined) updateData.brand = brand;
    if (price !== undefined) updateData.price = String(price);
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (engineCapacity !== undefined) updateData.engineCapacity = engineCapacity;
    if (topSpeed !== undefined) updateData.topSpeed = topSpeed;
    if (images !== undefined) updateData.images = images;
    if (model3dUrl !== undefined) updateData.model3dUrl = model3dUrl;
    if (featured !== undefined) updateData.featured = featured;
    if (specs !== undefined) updateData.specs = specs;

    const [product] = await db.update(productsTable).set(updateData).where(eq(productsTable.id, id)).returning();
    if (!product) return res.status(404).json({ error: "not_found", message: "Product not found" });

    res.json(formatProduct(product));
  } catch (err) {
    req.log.error({ err }, "Failed to update product");
    res.status(500).json({ error: "internal_error", message: "Failed to update product" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "invalid_id", message: "Invalid product ID" });

    const [deleted] = await db.delete(productsTable).where(eq(productsTable.id, id)).returning();
    if (!deleted) return res.status(404).json({ error: "not_found", message: "Product not found" });

    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete product");
    res.status(500).json({ error: "internal_error", message: "Failed to delete product" });
  }
});

function formatProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    price: parseFloat(p.price),
    category: p.category,
    description: p.description,
    engineCapacity: p.engineCapacity ?? undefined,
    topSpeed: p.topSpeed ?? undefined,
    images: (p.images as string[]) ?? [],
    model3dUrl: p.model3dUrl ?? null,
    featured: p.featured,
    specs: p.specs ?? {},
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

// Upload a product image file
router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "no_file", message: "No image file provided" });
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    res.json({ success: true, url: imageUrl });
  } catch (err) {
    req.log.error({ err }, "Failed to upload product image");
    res.status(500).json({ error: "internal_error", message: "Failed to upload image" });
  }
});

export default router;
