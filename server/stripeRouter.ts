import { z } from "zod";
import Stripe from "stripe";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { subscriptions } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { PLANS, getPlanByPriceId, type PlanId } from "./stripeProducts";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? "";
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getOrCreateCustomer(
  userId: number,
  email: string,
  name: string
): Promise<string> {
  if (!stripe) throw new Error("Stripe não configurado");

  const db = await getDb();
  if (!db) throw new Error("Banco de dados não disponível");

  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (existing[0]?.stripeCustomerId) {
    return existing[0].stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { userId: String(userId) },
  });

  await db
    .insert(subscriptions)
    .values({
      userId,
      stripeCustomerId: customer.id,
      plan: "free",
      status: "inactive",
    })
    .onDuplicateKeyUpdate({
      set: { stripeCustomerId: customer.id },
    });

  return customer.id;
}

async function upsertSubscription(params: {
  userId: number;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: "active" | "inactive" | "cancelled" | "past_due" | "trialing";
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}) {
  const db = await getDb();
  if (!db) return;

  const plan = getPlanByPriceId(params.stripePriceId);
  const planId: PlanId = plan?.id ?? "free";

  await db
    .insert(subscriptions)
    .values({
      userId: params.userId,
      stripeCustomerId: params.stripeCustomerId,
      stripeSubscriptionId: params.stripeSubscriptionId,
      stripePriceId: params.stripePriceId,
      plan: planId,
      status: params.status,
      currentPeriodEnd: params.currentPeriodEnd ?? undefined,
      cancelAtPeriodEnd: params.cancelAtPeriodEnd,
    })
    .onDuplicateKeyUpdate({
      set: {
        stripeCustomerId: params.stripeCustomerId,
        stripeSubscriptionId: params.stripeSubscriptionId,
        stripePriceId: params.stripePriceId,
        plan: planId,
        status: params.status,
        currentPeriodEnd: params.currentPeriodEnd ?? undefined,
        cancelAtPeriodEnd: params.cancelAtPeriodEnd,
      },
    });
}

function getPeriodEnd(sub: Stripe.Subscription): Date | null {
  // In Stripe v22, current_period_end is on the SubscriptionItem
  const item = sub.items?.data?.[0];
  if (item && "current_period_end" in item) {
    const ts = (item as unknown as Record<string, unknown>)["current_period_end"];
    if (typeof ts === "number") return new Date(ts * 1000);
  }
  return null;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const stripeRouter = router({
  /**
   * Lista todos os planos disponíveis (público)
   */
  getPlans: publicProcedure.query(() => {
    return PLANS.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      priceLabel: p.priceLabel,
      interval: p.interval,
      features: p.features,
      highlighted: p.highlighted ?? false,
      hasStripePrice: !!p.stripePriceId,
    }));
  }),

  /**
   * Retorna o status de assinatura do usuário autenticado
   */
  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return {
        plan: "free" as PlanId,
        status: "inactive",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      };
    }

    const result = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, ctx.user.id))
      .limit(1);

    const sub = result[0];

    if (!sub) {
      return {
        plan: "free" as PlanId,
        status: "inactive",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      };
    }

    return {
      plan: sub.plan as PlanId,
      status: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      stripeCustomerId: sub.stripeCustomerId,
      stripeSubscriptionId: sub.stripeSubscriptionId,
    };
  }),

  /**
   * Cria uma sessão de checkout Stripe para o plano solicitado
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        planId: z.enum(["pro", "clinic"]),
        origin: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!stripe) {
        throw new Error("Stripe não está configurado. Verifique as chaves de API em Configurações → Pagamento.");
      }

      const plan = PLANS.find((p) => p.id === input.planId);
      if (!plan || !plan.stripePriceId) {
        throw new Error(
          "Price ID do Stripe não configurado para este plano. Configure STRIPE_PRICE_PRO ou STRIPE_PRICE_CLINIC nas variáveis de ambiente."
        );
      }

      const customerId = await getOrCreateCustomer(
        ctx.user.id,
        ctx.user.email ?? "",
        ctx.user.name ?? "Médico"
      );

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: plan.stripePriceId, quantity: 1 }],
        allow_promotion_codes: true,
        success_url: `${input.origin}/planos?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${input.origin}/planos?cancelled=true`,
        client_reference_id: String(ctx.user.id),
        metadata: {
          user_id: String(ctx.user.id),
          customer_email: ctx.user.email ?? "",
          customer_name: ctx.user.name ?? "",
          plan_id: input.planId,
        },
      });

      return { url: session.url };
    }),

  /**
   * Cria uma sessão do portal de faturamento Stripe (gerenciar assinatura)
   */
  createPortalSession: protectedProcedure
    .input(z.object({ origin: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      if (!stripe) {
        throw new Error("Stripe não está configurado.");
      }

      const db = await getDb();
      if (!db) throw new Error("Banco de dados não disponível");

      const result = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, ctx.user.id))
        .limit(1);

      const sub = result[0];
      if (!sub?.stripeCustomerId) {
        throw new Error("Nenhuma assinatura encontrada para este usuário.");
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: sub.stripeCustomerId,
        return_url: `${input.origin}/planos`,
      });

      return { url: session.url };
    }),
});

// ─── Webhook Handler (Express raw) ────────────────────────────────────────────

export async function handleStripeWebhook(
  rawBody: Buffer,
  signature: string
): Promise<{ received: boolean }> {
  if (!stripe) {
    console.error("[Stripe Webhook] Stripe não configurado");
    return { received: false };
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Assinatura inválida:", err);
    throw err;
  }

  // Test event passthrough
  if (event.id.startsWith("evt_test_")) {
    console.log("[Stripe Webhook] Evento de teste detectado, retornando verificação");
    return { received: true };
  }

  console.log(`[Stripe Webhook] Evento recebido: ${event.type} (${event.id})`);

  const db = await getDb();
  if (!db) {
    console.error("[Stripe Webhook] Banco de dados não disponível");
    return { received: false };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = parseInt(session.metadata?.user_id ?? "0", 10);
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (userId && subscriptionId) {
        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = stripeSub.items.data[0]?.price.id ?? "";
        const periodEnd = getPeriodEnd(stripeSub);

        await upsertSubscription({
          userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          status: "active",
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const stripeSub = event.data.object as Stripe.Subscription;
      const customerId = stripeSub.customer as string;

      const existing = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeCustomerId, customerId))
        .limit(1);

      if (existing[0]) {
        const priceId = stripeSub.items.data[0]?.price.id ?? "";
        const periodEnd = getPeriodEnd(stripeSub);

        const statusMap: Record<string, "active" | "inactive" | "cancelled" | "past_due" | "trialing"> = {
          active: "active",
          trialing: "trialing",
          past_due: "past_due",
          canceled: "cancelled",
          incomplete: "inactive",
          incomplete_expired: "inactive",
          unpaid: "past_due",
          paused: "inactive",
        };

        await upsertSubscription({
          userId: existing[0].userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: stripeSub.id,
          stripePriceId: priceId,
          status: statusMap[stripeSub.status] ?? "inactive",
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const stripeSub = event.data.object as Stripe.Subscription;
      const customerId = stripeSub.customer as string;

      const existing = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeCustomerId, customerId))
        .limit(1);

      if (existing[0]) {
        await db
          .update(subscriptions)
          .set({ status: "cancelled", plan: "free" })
          .where(eq(subscriptions.userId, existing[0].userId));
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const existing = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeCustomerId, customerId))
        .limit(1);

      if (existing[0]) {
        await db
          .update(subscriptions)
          .set({ status: "past_due" })
          .where(eq(subscriptions.userId, existing[0].userId));
      }
      break;
    }

    default:
      console.log(`[Stripe Webhook] Evento não tratado: ${event.type}`);
  }

  return { received: true };
}
