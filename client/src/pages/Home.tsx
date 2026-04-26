import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Activity, ArrowRight, Bot, FileText, Mic, Shield, Stethoscope, Users } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Mic,
    title: "Transcrição em Tempo Real",
    description: "Grave a consulta e obtenha transcrição precisa com a Whisper API, otimizada para terminologia médica em português.",
  },
  {
    icon: FileText,
    title: "Documentação SOAP Automática",
    description: "Gere notas clínicas estruturadas no formato SOAP automaticamente a partir da transcrição da consulta.",
  },
  {
    icon: Bot,
    title: "Vita AI",
    description: "Assistente clínico inteligente com suporte baseado em evidências, alertas de interações e sugestões de conduta.",
  },
  {
    icon: Users,
    title: "Gestão de Pacientes",
    description: "Cadastro completo, histórico clínico, consultas anteriores e documentos organizados por paciente.",
  },
  {
    icon: FileText,
    title: "Geração de Documentos",
    description: "Prescrições, pedidos de exames, atestados e evoluções gerados automaticamente e exportáveis em PDF.",
  },
  {
    icon: Shield,
    title: "Conformidade LGPD",
    description: "Áudio deletado após processamento. Dados criptografados. Controle de acesso por perfil (RBAC).",
  },
];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Header ─── */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">Clinical AI</span>
              <span className="ml-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Assistente Clínico</span>
            </div>
          </div>
          <Button size="sm" onClick={() => window.location.href = getLoginUrl()}>
            Entrar
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-accent/20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="container relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-medium mb-6">
              <Bot className="w-3.5 h-3.5" />
              Plataforma de IA Clínica — Vita AI
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-tight tracking-tight mb-6">
              Documentação clínica{" "}
              <span className="text-primary">inteligente</span>{" "}
              para médicos
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl">
              Automatize a documentação das suas consultas com IA. Transcrição em tempo real, notas SOAP automáticas, assistente clínico baseado em evidências e geração de documentos — tudo em conformidade com a LGPD e as diretrizes do CFM.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="text-base px-8"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Começar agora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* LGPD notice */}
            <div className="mt-8 flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 max-w-lg">
              <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>Aviso importante:</strong> O Vita AI é uma ferramenta de suporte clínico. A responsabilidade pelo diagnóstico e conduta médica é sempre do profissional. Conformidade com LGPD e CFM.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-16 sm:py-20 bg-white border-y border-border">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
              Tudo que você precisa na consulta
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Uma plataforma completa que reduz a carga administrativa e permite que você foque no que importa: o paciente.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="p-5 rounded-xl border border-border bg-background hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center mb-3 group-hover:bg-primary/12 transition-colors">
                  <Icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 sm:py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <Stethoscope className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
              Pronto para transformar sua prática clínica?
            </h2>
            <p className="text-muted-foreground mb-6">
              Acesse a plataforma e experimente o Vita AI na sua próxima consulta.
            </p>
            <Button
              size="lg"
              onClick={() => window.location.href = getLoginUrl()}
            >
              Acessar plataforma
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-6">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
              <Activity className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs text-muted-foreground">Clinical AI — Assistente Clínico com IA</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            ⚠️ Vita AI é suporte clínico. Decisão médica é responsabilidade do profissional. Conformidade LGPD.
          </p>
        </div>
      </footer>
    </div>
  );
}
