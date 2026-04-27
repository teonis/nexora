/**
 * NEURIX — Planos de assinatura
 * Estes price IDs são criados no Stripe Dashboard (modo teste).
 * Em produção, substitua pelos price IDs reais via variável de ambiente.
 */

export type PlanId = "free" | "pro" | "clinic";

export interface PlanConfig {
  id: PlanId;
  name: string;
  description: string;
  price: number; // em centavos BRL
  priceLabel: string;
  interval: "month" | "year" | null;
  features: string[];
  stripePriceId: string | null; // null = plano gratuito
  highlighted?: boolean;
}

export const PLANS: PlanConfig[] = [
  {
    id: "free",
    name: "Gratuito",
    description: "Para médicos que querem experimentar a NEURIX",
    price: 0,
    priceLabel: "R$ 0",
    interval: null,
    stripePriceId: null,
    features: [
      "Até 10 pacientes",
      "5 consultas por mês",
      "Geração SOAP básica",
      "1 documento por consulta",
      "Suporte por e-mail",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Para médicos em consultório particular",
    price: 19700, // R$ 197,00
    priceLabel: "R$ 197",
    interval: "month",
    stripePriceId: process.env.STRIPE_PRICE_PRO ?? null,
    highlighted: true,
    features: [
      "Pacientes ilimitados",
      "Consultas ilimitadas",
      "Transcrição de áudio com Whisper",
      "Geração SOAP completa com IA",
      "Documentos ilimitados (prescrição, atestado, pedidos)",
      "Clari IA — assistente clínica",
      "Upload e análise de exames",
      "Exportação PDF",
      "Suporte prioritário",
    ],
  },
  {
    id: "clinic",
    name: "Clínica",
    description: "Para clínicas e grupos médicos",
    price: 49700, // R$ 497,00
    priceLabel: "R$ 497",
    interval: "month",
    stripePriceId: process.env.STRIPE_PRICE_CLINIC ?? null,
    features: [
      "Tudo do plano Pro",
      "Até 10 médicos na equipe",
      "Dashboard administrativo",
      "Relatórios e analytics avançados",
      "Exportação de dados (CSV)",
      "Integração com prontuário eletrônico",
      "SLA de suporte 4h",
      "Onboarding dedicado",
    ],
  },
];

export function getPlanById(id: PlanId): PlanConfig | undefined {
  return PLANS.find((p) => p.id === id);
}

export function getPlanByPriceId(priceId: string): PlanConfig | undefined {
  return PLANS.find((p) => p.stripePriceId === priceId);
}
