import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { eq, ilike, or, and, like, SQL } from "drizzle-orm";
import { db, registrationsTable } from "@workspace/db";
import {
  CreateRegistrationBody,
  UpdateRegistrationBody,
  UpdateRegistrationParams,
  GetRegistrationParams,
  ListRegistrationsQueryParams,
} from "@workspace/api-zod";
import { isValidToken, COOKIE_NAME } from "./admin";

const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  },
});

function requireAdmin(req: any, res: any, next: any): void {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token || !isValidToken(token)) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

function generateRegNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `AIM-${year}-${rand}`;
}

function formatRegistration(r: any) {
  return {
    ...r,
    submittedAt: r.submittedAt instanceof Date ? r.submittedAt.toISOString() : r.submittedAt,
  };
}

const router: IRouter = Router();

// List registrations (admin only)
router.get("/registrations", requireAdmin, async (req, res): Promise<void> => {
  const params = ListRegistrationsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { search, degree, yearOfStudy, timeSlot, status } = params.data as any;

  const conditions: SQL[] = [];

  if (search) {
    conditions.push(
      or(
        ilike(registrationsTable.fullName, `%${search}%`),
        ilike(registrationsTable.mobileNumber, `%${search}%`),
        ilike(registrationsTable.emailId, `%${search}%`),
        ilike(registrationsTable.college as any, `%${search}%`),
      ) as SQL,
    );
  }
  if (degree) conditions.push(eq(registrationsTable.degree as any, degree));
  if (yearOfStudy) conditions.push(eq(registrationsTable.yearOfStudy as any, yearOfStudy));
  if (timeSlot) conditions.push(eq(registrationsTable.preferredTimeSlot as any, timeSlot));
  if (status) conditions.push(eq(registrationsTable.status, status));

  const rows =
    conditions.length > 0
      ? await db.select().from(registrationsTable).where(and(...conditions)).orderBy(registrationsTable.submittedAt)
      : await db.select().from(registrationsTable).orderBy(registrationsTable.submittedAt);

  res.json(rows.map(formatRegistration));
});

// Create registration (public)
router.post(
  "/registrations",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "photo", maxCount: 1 },
  ]),
  async (req, res): Promise<void> => {
    const parsed = CreateRegistrationBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const resumePath = files?.["resume"]?.[0]?.filename ?? null;
    const photoPath = files?.["photo"]?.[0]?.filename ?? null;

    const registrationNumber = generateRegNumber();

    const [registration] = await db
      .insert(registrationsTable)
      .values({
        ...parsed.data,
        registrationNumber,
        resumePath,
        photoPath,
        status: "new",
      })
      .returning();

    res.status(201).json(formatRegistration(registration));
  },
);

// Stats (admin only)
router.get("/registrations/stats", requireAdmin, async (req, res): Promise<void> => {
  const all = await db.select().from(registrationsTable).orderBy(registrationsTable.submittedAt);

  const total = all.length;
  const newCount = all.filter((r) => r.status === "new").length;
  const contactedCount = all.filter((r) => r.status === "contacted").length;
  const selectedCount = all.filter((r) => r.status === "selected").length;
  const rejectedCount = all.filter((r) => r.status === "rejected").length;

  const recentRegistrations = all.slice(-5).reverse().map(formatRegistration);

  const degreeMap: Record<string, number> = {};
  const slotMap: Record<string, number> = {};
  for (const r of all) {
    const d = r.degree ?? "Not specified";
    degreeMap[d] = (degreeMap[d] ?? 0) + 1;
    const s = r.preferredTimeSlot ?? "Not specified";
    slotMap[s] = (slotMap[s] ?? 0) + 1;
  }

  const byDegree = Object.entries(degreeMap).map(([label, count]) => ({ label, count }));
  const byTimeSlot = Object.entries(slotMap).map(([label, count]) => ({ label, count }));

  res.json({
    total,
    newCount,
    contactedCount,
    selectedCount,
    rejectedCount,
    recentRegistrations,
    byDegree,
    byTimeSlot,
  });
});

// Export CSV (admin only)
router.get("/registrations/export", requireAdmin, async (req, res): Promise<void> => {
  const { search, status } = req.query as { search?: string; status?: string };

  let rows = await db.select().from(registrationsTable).orderBy(registrationsTable.submittedAt);

  if (search) {
    const s = search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.fullName.toLowerCase().includes(s) ||
        r.emailId.toLowerCase().includes(s) ||
        r.mobileNumber.includes(s),
    );
  }
  if (status) {
    rows = rows.filter((r) => r.status === status);
  }

  const headers = [
    "Registration Number",
    "Full Name",
    "Date of Birth",
    "Gender",
    "Mobile Number",
    "Email ID",
    "Address",
    "College",
    "Degree",
    "Department",
    "Year of Study",
    "University",
    "Why Join",
    "Areas of Interest",
    "Interested in Business",
    "Current Skills",
    "Business Knowledge",
    "Can Attend All",
    "Preferred Time Slot",
    "Status",
    "Contact Status",
    "Notes",
    "Submitted At",
  ];

  const escape = (val: string | null | undefined) => {
    if (val == null) return "";
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvRows = [
    headers.map(escape).join(","),
    ...rows.map((r) =>
      [
        r.registrationNumber,
        r.fullName,
        r.dateOfBirth,
        r.gender,
        r.mobileNumber,
        r.emailId,
        r.address,
        r.college,
        r.degree,
        r.department,
        r.yearOfStudy,
        r.university,
        r.whyJoin,
        r.areasOfInterest,
        r.interestedInBusiness,
        r.currentSkills,
        r.businessKnowledge,
        r.canAttendAll,
        r.preferredTimeSlot,
        r.status,
        r.contactStatus,
        r.notes,
        r.submittedAt instanceof Date ? r.submittedAt.toISOString() : r.submittedAt,
      ]
        .map(escape)
        .join(","),
    ),
  ].join("\r\n");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="aimstorm-registrations-${timestamp}.csv"`,
  );
  res.send("\uFEFF" + csvRows);
});

// Get single registration (admin only)
router.get("/registrations/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = GetRegistrationParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [registration] = await db
    .select()
    .from(registrationsTable)
    .where(eq(registrationsTable.id, params.data.id));

  if (!registration) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }

  res.json(formatRegistration(registration));
});

// Update registration (admin only)
router.patch("/registrations/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateRegistrationParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateRegistrationBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updateData: Record<string, string | null> = {};
  if (body.data.status != null) updateData["status"] = body.data.status;
  if (body.data.contactStatus != null) updateData["contactStatus"] = body.data.contactStatus;
  if (body.data.notes != null) updateData["notes"] = body.data.notes;

  const [updated] = await db
    .update(registrationsTable)
    .set(updateData)
    .where(eq(registrationsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }

  res.json(formatRegistration(updated));
});

export default router;
