import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import {
  Bot,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Menu,
  Moon,
  Stethoscope,
  Sun,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback } from "./ui/avatar";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/patients", label: "Pacientes", icon: Users },
  { href: "/consultation/new", label: "Nova Consulta", icon: Stethoscope },
  { href: "/clari", label: "Clari", icon: Bot, isAI: true },
  { href: "/documents", label: "Documentos", icon: FileText },
  { href: "/planos", label: "Planos", icon: CreditCard },
];

const PLAN_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  free: { label: "Gratuito", color: "#6B7280", bg: "#F3F4F6" },
  pro: { label: "Pro", color: "#C9A646", bg: "#C9A64615" },
  clinic: { label: "Clínica", color: "#7C3AED", bg: "#7C3AED15" },
};

interface ClinicalLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function ClinicalLayout({ children, title, subtitle, actions }: ClinicalLayoutProps) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme, switchable } = useTheme();
  const [authTimeout, setAuthTimeout] = useState(false);

  const { data: subStatus } = trpc.stripe.getSubscriptionStatus.useQuery(undefined, {
    enabled: !!user && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const timer = setTimeout(() => setAuthTimeout(true), 400);
      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated]);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "M";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!loading && !isAuthenticated) {
    if (!authTimeout) return null;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-destructive/8 flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-xl font-bold text-foreground mb-2 tracking-tight">Acesso não autorizado</h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            Sua sessão expirou ou você não tem permissão para acessar esta página.
            Faça login para continuar.
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <a
              href={getLoginUrl()}
              className="inline-flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Fazer login
            </a>
            <a
              href="/"
              className="inline-flex items-center justify-center w-full h-10 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
            >
              Voltar para a página inicial
            </a>
          </div>

          {/* Footer note */}
          <p className="text-xs text-muted-foreground/60 mt-8">
            NEXORA · Plataforma Clínica com IA
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* ─── Mobile overlay ─── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border-r",
          "bg-sidebar border-sidebar-border",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-sidebar-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src="/manus-storage/2_19b7e141.png"
              alt="NEXORA"
              className="w-8 h-8 object-contain flex-shrink-0"
            />
            <div>
              <p className="text-sm font-bold text-sidebar-foreground leading-none" style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "0.1em" }}>NEXORA</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Plataforma Clínica com IA</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon, isAI }) => {
            const isActive = location === href || (href !== "/dashboard" && location.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-primary/10 text-primary sidebar-active-bar"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  isAI && !isActive ? "text-primary/60" : "",
                  isActive ? "text-primary" : ""
                )} />
                <span>{label}</span>
                {isAI && (
                  <span className={cn(
                    "ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "bg-primary/10 text-primary/70"
                  )}>IA</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Plan indicator */}
        {subStatus && (
          <div className="mx-3 mb-2">
            <Link
              href="/planos"
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
              style={{ textDecoration: "none" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: PLAN_CONFIG[subStatus.plan]?.bg ?? "#F3F4F6" }}
                >
                  <CreditCard
                    className="w-3 h-3"
                    style={{ color: PLAN_CONFIG[subStatus.plan]?.color ?? "#6B7280" }}
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground leading-none">
                    Plano{" "}
                    <span style={{ color: PLAN_CONFIG[subStatus.plan]?.color ?? "#6B7280" }}>
                      {PLAN_CONFIG[subStatus.plan]?.label ?? subStatus.plan}
                    </span>
                  </p>
                  {subStatus.status === "active" && subStatus.plan !== "free" ? (
                    <p className="text-[10px] text-muted-foreground mt-0.5">Ativo</p>
                  ) : (
                    <p className="text-[10px] text-primary mt-0.5 group-hover:underline">Fazer upgrade →</p>
                  )}
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* AI Disclaimer */}
        <div className="mx-3 mb-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
          <div className="flex items-start gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-amber-700 dark:text-amber-300/80 leading-relaxed">
              Clari é suporte clínico. A decisão médica final é sempre do profissional.
            </p>
          </div>
        </div>

        {/* User profile */}
        <div className="px-3 pb-4 border-t border-sidebar-border pt-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{user?.name ?? "Médico"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email ?? ""}</p>
            </div>
            <button
              onClick={() => logout()}
              className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
              title="Sair"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main content ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 sm:px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            {title && (
              <div>
                <h1 className="text-base font-bold text-foreground truncate tracking-tight">{title}</h1>
                {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {switchable && toggleTheme && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
                title={theme === "dark" ? "Modo claro" : "Modo escuro"}
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
