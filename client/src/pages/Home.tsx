import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { ArrowRight, Bot, CheckCircle2, Mic, FileText, Stethoscope } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

/* ─── Fade-in on scroll ─── */
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(18px)";
    el.style.transition = `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return <div ref={ref}>{children}</div>;
}

/* ─── Especialidades ─── */
const SPECIALTIES = [
  {
    id: "cardio",
    label: "Cardiologia",
    emoji: "🫀",
    patient: "João M., 52 anos",
    recording: '"...paciente refere dor torácica há 3 dias, piora ao esforço, sem irradiação..."',
    soap: [
      { tag: "S", text: "Dor torácica há 3 dias, piora ao esforço, sem irradiação" },
      { tag: "O", text: "PA 130/85 mmHg, FC 88 bpm, ausculta cardíaca normal" },
      { tag: "A", text: "Suspeita de angina estável — CID I20.8" },
      { tag: "P", text: "ECG + troponina + encaminhamento cardiologista" },
    ],
    clari: "Identifiquei padrões compatíveis com angina estável. Deseja explorar as condutas de primeira linha?",
    actions: ["Ver evidências", "Gerar encaminhamento"],
  },
  {
    id: "nutro",
    label: "Nutrologia",
    emoji: "🌿",
    patient: "Ana P., 34 anos",
    recording: '"...paciente relata ganho de 8kg em 6 meses, fadiga constante, hábitos alimentares irregulares..."',
    soap: [
      { tag: "S", text: "Ganho ponderal de 8kg em 6 meses, fadiga e compulsão alimentar" },
      { tag: "O", text: "IMC 28,4 kg/m², circunferência abdominal 88cm" },
      { tag: "A", text: "Sobrepeso com risco metabólico — CID E66.0" },
      { tag: "P", text: "Plano alimentar + exames metabólicos + retorno em 30 dias" },
    ],
    clari: "Identifiquei padrão compatível com sobrepeso de origem multifatorial. Deseja gerar plano alimentar personalizado?",
    actions: ["Gerar plano", "Solicitar exames"],
  },
  {
    id: "dermato",
    label: "Dermatologia",
    emoji: "✨",
    patient: "Carla S., 28 anos",
    recording: '"...lesões acênéicas no rosto há 2 meses, piora com estresse, sem uso de medicamentos..."',
    soap: [
      { tag: "S", text: "Lesões acênéicas faciais há 2 meses, piora ao estresse" },
      { tag: "O", text: "Acêné grau II, predominância em região malar bilateral" },
      { tag: "A", text: "Acêné vulgar moderada — CID L70.0" },
      { tag: "P", text: "Adapaleno 0,1% + antibioticoterapia tópica + protetor solar" },
    ],
    clari: "Padrão compatível com acêné vulgar moderada. Deseja ver protocolo de tratamento baseado em evidências?",
    actions: ["Ver protocolo", "Gerar prescrição"],
  },
  {
    id: "endo",
    label: "Endocrinologia",
    emoji: "🧬",
    patient: "Roberto L., 47 anos",
    recording: '"...paciente diabético tipo 2 há 5 anos, glicemia em jejum 210 mg/dL, poliuria e polidipsia..."',
    soap: [
      { tag: "S", text: "Poliuria, polidipsia e glicemia 210 mg/dL em jejum" },
      { tag: "O", text: "HbA1c 9,2%, peso 94kg, PA 138/88 mmHg" },
      { tag: "A", text: "DM2 descompensado com síndrome metabólica — CID E11" },
      { tag: "P", text: "Ajuste de metformina + inibidor SGLT2 + retorno em 15 dias" },
    ],
    clari: "HbA1c 9,2% indica descompensação significativa. Deseja avaliar escalonamento terapêutico baseado nas diretrizes ADA 2024?",
    actions: ["Ver diretrizes", "Ajustar dose"],
  },
  {
    id: "gineco",
    label: "Ginecologia",
    emoji: "🌸",
    patient: "Mariana T., 31 anos",
    recording: '"...ciclos irregulares há 4 meses, dor pélvica crônica, ultrassom com imagem cística ovariana..."',
    soap: [
      { tag: "S", text: "Ciclos irregulares há 4 meses e dor pélvica crônica" },
      { tag: "O", text: "Ultrassom: cisto ovariano direito 4,2cm, CA-125 normal" },
      { tag: "A", text: "Suspeita de endometrioma — CID N80.1" },
      { tag: "P", text: "Progesterona + controle ultrassonográfico em 60 dias" },
    ],
    clari: "Cisto ovariano com características de endometrioma. Deseja explorar critérios para conduta expectante vs. cirúrgica?",
    actions: ["Ver critérios", "Gerar pedido"],
  },
];

/* ─── Animated Mockup ─── */
const STEPS = [
  {
    id: "recording",
    label: "Gravando consulta",
    icon: Mic,
    color: "#EF4444",
    bg: "rgba(239,68,68,0.08)",
    content: (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", animation: "pulse 1.2s infinite" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#EF4444" }}>Gravando</span>
          <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: "auto" }}>00:02:14</span>
        </div>
        <div style={{ background: "#F9FAFB", borderRadius: 8, padding: "10px 12px" }}>
          <p style={{ fontSize: 11, color: "#374151", lineHeight: 1.6, margin: 0 }}>
            "...paciente refere dor torácica há 3 dias, piora ao esforço, sem irradiação..."
          </p>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 8, alignItems: "center" }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} style={{
              width: 3, borderRadius: 2, background: "#C9A646",
              height: Math.random() * 20 + 4,
              opacity: 0.6 + Math.random() * 0.4,
            }} />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "transcribing",
    label: "Transcrevendo com IA",
    icon: FileText,
    color: "#C9A646",
    bg: "rgba(201,166,70,0.08)",
    content: (
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#C9A646", marginBottom: 10 }}>Transcrição em andamento...</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {["S — Dor torácica há 3 dias, piora ao esforço", "O — PA 130/85, FC 88 bpm, ausculta normal", "A — Suspeita de angina estável", "P — ECG, troponina, encaminhar cardiologista"].map((line, i) => (
            <div key={i} style={{
              fontSize: 11, color: i < 2 ? "#374151" : "#9CA3AF",
              padding: "6px 10px", borderRadius: 6,
              background: i < 2 ? "#F9FAFB" : "transparent",
              border: i < 2 ? "1px solid rgba(17,24,39,0.06)" : "none",
              transition: "all 0.3s",
            }}>{line}</div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "soap",
    label: "SOAP gerado",
    icon: Stethoscope,
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    content: (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <CheckCircle2 size={13} color="#10B981" />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#10B981" }}>SOAP gerado automaticamente</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {[
            { tag: "S", text: "Dor torácica há 3 dias, piora ao esforço, sem irradiação" },
            { tag: "O", text: "PA 130/85 mmHg, FC 88 bpm, ausculta cardíaca normal" },
            { tag: "A", text: "Suspeita de angina estável — CID I20.8" },
            { tag: "P", text: "ECG + troponina + encaminhamento cardiologista" },
          ].map(({ tag, text }) => (
            <div key={tag} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{
                fontSize: 10, fontWeight: 800, color: "#C9A646",
                background: "rgba(201,166,70,0.10)",
                padding: "2px 6px", borderRadius: 4, flexShrink: 0, marginTop: 1,
              }}>{tag}</span>
              <span style={{ fontSize: 11, color: "#374151", lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "clari",
    label: "Clari sugere conduta",
    icon: Bot,
    color: "#C9A646",
    bg: "rgba(201,166,70,0.08)",
    content: (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(201,166,70,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bot size={12} color="#C9A646" />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#C9A646" }}>Clari</span>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", marginLeft: "auto" }} />
        </div>
        <p style={{ fontSize: 11, color: "#374151", lineHeight: 1.6, margin: "0 0 10px" }}>
          Identifiquei padrões compatíveis com angina estável. Deseja explorar as condutas de primeira linha?
        </p>
        <div style={{ display: "flex", gap: 6 }}>
          {["Ver evidências", "Gerar prescrição"].map(label => (
            <span key={label} style={{
              fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
              background: label === "Ver evidências" ? "rgba(201,166,70,0.12)" : "#F3F4F6",
              color: label === "Ver evidências" ? "#C9A646" : "#6B7280",
              cursor: "pointer",
            }}>{label}</span>
          ))}
        </div>
      </div>
    ),
  },
];

function AnimatedMockup() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const [specIdx, setSpecIdx] = useState(0);
  const [specVisible, setSpecVisible] = useState(true);

  // Auto-advance steps
  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setStep(s => {
          const next = (s + 1) % STEPS.length;
          // When wrapping back to 0, also advance specialty
          if (next === 0) {
            setSpecVisible(false);
            setTimeout(() => {
              setSpecIdx(si => (si + 1) % SPECIALTIES.length);
              setSpecVisible(true);
            }, 300);
          }
          return next;
        });
        setVisible(true);
      }, 350);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const current = STEPS[step];
  const Icon = current.icon;
  const spec = SPECIALTIES[specIdx];

  function changeSpec(i: number) {
    if (i === specIdx) return;
    setSpecVisible(false);
    setVisible(false);
    setTimeout(() => {
      setSpecIdx(i);
      setStep(0);
      setSpecVisible(true);
      setVisible(true);
    }, 280);
  }

  // Build SOAP content for current specialty
  const soapContent = (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <CheckCircle2 size={13} color="#10B981" />
        <span style={{ fontSize: 11, fontWeight: 600, color: "#10B981" }}>SOAP gerado automaticamente</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {spec.soap.map(({ tag, text }) => (
          <div key={tag} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{
              fontSize: 10, fontWeight: 800, color: "#C9A646",
              background: "rgba(201,166,70,0.10)",
              padding: "2px 6px", borderRadius: 4, flexShrink: 0, marginTop: 1,
            }}>{tag}</span>
            <span style={{ fontSize: 11, color: "#374151", lineHeight: 1.5 }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const clariContent = (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(201,166,70,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Bot size={12} color="#C9A646" />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#C9A646" }}>Clari</span>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", marginLeft: "auto" }} />
      </div>
      <p style={{ fontSize: 11, color: "#374151", lineHeight: 1.6, margin: "0 0 10px" }}>{spec.clari}</p>
      <div style={{ display: "flex", gap: 6 }}>
        {spec.actions.map((label, li) => (
          <span key={label} style={{
            fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
            background: li === 0 ? "rgba(201,166,70,0.12)" : "#F3F4F6",
            color: li === 0 ? "#C9A646" : "#6B7280",
            cursor: "pointer",
          }}>{label}</span>
        ))}
      </div>
    </div>
  );

  const recordingContent = (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", animation: "pulse 1.2s infinite" }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: "#EF4444" }}>Gravando</span>
        <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: "auto" }}>00:02:14</span>
      </div>
      <div style={{ background: "#fff", borderRadius: 8, padding: "10px 12px", border: "1px solid rgba(17,24,39,0.06)" }}>
        <p style={{ fontSize: 11, color: "#374151", lineHeight: 1.6, margin: 0 }}>{spec.recording}</p>
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 8, alignItems: "center" }}>
        {[14,8,18,6,22,10,16,5,20,12,18,7,24,9,15,6,19,11,17,8].map((h, i) => (
          <div key={i} style={{ width: 3, borderRadius: 2, background: "#C9A646", height: h, opacity: 0.5 + (i % 3) * 0.2 }} />
        ))}
      </div>
    </div>
  );

  const transcribingContent = (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#C9A646", marginBottom: 10 }}>Transcrição em andamento...</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {spec.soap.map((line, i) => (
          <div key={i} style={{
            fontSize: 11, color: i < 2 ? "#374151" : "#9CA3AF",
            padding: "6px 10px", borderRadius: 6,
            background: i < 2 ? "#fff" : "transparent",
            border: i < 2 ? "1px solid rgba(17,24,39,0.06)" : "none",
          }}>{line.tag} — {line.text}</div>
        ))}
      </div>
    </div>
  );

  const stepContents = [recordingContent, transcribingContent, soapContent, clariContent];

  return (
    <div style={{ marginTop: 56, position: "relative" }}>
      {/* Glow */}
      <div style={{
        position: "absolute", inset: "-40px",
        background: "radial-gradient(ellipse 70% 50% at 50% 60%, rgba(201,166,70,0.09) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Responsive CSS */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        .mockup-shell {
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(17,24,39,0.08);
          box-shadow: 0 8px 40px rgba(17,24,39,0.08), 0 1px 3px rgba(17,24,39,0.06);
          overflow: hidden;
          max-width: 780px;
          margin: 0 auto;
          position: relative;
        }
        .spec-tabs {
          border-bottom: 1px solid rgba(17,24,39,0.07);
          padding: 0 16px;
          display: flex;
          gap: 0;
          overflow-x: auto;
          background: #FAFAFA;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .spec-tabs::-webkit-scrollbar { display: none; }
        .spec-tab {
          font-size: 11px;
          padding: 10px 12px;
          background: none;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          font-family: inherit;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .mockup-body {
          padding: 18px 18px 16px;
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 16px;
        }
        .mockup-sidebar {
          border-right: 1px solid #F3F4F6;
          padding-right: 12px;
        }
        @media (max-width: 600px) {
          .mockup-shell {
            border-radius: 12px;
            margin: 0 4px;
          }
          .spec-tab {
            font-size: 10px;
            padding: 9px 10px;
          }
          .mockup-body {
            padding: 14px 14px 12px;
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .mockup-sidebar {
            border-right: none;
            border-bottom: 1px solid #F3F4F6;
            padding-right: 0;
            padding-bottom: 10px;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 4px;
          }
          .mockup-sidebar-title { display: none; }
          .mockup-step-item {
            border-left: none !important;
            border-bottom: 2px solid transparent;
            padding: 5px 8px !important;
            border-radius: 20px !important;
            font-size: 10px !important;
          }
        }
      `}</style>

      <div className="mockup-shell">
        {/* Browser bar — hidden on mobile */}
        <div style={{
          background: "#F3F4F6",
          borderBottom: "1px solid rgba(17,24,39,0.07)",
          padding: "8px 14px",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{ display: "flex", gap: 5 }}>
            {["#FF5F57","#FEBC2E","#28C840"].map(c => (
              <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <div style={{ flex: 1, background: "#E5E7EB", borderRadius: 5, height: 17, marginLeft: 8 }} />
        </div>

        {/* Specialty tabs — horizontal scroll on mobile */}
        <div className="spec-tabs">
          {SPECIALTIES.map((sp, i) => (
            <button
              key={sp.id}
              onClick={() => changeSpec(i)}
              className="spec-tab"
              style={{
                fontWeight: i === specIdx ? 600 : 400,
                color: i === specIdx ? "#111827" : "#9CA3AF",
                borderBottom: i === specIdx ? "2px solid #C9A646" : "2px solid transparent",
              }}
            >
              {sp.emoji} {sp.label}
            </button>
          ))}
        </div>

        {/* Body: sidebar + main — stacks vertically on mobile */}
        <div
          className="mockup-body"
          style={{ opacity: specVisible ? 1 : 0, transition: "opacity 0.28s ease" }}
        >
          {/* Sidebar / step nav */}
          <div className="mockup-sidebar">
            <div
              className="mockup-sidebar-title"
              style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#111827", marginBottom: 12 }}
            >NEXORA</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {STEPS.map((s, i) => {
                const SIcon = s.icon;
                const active = i === step;
                return (
                  <div
                    key={s.id}
                    onClick={() => { setVisible(false); setTimeout(() => { setStep(i); setVisible(true); }, 200); }}
                    className="mockup-step-item"
                    style={{
                      fontSize: 11, padding: "6px 9px", borderRadius: 7,
                      background: active ? "#F9FAFB" : "transparent",
                      color: active ? "#111827" : "#9CA3AF",
                      fontWeight: active ? 600 : 400,
                      borderLeft: `2px solid ${active ? s.color : "transparent"}`,
                      cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                      transition: "all 0.2s",
                    }}
                  >
                    <SIcon size={11} color={active ? s.color : "#9CA3AF"} />
                    {s.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main panel */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 8,
                background: current.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.3s",
              }}>
                <Icon size={13} color={current.color} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Consulta em andamento</div>
                <div style={{ fontSize: 10, color: "#9CA3AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Dr. Silva · {spec.patient}</div>
              </div>
              {/* Step dots */}
              <div style={{ marginLeft: "auto", display: "flex", gap: 4, flexShrink: 0 }}>
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => { setVisible(false); setTimeout(() => { setStep(i); setVisible(true); }, 200); }}
                    style={{
                      width: i === step ? 14 : 5, height: 5, borderRadius: 3,
                      background: i === step ? current.color : "#E5E7EB",
                      transition: "all 0.3s",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Animated content */}
            <div style={{
              background: "#F9FAFB",
              borderRadius: 12,
              padding: "13px",
              border: "1px solid rgba(17,24,39,0.06)",
              minHeight: 120,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 0.35s ease, transform 0.35s ease",
            }}>
              {stepContents[step]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div style={{ background: "#F9FAFB", color: "#111827", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Global responsive styles for landing page */}
      <style>{`
        .lp-hero { padding: 120px 24px 80px; }
        .lp-section-lg { padding: 120px 24px; }
        .lp-section-cta { padding: 120px 24px 140px; }
        .lp-clari-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .lp-nav-links { display: flex; align-items: center; gap: 32px; }
        .lp-nav-clari { display: block; }
        @media (max-width: 768px) {
          .lp-hero { padding: 72px 20px 56px; }
          .lp-section-lg { padding: 72px 20px; }
          .lp-section-cta { padding: 72px 20px 100px; }
          .lp-clari-grid { grid-template-columns: 1fr; gap: 40px; }
          .lp-nav-clari { display: none; }
          .lp-nav-links { gap: 16px; }
        }
        @media (max-width: 480px) {
          .lp-hero { padding: 56px 16px 40px; }
          .lp-section-lg { padding: 56px 16px; }
          .lp-section-cta { padding: 56px 16px 80px; }
        }
      `}</style>

      {/* ─── NAVBAR ─── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(249,250,251,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(17,24,39,0.06)",
      }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "0.12em", color: "#111827" }}>NEXORA</span>

          {/* Nav */}
          <nav className="lp-nav-links">
            <button
              onClick={() => document.getElementById("clari")?.scrollIntoView({ behavior: "smooth" })}
              className="lp-nav-clari"
              style={{ fontSize: 14, color: "#6B7280", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#111827")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}
            >
              Clari
            </button>
            <a
              href={getLoginUrl()}
              style={{
                fontSize: 14, fontWeight: 600, color: "#111827",
                background: "#fff", border: "1px solid rgba(17,24,39,0.12)",
                padding: "7px 18px", borderRadius: 8, textDecoration: "none",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                transition: "box-shadow 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.10)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)")}
            >
              Entrar
            </a>
          </nav>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="lp-hero" style={{ maxWidth: 1080, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          {/* Label */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
            <span style={{
              fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
              color: "#C9A646", background: "rgba(201,166,70,0.08)",
              padding: "5px 12px", borderRadius: 20,
              border: "1px solid rgba(201,166,70,0.18)",
            }}>
              Inteligência clínica em tempo real
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: "#111827",
            margin: "0 auto 20px",
            maxWidth: 680,
          }}>
            Menos burocracia.<br />
            <span style={{ color: "#C9A646" }}>Mais medicina.</span>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            color: "#6B7280",
            lineHeight: 1.6,
            maxWidth: 480,
            margin: "0 auto 40px",
            fontWeight: 400,
          }}>
            A NEXORA organiza sua consulta enquanto ela acontece e apoia sua decisão clínica.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href={getLoginUrl()}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "13px 28px", borderRadius: 10,
                background: "#111827", color: "#fff",
                fontSize: 15, fontWeight: 600, textDecoration: "none",
                boxShadow: "0 2px 8px rgba(17,24,39,0.18)",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1f2937"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(17,24,39,0.22)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#111827"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(17,24,39,0.18)"; }}
            >
              Começar agora
              <ArrowRight size={16} />
            </a>
            <button
              onClick={() => document.getElementById("valor")?.scrollIntoView({ behavior: "smooth" })}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "13px 24px", borderRadius: 10,
                background: "transparent", color: "#6B7280",
                fontSize: 15, fontWeight: 500, border: "1px solid rgba(17,24,39,0.10)",
                cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#111827"; e.currentTarget.style.borderColor = "rgba(17,24,39,0.20)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#6B7280"; e.currentTarget.style.borderColor = "rgba(17,24,39,0.10)"; }}
            >
              Ver como funciona
            </button>
          </div>
        </FadeIn>

        {/* ─── Animated Product Mockup ─── */}
        <FadeIn delay={120}>
          <AnimatedMockup />
        </FadeIn>
      </section>

      {/* ─── DIVIDER ─── */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ height: 1, background: "rgba(17,24,39,0.06)" }} />
      </div>

      {/* ─── VALUE ─── */}
      <section id="valor" className="lp-section-lg" style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C9A646", marginBottom: 24 }}>
            Por que a NEXORA
          </p>
          <h2 style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 800, lineHeight: 1.15,
            letterSpacing: "-0.025em",
            color: "#111827",
            margin: "0 auto 28px",
          }}>
            Você não precisa documentar depois.<br />
            <span style={{ color: "#C9A646" }}>A consulta já sai pronta.</span>
          </h2>
          <p style={{ fontSize: 17, color: "#6B7280", lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
            Enquanto você atende, a NEXORA transcreve, estrutura e organiza tudo em formato clínico — sem interromper seu raciocínio.
          </p>
        </FadeIn>
      </section>

      {/* ─── DIVIDER ─── */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ height: 1, background: "rgba(17,24,39,0.06)" }} />
      </div>

      {/* ─── CLARI ─── */}
      <section id="clari" className="lp-section-lg" style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div className="lp-clari-grid">
          {/* Text */}
          <FadeIn>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C9A646", marginBottom: 20 }}>
              Clari
            </p>
            <h2 style={{
              fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
              fontWeight: 800, lineHeight: 1.15,
              letterSpacing: "-0.025em",
              color: "#111827",
              marginBottom: 20,
            }}>
              Uma assistente que acompanha sua consulta
            </h2>
            <p style={{ fontSize: 16, color: "#6B7280", lineHeight: 1.7, marginBottom: 32 }}>
              A Clari organiza, estrutura e sugere — sem interromper.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Transcrição em tempo real durante a consulta",
                "Estrutura SOAP gerada automaticamente",
                "Sugestões baseadas em evidências clínicas",
              ].map(item => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, color: "#374151" }}>
                  <CheckCircle2 size={17} color="#C9A646" style={{ marginTop: 2, flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href={getLoginUrl()}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                fontSize: 14, fontWeight: 600, color: "#111827",
                textDecoration: "none",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#C9A646")}
              onMouseLeave={e => (e.currentTarget.style.color = "#111827")}
            >
              Conhecer a Clari <ArrowRight size={15} />
            </a>
          </FadeIn>

          {/* Chat UI */}
          <FadeIn delay={80}>
            <div style={{
              background: "#fff",
              borderRadius: 16,
              border: "1px solid rgba(17,24,39,0.08)",
              boxShadow: "0 8px 40px rgba(17,24,39,0.07)",
              overflow: "hidden",
            }}>
              {/* Header */}
              <div style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(17,24,39,0.06)",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "rgba(201,166,70,0.10)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Bot size={15} color="#C9A646" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Clari</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>Assistente clínica</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E" }} />
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>Online</span>
                </div>
              </div>

              {/* Messages */}
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Clari message */}
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: "rgba(201,166,70,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Bot size={13} color="#C9A646" />
                  </div>
                  <div style={{
                    background: "#F9FAFB", borderRadius: "4px 14px 14px 14px",
                    padding: "10px 14px", fontSize: 13, color: "#374151", lineHeight: 1.55,
                    maxWidth: "85%",
                  }}>
                    Identifiquei padrões compatíveis com esta hipótese. Deseja explorar as condutas possíveis?
                  </div>
                </div>

                {/* User message */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{
                    background: "#111827", borderRadius: "14px 4px 14px 14px",
                    padding: "10px 14px", fontSize: 13, color: "#fff", lineHeight: 1.55,
                    maxWidth: "80%",
                  }}>
                    Sim, quais são as opções de primeira linha?
                  </div>
                </div>

                {/* Clari response */}
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: "rgba(201,166,70,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Bot size={13} color="#C9A646" />
                  </div>
                  <div style={{
                    background: "#F9FAFB", borderRadius: "4px 14px 14px 14px",
                    padding: "10px 14px", fontSize: 13, color: "#374151", lineHeight: 1.55,
                    maxWidth: "85%",
                  }}>
                    Com base nas diretrizes atuais, as opções de primeira linha incluem...
                    <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                      {["Ver evidências", "Gerar prescrição"].map(label => (
                        <span key={label} style={{
                          fontSize: 11, fontWeight: 600,
                          padding: "4px 10px", borderRadius: 20,
                          background: label === "Ver evidências" ? "rgba(201,166,70,0.10)" : "#F3F4F6",
                          color: label === "Ver evidências" ? "#C9A646" : "#6B7280",
                          cursor: "pointer",
                        }}>{label}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div style={{
                padding: "10px 20px 14px",
                borderTop: "1px solid rgba(17,24,39,0.05)",
                textAlign: "center",
              }}>
                <p style={{ fontSize: 10, color: "#D1D5DB", margin: 0 }}>
                  Clari é suporte clínico. A decisão médica é sempre do profissional.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── DIVIDER ─── */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ height: 1, background: "rgba(17,24,39,0.06)" }} />
      </div>

      {/* ─── FINAL CTA ─── */}
      <section className="lp-section-cta" style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <h2 style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 800, lineHeight: 1.12,
            letterSpacing: "-0.025em",
            color: "#111827",
            marginBottom: 20,
          }}>
            Pronto para atender com mais clareza?
          </h2>
          <p style={{ fontSize: 17, color: "#6B7280", lineHeight: 1.65, marginBottom: 40, maxWidth: 420, margin: "0 auto 40px" }}>
            Comece agora e veja sua consulta se transformar em documentação clínica completa — automaticamente.
          </p>
          <a
            href={getLoginUrl()}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 32px", borderRadius: 10,
              background: "#111827", color: "#fff",
              fontSize: 15, fontWeight: 600, textDecoration: "none",
              boxShadow: "0 2px 8px rgba(17,24,39,0.18)",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1f2937"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(17,24,39,0.22)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#111827"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(17,24,39,0.18)"; }}
          >
            Começar agora
            <ArrowRight size={16} />
          </a>
        </FadeIn>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{
        borderTop: "1px solid rgba(17,24,39,0.06)",
        background: "#F9FAFB",
      }}>
        <div style={{
          maxWidth: 1080, margin: "0 auto", padding: "28px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
        }}>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.12em", color: "#111827" }}>NEXORA</span>
          <p style={{ fontSize: 11, color: "#D1D5DB", textAlign: "center", margin: 0 }}>
            Clari é suporte clínico. A decisão médica é sempre do profissional de saúde.
          </p>
          <p style={{ fontSize: 11, color: "#D1D5DB", margin: 0 }}>© {new Date().getFullYear()}</p>
        </div>
      </footer>

    </div>
  );
}
