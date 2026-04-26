import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Medical profile
  specialty: varchar("specialty", { length: 128 }),
  crm: varchar("crm", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Patients ─────────────────────────────────────────────────────────────────
export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  doctorId: int("doctorId").notNull(),
  // Personal info
  fullName: varchar("fullName", { length: 256 }).notNull(),
  dateOfBirth: varchar("dateOfBirth", { length: 16 }),
  gender: mysqlEnum("gender", ["male", "female", "other"]),
  cpf: varchar("cpf", { length: 16 }),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  // Clinical info
  bloodType: varchar("bloodType", { length: 8 }),
  allergies: text("allergies"),
  chronicConditions: text("chronicConditions"),
  currentMedications: text("currentMedications"),
  familyHistory: text("familyHistory"),
  notes: text("notes"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

// ─── Consultations ────────────────────────────────────────────────────────────
export const consultations = mysqlTable("consultations", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  doctorId: int("doctorId").notNull(),
  status: mysqlEnum("status", ["in_progress", "completed", "cancelled"]).default("in_progress").notNull(),
  chiefComplaint: text("chiefComplaint"),
  transcription: text("transcription"),
  // Audio is never stored permanently — only transient processing
  audioProcessed: boolean("audioProcessed").default(false).notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = typeof consultations.$inferInsert;

// ─── SOAP Notes ───────────────────────────────────────────────────────────────
export const soapNotes = mysqlTable("soap_notes", {
  id: int("id").autoincrement().primaryKey(),
  consultationId: int("consultationId").notNull().unique(),
  patientId: int("patientId").notNull(),
  doctorId: int("doctorId").notNull(),
  // SOAP sections
  subjective: text("subjective"),
  objective: text("objective"),
  assessment: text("assessment"),
  plan: text("plan"),
  // Full structured note
  fullNote: text("fullNote"),
  isEdited: boolean("isEdited").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SoapNote = typeof soapNotes.$inferSelect;
export type InsertSoapNote = typeof soapNotes.$inferInsert;

// ─── Clinical Documents ───────────────────────────────────────────────────────
export const clinicalDocuments = mysqlTable("clinical_documents", {
  id: int("id").autoincrement().primaryKey(),
  consultationId: int("consultationId").notNull(),
  patientId: int("patientId").notNull(),
  doctorId: int("doctorId").notNull(),
  type: mysqlEnum("type", ["evolution", "prescription", "exam_request", "medical_certificate"]).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content").notNull(),
  // Storage key for PDF if generated
  pdfStorageKey: varchar("pdfStorageKey", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClinicalDocument = typeof clinicalDocuments.$inferSelect;
export type InsertClinicalDocument = typeof clinicalDocuments.$inferInsert;

// ─── Exam Uploads ─────────────────────────────────────────────────────────────
export const examUploads = mysqlTable("exam_uploads", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  doctorId: int("doctorId").notNull(),
  consultationId: int("consultationId"),
  fileName: varchar("fileName", { length: 256 }).notNull(),
  fileType: varchar("fileType", { length: 64 }).notNull(),
  storageKey: varchar("storageKey", { length: 512 }).notNull(),
  storageUrl: varchar("storageUrl", { length: 1024 }).notNull(),
  // AI-extracted context
  extractedContext: text("extractedContext"),
  analysisStatus: mysqlEnum("analysisStatus", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExamUpload = typeof examUploads.$inferSelect;
export type InsertExamUpload = typeof examUploads.$inferInsert;

// ─── Chat Messages (Charcot IA) ───────────────────────────────────────────────
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  consultationId: int("consultationId").notNull(),
  patientId: int("patientId").notNull(),
  doctorId: int("doctorId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
