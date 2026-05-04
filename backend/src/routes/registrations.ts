import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Registration from "../models/Registration";
import {
  CreateRegistrationBody,
  UpdateRegistrationBody,
  UpdateRegistrationParams,
  GetRegistrationParams,
  ListRegistrationsQueryParams,
} from "../validations/api";
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
  const doc = r.toObject ? r.toObject() : r;
  return {
    ...doc,
    id: doc._id.toString(),
    submittedAt: doc.submittedAt instanceof Date ? doc.submittedAt.toISOString() : doc.submittedAt,
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

  const query: any = {};

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { mobileNumber: { $regex: search, $options: "i" } },
      { emailId: { $regex: search, $options: "i" } },
      { college: { $regex: search, $options: "i" } },
    ];
  }
  if (degree) query.degree = degree;
  if (yearOfStudy) query.yearOfStudy = yearOfStudy;
  if (timeSlot) query.preferredTimeSlot = timeSlot;
  if (status) query.status = status;

  const rows = await Registration.find(query).sort({ submittedAt: 1 });

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

    const registration = new Registration({
      ...parsed.data,
      registrationNumber,
      resumePath,
      photoPath,
      status: "new",
    });

    await registration.save();

    res.status(201).json(formatRegistration(registration));
  },
);

// Stats (admin only)
router.get("/registrations/stats", requireAdmin, async (req, res): Promise<void> => {
  const all = await Registration.find().sort({ submittedAt: 1 });

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

  const query: any = {};
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { emailId: { $regex: search, $options: "i" } },
      { mobileNumber: { $regex: search, $options: "i" } },
    ];
  }
  if (status) query.status = status;

  const rows = await Registration.find(query).sort({ submittedAt: 1 });

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

  const escape = (val: any) => {
    if (val == null) return "";
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvRows = [
    headers.map(escape).join(","),
    ...rows.map((r: any) =>
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

  try {
    const registration = await Registration.findById(params.data.id);
    if (!registration) {
      res.status(404).json({ error: "Registration not found" });
      return;
    }
    res.json(formatRegistration(registration));
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
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

  const updateData: any = {};
  if (body.data.status != null) updateData.status = body.data.status;
  if (body.data.contactStatus != null) updateData.contactStatus = body.data.contactStatus;
  if (body.data.notes != null) updateData.notes = body.data.notes;

  try {
    const updated = await Registration.findByIdAndUpdate(
      params.data.id,
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ error: "Registration not found" });
      return;
    }

    res.json(formatRegistration(updated));
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

export default router;
