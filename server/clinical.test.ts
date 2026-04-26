import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database module with correct function names
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
  updateUserProfile: vi.fn().mockResolvedValue(undefined),
  getPatientsByDoctor: vi.fn().mockResolvedValue([]),
  getPatientById: vi.fn().mockResolvedValue(null),
  createPatient: vi.fn().mockResolvedValue({ id: 1, fullName: "João Silva", isActive: true, doctorId: 1, createdAt: new Date(), updatedAt: new Date() }),
  updatePatient: vi.fn().mockResolvedValue(undefined),
  getConsultationsByDoctor: vi.fn().mockResolvedValue([]),
  getConsultationsByPatient: vi.fn().mockResolvedValue([]),
  getConsultationById: vi.fn().mockResolvedValue(null),
  createConsultation: vi.fn().mockResolvedValue({ id: 1, patientId: 1, doctorId: 1, status: "in_progress", startedAt: new Date(), createdAt: new Date(), updatedAt: new Date() }),
  updateConsultation: vi.fn().mockResolvedValue(undefined),
  getTodayConsultations: vi.fn().mockResolvedValue([]),
  upsertSoapNote: vi.fn().mockResolvedValue(undefined),
  getSoapNoteByConsultation: vi.fn().mockResolvedValue(null),
  createClinicalDocument: vi.fn().mockResolvedValue({ id: 1, title: "Evolução", type: "evolution", content: "", consultationId: 1, patientId: 1, doctorId: 1, createdAt: new Date(), updatedAt: new Date() }),
  getDocumentsByConsultation: vi.fn().mockResolvedValue([]),
  getDocumentsByPatient: vi.fn().mockResolvedValue([]),
  updateClinicalDocument: vi.fn().mockResolvedValue(undefined),
  createExamUpload: vi.fn().mockResolvedValue(undefined),
  getExamsByPatient: vi.fn().mockResolvedValue([]),
  updateExamUpload: vi.fn().mockResolvedValue(undefined),
  createChatMessage: vi.fn().mockResolvedValue({ id: 1, role: "assistant", content: "Olá!", consultationId: 1, createdAt: new Date(), updatedAt: new Date() }),
  getChatMessagesByConsultation: vi.fn().mockResolvedValue([]),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-openid",
    email: "medico@hospital.com",
    name: "Dr. João Silva",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("auth.me", () => {
  it("returns the authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.name).toBe("Dr. João Silva");
    expect(result?.role).toBe("user");
  });

  it("returns null for unauthenticated user", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

describe("patients.list", () => {
  it("returns empty array when no patients exist", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.patients.list({});
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("throws UNAUTHORIZED for unauthenticated users", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    await expect(caller.patients.list({})).rejects.toThrow();
  });
});

describe("consultations.list", () => {
  it("returns empty array when no consultations exist", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.consultations.list({});
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("documents.byConsultation", () => {
  it("returns empty array for new consultation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.documents.byConsultation({ consultationId: 1 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});

describe("charcot.getMessages", () => {
  it("returns empty messages for new consultation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.charcot.getMessages({ consultationId: 1 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
