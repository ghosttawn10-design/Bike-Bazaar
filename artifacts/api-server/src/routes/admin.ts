import { Router, type IRouter } from "express";
import { db, adminProfileTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { sendAdminNotificationEmail } from "../lib/mailer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../../uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `hero-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "powersport_salt_2024").digest("hex");
}

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "validation_error", message: "Email and password are required" });
    }
    const [admin] = await db.select().from(adminProfileTable).where(eq(adminProfileTable.email, email));
    if (!admin) return res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
    if (hashPassword(password) !== admin.passwordHash) {
      return res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
    }
    (req.session as Record<string, unknown>).adminId = admin.id;
    res.json({ success: true, admin: formatAdmin(admin) });
  } catch (err) {
    req.log.error({ err }, "Failed to login");
    res.status(500).json({ error: "internal_error", message: "Login failed" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) req.log.error({ err }, "Failed to destroy session");
    res.json({ success: true, message: "Logged out" });
  });
});

router.get("/me", async (req, res) => {
  try {
    const adminId = (req.session as Record<string, unknown>).adminId as number | undefined;
    if (!adminId) return res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    const [admin] = await db.select().from(adminProfileTable).where(eq(adminProfileTable.id, adminId));
    if (!admin) return res.status(401).json({ error: "unauthorized", message: "Admin not found" });
    res.json(formatAdmin(admin));
  } catch (err) {
    req.log.error({ err }, "Failed to get admin me");
    res.status(500).json({ error: "internal_error", message: "Failed to get admin" });
  }
});

router.get("/profile", async (req, res) => {
  try {
    const [admin] = await db.select().from(adminProfileTable).limit(1);
    if (!admin) return res.status(404).json({ error: "not_found", message: "Admin profile not found" });
    res.json(formatAdmin(admin));
  } catch (err) {
    req.log.error({ err }, "Failed to get admin profile");
    res.status(500).json({ error: "internal_error", message: "Failed to fetch admin profile" });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const adminId = (req.session as Record<string, unknown>).adminId as number | undefined;
    if (!adminId) return res.status(401).json({ error: "unauthorized", message: "Not authenticated" });

    const {
      name, email, phone, whatsappNumber, appName, socialLinks, password,
      heroImage, emailNotificationsEnabled, smtpHost, smtpPort, smtpUser, smtpPassword, smtpFrom,
      contactInfo,
    } = req.body;

    const updateData: Partial<typeof adminProfileTable.$inferInsert> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber;
    if (appName !== undefined) updateData.appName = appName;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
    if (password && password.length >= 6) updateData.passwordHash = hashPassword(password);
    if (heroImage !== undefined) updateData.heroImage = heroImage;
    if (emailNotificationsEnabled !== undefined) updateData.emailNotificationsEnabled = emailNotificationsEnabled;
    if (smtpHost !== undefined) updateData.smtpHost = smtpHost;
    if (smtpPort !== undefined) updateData.smtpPort = smtpPort;
    if (smtpUser !== undefined) updateData.smtpUser = smtpUser;
    if (smtpPassword !== undefined) updateData.smtpPassword = smtpPassword;
    if (smtpFrom !== undefined) updateData.smtpFrom = smtpFrom;
    if (contactInfo !== undefined) updateData.contactInfo = contactInfo;

    const [admin] = await db.update(adminProfileTable).set(updateData).where(eq(adminProfileTable.id, adminId)).returning();
    if (!admin) return res.status(404).json({ error: "not_found", message: "Admin profile not found" });
    res.json(formatAdmin(admin));
  } catch (err) {
    req.log.error({ err }, "Failed to update admin profile");
    res.status(500).json({ error: "internal_error", message: "Failed to update admin profile" });
  }
});

// Upload hero image as a file
router.post("/upload-hero", upload.single("image"), async (req, res) => {
  try {
    const adminId = (req.session as Record<string, unknown>).adminId as number | undefined;
    if (!adminId) return res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    if (!req.file) return res.status(400).json({ error: "no_file", message: "No image file provided" });

    // Build the URL - use the API base URL
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    // Also save it to the admin profile
    await db.update(adminProfileTable).set({ heroImage: imageUrl, updatedAt: new Date() }).where(eq(adminProfileTable.id, adminId));

    res.json({ success: true, url: imageUrl });
  } catch (err) {
    req.log.error({ err }, "Failed to upload hero image");
    res.status(500).json({ error: "internal_error", message: "Failed to upload image" });
  }
});

// Send a test email
router.post("/test-email", async (req, res) => {
  try {
    const adminId = (req.session as Record<string, unknown>).adminId as number | undefined;
    if (!adminId) return res.status(401).json({ error: "unauthorized", message: "Not authenticated" });

    await sendAdminNotificationEmail(
      "Test Email from ApexMoto",
      `<div style="font-family:sans-serif;max-width:600px;margin:auto;background:#111;color:#fff;padding:32px;border-radius:8px;">
        <h2 style="color:#ff4500;margin-top:0;">Email Notifications Working!</h2>
        <p>If you received this message, your SMTP configuration is correctly set up.</p>
        <p>You will now receive email notifications whenever a customer submits a contact request on your website.</p>
        <p style="margin-top:24px;font-size:12px;color:#666;">Sent from your ApexMoto admin dashboard.</p>
      </div>`
    );

    res.json({ success: true, message: "Test email sent successfully" });
  } catch (err) {
    req.log.error({ err }, "Failed to send test email");
    res.status(500).json({ error: "email_error", message: String(err) });
  }
});

function formatAdmin(a: typeof adminProfileTable.$inferSelect) {
  return {
    id: a.id,
    name: a.name,
    email: a.email,
    phone: a.phone,
    whatsappNumber: a.whatsappNumber,
    appName: a.appName ?? "ApexMoto",
    heroImage: a.heroImage ?? "",
    socialLinks: a.socialLinks ?? {},
    emailNotificationsEnabled: a.emailNotificationsEnabled ?? false,
    smtpHost: a.smtpHost ?? "",
    smtpPort: a.smtpPort ?? "587",
    smtpUser: a.smtpUser ?? "",
    smtpFrom: a.smtpFrom ?? "",
    contactInfo: a.contactInfo ?? {},
  };
}

export default router;
