import ClinicalLayout from "@/components/ClinicalLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Plus, Search, User, Phone, Calendar, ChevronRight, Users } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Patients() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const { data: patients, isLoading } = trpc.patients.list.useQuery({ search: search || undefined });

  const genderLabel = (g?: string | null) => {
    if (g === "male") return "Masculino";
    if (g === "female") return "Feminino";
    return "Outro";
  };

  return (
    <ClinicalLayout
      title="Pacientes"
      subtitle={`${patients?.length ?? 0} pacientes cadastrados`}
      actions={
        <Button size="sm" onClick={() => navigate("/patients/new")}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Novo Paciente
        </Button>
      }
    >
      <div className="max-w-4xl space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Patient list */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : !patients?.length ? (
            <div className="p-10 text-center">
              <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">
                {search ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {search ? "Tente uma busca diferente" : "Cadastre seu primeiro paciente para começar"}
              </p>
              {!search && (
                <Button size="sm" className="mt-4" onClick={() => navigate("/patients/new")}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Cadastrar Paciente
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors text-left group"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/8 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      {patient.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{patient.fullName}</p>
                      {!patient.isActive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                          Inativo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {patient.dateOfBirth && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(patient.dateOfBirth).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                      {patient.phone && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {patient.phone}
                        </span>
                      )}
                      {patient.gender && (
                        <span className="text-xs text-muted-foreground">{genderLabel(patient.gender)}</span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </ClinicalLayout>
  );
}
