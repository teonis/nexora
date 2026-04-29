import { and, desc, eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  chatMessages,
  clinicalDocuments,
  consultations,
  examUploads,
  InsertChatMessage,
  InsertClinicalDocument,
  InsertConsultation,
  InsertExamUpload,
  InsertPatient,
  InsertPatientProblem,
  InsertSoapNote,
  InsertUser,
  patientProblems,
  patients,
  soapNotes,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod", "specialty"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  // passwordHash: set on INSERT only — use a dedicated updatePassword() for changes
  if (user.passwordHash !== undefined) {
    values.passwordHash = user.passwordHash ?? null;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  const isSuperAdmin = Boolean(ENV.ownerOpenId) && user.openId === ENV.ownerOpenId;

  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (isSuperAdmin) {
    values.role = "superadmin";
    updateSet.role = "superadmin";
  }

  // accountStatus: superadmin always approved; new users start as pending (only on insert)
  if (user.accountStatus !== undefined) {
    values.accountStatus = user.accountStatus;
    updateSet.accountStatus = user.accountStatus;
  } else if (isSuperAdmin) {
    values.accountStatus = "approved";
    updateSet.accountStatus = "approved";
  } else {
    // Only set on insert (new users get pending by default)
    values.accountStatus = "pending";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] ?? undefined;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0] ?? undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? undefined;
}

export async function updateUserProfile(
  userId: number,
  data: { specialty?: string; crm?: string; name?: string }
) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

// ─── Patients ─────────────────────────────────────────────────────────────────
export async function createPatient(data: InsertPatient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(patients).values(data).$returningId();
  return result;
}

export async function getPatientsByDoctor(doctorId: number, search?: string) {
  const db = await getDb();
  if (!db) return [];
  if (search) {
    return db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.doctorId, doctorId),
          or(
            like(patients.fullName, `%${search}%`),
            like(patients.cpf, `%${search}%`),
            like(patients.phone, `%${search}%`)
          )
        )
      )
      .orderBy(desc(patients.updatedAt));
  }
  return db
    .select()
    .from(patients)
    .where(eq(patients.doctorId, doctorId))
    .orderBy(desc(patients.updatedAt));
}

export async function getPatientById(id: number, doctorId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(patients)
    .where(and(eq(patients.id, id), eq(patients.doctorId, doctorId)))
    .limit(1);
  return result[0] ?? undefined;
}

export async function updatePatient(id: number, doctorId: number, data: Partial<InsertPatient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(patients).set(data).where(and(eq(patients.id, id), eq(patients.doctorId, doctorId)));
}

// ─── Consultations ────────────────────────────────────────────────────────────
export async function createConsultation(data: InsertConsultation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(consultations).values(data).$returningId();
  return result;
}

export async function getConsultationsByDoctor(doctorId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(consultations)
    .where(eq(consultations.doctorId, doctorId))
    .orderBy(desc(consultations.startedAt))
    .limit(limit);
}

export async function getConsultationsByPatient(patientId: number, doctorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(consultations)
    .where(and(eq(consultations.patientId, patientId), eq(consultations.doctorId, doctorId)))
    .orderBy(desc(consultations.startedAt));
}

export async function getConsultationById(id: number, doctorId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(consultations)
    .where(and(eq(consultations.id, id), eq(consultations.doctorId, doctorId)))
    .limit(1);
  return result[0] ?? undefined;
}

export async function updateConsultation(id: number, doctorId: number, data: Partial<InsertConsultation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(consultations).set(data).where(and(eq(consultations.id, id), eq(consultations.doctorId, doctorId)));
}

export async function getTodayConsultations(doctorId: number) {
  const db = await getDb();
  if (!db) return [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return db
    .select()
    .from(consultations)
    .where(eq(consultations.doctorId, doctorId))
    .orderBy(desc(consultations.startedAt))
    .limit(50);
}

// ─── SOAP Notes ───────────────────────────────────────────────────────────────
export async function upsertSoapNote(data: InsertSoapNote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .insert(soapNotes)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        subjective: data.subjective,
        objective: data.objective,
        assessment: data.assessment,
        plan: data.plan,
        fullNote: data.fullNote,
        isEdited: data.isEdited,
      },
    });
}

export async function getSoapNoteByConsultation(consultationId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(soapNotes)
    .where(eq(soapNotes.consultationId, consultationId))
    .limit(1);
  return result[0] ?? undefined;
}

// ─── Clinical Documents ───────────────────────────────────────────────────────
export async function createClinicalDocument(data: InsertClinicalDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(clinicalDocuments).values(data).$returningId();
  return result;
}

export async function getDocumentsByConsultation(consultationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(clinicalDocuments)
    .where(eq(clinicalDocuments.consultationId, consultationId))
    .orderBy(desc(clinicalDocuments.createdAt));
}

export async function getDocumentsByPatient(patientId: number, doctorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(clinicalDocuments)
    .where(and(eq(clinicalDocuments.patientId, patientId), eq(clinicalDocuments.doctorId, doctorId)))
    .orderBy(desc(clinicalDocuments.createdAt));
}

export async function updateClinicalDocument(id: number, data: Partial<InsertClinicalDocument>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(clinicalDocuments).set(data).where(eq(clinicalDocuments.id, id));
}

// ─── Exam Uploads ─────────────────────────────────────────────────────────────
export async function createExamUpload(data: InsertExamUpload) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(examUploads).values(data).$returningId();
  return result;
}

export async function getExamsByPatient(patientId: number, doctorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(examUploads)
    .where(and(eq(examUploads.patientId, patientId), eq(examUploads.doctorId, doctorId)))
    .orderBy(desc(examUploads.createdAt));
}

export async function updateExamUpload(id: number, data: Partial<InsertExamUpload>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(examUploads).set(data).where(eq(examUploads.id, id));
}

// ─── Chat Messages ────────────────────────────────────────────────────────────
export async function createChatMessage(data: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(chatMessages).values(data).$returningId();
  return result;
}

export async function getChatMessagesByConsultation(consultationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.consultationId, consultationId))
    .orderBy(chatMessages.createdAt);
}

// ─── Patient Problems ───────────────────────────────────────────────────────────────────────────────────
export async function getProblemsByPatient(patientId: number, doctorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(patientProblems)
    .where(and(eq(patientProblems.patientId, patientId), eq(patientProblems.doctorId, doctorId)))
    .orderBy(patientProblems.problemNumber);
}

export async function upsertPatientProblem(data: InsertPatientProblem & { id?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (data.id) {
    const { id, ...updateData } = data;
    await db.update(patientProblems).set(updateData).where(eq(patientProblems.id, id));
    return { id };
  }
  const [result] = await db.insert(patientProblems).values(data).$returningId();
  return result;
}

export async function getNextProblemNumber(patientId: number, doctorId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 1;
  const problems = await db
    .select()
    .from(patientProblems)
    .where(and(eq(patientProblems.patientId, patientId), eq(patientProblems.doctorId, doctorId)));
  return problems.length + 1;
}

// ─── Admin: User Management ───────────────────────────────────────────────────
export async function getAllUsers(opts?: { limit?: number; offset?: number; search?: string }) {
  const db = await getDb();
  if (!db) return [];
  const { limit = 50, offset = 0, search } = opts ?? {};
  let query = db.select().from(users).$dynamic();
  if (search) {
    query = query.where(
      or(
        like(users.name, `%${search}%`),
        like(users.email, `%${search}%`)
      )
    );
  }
  return query.orderBy(desc(users.createdAt)).limit(limit).offset(offset);
}

export async function countAllUsers(search?: string) {
  const db = await getDb();
  if (!db) return 0;
  const { count } = await import("drizzle-orm");
  let query = db.select({ total: count() }).from(users).$dynamic();
  if (search) {
    query = query.where(
      or(
        like(users.name, `%${search}%`),
        like(users.email, `%${search}%`)
      )
    );
  }
  const result = await query;
  return result[0]?.total ?? 0;
}

export async function updateUserStatus(
  userId: number,
  data: { accountStatus?: "pending" | "approved" | "blocked"; role?: "user" | "admin" | "superadmin" }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set(data).where(eq(users.id, userId));
}
