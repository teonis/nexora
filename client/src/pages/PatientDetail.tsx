import ClinicalLayout from "@/components/ClinicalLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  Phone,
  Plus,
  Stethoscope,
  Upload,
  User,
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { useRef } from "react";

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const patientId = parseInt(id ?? "0");
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: patient, isLoading } = trpc.patients.get.useQuery({ id: patientId });
  const { data: consultations } = trpc.consultations.byPatient.useQuery({ patientId });
  const { data: documents } = trpc.documents.byPatient.useQuery({ patientId });
  const { data: exams } = trpc.exams.byPatient.useQuery({ patientId });

  const createConsultation = trpc.consultations.create.useMutation({
    onSuccess: (result) => {
      if (result?.id) navigate(`/consultation/${result.id}`);
    },
    onError: (err) => toast.error("Erro ao iniciar consulta: " + err.message),
  });

  const uploadExam = trpc.exams.upload.useMutation({
    onSuccess: () => toast.success("Exame enviado com sucesso!"),
    onError: (err) => toast.error("Erro ao enviar exame: " + err.message),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadExam.mutate({
        patientId,
        fileName: file.name,
        fileType: file.type,
        fileBase64: base64,
      });
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <ClinicalLayout title="Paciente">
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </ClinicalLayout>
    );
  }

  if (!patient) {
    return (
      <ClinicalLayout title="Paciente não encontrado">
        <div className="text-center py-20">
          <p className="text-muted-foreground">Paciente não encontrado</p>
          <Button className="mt-4" onClick={() => navigate("/patients")}>Voltar</Button>
        </div>
      </ClinicalLayout>
    );
  }

  const age = patient.dateOfBirth
    ? Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null;

  return (
    <ClinicalLayout
      title={patient.fullName}
      subtitle={age ? `${age} anos${patient.gender === "female" ? " · Feminino" : patient.gender === "male" ? " · Masculino" : ""}` : undefined}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/patients")}>
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Voltar
          </Button>
          <Button size="sm" onClick={() => createConsultation.mutate({ patientId, chiefComplaint: "" })}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Nova Consulta
          </Button>
        </div>
      }
    >
      <div className="max-w-4xl space-y-5">
        {/* Patient summary card */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/8 flex items-center justify-center flex-shrink-0">
              <span className="text-base font-semibold text-primary">
                {patient.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-foreground">{patient.fullName}</h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                {patient.dateOfBirth && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(patient.dateOfBirth).toLocaleDateString("pt-BR")} ({age} anos)
                  </span>
                )}
                {patient.phone && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    {patient.phone}
                  </span>
                )}
                {patient.cpf && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    CPF: {patient.cpf}
                  </span>
                )}
                {patient.bloodType && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                    {patient.bloodType}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Clinical alerts */}
          {(patient.allergies || patient.chronicConditions) && (
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3">
              {patient.allergies && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-[10px] font-semibold text-red-700 uppercase tracking-wider mb-1">⚠ Alergias</p>
                  <p className="text-xs text-red-800">{patient.allergies}</p>
                </div>
              )}
              {patient.chronicConditions && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider mb-1">Condições Crônicas</p>
                  <p className="text-xs text-blue-800">{patient.chronicConditions}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="consultations">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="consultations" className="flex-1 sm:flex-none">
              <Stethoscope className="w-3.5 h-3.5 mr-1.5" />
              Consultas ({consultations?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex-1 sm:flex-none">
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Documentos ({documents?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="exams" className="flex-1 sm:flex-none">
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Exames ({exams?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 sm:flex-none">
              <User className="w-3.5 h-3.5 mr-1.5" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Consultations tab */}
          <TabsContent value="consultations" className="mt-4">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {!consultations?.length ? (
                <div className="p-8 text-center">
                  <Stethoscope className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma consulta registrada</p>
                  <Button size="sm" className="mt-3" onClick={() => createConsultation.mutate({ patientId, chiefComplaint: "" })}>
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Iniciar Consulta
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {consultations.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/consultation/${c.id}`)}
                      className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors text-left group"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/8 flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {c.chiefComplaint ?? "Consulta sem queixa registrada"}
                        </p>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(c.startedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${c.status === "completed" ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                        {c.status === "completed" ? "Concluída" : "Em andamento"}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Documents tab */}
          <TabsContent value="documents" className="mt-4">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {!documents?.length ? (
                <div className="p-8 text-center">
                  <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum documento gerado</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Documentos são gerados durante as consultas</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-4 px-5 py-3.5">
                      <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border capitalize">
                        {doc.type === "evolution" ? "Evolução" : doc.type === "prescription" ? "Prescrição" : doc.type === "exam_request" ? "Pedido de Exame" : "Atestado"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Exams tab */}
          <TabsContent value="exams" className="mt-4">
            <div className="space-y-3">
              <div className="flex justify-end">
                <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
                <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadExam.isPending}>
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  {uploadExam.isPending ? "Enviando..." : "Enviar Exame"}
                </Button>
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                {!exams?.length ? (
                  <div className="p-8 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhum exame enviado</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Envie PDFs ou imagens de exames e laudos</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {exams.map((exam) => (
                      <div key={exam.id} className="flex items-center gap-4 px-5 py-3.5">
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{exam.fileName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(exam.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                          {exam.extractedContext && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{exam.extractedContext}</p>
                          )}
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${exam.analysisStatus === "completed" ? "bg-green-50 text-green-700 border-green-200" : exam.analysisStatus === "processing" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-muted text-muted-foreground border-border"}`}>
                          {exam.analysisStatus === "completed" ? "Analisado" : exam.analysisStatus === "processing" ? "Analisando..." : "Pendente"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* History tab */}
          <TabsContent value="history" className="mt-4">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              {patient.currentMedications && (
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1.5">Medicamentos em Uso</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{patient.currentMedications}</p>
                </div>
              )}
              {patient.familyHistory && (
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1.5">Histórico Familiar</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{patient.familyHistory}</p>
                </div>
              )}
              {patient.notes && (
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1.5">Observações</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{patient.notes}</p>
                </div>
              )}
              {!patient.currentMedications && !patient.familyHistory && !patient.notes && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum histórico registrado</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ClinicalLayout>
  );
}
