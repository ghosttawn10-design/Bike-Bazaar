import { Router, type IRouter } from "express";
import { db, adminProfileTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

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
    if (!admin) {
      return res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
    }

    const hash = hashPassword(password);
    if (hash !== admin.passwordHash) {
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
