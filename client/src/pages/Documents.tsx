import ClinicalLayout from "@/components/ClinicalLayout";
import { trpc } from "@/lib/trpc";
import { FileText, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const typeLabels: Record<string, string> = {
  evolution: "Evolução",
  prescription: "Prescrição",
  exam_request: "Pedido de Exame",
  medical_certificate: "Atestado",
};

const typeColors: Record<string, string> = {
  evolution: "bg-blue-50 text-blue-700 border-blue-200",
  prescription: "bg-green-50 text-green-700 border-green-200",
  exam_request: "bg-amber-50 text-amber-700 border-amber-200",
  medical_certificate: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function Documents() {
  const [search, setSearch] = useState("");
  const { data: patients, isLoading: patientsLoading } = trpc.patients.list.useQuery({});

  // Collect all documents from all patients
  const allPatientIds = patients?.map((p) => p.id) ?? [];

  return (
    <ClinicalLayout
      title="Documentos Clínicos"
      subtitle="Todos os documentos gerados durante as consultas"
    >
      <div className="max-w-4xl space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {patientsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : !patients?.length ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum documento encontrado</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Documentos são gerados durante as consultas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {patients.map((patient) => (
              <PatientDocuments key={patient.id} patientId={patient.id} patientName={patient.fullName} search={search} />
            ))}
          </div>
        )}
      </div>
    </ClinicalLayout>
  );
}

function PatientDocuments({ patientId, patientName, search }: { patientId: number; patientName: string; search: string }) {
  const { data: documents } = trpc.documents.byPatient.useQuery({ patientId });

  const exportPdfMutation = trpc.documents.exportPdf.useMutation({
    onSuccess: (data) => {
      const byteChars = atob(data.base64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: (err) => toast.error("Erro ao gerar PDF: " + err.message),
  });

  const filtered = documents?.filter(
    (d) =>
      !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      patientName.toLowerCase().includes(search.toLowerCase())
  );

  if (!filtered?.length) return null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-muted/30">
        <p className="text-xs font-semibold text-foreground">{patientName}</p>
      </div>
      <div className="divide-y divide-border">
        {filtered.map((doc) => (
          <div key={doc.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${typeColors[doc.type] ?? "bg-muted text-muted-foreground border-border"}`}>
                {typeLabels[doc.type] ?? doc.type}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border max-h-32 overflow-y-auto">
              <p className="text-xs text-foreground whitespace-pre-wrap">{doc.content}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {new Date(doc.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
              <div className="flex gap-2">
                <button
                  className="text-xs text-primary hover:underline"
                  onClick={() => {
                    const blob = new Blob([doc.content ?? ""], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${doc.title}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Exportar TXT
                </button>
                <button
                  className="text-xs text-primary hover:underline disabled:opacity-50"
                  disabled={exportPdfMutation.isPending}
                  onClick={() => exportPdfMutation.mutate({ documentId: doc.id })}
                >
                  {exportPdfMutation.isPending ? "Gerando PDF..." : "Exportar PDF"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
