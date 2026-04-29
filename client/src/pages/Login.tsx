import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { toast } from "sonner";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Acesso negado. Você cancelou o login com Google.",
  csrf: "Sessão de login expirada ou inválida. Tente novamente.",
  no_user_id: "Não foi possível identificar sua conta Google.",
  callback_failed: "Erro ao processar o login com Google. Tente novamente.",
};
import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SPECIALTIES = [
  "Clínica Geral",
  "Medicina de Família",
  "Cardiologia",
  "Dermatologia",
  "Endocrinologia",
  "Ginecologia",
  "Neurologia",
  "Nutrologia",
  "Ortopedia",
  "Pediatria",
  "Psiquiatria",
  "Outra",
];

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo de 8 caracteres"),
  confirmPassword: z.string(),
  specialty: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

function GoogleButton() {
  return (
    <a
      href="/api/auth/google"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        width: "100%",
        padding: "10px 16px",
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        background: "#fff",
        color: "#374151",
        fontSize: 14,
        fontWeight: 500,
        textDecoration: "none",
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#F9FAFB";
        e.currentTarget.style.borderColor = "#D1D5DB";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#fff";
        e.currentTarget.style.borderColor = "#E5E7EB";
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
      </svg>
      Continuar com Google
    </a>
  );
}

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
      <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
      <span style={{ fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap" }}>ou</span>
      <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
    </div>
  );
}

function LoginForm() {
  const [, navigate] = useLocation();
  const loginMutation = trpc.auth.login.useMutation();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await loginMutation.mutateAsync(data);
      if (result.accountStatus === "pending") {
        navigate("/conta/pendente");
      } else if (result.accountStatus === "blocked") {
        navigate("/conta/bloqueada");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err?.message || "Erro ao fazer login. Verifique suas credenciais.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="seu@email.com"
          {...register("email")}
          style={{ marginTop: 6 }}
        />
        {errors.email && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="login-password">Senha</Label>
        <Input
          id="login-password"
          type="password"
          placeholder="••••••••"
          {...register("password")}
          style={{ marginTop: 6 }}
        />
        {errors.password && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>}
      </div>

      <Button type="submit" disabled={loginMutation.isPending} style={{ marginTop: 4 }}>
        {loginMutation.isPending ? "Entrando..." : "Entrar"}
      </Button>

      <Divider />
      <GoogleButton />
    </form>
  );
}

function RegisterForm() {
  const [, navigate] = useLocation();
  const [specialty, setSpecialty] = useState("");
  const registerMutation = trpc.auth.register.useMutation();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
        specialty: specialty || undefined,
      });
      navigate("/conta/pendente");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao criar conta. Tente novamente.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <Label htmlFor="reg-name">Nome completo</Label>
        <Input
          id="reg-name"
          type="text"
          placeholder="Dr. João Silva"
          {...register("name")}
          style={{ marginTop: 6 }}
        />
        {errors.name && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="seu@email.com"
          {...register("email")}
          style={{ marginTop: 6 }}
        />
        {errors.email && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="reg-specialty">Especialidade médica</Label>
        <Select value={specialty} onValueChange={setSpecialty}>
          <SelectTrigger id="reg-specialty" style={{ marginTop: 6 }}>
            <SelectValue placeholder="Selecione sua especialidade" />
          </SelectTrigger>
          <SelectContent>
            {SPECIALTIES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="reg-password">Senha</Label>
        <Input
          id="reg-password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          {...register("password")}
          style={{ marginTop: 6 }}
        />
        {errors.password && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>}
      </div>

      <div>
        <Label htmlFor="reg-confirm">Confirmar senha</Label>
        <Input
          id="reg-confirm"
          type="password"
          placeholder="Repita a senha"
          {...register("confirmPassword")}
          style={{ marginTop: 6 }}
        />
        {errors.confirmPassword && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" disabled={registerMutation.isPending} style={{ marginTop: 4 }}>
        {registerMutation.isPending ? "Criando conta..." : "Criar conta"}
      </Button>

      <Divider />
      <GoogleButton />

      <p style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center", lineHeight: 1.5 }}>
        Após o cadastro, sua conta passará por aprovação do administrador antes de ser ativada.
      </p>
    </form>
  );
}

export default function Login() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) {
      const msg = OAUTH_ERROR_MESSAGES[err] ?? "Erro no login. Tente novamente.";
      toast.error(msg);
      // Clean the URL without reload
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F9FAFB",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px 16px",
    }}>
      {/* Logo */}
      <a href="/" style={{ marginBottom: 32, textDecoration: "none" }}>
        <img
          src="/manus-storage/neurix-logo_7cad8203.png"
          alt="NEURIX"
          style={{ height: 40, objectFit: "contain" }}
        />
      </a>

      {/* Card */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: "32px 28px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <Tabs defaultValue="login">
          <TabsList style={{ width: "100%", marginBottom: 24 }}>
            <TabsTrigger value="login" style={{ flex: 1 }}>Entrar</TabsTrigger>
            <TabsTrigger value="register" style={{ flex: 1 }}>Criar conta</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <h1 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 20 }}>
              Acesse sua conta
            </h1>
            <LoginForm />
          </TabsContent>

          <TabsContent value="register">
            <h1 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 20 }}>
              Crie sua conta
            </h1>
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: "#9CA3AF" }}>
        © {new Date().getFullYear()} NEURIX. Todos os direitos reservados.
      </p>
    </div>
  );
}
