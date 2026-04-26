import ClinicalLayout from "@/components/ClinicalLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Bot,
  Calendar,
  Clock,
  Plus,
  Stethoscope,
  Users,
} from "lucide-react";
import { useLocation } from "wouter";

function StatCard({
  icon: Icon,
  label,
  value,
  colorClass,
  bgClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  colorClass: string;
  bgClass: string;
}) {
  const isEmpty = value === 0 || value === "—";
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", bgClass)}>
        <Icon className={cn("w-5 h-5", colorClass)} />
      </div>
      <p className={cn("text-3xl font-extrabold tracking-tight mb-1", isEmpty ? "text-muted-foreground/40" : "text-foreground")}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const firstName = user?.name?.split(" ")[0] ?? "Médico";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <ClinicalLayout
      title={`${greeting}, Dr. ${firstName}`}
      subtitle={today.charAt(0).toUpperCase() + today.slice(1)}
      actions={
        <Button
          size="sm"
          onClick={() => navigate("/consultation/new")}
          className="bg-primary text-primary-foreground hover:opacity-90 font-semibold shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Nova Consulta
        </Button>
      }
    >
      <div className="space-y-7 max-w-5xl">

        {/* ─── Stats ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Calendar}
            label="Consultas hoje"
            value={isLoading ? "—" : (stats?.todayCount ?? 0)}
            colorClass="text-blue-600 dark:text-blue-400"
            bgClass="bg-blue-50 dark:bg-blue-500/10"
          />
          <StatCard
            icon={Users}
            label="Total de pacientes"
            value={isLoading ? "—" : (stats?.totalPatients ?? 0)}
            colorClass="text-emerald-600 dark:text-emerald-400"
            bgClass="bg-emerald-50 dark:bg-emerald-500/10"
          />
          <StatCard
            icon={Stethoscope}
            label="Pacientes ativos"
            value={isLoading ? "—" : (stats?.activePatients ?? 0)}
            colorClass="text-violet-600 dark:text-violet-400"
            bgClass="bg-violet-50 dark:bg-violet-500/10"
          />
          <StatCard
            icon={Clock}
            label="Consultas recentes"
            value={isLoading ? "—" : (stats?.recentConsultations?.length ?? 0)}
            colorClass="text-primary"
            bgClass="bg-primary/8"
          />
        </div>

        {/* ─── Contextual hint ─── */}
        {!isLoading && (stats?.todayCount ?? 0) === 0 && (
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-muted/60 border border-border">
            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
            <p className="text-sm text-muted-foreground">
              Você tem disponibilidade livre hoje.{" "}
              <button
                onClick={() => navigate("/consultation/new")}
                className="text-primary font-semibold hover:underline"
              >
                Iniciar nova consulta
              </button>
            </p>
          </div>
        )}

        {/* ─── Quick actions ─── */}
        <div>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Ações rápidas</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {
                icon: Stethoscope,
                label: "Nova Consulta",
                desc: "Iniciar atendimento",
                path: "/consultation/new",
                colorClass: "text-primary",
                bgClass: "bg-primary/8",
              },
              {
                icon: Users,
                label: "Novo Paciente",
                desc: "Cadastrar paciente",
                path: "/patients/new",
                colorClass: "text-emerald-600 dark:text-emerald-400",
                bgClass: "bg-emerald-50 dark:bg-emerald-500/10",
              },
              {
                icon: Bot,
                label: "Clari",
                desc: "Assistente clínica",
                path: "/clari",
                colorClass: "text-primary",
                bgClass: "bg-primary/8",
                isAI: true,
              },
            ].map(({ icon: Icon, label, desc, path, colorClass, bgClass, isAI }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="group flex items-center gap-4 bg-card border border-border rounded-2xl px-5 py-4 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 text-left"
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-150 group-hover:scale-105", bgClass)}>
                  <Icon className={cn("w-5 h-5", colorClass)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{label}</p>
                    {isAI && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">IA</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-150" />
              </button>
            ))}
          </div>
        </div>

        {/* ─── Recent consultations ─── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Consultas recentes</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/patients")}
            >
              Ver pacientes
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
            {isLoading ? (
              <div className="p-10 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !stats?.recentConsultations?.length ? (
              <div className="p-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="w-7 h-7 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">Nenhuma consulta registrada</p>
                <p className="text-xs text-muted-foreground mb-4">Inicie uma nova consulta para começar</p>
                <Button
                  size="sm"
                  onClick={() => navigate("/consultation/new")}
                  className="bg-primary text-primary-foreground hover:opacity-90 font-semibold"
                >
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
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors text-left group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {c.chiefComplaint ?? "Consulta sem queixa registrada"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
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
                    <span className={cn(
                      "text-[10px] font-semibold px-2.5 py-1 rounded-full",
                      c.status === "completed"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : c.status === "in_progress"
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {c.status === "completed" ? "Concluída" : c.status === "in_progress" ? "Em andamento" : "Cancelada"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── AI Disclaimer ─── */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
          <Bot className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-0.5">Aviso sobre o Clari</p>
            <p className="text-xs text-amber-700 dark:text-amber-400/80 leading-relaxed">
              O Clari é uma ferramenta de suporte à decisão clínica baseada em evidências. Todas as sugestões, diagnósticos e condutas geradas pela IA devem ser avaliadas e validadas pelo médico responsável. A responsabilidade clínica final é sempre do profissional de saúde, em conformidade com as diretrizes do CFM e a LGPD.
            </p>
          </div>
        </div>

      </div>
    </ClinicalLayout>
  );
}
