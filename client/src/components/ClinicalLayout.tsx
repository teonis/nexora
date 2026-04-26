import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Activity,
  Bot,
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
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback } from "./ui/avatar";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/patients", label: "Pacientes", icon: Users },
  { href: "/consultation/new", label: "Nova Consulta", icon: Stethoscope },
  { href: "/clari", label: "Clari", icon: Bot, isAI: true },
  { href: "/documents", label: "Documentos", icon: FileText },
];

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

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-sidebar-foreground leading-none tracking-tight">NEXORA</p>
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
