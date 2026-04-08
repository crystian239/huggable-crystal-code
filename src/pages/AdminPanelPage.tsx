import { useState, useMemo } from "react";
import { useAdminStore, DoctorProfile } from "@/data/adminStore";
import { useAuthStore, SUPER_ADMIN_CPF } from "@/data/authStore";
import { useClinicStore } from "@/data/clinicStore";
import { useTeleconsultaStore } from "@/data/teleconsultaStore";
import { useSupportStore } from "@/data/supportStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { maskPhone, maskCRP, maskCPF } from "@/lib/masks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Shield, Users, UserPlus, Stethoscope, ClipboardList, Settings, LogOut,
  Check, X, Search, Eye, EyeOff, ChevronDown, ChevronRight, Activity,
  Calendar, DollarSign, FileText, Bell, BarChart3, UserCheck, UserX,
  Plus, Edit, Trash2, Save, XCircle, Home, Menu, Sparkles, Headphones,
  MessageCircle, Send, Building2
} from "lucide-react";

type AdminTab = "dashboard" | "doctors" | "patients" | "registrations" | "allusers" | "logs" | "support" | "clinic" | "settings";

export default function AdminPanelPage() {
  const { user, isAuthenticated, logout, addUser, users } = useAuthStore();
  const { doctors, pendingRegistrations, logs, addDoctor, updateDoctor, deleteDoctor, approveRegistration, rejectRegistration, addLog } = useAdminStore();
  const clinicStore = useClinicStore();
  const teleconsultaStore = useTeleconsultaStore();
  const supportStore = useSupportStore();

  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Doctor form
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<string | null>(null);
  const [doctorForm, setDoctorForm] = useState({ name: "", specialty: "", crp: "", phone: "", email: "", loginUsername: "", loginPassword: "" });

  // Reject modal
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  // New patient form in registrations
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({ name: "", cpf: "", phone: "", email: "", birthDate: "" });
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);

  // Chat with doctors
  const [chatDoctor, setChatDoctor] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");

  // Check super admin by CPF
  const isSuperAdmin = isAuthenticated && user?.role === "admin" && user?.cpf === SUPER_ADMIN_CPF;

  // Messages for doctor chat (must be before early return)
  const doctorMessages = useMemo(() => {
    if (!chatDoctor) return [];
    return clinicStore.messages.filter(
      (m) => (m.from === "admin" && m.to === chatDoctor) || (m.from === chatDoctor && m.to === "admin")
    ).sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  }, [chatDoctor, clinicStore.messages]);

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-card rounded-3xl border border-border p-10 text-center max-w-md w-full shadow-xl">
          <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Acesso Restrito</h1>
          <p className="text-muted-foreground text-sm mb-4">
            Este painel é exclusivo do administrador principal.
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            Apenas o CPF autorizado pode acessar este controle.
          </p>
          <Button onClick={() => window.location.href = "/login"} className="w-full">
            Ir para Login
          </Button>
        </div>
      </div>
    );
  }

  const totalPatients = clinicStore.patients.length;
  const totalAccounts = teleconsultaStore.patientAccounts.length;
  const totalAppointments = clinicStore.appointments.length;
  const totalDoctors = doctors.length;
  const pendingCount = pendingRegistrations.filter((r) => r.status === "pendente").length;
  const totalRevenue = clinicStore.payments.filter((p) => p.status === "pago").reduce((s, p) => s + p.amount, 0);
  const supportTickets = supportStore.tickets || [];
  const openTickets = supportTickets.filter((t: any) => t.status === "open" || t.status === "pending").length;

  const handleAddDoctor = () => {
    if (!doctorForm.name || !doctorForm.specialty || !doctorForm.loginUsername || !doctorForm.loginPassword) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    if (doctorForm.loginPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    const loginCreated = addUser(doctorForm.loginUsername, doctorForm.loginPassword, "doctor");
    if (!loginCreated) {
      toast.error("Nome de usuário já existe.");
      return;
    }

    const docId = addDoctor({
      name: doctorForm.name,
      specialty: doctorForm.specialty,
      crp: doctorForm.crp,
      phone: doctorForm.phone,
      email: doctorForm.email,
      status: "ativo",
      loginUsername: doctorForm.loginUsername,
    });

    const currentDoctors = clinicStore.settings.doctors || [];
    if (!currentDoctors.includes(doctorForm.name)) {
      clinicStore.updateSettings({ doctors: [...currentDoctors, doctorForm.name] });
    }

    addLog({ action: "Médico cadastrado", details: `Dr(a). ${doctorForm.name} - ${doctorForm.specialty}`, performedBy: user!.username });
    toast.success("Médico cadastrado com sucesso!");
    setDoctorForm({ name: "", specialty: "", crp: "", phone: "", email: "", loginUsername: "", loginPassword: "" });
    setShowDoctorForm(false);
  };

  const handleUpdateDoctor = () => {
    if (!editingDoctor || !doctorForm.name) return;
    updateDoctor(editingDoctor, {
      name: doctorForm.name,
      specialty: doctorForm.specialty,
      crp: doctorForm.crp,
      phone: doctorForm.phone,
      email: doctorForm.email,
    });
    addLog({ action: "Médico atualizado", details: `Dr(a). ${doctorForm.name}`, performedBy: user!.username });
    toast.success("Médico atualizado!");
    setEditingDoctor(null);
    setDoctorForm({ name: "", specialty: "", crp: "", phone: "", email: "", loginUsername: "", loginPassword: "" });
  };

  const handleDeleteDoctor = (doc: DoctorProfile) => {
    deleteDoctor(doc.id);
    addLog({ action: "Médico removido", details: `Dr(a). ${doc.name}`, performedBy: user!.username });
    toast.success("Médico removido.");
  };

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

  const handleSendChat = () => {
    if (!chatMessage.trim() || !chatDoctor) return;
    clinicStore.addMessage({
      from: "admin",
      to: chatDoctor,
      content: chatMessage.trim(),
      date: new Date().toISOString(),
      read: false,
    });
    setChatMessage("");
    toast.success("Mensagem enviada!");
  };

  const allUsers = users;
  const allPatientAccounts = teleconsultaStore.patientAccounts;

  const tabs: { id: AdminTab; label: string; icon: typeof Shield; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "doctors", label: "Médicos", icon: Stethoscope, badge: totalDoctors },
    { id: "patients", label: "Pacientes", icon: Users, badge: totalPatients },
    { id: "registrations", label: "Cadastros", icon: UserPlus, badge: pendingCount },
    { id: "allusers", label: "Todos Cadastrados", icon: Eye, badge: allUsers.length + allPatientAccounts.length },
    { id: "support", label: "Suporte", icon: Headphones, badge: openTickets },
    { id: "clinic", label: "Clínica", icon: Building2 },
    { id: "logs", label: "Atividades", icon: ClipboardList },
    { id: "settings", label: "Configurações", icon: Settings },
  ];

  const filteredDoctors = doctors.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPatients = clinicStore.patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cpf.includes(searchTerm)
  );

  const filteredRegistrations = pendingRegistrations.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cpf.includes(searchTerm)
  );




  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-72" : "w-16"} bg-card border-r border-border flex flex-col transition-all duration-300 shrink-0 fixed h-full z-40`}>
        <div className="p-4 border-b border-border flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors shrink-0">
            <Shield className="h-5 w-5" />
          </button>
          {sidebarOpen && (
            <div className="min-w-0">
              <h1 className="font-heading font-bold text-foreground text-sm truncate">Controle Total</h1>
              <p className="text-xs text-muted-foreground truncate">CPF: {user!.cpf}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchTerm(""); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left truncate">{tab.label}</span>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-2 border-t border-border space-y-1">
          <button
            onClick={() => window.location.href = "/dashboard"}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>Painel Clínico</span>}
          </button>
          <button
            onClick={() => { logout(); window.location.href = "/login"; }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? "ml-72" : "ml-16"} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-heading font-bold text-foreground">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h2>
            <p className="text-xs text-muted-foreground">Administrador Principal • Acesso Exclusivo</p>
          </div>
          {["doctors", "patients", "registrations", "allusers", "logs"].includes(activeTab) && (
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
        </header>

        <div className="p-6 space-y-6">
          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Médicos", value: totalDoctors, icon: Stethoscope, color: "text-primary", bg: "bg-primary/10" },
                  { label: "Pacientes", value: totalPatients, icon: Users, color: "text-[hsl(200,70%,50%)]", bg: "bg-[hsl(200,70%,50%)]/10" },
                  { label: "Cadastros Pendentes", value: pendingCount, icon: UserPlus, color: "text-[hsl(40,90%,50%)]", bg: "bg-[hsl(40,90%,50%)]/10" },
                  { label: "Contas Ativas", value: totalAccounts, icon: UserCheck, color: "text-[hsl(142,70%,45%)]", bg: "bg-[hsl(142,70%,45%)]/10" },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                      if (stat.label === "Médicos") setActiveTab("doctors");
                      if (stat.label === "Pacientes") setActiveTab("patients");
                      if (stat.label === "Cadastros Pendentes") setActiveTab("registrations");
                    }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                      </div>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Resumo Geral
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Total de Consultas", value: totalAppointments, icon: Calendar },
                      { label: "Receita Total", value: `R$ ${totalRevenue.toFixed(2)}`, icon: DollarSign },
                      { label: "Prontuários", value: clinicStore.records.length, icon: FileText },
                      { label: "Chamados Suporte", value: supportTickets.length, icon: Headphones },
                      { label: "Notificações", value: clinicStore.notifications.length, icon: Bell },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{item.label}</span>
                          </div>
                          <span className="font-semibold text-foreground">{item.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    Últimos Cadastros
                  </h3>
                  {pendingRegistrations.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Nenhum cadastro ainda.</p>
                  ) : (
                    <div className="space-y-3">
                      {pendingRegistrations.slice(-5).reverse().map((reg) => (
                        <div key={reg.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            reg.status === "pendente" ? "bg-[hsl(40,90%,50%)]/10 text-[hsl(40,90%,50%)]" :
                            reg.status === "aprovado" ? "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]" :
                            "bg-destructive/10 text-destructive"
                          }`}>
                            {reg.status === "pendente" ? "⏳" : reg.status === "aprovado" ? "✓" : "✕"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{reg.name}</p>
                            <p className="text-xs text-muted-foreground">{reg.cpf}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            reg.status === "pendente" ? "bg-[hsl(40,90%,50%)]/10 text-[hsl(40,90%,50%)]" :
                            reg.status === "aprovado" ? "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]" :
                            "bg-destructive/10 text-destructive"
                          }`}>
                            {reg.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Equipe Médica
                  </h3>
                  {doctors.length === 0 ? (
                    <div className="text-center py-6">
                      <Stethoscope className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Nenhum médico cadastrado.</p>
                      <Button size="sm" className="mt-3" onClick={() => { setActiveTab("doctors"); setShowDoctorForm(true); }}>
                        <Plus className="h-4 w-4 mr-1" /> Cadastrar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {doctors.slice(0, 5).map((doc) => (
                        <div key={doc.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Stethoscope className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">Dr(a). {doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.specialty}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            doc.status === "ativo" ? "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]" : "bg-destructive/10 text-destructive"
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DOCTORS */}
          {activeTab === "doctors" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{filteredDoctors.length} médico(s) encontrado(s)</p>
                <Button onClick={() => { setShowDoctorForm(true); setEditingDoctor(null); setDoctorForm({ name: "", specialty: "", crp: "", phone: "", email: "", loginUsername: "", loginPassword: "" }); }}>
                  <Plus className="h-4 w-4 mr-1" /> Novo Médico
                </Button>
              </div>

              {(showDoctorForm || editingDoctor) && (
                <div className="bg-card rounded-2xl border border-border p-6 space-y-4 animate-fade-in">
                  <h3 className="font-heading font-bold text-foreground">
                    {editingDoctor ? "Editar Médico" : "Cadastrar Novo Médico"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Nome completo *</label>
                      <input value={doctorForm.name} onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Dr(a). Nome" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Especialidade *</label>
                      <input value={doctorForm.specialty} onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Fonoaudiologia, Psicologia..." />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">CRP / CRFa</label>
                      <input value={doctorForm.crp} onChange={(e) => setDoctorForm({ ...doctorForm, crp: maskCRP(e.target.value) })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="CRP 00/00000" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Telefone</label>
                      <input value={doctorForm.phone} onChange={(e) => setDoctorForm({ ...doctorForm, phone: maskPhone(e.target.value) })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="(00) 00000-0000" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">E-mail</label>
                      <input value={doctorForm.email} onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="email@exemplo.com" />
                    </div>
                    {!editingDoctor && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">Usuário de login *</label>
                          <input value={doctorForm.loginUsername} onChange={(e) => setDoctorForm({ ...doctorForm, loginUsername: e.target.value })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="usuario.login" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">Senha inicial *</label>
                          <input type="password" value={doctorForm.loginPassword} onChange={(e) => setDoctorForm({ ...doctorForm, loginPassword: e.target.value })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Mínimo 6 caracteres" />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={editingDoctor ? handleUpdateDoctor : handleAddDoctor}>
                      <Save className="h-4 w-4 mr-1" /> {editingDoctor ? "Salvar" : "Cadastrar"}
                    </Button>
                    <Button variant="outline" onClick={() => { setShowDoctorForm(false); setEditingDoctor(null); }}>
                      <XCircle className="h-4 w-4 mr-1" /> Cancelar
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {filteredDoctors.length === 0 ? (
                  <div className="bg-card rounded-2xl border border-border p-10 text-center">
                    <Stethoscope className="h-14 w-14 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Nenhum médico encontrado.</p>
                  </div>
                ) : (
                  filteredDoctors.map((doc) => (
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
                          <button
                            onClick={() => { setChatDoctor(doc.loginUsername); setActiveTab("support"); }}
                            className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                            title="Chat com médico"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingDoctor(doc.id);
                              setShowDoctorForm(false);
                              setDoctorForm({ name: doc.name, specialty: doc.specialty, crp: doc.crp, phone: doc.phone, email: doc.email, loginUsername: doc.loginUsername, loginPassword: "" });
                            }}
                            className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => updateDoctor(doc.id, { status: doc.status === "ativo" ? "inativo" : "ativo" })}
                            className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            title={doc.status === "ativo" ? "Desativar" : "Ativar"}
                          >
                            {doc.status === "ativo" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteDoctor(doc)}
                            className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* PATIENTS */}
          {activeTab === "patients" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{filteredPatients.length} paciente(s) cadastrado(s) na clínica</p>
              </div>
              <div className="space-y-3">
                {filteredPatients.length === 0 ? (
                  <div className="bg-card rounded-2xl border border-border p-10 text-center">
                    <Users className="h-14 w-14 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Nenhum paciente encontrado.</p>
                  </div>
                ) : (
                  filteredPatients.map((patient) => {
                    const account = teleconsultaStore.patientAccounts.find((a) => a.patientId === patient.id);
                    const appts = clinicStore.appointments.filter((a) => a.patientId === patient.id);
                    return (
                      <div key={patient.id} className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-[hsl(200,70%,50%)]/10 flex items-center justify-center shrink-0">
                            <Users className="h-6 w-6 text-[hsl(200,70%,50%)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground">{patient.name}</p>
                            <p className="text-sm text-muted-foreground">CPF: {patient.cpf} • {patient.phone}</p>
                            <p className="text-xs text-muted-foreground">{patient.email}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">{appts.length} consulta(s)</p>
                            {account ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)] font-medium">Portal ativo</span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-muted-foreground font-medium">Sem conta</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* REGISTRATIONS - All accounts + pending + add new */}
          {activeTab === "registrations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-muted-foreground">
                  {teleconsultaStore.patientAccounts.length} conta(s) ativa(s) • {pendingRegistrations.filter((r) => r.status === "pendente").length} pendente(s)
                </p>
                <Button size="sm" onClick={() => { setShowNewPatientForm(true); setNewPatientForm({ name: "", cpf: "", phone: "", email: "", birthDate: "" }); }}>
                  <Plus className="h-4 w-4 mr-1" /> Novo Cadastro
                </Button>
              </div>

              {/* New patient form */}
              {showNewPatientForm && (
                <div className="bg-card rounded-2xl border border-border p-6 space-y-4 animate-fade-in">
                  <h3 className="font-heading font-bold text-foreground flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" /> Cadastrar Novo Paciente
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Nome completo *</label>
                      <input value={newPatientForm.name} onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Nome do paciente" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">CPF *</label>
                      <input value={newPatientForm.cpf} onChange={(e) => setNewPatientForm({ ...newPatientForm, cpf: maskCPF(e.target.value) })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="000.000.000-00" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Telefone</label>
                      <input value={newPatientForm.phone} onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: maskPhone(e.target.value) })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="(00) 00000-0000" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                      <input value={newPatientForm.email} onChange={(e) => setNewPatientForm({ ...newPatientForm, email: e.target.value })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="email@exemplo.com" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Data de Nascimento</label>
                      <input type="date" value={newPatientForm.birthDate} onChange={(e) => setNewPatientForm({ ...newPatientForm, birthDate: e.target.value })} className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => {
                      if (!newPatientForm.name || !newPatientForm.cpf) {
                        toast.error("Nome e CPF são obrigatórios.");
                        return;
                      }
                      const cpfClean = newPatientForm.cpf.replace(/\D/g, "");
                      if (cpfClean.length < 11) {
                        toast.error("CPF inválido.");
                        return;
                      }
                      if (teleconsultaStore.patientAccounts.some((a) => a.cpf.replace(/\D/g, "") === cpfClean)) {
                        toast.error("Este CPF já possui cadastro.");
                        return;
                      }
                      // Add to clinic patients
                      const patientId = clinicStore.addPatient({
                        name: newPatientForm.name,
                        cpf: newPatientForm.cpf,
                        phone: newPatientForm.phone,
                        email: newPatientForm.email,
                        birthDate: newPatientForm.birthDate,
                        address: "",
                        notes: "",
                      });
                      // Create portal access
                      teleconsultaStore.registerPatient({
                        patientId,
                        name: newPatientForm.name,
                        email: newPatientForm.email,
                        phone: newPatientForm.phone,
                        cpf: newPatientForm.cpf,
                        birthDate: newPatientForm.birthDate,
                        password: "123456789",
                        avatar: "",
                      });
                      addLog({ action: "Paciente cadastrado", details: `${newPatientForm.name} (CPF: ${newPatientForm.cpf})`, performedBy: user!.username });
                      toast.success(`${newPatientForm.name} cadastrado com acesso ao portal! Senha padrão: 123456789`);
                      setShowNewPatientForm(false);
                      setNewPatientForm({ name: "", cpf: "", phone: "", email: "", birthDate: "" });
                    }}>
                      <Save className="h-4 w-4 mr-1" /> Cadastrar
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewPatientForm(false)}>
                      <XCircle className="h-4 w-4 mr-1" /> Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {/* Pending registrations */}
              {pendingRegistrations.filter((r) => r.status === "pendente").length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-[hsl(40,90%,50%)]" />
                    Pendentes ({pendingRegistrations.filter((r) => r.status === "pendente").length})
                  </h3>
                  {pendingRegistrations.filter((r) => r.status === "pendente").map((reg) => (
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
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" onClick={() => handleApprove(reg.id, reg.name)} className="bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)]">
                            <Check className="h-4 w-4 mr-1" /> Aprovar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setRejectModal(reg.id)}>
                            <X className="h-4 w-4 mr-1" /> Rejeitar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* All active accounts */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-[hsl(142,70%,45%)]" />
                  Contas com Acesso ({teleconsultaStore.patientAccounts.filter((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.cpf.includes(searchTerm)).length})
                </h3>
                {teleconsultaStore.patientAccounts.filter((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.cpf.includes(searchTerm)).length === 0 ? (
                  <div className="bg-card rounded-2xl border border-border p-10 text-center">
                    <Users className="h-14 w-14 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Nenhuma conta cadastrada.</p>
                    <p className="text-xs text-muted-foreground mt-1">Clique em "Novo Cadastro" para adicionar.</p>
                  </div>
                ) : (
                  teleconsultaStore.patientAccounts
                    .filter((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.cpf.includes(searchTerm))
                    .map((acc) => (
                    <div key={acc.id} className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-[hsl(142,70%,45%)]/10 flex items-center justify-center shrink-0">
                          <UserCheck className="h-6 w-6 text-[hsl(142,70%,45%)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">{acc.name}</p>
                          <p className="text-sm text-muted-foreground">CPF: {acc.cpf} {acc.email && `• ${acc.email}`} {acc.phone && `• ${acc.phone}`}</p>
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
                              <Button size="sm" variant="destructive" onClick={() => {
                                teleconsultaStore.removePatientAccount(acc.id);
                                addLog({ action: "Acesso removido", details: `${acc.name} (CPF: ${acc.cpf})`, performedBy: user!.username });
                                toast.success(`Acesso de ${acc.name} removido.`);
                                setRemoveConfirm(null);
                              }}>
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

              {/* Past registrations (approved/rejected) */}
              {pendingRegistrations.filter((r) => r.status !== "pendente").length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    Histórico de Solicitações ({pendingRegistrations.filter((r) => r.status !== "pendente").length})
                  </h3>
                  {pendingRegistrations.filter((r) => r.status !== "pendente").map((reg) => (
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
          )}

          {/* ALL REGISTERED USERS */}
          {activeTab === "allusers" && (
            <div className="space-y-6">
              {/* System Users (authStore) */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Usuários do Sistema ({allUsers.filter((u) => u.username.toLowerCase().includes(searchTerm.toLowerCase()) || (u.cpf || "").includes(searchTerm)).length})
                </h3>
                {allUsers
                  .filter((u) => u.username.toLowerCase().includes(searchTerm.toLowerCase()) || (u.cpf || "").includes(searchTerm))
                  .map((u) => (
                  <div key={u.id} className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${
                        u.role === "admin" ? "bg-primary/10" : u.role === "doctor" ? "bg-[hsl(200,70%,50%)]/10" : "bg-accent"
                      }`}>
                        <span className="text-lg font-bold text-primary">{u.username[0]?.toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">{u.username}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                          {u.cpf && <span className="text-xs text-muted-foreground">CPF: {u.cpf}</span>}
                          <span className="text-xs text-muted-foreground">ID: {u.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${
                        u.role === "admin" ? "bg-primary/10 text-primary" :
                        u.role === "doctor" ? "bg-[hsl(200,70%,50%)]/10 text-[hsl(200,70%,50%)]" :
                        "bg-accent text-muted-foreground"
                      }`}>
                        {u.role === "admin" ? "Administrador" : u.role === "doctor" ? "Médico" : "Recepcionista"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Patient Accounts (teleconsultaStore) */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-[hsl(142,70%,45%)]" />
                  Contas de Pacientes no Portal ({allPatientAccounts.filter((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.cpf.includes(searchTerm)).length})
                </h3>
                {allPatientAccounts
                  .filter((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.cpf.includes(searchTerm))
                  .length === 0 ? (
                  <div className="bg-card rounded-2xl border border-border p-10 text-center">
                    <Users className="h-14 w-14 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Nenhuma conta de paciente registrada.</p>
                  </div>
                ) : (
                  allPatientAccounts
                    .filter((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.cpf.includes(searchTerm))
                    .map((acc) => (
                    <div key={acc.id} className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-[hsl(142,70%,45%)]/10 flex items-center justify-center shrink-0">
                          <span className="text-lg font-bold text-[hsl(142,70%,45%)]">{acc.name[0]?.toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">{acc.name}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            <span className="text-xs text-muted-foreground">CPF: {acc.cpf}</span>
                            {acc.email && <span className="text-xs text-muted-foreground">Email: {acc.email}</span>}
                            {acc.phone && <span className="text-xs text-muted-foreground">Tel: {acc.phone}</span>}
                            {acc.birthDate && <span className="text-xs text-muted-foreground">Nasc: {acc.birthDate}</span>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Cadastrado em {format(new Date(acc.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full font-medium shrink-0 bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]">
                          Paciente
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SUPPORT & CHAT */}
          {activeTab === "support" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
              {/* Doctor list for chat */}
              <div className="bg-card rounded-2xl border border-border flex flex-col">
                <div className="p-4 border-b border-border">
                  <h3 className="font-heading font-bold text-foreground text-sm flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    Chat com Médicos
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {doctors.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Nenhum médico cadastrado.</p>
                  ) : (
                    doctors.map((doc) => {
                      const unread = clinicStore.messages.filter(
                        (m) => m.from === doc.loginUsername && m.to === "admin" && !m.read
                      ).length;
                      return (
                        <button
                          key={doc.id}
                          onClick={() => setChatDoctor(doc.loginUsername)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left ${
                            chatDoctor === doc.loginUsername
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-accent"
                          }`}
                        >
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Stethoscope className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">Dr(a). {doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.specialty}</p>
                          </div>
                          {unread > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-[1.25rem] flex items-center justify-center px-1 font-bold">
                              {unread}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Support tickets summary */}
                <div className="p-4 border-t border-border">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Chamados de Suporte</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Abertos</span>
                    <span className="font-bold text-foreground">{openTickets}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold text-foreground">{supportTickets.length}</span>
                  </div>
                </div>
              </div>

              {/* Chat area */}
              <div className="lg:col-span-2 bg-card rounded-2xl border border-border flex flex-col">
                {!chatDoctor ? (
                  <div className="flex-1 flex items-center justify-center text-center p-6">
                    <div>
                      <MessageCircle className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                      <h3 className="font-heading font-bold text-foreground mb-2">Central de Comunicação</h3>
                      <p className="text-sm text-muted-foreground">Selecione um médico para iniciar a conversa.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-4 border-b border-border flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <Stethoscope className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Dr(a). {doctors.find((d) => d.loginUsername === chatDoctor)?.name || chatDoctor}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {doctors.find((d) => d.loginUsername === chatDoctor)?.specialty}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                      {doctorMessages.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-10">Nenhuma mensagem ainda. Inicie a conversa!</p>
                      ) : (
                        doctorMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.from === "admin" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                              msg.from === "admin"
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-accent text-foreground rounded-bl-md"
                            }`}>
                              <p>{msg.content}</p>
                              {msg.date && (
                                <p className={`text-[10px] mt-1 ${msg.from === "admin" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                                  {format(new Date(msg.date), "dd/MM HH:mm", { locale: ptBR })}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-4 border-t border-border flex gap-2">
                      <input
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 border border-input bg-background rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                      <Button onClick={handleSendChat} disabled={!chatMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* CLINIC */}
          {activeTab === "clinic" && (
            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Informações da Clínica
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-accent/50 rounded-xl p-4">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Nome</span>
                    <p className="font-medium text-foreground mt-1">{clinicStore.settings.name}</p>
                  </div>
                  <div className="bg-accent/50 rounded-xl p-4">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Telefone</span>
                    <p className="font-medium text-foreground mt-1">{clinicStore.settings.phone || "—"}</p>
                  </div>
                  <div className="bg-accent/50 rounded-xl p-4">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">E-mail</span>
                    <p className="font-medium text-foreground mt-1">{clinicStore.settings.email || "—"}</p>
                  </div>
                  <div className="bg-accent/50 rounded-xl p-4">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">CNPJ</span>
                    <p className="font-medium text-foreground mt-1">{clinicStore.settings.cnpj || "—"}</p>
                  </div>
                  <div className="bg-accent/50 rounded-xl p-4 sm:col-span-2">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Endereço</span>
                    <p className="font-medium text-foreground mt-1">{clinicStore.settings.address || "—"}</p>
                  </div>
                  <div className="bg-accent/50 rounded-xl p-4 sm:col-span-2">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Médicos</span>
                    <p className="font-medium text-foreground mt-1">{clinicStore.settings.doctors?.join(", ") || "—"}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Painel Clínico (Médicos)", href: "/dashboard", icon: Stethoscope, desc: "Área dos médicos para gerenciar consultas e pacientes" },
                  { label: "Portal do Paciente", href: "/portal-paciente", icon: Users, desc: "Portal de acesso dos pacientes" },
                  { label: "Painel Admin", href: "/admin", icon: Shield, desc: "Administração geral (esta página)" },
                ].map((link) => {
                  const Icon = link.icon;
                  return (
                    <a key={link.href} href={link.href} className="block bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-shadow group">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground text-sm">{link.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{link.desc}</p>
                      <p className="text-xs text-primary mt-2 group-hover:underline">{window.location.origin}{link.href}</p>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* LOGS */}
          {activeTab === "logs" && (
            <div className="space-y-3">
              {logs.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-10 text-center">
                  <ClipboardList className="h-14 w-14 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Nenhuma atividade registrada.</p>
                </div>
              ) : (
                [...logs].reverse().filter((l) =>
                  !searchTerm || l.action.toLowerCase().includes(searchTerm.toLowerCase()) || l.details.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((log) => (
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
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Usuários do Sistema
                </h3>
                <div className="space-y-3">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center gap-3 py-3 px-4 rounded-xl bg-accent/50 border border-border/50">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        u.role === "admin" ? "bg-primary/10" : u.role === "doctor" ? "bg-[hsl(200,70%,50%)]/10" : "bg-accent"
                      }`}>
                        {u.role === "admin" ? <Shield className="h-5 w-5 text-primary" /> :
                         u.role === "doctor" ? <Stethoscope className="h-5 w-5 text-[hsl(200,70%,50%)]" /> :
                         <Users className="h-5 w-5 text-muted-foreground" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{u.username}</p>
                        <p className="text-xs text-muted-foreground capitalize">{u.role === "admin" ? "Administrador" : u.role === "doctor" ? "Médico" : "Recepcionista"}</p>
                      </div>
                      {u.role === "admin" && (
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">Super Admin</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Segurança
                </h3>
                <div className="bg-accent/50 rounded-xl p-4 text-sm">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">CPF Administrador:</strong> {SUPER_ADMIN_CPF}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Apenas este CPF tem acesso ao painel de controle total. O login pode ser feito pelo CPF ou pelo usuário "admin".
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md space-y-4 animate-fade-in">
            <h3 className="font-heading font-bold text-foreground flex items-center gap-2">
              <UserX className="h-5 w-5 text-destructive" />
              Rejeitar Cadastro
            </h3>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Motivo (opcional)</label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none h-24"
                placeholder="Informe o motivo da rejeição..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setRejectModal(null); setRejectNote(""); }}>Cancelar</Button>
              <Button variant="destructive" onClick={handleReject}>Confirmar Rejeição</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
