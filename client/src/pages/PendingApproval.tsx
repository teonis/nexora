import { trpc } from "@/lib/trpc";
import { Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PendingApproval() {
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: () => toast.error("Erro ao sair. Tente novamente."),
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="h-10 w-10 text-amber-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Cadastro em análise</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Seu cadastro foi recebido com sucesso e está aguardando aprovação pelo administrador da plataforma.
            Você receberá acesso assim que sua conta for aprovada.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left space-y-2">
          <p className="text-sm font-medium text-amber-800">O que acontece agora?</p>
          <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
            <li>O administrador revisará seu cadastro</li>
            <li>Após aprovação, você terá acesso completo ao NEURIX</li>
            <li>Em caso de dúvidas, entre em contato com o suporte</li>
          </ul>
        </div>

        <Button
          variant="outline"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sair da conta
        </Button>
      </div>
    </div>
  );
}
