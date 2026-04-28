import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import PublicNav from "@/components/PublicNav";
import {
  ArrowRight, Mic, FileText, Bot, Upload, Shield,
  Users, Stethoscope, ClipboardList, Download,
  CheckCircle2, Play, ChevronRight, Zap, Lock, BarChart3
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";

/* ─── FadeIn ─── */
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => setVisible(true), delay); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(18px)", transition: "opacity 0.55s ease, transform 0.55s ease" }}>
      {children}
    </div>
  );
}

/* ─── Feature data ─── */
const FEATURES = [
  {
    id: "transcricao",
    icon: Mic,
    label: "Transcrição",
    title: "Grave e transcreva em tempo real",
    description: "Durante a consulta, a NEURIX captura o áudio e transcreve automaticamente usando a Whisper API. Nenhuma digitação necessária — o médico foca no paciente.",
    detail: "O áudio é processado localmente e descartado imediatamente após a transcrição, em conformidade com a LGPD. A transcrição é precisa mesmo em ambientes com ruído.",
    tags: ["Whisper API", "Tempo real", "LGPD"],
    color: "#C9A646",
    preview: (
      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444", animation: "fp-pulse 1.2s infinite" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#EF4444" }}>Gravando</span>
          <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: "auto" }}>00:01:42</span>
        </div>
        <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", marginBottom: 12, border: "1px solid rgba(17,24,39,0.05)" }}>
          <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.7, margin: 0 }}>
            "Paciente refere dor torácica em aperto há 3 dias, com piora progressiva ao esforço físico moderado. Nega irradiação para membros. Relata dispneia leve associada..."
          </p>
        </div>
        <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
          {[12,7,18,5,22,9,16,4,20,11,17,6,23,8,14,5,19,10,16,7,21,9,15].map((h, i) => (
            <div key={i} style={{ width: 3, borderRadius: 2, background: "#C9A646", height: h, opacity: 0.4 + (i % 4) * 0.15, transition: "height 0.3s" }} />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "soap",
    icon: ClipboardList,
    label: "Nota SOAP",
    title: "Documentação estruturada automaticamente",
    description: "A partir da transcrição, a NEURIX gera automaticamente a nota clínica no formato SOAP — Subjetivo, Objetivo, Avaliação e Plano — pronta para revisão.",
    detail: "O médico pode revisar e editar cada campo antes de finalizar. O modelo de linguagem é calibrado para terminologia médica brasileira e boas práticas clínicas.",
    tags: ["LLM", "Formato SOAP", "Editável"],
    color: "#6366F1",
    preview: (
      <div style={{ padding: "20px 24px" }}>
        {[
          { key: "S", label: "Subjetivo", color: "#C9A646", text: "Paciente masculino, 52 anos, refere dor torácica em aperto há 3 dias, piora ao esforço. HAS em uso de losartana." },
          { key: "O", label: "Objetivo", color: "#6366F1", text: "PA: 148/92 mmHg · FC: 88 bpm · SpO2: 97% · Ausculta cardíaca: RCR 2T, sem sopros." },
          { key: "A", label: "Avaliação", color: "#10B981", text: "Síndrome coronariana aguda a esclarecer. Angina instável como principal hipótese." },
          { key: "P", label: "Plano", color: "#F59E0B", text: "ECG 12 derivações · Troponina seriada · AAS 300mg VO · Encaminhamento cardiológico urgente." },
        ].map(({ key, label, color, text }) => (
          <div key={key} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color, background: `${color}18`, padding: "2px 7px", borderRadius: 4 }}>{key}</span>
              <span style={{ fontSize: 10, color: "#9CA3AF" }}>{label}</span>
            </div>
            <p style={{ fontSize: 11.5, color: "#374151", lineHeight: 1.6, margin: 0 }}>{text}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "clari",
    icon: Bot,
    label: "Clari IA",
    title: "Assistente clínica contextual",
    description: "A Clari é uma assistente de IA que acompanha cada consulta. Ela tem acesso ao histórico do paciente, à nota SOAP atual e pode sugerir condutas baseadas em evidências.",
    detail: "Todas as respostas da Clari incluem aviso explícito de que são sugestões de suporte — a decisão clínica final é sempre do profissional de saúde.",
    tags: ["IA contextual", "Evidências", "Suporte clínico"],
    color: "#10B981",
    preview: (
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(16,185,129,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Bot size={13} color="#10B981" />
          </div>
          <div style={{ background: "#F0FDF4", borderRadius: "4px 12px 12px 12px", padding: "8px 12px", fontSize: 12, color: "#374151", lineHeight: 1.6 }}>
            Identifiquei padrão compatível com angina instável. Considerando os achados, recomendo estratificação de risco com escore TIMI. Deseja que eu calcule?
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <div style={{ background: "#F9FAFB", borderRadius: "12px 4px 12px 12px", padding: "8px 12px", fontSize: 12, color: "#374151", lineHeight: 1.6 }}>
            Sim, calcule o TIMI e sugira conduta.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(16,185,129,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Bot size={13} color="#10B981" />
          </div>
          <div style={{ background: "#F0FDF4", borderRadius: "4px 12px 12px 12px", padding: "8px 12px", fontSize: 12, color: "#374151", lineHeight: 1.6 }}>
            TIMI Score: 4 pontos → risco intermediário. Conduta sugerida: internação, monitorização, anticoagulação. <span style={{ color: "#9CA3AF", fontSize: 10 }}>⚠ Suporte clínico — decisão do médico.</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "pacientes",
    icon: Users,
    label: "Pacientes",
    title: "Gestão completa de pacientes",
    description: "Cadastro detalhado, histórico de consultas, exames anteriores e documentos gerados — tudo organizado por paciente em um único lugar.",
    detail: "Busca rápida por nome, CPF ou data de nascimento. Alertas de alergias e medicamentos em uso visíveis em destaque durante a consulta.",
    tags: ["Cadastro", "Histórico", "Busca rápida"],
    color: "#8B5CF6",
    preview: (
      <div style={{ padding: "16px 20px" }}>
        {[
          { name: "Ana Paula Ferreira", age: "34 anos", tag: "Nutrologia", last: "Há 2 dias" },
          { name: "João Mendes", age: "52 anos", tag: "Cardiologia", last: "Hoje" },
          { name: "Carla Souza", age: "28 anos", tag: "Dermatologia", last: "Há 5 dias" },
          { name: "Roberto Lima", age: "47 anos", tag: "Endocrinologia", last: "Há 1 semana" },
        ].map(({ name, age, tag, last }, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 0",
            borderBottom: i < 3 ? "1px solid rgba(17,24,39,0.05)" : "none",
          }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `hsl(${i * 60 + 200}, 60%, 92%)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: `hsl(${i * 60 + 200}, 50%, 40%)` }}>{name[0]}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>{age} · {tag}</div>
            </div>
            <span style={{ fontSize: 10, color: "#9CA3AF", whiteSpace: "nowrap" }}>{last}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "documentos",
    icon: FileText,
    label: "Documentos",
    title: "Gere e exporte documentos clínicos",
    description: "Evolução, prescrição, pedido de exames e atestado médico gerados automaticamente com base na consulta. Exportação em PDF ou texto.",
    detail: "Cada documento é gerado com a terminologia correta para o tipo selecionado. O médico pode editar antes de exportar ou imprimir diretamente.",
    tags: ["PDF", "Prescrição", "Atestado", "Pedido de exame"],
    color: "#F59E0B",
    preview: (
      <div style={{ padding: "16px 20px" }}>
        {[
          { icon: "📋", label: "Evolução clínica", desc: "Nota SOAP completa", status: "Gerado" },
          { icon: "💊", label: "Prescrição médica", desc: "Losartana 50mg · AAS 100mg", status: "Gerado" },
          { icon: "🔬", label: "Pedido de exames", desc: "ECG · Troponina · Hemograma", status: "Gerado" },
          { icon: "📄", label: "Atestado médico", desc: "Repouso 2 dias", status: "Pendente" },
        ].map(({ icon, label, desc, status }, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 0",
            borderBottom: i < 3 ? "1px solid rgba(17,24,39,0.05)" : "none",
          }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{label}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>{desc}</div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: status === "Gerado" ? "#10B981" : "#F59E0B",
              background: status === "Gerado" ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
              padding: "3px 8px", borderRadius: 20,
            }}>{status}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "exames",
    icon: Upload,
    label: "Exames",
    title: "Analise exames e laudos com IA",
    description: "Envie PDFs ou imagens de exames anteriores. A NEURIX extrai os dados relevantes e os disponibiliza como contexto para a consulta e para a Clari.",
    detail: "Suporte a hemograma, bioquímica, imagem, eletrocardiograma e laudos de qualquer especialidade. O arquivo original não é armazenado após o processamento.",
    tags: ["PDF", "Imagem", "Extração IA"],
    color: "#EC4899",
    preview: (
      <div style={{ padding: "16px 20px" }}>
        <div style={{ border: "2px dashed rgba(17,24,39,0.10)", borderRadius: 10, padding: "20px", textAlign: "center", marginBottom: 14 }}>
          <Upload size={20} color="#D1D5DB" style={{ margin: "0 auto 8px" }} />
          <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>Arraste um PDF ou imagem de exame</p>
        </div>
        <div style={{ background: "#FFF7F0", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(236,72,153,0.10)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#EC4899" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#EC4899" }}>Resumo extraído pela IA</span>
          </div>
          <p style={{ fontSize: 11.5, color: "#374151", lineHeight: 1.6, margin: 0 }}>
            Hemograma: Hb 11,2 g/dL (anemia leve) · Leucócitos 9.800/mm³ · Plaquetas 210.000/mm³. Glicemia jejum: 126 mg/dL (limítrofe).
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "lgpd",
    icon: Shield,
    label: "Segurança",
    title: "Conformidade com LGPD",
    description: "O áudio das consultas é descartado imediatamente após a transcrição. Dados criptografados, controle de acesso por perfil e avisos explícitos em toda a interface.",
    detail: "Nenhum dado de paciente é compartilhado com terceiros. O médico tem controle total sobre quais informações são armazenadas e por quanto tempo.",
    tags: ["LGPD", "Criptografia", "Controle de acesso"],
    color: "#6B7280",
    preview: (
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { icon: "🔒", title: "Áudio descartado", desc: "Imediatamente após a transcrição" },
          { icon: "🛡️", title: "Dados criptografados", desc: "TLS 1.3 em trânsito e em repouso" },
          { icon: "👤", title: "Controle por perfil", desc: "Médico acessa apenas seus pacientes" },
          { icon: "⚠️", title: "Avisos explícitos", desc: "IA como suporte, não substituto" },
        ].map(({ icon, title, desc }, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{title}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

export default function Features() {
  const { isAuthenticated } = useAuth();
  const [activeId, setActiveId] = useState(FEATURES[0].id);
  const [, navigate] = useLocation();

  const active = FEATURES.find(f => f.id === activeId) ?? FEATURES[0];
  const ActiveIcon = active.icon;

  return (
    <div style={{ background: "#fff", color: "#111827", fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh" }}>
      <style>{`
        @keyframes fp-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }
        .fp-tab { transition: all 0.2s; cursor: pointer; border: none; background: none; font-family: inherit; text-align: left; width: 100%; }
        .fp-tab:hover .fp-tab-label { color: #111827; }
        .fp-cta-btn { transition: opacity 0.15s; }
        .fp-cta-btn:hover { opacity: 0.85; }
        @media (max-width: 900px) {
          .fp-grid { grid-template-columns: 1fr !important; }
          .fp-sidebar { flex-direction: row !important; overflow-x: auto; border-right: none !important; border-bottom: 1px solid rgba(17,24,39,0.06) !important; padding-bottom: 16px !important; padding-right: 0 !important; gap: 8px !important; scrollbar-width: none; }
          .fp-sidebar::-webkit-scrollbar { display: none; }
          .fp-tab { flex-direction: row !important; align-items: center !important; padding: 8px 14px !important; border-radius: 30px !important; white-space: nowrap; width: auto !important; }
          .fp-tab-icon { display: none !important; }
          .fp-tab-chevron { display: none !important; }
        }
        @media (max-width: 600px) {
          .fp-hero { padding: 72px 16px 56px !important; }
          .fp-section { padding: 56px 16px !important; }
          .fp-cta-section { padding: 72px 16px 100px !important; }
        }
      `}</style>

      {/* ─── NAVBAR ─── */}
      <PublicNav />

      {/* ─── HERO ─── */}
      <section className="fp-hero" style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", padding: "100px 24px 72px" }}>
        <FadeIn>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 28 }}>
            Plataforma completa
          </p>
          <h1 style={{
            fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
            fontWeight: 700, lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "#111827",
            margin: "0 auto 20px",
          }}>
            Tudo que você precisa.<br />
            <span style={{ color: "#C9A646" }}>Em um só lugar.</span>
          </h1>
          <p style={{ fontSize: "clamp(1rem, 2vw, 1.1rem)", color: "#9CA3AF", lineHeight: 1.75, maxWidth: 460, margin: "0 auto" }}>
            Da gravação da consulta à exportação do documento — a NEURIX cobre todo o fluxo clínico com inteligência artificial.
          </p>
        </FadeIn>
      </section>

      {/* ─── INTERACTIVE FEATURES ─── */}
      <section className="fp-section" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 120px" }}>
        <FadeIn>
          <div className="fp-grid" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 0, background: "#fff", borderRadius: 16, border: "1px solid rgba(17,24,39,0.07)", boxShadow: "0 4px 32px rgba(17,24,39,0.05)", overflow: "hidden" }}>

            {/* ─── Sidebar ─── */}
            <div className="fp-sidebar" style={{ borderRight: "1px solid rgba(17,24,39,0.06)", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 4, background: "#FAFAFA" }}>
              {FEATURES.map(f => {
                const FIcon = f.icon;
                const isActive = f.id === activeId;
                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveId(f.id)}
                    className="fp-tab"
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: isActive ? "#fff" : "transparent",
                      boxShadow: isActive ? "0 1px 6px rgba(17,24,39,0.06)" : "none",
                      display: "flex", alignItems: "center", gap: 10,
                    }}
                  >
                    <div
                      className="fp-tab-icon"
                      style={{
                        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                        background: isActive ? `${f.color}14` : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "background 0.2s",
                      }}
                    >
                      <FIcon size={14} color={isActive ? f.color : "#9CA3AF"} />
                    </div>
                    <span
                      className="fp-tab-label"
                      style={{
                        fontSize: 13, fontWeight: isActive ? 600 : 400,
                        color: isActive ? "#111827" : "#6B7280",
                        flex: 1,
                        transition: "color 0.2s",
                      }}
                    >
                      {f.label}
                    </span>
                    {isActive && (
                      <ChevronRight size={13} color="#9CA3AF" className="fp-tab-chevron" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ─── Main Panel ─── */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* Top: text */}
              <div style={{ padding: "32px 36px 24px", borderBottom: "1px solid rgba(17,24,39,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${active.color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ActiveIcon size={18} color={active.color} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0, letterSpacing: "-0.01em" }}>{active.title}</h2>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.75, margin: "0 0 12px" }}>{active.description}</p>
                <p style={{ fontSize: 13, color: "#9CA3AF", lineHeight: 1.7, margin: "0 0 20px" }}>{active.detail}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {active.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: 11, fontWeight: 500,
                      color: active.color,
                      background: `${active.color}10`,
                      padding: "4px 10px", borderRadius: 20,
                      border: `1px solid ${active.color}20`,
                    }}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* Bottom: preview */}
              <div style={{ flex: 1, background: "#FAFAFA" }}>
                <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(17,24,39,0.05)", display: "flex", alignItems: "center", gap: 6 }}>
                  {["#FF5F57", "#FEBC2E", "#28C840"].map(c => (
                    <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                  ))}
                  <div style={{ flex: 1, background: "#E5E7EB", borderRadius: 4, height: 14, marginLeft: 6 }} />
                </div>
                {active.preview}
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section style={{ background: "#F9FAFB", borderTop: "1px solid rgba(17,24,39,0.05)", borderBottom: "1px solid rgba(17,24,39,0.05)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32, textAlign: "center" }}>
          {[
            { value: "7", label: "módulos integrados", icon: Zap },
            { value: "100%", label: "conformidade LGPD", icon: Lock },
            { value: "SOAP", label: "formato clínico padrão", icon: ClipboardList },
            { value: "IA", label: "suporte baseado em evidências", icon: BarChart3 },
          ].map(({ value, label, icon: Icon }) => (
            <FadeIn key={label}>
              <div>
                <div style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>{value}</div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>{label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ─── ALL FEATURES GRID ─── */}
      <section className="fp-section" style={{ maxWidth: 1080, margin: "0 auto", padding: "120px 24px" }}>
        <FadeIn>
          <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 700, letterSpacing: "-0.02em", color: "#111827", textAlign: "center", marginBottom: 16 }}>
            Cada detalhe foi pensado para o médico
          </h2>
          <p style={{ fontSize: 15, color: "#9CA3AF", textAlign: "center", maxWidth: 440, margin: "0 auto 64px", lineHeight: 1.75 }}>
            Sem configurações complexas. Sem curva de aprendizado. Só o que importa.
          </p>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {[
            { icon: Mic, title: "Gravação e transcrição", desc: "Áudio capturado e transcrito em tempo real com Whisper API." },
            { icon: ClipboardList, title: "Nota SOAP automática", desc: "Estrutura clínica gerada por LLM a partir da transcrição." },
            { icon: Bot, title: "Clari IA contextual", desc: "Assistente com acesso ao histórico e consulta atual." },
            { icon: Users, title: "Gestão de pacientes", desc: "Cadastro, histórico, busca e alertas de alergias." },
            { icon: FileText, title: "Documentos clínicos", desc: "Evolução, prescrição, exames e atestado em PDF." },
            { icon: Upload, title: "Análise de exames", desc: "Upload de laudos com extração de contexto por IA." },
            { icon: Shield, title: "Segurança e LGPD", desc: "Áudio descartado após transcrição. Dados criptografados." },
            { icon: Stethoscope, title: "Multi-especialidade", desc: "Cardiologia, Nutrologia, Dermatologia, Endocrinologia e mais." },
            { icon: Download, title: "Exportação flexível", desc: "PDF, texto ou impressão direta do navegador." },
          ].map(({ icon: Icon, title, desc }, i) => (
            <FadeIn key={title} delay={i * 40}>
              <div style={{
                padding: "24px",
                borderRadius: 12,
                border: "1px solid rgba(17,24,39,0.06)",
                background: "#fff",
                transition: "box-shadow 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(17,24,39,0.07)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(201,166,70,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Icon size={16} color="#C9A646" />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: "0 0 6px" }}>{title}</h3>
                <p style={{ fontSize: 13, color: "#9CA3AF", lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="fp-cta-section" style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", padding: "0 24px 140px" }}>
        <FadeIn>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.025em", color: "#111827", marginBottom: 16 }}>
            Pronto para começar?
          </h2>
          <p style={{ fontSize: 16, color: "#9CA3AF", lineHeight: 1.75, maxWidth: 380, margin: "0 auto 40px" }}>
            Experimente a NEURIX e veja sua consulta se transformar em documentação completa — automaticamente.
          </p>
          <a
            href={isAuthenticated ? "/dashboard" : getLoginUrl()}
            className="fp-cta-btn"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 28px", borderRadius: 8,
              background: "#111827", color: "#fff",
              fontSize: 14, fontWeight: 500, textDecoration: "none",
            }}
          >
            {isAuthenticated ? "Ir para o Dashboard" : "Começar agora"}
            <ArrowRight size={15} />
          </a>
        </FadeIn>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ borderTop: "1px solid #F3F4F6", background: "#fff" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 24px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
            <div>
              <img src="/manus-storage/neurix-logo_7cad8203.png" alt="NEURIX" style={{ height: 36, objectFit: "contain", marginBottom: 6 }} />
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4, maxWidth: 260, lineHeight: 1.6 }}>Plataforma de inteligência clínica com IA para médicos.</p>
            </div>
            <nav style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: "#9CA3AF", textTransform: "uppercase" }}>Plataforma</span>
                <a href="/" style={{ fontSize: 12, color: "#6B7280", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = "#111827")} onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}>Início</a>
                <a href="/funcionalidades" style={{ fontSize: 12, color: "#6B7280", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = "#111827")} onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}>Funcionalidades</a>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: "#9CA3AF", textTransform: "uppercase" }}>Legal</span>
                <a href="/privacidade" style={{ fontSize: 12, color: "#6B7280", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = "#111827")} onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}>Política de Privacidade</a>
                <a href="/termos" style={{ fontSize: 12, color: "#6B7280", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = "#111827")} onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}>Termos de Uso</a>
                <a href="/contato" style={{ fontSize: 12, color: "#6B7280", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = "#111827")} onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}>Contato</a>
              </div>
            </nav>
          </div>
          <div style={{ borderTop: "1px solid #F3F4F6" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <p style={{ fontSize: 11, color: "#D1D5DB", margin: 0 }}>© {new Date().getFullYear()} NEURIX. Todos os direitos reservados.</p>
            <p style={{ fontSize: 11, color: "#D1D5DB", margin: 0 }}>Clari é suporte clínico. A decisão médica é sempre do profissional.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
