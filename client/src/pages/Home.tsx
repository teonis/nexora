import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  FileText,
  Mic,
  Moon,
  Shield,
  Sparkles,
  Stethoscope,
  Sun,
  Zap,
} from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { theme, toggleTheme, switchable } = useTheme();

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── NAVBAR ─── */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground tracking-tight">NEXORA</span>
              <span className="hidden sm:inline ml-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Plataforma Clínica</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {switchable && toggleTheme && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
                title={theme === "dark" ? "Modo claro" : "Modo escuro"}
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            <a
              href={getLoginUrl()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all duration-150 shadow-sm"
            >
              Entrar
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/4 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="container relative">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-primary text-xs font-semibold mb-6 tracking-wide uppercase">
              <Sparkles className="w-3 h-3" />
              Plataforma de Inteligência Clínica com IA
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.05] tracking-tight mb-6">
              Menos burocracia.{" "}
              <span className="text-gold-gradient">Mais medicina.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl">
              Automatize sua documentação, receba suporte clínico baseado em evidências e transforme sua consulta com a <strong className="text-foreground font-semibold">Clari</strong> — sua assistente inteligente em tempo real.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <a
                href={getLoginUrl()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground text-base font-bold hover:opacity-90 transition-all duration-150 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Começar gratuitamente
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-border text-foreground text-base font-semibold hover:bg-muted transition-all duration-150"
              >
                Ver como funciona
              </button>
            </div>

            {/* Social proof */}
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              Projetado para médicos que valorizam precisão, agilidade e decisão clínica de alto nível.
            </p>
          </div>
        </div>
      </section>

      {/* ─── BLOCO DE VALOR ─── */}
      <section className="py-16 bg-muted/40 border-y border-border">
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Por que a NEXORA</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
              Você não precisa de mais um sistema.{" "}
              <span className="text-muted-foreground font-normal">Você precisa de clareza na decisão clínica.</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              A NEXORA reduz a carga administrativa, organiza sua consulta automaticamente e apoia sua tomada de decisão — sem interferir na sua autonomia.
            </p>
          </div>
        </div>
      </section>

      {/* ─── BENEFÍCIOS ─── */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Benefícios</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Tudo que você precisa para uma consulta mais inteligente
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Mic,
                title: "Documente enquanto atende",
                desc: "A consulta acontece — e a documentação é feita automaticamente, sem interromper seu raciocínio clínico.",
                color: "text-blue-500",
                bg: "bg-blue-50 dark:bg-blue-500/10",
              },
              {
                icon: Stethoscope,
                title: "Decida com mais segurança",
                desc: "Receba sugestões baseadas em evidências clínicas, organizadas de forma clara e objetiva.",
                color: "text-primary",
                bg: "bg-primary/8",
              },
              {
                icon: Clock,
                title: "Ganhe tempo real",
                desc: "Menos tempo digitando, mais tempo focado no paciente e na conduta.",
                color: "text-emerald-500",
                bg: "bg-emerald-50 dark:bg-emerald-500/10",
              },
              {
                icon: FileText,
                title: "Tenha tudo organizado",
                desc: "Histórico, evolução, documentos e dados clínicos estruturados em um único lugar.",
                color: "text-violet-500",
                bg: "bg-violet-50 dark:bg-violet-500/10",
              },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="group bg-card border border-border rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200"
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", bg)}>
                  <Icon className={cn("w-5 h-5", color)} />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2 tracking-tight">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CLARI SECTION ─── */}
      <section className="py-20 bg-muted/30 border-y border-border">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-5 tracking-wide">
                <Bot className="w-3.5 h-3.5" />
                Assistente Clínica Inteligente
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
                Conheça a Clari, sua assistente clínica inteligente
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-6">
                Durante a consulta, a Clari organiza informações, sugere hipóteses e apoia sua tomada de decisão — sempre baseada em evidências.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Organiza automaticamente as informações do atendimento",
                  "Estrutura sua evolução em formato clínico (SOAP)",
                  "Sugere hipóteses e caminhos baseados em evidência",
                  "Apoia sua decisão sem substituir seu julgamento",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={getLoginUrl()}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-all duration-150 shadow-sm"
              >
                Experimentar a Clari
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Chat preview */}
            <div className="relative">
              <div className="bg-card border border-border rounded-2xl shadow-card-hover overflow-hidden">
                {/* Chat header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center glow-gold">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Clari</p>
                    <p className="text-xs text-muted-foreground">Assistente clínica • Online</p>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                {/* Messages */}
                <div className="p-5 space-y-4">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
                      <p className="text-sm text-foreground leading-relaxed">
                        Analisei os dados do paciente. Identifiquei padrões compatíveis com esta hipótese diagnóstica. Deseja explorar condutas possíveis?
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="bg-primary/10 rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs">
                      <p className="text-sm text-foreground leading-relaxed">
                        Sim, quais são as opções terapêuticas de primeira linha?
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
                      <p className="text-sm text-foreground leading-relaxed">
                        Com base nas diretrizes atuais, as opções de primeira linha incluem...
                      </p>
                      <div className="mt-2 flex gap-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Ver evidências</span>
                        <span className="text-xs bg-muted-foreground/10 text-muted-foreground px-2 py-1 rounded-full font-medium">Gerar prescrição</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Disclaimer */}
                <div className="px-5 pb-4">
                  <p className="text-[10px] text-muted-foreground/70 text-center">
                    ⚠️ Clari é suporte clínico. A decisão médica é sempre do profissional.
                  </p>
                </div>
              </div>
              {/* Decorative glow */}
              <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── COMO FUNCIONA ─── */}
      <section id="como-funciona" className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Processo</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Como funciona
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Inicie a consulta", desc: "A NEXORA acompanha o atendimento em tempo real", icon: Stethoscope },
              { step: "02", title: "Clari organiza tudo", desc: "Transcrição, estrutura clínica e dados organizados automaticamente", icon: Bot },
              { step: "03", title: "Receba suporte inteligente", desc: "Sugestões clínicas claras, baseadas em evidência", icon: Sparkles },
              { step: "04", title: "Finalize com tudo pronto", desc: "Documentação completa, organizada e exportável", icon: FileText },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="relative">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-card h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-black text-primary/40 tracking-widest">{step}</span>
                    <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center">
                      <Icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2 tracking-tight">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONFIANÇA ─── */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Conformidade LGPD", desc: "Dados protegidos e áudio descartado após processamento" },
              { icon: Zap, title: "Dados criptografados", desc: "Segurança de ponta a ponta em todas as informações" },
              { icon: CheckCircle2, title: "Controle de acesso", desc: "Perfis de acesso por papel e responsabilidade" },
              { icon: Stethoscope, title: "Autonomia médica", desc: "A decisão clínica é sempre do profissional de saúde" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground mb-1">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── POSICIONAMENTO ─── */}
      <section className="py-20">
        <div className="container max-w-3xl text-center">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Diferencial</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
            A NEXORA não é apenas um prontuário.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            É um sistema de inteligência clínica que potencializa sua prática médica — reduzindo carga operacional e aumentando a precisão na decisão.
          </p>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="py-20 bg-foreground dark:bg-card">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-background dark:text-foreground tracking-tight mb-4">
            Pronto para elevar sua prática clínica?
          </h2>
          <p className="text-base text-background/70 dark:text-muted-foreground mb-8 max-w-xl mx-auto">
            Comece hoje e experimente uma nova forma de atender — com mais clareza, menos carga operacional e maior precisão na decisão.
          </p>
          <a
            href={getLoginUrl()}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground text-base font-bold hover:opacity-90 transition-all duration-150 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Começar gratuitamente
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
              <Activity className="w-3 h-3 text-primary" />
            </div>
            <span className="text-sm font-bold text-foreground">NEXORA</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Clari é uma ferramenta de suporte clínico. A decisão médica final é sempre do profissional de saúde.
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NEXORA
          </p>
        </div>
      </footer>
    </div>
  );
}
