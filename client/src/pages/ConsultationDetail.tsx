import ClinicalLayout from "@/components/ClinicalLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Bot,
  CheckCircle,
  FileText,
  Loader2,
  Mic,
  MicOff,
  RefreshCw,
  Save,
  Shield,
  Sparkles,
  Square,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function ConsultationDetail() {
  const { id } = useParams<{ id: string }>();
  const consultationId = parseInt(id ?? "0");
  const [, navigate] = useLocation();

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // SOAP editing state
  const [soapEdit, setSoapEdit] = useState({ subjective: "", objective: "", assessment: "", plan: "" });
  const [soapDirty, setSoapDirty] = useState(false);

  const utils = trpc.useUtils();
  const { data: consultation, isLoading } = trpc.consultations.get.useQuery({ id: consultationId });
  const { data: patient } = trpc.patients.get.useQuery(
    { id: consultation?.patientId ?? 0 },
    { enabled: !!consultation?.patientId }
  );
  const { data: soap, isLoading: soapLoading } = trpc.consultations.getSoap.useQuery({ consultationId });
  const { data: documents } = trpc.documents.byConsultation.useQuery({ consultationId });

  // Sync SOAP to edit state
  useEffect(() => {
    if (soap && !soapDirty) {
      setSoapEdit({
        subjective: soap.subjective ?? "",
        objective: soap.objective ?? "",
        assessment: soap.assessment ?? "",
        plan: soap.plan ?? "",
      });
    }
  }, [soap, soapDirty]);

  const transcribeMutation = trpc.consultations.transcribeAudio.useMutation({
    onSuccess: (data) => {
      toast.success("Transcrição concluída!");
      utils.consultations.get.invalidate({ id: consultationId });
    },
    onError: (err) => toast.error("Erro na transcrição: " + err.message),
  });

  const generateSoapMutation = trpc.consultations.generateSoap.useMutation({
    onSuccess: () => {
      toast.success("Nota SOAP gerada com sucesso!");
      utils.consultations.getSoap.invalidate({ consultationId });
      setSoapDirty(false);
    },
    onError: (err) => toast.error("Erro ao gerar SOAP: " + err.message),
  });

  const updateSoapMutation = trpc.consultations.updateSoap.useMutation({
    onSuccess: () => {
      toast.success("SOAP salvo!");
      setSoapDirty(false);
      utils.consultations.getSoap.invalidate({ consultationId });
    },
    onError: (err) => toast.error("Erro ao salvar SOAP: " + err.message),
  });

  const completeMutation = trpc.consultations.complete.useMutation({
    onSuccess: () => {
      toast.success("Consulta concluída!");
      utils.consultations.get.invalidate({ id: consultationId });
    },
  });

  const generateDocMutation = trpc.documents.generate.useMutation({
    onSuccess: () => {
      toast.success("Documento gerado!");
      utils.documents.byConsultation.invalidate({ consultationId });
    },
    onError: (err) => toast.error("Erro ao gerar documento: " + err.message),
  });

  const updateTranscriptionMutation = trpc.consultations.updateTranscription.useMutation();

  // Upload audio to storage then transcribe
  const uploadAndTranscribe = useCallback(async (audioBlob: Blob) => {
    try {
      toast.info("Processando áudio...");
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = "";
      uint8Array.forEach((b) => { binary += String.fromCharCode(b); });
      const audioBase64 = btoa(binary);
      // Upload via storage endpoint
      const uploadRes = await fetch("/api/upload-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64, mimeType: "audio/webm" }),
      });
      if (!uploadRes.ok) throw new Error("Falha no upload do áudio");
      const { url } = await uploadRes.json();
      await transcribeMutation.mutateAsync({ consultationId, audioUrl: url });
    } catch (err: unknown) {
      // Fallback: show manual transcription option
      toast.error("Não foi possível processar o áudio automaticamente. Você pode digitar a transcrição manualmente.");
    }
  }, [consultationId, transcribeMutation]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        // LGPD: audio is processed and NOT stored permanently
        await uploadAndTranscribe(blob);
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      toast.error("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (isLoading) {
    return (
      <ClinicalLayout title="Consulta">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </ClinicalLayout>
    );
  }

  if (!consultation) {
    return (
      <ClinicalLayout title="Consulta não encontrada">
        <div className="text-center py-20">
          <p className="text-muted-foreground">Consulta não encontrada</p>
          <Button className="mt-4" onClick={() => navigate("/dashboard")}>Voltar</Button>
        </div>
      </ClinicalLayout>
    );
  }

  const isCompleted = consultation.status === "completed";

  return (
    <ClinicalLayout
      title={patient ? `Consulta — ${patient.fullName}` : "Consulta"}
      subtitle={new Date(consultation.startedAt).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(patient ? `/patients/${patient.id}` : "/dashboard")}>
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Voltar
          </Button>
          {!isCompleted && (
            <Button size="sm" variant="outline" onClick={() => completeMutation.mutate({ id: consultationId })} disabled={completeMutation.isPending}>
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
              Concluir
            </Button>
          )}
        </div>
      }
    >
      <div className="max-w-4xl space-y-5">
        {/* Status banner */}
        {isCompleted && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-800 font-medium">Consulta concluída</p>
          </div>
        )}

        {/* LGPD notice */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800">
            <strong>LGPD:</strong> O áudio gravado é processado e descartado automaticamente após a transcrição. Nenhum arquivo de áudio é armazenado. O Vita AI é um suporte clínico — a decisão médica é responsabilidade do profissional.
          </p>
        </div>

        <Tabs defaultValue="recording">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="recording" className="flex-1 sm:flex-none">
              <Mic className="w-3.5 h-3.5 mr-1.5" />
              Gravação
            </TabsTrigger>
            <TabsTrigger value="soap" className="flex-1 sm:flex-none">
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              SOAP
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex-1 sm:flex-none">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="vita" className="flex-1 sm:flex-none">
              <Bot className="w-3.5 h-3.5 mr-1.5" />
              Vita AI
            </TabsTrigger>
          </TabsList>

          {/* ─── Recording Tab ─── */}
          <TabsContent value="recording" className="mt-4 space-y-4">
            {/* Recording control */}
            {!isCompleted && (
              <div className="bg-card border border-border rounded-xl p-6 text-center space-y-4">
                <div className="flex flex-col items-center gap-3">
                  {isRecording ? (
                    <>
                      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full bg-red-200 animate-ping opacity-50" />
                        <Mic className="w-7 h-7 text-red-600 relative z-10" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-foreground">Gravando...</p>
                        <p className="text-2xl font-mono text-red-600 mt-1">{formatTime(recordingTime)}</p>
                      </div>
                      <Button variant="destructive" onClick={stopRecording} className="gap-2">
                        <Square className="w-4 h-4" />
                        Parar Gravação
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-primary/8 flex items-center justify-center">
                        <MicOff className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-foreground">Pronto para gravar</p>
                        <p className="text-xs text-muted-foreground mt-1">Clique para iniciar a gravação da consulta</p>
                      </div>
                      <Button onClick={startRecording} className="gap-2">
                        <Mic className="w-4 h-4" />
                        Iniciar Gravação
                      </Button>
                    </>
                  )}
                </div>
                {transcribeMutation.isPending && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Transcrevendo áudio...
                  </div>
                )}
              </div>
            )}

            {/* Transcription */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Transcrição</h3>
                {consultation.transcription && !isCompleted && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateSoapMutation.mutate({ consultationId })}
                    disabled={generateSoapMutation.isPending}
                  >
                    {generateSoapMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Gerar SOAP
                  </Button>
                )}
              </div>

              {consultation.transcription ? (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{consultation.transcription}</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {isCompleted ? "Nenhuma transcrição registrada" : "Grave a consulta ou digite a transcrição manualmente:"}
                  </p>
                  {!isCompleted && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Digite ou cole a transcrição da consulta aqui..."
                        rows={6}
                        id="manual-transcription"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            const el = document.getElementById("manual-transcription") as HTMLTextAreaElement;
                            if (el?.value) {
                              updateTranscriptionMutation.mutate({ id: consultationId, transcription: el.value });
                              utils.consultations.get.invalidate({ id: consultationId });
                              toast.success("Transcrição salva!");
                            }
                          }}
                        >
                          <Save className="w-3.5 h-3.5 mr-1.5" />
                          Salvar Transcrição
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ─── SOAP Tab ─── */}
          <TabsContent value="soap" className="mt-4 space-y-4">
            {soapLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : !soap && !consultation.transcription ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma nota SOAP gerada</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Grave a consulta e clique em "Gerar SOAP" para criar a nota automaticamente</p>
              </div>
            ) : (
              <>
                {!soap && consultation.transcription && !isCompleted && (
                  <Button
                    onClick={() => generateSoapMutation.mutate({ consultationId })}
                    disabled={generateSoapMutation.isPending}
                    className="w-full"
                  >
                    {generateSoapMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Gerar Nota SOAP com IA
                  </Button>
                )}

                {soap && (
                  <div className="space-y-3">
                    {[
                      { key: "subjective", label: "S — Subjetivo", color: "border-l-blue-400", desc: "Queixa principal, história da doença atual, medicamentos, alergias" },
                      { key: "objective", label: "O — Objetivo", color: "border-l-green-400", desc: "Sinais vitais, exame físico, resultados de testes" },
                      { key: "assessment", label: "A — Avaliação", color: "border-l-amber-400", desc: "Diagnóstico(s), diagnóstico diferencial" },
                      { key: "plan", label: "P — Plano", color: "border-l-purple-400", desc: "Prescrições, exames, encaminhamentos, orientações" },
                    ].map(({ key, label, color, desc }) => (
                      <div key={key} className={`bg-card border border-border border-l-4 ${color} rounded-xl p-4 space-y-2`}>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{label}</p>
                          <p className="text-[10px] text-muted-foreground">{desc}</p>
                        </div>
                        {isCompleted ? (
                          <p className="text-sm text-foreground whitespace-pre-wrap">{soapEdit[key as keyof typeof soapEdit]}</p>
                        ) : (
                          <Textarea
                            value={soapEdit[key as keyof typeof soapEdit]}
                            onChange={(e) => {
                              setSoapEdit((prev) => ({ ...prev, [key]: e.target.value }));
                              setSoapDirty(true);
                            }}
                            rows={3}
                            className="text-sm"
                          />
                        )}
                      </div>
                    ))}

                    {!isCompleted && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateSoapMutation.mutate({ consultationId, ...soapEdit })}
                          disabled={updateSoapMutation.isPending || !soapDirty}
                          size="sm"
                        >
                          {updateSoapMutation.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                          Salvar SOAP
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateSoapMutation.mutate({ consultationId })}
                          disabled={generateSoapMutation.isPending}
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                          Regenerar
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* ─── Documents Tab ─── */}
          <TabsContent value="documents" className="mt-4 space-y-4">
            {!isCompleted && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { type: "evolution" as const, label: "Evolução", icon: FileText },
                  { type: "prescription" as const, label: "Prescrição", icon: FileText },
                  { type: "exam_request" as const, label: "Pedido de Exame", icon: FileText },
                  { type: "medical_certificate" as const, label: "Atestado", icon: FileText },
                ].map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => generateDocMutation.mutate({ consultationId, type })}
                    disabled={generateDocMutation.isPending}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/3 transition-all text-center group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center group-hover:bg-primary/14 transition-colors">
                      {generateDocMutation.isPending ? (
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      ) : (
                        <Icon className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-foreground">{label}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {!documents?.length ? (
                <div className="p-8 text-center">
                  <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum documento gerado</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Clique nos botões acima para gerar documentos</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{doc.title}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                          {doc.type === "evolution" ? "Evolução" : doc.type === "prescription" ? "Prescrição" : doc.type === "exam_request" ? "Pedido" : "Atestado"}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/40 border border-border max-h-40 overflow-y-auto">
                        <p className="text-xs text-foreground whitespace-pre-wrap">{doc.content}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => {
                            const blob = new Blob([doc.content ?? ""], { type: "text/plain;charset=utf-8" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${doc.title}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                        >
                          Exportar TXT
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => {
                            const printWindow = window.open("", "_blank");
                            if (printWindow) {
                              printWindow.document.write(`<html><head><title>${doc.title}</title><style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto;line-height:1.6}h1{font-size:18px;margin-bottom:20px}pre{white-space:pre-wrap;font-family:inherit}</style></head><body><h1>${doc.title}</h1><pre>${doc.content}</pre></body></html>`);
                              printWindow.document.close();
                              printWindow.print();
                            }
                          }}
                        >
                          Imprimir / PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ─── Vita AI Tab ─── */}
          <TabsContent value="vita" className="mt-4">
            <VitaChat consultationId={consultationId} />
          </TabsContent>
        </Tabs>
      </div>
    </ClinicalLayout>
  );
}

// ─── Vita AI Chat Component ────────────────────────────────────────────────
function VitaChat({ consultationId }: { consultationId: number }) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const { data: messages, isLoading } = trpc.vita.getMessages.useQuery({ consultationId });

  const sendMutation = trpc.vita.sendMessage.useMutation({
    onSuccess: () => {
      utils.vita.getMessages.invalidate({ consultationId });
      setMessage("");
    },
    onError: (err) => toast.error("Erro ao enviar mensagem: " + err.message),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || sendMutation.isPending) return;
    sendMutation.mutate({ consultationId, message: message.trim() });
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col" style={{ height: "500px" }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
          <Bot className="w-4 h-4 text-violet-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Vita AI</p>
          <p className="text-[10px] text-muted-foreground">Assistente clínico baseado em evidências</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : !messages?.length ? (
          <div className="text-center py-8">
            <Bot className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Olá! Sou o Vita AI.</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Faça perguntas sobre o caso clínico, diagnóstico diferencial, conduta ou medicamentos.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border border-border"}`}>
                {msg.role === "assistant" ? (
                  <div className="text-sm text-foreground prose prose-sm max-w-none">
                    <Streamdown>{msg.content}</Streamdown>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </div>
            </div>
          ))
        )}
        {sendMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-muted border border-border rounded-xl px-3.5 py-2.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Pergunte ao Vita AI..."
          className="flex-1 text-sm bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          disabled={sendMutation.isPending}
        />
        <Button size="sm" onClick={handleSend} disabled={!message.trim() || sendMutation.isPending}>
          {sendMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Enviar"}
        </Button>
      </div>
    </div>
  );
}
