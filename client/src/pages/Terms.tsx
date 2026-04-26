import { ArrowLeft } from "lucide-react";

function LegalLayout({ title, lastUpdated, children }: { title: string; lastUpdated: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", color: "#111827", fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh" }}>
      <header style={{ borderBottom: "1px solid #F3F4F6", position: "sticky", top: 0, background: "#fff", zIndex: 50 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", color: "#111827", textDecoration: "none" }}>NEXORA</a>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9CA3AF", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#374151")}
            onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}>
            <ArrowLeft size={13} />
            Voltar
          </a>
        </div>
      </header>
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px 96px" }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Atualizado em {lastUpdated}</p>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#111827", lineHeight: 1.2, margin: 0 }}>{title}</h1>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.8, color: "#374151" }}>{children}</div>
      </main>
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

export default function Terms() {
  return (
    <LegalLayout title="Termos de Uso" lastUpdated="26 de abril de 2026">
      <Section title="1. Aceitação dos termos">
        <P>
          Ao acessar ou utilizar a plataforma NEXORA, você concorda com estes Termos de Uso. Se não concordar com
          qualquer parte destes termos, não utilize a plataforma.
        </P>
      </Section>

      <Section title="2. Descrição do serviço">
        <P>
          A NEXORA é uma plataforma de suporte à documentação clínica com inteligência artificial, destinada
          exclusivamente a profissionais de saúde habilitados. A plataforma oferece recursos de transcrição de
          consultas, geração de notas clínicas estruturadas (formato SOAP) e assistência clínica por meio da Clari.
        </P>
      </Section>

      <Section title="3. Uso responsável e limitações da IA">
        <P>
          <strong>A Clari e todos os recursos de IA da NEXORA são ferramentas de suporte clínico.</strong> Eles não
          substituem o julgamento clínico do profissional de saúde, nem devem ser utilizados como única base para
          diagnóstico, prescrição ou conduta médica. A responsabilidade pela decisão clínica é sempre e exclusivamente
          do profissional habilitado.
        </P>
        <P>
          O usuário se compromete a revisar toda documentação gerada pela IA antes de utilizá-la em prontuários ou
          prescrições, e a não utilizar a plataforma para fins que violem o Código de Ética Médica ou a legislação
          vigente.
        </P>
      </Section>

      <Section title="4. Conta e acesso">
        <P>
          O acesso à plataforma é pessoal e intransferível. O usuário é responsável por manter a confidencialidade
          de suas credenciais e por todas as atividades realizadas em sua conta. Notifique-nos imediatamente em caso
          de uso não autorizado.
        </P>
      </Section>

      <Section title="5. Dados clínicos">
        <P>
          O usuário é o controlador dos dados clínicos inseridos na plataforma e é responsável por garantir que o
          tratamento desses dados esteja em conformidade com a LGPD, o CFM e demais normas aplicáveis. A NEXORA
          atua como operadora dos dados, conforme definido na LGPD.
        </P>
      </Section>

      <Section title="6. Propriedade intelectual">
        <P>
          Todos os elementos da plataforma — incluindo interface, código, marca e conteúdo — são propriedade da
          NEXORA e protegidos por lei. É vedada a reprodução, distribuição ou engenharia reversa sem autorização
          expressa.
        </P>
      </Section>

      <Section title="7. Modificações e rescisão">
        <P>
          Reservamo-nos o direito de modificar estes termos a qualquer momento, com notificação prévia aos usuários.
          O uso continuado da plataforma após as alterações implica aceitação dos novos termos. Podemos suspender ou
          encerrar o acesso em caso de violação destes termos.
        </P>
      </Section>

      <Section title="8. Contato">
        <P>
          Para dúvidas sobre estes termos, acesse nossa{" "}
          <a href="/contato" style={{ color: "#C9A646", textDecoration: "none" }}>página de contato</a>.
        </P>
      </Section>
    </LegalLayout>
  );
}
