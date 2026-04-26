import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  FileText,
  Lock,
  Mic,
  Moon,
  Shield,
  Sparkles,
  Stethoscope,
  Sun,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

/* ─── Animated counter ─── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = Math.ceil(to / 40);
          const timer = setInterval(() => {
            start += step;
            if (start >= to) { setCount(to); clearInterval(timer); }
            else setCount(start);
          }, 30);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { theme, toggleTheme, switchable } = useTheme();

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: "#0A0F1E", color: "#E8EAF0" }}>

      {/* ─── NAVBAR ─── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(10,15,30,0.85)", backdropFilter: "blur(16px)", borderColor: "rgba(201,166,70,0.12)" }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(201,166,70,0.12)", border: "1px solid rgba(201,166,70,0.25)" }}>
              <Activity className="w-4 h-4" style={{ color: "#C9A646" }} />
            </div>
            <div>
              <span className="text-sm font-black tracking-widest uppercase" style={{ color: "#E8EAF0", letterSpacing: "0.15em" }}>NEXORA</span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {["Funcionalidades", "Clari", "Segurança"].map((item) => (
              <button
                key={item}
                onClick={() => document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: "smooth" })}
                className="text-sm font-medium transition-colors duration-150"
                style={{ color: "rgba(232,234,240,0.55)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#C9A646")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(232,234,240,0.55)")}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {switchable && toggleTheme && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-all duration-150"
                style={{ color: "rgba(232,234,240,0.45)" }}
                title={theme === "dark" ? "Modo claro" : "Modo escuro"}
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            <a
              href={getLoginUrl()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-150"
              style={{ background: "#C9A646", color: "#0A0F1E" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Acessar plataforma
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden" style={{ minHeight: "92vh", display: "flex", alignItems: "center" }}>
        {/* Grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(201,166,70,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201,166,70,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-20%",
            right: "-10%",
            width: "700px",
            height: "700px",
            background: "radial-gradient(circle, rgba(201,166,70,0.08) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "-10%",
            left: "-5%",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 65%)",
          }}
        />

        <div className="max-w-6xl mx-auto px-6 py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              {/* Eyebrow */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-8 tracking-widest uppercase"
                style={{ background: "rgba(201,166,70,0.08)", border: "1px solid rgba(201,166,70,0.2)", color: "#C9A646" }}
              >
                <Sparkles className="w-3 h-3" />
                Inteligência Clínica com IA
              </div>

              <h1
                className="font-black leading-[1.02] mb-6"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.03em", fontFamily: "Manrope, Inter, sans-serif" }}
              >
                <span style={{ color: "#E8EAF0" }}>Menos burocracia.</span>
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #C9A646 0%, #E8C96A 50%, #C9A646 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Mais medicina.
                </span>
              </h1>

              <p className="text-lg leading-relaxed mb-8" style={{ color: "rgba(232,234,240,0.60)", maxWidth: "480px" }}>
                Automatize sua documentação, receba suporte clínico baseado em evidências e transforme sua consulta com a{" "}
                <strong style={{ color: "#C9A646", fontWeight: 700 }}>Clari</strong> — sua assistente inteligente em tempo real.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <a
                  href={getLoginUrl()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold transition-all duration-200"
                  style={{ background: "#C9A646", color: "#0A0F1E", boxShadow: "0 4px 24px rgba(201,166,70,0.25)" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(201,166,70,0.35)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(201,166,70,0.25)"; }}
                >
                  Começar gratuitamente
                  <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  onClick={() => document.getElementById("funcionalidades")?.scrollIntoView({ behavior: "smooth" })}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold transition-all duration-150"
                  style={{ border: "1px solid rgba(232,234,240,0.12)", color: "rgba(232,234,240,0.70)", background: "transparent" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,166,70,0.3)"; e.currentTarget.style.color = "#C9A646"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(232,234,240,0.12)"; e.currentTarget.style.color = "rgba(232,234,240,0.70)"; }}
                >
                  Ver funcionalidades
                </button>
              </div>

              {/* Trust line */}
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#C9A646" }} />
                <p className="text-sm" style={{ color: "rgba(232,234,240,0.45)" }}>
                  Projetado para médicos que valorizam precisão, agilidade e decisão clínica de alto nível.
                </p>
              </div>
            </div>

            {/* Right — Dashboard preview card */}
            <div className="relative hidden lg:block">
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(201,166,70,0.15)",
                  boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,166,70,0.08)",
                }}
              >
                {/* Fake top bar */}
                <div
                  className="flex items-center gap-2 px-4 py-3 border-b"
                  style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FF5F57" }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28C840" }} />
                  <div className="flex-1 mx-3 h-5 rounded" style={{ background: "rgba(255,255,255,0.05)" }} />
                </div>
                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "rgba(232,234,240,0.35)" }}>NEXORA</p>
                      <p className="text-base font-bold" style={{ color: "#E8EAF0" }}>Boa tarde, Dr. Silva</p>
                    </div>
                    <div
                      className="px-3 py-1.5 rounded-lg text-xs font-bold"
                      style={{ background: "rgba(201,166,70,0.12)", color: "#C9A646", border: "1px solid rgba(201,166,70,0.2)" }}
                    >
                      + Nova Consulta
                    </div>
                  </div>
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Hoje", value: "8" },
                      { label: "Pacientes", value: "142" },
                      { label: "Documentos", value: "31" },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="rounded-xl p-3 text-center"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <p className="text-xl font-black" style={{ color: "#C9A646" }}>{value}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: "rgba(232,234,240,0.40)" }}>{label}</p>
                      </div>
                    ))}
                  </div>
                  {/* Clari chat preview */}
                  <div
                    className="rounded-xl p-4"
                    style={{ background: "rgba(201,166,70,0.05)", border: "1px solid rgba(201,166,70,0.12)" }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(201,166,70,0.15)" }}
                      >
                        <Bot className="w-3 h-3" style={{ color: "#C9A646" }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: "#C9A646" }}>Clari</span>
                      <span
                        className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(201,166,70,0.15)", color: "#C9A646" }}
                      >IA</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(232,234,240,0.65)" }}>
                      Análise da consulta concluída. SOAP gerado automaticamente. Deseja revisar as hipóteses diagnósticas?
                    </p>
                  </div>
                  {/* SOAP tag */}
                  <div className="flex gap-2">
                    {["Subjetivo", "Objetivo", "Avaliação", "Plano"].map((tag, i) => (
                      <div
                        key={tag}
                        className="flex-1 text-center py-1.5 rounded-lg text-[9px] font-bold"
                        style={{
                          background: i === 2 ? "rgba(201,166,70,0.15)" : "rgba(255,255,255,0.04)",
                          color: i === 2 ? "#C9A646" : "rgba(232,234,240,0.35)",
                          border: `1px solid ${i === 2 ? "rgba(201,166,70,0.25)" : "rgba(255,255,255,0.06)"}`,
                        }}
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Glow behind card */}
              <div
                className="absolute -inset-8 -z-10 pointer-events-none"
                style={{ background: "radial-gradient(ellipse, rgba(201,166,70,0.07) 0%, transparent 70%)" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section style={{ background: "rgba(201,166,70,0.06)", borderTop: "1px solid rgba(201,166,70,0.12)", borderBottom: "1px solid rgba(201,166,70,0.12)" }}>
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 60, suffix: "%", label: "Redução no tempo de documentação" },
              { value: 4, suffix: "x", label: "Mais agilidade na consulta" },
              { value: 100, suffix: "%", label: "Conformidade com LGPD" },
              { value: 24, suffix: "/7", label: "Clari disponível" },
            ].map(({ value, suffix, label }) => (
              <div key={label}>
                <p
                  className="text-4xl font-black mb-1"
                  style={{
                    background: "linear-gradient(135deg, #C9A646 0%, #E8C96A 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontFamily: "Manrope, sans-serif",
                  }}
                >
                  <Counter to={value} suffix={suffix} />
                </p>
                <p className="text-xs" style={{ color: "rgba(232,234,240,0.45)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FUNCIONALIDADES ─── */}
      <section id="funcionalidades" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#C9A646" }}>Funcionalidades</p>
            <h2
              className="font-black leading-tight"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", letterSpacing: "-0.025em", color: "#E8EAF0", maxWidth: "560px", fontFamily: "Manrope, sans-serif" }}
            >
              Tudo que você precisa para uma consulta mais inteligente
            </h2>
          </div>

          {/* Feature grid — asymmetric */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Large card */}
            <div
              className="md:col-span-2 rounded-2xl p-8 relative overflow-hidden"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "rgba(201,166,70,0.10)", border: "1px solid rgba(201,166,70,0.2)" }}
              >
                <Mic className="w-6 h-6" style={{ color: "#C9A646" }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: "#E8EAF0", fontFamily: "Manrope, sans-serif" }}>
                Documente enquanto atende
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(232,234,240,0.55)", maxWidth: "380px" }}>
                A consulta acontece e a documentação é feita automaticamente. Grave o atendimento, a Clari transcreve e estrutura tudo em formato SOAP — sem interromper seu raciocínio clínico.
              </p>
              {/* Decorative */}
              <div
                className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(201,166,70,0.08) 0%, transparent 70%)" }}
              />
            </div>

            {/* Small card */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(201,166,70,0.06)", border: "1px solid rgba(201,166,70,0.15)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(201,166,70,0.12)" }}
              >
                <Bot className="w-5 h-5" style={{ color: "#C9A646" }} />
              </div>
              <h3 className="text-base font-bold mb-2" style={{ color: "#E8EAF0", fontFamily: "Manrope, sans-serif" }}>
                Clari — Assistente clínica
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(232,234,240,0.55)" }}>
                Sugestões baseadas em evidências, hipóteses diagnósticas e apoio à decisão em tempo real.
              </p>
            </div>

            {/* Small card */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}
              >
                <FileText className="w-5 h-5" style={{ color: "#818CF8" }} />
              </div>
              <h3 className="text-base font-bold mb-2" style={{ color: "#E8EAF0", fontFamily: "Manrope, sans-serif" }}>
                Documentos em segundos
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(232,234,240,0.55)" }}>
                Evolução, prescrição, pedidos de exame e atestados gerados e exportados com um clique.
              </p>
            </div>

            {/* Large card */}
            <div
              className="md:col-span-2 rounded-2xl p-8 relative overflow-hidden"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "rgba(99,102,241,0.10)", border: "1px solid rgba(99,102,241,0.2)" }}
              >
                <Stethoscope className="w-6 h-6" style={{ color: "#818CF8" }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: "#E8EAF0", fontFamily: "Manrope, sans-serif" }}>
                Histórico clínico completo
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(232,234,240,0.55)", maxWidth: "380px" }}>
                Todos os pacientes, consultas, exames e documentos organizados em um único lugar. Upload e análise de laudos anteriores com extração de contexto via IA.
              </p>
              <div
                className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── CLARI ─── */}
      <section id="clari" className="py-24" style={{ background: "rgba(255,255,255,0.015)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Chat UI */}
            <div className="relative order-2 lg:order-1">
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "#0D1425",
                  border: "1px solid rgba(201,166,70,0.15)",
                  boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center gap-3 px-5 py-4 border-b"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(201,166,70,0.12)", border: "1px solid rgba(201,166,70,0.2)" }}
                  >
                    <Bot className="w-4 h-4" style={{ color: "#C9A646" }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#E8EAF0" }}>Clari</p>
                    <p className="text-[10px]" style={{ color: "rgba(232,234,240,0.40)" }}>Assistente clínica inteligente</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px]" style={{ color: "rgba(232,234,240,0.35)" }}>Online</span>
                  </div>
                </div>
                {/* Messages */}
                <div className="p-5 space-y-4">
                  {[
                    { from: "clari", text: "Analisei os dados do paciente. Identifiquei padrões compatíveis com esta hipótese diagnóstica. Deseja explorar condutas possíveis?" },
                    { from: "user", text: "Sim, quais são as opções terapêuticas de primeira linha?" },
                    { from: "clari", text: "Com base nas diretrizes atuais, as opções de primeira linha incluem..." },
                  ].map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.from === "user" ? "justify-end" : ""}`}>
                      {msg.from === "clari" && (
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: "rgba(201,166,70,0.12)" }}
                        >
                          <Bot className="w-3.5 h-3.5" style={{ color: "#C9A646" }} />
                        </div>
                      )}
                      <div
                        className="rounded-2xl px-4 py-3 max-w-xs text-sm leading-relaxed"
                        style={{
                          background: msg.from === "clari" ? "rgba(255,255,255,0.05)" : "rgba(201,166,70,0.12)",
                          color: msg.from === "clari" ? "rgba(232,234,240,0.80)" : "#E8EAF0",
                          borderRadius: msg.from === "clari" ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                        }}
                      >
                        {msg.text}
                        {i === 2 && (
                          <div className="mt-2 flex gap-2">
                            <span
                              className="text-[10px] px-2 py-1 rounded-full font-semibold"
                              style={{ background: "rgba(201,166,70,0.15)", color: "#C9A646" }}
                            >Ver evidências</span>
                            <span
                              className="text-[10px] px-2 py-1 rounded-full font-semibold"
                              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(232,234,240,0.50)" }}
                            >Gerar prescrição</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Disclaimer */}
                <div
                  className="px-5 pb-4 pt-2 border-t text-center"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}
                >
                  <p className="text-[10px]" style={{ color: "rgba(232,234,240,0.30)" }}>
                    ⚠️ Clari é suporte clínico. A decisão médica é sempre do profissional.
                  </p>
                </div>
              </div>
              <div
                className="absolute -inset-6 -z-10 pointer-events-none"
                style={{ background: "radial-gradient(ellipse, rgba(201,166,70,0.06) 0%, transparent 70%)" }}
              />
            </div>

            {/* Text */}
            <div className="order-1 lg:order-2">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6 tracking-widest uppercase"
                style={{ background: "rgba(201,166,70,0.08)", border: "1px solid rgba(201,166,70,0.2)", color: "#C9A646" }}
              >
                <Bot className="w-3.5 h-3.5" />
                Assistente clínica
              </div>
              <h2
                className="font-black leading-tight mb-4"
                style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", letterSpacing: "-0.025em", color: "#E8EAF0", fontFamily: "Manrope, sans-serif" }}
              >
                Conheça a Clari, sua assistente clínica inteligente
              </h2>
              <p className="text-base leading-relaxed mb-7" style={{ color: "rgba(232,234,240,0.55)" }}>
                Durante a consulta, a Clari organiza informações, sugere hipóteses e apoia sua tomada de decisão — sempre baseada em evidências, sempre respeitando sua autonomia.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Organiza automaticamente as informações do atendimento",
                  "Estrutura sua evolução em formato clínico SOAP",
                  "Sugere hipóteses e caminhos baseados em evidência",
                  "Apoia sua decisão sem substituir seu julgamento",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "rgba(232,234,240,0.70)" }}>
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#C9A646" }} />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={getLoginUrl()}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-150"
                style={{ background: "#C9A646", color: "#0A0F1E" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                Experimentar a Clari
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── COMO FUNCIONA ─── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#C9A646" }}>Processo</p>
            <h2
              className="font-black"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", letterSpacing: "-0.025em", color: "#E8EAF0", fontFamily: "Manrope, sans-serif" }}
            >
              Como funciona
            </h2>
          </div>
          <div className="relative">
            {/* Connecting line */}
            <div
              className="absolute top-8 left-0 right-0 h-px hidden lg:block"
              style={{ background: "linear-gradient(90deg, transparent, rgba(201,166,70,0.2), rgba(201,166,70,0.2), transparent)" }}
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: "01", title: "Inicie a consulta", desc: "A NEXORA acompanha o atendimento em tempo real", icon: Stethoscope },
                { step: "02", title: "Clari organiza tudo", desc: "Transcrição, estrutura clínica e dados organizados automaticamente", icon: Bot },
                { step: "03", title: "Suporte inteligente", desc: "Sugestões clínicas claras, baseadas em evidência", icon: Sparkles },
                { step: "04", title: "Finalize pronto", desc: "Documentação completa, organizada e exportável", icon: FileText },
              ].map(({ step, title, desc, icon: Icon }) => (
                <div key={step} className="relative text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10"
                    style={{
                      background: "#0A0F1E",
                      border: "1px solid rgba(201,166,70,0.25)",
                      boxShadow: "0 0 0 4px rgba(10,15,30,1)",
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: "#C9A646" }} />
                  </div>
                  <p className="text-xs font-black tracking-widest mb-2" style={{ color: "rgba(201,166,70,0.40)" }}>{step}</p>
                  <h3 className="text-base font-bold mb-2" style={{ color: "#E8EAF0", fontFamily: "Manrope, sans-serif" }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(232,234,240,0.45)" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SEGURANÇA ─── */}
      <section id="segurança" className="py-20" style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#C9A646" }}>Segurança</p>
              <h2
                className="font-black leading-tight mb-4"
                style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", letterSpacing: "-0.025em", color: "#E8EAF0", fontFamily: "Manrope, sans-serif" }}
              >
                Sua prática clínica protegida por padrão
              </h2>
              <p className="text-base leading-relaxed" style={{ color: "rgba(232,234,240,0.55)" }}>
                A NEXORA foi construída com conformidade LGPD desde o início. O áudio das consultas é descartado automaticamente após o processamento — nunca armazenado.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, title: "Conformidade LGPD", desc: "Áudio descartado após processamento" },
                { icon: Lock, title: "Dados criptografados", desc: "Segurança de ponta a ponta" },
                { icon: CheckCircle2, title: "Controle de acesso", desc: "Perfis por papel e responsabilidade" },
                { icon: Zap, title: "Autonomia médica", desc: "A decisão clínica é sempre sua" },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-xl p-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: "rgba(201,166,70,0.08)" }}
                  >
                    <Icon className="w-4.5 h-4.5" style={{ color: "#C9A646" }} />
                  </div>
                  <p className="text-sm font-bold mb-1" style={{ color: "#E8EAF0" }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(232,234,240,0.40)" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="py-28 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201,166,70,0.07) 0%, transparent 70%)" }}
        />
        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6 tracking-widest uppercase"
            style={{ background: "rgba(201,166,70,0.08)", border: "1px solid rgba(201,166,70,0.2)", color: "#C9A646" }}
          >
            <Sparkles className="w-3 h-3" />
            Comece hoje
          </div>
          <h2
            className="font-black leading-tight mb-5"
            style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", letterSpacing: "-0.03em", color: "#E8EAF0", fontFamily: "Manrope, sans-serif" }}
          >
            Pronto para elevar sua prática clínica?
          </h2>
          <p className="text-lg leading-relaxed mb-8" style={{ color: "rgba(232,234,240,0.50)", maxWidth: "520px", margin: "0 auto 2rem" }}>
            Comece agora e experimente uma nova forma de atender — com mais clareza, menos carga operacional e maior precisão na decisão.
          </p>
          <a
            href={getLoginUrl()}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-black transition-all duration-200"
            style={{ background: "#C9A646", color: "#0A0F1E", boxShadow: "0 4px 32px rgba(201,166,70,0.30)" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 40px rgba(201,166,70,0.40)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 32px rgba(201,166,70,0.30)"; }}
          >
            Começar gratuitamente
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#070B16" }}>
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(201,166,70,0.10)", border: "1px solid rgba(201,166,70,0.2)" }}
            >
              <Activity className="w-3.5 h-3.5" style={{ color: "#C9A646" }} />
            </div>
            <span className="text-sm font-black tracking-widest uppercase" style={{ color: "#E8EAF0", letterSpacing: "0.15em" }}>NEXORA</span>
          </div>
          <p className="text-xs text-center" style={{ color: "rgba(232,234,240,0.30)" }}>
            Clari é uma ferramenta de suporte clínico. A decisão médica final é sempre do profissional de saúde.
          </p>
          <p className="text-xs" style={{ color: "rgba(232,234,240,0.25)" }}>
            © {new Date().getFullYear()} NEXORA
          </p>
        </div>
      </footer>
    </div>
  );
}
