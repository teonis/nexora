import { ArrowLeft, CheckCircle2, Mail, MessageSquare, Send } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc";

const STORAGE_KEY = "neurix_contact_form";

// ─── Validation helpers ────────────────────────────────────────────────────────
const validators = {
  name: (v: string) => {
    if (!v.trim()) return "Nome é obrigatório.";
    if (v.trim().length < 3) return "Nome deve ter pelo menos 3 caracteres.";
    if (v.trim().length > 80) return "Nome deve ter no máximo 80 caracteres.";
    return "";
  },
  email: (v: string) => {
    if (!v.trim()) return "E-mail é obrigatório.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return "Informe um e-mail válido.";
    return "";
  },
  subject: (v: string) => {
    if (!v) return "Selecione um assunto.";
    return "";
  },
  message: (v: string) => {
    if (!v.trim()) return "Mensagem é obrigatória.";
    if (v.trim().length < 10) return "Mensagem deve ter pelo menos 10 caracteres.";
    if (v.trim().length > 2000) return "Mensagem deve ter no máximo 2000 caracteres.";
    return "";
  },
};

type Field = keyof typeof validators;
type FormData = { name: string; email: string; subject: string; message: string };

const emptyForm: FormData = { name: "", email: "", subject: "", message: "" };
const emptyTouched: Record<Field, boolean> = { name: false, email: false, subject: false, message: false };

// ─── Component ─────────────────────────────────────────────────────────────────
export default function Contact() {
  // Restore from localStorage on mount
  const [form, setForm] = useState<FormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<FormData>;
        return {
          name: parsed.name ?? "",
          email: parsed.email ?? "",
          subject: parsed.subject ?? "",
          message: parsed.message ?? "",
        };
      }
    } catch { /* ignore */ }
    return { ...emptyForm };
  });

  const [touched, setTouched] = useState<Record<Field, boolean>>({ ...emptyTouched });
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");
  const [savedIndicator, setSavedIndicator] = useState(false);

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      // Brief "salvo" indicator
      setSavedIndicator(true);
      const t = setTimeout(() => setSavedIndicator(false), 1200);
      return () => clearTimeout(t);
    } catch { /* ignore */ }
  }, [form]);

  const sendContact = trpc.contact.send.useMutation({
    onSuccess: () => {
      setSent(true);
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    },
    onError: (err) => setServerError(err.message || "Erro ao enviar. Tente novamente."),
  });

  // Compute per-field errors
  const errors: Record<Field, string> = {
    name: validators.name(form.name),
    email: validators.email(form.email),
    subject: validators.subject(form.subject),
    message: validators.message(form.message),
  };

  const isFormValid = Object.values(errors).every(e => e === "");

  const handleChange = useCallback((field: Field, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setTouched(t => ({ ...t, [field]: true }));
  }, []);

  const handleBlur = useCallback((field: Field) => {
    setTouched(t => ({ ...t, [field]: true }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, subject: true, message: true });
    if (!isFormValid) return;
    setServerError("");
    sendContact.mutate(form);
  };

  const handleReset = () => {
    setSent(false);
    setForm({ ...emptyForm });
    setTouched({ ...emptyTouched });
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  // ─── Styles ─────────────────────────────────────────────────────────────────
  const getInputStyle = (field: Field): React.CSSProperties => {
    const hasError = touched[field] && errors[field];
    const isValid = touched[field] && !errors[field] && form[field];
    return {
      width: "100%", padding: "10px 14px", fontSize: 13, color: "#111827",
      background: hasError ? "#FFF8F8" : isValid ? "#F0FDF4" : "#FAFAFA",
      border: `1px solid ${hasError ? "#FCA5A5" : isValid ? "#86EFAC" : "#E5E7EB"}`,
      borderRadius: 8, outline: "none", fontFamily: "Inter, system-ui, sans-serif",
      transition: "border-color 0.15s, background 0.15s", boxSizing: "border-box",
    };
  };

  const errorIcon = (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );

  const charCount = form.message.length;
  const charLimit = 2000;

  return (
    <div style={{ background: "#fff", color: "#111827", fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh" }}>
      {/* Nav */}
      <header style={{ borderBottom: "1px solid #F3F4F6", position: "sticky", top: 0, background: "#fff", zIndex: 50 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", color: "#111827", textDecoration: "none" }}>NEURIX</a>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9CA3AF", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#374151")}
            onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}>
            <ArrowLeft size={13} />
            Voltar
          </a>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px 96px" }}>
        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 11, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Suporte</p>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#111827", lineHeight: 1.2, margin: "0 0 16px" }}>Fale conosco</h1>
          <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7, margin: 0, maxWidth: 480 }}>
            Tem alguma dúvida, sugestão ou precisa de suporte? Preencha o formulário abaixo e responderemos em até 24 horas.
          </p>
        </div>

        {/* Contact info strip */}
        <div style={{ display: "flex", gap: 32, marginBottom: 48, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#F9FAFB", border: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Mail size={15} color="#9CA3AF" />
            </div>
            <div>
              <p style={{ fontSize: 10, color: "#9CA3AF", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.08em" }}>E-mail</p>
              <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>contato@neurix.com.br</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#F9FAFB", border: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MessageSquare size={15} color="#9CA3AF" />
            </div>
            <div>
              <p style={{ fontSize: 10, color: "#9CA3AF", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Resposta</p>
              <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>Até 24 horas úteis</p>
            </div>
          </div>
        </div>

        {/* Form or success */}
        {sent ? (
          <div style={{ textAlign: "center", padding: "64px 24px" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#F0FDF4", border: "1px solid #BBF7D0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827", margin: "0 0 8px" }}>Mensagem enviada</h2>
            <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 32px" }}>Obrigado pelo contato. Responderemos em breve.</p>
            <button onClick={handleReset}
              style={{ fontSize: 13, color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "inherit" }}>
              Enviar outra mensagem
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Name + Email */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Name */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "flex", alignItems: "center", gap: 4 }}>
                  Nome
                  {touched.name && !errors.name && form.name && <CheckCircle2 size={11} color="#16A34A" />}
                </label>
                <input
                  type="text" placeholder="Dr. João Silva" value={form.name}
                  onChange={e => handleChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  style={getInputStyle("name")}
                  onFocus={e => { if (!touched.name || !errors.name) { e.currentTarget.style.borderColor = "#C9A646"; e.currentTarget.style.background = "#fff"; } }}
                />
                {touched.name && errors.name && (
                  <span style={{ fontSize: 11, color: "#DC2626", display: "flex", alignItems: "center", gap: 4 }}>
                    {errorIcon}{errors.name}
                  </span>
                )}
              </div>

              {/* Email */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "flex", alignItems: "center", gap: 4 }}>
                  E-mail
                  {touched.email && !errors.email && form.email && <CheckCircle2 size={11} color="#16A34A" />}
                </label>
                <input
                  type="email" placeholder="joao@clinica.com.br" value={form.email}
                  onChange={e => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  style={getInputStyle("email")}
                  onFocus={e => { if (!touched.email || !errors.email) { e.currentTarget.style.borderColor = "#C9A646"; e.currentTarget.style.background = "#fff"; } }}
                />
                {touched.email && errors.email && (
                  <span style={{ fontSize: 11, color: "#DC2626", display: "flex", alignItems: "center", gap: 4 }}>
                    {errorIcon}{errors.email}
                  </span>
                )}
              </div>
            </div>

            {/* Subject */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "flex", alignItems: "center", gap: 4 }}>
                Assunto
                {touched.subject && !errors.subject && form.subject && <CheckCircle2 size={11} color="#16A34A" />}
              </label>
              <select
                value={form.subject}
                onChange={e => handleChange("subject", e.target.value)}
                onBlur={() => handleBlur("subject")}
                style={{ ...getInputStyle("subject"), cursor: "pointer" }}
                onFocus={e => { if (!touched.subject || !errors.subject) { e.currentTarget.style.borderColor = "#C9A646"; e.currentTarget.style.background = "#fff"; } }}
              >
                <option value="">Selecione um assunto</option>
                <option value="suporte">Suporte técnico</option>
                <option value="duvida">Dúvida sobre funcionalidades</option>
                <option value="privacidade">Privacidade e dados</option>
                <option value="parceria">Parceria comercial</option>
                <option value="outro">Outro</option>
              </select>
              {touched.subject && errors.subject && (
                <span style={{ fontSize: 11, color: "#DC2626", display: "flex", alignItems: "center", gap: 4 }}>
                  {errorIcon}{errors.subject}
                </span>
              )}
            </div>

            {/* Message */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "flex", alignItems: "center", gap: 4 }}>
                Mensagem
                {touched.message && !errors.message && form.message && <CheckCircle2 size={11} color="#16A34A" />}
              </label>
              <textarea
                rows={5} placeholder="Descreva sua dúvida ou solicitação..." value={form.message}
                onChange={e => handleChange("message", e.target.value)}
                onBlur={() => handleBlur("message")}
                style={{ ...getInputStyle("message"), resize: "vertical", minHeight: 120 }}
                onFocus={e => { if (!touched.message || !errors.message) { e.currentTarget.style.borderColor = "#C9A646"; e.currentTarget.style.background = "#fff"; } }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {touched.message && errors.message ? (
                  <span style={{ fontSize: 11, color: "#DC2626", display: "flex", alignItems: "center", gap: 4 }}>
                    {errorIcon}{errors.message}
                  </span>
                ) : <span />}
                <span style={{ fontSize: 11, color: charCount > charLimit * 0.9 ? "#DC2626" : "#9CA3AF" }}>
                  {charCount}/{charLimit}
                </span>
              </div>
            </div>

            {/* Server error */}
            {serverError && (
              <div style={{ padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, fontSize: 12, color: "#DC2626", display: "flex", alignItems: "center", gap: 8 }}>
                {errorIcon}{serverError}
              </div>
            )}

            {/* Submit row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {/* Progress dots + autosave indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {(["name", "email", "subject", "message"] as Field[]).map(field => (
                    <div key={field} style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: !form[field] ? "#E5E7EB" : errors[field] ? "#FCA5A5" : "#86EFAC",
                      transition: "background 0.2s",
                    }} />
                  ))}
                </div>
                {/* Autosave badge */}
                <span style={{
                  fontSize: 10, color: savedIndicator ? "#16A34A" : "#D1D5DB",
                  transition: "color 0.3s", letterSpacing: "0.04em",
                  display: "flex", alignItems: "center", gap: 3,
                }}>
                  {savedIndicator ? (
                    <><CheckCircle2 size={10} color="#16A34A" /> Salvo</>
                  ) : (
                    "Rascunho salvo"
                  )}
                </span>
              </div>

              <button
                type="submit" disabled={sendContact.isPending}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 24px", fontSize: 13, fontWeight: 500,
                  background: sendContact.isPending ? "#E5E7EB" : !isFormValid ? "#F3F4F6" : "#111827",
                  color: sendContact.isPending ? "#9CA3AF" : !isFormValid ? "#9CA3AF" : "#fff",
                  border: "none", borderRadius: 8,
                  cursor: sendContact.isPending || !isFormValid ? "not-allowed" : "pointer",
                  fontFamily: "inherit", transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!sendContact.isPending && isFormValid) e.currentTarget.style.background = "#1F2937"; }}
                onMouseLeave={e => { if (!sendContact.isPending && isFormValid) e.currentTarget.style.background = "#111827"; }}
              >
                {sendContact.isPending ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    Enviar mensagem
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #F3F4F6" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <p style={{ fontSize: 11, color: "#D1D5DB", margin: 0 }}>© {new Date().getFullYear()} NEURIX. Todos os direitos reservados.</p>
          <div style={{ display: "flex", gap: 20 }}>
            <a href="/privacidade" style={{ fontSize: 11, color: "#D1D5DB", textDecoration: "none" }}>Privacidade</a>
            <a href="/termos" style={{ fontSize: 11, color: "#D1D5DB", textDecoration: "none" }}>Termos</a>
            <a href="/contato" style={{ fontSize: 11, color: "#D1D5DB", textDecoration: "none" }}>Contato</a>
          </div>
        </div>
      </footer>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
