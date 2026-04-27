import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import ClinicalLayout from "@/components/ClinicalLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Users,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Shield,
  UserCheck,
  Clock,
  Ban,
  RefreshCw,
} from "lucide-react";

const STATUS_CONFIG = {
  pending: { label: "Pendente", variant: "secondary" as const, icon: Clock, color: "text-amber-600" },
  approved: { label: "Aprovado", variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
  blocked: { label: "Bloqueado", variant: "destructive" as const, icon: Ban, color: "text-red-600" },
};

const ROLE_CONFIG = {
  user: { label: "Médico", icon: UserCheck, color: "text-blue-600" },
  admin: { label: "Admin", icon: Shield, color: "text-purple-600" },
  superadmin: { label: "Superadmin", icon: ShieldCheck, color: "text-orange-600" },
};

export default function AdminUsers() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  // Redirect non-superadmin
  if (user && user.role !== "superadmin") {
    navigate("/dashboard");
    return null;
  }

  const utils = trpc.useUtils();

  const { data, isLoading, refetch } = trpc.admin.listUsers.useQuery(
    { limit: PAGE_SIZE, offset: page * PAGE_SIZE, search: debouncedSearch || undefined },
    { enabled: !!user }
  );

  const approveMutation = trpc.admin.approveUser.useMutation({
    onSuccess: () => {
      toast.success("Usuário aprovado com sucesso.");
      utils.admin.listUsers.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const blockMutation = trpc.admin.blockUser.useMutation({
    onSuccess: () => {
      toast.success("Usuário bloqueado.");
      utils.admin.listUsers.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const setRoleMutation = trpc.admin.setRole.useMutation({
    onSuccess: () => {
      toast.success("Função atualizada.");
      utils.admin.listUsers.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
    clearTimeout((window as any)._searchTimeout);
    (window as any)._searchTimeout = setTimeout(() => setDebouncedSearch(value), 400);
  };

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const pendingCount = users.filter((u) => u.accountStatus === "pending").length;

  return (
    <ClinicalLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Gestão de Usuários</h1>
              <p className="text-sm text-muted-foreground">
                {total} usuário{total !== 1 ? "s" : ""} cadastrado{total !== 1 ? "s" : ""}
                {pendingCount > 0 && (
                  <span className="ml-2 text-amber-600 font-medium">
                    · {pendingCount} aguardando aprovação
                  </span>
                )}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        {/* Pending banner */}
        {pendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                {pendingCount} usuário{pendingCount !== 1 ? "s" : ""} aguardando aprovação
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Novos cadastros precisam ser aprovados antes de acessar o sistema.
              </p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Usuário</TableHead>
                <TableHead className="font-semibold">E-mail</TableHead>
                <TableHead className="font-semibold">Função</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Cadastro</TableHead>
                <TableHead className="font-semibold">Último acesso</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => {
                  const statusCfg = STATUS_CONFIG[u.accountStatus as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
                  const roleCfg = ROLE_CONFIG[u.role as keyof typeof ROLE_CONFIG] ?? ROLE_CONFIG.user;
                  const StatusIcon = statusCfg.icon;
                  const RoleIcon = roleCfg.icon;
                  const isSelf = u.id === user?.id;

                  return (
                    <TableRow key={u.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {(u.name ?? "?")[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">
                              {u.name ?? "Sem nome"}
                              {isSelf && (
                                <span className="ml-1.5 text-xs text-muted-foreground">(você)</span>
                              )}
                            </p>
                            {u.specialty && (
                              <p className="text-xs text-muted-foreground">{u.specialty}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.email ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1.5 text-sm ${roleCfg.color}`}>
                          <RoleIcon className="h-3.5 w-3.5" />
                          <span>{roleCfg.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1.5 text-sm ${statusCfg.color}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          <span>{statusCfg.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(u.lastSignedIn).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        {!isSelf && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              {u.accountStatus !== "approved" && (
                                <DropdownMenuItem
                                  onClick={() => approveMutation.mutate({ userId: u.id })}
                                  className="gap-2 text-green-600"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Aprovar acesso
                                </DropdownMenuItem>
                              )}
                              {u.accountStatus !== "blocked" && (
                                <DropdownMenuItem
                                  onClick={() => blockMutation.mutate({ userId: u.id })}
                                  className="gap-2 text-red-600"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Bloquear acesso
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <p className="px-2 py-1 text-xs text-muted-foreground font-medium">Alterar função</p>
                              {u.role !== "user" && (
                                <DropdownMenuItem
                                  onClick={() => setRoleMutation.mutate({ userId: u.id, role: "user" })}
                                  className="gap-2"
                                >
                                  <UserCheck className="h-4 w-4 text-blue-600" />
                                  Definir como Médico
                                </DropdownMenuItem>
                              )}
                              {u.role !== "admin" && (
                                <DropdownMenuItem
                                  onClick={() => setRoleMutation.mutate({ userId: u.id, role: "admin" })}
                                  className="gap-2"
                                >
                                  <Shield className="h-4 w-4 text-purple-600" />
                                  Definir como Admin
                                </DropdownMenuItem>
                              )}
                              {u.role !== "superadmin" && (
                                <DropdownMenuItem
                                  onClick={() => setRoleMutation.mutate({ userId: u.id, role: "superadmin" })}
                                  className="gap-2"
                                >
                                  <ShieldCheck className="h-4 w-4 text-orange-600" />
                                  Definir como Superadmin
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Mostrando {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} de {total}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </ClinicalLayout>
  );
}
