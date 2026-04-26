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
    <div style={{ marginTop: 64, position: "relative" }}>

      {/* Responsive CSS */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        .mockup-shell {
          background: #fff;
          border-radius: 14px;
          border: 1px solid rgba(17,24,39,0.06);
          box-shadow: 0 4px 32px rgba(17,24,39,0.06);
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
          background: #FEFEFE;
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
              style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}
            >
              <img src="/manus-storage/2_19b7e141.png" alt="NEXORA" style={{ width: 18, height: 18, objectFit: "contain" }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#111827" }}>NEXORA</span>
            </div>
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

/* ─── Clari Interactive Demo ─── */
const SOAP_STEPS = [
  {
    id: "idle",
    label: "Ver Clari em ação",
    description: "Clique para ver a IA estruturando uma nota clínica",
  },
];

const SOAP_CONTENT = {
  S: "Paciente masculino, 52 anos, refere dor torácica em aperto há 3 dias, com piora progressiva ao esforço físico moderado. Nega irradiação. Relata dispneia leve associada. HAS em uso de losartana 50mg/dia.",
  O: "PA: 148/92 mmHg · FC: 88 bpm · SpO2: 97% · Ausculta cardíaca: RCR 2T, sem sopros. Ausculta pulmonar: MV+ bilateral, sem ruídos adventícios.",
  A: "Síndrome coronariana aguda a esclarecer. Angina instável como principal hipótese diagnóstica. Diagnósticos diferenciais: DRGE, musculoesquelético.",
  P: "ECG 12 derivações imediato · Troponina I seriada (0h/3h) · AAS 300mg VO agora · Encaminhamento para avaliação cardiológica urgente · Monitorização contínua",
};

function ClariDemo() {
  const [phase, setPhase] = useState<"idle" | "transcribing" | "structuring" | "done">("idle");
  const [typedS, setTypedS] = useState("");
  const [typedO, setTypedO] = useState("");
  const [typedA, setTypedA] = useState("");
  const [typedP, setTypedP] = useState("");
  const [showActions, setShowActions] = useState(false);
  const [clickedAction, setClickedAction] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function typeText(
    text: string,
    setter: (v: string) => void,
    onDone: () => void,
    speed = 18
  ) {
    let i = 0;
    function tick() {
      i++;
      setter(text.slice(0, i));
      if (i < text.length) {
        timerRef.current = setTimeout(tick, speed);
      } else {
        onDone();
      }
    }
    timerRef.current = setTimeout(tick, speed);
  }

  function startDemo() {
    if (phase !== "idle") { resetDemo(); return; }
    setPhase("transcribing");
    setTypedS(""); setTypedO(""); setTypedA(""); setTypedP("");
    setShowActions(false); setClickedAction(null);

    timerRef.current = setTimeout(() => {
      setPhase("structuring");
      typeText(SOAP_CONTENT.S, setTypedS, () =>
        typeText(SOAP_CONTENT.O, setTypedO, () =>
          typeText(SOAP_CONTENT.A, setTypedA, () =>
            typeText(SOAP_CONTENT.P, setTypedP, () => {
              setPhase("done");
              setTimeout(() => setShowActions(true), 400);
            }, 14)
          , 14)
        , 14)
      , 14);
    }, 1800);
  }

  function resetDemo() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("idle");
    setTypedS(""); setTypedO(""); setTypedA(""); setTypedP("");
    setShowActions(false); setClickedAction(null);
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const soapColor = "#C9A646";

  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      border: "1px solid rgba(17,24,39,0.06)",
      boxShadow: "0 4px 24px rgba(17,24,39,0.05)",
      overflow: "hidden",
      userSelect: "none",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 20px",
        borderBottom: "1px solid rgba(17,24,39,0.06)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "rgba(201,166,70,0.10)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Bot size={15} color={soapColor} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Clari</div>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>Assistente clínica</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          {phase !== "idle" && (
            <button
              onClick={resetDemo}
              style={{
                fontSize: 10, color: "#9CA3AF", background: "none", border: "none",
                cursor: "pointer", fontFamily: "inherit", padding: "3px 8px",
                borderRadius: 6, transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#6B7280")}
              onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
            >
              Reiniciar
            </button>
          )}
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: phase === "idle" ? "#D1D5DB" : "#22C55E", transition: "background 0.4s" }} />
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{phase === "idle" ? "Aguardando" : "Online"}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "20px", minHeight: 260 }}>

        {/* IDLE STATE — CTA */}
        {phase === "idle" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 220, gap: 16, textAlign: "center" }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "rgba(201,166,70,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FileText size={22} color={soapColor} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: "0 0 6px" }}>Veja a Clari estruturando uma nota</p>
              <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>Clique no botão abaixo para iniciar a demonstração</p>
            </div>
            <button
              onClick={startDemo}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "10px 22px", borderRadius: 10,
                background: "#111827", color: "#fff",
                fontSize: 13, fontWeight: 600, border: "none",
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 2px 8px rgba(17,24,39,0.15)",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1f2937"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#111827"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <Mic size={14} /> Iniciar demonstração
            </button>
          </div>
        )}

        {/* TRANSCRIBING STATE */}
        {phase === "transcribing" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 220, gap: 14 }}>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  width: 3, borderRadius: 3,
                  background: soapColor,
                  animation: `clari-wave 0.9s ease-in-out ${i * 0.12}s infinite alternate`,
                  height: 8 + Math.sin(i) * 8,
                }} />
              ))}
            </div>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>Transcrevendo consulta...</p>
            <p style={{ fontSize: 11, color: "#D1D5DB", margin: 0, fontStyle: "italic" }}>"...paciente refere dor torácica há 3 dias, piora ao esforço..."</p>
            <style>{`@keyframes clari-wave { from { transform: scaleY(0.5); } to { transform: scaleY(1.8); } }`}</style>
          </div>
        )}

        {/* STRUCTURING / DONE STATE — SOAP */}
        {(phase === "structuring" || phase === "done") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Clari intro message */}
            <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                background: "rgba(201,166,70,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Bot size={12} color={soapColor} />
              </div>
              <div style={{
                background: "#F9FAFB", borderRadius: "4px 12px 12px 12px",
                padding: "8px 12px", fontSize: 12, color: "#374151", lineHeight: 1.5,
              }}>
                {phase === "structuring" ? "Estruturando nota SOAP..." : "Nota SOAP gerada com sucesso."}
              </div>
            </div>

            {/* SOAP Card */}
            <div style={{
              background: "#F9FAFB", borderRadius: 12,
              border: "1px solid rgba(17,24,39,0.06)",
              padding: "14px 16px",
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              {([
                { key: "S", label: "Subjetivo", text: typedS },
                { key: "O", label: "Objetivo", text: typedO },
                { key: "A", label: "Avaliação", text: typedA },
                { key: "P", label: "Plano", text: typedP },
              ] as const).map(({ key, label, text }) => (
                <div key={key} style={{ display: text ? "block" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 800, color: soapColor,
                      background: "rgba(201,166,70,0.10)",
                      padding: "2px 7px", borderRadius: 4, letterSpacing: "0.06em",
                    }}>{key}</span>
                    <span style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 500 }}>{label}</span>
                  </div>
                  <p style={{ fontSize: 11.5, color: "#374151", lineHeight: 1.6, margin: 0 }}>
                    {text}
                    {phase === "structuring" && (
                      (key === "S" && typedS.length < SOAP_CONTENT.S.length) ||
                      (key === "O" && typedS.length === SOAP_CONTENT.S.length && typedO.length < SOAP_CONTENT.O.length) ||
                      (key === "A" && typedO.length === SOAP_CONTENT.O.length && typedA.length < SOAP_CONTENT.A.length) ||
                      (key === "P" && typedA.length === SOAP_CONTENT.A.length && typedP.length < SOAP_CONTENT.P.length)
                    ) && <span style={{ display: "inline-block", width: 2, height: 12, background: soapColor, marginLeft: 2, animation: "clari-blink 0.8s step-end infinite", verticalAlign: "middle" }} />}
                  </p>
                </div>
              ))}
            </div>

            {/* Action buttons — appear after done */}
            {showActions && (
              <div style={{
                display: "flex", gap: 8, flexWrap: "wrap",
                opacity: showActions ? 1 : 0,
                transform: showActions ? "translateY(0)" : "translateY(6px)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
              }}>
                {[
                  { label: "Gerar prescrição", icon: "💊" },
                  { label: "Pedido de exame", icon: "🔬" },
                  { label: "Exportar PDF", icon: "📄" },
                ].map(({ label, icon }) => (
                  <button
                    key={label}
                    onClick={() => setClickedAction(label)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      fontSize: 11, fontWeight: 600,
                      padding: "6px 12px", borderRadius: 8,
                      background: clickedAction === label ? "#111827" : "rgba(201,166,70,0.08)",
                      color: clickedAction === label ? "#fff" : soapColor,
                      border: `1px solid ${clickedAction === label ? "#111827" : "rgba(201,166,70,0.20)"}`,
                      cursor: "pointer", fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { if (clickedAction !== label) { e.currentTarget.style.background = "rgba(201,166,70,0.15)"; } }}
                    onMouseLeave={e => { if (clickedAction !== label) { e.currentTarget.style.background = "rgba(201,166,70,0.08)"; } }}
                  >
                    <span>{icon}</span> {label}
                  </button>
                ))}
              </div>
            )}

            {/* Clicked action feedback */}
            {clickedAction && (
              <div style={{
                display: "flex", gap: 8, alignItems: "flex-start",
                animation: "clari-fadein 0.35s ease",
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(201,166,70,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Bot size={12} color={soapColor} />
                </div>
                <div style={{
                  background: "#F9FAFB", borderRadius: "4px 12px 12px 12px",
                  padding: "8px 12px", fontSize: 12, color: "#374151", lineHeight: 1.5,
                }}>
                  {clickedAction === "Gerar prescrição" && "Prescri\u00e7\u00e3o gerada: Losartana 50mg 1x/dia, AAS 100mg 1x/dia. Deseja ajustar a dosagem?"}
                  {clickedAction === "Pedido de exame" && "Pedido gerado: ECG 12 deriv., Troponina I seriada, Hemograma, Glicemia, Perfil lip\u00eddico. Deseja adicionar outro exame?"}
                  {clickedAction === "Exportar PDF" && "PDF gerado com sucesso. O documento inclui a nota SOAP completa e assinatura digital."}
                </div>
              </div>
            )}
          </div>
        )}
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

      <style>{`
        @keyframes clari-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes clari-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  return (
    <div style={{ background: "#fff", color: "#111827", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Global responsive styles for landing page */}
      <style>{`
        .lp-hero { padding: 140px 24px 100px; }
        .lp-section-lg { padding: 140px 24px; }
        .lp-section-cta { padding: 140px 24px 160px; }
        .lp-clari-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 96px; align-items: start; }
        .lp-nav-links { display: flex; align-items: center; gap: 32px; }
        .lp-nav-clari { display: block; }
        @media (max-width: 768px) {
          .lp-hero { padding: 88px 20px 72px; }
          .lp-section-lg { padding: 88px 20px; }
          .lp-section-cta { padding: 88px 20px 120px; }
          .lp-clari-grid { grid-template-columns: 1fr; gap: 48px; }
          .lp-nav-clari { display: none; }
          .lp-nav-links { gap: 16px; }
        }
        @media (max-width: 480px) {
          .lp-hero { padding: 72px 16px 56px; }
          .lp-section-lg { padding: 72px 16px; }
          .lp-section-cta { padding: 72px 16px 100px; }
        }
      `}</style>

      {/* ─── NAVBAR ─── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.90)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(17,24,39,0.05)",
      }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <img src="/manus-storage/4_7e59f0e2.png" alt="NEXORA" style={{ height: 28, objectFit: "contain" }} />

          {/* Nav */}
          <nav className="lp-nav-links">
            <a
              href="/funcionalidades"
              style={{ fontSize: 13, color: "#9CA3AF", textDecoration: "none", fontWeight: 400, transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#374151")}
              onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
            >
              Funcionalidades
            </a>
            <button
              onClick={() => document.getElementById("clari")?.scrollIntoView({ behavior: "smooth" })}
              className="lp-nav-clari"
              style={{ fontSize: 13, color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 400 }}
              onMouseEnter={e => (e.currentTarget.style.color = "#374151")}
              onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
            >
              Clari
            </button>
            <a
              href={getLoginUrl()}
              style={{
                fontSize: 13, fontWeight: 500, color: "#374151",
                background: "transparent", border: "none",
                padding: "7px 0", textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#111827")}
              onMouseLeave={e => (e.currentTarget.style.color = "#374151")}
            >
              Entrar →
            </a>
          </nav>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="lp-hero" style={{ maxWidth: 1080, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          {/* Label */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 32 }}>
            <span style={{
              fontSize: 11, fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase",
              color: "#9CA3AF",
            }}>
              Inteligência clínica em tempo real
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "#111827",
            margin: "0 auto 24px",
            maxWidth: 640,
          }}>
            Menos burocracia.<br />
            <span style={{ color: "#C9A646" }}>Mais medicina.</span>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: "clamp(1rem, 2vw, 1.15rem)",
            color: "#9CA3AF",
            lineHeight: 1.7,
            maxWidth: 440,
            margin: "0 auto 48px",
            fontWeight: 400,
          }}>
            A NEXORA organiza sua consulta enquanto ela acontece e apoia sua decisão clínica.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
            <a
              href={getLoginUrl()}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 28px", borderRadius: 8,
                background: "#111827", color: "#fff",
                fontSize: 14, fontWeight: 500, textDecoration: "none",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
            >
              Começar agora
            </a>
            <button
              onClick={() => document.getElementById("valor")?.scrollIntoView({ behavior: "smooth" })}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "12px 0", borderRadius: 0,
                background: "transparent", color: "#9CA3AF",
                fontSize: 14, fontWeight: 400, border: "none",
                cursor: "pointer", fontFamily: "inherit",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#374151"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#9CA3AF"; }}
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

      {/* ─── VALUE ─── */}
      <section id="valor" className="lp-section-lg" style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <h2 style={{
            fontSize: "clamp(1.9rem, 4vw, 3rem)",
            fontWeight: 700, lineHeight: 1.15,
            letterSpacing: "-0.025em",
            color: "#111827",
            margin: "0 auto 28px",
          }}>
            Você não precisa documentar depois.<br />
            <span style={{ color: "#C9A646" }}>A consulta já sai pronta.</span>
          </h2>
          <p style={{ fontSize: 17, color: "#9CA3AF", lineHeight: 1.75, maxWidth: 440, margin: "0 auto" }}>
            Enquanto você atende, a NEXORA transcreve, estrutura e organiza — sem interromper seu raciocínio.
          </p>
        </FadeIn>
      </section>

      {/* ─── CLARI ─── */}
      <section id="clari" className="lp-section-lg" style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div className="lp-clari-grid">
          {/* Text */}
          <FadeIn>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: "#C9A646", marginBottom: 24 }}>
              Clari
            </p>
            <h2 style={{
              fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
              fontWeight: 700, lineHeight: 1.2,
              letterSpacing: "-0.02em",
              color: "#111827",
              marginBottom: 20,
            }}>
              Uma assistente que acompanha sua consulta
            </h2>
            <p style={{ fontSize: 15, color: "#9CA3AF", lineHeight: 1.75, marginBottom: 40 }}>
              A Clari organiza, estrutura e sugere — sem interromper.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px", display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                "Transcrição em tempo real durante a consulta",
                "Estrutura SOAP gerada automaticamente",
                "Sugestões baseadas em evidências clínicas",
              ].map(item => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 14, color: "#6B7280" }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#C9A646", marginTop: 8, flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href={getLoginUrl()}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 13, fontWeight: 500, color: "#9CA3AF",
                textDecoration: "none",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#374151")}
              onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
            >
              Começar com a Clari →
            </a>
          </FadeIn>

          {/* Interactive Clari Demo */}
          <FadeIn delay={80}>
            <ClariDemo />
          </FadeIn>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="lp-section-cta" style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <h2 style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 700, lineHeight: 1.15,
            letterSpacing: "-0.025em",
            color: "#111827",
            marginBottom: 20,
          }}>
            Pronto para atender com mais clareza?
          </h2>
          <p style={{ fontSize: 16, color: "#9CA3AF", lineHeight: 1.75, maxWidth: 380, margin: "0 auto 48px" }}>
            Comece agora e veja sua consulta se transformar em documentação completa — automaticamente.
          </p>
          <a
            href={getLoginUrl()}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 28px", borderRadius: 8,
              background: "#111827", color: "#fff",
              fontSize: 14, fontWeight: 500, textDecoration: "none",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            Começar agora
          </a>
        </FadeIn>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ borderTop: "1px solid #F3F4F6", background: "#fff" }}>
        <div style={{
          maxWidth: 1080, margin: "0 auto", padding: "40px 24px 32px",
          display: "flex", flexDirection: "column", gap: 24,
        }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
            {/* Brand */}
            <div>
              <img src="/manus-storage/4_7e59f0e2.png" alt="NEXORA" style={{ height: 22, objectFit: "contain", marginBottom: 6 }} />
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4, maxWidth: 260, lineHeight: 1.6 }}>
                Plataforma de inteligência clínica com IA para médicos.
              </p>
            </div>

            {/* Links */}
            <nav style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: "#9CA3AF", textTransform: "uppercase" }}>Plataforma</span>
                <a href="/funcionalidades" style={{ fontSize: 12, color: "#6B7280", textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#111827")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}>
                  Funcionalidades
                </a>
                <a href={getLoginUrl()} style={{ fontSize: 12, color: "#6B7280", textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#111827")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}>
                  Acessar plataforma
                </a>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: "#9CA3AF", textTransform: "uppercase" }}>Legal</span>
                <a href="/privacidade" style={{ fontSize: 12, color: "#6B7280", textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#111827")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}>
                  Política de Privacidade
                </a>
                <a href="/termos" style={{ fontSize: 12, color: "#6B7280", textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#111827")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}>
                  Termos de Uso
                </a>
                <a href="/contato" style={{ fontSize: 12, color: "#6B7280", textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#111827")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}>
                  Contato
                </a>
              </div>
            </nav>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #F3F4F6" }} />

          {/* Bottom row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <p style={{ fontSize: 11, color: "#D1D5DB", margin: 0 }}>
              © {new Date().getFullYear()} NEXORA. Todos os direitos reservados.
            </p>
            <p style={{ fontSize: 11, color: "#D1D5DB", margin: 0, textAlign: "right" }}>
              Clari é suporte clínico. A decisão médica é sempre do profissional.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
