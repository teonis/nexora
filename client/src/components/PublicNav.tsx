import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";

export default function PublicNav() {
  const [location, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const isActive = (path: string) => location === path || location.startsWith(path);

  return (
    <>
      <style>{`
        .pub-nav-links { display: flex; align-items: center; gap: 28px; }
        @media (max-width: 600px) {
          .pub-nav-links { gap: 14px; }
          .pub-nav-hide-mobile { display: none !important; }
        }
      `}</style>
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(17,24,39,0.06)",
      }}>
        <div style={{
          maxWidth: 1080, margin: "0 auto", padding: "0 20px",
          height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Logo */}
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <img
              src="/manus-storage/neurix-logo_7cad8203.png"
              alt="NEURIX"
              style={{ height: 28, objectFit: "contain" }}
            />
          </a>

          {/* Nav links */}
          <nav className="pub-nav-links">
            <a
              href="/funcionalidades"
              style={{
                fontSize: 13,
                color: isActive("/funcionalidades") ? "#111827" : "#9CA3AF",
                fontWeight: isActive("/funcionalidades") ? 600 : 400,
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#374151")}
              onMouseLeave={e => (e.currentTarget.style.color = isActive("/funcionalidades") ? "#111827" : "#9CA3AF")}
            >
              Funcionalidades
            </a>
            <a
              href="/planos"
              style={{
                fontSize: 13,
                color: isActive("/planos") ? "#111827" : "#9CA3AF",
                fontWeight: isActive("/planos") ? 600 : 400,
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#374151")}
              onMouseLeave={e => (e.currentTarget.style.color = isActive("/planos") ? "#111827" : "#9CA3AF")}
            >
              Planos
            </a>
            {isAuthenticated ? (
              <button
                onClick={() => navigate("/dashboard")}
                style={{
                  fontSize: 13, fontWeight: 500, color: "#374151",
                  background: "transparent", border: "none",
                  padding: "7px 0", cursor: "pointer",
                  fontFamily: "inherit", textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#111827")}
                onMouseLeave={e => (e.currentTarget.style.color = "#374151")}
              >
                Dashboard →
              </button>
            ) : (
              <a
                href={getLoginUrl()}
                style={{
                  fontSize: 13, fontWeight: 500, color: "#374151",
                  background: "transparent", border: "none",
                  padding: "7px 0", textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#111827")}
                onMouseLeave={e => (e.currentTarget.style.color = "#374151")}
              >
                Entrar →
              </a>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
