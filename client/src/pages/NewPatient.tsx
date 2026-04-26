import ClinicalLayout from "@/components/ClinicalLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function NewPatient() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "" as "male" | "female" | "other" | "",
    cpf: "",
    phone: "",
    email: "",
    address: "",
    bloodType: "",
    allergies: "",
    chronicConditions: "",
    currentMedications: "",
    familyHistory: "",
    notes: "",
  });

  const createMutation = trpc.patients.create.useMutation({
    onSuccess: (result) => {
      toast.success("Paciente cadastrado com sucesso!");
      navigate(`/patients/${result?.id}`);
    },
    onError: (err) => {
      toast.error("Erro ao cadastrar paciente: " + err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast.error("Nome completo é obrigatório");
      return;
    }
    createMutation.mutate({
      ...form,
      gender: form.gender || undefined,
      email: form.email || undefined,
    });
  };

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <ClinicalLayout
      title="Novo Paciente"
      subtitle="Cadastrar novo paciente"
      actions={
        <Button variant="ghost" size="sm" onClick={() => navigate("/patients")}>
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Voltar
        </Button>
      }
    >
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal data */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Dados Pessoais</h3>

            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs">Nome Completo *</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder="Nome completo do paciente"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dateOfBirth" className="text-xs">Data de Nascimento</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => set("dateOfBirth", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Sexo</Label>
                <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cpf" className="text-xs">CPF</Label>
                <Input
                  id="cpf"
                  value={form.cpf}
                  onChange={(e) => set("cpf", e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bloodType" className="text-xs">Tipo Sanguíneo</Label>
                <Select value={form.bloodType} onValueChange={(v) => set("bloodType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs">Telefone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs">Endereço</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Endereço completo"
              />
            </div>
          </div>

          {/* Clinical data */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Histórico Clínico</h3>

            <div className="space-y-1.5">
              <Label htmlFor="allergies" className="text-xs">Alergias e Reações Adversas</Label>
              <Textarea
                id="allergies"
                value={form.allergies}
                onChange={(e) => set("allergies", e.target.value)}
                placeholder="Ex: Penicilina, AAS, látex..."
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="chronicConditions" className="text-xs">Condições Crônicas</Label>
              <Textarea
                id="chronicConditions"
                value={form.chronicConditions}
                onChange={(e) => set("chronicConditions", e.target.value)}
                placeholder="Ex: Hipertensão arterial, Diabetes mellitus tipo 2..."
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="currentMedications" className="text-xs">Medicamentos em Uso</Label>
              <Textarea
                id="currentMedications"
                value={form.currentMedications}
                onChange={(e) => set("currentMedications", e.target.value)}
                placeholder="Ex: Metformina 850mg 2x/dia, Losartana 50mg 1x/dia..."
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="familyHistory" className="text-xs">Histórico Familiar</Label>
              <Textarea
                id="familyHistory"
                value={form.familyHistory}
                onChange={(e) => set("familyHistory", e.target.value)}
                placeholder="Ex: Pai: IAM, Mãe: DM tipo 2..."
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs">Observações Gerais</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Outras informações relevantes..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={createMutation.isPending} className="flex-1 sm:flex-none">
              {createMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-3.5 h-3.5 mr-1.5" />
              )}
              Cadastrar Paciente
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/patients")}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </ClinicalLayout>
  );
}
