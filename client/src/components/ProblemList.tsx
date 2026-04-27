import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertCircle, ChevronDown, CheckCircle2, Eye, Activity, Loader2 } from "lucide-react";
import { toast } from "sonner";

type ProblemStatus = "active" | "controlled" | "resolved" | "monitoring";

const STATUS_CONFIG: Record<
  ProblemStatus,
  { label: string; variant: "destructive" | "secondary" | "default" | "outline"; icon: React.ReactNode; color: string }
> = {
  active: {
    label: "Ativo",
    variant: "destructive",
    icon: <AlertCircle className="w-3 h-3" />,
    color: "text-red-600 bg-red-50 border-red-200",
  },
  controlled: {
    label: "Controlado",
    variant: "secondary",
    icon: <Activity className="w-3 h-3" />,
    color: "text-yellow-700 bg-yellow-50 border-yellow-200",
  },
  monitoring: {
    label: "Em monitoramento",
    variant: "outline",
    icon: <Eye className="w-3 h-3" />,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  resolved: {
    label: "Resolvido",
    variant: "default",
    icon: <CheckCircle2 className="w-3 h-3" />,
    color: "text-green-700 bg-green-50 border-green-200",
  },
};

const STATUS_OPTIONS: ProblemStatus[] = ["active", "controlled", "monitoring", "resolved"];

interface ProblemListProps {
  patientId: number;
  compact?: boolean; // modo compacto para exibição inline na consulta
}

export default function ProblemList({ patientId, compact = false }: ProblemListProps) {
  const utils = trpc.useUtils();

  const { data: problems, isLoading, error } = trpc.problems.byPatient.useQuery(
    { patientId },
    { enabled: !!patientId }
  );

  const updateStatus = trpc.problems.update.useMutation({
    onSuccess: () => {
      utils.problems.byPatient.invalidate({ patientId });
      toast.success("Status do problema atualizado");
    },
    onError: (err) => toast.error("Erro ao atualizar: " + err.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Carregando problemas...
      </div>
    );
  }

  if (error) {
    if (compact) return null;
    return (
      <div className="text-center py-4 text-destructive text-sm">
        Erro ao carregar problemas. Tente novamente.
      </div>
    );
  }

  if (!problems || problems.length === 0) {
    if (compact) return null;
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">Nenhum problema registrado ainda.</p>
        <p className="text-xs mt-1 opacity-70">Os problemas são extraídos automaticamente após a geração do SOAP.</p>
      </div>
    );
  }

  // Modo compacto: banner horizontal com problemas ativos
  if (compact) {
    const activeProblems = problems.filter((p) => p.status === "active" || p.status === "controlled" || p.status === "monitoring");
    if (activeProblems.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-1.5 px-4 py-2.5 bg-amber-50/60 border border-amber-200/60 rounded-lg text-xs">
        <span className="font-medium text-amber-800 shrink-0">Problemas ativos:</span>
        {activeProblems.map((p) => {
          const cfg = STATUS_CONFIG[p.status as ProblemStatus];
          return (
            <span
              key={p.id}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${cfg.color}`}
            >
              {cfg.icon}
              P{p.problemNumber} — {p.title}
            </span>
          );
        })}
      </div>
    );
  }

  // Modo completo: lista com dropdown de status
  return (
    <div className="space-y-2">
      {problems.map((problem) => {
        const cfg = STATUS_CONFIG[problem.status as ProblemStatus] ?? STATUS_CONFIG.active;
        return (
          <div
            key={problem.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/20 transition-colors"
          >
            {/* Número */}
            <div className="w-8 h-8 rounded-full bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">P{problem.problemNumber}</span>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-foreground">{problem.title}</span>
                {problem.identifiedBySpecialty && (
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded capitalize">
                    {problem.identifiedBySpecialty}
                  </span>
                )}
              </div>
              {problem.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{problem.description}</p>
              )}
              <p className="text-xs text-muted-foreground/60">
                Registrado em {new Date(problem.createdAt).toLocaleDateString("pt-BR")}
                {problem.updatedAt && problem.updatedAt !== problem.createdAt && (
                  <> · Atualizado em {new Date(problem.updatedAt).toLocaleDateString("pt-BR")}</>
                )}
              </p>
            </div>

            {/* Status dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-2.5 text-xs font-medium border rounded-full gap-1 ${cfg.color}`}
                  disabled={updateStatus.isPending}
                >
                  {cfg.icon}
                  {cfg.label}
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {STATUS_OPTIONS.map((status) => {
                  const opt = STATUS_CONFIG[status];
                  return (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => updateStatus.mutate({ id: problem.id, status })}
                      className={`text-xs gap-2 ${problem.status === status ? "font-semibold" : ""}`}
                    >
                      {opt.icon}
                      {opt.label}
                      {problem.status === status && <span className="ml-auto text-primary">✓</span>}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}
    </div>
  );
}
