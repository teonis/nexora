import { describe, it, expect, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB ──────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    onDuplicateKeyUpdate: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  }),
}));

// ─── Mock Stripe ──────────────────────────────────────────────────────────────
vi.mock("stripe", () => {
  const MockStripe = vi.fn().mockImplementation(() => ({
    customers: {
      create: vi.fn().mockResolvedValue({ id: "cus_test123" }),
    },
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: "https://checkout.stripe.com/test" }),
      },
    },
    billingPortal: {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: "https://billing.stripe.com/test" }),
      },
    },
    subscriptions: {
      retrieve: vi.fn().mockResolvedValue({
        id: "sub_test123",
        status: "active",
        cancel_at_period_end: false,
        items: { data: [{ price: { id: "price_pro_test" }, current_period_end: 1800000000 }] },
      }),
    },
    webhooks: {
      constructEvent: vi.fn().mockReturnValue({
        id: "evt_test_123",
        type: "checkout.session.completed",
        data: { object: {} },
      }),
    },
  }));
  return { default: MockStripe };
});

// ─── Mock env ─────────────────────────────────────────────────────────────────
vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_mock");
vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test_mock");

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeCtx(userId = 1): TrpcContext {
  return {
    user: {
      id: userId,
      openId: "test_open_id",
      name: "Dr. Teste",
      email: "teste@nexora.med.br",
      role: "user",
      lastSignedIn: new Date(),
      createdAt: new Date(),
      specialty: null,
      crm: null,
      loginMethod: null,
    },
    req: {} as never,
    res: {} as never,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("stripeRouter – getPlans", () => {
  it("deve retornar os planos disponíveis", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(makeCtx());
    const plans = await caller.stripe.getPlans();

    expect(Array.isArray(plans)).toBe(true);
    expect(plans.length).toBeGreaterThanOrEqual(3);

    const ids = plans.map((p) => p.id);
    expect(ids).toContain("free");
    expect(ids).toContain("pro");
    expect(ids).toContain("clinic");
  });

  it("cada plano deve ter os campos obrigatórios", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(makeCtx());
    const plans = await caller.stripe.getPlans();

    for (const plan of plans) {
      expect(plan).toHaveProperty("id");
      expect(plan).toHaveProperty("name");
      expect(plan).toHaveProperty("priceLabel");
      expect(plan).toHaveProperty("features");
      expect(Array.isArray(plan.features)).toBe(true);
    }
  });
});

describe("stripeRouter – getSubscriptionStatus", () => {
  it("deve retornar plano gratuito quando não há assinatura", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(makeCtx());
    const status = await caller.stripe.getSubscriptionStatus();

    expect(status.plan).toBe("free");
    expect(status.stripeSubscriptionId).toBeNull();
  });
});

describe("stripeRouter – createCheckoutSession", () => {
  it("deve lançar erro para plano inválido", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(makeCtx());

    await expect(
      caller.stripe.createCheckoutSession({
        planId: "free" as never,
        origin: "https://nexora.med.br",
      })
    ).rejects.toThrow();
  });
});

describe("handleStripeWebhook", () => {
  it("deve retornar received:true para eventos de teste", async () => {
    const { handleStripeWebhook } = await import("./stripeRouter");
    const result = await handleStripeWebhook(
      Buffer.from("{}"),
      "t=123,v1=abc"
    );
    expect(result.received).toBe(true);
  });
});

describe("stripeProducts", () => {
  it("deve ter pelo menos 3 planos definidos", async () => {
    const { PLANS } = await import("./stripeProducts");
    expect(PLANS.length).toBeGreaterThanOrEqual(3);
  });

  it("getPlanByPriceId deve retornar undefined para priceId desconhecido", async () => {
    const { getPlanByPriceId } = await import("./stripeProducts");
    expect(getPlanByPriceId("price_unknown_xyz")).toBeUndefined();
  });
});
