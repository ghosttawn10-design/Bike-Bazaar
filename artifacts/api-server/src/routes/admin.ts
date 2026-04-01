import { Router, type Request, type IRouter } from "express";
import { db, adminProfileTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import multer from "multer";
import path from "node:path";
import { sendAdminNotificationEmail } from "../lib/mailer.js";
import { uploadToSupabase } from "../lib/supabase-storage.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "powersport_salt_2024").digest("hex");
}

const TOKEN_SECRET = process.env.SESSION_SECRET ?? "powersport-marketplace-secret-2024";
const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function generateToken(adminId: number): string {
  const issuedAt = Date.now().toString();
  const payload = `${adminId}:${issuedAt}`;
  const sig = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

function verifyToken(token: string): number | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const lastColon = decoded.lastIndexOf(":");
    if (lastColon === -1) return null;
    const payload = decoded.slice(0, lastColon);
    const sig = decoded.slice(lastColon + 1);
    const expectedSig = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expectedSig, "hex"))) return null;
    const firstColon = payload.indexOf(":");
    const adminId = parseInt(payload.slice(0, firstColon), 10);
    const issuedAt = parseInt(payload.slice(firstColon + 1), 10);
    if (isNaN(adminId) || isNaN(issuedAt)) return null;
    if (Date.now() - issuedAt > TOKEN_MAX_AGE_MS) return null;
    return adminId;
  } catch {
    return null;
  }
}

function getAdminId(req: Request): number | undefined {
  const sessionAdminId = (req.session as Record<string, unknown>).adminId as number | undefined;
  if (sessionAdminId) return sessionAdminId;

  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    const adminId = verifyToken(auth.slice(7));
    if (adminId) return adminId;
  }
  return undefined;
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

    const token = generateToken(admin.id);

    (req.session as Record<string, unknown>).adminId = admin.id;
    req.session.save((saveErr) => {
      if (saveErr) req.log.error({ err: saveErr }, "Failed to save session");
      res.json({ success: true, admin: formatAdmin(admin), token });
    });
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
    const adminId = getAdminId(req);
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
    const adminId = getAdminId(req);
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

router.post("/upload-hero", upload.single("image"), async (req, res) => {
  try {
    const adminId = getAdminId(req);
    if (!adminId) return res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    if (!req.file) return res.status(400).json({ error: "no_file", message: "No image file provided" });

    const ext = path.extname(req.file.originalname);
    const filename = `hero/hero-${Date.now()}${ext}`;
    const imageUrl = await uploadToSupabase(req.file.buffer, filename, req.file.mimetype);

    await db.update(adminProfileTable).set({ heroImage: imageUrl, updatedAt: new Date() }).where(eq(adminProfileTable.id, adminId));

    res.json({ success: true, url: imageUrl });
  } catch (err) {
    req.log.error({ err }, "Failed to upload hero image");
    res.status(500).json({ error: "internal_error", message: "Failed to upload image" });
  }
});

router.post("/test-email", async (req, res) => {
  try {
    const adminId = getAdminId(req);
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
