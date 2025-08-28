import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "doctor", "nurse", "staff"] }).notNull().default("staff"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  practiceId: varchar("practice_id").references(() => practices.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const practices = pgTable("practices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  specialty: text("specialty"),
  hipaaCompliant: boolean("hipaa_compliant").default(true),
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  dateOfBirth: timestamp("date_of_birth"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  insuranceProvider: text("insurance_provider"),
  insurancePolicyNumber: text("insurance_policy_number"),
  insuranceVerified: boolean("insurance_verified").default(false),
  insuranceVerifiedAt: timestamp("insurance_verified_at"),
  practiceId: varchar("practice_id").notNull().references(() => practices.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  providerId: varchar("provider_id").notNull().references(() => users.id),
  practiceId: varchar("practice_id").notNull().references(() => practices.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").default(30), // minutes
  type: text("type").notNull(), // checkup, consultation, follow-up, etc.
  status: text("status", { enum: ["scheduled", "confirmed", "completed", "cancelled", "no-show"] }).default("scheduled"),
  room: text("room"),
  notes: text("notes"),
  aiPreScreened: boolean("ai_pre_screened").default(false),
  formsCompleted: boolean("forms_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const forms = pgTable("forms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  appointmentId: varchar("appointment_id").references(() => appointments.id),
  type: text("type").notNull(), // intake, medical-history, consent, etc.
  data: jsonb("data").notNull(),
  status: text("status", { enum: ["pending", "completed", "reviewed"] }).default("pending"),
  aiProcessed: boolean("ai_processed").default(false),
  aiInsights: jsonb("ai_insights"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiInteractions = pgTable("ai_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  practiceId: varchar("practice_id").notNull().references(() => practices.id),
  type: text("type").notNull(), // chat, automation, insight, etc.
  prompt: text("prompt"),
  response: text("response"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insuranceVerifications = pgTable("insurance_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  provider: text("provider").notNull(),
  policyNumber: text("policy_number").notNull(),
  status: text("status", { enum: ["pending", "verified", "denied", "expired"] }).default("pending"),
  verifiedAt: timestamp("verified_at"),
  expiresAt: timestamp("expires_at"),
  coverage: jsonb("coverage"),
  aiVerified: boolean("ai_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const practicesRelations = relations(practices, ({ many }) => ({
  users: many(users),
  patients: many(patients),
  appointments: many(appointments),
  aiInteractions: many(aiInteractions),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  practice: one(practices, {
    fields: [users.practiceId],
    references: [practices.id],
  }),
  appointments: many(appointments),
  aiInteractions: many(aiInteractions),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  practice: one(practices, {
    fields: [patients.practiceId],
    references: [practices.id],
  }),
  appointments: many(appointments),
  forms: many(forms),
  insuranceVerifications: many(insuranceVerifications),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  provider: one(users, {
    fields: [appointments.providerId],
    references: [users.id],
  }),
  practice: one(practices, {
    fields: [appointments.practiceId],
    references: [practices.id],
  }),
  forms: many(forms),
}));

export const formsRelations = relations(forms, ({ one }) => ({
  patient: one(patients, {
    fields: [forms.patientId],
    references: [patients.id],
  }),
  appointment: one(appointments, {
    fields: [forms.appointmentId],
    references: [appointments.id],
  }),
}));

export const aiInteractionsRelations = relations(aiInteractions, ({ one }) => ({
  user: one(users, {
    fields: [aiInteractions.userId],
    references: [users.id],
  }),
  practice: one(practices, {
    fields: [aiInteractions.practiceId],
    references: [practices.id],
  }),
}));

export const insuranceVerificationsRelations = relations(insuranceVerifications, ({ one }) => ({
  patient: one(patients, {
    fields: [insuranceVerifications.patientId],
    references: [patients.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPracticeSchema = createInsertSchema(practices).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPatientSchema = createInsertSchema(patients).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFormSchema = createInsertSchema(forms).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiInteractionSchema = createInsertSchema(aiInteractions).omit({ id: true, createdAt: true });
export const insertInsuranceVerificationSchema = createInsertSchema(insuranceVerifications).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Practice = typeof practices.$inferSelect;
export type InsertPractice = z.infer<typeof insertPracticeSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Form = typeof forms.$inferSelect;
export type InsertForm = z.infer<typeof insertFormSchema>;
export type AiInteraction = typeof aiInteractions.$inferSelect;
export type InsertAiInteraction = z.infer<typeof insertAiInteractionSchema>;
export type InsuranceVerification = typeof insuranceVerifications.$inferSelect;
export type InsertInsuranceVerification = z.infer<typeof insertInsuranceVerificationSchema>;
