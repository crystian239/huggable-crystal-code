import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useClinicStore } from "@/data/clinicStore";
import { useBillingStore } from "@/data/billingStore";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, FileText, Search, AlertTriangle, DollarSign, MapPin, User, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function NotaFiscalPage() {
  const patients = useClinicStore((s) => s.patients);
  const { charges, invoiceData } = useBillingStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"todos" | "quer_nf" | "sem_nf">("todos");
  const [invoiceStatuses, setInvoiceStatuses] = useState<Record<string, { emitted: boolean; emittedAt?: string }>>(() => {
    const saved = localStorage.getItem("clinic-invoice-statuses");
    return saved ? JSON.parse(saved) : {};
  });

  const saveStatuses = (updated: typeof invoiceStatuses) => {
    setInvoiceStatuses(updated);
    localStorage.setItem("clinic-invoice-statuses", JSON.stringify(updated));
  };

  // Patients that want invoices with their data
  const patientsWithInvoiceData = useMemo(() => {
    return patients.map((p) => {
      const invData = invoiceData.find((d) => d.patientId === p.id);
      const patientCharges = charges.filter((c) => c.patientId === p.id);
      const totalPago = patientCharges.filter((c) => c.status === "pago").reduce((s, c) => s + (c.paidAmount || c.amount), 0);
      const totalPendente = patientCharges.filter((c) => c.status === "pendente" || c.status === "atrasado").reduce((s, c) => s + c.amount, 0);
      const lastPaidCharge = patientCharges.filter((c) => c.status === "pago").sort((a, b) => (b.paidAt || "").localeCompare(a.paidAt || ""))[0];
      return {
        ...p,
        invoiceData: invData,
        wantsInvoice: invData?.wantsInvoice || false,
        invoiceCpf: invData?.cpf || "",
        invoiceCep: invData?.cep || "",
        invoiceAddress: invData?.address || "",
        charges: patientCharges,
        totalPago,
        totalPendente,
        lastPaidCharge,
      };
    });
  }, [patients, invoiceData, charges]);

  const filtered = useMemo(() => {
    let list = patientsWithInvoiceData;
    if (filter === "quer_nf") list = list.filter((p) => p.wantsInvoice);
    if (filter === "sem_nf") list = list.filter((p) => !p.wantsInvoice);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    // Show patients that want invoice first
    return list.sort((a, b) => (b.wantsInvoice ? 1 : 0) - (a.wantsInvoice ? 1 : 0));
  }, [patientsWithInvoiceData, filter, search]);

  const toggleInvoiceEmitted = (chargeId: string) => {
    const current = invoiceStatuses[chargeId];
    const updated = {
      ...invoiceStatuses,
      [chargeId]: current?.emitted
        ? { emitted: false, emittedAt: undefined }
        : { emitted: true, emittedAt: new Date().toISOString() },
    };
    saveStatuses(updated);
    toast.success(current?.emitted ? "NF marcada como pendente." : "NF marcada como emitida!");
  };

  const totalQuerNF = patientsWithInvoiceData.filter((p) => p.wantsInvoice).length;

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" /> Notas Fiscais
            </h1>
            <p className="text-sm text-muted-foreground">Dados dos pacientes para emissão de nota fiscal</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar paciente..."
              className="pl-9 pr-3 py-2 border border-input bg-background rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring w-64"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Querem Nota Fiscal</p>
              <p className="text-lg font-semibold text-foreground">{totalQuerNF}</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Pago (c/ NF)</p>
              <p className="text-lg font-semibold text-foreground">
                R$ {patientsWithInvoiceData.filter((p) => p.wantsInvoice).reduce((s, p) => s + p.totalPago, 0).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pendente (c/ NF)</p>
              <p className="text-lg font-semibold text-foreground">
                R$ {patientsWithInvoiceData.filter((p) => p.wantsInvoice).reduce((s, p) => s + p.totalPendente, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {([
            { id: "todos", label: "Todos" },
            { id: "quer_nf", label: "Quer NF" },
            { id: "sem_nf", label: "Sem NF" },
          ] as const).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${filter === f.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Patient list */}
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum paciente encontrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <div key={p.id} className={`bg-card border rounded-xl overflow-hidden ${p.wantsInvoice ? "border-primary/30" : "border-border"}`}>
                {/* Header */}
                <div className="p-4 flex items-center gap-4">
                  <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                    {p.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">{p.name}</p>
                      {p.wantsInvoice ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Quer NF ✓</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">Sem NF</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{p.phone} • {p.email}</p>
                  </div>
                  <div className="flex gap-4 shrink-0 text-right">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Pago</p>
                      <p className="text-sm font-semibold text-success">R$ {p.totalPago.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Pendente</p>
                      <p className={`text-sm font-semibold ${p.totalPendente > 0 ? "text-warning" : "text-muted-foreground"}`}>
                        R$ {p.totalPendente.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Invoice data (if wants NF) */}
                {p.wantsInvoice && (
                  <div className="px-4 pb-3 border-t border-border/50 pt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-[10px] text-muted-foreground">CPF</p>
                          <p className="font-medium text-foreground">{p.invoiceCpf || "—"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-[10px] text-muted-foreground">CEP</p>
                          <p className="font-medium text-foreground">{p.invoiceCep || "—"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-1">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground">Endereço</p>
                          <p className="font-medium text-foreground truncate">{p.invoiceAddress || "—"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Per-charge NF tracking */}
                    {p.charges.filter((c) => c.status === "pago").length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Cobranças pagas — controle de NF</p>
                        {p.charges.filter((c) => c.status === "pago").sort((a, b) => (b.paidAt || "").localeCompare(a.paidAt || "")).map((c) => {
                          const status = invoiceStatuses[c.id];
                          const isEmitted = status?.emitted || false;
                          return (
                            <div key={c.id} className="flex items-center gap-3 bg-secondary/50 rounded-lg px-3 py-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground">{c.description}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  R$ {(c.paidAmount || c.amount).toFixed(2)} • {c.method === "pix" ? "PIX" : c.method === "cartao" ? "Cartão" : "Dinheiro"}
                                  {c.paidAt && ` • ${format(new Date(c.paidAt), "dd/MM/yyyy HH:mm")}`}
                                </p>
                              </div>
                              <button
                                onClick={() => toggleInvoiceEmitted(c.id)}
                                className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg font-medium transition-colors ${isEmitted ? "bg-success/10 text-success" : "bg-warning/10 text-warning hover:bg-warning/20"}`}
                              >
                                {isEmitted ? <><CheckCircle2 className="h-3 w-3" /> NF Emitida</> : <><Clock className="h-3 w-3" /> Emitir NF</>}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Pending charges */}
                    {p.charges.filter((c) => c.status !== "pago").length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Cobranças pendentes</p>
                        {p.charges.filter((c) => c.status !== "pago").map((c) => (
                          <div key={c.id} className="flex items-center gap-3 bg-warning/5 rounded-lg px-3 py-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground">{c.description}</p>
                              <p className="text-[10px] text-muted-foreground">
                                R$ {c.amount.toFixed(2)} • Venc: {c.dueDate.split("-").reverse().join("/")}
                              </p>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.status === "atrasado" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                              {c.status === "atrasado" ? "Atrasado" : "Pendente"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
