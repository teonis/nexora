import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { nanoid } from "nanoid";
import {
  createChatMessage,
  createClinicalDocument,
  createConsultation,
  createExamUpload,
  createPatient,
  getAllUsers,
  countAllUsers,
  getChatMessagesByConsultation,
  getConsultationById,
  getConsultationsByDoctor,
  getConsultationsByPatient,
  getDocumentsByConsultation,
  getDocumentsByPatient,
  getExamsByPatient,
  getPatientById,
  getPatientsByDoctor,
  getNextProblemNumber,
  getProblemsByPatient,
  getSoapNoteByConsultation,
  getTodayConsultations,
  getUserByEmail,
  getUserById,
  updateConsultation,
  updateClinicalDocument,
  updateExamUpload,
  updatePatient,
  updateUserProfile,
  updateUserStatus,
  upsertPatientProblem,
  upsertSoapNote,
  upsertUser,
} from "./db";
import { sdk } from "./_core/sdk";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [hashedPart, salt] = hash.split(".");
  if (!hashedPart || !salt) return false;
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  const hashedBuf = Buffer.from(hashedPart, "hex");
  if (buf.length !== hashedBuf.length) return false;
  return timingSafeEqual(buf, hashedBuf);
}
import { invokeLLM, type Message } from "./_core/llm";
import { transcribeAudio } from "./_core/voiceTranscription";
import { storagePut } from "./storage";
import { systemRouter } from "./_core/systemRouter";
import { stripeRouter } from "./stripeRouter";
import { protectedProcedure, publicProcedure, superadminProcedure, router } from "./_core/trpc";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";

// ─── Auth Router ──────────────────────────────────────────────────────────────
const authRouter = router({
  me: publicProcedure.query((opts) => {
    if (!opts.ctx.user) return null;
    const { passwordHash: _, ...publicUser } = opts.ctx.user;
    return publicUser;
  }),

  register: publicProcedure
    .input(z.object({
      name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
      email: z.string().email("Email inválido"),
      password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
      specialty: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await getUserByEmail(input.email);
      if (existing) {
        const hint = existing.loginMethod === "google"
          ? "Este email está vinculado a uma conta Google. Use o botão 'Continuar com Google'."
          : "Este email já está cadastrado.";
        throw new TRPCError({ code: "CONFLICT", message: hint });
      }

      const passwordHash = await hashPassword(input.password);
      const openId = `email_${nanoid(16)}`;

      await upsertUser({
        openId,
        name: input.name,
        email: input.email,
        passwordHash,
        loginMethod: "email",
        specialty: input.specialty,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name: input.name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return { success: true, accountStatus: "pending" as const };
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email("Email inválido"),
      password: z.string().min(1, "Senha obrigatória"),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserByEmail(input.email);

      if (!user || !user.passwordHash) {
        if (user?.loginMethod === "google") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Esta conta usa login com Google. Use o botão 'Continuar com Google'.",
          });
        }
        // Timing-safe: hash a dummy password to avoid user enumeration
        await hashPassword("dummy_timing_safe_check");
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou senha incorretos." });
      }

      const valid = await verifyPassword(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou senha incorretos." });
      }

      await upsertUser({ openId: user.openId, lastSignedIn: new Date() });

      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return {
        success: true,
        accountStatus: user.accountStatus,
        role: user.role,
      };
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),

  updateProfile: protectedProcedure
    .input(z.object({ specialty: z.string().optional(), crm: z.string().optional(), name: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      await updateUserProfile(ctx.user.id, input);
      return { success: true };
    }),
});

// ─── Patients Router ──────────────────────────────────────────────────────────
const patientsRouter = router({
  list: protectedProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return getPatientsByDoctor(ctx.user.id, input.search);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const patient = await getPatientById(input.id, ctx.user.id);
      if (!patient) throw new TRPCError({ code: "NOT_FOUND", message: "Paciente não encontrado" });
      return patient;
    }),

  create: protectedProcedure
    .input(
      z.object({
        fullName: z.string().min(2),
        dateOfBirth: z.string().optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        cpf: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        address: z.string().optional(),
        bloodType: z.string().optional(),
        allergies: z.string().optional(),
        chronicConditions: z.string().optional(),
        currentMedications: z.string().optional(),
        familyHistory: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await createPatient({ ...input, doctorId: ctx.user.id });
      return result;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        fullName: z.string().min(2).optional(),
        dateOfBirth: z.string().optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        cpf: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        address: z.string().optional(),
        bloodType: z.string().optional(),
        allergies: z.string().optional(),
        chronicConditions: z.string().optional(),
        currentMedications: z.string().optional(),
        familyHistory: z.string().optional(),
        notes: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await updatePatient(id, ctx.user.id, data);
      return { success: true };
    }),
});

// ─── Consultations Router ─────────────────────────────────────────────────────
const consultationsRouter = router({
  today: protectedProcedure.query(async ({ ctx }) => {
    return getTodayConsultations(ctx.user.id);
  }),

  list: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return getConsultationsByDoctor(ctx.user.id, input.limit ?? 20);
    }),

  byPatient: protectedProcedure
    .input(z.object({ patientId: z.number() }))
    .query(async ({ ctx, input }) => {
      return getConsultationsByPatient(input.patientId, ctx.user.id);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const consultation = await getConsultationById(input.id, ctx.user.id);
      if (!consultation) throw new TRPCError({ code: "NOT_FOUND" });
      return consultation;
    }),

  create: protectedProcedure
    .input(z.object({
      patientId: z.number(),
      chiefComplaint: z.string().optional(),
      specialty: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await createConsultation({
        patientId: input.patientId,
        doctorId: ctx.user.id,
        chiefComplaint: input.chiefComplaint,
        specialty: input.specialty,
        status: "in_progress",
      });
      return result;
    }),

  transcribeAudio: protectedProcedure
    .input(z.object({ consultationId: z.number(), audioUrl: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const consultation = await getConsultationById(input.consultationId, ctx.user.id);
      if (!consultation) throw new TRPCError({ code: "NOT_FOUND" });

      const result = await transcribeAudio({
        audioUrl: input.audioUrl,
        language: "pt",
        prompt: "Transcrição de consulta médica em português brasileiro. Termos médicos, medicamentos, diagnósticos.",
      });

      if ("error" in result) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
      }

      await updateConsultation(input.consultationId, ctx.user.id, {
        transcription: result.text,
        audioProcessed: true,
      });

      return { transcription: result.text, segments: result.segments };
    }),

  generateSoap: protectedProcedure
    .input(z.object({ consultationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const consultation = await getConsultationById(input.consultationId, ctx.user.id);
      if (!consultation) throw new TRPCError({ code: "NOT_FOUND" });
      if (!consultation.transcription) throw new TRPCError({ code: "BAD_REQUEST", message: "Sem transcrição disponível" });

      // Detectar especialidade: consulta > perfil do médico > fallback
      const doctor = await getUserById(ctx.user.id);
      const specialty = consultation.specialty || doctor?.specialty || "clínica geral";

      // Mapa de instruções específicas por especialidade
      // Normalizar: remover acentos e espaços extras para match robusto
      const normalizeKey = (s: string) =>
        s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

      const specialtyInstructions: Record<string, string> = {
        endocrinologia: `Foque em: glicemia, HbA1c, TSH, T4 livre, peso, IMC, histórico de DM, hipotireoidismo/hipertireoidismo, síndrome metabólica, ajuste de doses de insulina ou levotiroxina. Inclua valores de referência quando relevante.`,
        nutrologia: `Foque em: peso atual, IMC, composição corporal, hábitos alimentares, ingestão hídrica, atividade física, carências nutricionais, suplementação, recordatório alimentar mencionado. Seja detalhado no Plano nutricional.`,
        ginecologia: `Foque em: ciclo menstrual (regularidade, DUM), uso de anticoncepcional, histórico gestacional (G_P_A), queixas ginecológicas, exames preventivos (Papanicolau, mamografia), sintomas hormonais. Inclua data da DUM quando mencionada.`,
        dermatologia: `Foque em: localização, morfologia e evolução das lesões cutâneas, fototipo, uso de protetor solar, histórico de lesões prévias, resposta a tratamentos anteriores. Descreva lesões com vocabulário dermatológico preciso (mácula, pápula, placa, etc.).`,
        cardiologia: `Foque em: PA, FC, queixas cardíacas (dispneia, palpitações, dor torácica), fatores de risco cardiovascular, medicações em uso, resultados de ECG ou ecocardiograma se mencionados.`,
        // com e sem acento (clinica geral / clínica geral)
        "clinica geral": `Avalie todos os sistemas relevantes mencionados. Seja abrangente e objetivo.`,
        // com e sem acento (medicina de familia / medicina de família)
        "medicina de familia": `Avalie todos os sistemas relevantes mencionados. Considere contexto familiar e social quando mencionado.`,
        pediatria: `Foque em: idade, peso, altura, desenvolvimento neuropsicomotor, vacinação, aleitamento, queixas pediátricas específicas. Use linguagem adequada à faixa etária.`,
        ortopedia: `Foque em: localização da dor, mecanismo de lesão, limitação funcional, exame físico ortopédico (amplitude de movimento, testes específicos), achados de imagem se mencionados.`,
        psiquiatria: `Foque em: humor, afeto, pensamento, percepção, cognição, comportamento, risco de auto/heteroagressão, medicações psicotrópicas em uso, histórico de internações.`,
        neurologia: `Foque em: queixas neurológicas (cefaleia, tontura, déficit motor/sensitivo, convulsões), exame neurológico, achados de neuroimagem se mencionados.`,
      };

      const specialtyKey = normalizeKey(specialty);
      const specialtyInstruction = specialtyInstructions[specialtyKey] || specialtyInstructions["clinica geral"];

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Você é um assistente médico especializado em documentação clínica para ${specialty}.
Analise a transcrição de consulta médica e gere uma nota clínica estruturada no formato SOAP em português brasileiro.

ORIENTAÇÕES ESPECÍFICAS PARA ${specialty.toUpperCase()}:
${specialtyInstruction}

Regras gerais:
- Use terminologia médica adequada para ${specialty}
- Seja preciso e objetivo
- Se um dado não foi mencionado na consulta, escreva "Não referido" — nunca invente informações
- Retorne APENAS o JSON estruturado, sem texto adicional`,
          },
          {
            role: "user",
            content: `Especialidade desta consulta: ${specialty}\n\nTranscrição da consulta:\n\n${consultation.transcription}\n\nGere a nota SOAP estruturada.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "soap_note",
            strict: true,
            schema: {
              type: "object",
              properties: {
                subjective: { type: "string", description: "Queixa principal, história da doença atual, medicamentos, alergias, histórico familiar" },
                objective: { type: "string", description: "Sinais vitais, achados do exame físico, resultados de testes" },
                assessment: { type: "string", description: "Diagnóstico(s) presumido(s), diagnóstico diferencial, CID-10 quando aplicável" },
                plan: { type: "string", description: "Prescrições, pedidos de exames, encaminhamentos, orientações ao paciente" },
                fullNote: { type: "string", description: "Nota clínica completa formatada para prontuário" },
              },
              required: ["subjective", "objective", "assessment", "plan", "fullNote"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices[0]?.message?.content;
      const content = typeof rawContent === "string" ? rawContent : null;
      if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Falha ao gerar nota SOAP" });

      const soapData = JSON.parse(content);

      await upsertSoapNote({
        consultationId: input.consultationId,
        patientId: consultation.patientId,
        doctorId: ctx.user.id,
        ...soapData,
      });

      // Extração automática de problemas em background (não bloqueia o retorno)
      extractProblemsBackground(input.consultationId, consultation, soapData, ctx.user.id).catch(
        (err) => console.error("[Problems] Erro na extração automática:", err)
      );

      return soapData;
    }),

  getSoap: protectedProcedure
    .input(z.object({ consultationId: z.number() }))
    .query(async ({ ctx, input }) => {
      return getSoapNoteByConsultation(input.consultationId);
    }),

  updateSoap: protectedProcedure
    .input(
      z.object({
        consultationId: z.number(),
        subjective: z.string().optional(),
        objective: z.string().optional(),
        assessment: z.string().optional(),
        plan: z.string().optional(),
        fullNote: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const consultation = await getConsultationById(input.consultationId, ctx.user.id);
      if (!consultation) throw new TRPCError({ code: "NOT_FOUND" });
      const { consultationId, ...data } = input;
      await upsertSoapNote({
        consultationId,
        patientId: consultation.patientId,
        doctorId: ctx.user.id,
        ...data,
        isEdited: true,
      });
      return { success: true };
    }),

  complete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await updateConsultation(input.id, ctx.user.id, {
        status: "completed",
        completedAt: new Date(),
      });
      return { success: true };
    }),

  updateTranscription: protectedProcedure
    .input(z.object({ id: z.number(), transcription: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await updateConsultation(input.id, ctx.user.id, { transcription: input.transcription });
      return { success: true };
    }),

  exportSoapPdf: protectedProcedure
    .input(z.object({ consultationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const consultation = await getConsultationById(input.consultationId, ctx.user.id);
      if (!consultation) throw new TRPCError({ code: "NOT_FOUND", message: "Consulta não encontrada" });
      const soap = await getSoapNoteByConsultation(input.consultationId);
      if (!soap) throw new TRPCError({ code: "NOT_FOUND", message: "Nota SOAP não encontrada" });
      const patient = await getPatientById(consultation.patientId, ctx.user.id);
      const doctor = await getUserById(ctx.user.id);
      if (!patient || !doctor) throw new TRPCError({ code: "NOT_FOUND" });
      // Montar conteúdo SOAP formatado em texto estruturado
      const soapContent = [
        "S — SUBJETIVO",
        soap.subjective || "(não preenchido)",
        "",
        "O — OBJETIVO",
        soap.objective || "(não preenchido)",
        "",
        "A — AVALIAÇÃO",
        soap.assessment || "(não preenchido)",
        "",
        "P — PLANO",
        soap.plan || "(não preenchido)",
      ].join("\n");
      const { generateClinicalPdf } = await import("./_core/pdfGenerator");
      const pdfBuffer = await generateClinicalPdf({
        doctorName: doctor.name || "Médico",
        doctorCrm: doctor.crm || "Não informado",
        doctorSpecialty: doctor.specialty || undefined,
        patientName: patient.fullName,
        patientDob: patient.dateOfBirth || undefined,
        documentTitle: "Nota SOAP",
        documentContent: soapContent,
        generatedAt: new Date(),
      });
      const safeName = `SOAP_${patient.fullName.replace(/[^a-zA-Z0-9à-ü ]/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
      return {
        base64: pdfBuffer.toString("base64"),
        filename: safeName,
      };
    }),
});

// ─── Documents Router ─────────────────────────────────────────────────────────
const documentsRouter = router({
  byConsultation: protectedProcedure
    .input(z.object({ consultationId: z.number() }))
    .query(async ({ ctx, input }) => {
      return getDocumentsByConsultation(input.consultationId);
    }),

  byPatient: protectedProcedure
    .input(z.object({ patientId: z.number() }))
    .query(async ({ ctx, input }) => {
      return getDocumentsByPatient(input.patientId, ctx.user.id);
    }),

  generate: protectedProcedure
    .input(
      z.object({
        consultationId: z.number(),
        type: z.enum(["evolution", "prescription", "exam_request", "medical_certificate"]),
        additionalContext: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const consultation = await getConsultationById(input.consultationId, ctx.user.id);
      if (!consultation) throw new TRPCError({ code: "NOT_FOUND" });

      const soap = await getSoapNoteByConsultation(input.consultationId);

      const typeLabels: Record<string, string> = {
        evolution: "Evolução Clínica",
        prescription: "Prescrição Médica",
        exam_request: "Pedido de Exames",
        medical_certificate: "Atestado Médico",
      };

      const typeInstructions: Record<string, string> = {
        evolution: "Gere uma evolução clínica completa e detalhada para prontuário médico.",
        prescription: "Gere uma prescrição médica estruturada com os medicamentos mencionados, dosagens e instruções.",
        exam_request: "Gere um pedido de exames estruturado com os exames solicitados e indicações clínicas.",
        medical_certificate: "Gere um atestado médico formal com os dados necessários.",
      };

      const contextText = soap
        ? `SOAP:\nS: ${soap.subjective}\nO: ${soap.objective}\nA: ${soap.assessment}\nP: ${soap.plan}`
        : `Transcrição: ${consultation.transcription}`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Você é um assistente médico especializado em documentação clínica brasileira.
${typeInstructions[input.type]}
Use terminologia médica adequada, seja preciso e profissional.
Siga as normas do CFM e da legislação brasileira.
Inclua no rodapé: "Este documento foi gerado com auxílio de IA (Clari) e revisado pelo médico responsável."`,
          },
          {
            role: "user",
            content: `${contextText}\n\n${input.additionalContext ? `Contexto adicional: ${input.additionalContext}\n\n` : ""}Gere o documento: ${typeLabels[input.type]}`,
          },
        ],
      });

      const rawDocContent = response.choices[0]?.message?.content;
      const content = typeof rawDocContent === "string" ? rawDocContent : "";

      const result = await createClinicalDocument({
        consultationId: input.consultationId,
        patientId: consultation.patientId,
        doctorId: ctx.user.id,
        type: input.type,
        title: `${typeLabels[input.type]} — ${new Date().toLocaleDateString("pt-BR")}`,
        content,
      });

      return { id: result?.id, content, title: typeLabels[input.type] };
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership before updating
      const { getDb } = await import("./db");
      const { clinicalDocuments: clinDocs } = await import("../drizzle/schema");
      const { eq: eqDoc, and: andDoc } = await import("drizzle-orm");
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const owned = await dbConn
        .select({ id: clinDocs.id })
        .from(clinDocs)
        .where(andDoc(eqDoc(clinDocs.id, input.id), eqDoc(clinDocs.doctorId, ctx.user.id)))
        .limit(1);
      if (!owned[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Documento n\u00e3o encontrado" });
      await updateClinicalDocument(input.id, { content: input.content });
      return { success: true };
    }),

  exportPdf: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Usar query direta para buscar por ID
      const { getDb } = await import("./db");
      const { clinicalDocuments } = await import("../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const docRows = await db
        .select()
        .from(clinicalDocuments)
        .where(and(eq(clinicalDocuments.id, input.documentId), eq(clinicalDocuments.doctorId, ctx.user.id)))
        .limit(1);

      const doc = docRows[0];
      if (!doc) throw new TRPCError({ code: "NOT_FOUND" });

      const patient = await getPatientById(doc.patientId, ctx.user.id);
      const doctor = await getUserById(ctx.user.id);
      if (!patient || !doctor) throw new TRPCError({ code: "NOT_FOUND" });

      const { generateClinicalPdf } = await import("./_core/pdfGenerator");

      const pdfBuffer = await generateClinicalPdf({
        doctorName: doctor.name || "Médico",
        doctorCrm: doctor.crm || "Não informado",
        doctorSpecialty: doctor.specialty || undefined,
        patientName: patient.fullName,
        patientDob: patient.dateOfBirth || undefined,
        documentTitle: doc.title,
        documentContent: doc.content,
        generatedAt: new Date(),
      });

      return {
        base64: pdfBuffer.toString("base64"),
        filename: `${doc.title.replace(/[^a-zA-Z0-9à-ü]/g, "_")}.pdf`,
      };
    }),
});

// ─── Exams Router ─────────────────────────────────────────────────────────────
const examsRouter = router({
  byPatient: protectedProcedure
    .input(z.object({ patientId: z.number() }))
    .query(async ({ ctx, input }) => {
      return getExamsByPatient(input.patientId, ctx.user.id);
    }),

  upload: protectedProcedure
    .input(
      z.object({
        patientId: z.number(),
        consultationId: z.number().optional(),
        fileName: z.string(),
        fileType: z.string(),
        fileBase64: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const key = `exams/${ctx.user.id}/${input.patientId}/${Date.now()}-${input.fileName}`;
      const { url } = await storagePut(key, buffer, input.fileType);

      const result = await createExamUpload({
        patientId: input.patientId,
        doctorId: ctx.user.id,
        consultationId: input.consultationId,
        fileName: input.fileName,
        fileType: input.fileType,
        storageKey: key,
        storageUrl: url,
        analysisStatus: "pending",
      });

      return { id: result?.id, storageUrl: url };
    }),

  analyze: protectedProcedure
    .input(z.object({ examId: z.number(), storageUrl: z.string(), fileType: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await updateExamUpload(input.examId, { analysisStatus: "processing" });

      try {
        const isImage = input.fileType.startsWith("image/");

        const messages: Message[] = isImage
          ? [
              {
                role: "system",
                content: "Você é um assistente médico especializado em análise de exames. Analise a imagem e extraia todas as informações clínicas relevantes em português brasileiro.",
              },
              {
                role: "user",
                content: [
                  { type: "text" as const, text: "Analise este exame/laudo médico e extraia as informações clínicas relevantes:" },
                  { type: "image_url" as const, image_url: { url: input.storageUrl } },
                ],
              },
            ]
          : [
              {
                role: "system",
                content: "Você é um assistente médico especializado em análise de documentos clínicos. Analise o documento e extraia todas as informações clínicas relevantes em português brasileiro.",
              },
              {
                role: "user",
                content: [
                  { type: "text" as const, text: "Analise este documento médico e extraia as informações clínicas relevantes:" },
                  { type: "file_url" as const, file_url: { url: input.storageUrl, mime_type: "application/pdf" as const } },
                ],
              },
            ];

        const response = await invokeLLM({ messages });
        const rawContent = response.choices[0]?.message?.content;
        const extractedContext = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent) ?? "";

        await updateExamUpload(input.examId, {
          extractedContext,
          analysisStatus: "completed",
        });

        return { extractedContext };
      } catch (error) {
        await updateExamUpload(input.examId, { analysisStatus: "failed" });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Falha na análise do exame" });
      }
    }),
});

// ─── Clari Router ────────────────────────────────────────────────────────
const vitaRouter = router({
  getMessages: protectedProcedure
    .input(z.object({ consultationId: z.number() }))
    .query(async ({ ctx, input }) => {
      return getChatMessagesByConsultation(input.consultationId);
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        consultationId: z.number(),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const consultation = await getConsultationById(input.consultationId, ctx.user.id);
      if (!consultation) throw new TRPCError({ code: "NOT_FOUND" });

      const soap = await getSoapNoteByConsultation(input.consultationId);
      const previousMessages = await getChatMessagesByConsultation(input.consultationId);

      await createChatMessage({
        consultationId: input.consultationId,
        patientId: consultation.patientId,
        doctorId: ctx.user.id,
        role: "user",
        content: input.message,
      });

      const contextText = soap
        ? `Contexto do paciente em atendimento:\nS (Subjetivo): ${soap.subjective}\nO (Objetivo): ${soap.objective}\nA (Avaliação): ${soap.assessment}\nP (Plano): ${soap.plan}`
        : consultation.transcription
        ? `Transcrição da consulta: ${consultation.transcription}`
        : "Consulta em andamento sem dados registrados ainda.";

      const historyMessages = previousMessages.slice(-10).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Você é o Clari, um assistente clínico especializado para médicos brasileiros.
Você fornece suporte baseado em evidências científicas, diretrizes clínicas atualizadas e literatura médica.
Responda sempre em português brasileiro com precisão e objetividade.
IMPORTANTE: Sempre inclua ao final de cada resposta o aviso: "⚠️ Esta é uma sugestão baseada em evidências. A decisão clínica final é responsabilidade do médico."
Cite fontes quando relevante (ex: "Segundo as Diretrizes da SBC 2024...").

${contextText}`,
          },
          ...historyMessages,
          { role: "user", content: input.message },
        ],
      });

      const rawAssistantContent = response.choices[0]?.message?.content;
      const assistantContent = typeof rawAssistantContent === "string" ? rawAssistantContent : "Não foi possível gerar uma resposta.";

      await createChatMessage({
        consultationId: input.consultationId,
        patientId: consultation.patientId,
        doctorId: ctx.user.id,
        role: "assistant",
        content: assistantContent,
      });

      return { content: assistantContent };
    }),
});

// ─── Dashboard Router ─────────────────────────────────────────────────────────
const dashboardRouter = router({
  stats: protectedProcedure.query(async ({ ctx }) => {
    const [todayConsultations, allPatients, recentConsultations] = await Promise.all([
      getTodayConsultations(ctx.user.id),
      getPatientsByDoctor(ctx.user.id),
      getConsultationsByDoctor(ctx.user.id, 5),
    ]);

    return {
      todayCount: todayConsultations.length,
      totalPatients: allPatients.length,
      activePatients: allPatients.filter((p) => p.isActive).length,
      recentConsultations,
    };
  }),
});

// ─── Contact Router ───────────────────────────────────────────────────────────────────────────────
const contactRouter = router({
  send: publicProcedure
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email(),
      subject: z.string().min(1),
      message: z.string().min(10),
    }))
    .mutation(async ({ input }) => {
      const { notifyOwner } = await import("./_core/notification");
      const content = [
        `Nome: ${input.name}`,
        `E-mail: ${input.email}`,
        `Assunto: ${input.subject}`,
        ``,
        `Mensagem:`,
        input.message,
      ].join("\n");
      const ok = await notifyOwner({ title: `[NEURIX Contato] ${input.subject}`, content });
      return { success: ok };
    }),
});// ─── Helper: Extração de Problemas em Background ─────────────────────────────────────────────────────────────────────────────────
async function extractProblemsBackground(
  consultationId: number,
  consultation: { patientId: number; specialty?: string | null },
  soap: { subjective?: string; objective?: string; assessment?: string; plan?: string },
  doctorId: number
) {
  const existingProblems = await getProblemsByPatient(consultation.patientId, doctorId);
  const existingList =
    existingProblems.length > 0
      ? existingProblems.map((p) => `P${p.problemNumber}: ${p.title} (${p.status})`).join("\n")
      : "Nenhum problema cadastrado ainda.";

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é um assistente clínico especializado em organização de prontuários médicos.
Analise a nota SOAP e identifique os problemas/diagnósticos clínicos relevantes.

Problemas já registrados para este paciente:
${existingList}

REGRAS:
1. Se o problema já existe na lista acima (mesmo que com palavras diferentes), retorne com isnew: false e o id do problema existente mais parecido
2. Se é um problema genuinamente novo, retorne com isnew: true
3. Ignore achados transitórios sem significado clínico (ex: "cefaleia leve isolada")
4. Máximo de 5 problemas por consulta
5. Retorne APENAS JSON, sem texto adicional`,
      },
      {
        role: "user",
        content: `Especialidade: ${consultation.specialty || "não informada"}\n\nSOAP desta consulta:\nSubjetivo: ${soap.subjective ?? ""}\nObjetivo: ${soap.objective ?? ""}\nAvaliação: ${soap.assessment ?? ""}\nPlano: ${soap.plan ?? ""}\n\nExtraia os problemas clínicos relevantes.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "problems_extraction",
        strict: true,
        schema: {
          type: "object",
          properties: {
            problems: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Nome do problema/diagnóstico, conciso" },
                  description: { type: "string", description: "Breve contexto clínico desta consulta" },
                  status: { type: "string", enum: ["active", "controlled", "resolved", "monitoring"] },
                  isnew: { type: "boolean" },
                  existingId: { type: "number", description: "ID do problema existente se isnew=false, ou 0 se novo" },
                },
                required: ["title", "description", "status", "isnew", "existingId"],
                additionalProperties: false,
              },
            },
          },
          required: ["problems"],
          additionalProperties: false,
        },
      },
    },
  });

  const rawContent = response.choices[0]?.message?.content;
  const content = typeof rawContent === "string" ? rawContent : null;
  if (!content) return;

  const { problems } = JSON.parse(content) as {
    problems: Array<{ title: string; description: string; status: "active" | "controlled" | "resolved" | "monitoring"; isnew: boolean; existingId: number }>;
  };

  for (const problem of problems) {
    if (problem.isnew) {
      const problemNumber = await getNextProblemNumber(consultation.patientId, doctorId);
      await upsertPatientProblem({
        patientId: consultation.patientId,
        doctorId,
        title: problem.title,
        description: problem.description,
        status: problem.status,
        identifiedBySpecialty: consultation.specialty ?? undefined,
        firstSeenConsultationId: consultationId,
        lastSeenConsultationId: consultationId,
        problemNumber,
      });
    } else if (problem.existingId > 0) {
      const existing = existingProblems.find((p) => p.id === problem.existingId);
      if (existing) {
        await upsertPatientProblem({
          id: problem.existingId,
          patientId: consultation.patientId,
          doctorId,
          title: existing.title,
          description: problem.description,
          status: problem.status,
          lastSeenConsultationId: consultationId,
          problemNumber: existing.problemNumber,
        });
      }
    }
  }
}

// ─── Problems Router ───────────────────────────────────────────────────────────────────────────────────
const problemsRouter = router({
  byPatient: protectedProcedure
    .input(z.object({ patientId: z.number() }))
    .query(async ({ ctx, input }) => {
      return getProblemsByPatient(input.patientId, ctx.user.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["active", "controlled", "resolved", "monitoring"]).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Buscar o problema existente para garantir que pertence ao médico
      const { getDb } = await import("./db");
      const { patientProblems: pp } = await import("../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const rows = await db
        .select()
        .from(pp)
        .where(and(eq(pp.id, input.id), eq(pp.doctorId, ctx.user.id)))
        .limit(1);

      const problem = rows[0];
      if (!problem) throw new TRPCError({ code: "NOT_FOUND", message: "Problema não encontrado" });

      // Atualizar apenas os campos enviados
      const updateData: Record<string, unknown> = {};
      if (input.status !== undefined) updateData.status = input.status;
      if (input.description !== undefined) updateData.description = input.description;

      await db.update(pp).set(updateData).where(eq(pp.id, input.id));
      return { success: true };
    }),

  extractFromSoap: protectedProcedure
    .input(z.object({ consultationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const consultation = await getConsultationById(input.consultationId, ctx.user.id);
      if (!consultation) throw new TRPCError({ code: "NOT_FOUND" });
      const soap = await getSoapNoteByConsultation(input.consultationId);
      if (!soap) throw new TRPCError({ code: "BAD_REQUEST", message: "SOAP não gerado ainda" });
      await extractProblemsBackground(
        input.consultationId,
        consultation,
        {
          subjective: soap.subjective ?? undefined,
          objective: soap.objective ?? undefined,
          assessment: soap.assessment ?? undefined,
          plan: soap.plan ?? undefined,
        },
        ctx.user.id
      );
      const problems = await getProblemsByPatient(consultation.patientId, ctx.user.id);
      return { extracted: problems.length, problems };
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────────────────────────
// ─── Admin Router ─────────────────────────────────────────────────────────────
const adminRouter = router({
  listUsers: superadminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const [users, total] = await Promise.all([
        getAllUsers({ limit: input.limit, offset: input.offset, search: input.search }),
        countAllUsers(input.search),
      ]);
      return { users, total };
    }),

  approveUser: superadminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      await updateUserStatus(input.userId, { accountStatus: "approved" });
      return { success: true };
    }),

  blockUser: superadminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      await updateUserStatus(input.userId, { accountStatus: "blocked" });
      return { success: true };
    }),

  setRole: superadminProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(["user", "admin", "superadmin"]),
    }))
    .mutation(async ({ input }) => {
      await updateUserStatus(input.userId, { role: input.role });
      return { success: true };
    }),
});

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  patients: patientsRouter,
  consultations: consultationsRouter,
  documents: documentsRouter,
  exams: examsRouter,
  vita: vitaRouter,
  dashboard: dashboardRouter,
  contact: contactRouter,
  stripe: stripeRouter,
  problems: problemsRouter,
  admin: adminRouter,
});
export type AppRouter = typeof appRouter;
