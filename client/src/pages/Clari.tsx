import ClinicalLayout from "@/components/ClinicalLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Bot, ChevronRight, Clock, Loader2, Stethoscope } from "lucide-react";
import { useLocation } from "wouter";

export default function Clari() {
  const [, navigate] = useLocation();
  const { data: consultations, isLoading } = trpc.consultations.list.useQuery({ limit: 10 });

  return (
    <ClinicalLayout
      title="Clari"
      subtitle="Assistente clínico baseado em evidências"
    >
      <div className="max-w-3xl space-y-5">
        {/* Hero card */}
        <div className="bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Bot className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Clari</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                O Clari é seu NEURIX contextual. Para aproveitar ao máximo, acesse-o diretamente durante uma consulta — ele terá acesso ao contexto do paciente, transcrição e nota SOAP para fornecer suporte mais preciso.
              </p>
              <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-800">
                  ⚠️ O Clari fornece sugestões baseadas em evidências científicas. A decisão clínica final é sempre responsabilidade do médico, em conformidade com as diretrizes do CFM.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active consultations */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Consultas em andamento</h3>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : !consultations?.filter((c) => c.status === "in_progress").length ? (
              <div className="p-8 text-center">
                <Stethoscope className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma consulta em andamento</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Inicie uma consulta para usar o Clari com contexto do paciente</p>
                <Button size="sm" className="mt-3" onClick={() => navigate("/consultation/new")}>
                  Nova Consulta
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {consultations
                  .filter((c) => c.status === "in_progress")
                  .map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/consultation/${c.id}`)}
                      className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors text-left group"
                    >
                      <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {c.chiefComplaint ?? "Consulta em andamento"}
                        </p>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(c.startedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-violet-600 transition-colors" />
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent consultations */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Consultas recentes</h3>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {!consultations?.filter((c) => c.status === "completed").length ? (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">Nenhuma consulta concluída</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {consultations
                  .filter((c) => c.status === "completed")
                  .slice(0, 5)
                  .map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/consultation/${c.id}`)}
                      className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors text-left group"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/8 flex items-center justify-center">
                        <Stethoscope className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {c.chiefComplaint ?? "Consulta concluída"}
                        </p>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(c.startedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ClinicalLayout>
  );
}
