import { ArrowLeft } from "lucide-react";

function LegalLayout({ title, lastUpdated, children }: { title: string; lastUpdated: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", color: "#111827", fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh" }}>
      {/* Nav */}
      <header style={{ borderBottom: "1px solid #F3F4F6", position: "sticky", top: 0, background: "#fff", zIndex: 50 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", color: "#111827", textDecoration: "none" }}>NEURIX</a>
          <a
            href="/"
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9CA3AF", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#374151")}
            onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
          >
            <ArrowLeft size={13} />
            Voltar
          </a>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px 96px" }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Atualizado em {lastUpdated}
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#111827", lineHeight: 1.2, margin: 0 }}>{title}</h1>
        </div>

        <div style={{ fontSize: 14, lineHeight: 1.8, color: "#374151" }}>
          {children}
        </div>
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
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 12, marginTop: 0 }}>{title}</h2>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: "0 0 12px", color: "#4B5563" }}>{children}</p>;
}

export default function Privacy() {
  return (
    <LegalLayout title="Política de Privacidade" lastUpdated="26 de abril de 2026">
      <Section title="1. Introdução">
        <P>
          A NEURIX ("nós", "nosso" ou "Plataforma") está comprometida com a proteção dos seus dados pessoais e com a
          conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). Esta Política descreve como
          coletamos, usamos, armazenamos e protegemos as informações dos usuários da plataforma.
        </P>
      </Section>

      <Section title="2. Dados coletados">
        <P>
          Coletamos apenas os dados estritamente necessários para o funcionamento da plataforma, incluindo: nome e
          e-mail para autenticação, dados clínicos inseridos pelo profissional de saúde durante o uso da plataforma,
          e metadados de uso para melhoria do serviço.
        </P>
        <P>
          <strong>Áudio das consultas:</strong> o áudio gravado durante as consultas é processado exclusivamente para
          fins de transcrição e é descartado imediatamente após o processamento, não sendo armazenado em nenhum servidor.
        </P>
      </Section>

      <Section title="3. Finalidade do tratamento">
        <P>
          Os dados são utilizados exclusivamente para: prestação dos serviços contratados, geração de documentação
          clínica com suporte de inteligência artificial, e melhoria contínua da plataforma. Não compartilhamos dados
          com terceiros para fins comerciais.
        </P>
      </Section>

      <Section title="4. Segurança dos dados">
        <P>
          Adotamos medidas técnicas e organizacionais adequadas para proteger os dados contra acesso não autorizado,
          perda ou destruição. Todos os dados são transmitidos com criptografia TLS e armazenados em ambiente seguro
          com controle de acesso por perfil.
        </P>
      </Section>

      <Section title="5. Direitos do titular">
        <P>
          Nos termos da LGPD, você tem direito a: acessar seus dados, corrigir dados incompletos ou desatualizados,
          solicitar a exclusão dos seus dados, e revogar o consentimento a qualquer momento. Para exercer esses
          direitos, entre em contato pelo nosso canal de <a href="/contato" style={{ color: "#C9A646", textDecoration: "none" }}>suporte</a>.
        </P>
      </Section>

      <Section title="6. Retenção de dados">
        <P>
          Os dados são mantidos pelo período necessário à prestação dos serviços ou conforme exigido por obrigação
          legal. Dados de pacientes são mantidos conforme as diretrizes do Conselho Federal de Medicina (CFM).
        </P>
      </Section>

      <Section title="7. Contato">
        <P>
          Para dúvidas sobre esta política ou para exercer seus direitos, acesse nossa{" "}
          <a href="/contato" style={{ color: "#C9A646", textDecoration: "none" }}>página de contato</a> ou envie um
          e-mail para <span style={{ color: "#374151" }}>privacidade@neurix.com.br</span>.
        </P>
      </Section>
    </LegalLayout>
  );
}
