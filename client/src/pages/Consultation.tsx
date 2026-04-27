import ClinicalLayout from "@/components/ClinicalLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft, ArrowRight, Search, Stethoscope, User } from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const SPECIALTIES = [
  { value: "endocrinologia", label: "Endocrinologia" },
  { value: "nutrologia", label: "Nutrologia" },
  { value: "ginecologia", label: "Ginecologia" },
  { value: "dermatologia", label: "Dermatologia" },
  { value: "cardiologia", label: "Cardiologia" },
  { value: "clinica geral", label: "Clínica Geral" },
  { value: "medicina de familia", label: "Medicina de Família" },
  { value: "pediatria", label: "Pediatria" },
  { value: "ortopedia", label: "Ortopedia" },
  { value: "psiquiatria", label: "Psiquiatria" },
  { value: "neurologia", label: "Neurologia" },
];

export default function Consultation() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [chiefComplaint, setChiefComplaint] = useState("");
  const { user } = useAuth();

  // Normalizar string para comparar sem acentos
  const normalizeStr = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  // Usar a especialidade do perfil do médico como valor padrão
  const defaultSpecialty = useMemo(() => {
    if (!user?.specialty) return "";
    const normalized = normalizeStr(user.specialty);
    const match = SPECIALTIES.find(
      (s) => normalizeStr(s.value) === normalized || normalizeStr(s.label) === normalized
    );
    return match?.value ?? "";
  }, [user?.specialty]);

  const [specialty, setSpecialty] = useState("");
  const effectiveSpecialty = specialty || defaultSpecialty;

  const { data: patients } = trpc.patients.list.useQuery({ search: search || undefined });
  const selectedPatient = patients?.find((p) => p.id === selectedPatientId);

  const createConsultation = trpc.consultations.create.useMutation({
    onSuccess: (result) => {
      if (result?.id) navigate(`/consultation/${result.id}`);
    },
    onError: (err) => toast.error("Erro ao iniciar consulta: " + err.message),
  });

  const handleStart = () => {
    if (!selectedPatientId) {
      toast.error("Selecione um paciente para iniciar a consulta");
      return;
    }
    createConsultation.mutate({
      patientId: selectedPatientId,
      chiefComplaint,
      specialty: effectiveSpecialty || undefined,
    });
  };

  return (
    <ClinicalLayout
      title="Nova Consulta"
      subtitle="Selecione o paciente e inicie o atendimento"
      actions={
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Voltar
        </Button>
      }
    >
      <div className="max-w-xl space-y-5">
        {/* Patient selection */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">1. Selecionar Paciente</h3>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {selectedPatient ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">
                  {selectedPatient.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{selectedPatient.fullName}</p>
                {selectedPatient.dateOfBirth && (
                  <p className="text-xs text-muted-foreground">
                    {Math.floor((Date.now() - new Date(selectedPatient.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000))} anos
                  </p>
                )}
              </div>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelectedPatientId(null)}>
                Trocar
              </Button>
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto rounded-lg border border-border divide-y divide-border">
              {!patients?.length ? (
                <div className="p-4 text-center">
                  <User className="w-6 h-6 text-muted-foreground/30 mx-auto mb-1.5" />
                  <p className="text-xs text-muted-foreground">
                    {search ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}
                  </p>
                  <Button size="sm" variant="link" className="text-xs mt-1" onClick={() => navigate("/patients/new")}>
                    Cadastrar novo paciente
                  </Button>
                </div>
              ) : (
                patients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/8 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {patient.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{patient.fullName}</p>
                      {patient.dateOfBirth && (
                        <p className="text-xs text-muted-foreground">
                          {Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000))} anos
                        </p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Specialty selector */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">2. Especialidade</h3>
          <div className="space-y-1.5">
            <Label htmlFor="specialty" className="text-xs text-muted-foreground">
              Especialidade desta consulta
              {defaultSpecialty && !specialty && (
                <span className="ml-1 text-primary">(padrão do perfil)</span>
              )}
            </Label>
            <Select value={effectiveSpecialty} onValueChange={setSpecialty}>
              <SelectTrigger id="specialty">
                <SelectValue placeholder="Selecione a especialidade..." />
              </SelectTrigger>
              <SelectContent>
                {SPECIALTIES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chief complaint */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">3. Queixa Principal (opcional)</h3>
          <div className="space-y-1.5">
            <Label htmlFor="complaint" className="text-xs text-muted-foreground">
              Descreva brevemente o motivo da consulta
            </Label>
            <Textarea
              id="complaint"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="Ex: Cefaleia há 3 dias, dor abdominal, retorno para acompanhamento de HAS..."
              rows={3}
            />
          </div>
        </div>

        {/* Start button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleStart}
          disabled={!selectedPatientId || createConsultation.isPending}
        >
          {createConsultation.isPending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Stethoscope className="w-4 h-4 mr-2" />
          )}
          Iniciar Consulta
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </ClinicalLayout>
  );
}
