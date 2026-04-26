import { ArrowLeft, Mail, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const sendContact = trpc.contact.send.useMutation({
    onSuccess: () => setSent(true),
    onError: (err) => setError(err.message || "Erro ao enviar. Tente novamente."),
  });

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", fontSize: 13, color: "#111827",
    background: "#FAFAFA", border: "1px solid #E5E7EB", borderRadius: 8,
    outline: "none", fontFamily: "Inter, system-ui, sans-serif",
    transition: "border-color 0.15s, background 0.15s", boxSizing: "border-box",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    sendContact.mutate(form);
  };

  return (
    <div style={{ background: "#fff", color: "#111827", fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh" }}>
      {/* Nav */}
      <header style={{ borderBottom: "1px solid #F3F4F6", position: "sticky", top: 0, background: "#fff", zIndex: 50 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", color: "#111827", textDecoration: "none" }}>NEXORA</a>
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
              <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>contato@nexora.com.br</p>
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
            <button
              onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
              style={{ fontSize: 13, color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "inherit" }}
            >
              Enviar outra mensagem
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Name + Email */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>Nome</label>
                <input
                  type="text" required placeholder="Dr. João Silva" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = "#C9A646"; e.currentTarget.style.background = "#fff"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#FAFAFA"; }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>E-mail</label>
                <input
                  type="email" required placeholder="joao@clinica.com.br" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = "#C9A646"; e.currentTarget.style.background = "#fff"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#FAFAFA"; }}
                />
              </div>
            </div>

            {/* Subject */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>Assunto</label>
              <select
                required value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={e => { e.currentTarget.style.borderColor = "#C9A646"; e.currentTarget.style.background = "#fff"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#FAFAFA"; }}
              >
                <option value="">Selecione um assunto</option>
                <option value="suporte">Suporte técnico</option>
                <option value="duvida">Dúvida sobre funcionalidades</option>
                <option value="privacidade">Privacidade e dados</option>
                <option value="parceria">Parceria comercial</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            {/* Message */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>Mensagem</label>
              <textarea
                required rows={5} placeholder="Descreva sua dúvida ou solicitação..." value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
                onFocus={e => { e.currentTarget.style.borderColor = "#C9A646"; e.currentTarget.style.background = "#fff"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#FAFAFA"; }}
              />
            </div>

            {/* Error message */}
            {error && (
              <div style={{ padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, fontSize: 12, color: "#DC2626" }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit" disabled={sendContact.isPending}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 24px", fontSize: 13, fontWeight: 500,
                  background: sendContact.isPending ? "#E5E7EB" : "#111827", color: sendContact.isPending ? "#9CA3AF" : "#fff",
                  border: "none", borderRadius: 8, cursor: sendContact.isPending ? "not-allowed" : "pointer",
                  fontFamily: "inherit", transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!sendContact.isPending) e.currentTarget.style.background = "#1F2937"; }}
                onMouseLeave={e => { if (!sendContact.isPending) e.currentTarget.style.background = "#111827"; }}
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
          <p style={{ fontSize: 11, color: "#D1D5DB", margin: 0 }}>© {new Date().getFullYear()} NEXORA. Todos os direitos reservados.</p>
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
