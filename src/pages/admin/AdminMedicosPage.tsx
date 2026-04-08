import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useAdminStore, DoctorProfile } from "@/data/adminStore";
import { useAuthStore } from "@/data/authStore";
import { useClinicStore } from "@/data/clinicStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { maskPhone, maskCRP } from "@/lib/masks";
import {
  Stethoscope, Plus, Edit, Trash2, Save, XCircle, Search,
  UserCheck, UserX, MessageCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminMedicosPage() {
  const { user } = useAuthStore();
  const { doctors, addDoctor, updateDoctor, deleteDoctor, addLog } = useAdminStore();
  const { addUser } = useAuthStore();
  const clinicStore = useClinicStore();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", specialty: "", crp: "", phone: "", email: "", loginUsername: "", loginPassword: "" });

  const filtered = doctors.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.name || !form.specialty || !form.loginUsername || !form.loginPassword) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    if (form.loginPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    const loginCreated = addUser(form.loginUsername, form.loginPassword, "doctor");
    if (!loginCreated) {
      toast.error("Nome de usuário já existe.");
      return;
    }
    addDoctor({ name: form.name, specialty: form.specialty, crp: form.crp, phone: form.phone, email: form.email, status: "ativo", loginUsername: form.loginUsername });
    const currentDoctors = clinicStore.settings.doctors || [];
    if (!currentDoctors.includes(form.name)) {
      clinicStore.updateSettings({ doctors: [...currentDoctors, form.name] });
    }
    addLog({ action: "Médico cadastrado", details: `Dr(a). ${form.name} - ${form.specialty}`, performedBy: user!.username });
    toast.success("Médico cadastrado com sucesso!");
    setForm({ name: "", specialty: "", crp: "", phone: "", email: "", loginUsername: "", loginPassword: "" });
    setShowForm(false);
  };

  const handleUpdate = () => {
    if (!editingId || !form.name) return;
    updateDoctor(editingId, { name: form.name, specialty: form.specialty, crp: form.crp, phone: form.phone, email: form.email });
    addLog({ action: "Médico atualizado", details: `Dr(a). ${form.name}`, performedBy: user!.username });
    toast.success("Médico atualizado!");
    setEditingId(null);
    setForm({ name: "", specialty: "", crp: "", phone: "", email: "", loginUsername: "", loginPassword: "" });
  };

  const handleDelete = (doc: DoctorProfile) => {
    deleteDoctor(doc.id);
    addLog({ action: "Médico removido", details: `Dr(a). ${doc.name}`, performedBy: user!.username });
    toast.success("Médico removido.");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">Gestão de Médicos</h2>
            <p className="text-sm text-muted-foreground">{filtered.length} médico(s) cadastrado(s)</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar..." className="pl-9 pr-4 py-2 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring w-48" />
            </div>
            <Button onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", specialty: "", crp: "", phone: "", email: "", loginUsername: "", loginPassword: "" }); }}>
              <Plus className="h-4 w-4 mr-1" /> Novo Médico
            </Button>
          </div>
        </div>

        {(showForm || editingId) && (
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4 animate-fade-in">
            <h3 className="font-heading font-bold text-foreground">{editingId ? "Editar Médico" : "Cadastrar Novo Médico"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Nome completo *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Dr(a). Nome" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Especialidade *</label>
                <input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Fonoaudiologia, Psicologia..." />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">CRP / CRFa</label>
                <input value={form.crp} onChange={(e) => setForm({ ...form, crp: maskCRP(e.target.value) })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="CRP 00/00000" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Telefone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="(00) 00000-0000" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">E-mail</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="email@exemplo.com" />
              </div>
              {!editingId && (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Usuário de login *</label>
                    <input value={form.loginUsername} onChange={(e) => setForm({ ...form, loginUsername: e.target.value })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="usuario.login" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Senha inicial *</label>
                    <input type="password" value={form.loginPassword} onChange={(e) => setForm({ ...form, loginPassword: e.target.value })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Mínimo 6 caracteres" />
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={editingId ? handleUpdate : handleAdd}>
                <Save className="h-4 w-4 mr-1" /> {editingId ? "Salvar" : "Cadastrar"}
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                <XCircle className="h-4 w-4 mr-1" /> Cancelar
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-10 text-center">
              <Stethoscope className="h-14 w-14 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Nenhum médico encontrado.</p>
            </div>
          ) : (
            filtered.map((doc) => (
              <div key={doc.id} className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Stethoscope className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">Dr(a). {doc.name}</p>
                    <p className="text-sm text-muted-foreground">{doc.specialty} {doc.crp && `• ${doc.crp}`}</p>
                    <p className="text-xs text-muted-foreground">{doc.email} {doc.phone && `• ${doc.phone}`}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Login: <span className="font-mono text-foreground">{doc.loginUsername}</span></p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${
                    doc.status === "ativo" ? "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]" : "bg-destructive/10 text-destructive"
                  }`}>
                    {doc.status}
                  </span>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => navigate(`/admin/suporte?doctor=${doc.loginUsername}`)} className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors" title="Chat com médico">
                      <MessageCircle className="h-4 w-4" />
                    </button>
                    <button onClick={() => { setEditingId(doc.id); setShowForm(false); setForm({ name: doc.name, specialty: doc.specialty, crp: doc.crp, phone: doc.phone, email: doc.email, loginUsername: doc.loginUsername, loginPassword: "" }); }} className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => updateDoctor(doc.id, { status: doc.status === "ativo" ? "inativo" : "ativo" })} className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title={doc.status === "ativo" ? "Desativar" : "Ativar"}>
                      {doc.status === "ativo" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </button>
                    <button onClick={() => handleDelete(doc)} className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
