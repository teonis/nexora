import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createChatMessage,
  createClinicalDocument,
  createConsultation,
  createExamUpload,
  createPatient,
  getChatMessagesByConsultation,
  getConsultationById,
  getConsultationsByDoctor,
  getConsultationsByPatient,
  getDocumentsByConsultation,
  getDocumentsByPatient,
  getExamsByPatient,
  getPatientById,
  getPatientsByDoctor,
  getSoapNoteByConsultation,
  getTodayConsultations,
  updateConsultation,
  updateClinicalDocument,
  updateExamUpload,
  updatePatient,
  updateUserProfile,
  upsertSoapNote,
} from "./db";
import { invokeLLM, type Message } from "./_core/llm";
import { transcribeAudio } from "./_core/voiceTranscription";
import { storagePut } from "./storage";
import { systemRouter } from "./_core/systemRouter";
import { stripeRouter } from "./stripeRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";

// ─── Auth Router ──────────────────────────────────────────────────────────────
const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),
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
    .input(z.object({ patientId: z.number(), chiefComplaint: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const result = await createConsultation({
        patientId: input.patientId,
        doctorId: ctx.user.id,
        chiefComplaint: input.chiefComplaint,
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

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Você é um assistente médico especializado em documentação clínica. 
Analise a transcrição de consulta médica e gere uma nota clínica estruturada no formato SOAP em português brasileiro.
Seja preciso, objetivo e use terminologia médica adequada.
Retorne APENAS o JSON estruturado, sem texto adicional.`,
          },
          {
            role: "user",
            content: `Transcrição da consulta:\n\n${consultation.transcription}\n\nGere a nota SOAP estruturada.`,
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
                assessment: { type: "string", description: "Diagnóstico(s) presumido(s), diagnóstico diferencial" },
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
      await updateClinicalDocument(input.id, { content: input.content });
      return { success: true };
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
      const ok = await notifyOwner({ title: `[NEXORA Contato] ${input.subject}`, content });
      return { success: ok };
    }),
});

// ─── App Router ────────────────────────────────────────────────────────────────────────────────
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
});
export type AppRouter = typeof appRouter;
