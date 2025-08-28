import { 
  users, 
  practices, 
  patients, 
  appointments, 
  forms, 
  aiInteractions, 
  insuranceVerifications,
  type User, 
  type InsertUser,
  type Practice,
  type InsertPractice,
  type Patient,
  type InsertPatient,
  type Appointment,
  type InsertAppointment,
  type Form,
  type InsertForm,
  type AiInteraction,
  type InsertAiInteraction,
  type InsuranceVerification,
  type InsertInsuranceVerification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Practice methods
  getPractice(id: string): Promise<Practice | undefined>;
  createPractice(practice: InsertPractice): Promise<Practice>;
  
  // Patient methods
  getPatient(id: string): Promise<Patient | undefined>;
  getPatientsByPractice(practiceId: string): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, patient: Partial<InsertPatient>): Promise<Patient>;
  
  // Appointment methods
  getAppointment(id: string): Promise<Appointment | undefined>;
  getAppointmentsByPractice(practiceId: string): Promise<Appointment[]>;
  getAppointmentsByDate(practiceId: string, date: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment>;
  
  // Form methods
  getForm(id: string): Promise<Form | undefined>;
  getFormsByPatient(patientId: string): Promise<Form[]>;
  createForm(form: InsertForm): Promise<Form>;
  updateForm(id: string, form: Partial<InsertForm>): Promise<Form>;
  
  // AI Interaction methods
  createAiInteraction(interaction: InsertAiInteraction): Promise<AiInteraction>;
  getAiInteractionsByUser(userId: string): Promise<AiInteraction[]>;
  
  // Insurance methods
  getInsuranceVerification(patientId: string): Promise<InsuranceVerification | undefined>;
  createInsuranceVerification(verification: InsertInsuranceVerification): Promise<InsuranceVerification>;
  updateInsuranceVerification(id: string, verification: Partial<InsertInsuranceVerification>): Promise<InsuranceVerification>;
  
  // Analytics methods
  getPracticeStats(practiceId: string): Promise<{
    totalPatients: number;
    todayAppointments: number;
    pendingForms: number;
    insuranceVerifiedRate: number;
  }>;
  
  sessionStore: connectPg.PGStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: connectPg.PGStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getPractice(id: string): Promise<Practice | undefined> {
    const [practice] = await db.select().from(practices).where(eq(practices.id, id));
    return practice || undefined;
  }

  async createPractice(insertPractice: InsertPractice): Promise<Practice> {
    const [practice] = await db
      .insert(practices)
      .values(insertPractice)
      .returning();
    return practice;
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async getPatientsByPractice(practiceId: string): Promise<Patient[]> {
    return await db.select().from(patients).where(eq(patients.practiceId, practiceId));
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await db
      .insert(patients)
      .values(insertPatient)
      .returning();
    return patient;
  }

  async updatePatient(id: string, updateData: Partial<InsertPatient>): Promise<Patient> {
    const [patient] = await db
      .update(patients)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(patients.id, id))
      .returning();
    return patient;
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment || undefined;
  }

  async getAppointmentsByPractice(practiceId: string): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.practiceId, practiceId))
      .orderBy(desc(appointments.scheduledAt));
  }

  async getAppointmentsByDate(practiceId: string, date: string): Promise<Appointment[]> {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    return await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.practiceId, practiceId),
          eq(appointments.scheduledAt, startDate)
        )
      )
      .orderBy(appointments.scheduledAt);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db
      .insert(appointments)
      .values(insertAppointment)
      .returning();
    return appointment;
  }

  async updateAppointment(id: string, updateData: Partial<InsertAppointment>): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  async getForm(id: string): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.id, id));
    return form || undefined;
  }

  async getFormsByPatient(patientId: string): Promise<Form[]> {
    return await db
      .select()
      .from(forms)
      .where(eq(forms.patientId, patientId))
      .orderBy(desc(forms.createdAt));
  }

  async createForm(insertForm: InsertForm): Promise<Form> {
    const [form] = await db
      .insert(forms)
      .values(insertForm)
      .returning();
    return form;
  }

  async updateForm(id: string, updateData: Partial<InsertForm>): Promise<Form> {
    const [form] = await db
      .update(forms)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(forms.id, id))
      .returning();
    return form;
  }

  async createAiInteraction(insertInteraction: InsertAiInteraction): Promise<AiInteraction> {
    const [interaction] = await db
      .insert(aiInteractions)
      .values(insertInteraction)
      .returning();
    return interaction;
  }

  async getAiInteractionsByUser(userId: string): Promise<AiInteraction[]> {
    return await db
      .select()
      .from(aiInteractions)
      .where(eq(aiInteractions.userId, userId))
      .orderBy(desc(aiInteractions.createdAt))
      .limit(50);
  }

  async getInsuranceVerification(patientId: string): Promise<InsuranceVerification | undefined> {
    const [verification] = await db
      .select()
      .from(insuranceVerifications)
      .where(eq(insuranceVerifications.patientId, patientId))
      .orderBy(desc(insuranceVerifications.createdAt))
      .limit(1);
    return verification || undefined;
  }

  async createInsuranceVerification(insertVerification: InsertInsuranceVerification): Promise<InsuranceVerification> {
    const [verification] = await db
      .insert(insuranceVerifications)
      .values(insertVerification)
      .returning();
    return verification;
  }

  async updateInsuranceVerification(id: string, updateData: Partial<InsertInsuranceVerification>): Promise<InsuranceVerification> {
    const [verification] = await db
      .update(insuranceVerifications)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(insuranceVerifications.id, id))
      .returning();
    return verification;
  }

  async getPracticeStats(practiceId: string): Promise<{
    totalPatients: number;
    todayAppointments: number;
    pendingForms: number;
    insuranceVerifiedRate: number;
  }> {
    // Get total patients
    const [{ count: totalPatients }] = await db
      .select({ count: count() })
      .from(patients)
      .where(eq(patients.practiceId, practiceId));

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [{ count: todayAppointments }] = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.practiceId, practiceId),
          eq(appointments.scheduledAt, today)
        )
      );

    // Get pending forms
    const [{ count: pendingForms }] = await db
      .select({ count: count() })
      .from(forms)
      .innerJoin(patients, eq(forms.patientId, patients.id))
      .where(
        and(
          eq(patients.practiceId, practiceId),
          eq(forms.status, 'pending')
        )
      );

    // Get insurance verification rate
    const [{ count: verifiedInsurance }] = await db
      .select({ count: count() })
      .from(patients)
      .where(
        and(
          eq(patients.practiceId, practiceId),
          eq(patients.insuranceVerified, true)
        )
      );

    const insuranceVerifiedRate = totalPatients > 0 ? (verifiedInsurance / totalPatients) * 100 : 0;

    return {
      totalPatients,
      todayAppointments,
      pendingForms,
      insuranceVerifiedRate
    };
  }
}

export const storage = new DatabaseStorage();
