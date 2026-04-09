import { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Calendar, DollarSign, FileText, Settings, LogOut, Menu, X,
  ClipboardList, MessageCircle, Cake, Bell, Video, Headphones, FileCheck, ListChecks, Receipt, Megaphone, Sparkles, BookOpen, Radio,
  Shield, Stethoscope, UserPlus, Building2
} from "lucide-react";
import clinicLogo from "@/assets/clinic-logo.png";
import { useClinicStore } from "@/data/clinicStore";
import { useAuthStore, SUPER_ADMIN_CPF } from "@/data/authStore";
import { useTeleconsultaStore } from "@/data/teleconsultaStore";
import { useSupportStore } from "@/data/supportStore";
import { useLiveStore } from "@/data/liveStore";
import { useNotificationSounds } from "@/hooks/useNotificationSounds";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const clinicNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Pacientes", path: "/pacientes", icon: Users },
  { label: "Agenda", path: "/agenda", icon: Calendar },
  { label: "Financeiro", path: "/financeiro", icon: DollarSign },
  { label: "Prontuários", path: "/prontuarios", icon: ClipboardList },
  { label: "Recibos", path: "/recibos", icon: FileText },
  { label: "Mensagens", path: "/mensagens", icon: MessageCircle },
  { label: "Suporte Pacientes", path: "/suporte", icon: Headphones },
  { label: "Teleconsulta", path: "/teleconsulta", icon: Video },
  { label: "Live", path: "/live", icon: Radio },
  { label: "Atestados", path: "/atestados", icon: FileCheck },
  { label: "Atividades", path: "/atividades", icon: ListChecks },
  { label: "Notas Fiscais", path: "/notas-fiscais", icon: Receipt },
  { label: "Avisos Pacientes", path: "/avisos", icon: Megaphone },
  { label: "Aniversários", path: "/aniversarios", icon: Cake },
  { label: "Tutorial", path: "/tutorial", icon: BookOpen },
];

const adminOnlyNavItems = [
  { label: "Configurações", path: "/configuracoes", icon: Settings },
];

const adminNavItems = [
  { label: "Gestão Médicos", path: "/admin/medicos", icon: Stethoscope },
  { label: "Cadastros", path: "/admin/cadastros", icon: UserPlus },
  { label: "Chat com Médicos", path: "/admin/suporte", icon: Headphones },
  { label: "Clínica", path: "/admin/clinica", icon: Building2 },
  { label: "Logs de Auditoria", path: "/admin/logs", icon: ClipboardList },
  { label: "Usuários Sistema", path: "/admin/usuarios", icon: Shield },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  useNotificationSounds();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const settings = useClinicStore((s) => s.settings);
  const authUser = useAuthStore((s) => s.user);
  const messages = useClinicStore((s) => s.messages);
  const patients = useClinicStore((s) => s.patients);
  const clinicNotifications = useClinicStore((s) => s.notifications);
  const markNotificationRead = useClinicStore((s) => s.markNotificationRead);
  const unreadCount = useMemo(() => messages.filter((m) => !m.read && m.to === "admin").length, [messages]);
  const patientMessages = useTeleconsultaStore((s) => s.patientMessages);
  const unreadPatientMsgCount = useMemo(() => patientMessages.filter((m) => m.sender === "patient" && !m.read).length, [patientMessages]);
  const supportTickets = useSupportStore((s) => s.tickets);
  const supportMsgs = useSupportStore((s) => s.messages);
  const unreadSupportCount = useMemo(() => {
    const openTicketIds = supportTickets.filter((t) => t.status !== "fechado").map((t) => t.id);
    return supportMsgs.filter((m) => openTicketIds.includes(m.ticketId) && m.sender === "patient").length;
  }, [supportTickets, supportMsgs]);
  const totalMsgBadge = unreadCount + unreadPatientMsgCount;
  const unreadNotifCount = useMemo(() => clinicNotifications.filter((n) => !n.read).length, [clinicNotifications]);
  const recentNotifs = useMemo(() => [...clinicNotifications].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10), [clinicNotifications]);
  const birthdays = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    return patients.filter((p) => {
      if (!p.birthDate) return false;
      return new Date(p.birthDate + "T00:00:00").getMonth() === month;
    }).map((p) => {
      const birth = new Date(p.birthDate + "T00:00:00");
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return { ...p, age: age + 1 };
    });
  }, [patients]);
  const todayBirthdays = useMemo(() => birthdays.filter((b) => new Date(b.birthDate + "T00:00:00").getDate() === new Date().getDate()), [birthdays]);
  const totalNotifs = unreadCount + todayBirthdays.length + unreadNotifCount + unreadPatientMsgCount + unreadSupportCount;

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isSuperAdmin = user?.role === "admin" && user?.cpf === SUPER_ADMIN_CPF;

  // For doctors, add "Chat com Admin" item; for admin, add admin nav items
  const navItems = useMemo(() => {
    const items = [...clinicNavItems];
    if (!isSuperAdmin) {
      // Doctors get "Chat com Admin" after Teleconsulta
      const teleIdx = items.findIndex((i) => i.path === "/teleconsulta");
      items.splice(teleIdx + 1, 0, { label: "Chat com Admin", path: "/chat-admin", icon: Headphones });
    }
    if (isSuperAdmin) {
      // Admin gets Configurações
      items.push(...adminOnlyNavItems);
    }
    return items;
  }, [isSuperAdmin]);

  const handleLogout = () => {
    logout();
    navigate("/portal-paciente");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - enchanted dark */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-[60] w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
          <div className="relative">
            <div className="absolute -inset-1 rounded-lg magic-gradient opacity-30 blur-sm" />
            <img src={settings.logo || clinicLogo} alt="Logo" className="h-12 w-12 rounded-lg object-contain bg-sidebar-accent p-1 relative" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-heading font-semibold truncate text-sidebar-foreground">{settings.name}</h1>
            <p className="text-[11px] text-sidebar-foreground/50 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-magic-gold" /> Painel Mágico
            </p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground/60">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path + "/"));
            const badge = item.path === "/mensagens" ? totalMsgBadge
              : item.path === "/suporte" ? unreadSupportCount
              : item.path === "/aniversarios" ? todayBirthdays.length
              : 0;
            const hasActiveLive = item.path === "/live" && useLiveStore.getState().sessions.some((s) => s.status === "ao_vivo");
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 nav-magic ${
                  active
                    ? "magic-gradient text-sidebar-primary-foreground font-medium shadow-md"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <div className="relative shrink-0">
                  <item.icon className={`h-4 w-4 transition-transform duration-200 ${active ? "" : "group-hover:scale-110"}`} />
                  {hasActiveLive && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-destructive rounded-full animate-ping" />
                  )}
                </div>
                <span className="flex-1 relative z-10">{item.label}</span>
                {hasActiveLive && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground font-bold">LIVE</span>
                )}
                {badge > 0 && (
                  <span className="bg-warning text-warning-foreground text-xs rounded-full h-5 min-w-[1.25rem] flex items-center justify-center px-1 font-semibold">{badge}</span>
                )}
              </Link>
            );
          })}

          {/* Admin-only section */}
          {isSuperAdmin && (
            <>
              <div className="pt-3 pb-1 px-3">
                <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-semibold flex items-center gap-1.5">
                  <Shield className="h-3 w-3" /> Administração
                </p>
              </div>
              {adminNavItems.map((item) => {
                const active = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 nav-magic ${
                      active
                        ? "magic-gradient text-sidebar-primary-foreground font-medium shadow-md"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 shrink-0`} />
                    <span className="flex-1 relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground w-full transition-colors">
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md flex items-center px-4 gap-4 no-print shrink-0 relative z-40">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-primary transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />

          {/* Notification bell */}
          <div className="relative">
            <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 text-muted-foreground hover:text-primary rounded-xl hover:bg-accent transition-colors">
              <Bell className="h-5 w-5" />
              {totalNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 magic-gradient text-primary-foreground text-[10px] rounded-full h-4 min-w-[1rem] flex items-center justify-center px-1 font-bold">{totalNotifs}</span>
              )}
            </button>
            {showNotif && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setShowNotif(false)} />
                <div className="absolute right-0 top-full mt-1 w-80 bg-card border border-border rounded-2xl shadow-2xl z-[70] overflow-hidden">
                <div className="p-3 border-b border-border/50">
                  <p className="text-sm font-heading font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-magic-gold" /> Notificações
                  </p>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-border/30">
                  {recentNotifs.filter((n) => !n.read).map((n) => {
                    const icon = n.type === "confirmacao" ? "✅" : n.type === "cancelamento" ? "❌" : "📄";
                    return (
                      <button
                        key={n.id}
                        onClick={() => { markNotificationRead(n.id); }}
                        className="p-3 flex items-start gap-3 hover:bg-accent/50 w-full text-left transition-colors"
                      >
                        <span className="text-base shrink-0">{icon}</span>
                        <div className="min-w-0">
                          <p className="text-sm text-foreground leading-snug">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{format(new Date(n.date), "dd/MM HH:mm", { locale: ptBR })}</p>
                        </div>
                      </button>
                    );
                  })}
                  {todayBirthdays.map((b) => (
                    <div key={b.id} className="p-3 flex items-center gap-3 bg-magic-gold/5">
                      <Cake className="h-4 w-4 text-magic-gold shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-foreground truncate">🎂 <strong>{b.name}</strong> faz {b.age} anos hoje!</p>
                      </div>
                    </div>
                  ))}
                  {unreadCount > 0 && (
                    <Link to="/mensagens" onClick={() => setShowNotif(false)} className="p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors">
                      <MessageCircle className="h-4 w-4 text-primary shrink-0" />
                      <p className="text-sm text-foreground">{unreadCount} msg de doutor(es)</p>
                    </Link>
                  )}
                  {unreadPatientMsgCount > 0 && (
                    <Link to="/mensagens" onClick={() => setShowNotif(false)} className="p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors">
                      <Users className="h-4 w-4 text-info shrink-0" />
                      <p className="text-sm text-foreground">{unreadPatientMsgCount} msg de paciente(s)</p>
                    </Link>
                  )}
                  {unreadSupportCount > 0 && (
                    <Link to="/suporte" onClick={() => setShowNotif(false)} className="p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors">
                      <Headphones className="h-4 w-4 text-warning shrink-0" />
                      <p className="text-sm text-foreground">{unreadSupportCount} msg no suporte</p>
                    </Link>
                  )}
                  {totalNotifs === 0 && (
                    <p className="p-4 text-sm text-muted-foreground text-center">✨ Tudo em ordem por aqui!</p>
                  )}
                </div>
                </div>
              </>
            )}
          </div>

          <p className="text-sm text-muted-foreground font-medium">{authUser?.username === "admin" ? "Crystian" : (authUser?.username || "Crystian")}</p>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
