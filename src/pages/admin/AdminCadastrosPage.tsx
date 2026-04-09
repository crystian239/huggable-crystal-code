import { useState } from "react";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useAdminStore } from "@/data/adminStore";
import { useAuthStore } from "@/data/authStore";
import { useClinicStore } from "@/data/clinicStore";
import { useTeleconsultaStore } from "@/data/teleconsultaStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { maskPhone, maskCPF } from "@/lib/masks";
import {
  UserPlus, UserCheck, UserX, Search, Check, X, Plus, Trash2, Save, XCircle, Users, ClipboardList,
} from "lucide-react";

export default function AdminCadastrosPage() {
  const { user } = useAuthStore();
  const { pendingRegistrations, approveRegistration, rejectRegistration, addLog } = useAdminStore();
  const clinicStore = useClinicStore();
  const teleconsultaStore = useTeleconsultaStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  // New patient form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", cpf: "", phone: "", email: "", birthDate: "" });

  // Remove confirm
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);

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

  const handleNewPatient = () => {
    if (!newForm.name || !newForm.cpf) {
      toast.error("Nome e CPF são obrigatórios.");
      return;
    }
    const cpfClean = newForm.cpf.replace(/\D/g, "");
    if (cpfClean.length < 11) {
      toast.error("CPF inválido.");
      return;
    }
    if (teleconsultaStore.patientAccounts.some((a) => a.cpf.replace(/\D/g, "") === cpfClean)) {
      toast.error("Este CPF já possui cadastro.");
      return;
    }
    const patientId = clinicStore.addPatient({
      name: newForm.name,
      cpf: newForm.cpf,
      phone: newForm.phone,
      email: newForm.email,
      birthDate: newForm.birthDate,
      address: "",
      notes: "",
    });
    teleconsultaStore.registerPatient({
      patientId,
      name: newForm.name,
      email: newForm.email,
      phone: newForm.phone,
      cpf: newForm.cpf,
      birthDate: newForm.birthDate,
      password: "123456",
      avatar: "",
      status: "ativo",
    });
    addLog({ action: "Paciente cadastrado", details: `${newForm.name} (CPF: ${newForm.cpf})`, performedBy: user!.username });
    toast.success(`${newForm.name} cadastrado com acesso ao portal! Senha padrão: 123456`);
    setShowNewForm(false);
    setNewForm({ name: "", cpf: "", phone: "", email: "", birthDate: "" });
  };

  const handleRemoveAccess = (acc: { id: string; name: string; cpf: string }) => {
    teleconsultaStore.removePatientAccount(acc.id);
    addLog({ action: "Acesso removido", details: `${acc.name} (CPF: ${acc.cpf})`, performedBy: user!.username });
    toast.success(`Acesso de ${acc.name} removido.`);
    setRemoveConfirm(null);
  };

  const filteredAccounts = teleconsultaStore.patientAccounts.filter(
    (a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.cpf.includes(searchTerm)
  );

  const pendingList = pendingRegistrations.filter((r) => r.status === "pendente");
  const historyList = pendingRegistrations.filter((r) => r.status !== "pendente");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">Cadastros</h2>
            <p className="text-sm text-muted-foreground">
              {filteredAccounts.length} conta(s) ativa(s) • {pendingList.length} pendente(s)
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="pl-9 pr-4 py-2 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring w-48"
              />
            </div>
            <Button size="sm" onClick={() => { setShowNewForm(true); setNewForm({ name: "", cpf: "", phone: "", email: "", birthDate: "" }); }}>
              <Plus className="h-4 w-4 mr-1" /> Novo Cadastro
            </Button>
          </div>
        </div>

        {/* New Patient Form */}
        {showNewForm && (
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4 animate-fade-in">
            <h3 className="font-heading font-bold text-foreground flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> Cadastrar Novo Paciente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Nome completo *</label>
                <input value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Nome do paciente" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">CPF *</label>
                <input value={newForm.cpf} onChange={(e) => setNewForm({ ...newForm, cpf: maskCPF(e.target.value) })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="000.000.000-00" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Telefone</label>
                <input value={newForm.phone} onChange={(e) => setNewForm({ ...newForm, phone: maskPhone(e.target.value) })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="(00) 00000-0000" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                <input value={newForm.email} onChange={(e) => setNewForm({ ...newForm, email: e.target.value })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="email@exemplo.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Data de Nascimento</label>
                <input type="date" value={newForm.birthDate} onChange={(e) => setNewForm({ ...newForm, birthDate: e.target.value })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleNewPatient}>
                <Save className="h-4 w-4 mr-1" /> Cadastrar
              </Button>
              <Button variant="outline" onClick={() => setShowNewForm(false)}>
                <XCircle className="h-4 w-4 mr-1" /> Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Pending Registrations */}
        {pendingList.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-[hsl(40,90%,50%)]" />
              Pendentes ({pendingList.length})
            </h3>
            {pendingList.map((reg) => (
              <div key={reg.id} className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-[hsl(40,90%,50%)]/10 flex items-center justify-center shrink-0">
                    <UserPlus className="h-6 w-6 text-[hsl(40,90%,50%)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{reg.name}</p>
                    <p className="text-sm text-muted-foreground">CPF: {reg.cpf} • {reg.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Solicitado em {format(new Date(reg.requestedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleApprove(reg.id, reg.name)} className="h-9 w-9 rounded-lg bg-[hsl(142,70%,45%)]/10 flex items-center justify-center text-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,45%)]/20 transition-colors" title="Aprovar">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setRejectModal(reg.id)} className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors" title="Rejeitar">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All Active Accounts */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-[hsl(142,70%,45%)]" />
            Contas com Acesso ({filteredAccounts.length})
          </h3>
          {filteredAccounts.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-10 text-center">
              <Users className="h-14 w-14 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Nenhuma conta cadastrada.</p>
              <p className="text-xs text-muted-foreground mt-1">Clique em "Novo Cadastro" para adicionar.</p>
            </div>
          ) : (
            filteredAccounts.map((acc) => (
              <div key={acc.id} className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-[hsl(142,70%,45%)]/10 flex items-center justify-center shrink-0">
                    <UserCheck className="h-6 w-6 text-[hsl(142,70%,45%)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{acc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      CPF: {acc.cpf} {acc.email && `• ${acc.email}`} {acc.phone && `• ${acc.phone}`}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      {acc.birthDate && <span className="text-xs text-muted-foreground">Nasc: {acc.birthDate}</span>}
                      <span className="text-xs text-muted-foreground">
                        Cadastrado em {format(new Date(acc.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs px-3 py-1 rounded-full font-medium bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]">Ativo</span>
                    {removeConfirm === acc.id ? (
                      <div className="flex gap-1">
                        <Button size="sm" variant="destructive" onClick={() => handleRemoveAccess(acc)}>
                          Confirmar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setRemoveConfirm(null)}>
                          Não
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRemoveConfirm(acc.id)}
                        className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"
                        title="Remover acesso"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* History */}
        {historyList.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              Histórico de Solicitações ({historyList.length})
            </h3>
            {historyList.map((reg) => (
              <div key={reg.id} className="bg-card rounded-2xl border border-border p-5 opacity-75">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${
                    reg.status === "aprovado" ? "bg-[hsl(142,70%,45%)]/10" : "bg-destructive/10"
                  }`}>
                    {reg.status === "aprovado" ? <UserCheck className="h-6 w-6 text-[hsl(142,70%,45%)]" /> : <UserX className="h-6 w-6 text-destructive" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{reg.name}</p>
                    <p className="text-sm text-muted-foreground">CPF: {reg.cpf} • {reg.email}</p>
                    {reg.reviewNote && <p className="text-xs text-muted-foreground mt-1 italic">📝 {reg.reviewNote}</p>}
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${
                    reg.status === "aprovado" ? "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]" : "bg-destructive/10 text-destructive"
                  }`}>
                    {reg.status === "aprovado" ? "Aprovado" : "Rejeitado"}
                    {reg.reviewedAt && ` • ${format(new Date(reg.reviewedAt), "dd/MM", { locale: ptBR })}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
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
