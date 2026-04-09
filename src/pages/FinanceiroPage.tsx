import { useMemo, useState, useEffect } from "react";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useClinicStore } from "@/data/clinicStore";
import { useBillingStore } from "@/data/billingStore";
import { useAdminStore } from "@/data/adminStore";
import { useAuthStore } from "@/data/authStore";
import { Button } from "@/components/ui/button";
import {
  Plus, X, DollarSign, CreditCard, Smartphone, Banknote, CheckCircle, Clock,
  CalendarDays, Settings, Bell, AlertTriangle, Search, Edit2, Trash2, RefreshCw, Eye
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const METHODS = [
  { value: "pix" as const, label: "PIX", icon: Smartphone },
  { value: "cartao" as const, label: "Cartão", icon: CreditCard },
  { value: "dinheiro" as const, label: "Dinheiro", icon: Banknote },
];

export default function FinanceiroPage() {
  const currentUser = useAuthStore((s) => s.user);
  const patients = useClinicStore((s) => s.patients);
  const appointments = useClinicStore((s) => s.appointments);
  const adminDoctors = useAdminStore((s) => s.doctors);
  const isAdmin = currentUser?.role === "admin";
  const doctorProfile = adminDoctors.find((d) => d.loginUsername === currentUser?.username);
  const myDoctorName = doctorProfile?.name || "";

  const {
    charges, billingNotifications, patientConfigs,
    setPatientConfig, addCharge, updateCharge, deleteCharge,
    markAsPaid, markAsUnpaid, generateMonthlyCharges, checkAndNotify,
    addBillingNotification, markBillingNotificationReadByAdmin, markAllAdminNotificationsRead,
  } = useBillingStore();

  const [tab, setTab] = useState<"cobranças" | "configurar" | "notificações">("cobranças");
  const [filter, setFilter] = useState<"todos" | "pago" | "pendente" | "atrasado">("todos");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showPayModal, setShowPayModal] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<"pix" | "cartao" | "dinheiro">("pix");
  const [payAmount, setPayAmount] = useState("");
  const [editCharge, setEditCharge] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  // Config form
  const [configPatientId, setConfigPatientId] = useState("");
  const [configAmount, setConfigAmount] = useState("");
  const [configDueDay, setConfigDueDay] = useState("10");

  // New charge form
  const [newForm, setNewForm] = useState({
    patientId: "", amount: "", description: "", dueDate: new Date().toISOString().split("T")[0],
    method: "pix" as "pix" | "cartao" | "dinheiro", status: "pendente" as "pendente" | "pago",
  });

  // Filter patients by doctor if not admin
  const myPatients = useMemo(() => {
    if (isAdmin) return patients;
    const myApptPatientIds = [...new Set(appointments.filter((a) => a.doctorName === myDoctorName).map((a) => a.patientId))];
    return patients.filter((p) => myApptPatientIds.includes(p.id));
  }, [isAdmin, patients, appointments, myDoctorName]);

  // Auto-generate monthly charges on page load
  useEffect(() => {
    generateMonthlyCharges(myPatients.map((p) => ({ id: p.id, name: p.name })));
    checkAndNotify();
  }, []);

  // Filtered charges
  const filteredCharges = useMemo(() => {
    let list = charges;
    if (!isAdmin) {
      const myPatientIds = myPatients.map((p) => p.id);
      list = list.filter((c) => myPatientIds.includes(c.patientId));
    }
    if (filter !== "todos") list = list.filter((c) => c.status === filter);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((c) => {
        const p = patients.find((pt) => pt.id === c.patientId);
        return p?.name.toLowerCase().includes(s) || c.description.toLowerCase().includes(s);
      });
    }
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [charges, filter, search, patients, isAdmin, myPatients]);

  const totalPago = filteredCharges.filter((c) => c.status === "pago").reduce((s, c) => s + (c.paidAmount || c.amount), 0);
  const totalPendente = filteredCharges.filter((c) => c.status === "pendente").reduce((s, c) => s + c.amount, 0);
  const totalAtrasado = filteredCharges.filter((c) => c.status === "atrasado").reduce((s, c) => s + c.amount, 0);

  const adminNotifications = useMemo(
    () => billingNotifications.filter((n) => n.type === "pagamento_confirmado" && !n.readByAdmin).sort((a, b) => b.date.localeCompare(a.date)),
    [billingNotifications]
  );
  const allNotifications = useMemo(
    () => billingNotifications.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50),
    [billingNotifications]
  );

  const handleNewCharge = () => {
    if (!newForm.patientId || !newForm.amount) { toast.error("Preencha paciente e valor."); return; }
    const parsed = parseFloat(newForm.amount.replace(",", "."));
    if (isNaN(parsed) || parsed <= 0) { toast.error("Valor inválido."); return; }
    const month = newForm.dueDate.slice(0, 7);
    const chargeId = addCharge({
      patientId: newForm.patientId,
      month,
      amount: parsed,
      description: newForm.description || `Cobrança manual`,
      dueDate: newForm.dueDate,
      status: newForm.status,
      ...(newForm.status === "pago" ? { method: newForm.method, paidAt: new Date().toISOString(), paidAmount: parsed } : {}),
    });
    if (newForm.status === "pendente") {
      addBillingNotification({
        patientId: newForm.patientId,
        type: "cobranca_gerada",
        message: `Nova cobrança de R$ ${parsed.toFixed(2)} criada. Vencimento: ${newForm.dueDate.split("-").reverse().join("/")}`,
        chargeId,
        date: new Date().toISOString(),
        read: false,
      });
    }
    toast.success("Cobrança criada!");
    setShowForm(false);
    setNewForm({ patientId: "", amount: "", description: "", dueDate: new Date().toISOString().split("T")[0], method: "pix", status: "pendente" });
  };

  const handleMarkPaid = () => {
    if (!showPayModal) return;
    const charge = charges.find((c) => c.id === showPayModal);
    if (!charge) return;
    const amount = payAmount ? parseFloat(payAmount.replace(",", ".")) : charge.amount;
    markAsPaid(showPayModal, payMethod, amount);
    const patient = patients.find((p) => p.id === charge.patientId);
    addBillingNotification({
      patientId: charge.patientId,
      type: "pagamento_confirmado",
      message: `Pagamento de R$ ${amount.toFixed(2)} confirmado via ${payMethod === "pix" ? "PIX" : payMethod === "cartao" ? "Cartão" : "Dinheiro"}. ${patient?.name || "Paciente"} - ${charge.description}`,
      chargeId: showPayModal,
      date: new Date().toISOString(),
      read: false,
    });
    toast.success("Pagamento marcado como pago!");
    setShowPayModal(null);
    setPayAmount("");
  };

  const handleSaveEdit = () => {
    if (!editCharge) return;
    const amount = editAmount ? parseFloat(editAmount.replace(",", ".")) : undefined;
    updateCharge(editCharge, {
      ...(amount ? { amount } : {}),
      ...(editDesc ? { description: editDesc } : {}),
      ...(editDueDate ? { dueDate: editDueDate } : {}),
    });
    toast.success("Cobrança atualizada!");
    setEditCharge(null);
  };

  const handleSaveConfig = () => {
    if (!configPatientId || !configAmount) { toast.error("Preencha paciente e valor."); return; }
    const parsed = parseFloat(configAmount.replace(",", "."));
    if (isNaN(parsed) || parsed <= 0) { toast.error("Valor inválido."); return; }
    const day = parseInt(configDueDay);
    if (isNaN(day) || day < 1 || day > 28) { toast.error("Dia deve ser entre 1 e 28."); return; }
    setPatientConfig({ patientId: configPatientId, monthlyAmount: parsed, dueDay: day, active: true });
    toast.success("Configuração salva!");
    setConfigPatientId("");
    setConfigAmount("");
    setConfigDueDay("10");
  };

  const methodIcons: Record<string, typeof Smartphone> = { pix: Smartphone, cartao: CreditCard, dinheiro: Banknote };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Financeiro</h1>
          <div className="flex gap-2 flex-wrap">
            {adminNotifications.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => { setTab("notificações"); }}>
                <Bell className="h-4 w-4 mr-1 text-warning" /> {adminNotifications.length} novo(s)
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => { generateMonthlyCharges(myPatients.map((p) => ({ id: p.id, name: p.name }))); checkAndNotify(); toast.success("Cobranças verificadas!"); }}>
              <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
            </Button>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" /> Nova Cobrança
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-2">
          {([
            { id: "cobranças" as const, label: "Cobranças", icon: DollarSign, badge: 0 },
            { id: "configurar" as const, label: "Configurar Valores", icon: Settings, badge: 0 },
            { id: "notificações" as const, label: "Notificações", icon: Bell, badge: adminNotifications.length },
          ]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
              {t.badge ? <span className="ml-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">{t.badge}</span> : null}
            </button>
          ))}
        </div>

        {/* === COBRANÇAS TAB === */}
        {tab === "cobranças" && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center"><CheckCircle className="h-5 w-5 text-success" /></div>
                <div><p className="text-xs text-muted-foreground">Recebido</p><p className="text-lg font-semibold text-foreground">R$ {totalPago.toFixed(2)}</p></div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center"><Clock className="h-5 w-5 text-warning" /></div>
                <div><p className="text-xs text-muted-foreground">Pendente</p><p className="text-lg font-semibold text-foreground">R$ {totalPendente.toFixed(2)}</p></div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
                <div><p className="text-xs text-muted-foreground">Atrasado</p><p className="text-lg font-semibold text-destructive">R$ {totalAtrasado.toFixed(2)}</p></div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><DollarSign className="h-5 w-5 text-primary" /></div>
                <div><p className="text-xs text-muted-foreground">Total Geral</p><p className="text-lg font-semibold text-foreground">R$ {(totalPago + totalPendente + totalAtrasado).toFixed(2)}</p></div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap items-center">
              {(["todos", "pendente", "atrasado", "pago"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors capitalize ${filter === f ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}>{f}</button>
              ))}
              <div className="flex-1 min-w-[200px] max-w-xs relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar paciente..." className="w-full border border-input bg-background rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            {/* Charges list */}
            {filteredCharges.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <DollarSign className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma cobrança encontrada.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCharges.map((charge) => {
                  const patient = patients.find((p) => p.id === charge.patientId);
                  const MethodIcon = charge.method ? (methodIcons[charge.method] || DollarSign) : DollarSign;
                  const isEditing = editCharge === charge.id;

                  return (
                    <div key={charge.id} className={`bg-card border rounded-xl p-4 transition-colors ${charge.status === "atrasado" ? "border-destructive/40" : charge.status === "pago" ? "border-success/30" : "border-border"}`}>
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs font-medium text-foreground mb-1 block">Valor (R$)</label>
                              <input value={editAmount} onChange={(e) => setEditAmount(e.target.value.replace(/[^0-9.,]/g, ""))} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-foreground mb-1 block">Descrição</label>
                              <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-foreground mb-1 block">Vencimento</label>
                              <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveEdit}>Salvar</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditCharge(null)}>Cancelar</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${charge.status === "pago" ? "bg-success/10" : charge.status === "atrasado" ? "bg-destructive/10" : "bg-warning/10"}`}>
                            {charge.status === "pago" ? <CheckCircle className="h-5 w-5 text-success" /> : charge.status === "atrasado" ? <AlertTriangle className="h-5 w-5 text-destructive" /> : <Clock className="h-5 w-5 text-warning" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{patient?.name || "Paciente"}</p>
                            <p className="text-xs text-muted-foreground">{charge.description}</p>
                            <div className="flex gap-2 mt-0.5 flex-wrap">
                              <span className="text-[10px] text-muted-foreground">Venc: {charge.dueDate.split("-").reverse().join("/")}</span>
                              {charge.method && <span className="text-[10px] text-muted-foreground">• {charge.method === "pix" ? "PIX" : charge.method === "cartao" ? "Cartão" : "Dinheiro"}</span>}
                              {charge.paidAt && <span className="text-[10px] text-success">• Pago em {format(new Date(charge.paidAt), "dd/MM/yyyy HH:mm")}</span>}
                              {charge.paidAmount && charge.paidAmount !== charge.amount && <span className="text-[10px] text-primary">• Valor pago: R$ {charge.paidAmount.toFixed(2)}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-semibold text-foreground">R$ {charge.amount.toFixed(2)}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${charge.status === "pago" ? "bg-success/10 text-success" : charge.status === "atrasado" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                              {charge.status === "pago" ? "Pago" : charge.status === "atrasado" ? "Atrasado" : "Pendente"}
                            </span>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {charge.status !== "pago" && (
                              <button onClick={() => { setShowPayModal(charge.id); setPayAmount(charge.amount.toFixed(2).replace(".", ",")); }} className="p-1.5 rounded-lg text-success hover:bg-success/10 transition-colors" title="Marcar como pago">
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            {charge.status === "pago" && (
                              <button onClick={() => { markAsUnpaid(charge.id); toast.success("Pagamento revertido."); }} className="p-1.5 rounded-lg text-warning hover:bg-warning/10 transition-colors" title="Reverter pagamento">
                                <Clock className="h-4 w-4" />
                              </button>
                            )}
                            <button onClick={() => { setEditCharge(charge.id); setEditAmount(charge.amount.toFixed(2).replace(".", ",")); setEditDesc(charge.description); setEditDueDate(charge.dueDate); }} className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors" title="Editar">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => { deleteCharge(charge.id); toast.success("Cobrança removida."); }} className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" title="Excluir">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* === CONFIGURAR TAB === */}
        {tab === "configurar" && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" /> Configurar Cobrança Mensal
              </h2>
              <p className="text-sm text-muted-foreground">Defina o valor mensal e dia de vencimento para cada paciente. O sistema gerará automaticamente a cobrança todo mês.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Paciente</label>
                  <select value={configPatientId} onChange={(e) => { setConfigPatientId(e.target.value); const cfg = patientConfigs.find((c) => c.patientId === e.target.value); if (cfg) { setConfigAmount(cfg.monthlyAmount.toFixed(2).replace(".", ",")); setConfigDueDay(String(cfg.dueDay)); } }} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Selecione</option>
                    {myPatients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Valor Mensal (R$)</label>
                  <input value={configAmount} onChange={(e) => setConfigAmount(e.target.value.replace(/[^0-9.,]/g, ""))} placeholder="150,00" className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Dia Vencimento (1-28)</label>
                  <input type="number" min={1} max={28} value={configDueDay} onChange={(e) => setConfigDueDay(e.target.value)} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <Button onClick={handleSaveConfig} className="mt-2">Salvar Configuração</Button>
            </div>

            {/* List of configured patients */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-secondary/50 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Pacientes Configurados ({patientConfigs.filter((c) => c.active).length})</h3>
              </div>
              {patientConfigs.filter((c) => c.active).length === 0 ? (
                <p className="text-sm text-muted-foreground p-4 text-center">Nenhum paciente configurado para cobrança automática.</p>
              ) : (
                <div className="divide-y divide-border">
                  {patientConfigs.filter((c) => c.active).map((config) => {
                    const patient = patients.find((p) => p.id === config.patientId);
                    return (
                      <div key={config.patientId} className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors">
                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium shrink-0">
                          {patient?.name?.[0] || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{patient?.name || "Paciente"}</p>
                          <p className="text-xs text-muted-foreground">Vencimento: dia {config.dueDay}</p>
                        </div>
                        <span className="font-semibold text-foreground">R$ {config.monthlyAmount.toFixed(2)}</span>
                        <button onClick={() => { setPatientConfig({ ...config, active: false }); toast.success("Cobrança desativada."); }} className="text-xs text-destructive hover:underline">Desativar</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* === NOTIFICAÇÕES TAB === */}
        {tab === "notificações" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Notificações de Pagamento</h2>
              {adminNotifications.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => { markAllAdminNotificationsRead(); toast.success("Todas marcadas como lidas."); }}>
                  Marcar todas como lidas
                </Button>
              )}
            </div>
            {allNotifications.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma notificação.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allNotifications.map((n) => {
                  const patient = patients.find((p) => p.id === n.patientId);
                  const typeColors = {
                    cobranca_gerada: "text-primary bg-primary/10",
                    vencimento_proximo: "text-warning bg-warning/10",
                    pagamento_atrasado: "text-destructive bg-destructive/10",
                    pagamento_confirmado: "text-success bg-success/10",
                  };
                  const typeLabels = {
                    cobranca_gerada: "Cobrança",
                    vencimento_proximo: "Vencimento",
                    pagamento_atrasado: "Atrasado",
                    pagamento_confirmado: "Pago ✓",
                  };
                  return (
                    <div key={n.id} className={`bg-card border border-border rounded-xl p-4 flex items-start gap-3 cursor-pointer transition-colors ${!n.readByAdmin ? "bg-primary/5 border-primary/20" : "opacity-60"}`} onClick={() => { if (!n.readByAdmin) markBillingNotificationReadByAdmin(n.id); }}>
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${typeColors[n.type]}`}>
                        {n.type === "pagamento_confirmado" ? <CheckCircle className="h-4 w-4" /> :
                         n.type === "pagamento_atrasado" ? <AlertTriangle className="h-4 w-4" /> :
                         n.type === "vencimento_proximo" ? <Clock className="h-4 w-4" /> :
                         <DollarSign className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${typeColors[n.type]}`}>{typeLabels[n.type]}</span>
                          <span className="text-[10px] text-muted-foreground">{patient?.name}</span>
                        </div>
                        <p className="text-sm text-foreground">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(n.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* NEW CHARGE MODAL */}
        {showForm && (
          <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-card border border-border rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Nova Cobrança</h2>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Paciente *</label>
                  <select value={newForm.patientId} onChange={(e) => setNewForm({ ...newForm, patientId: e.target.value })} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Selecione</option>
                    {myPatients.map((p) => <option key={p.id} value={p.id}>{p.name}{p.cpf ? ` — CPF: ${p.cpf}` : ""}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Valor (R$) *</label>
                    <input value={newForm.amount} onChange={(e) => setNewForm({ ...newForm, amount: e.target.value.replace(/[^0-9.,]/g, "") })} placeholder="0,00" className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Vencimento</label>
                    <input type="date" value={newForm.dueDate} onChange={(e) => setNewForm({ ...newForm, dueDate: e.target.value })} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Forma de Pagamento</label>
                  <div className="grid grid-cols-3 gap-2">
                    {METHODS.map((m) => (
                      <button key={m.value} type="button" onClick={() => setNewForm({ ...newForm, method: m.value })} className={`flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg border transition-colors ${newForm.method === m.value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}>
                        <m.icon className="h-3.5 w-3.5" />{m.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Situação</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["pendente", "pago"] as const).map((s) => (
                      <button key={s} type="button" onClick={() => setNewForm({ ...newForm, status: s })} className={`py-2 text-xs rounded-lg border transition-colors capitalize ${newForm.status === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Descrição</label>
                  <input value={newForm.description} onChange={(e) => setNewForm({ ...newForm, description: e.target.value })} placeholder="Ex: Mensalidade abril/2026" className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <Button onClick={handleNewCharge} className="w-full">Criar Cobrança</Button>
              </div>
            </div>
          </div>
        )}

        {/* PAY MODAL */}
        {showPayModal && (
          <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4" onClick={() => setShowPayModal(null)}>
            <div className="bg-card border border-border rounded-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Confirmar Pagamento</h2>
                <button onClick={() => setShowPayModal(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Forma de Pagamento</label>
                  <div className="grid grid-cols-3 gap-2">
                    {METHODS.map((m) => (
                      <button key={m.value} type="button" onClick={() => setPayMethod(m.value)} className={`flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-lg border transition-colors ${payMethod === m.value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}>
                        <m.icon className="h-3.5 w-3.5" />{m.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Valor Pago (R$)</label>
                  <input value={payAmount} onChange={(e) => setPayAmount(e.target.value.replace(/[^0-9.,]/g, ""))} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <Button onClick={handleMarkPaid} className="w-full bg-success hover:bg-success/90">
                  <CheckCircle className="h-4 w-4 mr-1" /> Confirmar Pagamento
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
