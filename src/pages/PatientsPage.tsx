import { useState } from "react";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useClinicStore, Patient } from "@/data/clinicStore";
import { useTeleconsultaStore } from "@/data/teleconsultaStore";
import { Button } from "@/components/ui/button";
import { Plus, Search, Trash2, Edit, X, Phone, Mail, UserPlus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { maskPhone, maskCPF } from "@/lib/masks";

const empty = { name: "", cpf: "", phone: "", email: "", birthDate: "", address: "", notes: "" };

export default function PatientsPage() {
  const patients = useClinicStore((s) => s.patients);
  const addPatient = useClinicStore((s) => s.addPatient);
  const updatePatient = useClinicStore((s) => s.updatePatient);
  const deletePatient = useClinicStore((s) => s.deletePatient);
  const { patientAccounts, registerPatient } = useTeleconsultaStore();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.cpf.includes(search)
  );

  const handleSave = () => {
    if (!form.name || !form.phone) {
      toast.error("Nome e telefone são obrigatórios.");
      return;
    }
    if (editing) {
      updatePatient(editing, form);
      toast.success("Paciente atualizado!");
    } else {
      const patientId = addPatient(form);
      // Auto-create portal access with CPF login and default password
      if (form.cpf) {
        const cpfClean = form.cpf.replace(/\D/g, "");
        if (cpfClean.length >= 11 && !patientAccounts.some((a) => a.cpf.replace(/\D/g, "") === cpfClean)) {
          registerPatient({
            patientId,
            name: form.name,
            email: form.email || "",
            phone: form.phone,
            cpf: form.cpf,
            birthDate: form.birthDate || "",
            password: "123456789",
            avatar: "",
          });
          toast.success("Paciente cadastrado com acesso ao portal! Senha padrão: 123456789");
        } else {
          toast.success("Paciente cadastrado!");
        }
      } else {
        toast.success("Paciente cadastrado! (sem CPF, acesso ao portal não criado)");
      }
    }
    setForm(empty);
    setShowForm(false);
    setEditing(null);
  };

  const handleEdit = (p: Patient) => {
    setForm({ name: p.name, cpf: p.cpf, phone: p.phone, email: p.email, birthDate: p.birthDate, address: p.address, notes: p.notes });
    setEditing(p.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Deseja excluir este paciente e todos os dados relacionados?")) {
      deletePatient(id);
      toast.success("Paciente excluído.");
    }
  };

  const hasPortalAccess = (patientId: string) =>
    patientAccounts.some((a) => a.patientId === patientId);

  const handleCreateAccessQuick = (p: Patient) => {
    if (!p.cpf) {
      toast.error("Paciente precisa ter CPF cadastrado para criar acesso.");
      return;
    }
    const cpfClean = p.cpf.replace(/\D/g, "");
    if (patientAccounts.some((a) => a.cpf.replace(/\D/g, "") === cpfClean)) {
      toast.error("Este CPF já possui acesso ao portal.");
      return;
    }
    registerPatient({
      patientId: p.id,
      name: p.name,
      email: p.email || "",
      phone: p.phone,
      cpf: p.cpf,
      birthDate: p.birthDate || "",
      password: "123456789",
      avatar: "",
    });
    toast.success(`Acesso criado para ${p.name}! Login: CPF / Senha: 123456789`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Pacientes</h1>
          <Button onClick={() => { setForm(empty); setEditing(null); setShowForm(true); }} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Novo Paciente
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou CPF..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">{editing ? "Editar Paciente" : "Novo Paciente"}</h2>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { key: "name", label: "Nome completo *", type: "text", placeholder: "Nome do paciente" },
                  { key: "cpf", label: "CPF", type: "text", placeholder: "000.000.000-00" },
                  { key: "phone", label: "Telefone *", type: "text", placeholder: "(00) 00000-0000" },
                  { key: "email", label: "Email", type: "email", placeholder: "email@exemplo.com" },
                  { key: "birthDate", label: "Data de Nascimento", type: "date", placeholder: "" },
                  { key: "address", label: "Endereço", type: "text", placeholder: "Rua, número, bairro" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-sm font-medium text-foreground mb-1 block">{f.label}</label>
                    <input
                      type={f.type}
                      value={(form as any)[f.key]}
                      onChange={(e) => {
                        const maskFn = f.key === "cpf" ? maskCPF : f.key === "phone" ? maskPhone : undefined;
                        setForm({ ...form, [f.key]: maskFn ? maskFn(e.target.value) : e.target.value });
                      }}
                      placeholder={f.placeholder}
                      className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Observações</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} className="flex-1">Salvar</Button>
                  <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* List */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Nenhum paciente encontrado.</p>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((p) => {
                const hasAccess = hasPortalAccess(p.id);
                return (
                  <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium shrink-0">
                      {p.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">{p.name}</p>
                        {hasAccess && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" /> Portal
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
                        {p.phone && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{p.phone}</span>}
                        {p.email && <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{p.email}</span>}
                        {p.cpf && <span className="text-xs text-muted-foreground">CPF: {p.cpf}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {!hasAccess && (
                        <button
                          onClick={() => handleCreateAccessQuick(p)}
                          title="Criar acesso ao portal (CPF + senha 123456789)"
                          className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-secondary"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => handleEdit(p)} className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-secondary"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-secondary"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
