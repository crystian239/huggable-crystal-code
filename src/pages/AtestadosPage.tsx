import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useClinicStore } from "@/data/clinicStore";
import { FileText, Download, Search, Calendar, User, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AtestadosPage() {
  const atestados = useClinicStore((s) => s.atestados);
  const [search, setSearch] = useState("");
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...atestados]
      .filter((a) => a.patientName.toLowerCase().includes(q) || a.reason.toLowerCase().includes(q))
      .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  }, [atestados, search]);

  const handleDownload = (fileData: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileData;
    link.download = fileName;
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Atestados
          </h1>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por paciente ou motivo..."
              className="w-full pl-9 pr-3 py-2 border border-input bg-background rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum atestado encontrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => (
              <div key={a.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-sm flex items-center gap-1">
                        <User className="h-3.5 w-3.5" /> {a.patientName}
                      </span>
                    </div>
                    <p className="text-sm text-foreground"><strong>Motivo:</strong> {a.reason}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Consulta: {a.appointmentDate} às {a.appointmentTime}
                      </span>
                      <span>Enviado em: {format(new Date(a.sentAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                    </div>
                  </div>
                  {a.fileData && a.fileName && (
                    <div className="flex gap-2 shrink-0">
                      {a.fileData.startsWith("data:image") && (
                        <Button size="sm" variant="outline" onClick={() => setPreviewFile(a.fileData!)}>
                          <Eye className="h-4 w-4 mr-1" /> Ver
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleDownload(a.fileData!, a.fileName!)}>
                        <Download className="h-4 w-4 mr-1" /> Baixar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-foreground/30 z-50 flex items-center justify-center p-4" onClick={() => setPreviewFile(null)}>
          <div className="bg-card border border-border rounded-xl max-w-2xl max-h-[80vh] overflow-auto p-4" onClick={(e) => e.stopPropagation()}>
            <img src={previewFile} alt="Atestado" className="max-w-full rounded-lg" />
            <Button variant="outline" className="mt-3 w-full" onClick={() => setPreviewFile(null)}>Fechar</Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
