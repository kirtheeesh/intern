import mongoose, { Schema, type Document } from "mongoose";

export interface IRegistration extends Document {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  mobileNumber: string;
  emailId: string;
  address: string;
  college: string;
  degree: string;
  department: string;
  yearOfStudy: string;
  university: string;
  whyJoin: string;
  areasOfInterest: string;
  interestedInBusiness: string;
  currentSkills: string;
  businessKnowledge: string;
  canAttendAll: string;
  preferredTimeSlot: string;
  registrationNumber: string;
  resumePath: string | null;
  photoPath: string | null;
  status: string;
  contactStatus: string | null;
  notes: string | null;
  submittedAt: Date;
}

const RegistrationSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    gender: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    emailId: { type: String, required: true },
    address: { type: String, required: true },
    college: { type: String, required: true },
    degree: { type: String, required: true },
    department: { type: String, required: true },
    yearOfStudy: { type: String, required: true },
    university: { type: String, required: true },
    whyJoin: { type: String, required: true },
    areasOfInterest: { type: String, required: true },
    interestedInBusiness: { type: String, required: true },
    currentSkills: { type: String, required: true },
    businessKnowledge: { type: String, required: true },
    canAttendAll: { type: String, required: true },
    preferredTimeSlot: { type: String, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    resumePath: { type: String, default: null },
    photoPath: { type: String, default: null },
    status: { type: String, default: "new" },
    contactStatus: { type: String, default: null },
    notes: { type: String, default: null },
    submittedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false, // We use submittedAt manually or via default
  }
);

export default mongoose.model<IRegistration>("Registration", RegistrationSchema);
