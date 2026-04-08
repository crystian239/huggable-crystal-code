import { useState } from "react";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useAdminStore } from "@/data/adminStore";
import { useAuthStore } from "@/data/authStore";
import { useTeleconsultaStore } from "@/data/teleconsultaStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UserPlus, UserCheck, UserX, Search, Check, X } from "lucide-react";

export default function AdminCadastrosPage() {
  const { user } = useAuthStore();
  const { pendingRegistrations, approveRegistration, rejectRegistration, addLog } = useAdminStore();
  const teleconsultaStore = useTeleconsultaStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const filtered = pendingRegistrations.filter((r) => {
    const matchesSearch = !searchTerm || r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.cpf.includes(searchTerm);
    const matchesFilter = !filterStatus || r.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleApprove = (regId: string, name: string) => {
    approveRegistration(regId, "Aprovado pelo administrador");
    addLog({ action: "Cadastro aprovado", details: name, performedBy: user!.username });
    toast.success(`Cadastro de ${name} aprovado!`);
  };

  const handleReject = () => {
    if (!rejectModal) return;
    const reg = pendingRegistrations.find((r) => r.id === rejectModal);
    rejectRegistration(rejectModal, rejectNote || "Cadastro rejeitado");
    addLog({ action: "Cadastro rejeitado", details: `${reg?.name} - ${rejectNote || "Sem motivo"}`, performedBy: user!.username });
    toast.success("Cadastro rejeitado.");
    setRejectModal(null);
    setRejectNote("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">Cadastros Pendentes</h2>
            <p className="text-sm text-muted-foreground">{pendingRegistrations.filter((r) => r.status === "pendente").length} pendente(s)</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar..." className="pl-9 pr-4 py-2 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring w-48" />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {["", "pendente", "aprovado", "rejeitado"].map((f) => (
            <button key={f} onClick={() => setFilterStatus(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterStatus === f ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:text-foreground"}`}>
              {f ? f.charAt(0).toUpperCase() + f.slice(1) : "Todos"}
            </button>
          ))}
        </div>

        {teleconsultaStore.patientAccounts.length > 0 && pendingRegistrations.length === 0 && (
          <div className="bg-accent/50 rounded-2xl p-4 text-center">
            <p className="text-sm text-muted-foreground">{teleconsultaStore.patientAccounts.length} conta(s) de paciente ativa(s) no portal.</p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-10 text-center">
              <UserPlus className="h-14 w-14 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Nenhum cadastro encontrado.</p>
            </div>
          ) : (
            filtered.map((reg) => (
              <div key={reg.id} className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${
                    reg.status === "pendente" ? "bg-[hsl(40,90%,50%)]/10" :
                    reg.status === "aprovado" ? "bg-[hsl(142,70%,45%)]/10" : "bg-destructive/10"
                  }`}>
                    {reg.status === "pendente" ? <UserPlus className="h-6 w-6 text-[hsl(40,90%,50%)]" /> :
                     reg.status === "aprovado" ? <UserCheck className="h-6 w-6 text-[hsl(142,70%,45%)]" /> :
                     <UserX className="h-6 w-6 text-destructive" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{reg.name}</p>
                    <p className="text-sm text-muted-foreground">CPF: {reg.cpf} • {reg.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Solicitado em {format(new Date(reg.requestedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    {reg.reviewNote && <p className="text-xs text-muted-foreground mt-1 italic">📝 {reg.reviewNote}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      reg.status === "pendente" ? "bg-[hsl(40,90%,50%)]/10 text-[hsl(40,90%,50%)]" :
                      reg.status === "aprovado" ? "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]" :
                      "bg-destructive/10 text-destructive"
                    }`}>{reg.status}</span>
                    {reg.status === "pendente" && (
                      <div className="flex gap-1">
                        <button onClick={() => handleApprove(reg.id, reg.name)} className="h-9 w-9 rounded-lg bg-[hsl(142,70%,45%)]/10 flex items-center justify-center text-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,45%)]/20 transition-colors" title="Aprovar">
                          <Check className="h-4 w-4" />
                        </button>
                        <button onClick={() => setRejectModal(reg.id)} className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors" title="Rejeitar">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md space-y-4 animate-fade-in">
            <h3 className="font-heading font-bold text-foreground flex items-center gap-2">
              <UserX className="h-5 w-5 text-destructive" /> Rejeitar Cadastro
            </h3>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Motivo (opcional)</label>
              <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none h-24" placeholder="Informe o motivo da rejeição..." />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setRejectModal(null); setRejectNote(""); }}>Cancelar</Button>
              <Button variant="destructive" onClick={handleReject}>Confirmar Rejeição</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
