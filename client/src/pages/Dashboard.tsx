import ClinicalLayout from "@/components/ClinicalLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  ArrowRight,
  Bot,
  Calendar,
  Clock,
  Plus,
  Stethoscope,
  Users,
} from "lucide-react";
import { useLocation } from "wouter";

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <ClinicalLayout
      title="Dashboard"
      subtitle={today.charAt(0).toUpperCase() + today.slice(1)}
      actions={
        <Button size="sm" onClick={() => navigate("/consultation/new")}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Nova Consulta
        </Button>
      }
    >
      <div className="space-y-6 max-w-5xl">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Calendar}
            label="Consultas hoje"
            value={isLoading ? "—" : (stats?.todayCount ?? 0)}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={Users}
            label="Total de pacientes"
            value={isLoading ? "—" : (stats?.totalPatients ?? 0)}
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            icon={Activity}
            label="Pacientes ativos"
            value={isLoading ? "—" : (stats?.activePatients ?? 0)}
            color="bg-violet-50 text-violet-600"
          />
          <StatCard
            icon={Stethoscope}
            label="Consultas recentes"
            value={isLoading ? "—" : (stats?.recentConsultations?.length ?? 0)}
            color="bg-amber-50 text-amber-600"
          />
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Ações rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => navigate("/consultation/new")}
              className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/3 transition-all duration-150 text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center group-hover:bg-primary/14 transition-colors">
                <Stethoscope className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Nova Consulta</p>
                <p className="text-xs text-muted-foreground">Iniciar atendimento</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
            </button>

            <button
              onClick={() => navigate("/patients/new")}
              className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/3 transition-all duration-150 text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <Users className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Novo Paciente</p>
                <p className="text-xs text-muted-foreground">Cadastrar paciente</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto group-hover:text-emerald-600 transition-colors" />
            </button>

            <button
              onClick={() => navigate("/clari")}
              className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/3 transition-all duration-150 text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                <Bot className="w-4.5 h-4.5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Clari</p>
                <p className="text-xs text-muted-foreground">Assistente clínico</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto group-hover:text-violet-600 transition-colors" />
            </button>
          </div>
        </div>

        {/* Recent consultations */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Consultas recentes</h2>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/patients")}>
              Ver pacientes
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : !stats?.recentConsultations?.length ? (
              <div className="p-8 text-center">
                <Stethoscope className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma consulta registrada</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Inicie uma nova consulta para começar</p>
                <Button size="sm" className="mt-3" onClick={() => navigate("/consultation/new")}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Nova Consulta
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {stats.recentConsultations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/consultation/${c.id}`)}
                    className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/8 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {c.chiefComplaint ?? "Consulta sem queixa registrada"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(c.startedAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                        c.status === "completed"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : c.status === "in_progress"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {c.status === "completed" ? "Concluída" : c.status === "in_progress" ? "Em andamento" : "Cancelada"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Disclaimer */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <Bot className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-800">Aviso sobre o Clari</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              O Clari é uma ferramenta de suporte à decisão clínica baseada em evidências. Todas as sugestões, diagnósticos e condutas geradas pela IA devem ser avaliadas e validadas pelo médico responsável. A responsabilidade clínica final é sempre do profissional de saúde, em conformidade com as diretrizes do CFM e a LGPD.
            </p>
          </div>
        </div>
      </div>
    </ClinicalLayout>
  );
}
