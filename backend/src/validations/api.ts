import * as zod from "zod";

export const HealthCheckResponse = zod.object({
  status: zod.string(),
});

export const AdminLoginBody = zod.object({
  username: zod.string(),
  password: zod.string(),
});

export const AdminLoginResponse = zod.object({
  success: zod.boolean(),
  message: zod.string(),
});

export const AdminLogoutResponse = zod.object({
  success: zod.boolean(),
});

export const AdminMeResponse = zod.object({
  authenticated: zod.boolean(),
});

export const ListRegistrationsQueryParams = zod.object({
  search: zod.coerce.string().optional(),
  degree: zod.coerce.string().optional(),
  yearOfStudy: zod.coerce.string().optional(),
  timeSlot: zod.coerce.string().optional(),
  status: zod.coerce.string().optional(),
  canAttend: zod.coerce.string().optional(),
});

export const CreateRegistrationBody = zod.object({
  fullName: zod.string(),
  dateOfBirth: zod.string(),
  gender: zod.string(),
  mobileNumber: zod.string(),
  emailId: zod.string(),
  address: zod.string().optional(),
  college: zod.string().optional(),
  degree: zod.string().optional(),
  department: zod.string().optional(),
  yearOfStudy: zod.string().optional(),
  university: zod.string().optional(),
  whyJoin: zod.string(),
  areasOfInterest: zod.string().optional(),
  interestedInBusiness: zod.string().optional(),
  currentSkills: zod.string().optional(),
  businessKnowledge: zod.string().optional(),
  canAttendAll: zod.string(),
  preferredTimeSlot: zod.string().optional(),
  agreeToProject: zod.string(),
  declarationConfirmed: zod.string(),
});

export const GetRegistrationParams = zod.object({
  id: zod.string(),
});

export const UpdateRegistrationParams = zod.object({
  id: zod.string(),
});

export const UpdateRegistrationBody = zod.object({
  status: zod.string().optional(),
  contactStatus: zod.string().optional(),
  notes: zod.string().optional(),
});
