import { useState } from "react";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useAdminStore } from "@/data/adminStore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClipboardList, Activity, Search } from "lucide-react";

export default function AdminLogsPage() {
  const { logs } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = [...logs].reverse().filter((l) =>
    !searchTerm || l.action.toLowerCase().includes(searchTerm.toLowerCase()) || l.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">Logs de Auditoria</h2>
            <p className="text-sm text-muted-foreground">{logs.length} atividade(s) registrada(s)</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar..." className="pl-9 pr-4 py-2 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring w-48" />
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-10 text-center">
              <ClipboardList className="h-14 w-14 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Nenhuma atividade encontrada.</p>
            </div>
          ) : (
            filtered.map((log) => (
              <div key={log.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{log.action}</p>
                  <p className="text-xs text-muted-foreground">{log.details}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">{format(new Date(log.date), "dd/MM/yyyy", { locale: ptBR })}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(log.date), "HH:mm", { locale: ptBR })}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
