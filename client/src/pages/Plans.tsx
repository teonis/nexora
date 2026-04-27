import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const GOLD = "#C9A646";
const DARK = "#0A0F1E";

// ─── Plan badge ───────────────────────────────────────────────────────────────
const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: "Gratuito", color: "#6B7280" },
  pro: { label: "Pro", color: GOLD },
  clinic: { label: "Clínica", color: "#7C3AED" },
};

// ─── Check icon ───────────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill={GOLD} fillOpacity="0.15" />
      <path d="M5 8l2 2 4-4" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error" | "info"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = type === "success" ? "#16A34A" : type === "error" ? "#DC2626" : "#1D4ED8";
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: bg, color: "#fff", padding: "12px 20px",
      borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      maxWidth: 360, fontSize: 14, lineHeight: 1.5,
      display: "flex", alignItems: "flex-start", gap: 10,
    }}>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Plans() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // Read URL params for success/cancel feedback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setToast({ message: "Assinatura ativada com sucesso! Bem-vindo ao NEXORA Pro.", type: "success" });
      window.history.replaceState({}, "", "/planos");
    } else if (params.get("cancelled") === "true") {
      setToast({ message: "Checkout cancelado. Você pode assinar a qualquer momento.", type: "info" });
      window.history.replaceState({}, "", "/planos");
    }
  }, []);

  const { data: plans, isLoading: plansLoading } = trpc.stripe.getPlans.useQuery();
  const { data: subStatus } = trpc.stripe.getSubscriptionStatus.useQuery(undefined, {
    enabled: !!user,
  });

  const createCheckout = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
        setToast({ message: "Redirecionando para o checkout seguro do Stripe...", type: "info" });
      }
      setLoadingPlan(null);
    },
    onError: (err) => {
      setToast({ message: err.message || "Erro ao criar sessão de checkout.", type: "error" });
      setLoadingPlan(null);
    },
  });

  const createPortal = trpc.stripe.createPortalSession.useMutation({
    onSuccess: (data) => {
      if (data.url) window.open(data.url, "_blank");
      setLoadingPlan(null);
    },
    onError: (err) => {
      setToast({ message: err.message || "Erro ao abrir portal de faturamento.", type: "error" });
      setLoadingPlan(null);
    },
  });

  const handlePlanAction = (planId: string) => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }

    if (planId === "free") {
      navigate("/dashboard");
      return;
    }

    const currentPlan = subStatus?.plan ?? "free";
    const isActive = subStatus?.status === "active";

    // Already on this plan and active → open portal
    if (currentPlan === planId && isActive) {
      setLoadingPlan(planId);
      createPortal.mutate({ origin: window.location.origin });
      return;
    }

    // Has an active subscription → manage via portal
    if (isActive && currentPlan !== "free") {
      setLoadingPlan(planId);
      createPortal.mutate({ origin: window.location.origin });
      return;
    }

    // New checkout
    setLoadingPlan(planId);
    createCheckout.mutate({ planId: planId as "pro" | "clinic", origin: window.location.origin });
  };

  const getButtonLabel = (planId: string) => {
    if (!user) return "Começar agora";
    if (planId === "free") return "Usar gratuitamente";
    const currentPlan = subStatus?.plan ?? "free";
    const isActive = subStatus?.status === "active";
    if (currentPlan === planId && isActive) return "Gerenciar assinatura";
    if (isActive && currentPlan !== "free") return "Alterar plano";
    return "Assinar agora";
  };

  const isCurrentPlan = (planId: string) => {
    if (!user) return false;
    return subStatus?.plan === planId && (subStatus?.status === "active" || planId === "free");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", fontFamily: "'Sora', sans-serif" }}>
      {/* Navbar */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(249,250,251,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #E5E7EB",
        padding: "0 32px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="https://manus.space/manus-storage/nexora-icon-2_1777246452.png" alt="N" style={{ width: 32, height: 32 }} />
          <span style={{ fontWeight: 700, fontSize: 18, color: DARK, letterSpacing: "-0.02em" }}>NEXORA</span>
        </a>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <a href="/funcionalidades" style={{ color: "#6B7280", fontSize: 14, textDecoration: "none" }}>Funcionalidades</a>
          <a href="/planos" style={{ color: DARK, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Planos</a>
          {user ? (
            <a href="/dashboard" style={{
              background: DARK, color: "#fff", padding: "8px 18px",
              borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none",
            }}>Dashboard</a>
          ) : (
            <a href={getLoginUrl()} style={{
              background: DARK, color: "#fff", padding: "8px 18px",
              borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none",
            }}>Entrar</a>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "80px 24px 48px" }}>
        <div style={{
          display: "inline-block", background: `${GOLD}18`, color: GOLD,
          padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
          letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20,
        }}>
          Planos & Preços
        </div>
        <h1 style={{
          fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, color: DARK,
          letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 16px",
        }}>
          Escolha o plano ideal<br />para sua prática médica
        </h1>
        <p style={{ color: "#6B7280", fontSize: 18, maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
          Comece gratuitamente e escale conforme sua necessidade. Cancele a qualquer momento.
        </p>

        {/* Current plan badge */}
        {user && subStatus && subStatus.plan !== "free" && subStatus.status === "active" && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#fff", border: `1px solid ${GOLD}40`,
            padding: "8px 16px", borderRadius: 24, marginTop: 24,
            fontSize: 13, color: "#374151",
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#16A34A", display: "inline-block",
            }} />
            Plano atual: <strong style={{ color: GOLD }}>{PLAN_LABELS[subStatus.plan]?.label}</strong>
            {subStatus.currentPeriodEnd && (
              <span style={{ color: "#9CA3AF" }}>
                · Renova em {new Date(subStatus.currentPeriodEnd).toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Plan Cards */}
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px",
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 24, alignItems: "start",
      }}>
        {plansLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} style={{
              background: "#fff", borderRadius: 16, padding: 32, height: 480,
              border: "1px solid #E5E7EB", animation: "pulse 1.5s infinite",
            }} />
          ))
        ) : (
          plans?.map((plan) => {
            const isCurrent = isCurrentPlan(plan.id);
            const isHighlighted = plan.highlighted;

            return (
              <div
                key={plan.id}
                style={{
                  background: isHighlighted ? DARK : "#fff",
                  borderRadius: 20,
                  padding: 32,
                  border: isHighlighted ? "none" : isCurrent ? `2px solid ${GOLD}` : "1px solid #E5E7EB",
                  boxShadow: isHighlighted
                    ? "0 20px 60px rgba(10,15,30,0.3)"
                    : isCurrent
                    ? `0 0 0 4px ${GOLD}20`
                    : "0 2px 8px rgba(0,0,0,0.04)",
                  position: "relative",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                {/* Popular badge */}
                {isHighlighted && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    background: GOLD, color: "#fff", padding: "4px 16px",
                    borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                    textTransform: "uppercase", whiteSpace: "nowrap",
                  }}>
                    Mais popular
                  </div>
                )}

                {/* Current plan indicator */}
                {isCurrent && !isHighlighted && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    background: "#16A34A", color: "#fff", padding: "4px 16px",
                    borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                    textTransform: "uppercase", whiteSpace: "nowrap",
                  }}>
                    Plano atual
                  </div>
                )}

                {/* Plan name */}
                <div style={{ marginBottom: 8 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: isHighlighted ? GOLD : "#9CA3AF",
                  }}>
                    {plan.name}
                  </span>
                </div>

                {/* Price */}
                <div style={{ marginBottom: 8 }}>
                  <span style={{
                    fontSize: 48, fontWeight: 800, letterSpacing: "-0.04em",
                    color: isHighlighted ? "#fff" : DARK,
                    lineHeight: 1,
                  }}>
                    {plan.priceLabel}
                  </span>
                  {plan.interval && (
                    <span style={{ color: isHighlighted ? "#9CA3AF" : "#6B7280", fontSize: 14, marginLeft: 4 }}>
                      /mês
                    </span>
                  )}
                </div>

                {/* Description */}
                <p style={{
                  color: isHighlighted ? "#9CA3AF" : "#6B7280",
                  fontSize: 14, marginBottom: 28, lineHeight: 1.5,
                }}>
                  {plan.description}
                </p>

                {/* CTA Button */}
                <button
                  onClick={() => handlePlanAction(plan.id)}
                  disabled={loadingPlan === plan.id}
                  style={{
                    width: "100%", padding: "14px 0",
                    background: isHighlighted ? GOLD : isCurrent ? "transparent" : DARK,
                    color: isHighlighted ? "#fff" : isCurrent ? DARK : "#fff",
                    border: isCurrent && !isHighlighted ? `2px solid ${DARK}` : "none",
                    borderRadius: 10, fontSize: 15, fontWeight: 700,
                    cursor: loadingPlan === plan.id ? "not-allowed" : "pointer",
                    opacity: loadingPlan === plan.id ? 0.7 : 1,
                    transition: "opacity 0.2s, transform 0.1s",
                    marginBottom: 28,
                  }}
                >
                  {loadingPlan === plan.id ? "Aguarde..." : getButtonLabel(plan.id)}
                </button>

                {/* Divider */}
                <div style={{ borderTop: `1px solid ${isHighlighted ? "#ffffff18" : "#F3F4F6"}`, marginBottom: 24 }} />

                {/* Features */}
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  {plan.features.map((feature, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{ marginTop: 1, flexShrink: 0 }}>
                        {isHighlighted ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="8" fill={`${GOLD}30`} />
                            <path d="M5 8l2 2 4-4" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <CheckIcon />
                        )}
                      </span>
                      <span style={{
                        color: isHighlighted ? "#D1D5DB" : "#374151",
                        fontSize: 14, lineHeight: 1.4,
                      }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </div>

      {/* FAQ / Trust section */}
      <div style={{
        background: "#fff", borderTop: "1px solid #E5E7EB",
        padding: "64px 24px",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: DARK, marginBottom: 40, letterSpacing: "-0.02em" }}>
            Perguntas frequentes
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, textAlign: "left" }}>
            {[
              {
                q: "Posso cancelar a qualquer momento?",
                a: "Sim. Você pode cancelar sua assinatura a qualquer momento pelo portal de faturamento. O acesso continua até o fim do período pago.",
              },
              {
                q: "Como funciona o plano gratuito?",
                a: "O plano gratuito permite até 10 pacientes e 5 consultas por mês, com geração SOAP básica. Ideal para experimentar a plataforma.",
              },
              {
                q: "Os dados dos pacientes são seguros?",
                a: "Sim. A NEXORA é compatível com a LGPD. Os dados são criptografados em trânsito e em repouso. Áudios são deletados automaticamente após a transcrição.",
              },
              {
                q: "Como testar o pagamento?",
                a: "Use o cartão de teste 4242 4242 4242 4242 com qualquer data futura e CVV. O ambiente de sandbox do Stripe é seguro e não cobra valores reais.",
              },
            ].map((item, i) => (
              <div key={i} style={{ borderBottom: "1px solid #F3F4F6", paddingBottom: 20 }}>
                <p style={{ fontWeight: 600, color: DARK, marginBottom: 8, fontSize: 15 }}>{item.q}</p>
                <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid #E5E7EB", padding: "24px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 12,
      }}>
        <span style={{ color: "#9CA3AF", fontSize: 13 }}>© 2025 NEXORA. Todos os direitos reservados.</span>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "Privacidade", href: "/privacidade" },
            { label: "Termos", href: "/termos" },
            { label: "Contato", href: "/contato" },
          ].map((link) => (
            <a key={link.href} href={link.href} style={{ color: "#9CA3AF", fontSize: 13, textDecoration: "none" }}>
              {link.label}
            </a>
          ))}
        </div>
      </footer>

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
