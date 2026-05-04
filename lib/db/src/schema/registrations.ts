import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const registrationsTable = pgTable("registrations", {
  id: serial("id").primaryKey(),
  registrationNumber: text("registration_number").notNull().unique(),
  fullName: text("full_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  mobileNumber: text("mobile_number").notNull(),
  emailId: text("email_id").notNull(),
  address: text("address"),
  college: text("college"),
  degree: text("degree"),
  department: text("department"),
  yearOfStudy: text("year_of_study"),
  university: text("university"),
  whyJoin: text("why_join").notNull(),
  areasOfInterest: text("areas_of_interest"),
  interestedInBusiness: text("interested_in_business"),
  currentSkills: text("current_skills"),
  businessKnowledge: text("business_knowledge"),
  canAttendAll: text("can_attend_all").notNull(),
  preferredTimeSlot: text("preferred_time_slot"),
  agreeToProject: text("agree_to_project").notNull(),
  declarationConfirmed: text("declaration_confirmed").notNull(),
  resumePath: text("resume_path"),
  photoPath: text("photo_path"),
  status: text("status").notNull().default("new"),
  contactStatus: text("contact_status"),
  notes: text("notes"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRegistrationSchema = createInsertSchema(registrationsTable).omit({
  id: true,
  submittedAt: true,
});
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrationsTable.$inferSelect;
