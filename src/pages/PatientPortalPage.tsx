import { useState, useMemo, useEffect, useRef } from "react";
import { useTeleconsultaStore } from "@/data/teleconsultaStore";
import { useClinicStore } from "@/data/clinicStore";
import { useBillingStore } from "@/data/billingStore";
import { useAuthStore } from "@/data/authStore";
import { useSupportStore } from "@/data/supportStore";
import SupportChatWidget from "@/components/SupportChatWidget";
import EmojiPicker from "@/components/EmojiPicker";
import IncomingCallOverlay from "@/components/IncomingCallOverlay";
import clinicLogo from "@/assets/clinic-logo.png";
import simboloFono from "@/assets/simbolo-fono.jpg";
import simboloPsicologia from "@/assets/simbolo-psicologia.jpg";
import profFono from "@/assets/profissional-fono.jpg";
import profPsico from "@/assets/profissional-psico.jpg";
import { checkRateLimit, resetRateLimit, validateCPF, formatCPF, sanitizeInput } from "@/lib/security";
import { maskPhone } from "@/lib/masks";
import { useNotificationSounds } from "@/hooks/useNotificationSounds";
import { useIncomingCallRingtone } from "@/hooks/useIncomingCallRingtone";
import { useChatPresenceStore } from "@/data/chatPresenceStore";
import { PresenceDot, PresenceLabel } from "@/components/PresenceIndicator";
import {
  Video, LogOut, LogIn, Calendar, MessageCircle, User, Phone, Clock,
  CreditCard, FileText, Send, Home, DollarSign, CheckCircle2,
  AlertCircle, ChevronRight, Camera, X, Paperclip, Check, XCircle, MapPin, Navigation,
  ListChecks, Link as LinkIcon, Image, ExternalLink, Eye, EyeOff, Megaphone, Download, Bell, BookOpen, ChevronDown, Sparkles, Shield, Instagram, Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type PortalTab = "inicio" | "consultas" | "atividades" | "financeiro" | "mensagens" | "avisos" | "live" | "tutorial" | "perfil";

function ChangePasswordSection({ accountId, currentPassword }: { accountId: string; currentPassword: string }) {
  const updatePatientAccount = useTeleconsultaStore((s) => s.updatePatientAccount);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = () => {
    if (!oldPass || !newPass || !confirmPass) {
      toast.error("Preencha todos os campos.");
      return;
    }
    if (oldPass !== currentPassword) {
      toast.error("Senha atual incorreta.");
      return;
    }
    if (newPass.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPass !== confirmPass) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (newPass === oldPass) {
      toast.error("A nova senha deve ser diferente da atual.");
      return;
    }
    updatePatientAccount(accountId, { password: newPass });
    setOldPass("");
    setNewPass("");
    setConfirmPass("");
    toast.success("Senha alterada com sucesso!");
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
        🔒 Trocar Senha
      </h3>
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Senha atual</label>
        <div className="relative">
          <input
            type={showOld ? "text" : "password"}
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
            placeholder="••••••"
            className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring pr-10"
          />
          <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Nova senha</label>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            placeholder="••••••"
            className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring pr-10"
          />
          <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Confirmar nova senha</label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            placeholder="••••••"
            onKeyDown={(e) => e.key === "Enter" && handleChangePassword()}
            className="w-full border border-input bg-background rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring pr-10"
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Button onClick={handleChangePassword} className="w-full sm:w-auto">Alterar Senha</Button>
    </div>
  );
}

const patientTutorialData = [
  {
    title: "Acessando o Portal",
    icon: LogIn,
    color: "text-primary",
    steps: [
      { title: "Como acessar", description: "Acesse o portal com o link fornecido pela clínica e insira seu CPF e senha cadastrados.", tips: ["Use o CPF cadastrado na clínica", "Caso esqueça a senha, redefina pelo perfil"] },
    ]
  },
  {
    title: "Minhas Consultas",
    icon: Calendar,
    color: "text-magic-lavender",
    steps: [
      { title: "Ver agendamentos", description: "Na aba 'Consultas', veja todas as suas consultas com data, horário, tipo e status.", tips: ["Consultas confirmadas aparecem em verde"] },
      { title: "Confirmar ou cancelar", description: "Clique em 'Confirmar' para confirmar presença ou 'Cancelar' para desmarcar. O médico é notificado automaticamente.", tips: ["Ao cancelar, você pode anexar um atestado"] },
    ]
  },
  {
    title: "Atividades",
    icon: ListChecks,
    color: "text-magic-blue",
    steps: [
      { title: "Tarefas do tratamento", description: "Veja atividades atribuídas pelo médico e marque como concluídas conforme realizar.", tips: ["Manter as atividades em dia ajuda no seu tratamento"] },
    ]
  },
  {
    title: "Financeiro",
    icon: DollarSign,
    color: "text-success",
    steps: [
      { title: "Ver pagamentos", description: "Na aba 'Financeiro', acompanhe seus pagamentos pendentes e histórico com valores e status.", tips: ["Pagamentos pendentes aparecem destacados"] },
    ]
  },
  {
    title: "Mensagens",
    icon: MessageCircle,
    color: "text-info",
    steps: [
      { title: "Conversar com a clínica", description: "Envie mensagens para o médico e receba respostas diretamente no portal.", tips: ["Use para tirar dúvidas ou enviar informações"] },
    ]
  },
  {
    title: "Avisos",
    icon: Megaphone,
    color: "text-magic-rose",
    steps: [
      { title: "Ver comunicados", description: "Veja avisos da clínica. Clique para expandir e ler o conteúdo completo. Imagens podem ser ampliadas com um clique.", tips: ["Novos avisos são notificados ao fazer login"] },
    ]
  },
  {
    title: "Perfil e Senha",
    icon: Shield,
    color: "text-magic-gold",
    steps: [
      { title: "Ver seus dados", description: "Na aba 'Perfil', veja suas informações cadastrais, foto e dados vinculados à clínica.", tips: ["Para atualizar dados, entre em contato com a clínica"] },
      { title: "Trocar senha", description: "No perfil, use a seção 'Trocar Senha' para alterar sua senha de acesso de forma segura.", tips: ["A nova senha deve ter pelo menos 6 caracteres"] },
    ]
  },
  {
    title: "Teleconsulta",
    icon: Video,
    color: "text-primary",
    steps: [
      { title: "Entrar na videochamada", description: "Quando uma teleconsulta for agendada, o link da sala aparecerá na aba Início. Clique para entrar na videochamada pelo navegador.", tips: ["Verifique câmera e microfone antes de entrar"] },
    ]
  },
];

function PatientTutorialSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1 mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/50 text-sm text-accent-foreground">
          <BookOpen className="h-4 w-4" />
          Central de Ajuda
        </div>
        <h2 className="text-xl font-semibold text-foreground">Como usar o Portal ✨</h2>
        <p className="text-sm text-muted-foreground">Clique em cada seção para ver o passo a passo</p>
      </div>

      {patientTutorialData.map((section, i) => {
        const Icon = section.icon;
        const isOpen = openIndex === i;
        return (
          <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden transition-all">
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-accent/30 transition-colors"
            >
              <div className={`h-10 w-10 rounded-xl bg-accent/50 flex items-center justify-center shrink-0 ${section.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">{section.title}</h3>
                <p className="text-xs text-muted-foreground">{section.steps.length} passo(s)</p>
              </div>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 space-y-3 animate-fade-in">
                {section.steps.map((step, si) => (
                  <div key={si} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-7 w-7 rounded-lg magic-gradient text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">{si + 1}</div>
                      {si < section.steps.length - 1 && <div className="w-0.5 flex-1 bg-border/50 mt-1" />}
                    </div>
                    <div className="flex-1 pb-3">
                      <h4 className="font-medium text-foreground text-sm mb-0.5">{step.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                      {step.tips && (
                        <div className="mt-2 space-y-1">
                          {step.tips.map((tip, ti) => (
                            <div key={ti} className="flex items-start gap-2 text-xs text-muted-foreground bg-accent/30 rounded-lg px-3 py-1.5">
                              <Sparkles className="h-3 w-3 text-magic-gold shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function InvoiceDataSection({ patientId }: { patientId: string }) {
  const { setInvoiceData, getInvoiceData } = useBillingStore();
  const existing = getInvoiceData(patientId);
  const [wantsInvoice, setWantsInvoice] = useState(existing?.wantsInvoice || false);
  const [cpf, setCpf] = useState(existing?.cpf || "");
  const [cep, setCep] = useState(existing?.cep || "");
  const [address, setAddress] = useState(existing?.address || "");

  const handleSave = () => {
    if (wantsInvoice && (!cpf.trim() || !cep.trim() || !address.trim())) {
      toast.error("Preencha todos os campos para emissão de nota fiscal.");
      return;
    }
    setInvoiceData({ patientId, wantsInvoice, cpf: cpf.trim(), cep: cep.trim(), address: address.trim() });
    toast.success(wantsInvoice ? "Dados para nota fiscal salvos!" : "Preferência atualizada.");
  };

  const formatCepInput = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 5) return digits.slice(0, 5) + "-" + digits.slice(5);
    return digits;
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" /> Nota Fiscal
      </h3>
      <p className="text-sm text-muted-foreground">Deseja receber nota fiscal dos seus pagamentos?</p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setWantsInvoice(!wantsInvoice)}
          className={`relative w-11 h-6 rounded-full transition-colors ${wantsInvoice ? "bg-primary" : "bg-muted"}`}
        >
          <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow ${wantsInvoice ? "translate-x-5" : ""}`} />
        </button>
        <span className="text-sm font-medium text-foreground">{wantsInvoice ? "Sim, quero nota fiscal" : "Não preciso"}</span>
      </div>

      {wantsInvoice && (
        <div className="space-y-3 pt-2">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">CPF para nota fiscal</label>
            <input
              value={cpf}
              onChange={(e) => setCpf(formatCPF(e.target.value))}
              placeholder="000.000.000-00"
              maxLength={14}
              className="w-full border border-input bg-background rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">CEP</label>
            <input
              value={cep}
              onChange={(e) => setCep(formatCepInput(e.target.value))}
              placeholder="00000-000"
              maxLength={9}
              className="w-full border border-input bg-background rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Endereço completo</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Rua, número, bairro, cidade - UF"
              className="w-full border border-input bg-background rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      )}

      <Button onClick={handleSave} className="w-full sm:w-auto">
        Salvar
      </Button>
    </div>
  );
}

export default function PatientPortalPage() {
  useNotificationSounds();
  const {
    patientAccounts, registerPatient, getPatientByEmail, getPatientByCpf, updatePatientAccount,
    rooms, chatMessages, patientMessages, addPatientMessage, markPatientMessageRead
  } = useTeleconsultaStore();
  const patients = useClinicStore((s) => s.patients);
  const settings = useClinicStore((s) => s.settings);
  const appointments = useClinicStore((s) => s.appointments);
  const updateAppointment = useClinicStore((s) => s.updateAppointment);
  const addNotification = useClinicStore((s) => s.addNotification);
  const addAtestado = useClinicStore((s) => s.addAtestado);
  const payments = useClinicStore((s) => s.payments);
  const activities = useClinicStore((s) => s.activities);
  const updateActivity = useClinicStore((s) => s.updateActivity);
  const patientAnnouncements = useClinicStore((s) => s.patientAnnouncements);
  const markPatientAnnouncementRead = useClinicStore((s) => s.markPatientAnnouncementRead);

  // Billing
  const billingCharges = useBillingStore((s) => s.charges);
  const billingNotifications = useBillingStore((s) => s.billingNotifications);
  const markAsPaid = useBillingStore((s) => s.markAsPaid);
  const addBillingNotification = useBillingStore((s) => s.addBillingNotification);
  const markBillingNotificationRead = useBillingStore((s) => s.markBillingNotificationRead);
  const checkAndNotify = useBillingStore((s) => s.checkAndNotify);

  // Support
  const supportTickets = useSupportStore((s) => s.tickets);
  const supportMessages = useSupportStore((s) => s.messages);
  const supportAddMessage = useSupportStore((s) => s.addMessage);
  const supportCreateTicket = useSupportStore((s) => s.createTicket);

  const [view, setView] = useState<"landing" | "login" | "register" | "portal" | "forgot-password">("landing");
  const [loggedIn, setLoggedIn] = useState<string | null>(() => sessionStorage.getItem("patient-auth") || localStorage.getItem("patient-auth"));
  const [loginForm, setLoginForm] = useState({ cpf: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "", email: "", phone: "", cpf: "", birthDate: "", password: "", confirmPassword: ""
  });
  const [activeTab, setActiveTab] = useState<PortalTab>("inicio");
  const [msgText, setMsgText] = useState("");
  const [msgDoctor, setMsgDoctor] = useState("");
  const [chatContact, setChatContact] = useState<string | null>(null); // doctor name or "suporte"
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [cancelModal, setCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelFile, setCancelFile] = useState<{ data: string; name: string } | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [forgotStep, setForgotStep] = useState<"email" | "code" | "reset">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotConfirmPass, setForgotConfirmPass] = useState("");
  const [forgotAccountId, setForgotAccountId] = useState<string | null>(null);
  const [forgotAccountType, setForgotAccountType] = useState<"patient" | "admin" | null>(null);
  const [showForgotNewPass, setShowForgotNewPass] = useState(false);
  const [showForgotConfirmPass, setShowForgotConfirmPass] = useState(false);
  const [payModal, setPayModal] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<"pix" | "cartao">("pix");
  const [payStep, setPayStep] = useState<"choose" | "details" | "processing" | "done">("choose");
  const [cardForm, setCardForm] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [pixKey] = useState(() => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  });

  const account = useMemo(() => loggedIn ? patientAccounts.find((a) => a.id === loggedIn) : null, [loggedIn, patientAccounts]);
  const linkedPatient = useMemo(() => {
    if (!account) return null;

    const accountCpf = account.cpf?.replace(/\D/g, "") || "";
    const directMatch = account.patientId ? patients.find((p) => p.id === account.patientId) : null;

    if (directMatch) {
      const directMatchCpf = directMatch.cpf?.replace(/\D/g, "") || "";
      if (!accountCpf || !directMatchCpf || directMatchCpf === accountCpf) {
        return directMatch;
      }
    }

    if (!accountCpf) return null;
    return patients.find((p) => p.cpf?.replace(/\D/g, "") === accountCpf) || null;
  }, [account, patients]);

  useEffect(() => {
    if (!account || !linkedPatient || account.patientId === linkedPatient.id) return;
    updatePatientAccount(account.id, { patientId: linkedPatient.id });
  }, [account, linkedPatient, updatePatientAccount]);

  useIncomingCallRingtone(linkedPatient?.id ?? null);
  const myRooms = useMemo(() => linkedPatient ? rooms.filter((r) => r.patientId === linkedPatient.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : [], [linkedPatient, rooms]);
  const myAppointments = useMemo(() => linkedPatient ? appointments.filter((a) => a.patientId === linkedPatient.id).sort((a, b) => a.date.localeCompare(b.date)) : [], [linkedPatient, appointments]);
  const myPayments = useMemo(() => linkedPatient ? payments.filter((p) => p.patientId === linkedPatient.id).sort((a, b) => b.date.localeCompare(a.date)) : [], [linkedPatient, payments]);
  const myActivities = useMemo(() => linkedPatient ? activities.filter((a) => a.patientId === linkedPatient.id).sort((a, b) => b.date.localeCompare(a.date)) : [], [linkedPatient, activities]);
  const myMessages = useMemo(() => account ? patientMessages.filter((m) => m.patientAccountId === account.id || (linkedPatient ? m.patientId === linkedPatient.id : false)).sort((a, b) => b.date.localeCompare(a.date)) : [], [account, linkedPatient, patientMessages]);

  // Billing data for this patient
  const myCharges = useMemo(() => {
    if (!account) return [];
    const cpfClean = account.cpf?.replace(/\D/g, "") || "";
    return billingCharges.filter((c) => {
      // Match by patientId (direct link)
      if (linkedPatient && c.patientId === linkedPatient.id) return true;
      // Fallback: match by CPF if patientId corresponds to a patient with same CPF
      if (cpfClean) {
        const chargePatient = patients.find((p) => p.id === c.patientId);
        if (chargePatient && chargePatient.cpf?.replace(/\D/g, "") === cpfClean) return true;
      }
      return false;
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [account, linkedPatient, billingCharges, patients]);
  const myBillingNotifications = useMemo(() => {
    if (!account) return [];
    const cpfClean = account.cpf?.replace(/\D/g, "") || "";
    const matchingPatientIds = new Set<string>();
    if (linkedPatient) matchingPatientIds.add(linkedPatient.id);
    if (cpfClean) {
      patients.forEach((p) => { if (p.cpf?.replace(/\D/g, "") === cpfClean) matchingPatientIds.add(p.id); });
    }
    return billingNotifications.filter((n) => matchingPatientIds.has(n.patientId) && !n.read).sort((a, b) => b.date.localeCompare(a.date));
  }, [account, linkedPatient, billingNotifications, patients]);
  
  const pendingCharges = myCharges.filter((c) => c.status === "pendente" || c.status === "atrasado");
  const totalPendingCharges = pendingCharges.reduce((sum, c) => sum + c.amount, 0);

  const pendingPayments = myPayments.filter((p) => p.status === "pendente");
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0) + totalPendingCharges;
  const unreadDoctorMessages = myMessages.filter((m) => !m.read && m.sender === "doctor").length;

  // Support data for this patient
  const mySupportTicket = useMemo(() => account ? supportTickets.find((t) => t.patientAccountId === account.id && t.status !== "fechado") : null, [account, supportTickets]);
  const mySupportMessages = useMemo(() => {
    if (!account) return [];
    const myTickets = supportTickets.filter((t) => t.patientAccountId === account.id);
    return supportMessages.filter((m) => myTickets.some((t) => t.id === m.ticketId)).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }, [account, supportTickets, supportMessages]);
  const unreadSupportMessages = useMemo(() => {
    if (!account) return 0;
    const myTicketIds = supportTickets.filter((t) => t.patientAccountId === account.id).map((t) => t.id);
    return supportMessages.filter((m) => myTicketIds.includes(m.ticketId) && m.sender === "support").length;
  }, [account, supportTickets, supportMessages]);

  const unreadMessages = unreadDoctorMessages + unreadSupportMessages;
  const unreadAnnouncements = useMemo(() => account ? patientAnnouncements.filter((a) => !a.readBy.includes(account.id)).length : 0, [account, patientAnnouncements]);

  // Set patient online presence
  const { setOnline: setPresenceOnline, setOffline: setPresenceOffline, getPresence: getChatPresence } = useChatPresenceStore();
  useEffect(() => {
    if (account) {
      setPresenceOnline(account.id, account.name, "patient");
      return () => { setPresenceOffline(account.id); };
    }
  }, [account, setPresenceOnline, setPresenceOffline]);

  // Auto-check billing notifications
  useEffect(() => {
    if (loggedIn) checkAndNotify();
  }, [loggedIn]);

  const handleLogin = () => {
    const identifier = loginForm.cpf.trim();
    const cleanCpf = identifier.replace(/\D/g, "");
    const isLikelyCpf = /^\d/.test(identifier.replace(/[.\-]/g, ""));
    
    // Rate limiting
    const rateCheck = checkRateLimit(`patient-login-${cleanCpf || identifier}`);
    if (!rateCheck.allowed) {
      const mins = rateCheck.lockoutEnds ? Math.ceil((rateCheck.lockoutEnds.getTime() - Date.now()) / 60000) : 15;
      toast.error(`Conta bloqueada por ${mins} minutos. Muitas tentativas falhas.`);
      return;
    }

    // Try admin/doctor login first (by CPF or username)
    const { login: authLogin } = useAuthStore.getState();
    if (authLogin(identifier, loginForm.password)) {
      resetRateLimit(`patient-login-${cleanCpf || identifier}`);
      toast.success("Login realizado com sucesso!");
      window.location.href = "/dashboard";
      return;
    }

    // If it looks like a username (not CPF), it's not a patient
    if (!isLikelyCpf) {
      toast.error(`Usuário ou senha incorretos. ${rateCheck.remainingAttempts} tentativa(s) restante(s).`);
      return;
    }

    // CPF validation for patient login
    if (!validateCPF(loginForm.cpf)) {
      toast.error("CPF inválido.");
      return;
    }

    const acc = getPatientByCpf(loginForm.cpf);
    if (!acc || acc.password !== loginForm.password) {
      toast.error(`CPF ou senha incorretos. ${rateCheck.remainingAttempts} tentativa(s) restante(s).`);
      return;
    }
    if (acc.status === "inativo") {
      toast.error("Sua conta está desativada. Entre em contato com a clínica.");
      return;
    }
    resetRateLimit(`patient-login-${cleanCpf}`);
    sessionStorage.setItem("patient-auth", acc.id);
    localStorage.removeItem("patient-auth");
    setLoggedIn(acc.id);
    const unreadAnn = patientAnnouncements.filter((a) => !a.readBy.includes(acc.id)).length;
    if (unreadAnn > 0) {
      toast.info(`Você tem ${unreadAnn} aviso(s) novo(s)! 📢`, { duration: 5000 });
    }
    toast.success(`Bem-vindo(a), ${acc.name}!`);
  };

  const handleRegister = () => {
    if (!registerForm.name || !registerForm.email || !registerForm.cpf || !registerForm.birthDate || !registerForm.password) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    if (!validateCPF(registerForm.cpf)) {
      toast.error("CPF inválido. Verifique os dígitos.");
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (getPatientByCpf(registerForm.cpf)) {
      toast.error("CPF já cadastrado.");
      return;
    }
    if (getPatientByEmail(registerForm.email)) {
      toast.error("E-mail já cadastrado.");
      return;
    }

    // Auto-link: match by CPF first, then name+birthDate, then email/phone
    const cpfClean = registerForm.cpf.replace(/\D/g, "");
    let matchPatient = patients.find((p) => p.cpf.replace(/\D/g, "") === cpfClean && cpfClean.length >= 11);
    if (!matchPatient) {
      matchPatient = patients.find(
        (p) => p.name.toLowerCase().trim() === registerForm.name.toLowerCase().trim() && p.birthDate === registerForm.birthDate
      );
    }
    if (!matchPatient) {
      matchPatient = patients.find((p) => p.email === registerForm.email || p.phone === registerForm.phone);
    }

    const id = registerPatient({
      patientId: matchPatient?.id || "",
      name: registerForm.name,
      email: registerForm.email,
      phone: registerForm.phone,
      cpf: registerForm.cpf,
      birthDate: registerForm.birthDate,
      password: registerForm.password,
      avatar: "",
    });
    sessionStorage.setItem("patient-auth", id);
    setLoggedIn(id);
    if (matchPatient) {
      toast.success("Cadastro vinculado automaticamente ao seu histórico na clínica!");
    } else {
      toast.success("Cadastro realizado com sucesso!");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("patient-auth");
    localStorage.removeItem("patient-auth");
    setLoggedIn(null);
    setView("landing");
    setActiveTab("inicio");
  };

  const handleSendMessage = () => {
    if (!msgText.trim() || !msgDoctor || !account) return;
    addPatientMessage({
      patientAccountId: account.id,
      patientId: account.patientId,
      doctorName: msgDoctor,
      sender: "patient",
      content: msgText.trim(),
      date: new Date().toISOString(),
      read: false,
    });
    setMsgText("");
    toast.success("Mensagem enviada!");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !account) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updatePatientAccount(account.id, { avatar: dataUrl });
      toast.success("Foto atualizada com sucesso!");
    };
    reader.readAsDataURL(file);
  };

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const handleConfirmAppointment = (appointmentId: string) => {
    const appt = appointments.find((a) => a.id === appointmentId);
    if (!appt || !linkedPatient) return;
    updateAppointment(appointmentId, { status: "agendado" });
    addNotification({
      type: "confirmacao",
      patientId: linkedPatient.id,
      patientName: account.name,
      appointmentId,
      message: `${account.name} confirmou presença na consulta de ${appt.date} às ${appt.time}.`,
      date: new Date().toISOString(),
      read: false,
    });
    toast.success("Presença confirmada!");
  };

  const handleCancelAppointment = () => {
    if (!cancelModal || !cancelReason.trim() || !linkedPatient) {
      toast.error("Escreva o motivo do cancelamento.");
      return;
    }
    const appt = appointments.find((a) => a.id === cancelModal);
    if (!appt) return;

    updateAppointment(cancelModal, { status: "cancelado" });
    addNotification({
      type: "cancelamento",
      patientId: linkedPatient.id,
      patientName: account.name,
      appointmentId: cancelModal,
      message: `${account.name} cancelou a consulta de ${appt.date} às ${appt.time}. Motivo: ${cancelReason.trim()}`,
      date: new Date().toISOString(),
      read: false,
    });

    if (cancelFile) {
      addAtestado({
        patientId: linkedPatient.id,
        patientName: account.name,
        appointmentId: cancelModal,
        appointmentDate: appt.date,
        appointmentTime: appt.time,
        reason: cancelReason.trim(),
        fileData: cancelFile.data,
        fileName: cancelFile.name,
        sentAt: new Date().toISOString(),
      });
      addNotification({
        type: "atestado",
        patientId: linkedPatient.id,
        patientName: account.name,
        appointmentId: cancelModal,
        message: `${account.name} enviou um atestado para a consulta de ${appt.date} às ${appt.time}.`,
        date: new Date().toISOString(),
        read: false,
      });
    }

    setCancelModal(null);
    setCancelReason("");
    setCancelFile(null);
    toast.success("Consulta cancelada.");
  };

  const handleCancelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCancelFile({ data: reader.result as string, name: file.name });
    };
    reader.readAsDataURL(file);
  };

  // === LOGIN / REGISTER ===
  if (!loggedIn || !account) {

    return (
      <div className="min-h-screen bg-[hsl(220,20%,97%)]">
        {/* Top nav bar - Dasa style */}
        <header className="bg-card border-b border-border/50 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
            <button onClick={() => setView("landing")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src={settings.logo || clinicLogo} alt={settings.name} className="h-10 w-10 rounded-xl object-cover" />
              <span className="font-heading font-bold text-foreground text-lg hidden sm:inline">{settings.name}</span>
            </button>
            <div className="flex items-center gap-3">
              <Button
                variant="default"
                onClick={() => setView("register")}
                className="rounded-lg font-semibold text-sm px-5"
              >
                Cadastre-se
              </Button>
              <Button
                variant="outline"
                onClick={() => setView("login")}
                className="rounded-lg font-semibold text-sm px-5 border-2"
              >
                Entrar
              </Button>
            </div>
          </div>
        </header>

        {/* Hero section - big gradient banner like Dasa */}
        {view === "landing" ? (
          <>
            <section className="relative overflow-hidden">
              <div className="bg-gradient-to-r from-[hsl(260,60%,30%)] via-[hsl(260,55%,42%)] to-[hsl(280,50%,50%)] min-h-[420px] flex items-center">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[hsl(170,60%,45%)]/30 rounded-full translate-x-1/3 -translate-y-1/4 blur-sm" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[hsl(170,60%,45%)]/20 rounded-full translate-x-1/4 translate-y-1/4" />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 relative z-10">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-primary-foreground leading-tight max-w-3xl">
                    Agende suas consultas e acompanhe seu tratamento na {settings.name}.
                  </h1>
                  <p className="text-primary-foreground/70 text-lg mt-4 max-w-2xl">
                    Para não deixar o cuidado com a saúde para depois.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Button
                      size="lg"
                      onClick={() => setView("register")}
                      className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold text-base px-8 py-6 rounded-xl shadow-xl"
                    >
                      Cadastre-se Agora
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => setView("login")}
                      className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold text-base px-8 py-6 rounded-xl shadow-xl"
                    >
                      Já tenho conta — Entrar
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Services / specialties section - Dasa style cards on beige bg */}
            <section className="bg-[hsl(30,30%,93%)] py-16">
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
                  <span className="text-primary">+</span> Nossos <strong>Serviços</strong>
                </h2>
                <p className="text-muted-foreground text-sm mb-8 max-w-2xl">
                  A {settings.name} oferece atendimento especializado com profissionais qualificados para cuidar da sua saúde.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: Calendar, title: "Agendamento Online", desc: "Agende suas consultas de forma rápida e prática" },
                    { icon: Video, title: "Teleconsulta", desc: "Consultas por vídeo no conforto da sua casa" },
                    { icon: MessageCircle, title: "Chat com Profissional", desc: "Tire dúvidas diretamente com seu médico" },
                    { icon: FileText, title: "Prontuário Digital", desc: "Acompanhe seu histórico e evolução" },
                    { icon: ListChecks, title: "Atividades", desc: "Receba tarefas do tratamento e acompanhe o progresso" },
                    { icon: DollarSign, title: "Financeiro", desc: "Acompanhe pagamentos e pendências" },
                    { icon: Megaphone, title: "Avisos", desc: "Receba comunicados importantes da clínica" },
                    { icon: Shield, title: "Segurança", desc: "Seus dados protegidos com criptografia" },
                  ].map((service, i) => {
                    const Icon = service.icon;
                    return (
                      <div key={i} className="bg-card rounded-2xl p-6 shadow-sm border border-border/30 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default group">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground text-sm mb-1">{service.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{service.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Especialidades Section */}
            <section className="py-20 bg-gradient-to-b from-accent/30 to-background">
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-14">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                    <Sparkles className="h-4 w-4" />
                    Conheça Nossa Equipe
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-3">
                    Nossas <span className="text-primary">Especialistas</span>
                  </h2>
                  <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                    Profissionais dedicadas e apaixonadas pelo que fazem, prontas para cuidar de você e da sua família.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  {/* Fonoaudiologia */}
                  <div className="relative bg-card rounded-3xl border border-border/40 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                    <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-[hsl(200,70%,50%)]/20 to-[hsl(200,70%,50%)]/5" />
                    <div className="relative pt-8 px-8 flex justify-center">
                      <div className="relative">
                        <div className="h-40 w-40 rounded-full overflow-hidden border-4 border-card shadow-xl group-hover:scale-105 transition-transform duration-500">
                          <img src={profFono} alt="Profissional de Fonoaudiologia" className="h-full w-full object-cover object-top" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 h-14 w-14 rounded-full bg-card shadow-lg flex items-center justify-center border-2 border-[hsl(200,70%,50%)]/30">
                          <img src={simboloFono} alt="Símbolo da Fonoaudiologia" className="h-10 w-10 object-contain rounded-full" />
                        </div>
                      </div>
                    </div>
                    <div className="relative z-10 p-8 pt-6 text-center">
                      <h3 className="text-xl font-heading font-bold text-foreground mb-1">Fonoaudiologia</h3>
                      <p className="text-xs text-primary font-semibold mb-3 tracking-wide uppercase">Atendimento Infantil e Adulto</p>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                        Avaliação e tratamento de distúrbios da comunicação, fala, linguagem, voz, audição e funções orofaciais. Atendimento infantil e adulto com laser e tecnologia de ponta.
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {["Fala", "Linguagem", "Voz", "Audição", "Laser"].map((tag) => (
                          <span key={tag} className="px-3 py-1 rounded-full bg-[hsl(200,70%,50%)]/10 text-[hsl(200,70%,50%)] text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Psicologia */}
                  <div className="relative bg-card rounded-3xl border border-border/40 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                    <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-[hsl(280,60%,55%)]/20 to-[hsl(280,60%,55%)]/5" />
                    <div className="relative pt-8 px-8 flex justify-center">
                      <div className="relative">
                        <div className="h-40 w-40 rounded-full overflow-hidden border-4 border-card shadow-xl group-hover:scale-105 transition-transform duration-500">
                          <img src={profPsico} alt="Profissional de Psicologia" className="h-full w-full object-cover object-top" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 h-14 w-14 rounded-full bg-card shadow-lg flex items-center justify-center border-2 border-[hsl(280,60%,55%)]/30">
                          <img src={simboloPsicologia} alt="Símbolo da Psicologia" className="h-10 w-10 object-contain rounded-full" />
                        </div>
                      </div>
                    </div>
                    <div className="relative z-10 p-8 pt-6 text-center">
                      <h3 className="text-xl font-heading font-bold text-foreground mb-1">Psicologia</h3>
                      <p className="text-xs text-[hsl(280,60%,55%)] font-semibold mb-3 tracking-wide uppercase">Atendimento Infantil e Adulto</p>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                        Acompanhamento psicológico com abordagem acolhedora e personalizada. Atendimento infantil e adulto, particular.
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {["Terapia Individual", "Infantil", "Ansiedade", "Autoestima", "Desenvolvimento"].map((tag) => (
                          <span key={tag} className="px-3 py-1 rounded-full bg-[hsl(280,60%,55%)]/10 text-[hsl(280,60%,55%)] text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Localização Section */}
            <section className="py-20 bg-gradient-to-b from-background to-accent/20">
              <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                    <MapPin className="h-4 w-4" />
                    Nossa Localização
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-3">
                    Venha nos <span className="text-primary">Visitar</span>
                  </h2>
                  <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                    Estamos em um local de fácil acesso, dentro do Taguatinga Shopping.
                  </p>
                </div>

                <a
                  href="https://maps.app.goo.gl/EYqHB3nKFFCMfrB78"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="relative bg-card rounded-3xl border border-border/40 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    {/* Map Embed */}
                    <div className="w-full h-56 sm:h-72 overflow-hidden">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3838.5!2d-48.0544!3d-15.8364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935a3b3e1f1f1f1f%3A0x1234567890abcdef!2sTaguatinga%20Shopping!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="pointer-events-none"
                        title="Localização da Clínica"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                    </div>

                    {/* Info Card */}
                    <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <MapPin className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-heading font-bold text-foreground mb-1">Taguatinga Shopping</h3>
                        <p className="text-sm text-muted-foreground mb-1">Torre A, Sala 204</p>
                        <p className="text-xs text-muted-foreground">Taguatinga, Brasília – DF</p>
                      </div>
                      <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm group-hover:bg-primary/90 transition-colors shrink-0 shadow-md">
                        <Navigation className="h-4 w-4" />
                        Como Chegar
                        <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </section>


            <section className="py-16">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Como funciona?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8 max-w-4xl mx-auto">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <LogIn className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">1. Cadastre-se</h3>
                    <p className="text-sm text-muted-foreground">Crie sua conta com CPF e dados básicos</p>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">2. Acompanhe</h3>
                    <p className="text-sm text-muted-foreground">Veja consultas, atividades e pagamentos</p>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Video className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">3. Teleconsulta</h3>
                    <p className="text-sm text-muted-foreground">Entre na videochamada pelo portal</p>
                  </div>
                </div>
                <Button onClick={() => setView("register")} size="lg" className="mt-10 px-10 py-6 text-base font-bold rounded-xl">
                  Começar Agora
                </Button>
              </div>
            </section>

            {/* Footer */}
            <footer className="bg-[hsl(260,60%,15%)] py-8">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div className="flex items-center gap-3">
                  <img src={settings.logo || clinicLogo} alt={settings.name} className="h-10 w-10 rounded-xl object-cover" />
                  <span className="font-heading font-bold text-primary-foreground text-sm">{settings.name}</span>
                </div>
                <a
                  href="https://www.instagram.com/magiadalinguagem?igsh=MWV2aXgzbWFkdWUxag=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[hsl(330,80%,55%)] to-[hsl(270,70%,55%)] text-white text-sm font-semibold hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 shadow-md"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <p className="text-primary-foreground/50 text-xs">© {new Date().getFullYear()} {settings.name}. Todos os direitos reservados.</p>
              </div>
            </footer>
          </>
        ) : (
          /* Login / Register Form */
          <div className="flex-1 flex items-center justify-center p-4 py-16 min-h-[calc(100vh-64px)]">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <img src={settings.logo || clinicLogo} alt={settings.name} className="h-20 w-20 rounded-2xl mx-auto mb-4 object-cover shadow-lg" />
                <h1 className="text-2xl font-heading font-bold text-foreground">{settings.name}</h1>
                <p className="text-sm text-muted-foreground mt-1">Acesse seu painel</p>
              </div>

              <div className="bg-card rounded-2xl shadow-lg border border-border/50 overflow-hidden">
                {view === "forgot-password" ? (
                  <div className="p-6 space-y-4">
                    <button
                      type="button"
                      onClick={() => { setView("login"); setForgotStep("email"); }}
                      className="text-sm text-primary hover:underline flex items-center gap-1 mb-2"
                    >
                      ← Voltar ao login
                    </button>
                    <h2 className="text-lg font-bold text-foreground text-center">Recuperar Senha</h2>

                    {forgotStep === "email" && (
                      <>
                        <p className="text-sm text-muted-foreground text-center">Informe o e-mail cadastrado para receber o código de recuperação.</p>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">E-mail</label>
                          <input
                            type="email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="seu@email.com"
                            className="w-full border border-input bg-background rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <Button
                          onClick={() => {
                            if (!forgotEmail.trim()) {
                              toast.error("Informe seu e-mail.");
                              return;
                            }
                            // Check patient accounts
                            const patientAcc = patientAccounts.find((a) => a.email.toLowerCase() === forgotEmail.trim().toLowerCase());
                            // Check admin/doctor accounts (they may not have email, so skip)
                            if (!patientAcc) {
                              toast.error("E-mail não encontrado no sistema.");
                              return;
                            }
                            const code = Math.floor(100000 + Math.random() * 900000).toString();
                            setGeneratedCode(code);
                            setForgotAccountId(patientAcc.id);
                            setForgotAccountType("patient");
                            setForgotStep("code");
                            toast.success(`Código enviado para ${forgotEmail}! (Código: ${code})`, { duration: 15000 });
                          }}
                          className="w-full py-3 rounded-xl font-bold text-base bg-gradient-to-r from-primary to-[hsl(280,50%,50%)]"
                        >
                          Enviar Código
                        </Button>
                      </>
                    )}

                    {forgotStep === "code" && (
                      <>
                        <p className="text-sm text-muted-foreground text-center">
                          Digite o código de 6 dígitos enviado para <strong>{forgotEmail}</strong>
                        </p>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">Código</label>
                          <input
                            type="text"
                            value={forgotCode}
                            onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="000000"
                            maxLength={6}
                            className="w-full border border-input bg-background rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring text-center text-lg tracking-[0.5em] font-mono"
                          />
                        </div>
                        <Button
                          onClick={() => {
                            if (forgotCode !== generatedCode) {
                              toast.error("Código incorreto. Tente novamente.");
                              return;
                            }
                            setForgotStep("reset");
                            toast.success("Código verificado! Defina sua nova senha.");
                          }}
                          className="w-full py-3 rounded-xl font-bold text-base bg-gradient-to-r from-primary to-[hsl(280,50%,50%)]"
                        >
                          Verificar Código
                        </Button>
                        <button
                          type="button"
                          onClick={() => {
                            const code = Math.floor(100000 + Math.random() * 900000).toString();
                            setGeneratedCode(code);
                            setForgotCode("");
                            toast.success(`Novo código enviado! (Código: ${code})`, { duration: 15000 });
                          }}
                          className="w-full text-center text-sm text-primary hover:underline cursor-pointer"
                        >
                          Reenviar código
                        </button>
                      </>
                    )}

                    {forgotStep === "reset" && (
                      <>
                        <p className="text-sm text-muted-foreground text-center">Defina sua nova senha de acesso.</p>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">Nova senha</label>
                          <div className="relative">
                            <input
                              type={showForgotNewPass ? "text" : "password"}
                              value={forgotNewPass}
                              onChange={(e) => setForgotNewPass(e.target.value)}
                              placeholder="••••••"
                              className="w-full border border-input bg-background rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring pr-10"
                            />
                            <button type="button" onClick={() => setShowForgotNewPass(!showForgotNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {showForgotNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">Confirmar nova senha</label>
                          <div className="relative">
                            <input
                              type={showForgotConfirmPass ? "text" : "password"}
                              value={forgotConfirmPass}
                              onChange={(e) => setForgotConfirmPass(e.target.value)}
                              placeholder="••••••"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  // trigger reset
                                }
                              }}
                              className="w-full border border-input bg-background rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring pr-10"
                            />
                            <button type="button" onClick={() => setShowForgotConfirmPass(!showForgotConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {showForgotConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            if (!forgotNewPass || !forgotConfirmPass) {
                              toast.error("Preencha todos os campos.");
                              return;
                            }
                            if (forgotNewPass.length < 6) {
                              toast.error("A senha deve ter pelo menos 6 caracteres.");
                              return;
                            }
                            if (forgotNewPass !== forgotConfirmPass) {
                              toast.error("As senhas não coincidem.");
                              return;
                            }
                            if (forgotAccountType === "patient" && forgotAccountId) {
                              updatePatientAccount(forgotAccountId, { password: forgotNewPass });
                            }
                            toast.success("Senha redefinida com sucesso! Faça login com sua nova senha.");
                            setView("login");
                            setForgotStep("email");
                            setForgotEmail("");
                            setForgotCode("");
                            setForgotNewPass("");
                            setForgotConfirmPass("");
                            setGeneratedCode("");
                            setForgotAccountId(null);
                            setForgotAccountType(null);
                          }}
                          className="w-full py-3 rounded-xl font-bold text-base bg-gradient-to-r from-primary to-[hsl(280,50%,50%)]"
                        >
                          Redefinir Senha
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 border-b border-border">
                      <button onClick={() => setView("login")} className={`py-3.5 text-sm font-semibold transition-colors ${view === "login" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"}`}>
                        Entrar
                      </button>
                      <button onClick={() => setView("register")} className={`py-3.5 text-sm font-semibold transition-colors ${view === "register" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"}`}>
                        Cadastre-se
                      </button>
                    </div>

                    <div className="p-6 space-y-4">
                      {view === "login" ? (
                        <>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">CPF ou Usuário</label>
                            <input type="text" value={loginForm.cpf} onChange={(e) => {
                              const val = e.target.value;
                              const isNumeric = /^\d/.test(val.replace(/[.\-]/g, ""));
                              setLoginForm({ ...loginForm, cpf: isNumeric ? formatCPF(val) : val });
                            }} placeholder="CPF ou nome de usuário" className="w-full border border-input bg-background rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Senha</label>
                            <div className="relative">
                              <input type={showLoginPassword ? "text" : "password"} value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="••••••" onKeyDown={(e) => e.key === "Enter" && handleLogin()} className="w-full border border-input bg-background rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring pr-10" />
                              <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          <Button onClick={handleLogin} className="w-full py-3 rounded-xl font-bold text-base bg-gradient-to-r from-primary to-[hsl(280,50%,50%)]">
                            Entrar
                          </Button>
                          <button
                            type="button"
                            onClick={() => {
                              setView("forgot-password");
                              setForgotStep("email");
                              setForgotEmail("");
                              setForgotCode("");
                              setForgotNewPass("");
                              setForgotConfirmPass("");
                              setGeneratedCode("");
                              setForgotAccountId(null);
                              setForgotAccountType(null);
                            }}
                            className="w-full text-center text-sm text-primary hover:underline cursor-pointer mt-1"
                          >
                            Esqueceu a senha?
                          </button>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Nome completo *</label>
                            <input type="text" value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} placeholder="Seu nome completo" className="w-full border border-input bg-background rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">CPF *</label>
                            <input type="text" value={registerForm.cpf} onChange={(e) => setRegisterForm({ ...registerForm, cpf: formatCPF(e.target.value) })} placeholder="000.000.000-00" className="w-full border border-input bg-background rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Data de Nascimento *</label>
                            <input type="date" value={registerForm.birthDate} onChange={(e) => setRegisterForm({ ...registerForm, birthDate: e.target.value })} className="w-full border border-input bg-background rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">E-mail *</label>
                            <input type="email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} placeholder="seu@email.com" className="w-full border border-input bg-background rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Telefone</label>
                            <input type="tel" value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: maskPhone(e.target.value) })} placeholder="(00) 00000-0000" className="w-full border border-input bg-background rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium text-foreground mb-1 block">Senha *</label>
                              <div className="relative">
                                <input type={showRegPassword ? "text" : "password"} value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} placeholder="••••••" className="w-full border border-input bg-background rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring pr-10" />
                                <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                  {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-foreground mb-1 block">Confirmar *</label>
                              <div className="relative">
                                <input type={showRegConfirmPassword ? "text" : "password"} value={registerForm.confirmPassword} onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} placeholder="••••••" className="w-full border border-input bg-background rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring pr-10" />
                                <button type="button" onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                  {showRegConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">* Campos obrigatórios. Seus dados serão vinculados automaticamente ao seu cadastro na clínica.</p>
                          <Button onClick={handleRegister} className="w-full py-3 rounded-xl font-bold text-base bg-gradient-to-r from-primary to-[hsl(280,50%,50%)]">Criar Conta</Button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              <p className="text-center text-xs text-muted-foreground mt-4">
                © {new Date().getFullYear()} {settings.name}
              </p>
            </div>
          </div>
        )}

        {/* Instagram floating bubble */}
        <a
          href="https://www.instagram.com/magiadalinguagem?igsh=MWV2aXgzbWFkdWUxag=="
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-[hsl(330,80%,55%)] via-[hsl(350,80%,55%)] to-[hsl(270,70%,55%)] hover:opacity-90 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all animate-fade-in"
          title="Siga-nos no Instagram"
        >
          <Instagram className="h-7 w-7" />
        </a>

        {/* WhatsApp floating bubble */}
        <button
          onClick={() => window.open("https://wa.me/5561981562277", "_blank")}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)] text-primary-foreground flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all animate-fade-in cursor-pointer"
          title="Fale conosco no WhatsApp"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </button>
      </div>
    );
  }

  // === TABS ===
  const liveNotifCount = useMemo(() => {
    const { notifications, sessions } = useLiveStore.getState();
    const hasActiveLive = sessions.some((s) => s.status === "ao_vivo" && s.audience === "todos_pacientes");
    const unreadLiveNotifs = notifications.filter((n) => n.targetType === "patients" && !n.read).length;
    return hasActiveLive ? unreadLiveNotifs + 1 : unreadLiveNotifs;
  }, []);

  const tabs: { id: PortalTab; label: string; icon: React.ReactNode; badge?: number; pulse?: boolean }[] = [
    { id: "inicio", label: "Início", icon: <Home className="h-4 w-4" /> },
    { id: "consultas", label: "Consultas", icon: <Calendar className="h-4 w-4" />, badge: myAppointments.filter(a => a.status === "agendado").length },
    { id: "atividades", label: "Atividades", icon: <ListChecks className="h-4 w-4" />, badge: myActivities.filter(a => !a.completed).length },
    { id: "financeiro", label: "Financeiro", icon: <DollarSign className="h-4 w-4" />, badge: pendingCharges.length + pendingPayments.length },
    { id: "mensagens", label: "Mensagens", icon: <MessageCircle className="h-4 w-4" />, badge: unreadMessages },
    { id: "avisos", label: "Avisos", icon: <Megaphone className="h-4 w-4" />, badge: unreadAnnouncements },
    { id: "live", label: "Live", icon: <Radio className="h-4 w-4" />, badge: liveNotifCount, pulse: useLiveStore.getState().sessions.some((s) => s.status === "ao_vivo" && s.audience === "todos_pacientes") },
    { id: "tutorial", label: "Tutorial", icon: <BookOpen className="h-4 w-4" /> },
    { id: "perfil", label: "Perfil", icon: <User className="h-4 w-4" /> },
  ];

  // === PORTAL ===
  return (
    <div className="min-h-screen bg-[hsl(220,20%,97%)] relative">
      {/* Incoming call overlay */}
      {linkedPatient && (
        <IncomingCallOverlay
          patientId={linkedPatient.id}
          onAnswer={(roomName) => {
            window.open(`/teleconsulta/sala/${roomName}`, "_blank");
          }}
        />
      )}
      {/* Header - modern clean style */}
      <header className="bg-gradient-to-r from-[hsl(260,60%,30%)] via-[hsl(260,55%,40%)] to-[hsl(280,50%,45%)] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center px-4 sm:px-6 h-16 gap-4">
          <img src={settings.logo || clinicLogo} alt={settings.name} className="h-11 w-11 rounded-xl object-cover ring-2 ring-white/20" />
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-primary-foreground truncate">{settings.name}</h1>
            <p className="text-xs text-primary-foreground/60">Portal do Paciente</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-primary-foreground">{account.name}</p>
              <p className="text-xs text-primary-foreground/60">{linkedPatient ? "✓ Vinculado" : "Não vinculado"}</p>
            </div>
            {account.avatar ? (
              <img src={account.avatar} alt={account.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-white/30" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground text-sm font-bold">
                {account.name.charAt(0).toUpperCase()}
              </div>
            )}
            <button onClick={handleLogout} className="p-2 text-primary-foreground/70 hover:text-primary-foreground rounded-lg hover:bg-primary-foreground/10 transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Tab navigation - clean horizontal nav */}
      <nav className="bg-card border-b border-border shadow-sm sticky top-16 z-20">
        <div className="max-w-6xl mx-auto overflow-x-auto">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all relative ${
                  activeTab === tab.id
                    ? "text-primary border-primary bg-primary/5"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span className="h-5 min-w-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
              ) : null}
            </button>
          ))}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 relative z-10">
        {/* === INÍCIO === */}
        {activeTab === "inicio" && (
          <>
            {/* Hero Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[hsl(260,60%,30%)] via-[hsl(260,55%,40%)] to-[hsl(280,50%,50%)] p-8 sm:p-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-primary-foreground/5 rounded-full translate-y-1/2" />
              <div className="relative z-10">
                <p className="text-primary-foreground/70 text-sm mb-1">Portal do Paciente</p>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-primary-foreground">
                  Olá, {account.name.split(" ")[0]}! 👋
                </h2>
                <p className="text-primary-foreground/80 mt-2 text-sm sm:text-base max-w-xl">
                  {linkedPatient
                    ? "Acompanhe suas consultas, pagamentos e teleconsultas em um só lugar."
                    : "Seu cadastro ainda não foi vinculado. Entre em contato com a clínica."}
                </p>
                {myRooms.filter(r => r.status !== "finalizada").length > 0 && (
                  <div className="mt-4">
                    <a
                      href={`/teleconsulta/sala/${myRooms.filter(r => r.status !== "finalizada")[0]?.roomName}`}
                      className="inline-flex items-center gap-2 bg-primary-foreground text-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-foreground/90 transition-colors shadow-lg"
                    >
                      <Video className="h-4 w-4" /> Entrar na Teleconsulta
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Cards - modern clean style */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all" onClick={() => setActiveTab("consultas")}>
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{myAppointments.filter(a => a.status === "agendado").length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Consultas Agendadas</p>
              </div>
              <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all" onClick={() => setActiveTab("financeiro")}>
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-warning/20 to-warning/5 flex items-center justify-center mb-3">
                  <DollarSign className="h-5 w-5 text-warning" />
                </div>
                <p className="text-2xl font-bold text-foreground">{pendingPayments.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Pendências</p>
              </div>
              <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all" onClick={() => setActiveTab("mensagens")}>
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-info/20 to-info/5 flex items-center justify-center mb-3">
                  <MessageCircle className="h-5 w-5 text-info" />
                </div>
                <p className="text-2xl font-bold text-foreground">{unreadMessages}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Mensagens Não Lidas</p>
              </div>
              <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center mb-3">
                  <Video className="h-5 w-5 text-success" />
                </div>
                <p className="text-2xl font-bold text-foreground">{myRooms.filter(r => r.status !== "finalizada").length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Teleconsultas</p>
              </div>
            </div>

            {/* Pending payments alert */}
            {totalPending > 0 && (
              <div className="bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/20 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab("financeiro")}>
                <div className="h-12 w-12 rounded-xl bg-warning/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-6 w-6 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Você tem {pendingCharges.length + pendingPayments.length} pagamento(s) pendente(s)</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Total: R$ {totalPending.toFixed(2).replace(".", ",")}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            )}

            {/* Active teleconsultas */}
            {myRooms.filter(r => r.status !== "finalizada").length > 0 && (
              <div>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" /> Teleconsultas Ativas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myRooms.filter(r => r.status !== "finalizada").map((room) => (
                    <div key={room.id} className="bg-card rounded-2xl p-5 shadow-sm border border-border/50 flex items-center gap-4 hover:shadow-md transition-all">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                        <Video className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">Dr(a): {room.doctorName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(room.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                      </div>
                      <a href={`/teleconsulta/sala/${room.roomName}`} className="bg-gradient-to-r from-primary to-[hsl(280,50%,50%)] text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0 shadow-md">
                        <Phone className="h-4 w-4" /> Entrar
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next appointments - card grid */}
            {myAppointments.filter(a => a.status === "agendado").length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" /> Próximas Consultas
                  </h3>
                  <button onClick={() => setActiveTab("consultas")} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                    Ver todas <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {myAppointments.filter(a => a.status === "agendado").slice(0, 3).map((a) => (
                    <div key={a.id} className="bg-card rounded-2xl p-5 shadow-sm border border-border/50 hover:shadow-md hover:-translate-y-0.5 transition-all">
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{a.date} às {a.time}</p>
                      <p className="text-xs text-muted-foreground mt-1">Dr(a): {a.doctorName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* === CONSULTAS === */}
        {activeTab === "consultas" && (
          <>
            <h2 className="text-xl font-heading font-semibold text-foreground">Minhas Consultas</h2>

            {/* Teleconsultas */}
            <div>
              <h3 className="text-base font-medium text-foreground mb-3 flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" /> Teleconsultas
              </h3>
              {myRooms.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <Video className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma teleconsulta encontrada.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myRooms.map((room) => {
                    const statusMap: Record<string, { label: string; cls: string }> = {
                      aguardando: { label: "Aguardando", cls: "bg-warning/10 text-warning" },
                      em_andamento: { label: "Em andamento", cls: "bg-success/10 text-success" },
                      finalizada: { label: "Finalizada", cls: "bg-muted text-muted-foreground" },
                    };
                    const s = statusMap[room.status];
                    return (
                      <div key={room.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Video className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-medium text-foreground text-sm">Dr(a): {room.doctorName}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{format(new Date(room.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                        </div>
                        {room.status !== "finalizada" && (
                          <a href={`/teleconsulta/sala/${room.roomName}`} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0">
                            <Phone className="h-4 w-4" /> Entrar
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Appointments */}
            <div>
              <h3 className="text-base font-medium text-foreground mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Consultas Agendadas e Histórico
              </h3>
              {myAppointments.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma consulta encontrada.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myAppointments.map((a) => {
                    const statusColors: Record<string, string> = {
                      agendado: "bg-info/10 text-info",
                      concluido: "bg-success/10 text-success",
                      cancelado: "bg-destructive/10 text-destructive",
                      faltou: "bg-warning/10 text-warning",
                    };
                    const statusLabels: Record<string, string> = {
                      agendado: "Agendado", concluido: "Concluído", cancelado: "Cancelado", faltou: "Faltou",
                    };
                    const isUpcoming = a.status === "agendado";
                    return (
                      <div key={a.id} className="bg-card border border-border rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground">{a.date} às {a.time}</p>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[a.status]}`}>{statusLabels[a.status]}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Dr(a): {a.doctorName} • {a.dayOfWeek}</p>
                          </div>
                          {a.sessionValue && (
                            <span className="text-sm font-medium text-foreground">R$ {a.sessionValue.toFixed(2).replace(".", ",")}</span>
                          )}
                        </div>
                        {isUpcoming && (
                          <div className="flex gap-2 mt-3 ml-13 pl-13">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs border-green-500 text-green-600 hover:bg-green-50"
                              onClick={() => handleConfirmAppointment(a.id)}
                            >
                              <Check className="h-3.5 w-3.5 mr-1" /> Confirmar Presença
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs border-destructive text-destructive hover:bg-destructive/5"
                              onClick={() => { setCancelModal(a.id); setCancelReason(""); setCancelFile(null); }}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Desmarcar
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* === ATIVIDADES === */}
        {activeTab === "atividades" && (
          <>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" /> Minhas Atividades
            </h2>
            {myActivities.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <ListChecks className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma atividade atribuída.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myActivities.map((a) => {
                  const typeIcons: Record<string, React.ReactNode> = {
                    texto: <FileText className="h-5 w-5 text-primary" />,
                    anexo: <FileText className="h-5 w-5 text-primary" />,
                    foto: <Image className="h-5 w-5 text-primary" />,
                    link: <LinkIcon className="h-5 w-5 text-primary" />,
                  };
                  return (
                    <div key={a.id} className={`bg-card border rounded-xl p-4 ${a.completed ? "border-green-200 bg-green-50/30" : "border-border"}`}>
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          {typeIcons[a.type]}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground text-sm">{a.title}</span>
                            {a.completed && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">✓ Concluída</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Dr(a): {a.doctorName} • {format(new Date(a.date), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                          {a.description && <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{a.description}</p>}
                          {a.type === "link" && a.linkUrl && (
                            <a href={a.linkUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary underline mt-1">
                              <ExternalLink className="h-3.5 w-3.5" /> Acessar link
                            </a>
                          )}
                          {a.type === "foto" && a.fileData && (
                            <img src={a.fileData} alt={a.title} className="max-w-xs rounded-lg mt-2 border border-border" />
                          )}
                          {a.type === "anexo" && a.fileData && a.fileName && (
                            <a href={a.fileData} download={a.fileName} className="inline-flex items-center gap-1.5 text-sm text-primary mt-1 underline">
                              <FileText className="h-3.5 w-3.5" /> {a.fileName}
                            </a>
                          )}
                        </div>
                        {!a.completed && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0 text-xs border-green-500 text-green-600 hover:bg-green-50"
                            onClick={() => { updateActivity(a.id, { completed: true }); toast.success("Atividade marcada como concluída!"); }}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" /> Concluir
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* === FINANCEIRO === */}
        {activeTab === "financeiro" && (
          <>
            <h2 className="text-xl font-semibold text-foreground">Financeiro</h2>

            {/* Billing notifications */}
            {myBillingNotifications.length > 0 && (
              <div className="space-y-2">
                {myBillingNotifications.slice(0, 3).map((n) => (
                  <div key={n.id} className={`rounded-xl p-3 flex items-center gap-3 text-sm cursor-pointer ${n.type === "pagamento_atrasado" ? "bg-destructive/10 border border-destructive/30 text-destructive" : n.type === "vencimento_proximo" ? "bg-warning/10 border border-warning/30 text-warning" : "bg-primary/10 border border-primary/30 text-primary"}`} onClick={() => markBillingNotificationRead(n.id)}>
                    {n.type === "pagamento_atrasado" ? <AlertCircle className="h-4 w-4 shrink-0" /> : n.type === "vencimento_proximo" ? <Clock className="h-4 w-4 shrink-0" /> : <Bell className="h-4 w-4 shrink-0" />}
                    <p className="flex-1">{n.message}</p>
                    <span className="text-[10px] opacity-60">{format(new Date(n.date), "dd/MM HH:mm")}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Pago</p>
                <p className="text-xl font-bold text-success">
                  R$ {myCharges.filter(c => c.status === "pago").reduce((s, c) => s + (c.paidAmount || c.amount), 0).toFixed(2).replace(".", ",")}
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Pendente / Atrasado</p>
                <p className="text-xl font-bold text-warning">
                  R$ {totalPendingCharges.toFixed(2).replace(".", ",")}
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Geral</p>
                <p className="text-xl font-bold text-foreground">
                  R$ {myCharges.reduce((s, c) => s + c.amount, 0).toFixed(2).replace(".", ",")}
                </p>
              </div>
            </div>

            {/* Pending / Overdue charges */}
            {pendingCharges.length > 0 && (
              <div>
                <h3 className="text-base font-medium text-foreground mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning" /> Cobranças Pendentes
                </h3>
                <div className="space-y-2">
                  {pendingCharges.map((c) => (
                    <div key={c.id} className={`bg-card border rounded-xl p-4 ${c.status === "atrasado" ? "border-destructive/40" : "border-warning/30"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${c.status === "atrasado" ? "bg-destructive/10" : "bg-warning/10"}`}>
                          {c.status === "atrasado" ? <AlertCircle className="h-5 w-5 text-destructive" /> : <DollarSign className="h-5 w-5 text-warning" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{c.description}</p>
                          <p className="text-xs text-muted-foreground">Vencimento: {c.dueDate.split("-").reverse().join("/")}</p>
                          {c.status === "atrasado" && <p className="text-[10px] text-destructive font-medium mt-0.5">⚠ Pagamento atrasado!</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-sm font-bold ${c.status === "atrasado" ? "text-destructive" : "text-warning"}`}>
                            R$ {c.amount.toFixed(2).replace(".", ",")}
                          </p>
                          <p className={`text-[10px] font-medium ${c.status === "atrasado" ? "text-destructive" : "text-warning"}`}>
                            {c.status === "atrasado" ? "Atrasado" : "Pendente"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1 bg-primary" onClick={() => { setPayModal(c.id); setPayMethod("pix"); }}>
                          <Smartphone className="h-3.5 w-3.5 mr-1" /> Pagar via PIX
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => { setPayModal(c.id); setPayMethod("cartao"); }}>
                          <CreditCard className="h-3.5 w-3.5 mr-1" /> Cartão
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History */}
            <div>
              <h3 className="text-base font-medium text-foreground mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Histórico de Pagamentos
              </h3>
              {myCharges.length === 0 && myPayments.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <CreditCard className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum pagamento registrado.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myCharges.filter(c => c.status === "pago").map((c) => (
                    <div key={c.id} className="bg-card border border-success/30 rounded-xl p-3 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{c.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.paidAt ? format(new Date(c.paidAt), "dd/MM/yyyy HH:mm", { locale: ptBR }) : c.dueDate.split("-").reverse().join("/")} • {c.method === "pix" ? "PIX" : c.method === "cartao" ? "Cartão" : "Dinheiro"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-success">R$ {(c.paidAmount || c.amount).toFixed(2).replace(".", ",")}</p>
                        <p className="text-[10px] font-medium text-success">Pago ✓</p>
                      </div>
                    </div>
                  ))}
                  {myPayments.map((p) => (
                    <div key={p.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${p.status === "pago" ? "bg-success/10" : "bg-warning/10"}`}>
                        {p.status === "pago" ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Clock className="h-5 w-5 text-warning" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{p.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(p.date), "dd/MM/yyyy", { locale: ptBR })} • {p.method === "pix" ? "PIX" : p.method === "cartao" ? "Cartão" : "Dinheiro"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${p.status === "pago" ? "text-success" : "text-warning"}`}>
                          R$ {p.amount.toFixed(2).replace(".", ",")}
                        </p>
                        <p className={`text-[10px] font-medium ${p.status === "pago" ? "text-success" : "text-warning"}`}>
                          {p.status === "pago" ? "Pago" : "Pendente"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment confirmation modal */}
            {payModal && (() => {
              const charge = myCharges.find((c) => c.id === payModal);
              if (!charge) return null;

              const handleConfirmPayment = () => {
                if (payMethod === "cartao") {
                  if (!cardForm.number || !cardForm.name || !cardForm.expiry || !cardForm.cvv) {
                    toast.error("Preencha todos os dados do cartão.");
                    return;
                  }
                  if (cardForm.number.replace(/\s/g, "").length < 16) {
                    toast.error("Número do cartão inválido.");
                    return;
                  }
                }
                setPayStep("processing");
                setTimeout(() => {
                  markAsPaid(charge.id, payMethod);
                  const patientName = linkedPatient?.name || account?.name || "Paciente";
                  addBillingNotification({
                    patientId: charge.patientId,
                    type: "pagamento_confirmado",
                    message: `${patientName} pagou R$ ${charge.amount.toFixed(2)} via ${payMethod === "pix" ? "PIX" : "Cartão"} - ${charge.description}`,
                    chargeId: charge.id,
                    date: new Date().toISOString(),
                    read: true,
                    readByAdmin: false,
                  });
                  setPayStep("done");
                }, 2500);
              };

              const closePayModal = () => {
                setPayModal(null);
                setPayStep("choose");
                setCardForm({ number: "", name: "", expiry: "", cvv: "" });
              };

              const maskCardNumber = (v: string) => {
                const digits = v.replace(/\D/g, "").slice(0, 16);
                return digits.replace(/(.{4})/g, "$1 ").trim();
              };
              const maskExpiry = (v: string) => {
                const digits = v.replace(/\D/g, "").slice(0, 4);
                if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
                return digits;
              };

              return (
                <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4" onClick={closePayModal}>
                  <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
                    
                    {/* Header */}
                    <div className="p-5 text-center border-b border-border">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        {payStep === "done" ? <CheckCircle2 className="h-7 w-7 text-success" /> :
                         payStep === "processing" ? <Clock className="h-7 w-7 text-primary animate-spin" /> :
                         payMethod === "pix" ? <Smartphone className="h-7 w-7 text-primary" /> : <CreditCard className="h-7 w-7 text-primary" />}
                      </div>
                      <h3 className="font-semibold text-foreground text-lg">
                        {payStep === "done" ? "Pagamento Confirmado! ✅" :
                         payStep === "processing" ? "Processando..." :
                         payStep === "details" ? (payMethod === "pix" ? "Pagamento via PIX" : "Pagamento via Cartão") :
                         "Escolha a forma de pagamento"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{charge.description}</p>
                      <p className="text-2xl font-bold text-foreground mt-2">R$ {charge.amount.toFixed(2).replace(".", ",")}</p>
                    </div>

                    <div className="p-5 space-y-4">
                      
                      {/* STEP: Choose method */}
                      {payStep === "choose" && (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setPayMethod("pix")} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${payMethod === "pix" ? "bg-primary/10 border-primary" : "border-border hover:border-muted-foreground"}`}>
                              <Smartphone className={`h-8 w-8 ${payMethod === "pix" ? "text-primary" : "text-muted-foreground"}`} />
                              <span className={`text-sm font-medium ${payMethod === "pix" ? "text-primary" : "text-muted-foreground"}`}>PIX</span>
                              <span className="text-[10px] text-muted-foreground">Instantâneo</span>
                            </button>
                            <button onClick={() => setPayMethod("cartao")} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${payMethod === "cartao" ? "bg-primary/10 border-primary" : "border-border hover:border-muted-foreground"}`}>
                              <CreditCard className={`h-8 w-8 ${payMethod === "cartao" ? "text-primary" : "text-muted-foreground"}`} />
                              <span className={`text-sm font-medium ${payMethod === "cartao" ? "text-primary" : "text-muted-foreground"}`}>Cartão</span>
                              <span className="text-[10px] text-muted-foreground">Crédito/Débito</span>
                            </button>
                          </div>
                          <Button className="w-full py-3" onClick={() => setPayStep("details")}>
                            Continuar <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </>
                      )}

                      {/* STEP: PIX Details */}
                      {payStep === "details" && payMethod === "pix" && (
                        <>
                          {/* QR Code simulation */}
                          <div className="bg-background border border-border rounded-xl p-4 text-center">
                            <div className="w-48 h-48 mx-auto bg-foreground/5 rounded-xl flex items-center justify-center mb-3 relative overflow-hidden">
                              {/* Simulated QR Code pattern */}
                              <div className="grid grid-cols-8 gap-[2px] p-3">
                                {Array.from({ length: 64 }).map((_, i) => (
                                  <div key={i} className={`w-4 h-4 rounded-sm ${Math.random() > 0.4 ? "bg-foreground" : "bg-background"}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">Escaneie o QR Code ou copie a chave</p>
                          </div>

                          {/* PIX Key */}
                          <div className="bg-background border border-border rounded-xl p-3">
                            <p className="text-[10px] text-muted-foreground mb-1 font-medium">Chave PIX (Aleatória)</p>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-xs text-foreground bg-muted/50 px-2 py-1.5 rounded-lg font-mono break-all">{pixKey}</code>
                              <button
                                onClick={() => { navigator.clipboard.writeText(pixKey); toast.success("Chave PIX copiada!"); }}
                                className="shrink-0 px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg hover:bg-primary/90 transition-colors"
                              >
                                Copiar
                              </button>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => setPayStep("choose")}>Voltar</Button>
                            <Button className="flex-1 bg-success hover:bg-success/90" onClick={handleConfirmPayment}>
                              Já Paguei ✓
                            </Button>
                          </div>
                        </>
                      )}

                      {/* STEP: Card Details */}
                      {payStep === "details" && payMethod === "cartao" && (
                        <>
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-medium text-foreground mb-1 block">Número do Cartão</label>
                              <input
                                value={cardForm.number}
                                onChange={(e) => setCardForm({ ...cardForm, number: maskCardNumber(e.target.value) })}
                                placeholder="0000 0000 0000 0000"
                                maxLength={19}
                                className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring font-mono tracking-wider"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-foreground mb-1 block">Nome no Cartão</label>
                              <input
                                value={cardForm.name}
                                onChange={(e) => setCardForm({ ...cardForm, name: e.target.value.toUpperCase() })}
                                placeholder="NOME COMO ESTÁ NO CARTÃO"
                                className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring uppercase"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium text-foreground mb-1 block">Validade</label>
                                <input
                                  value={cardForm.expiry}
                                  onChange={(e) => setCardForm({ ...cardForm, expiry: maskExpiry(e.target.value) })}
                                  placeholder="MM/AA"
                                  maxLength={5}
                                  className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-foreground mb-1 block">CVV</label>
                                <input
                                  value={cardForm.cvv}
                                  onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                                  placeholder="000"
                                  maxLength={4}
                                  type="password"
                                  className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring font-mono"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/30 rounded-lg p-2">
                              <Shield className="h-3.5 w-3.5 shrink-0" />
                              <span>Seus dados são criptografados e processados com segurança.</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => setPayStep("choose")}>Voltar</Button>
                            <Button className="flex-1" onClick={handleConfirmPayment}>
                              Pagar R$ {charge.amount.toFixed(2).replace(".", ",")}
                            </Button>
                          </div>
                        </>
                      )}

                      {/* STEP: Processing */}
                      {payStep === "processing" && (
                        <div className="text-center py-6">
                          <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground">Processando seu pagamento...</p>
                          <p className="text-xs text-muted-foreground mt-1">Aguarde um momento</p>
                        </div>
                      )}

                      {/* STEP: Done */}
                      {payStep === "done" && (
                        <div className="text-center py-4">
                          <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="h-8 w-8 text-success" />
                          </div>
                          <p className="font-semibold text-foreground text-lg">Pagamento Aprovado!</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            R$ {charge.amount.toFixed(2).replace(".", ",")} via {payMethod === "pix" ? "PIX" : "Cartão"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-3">O comprovante foi registrado automaticamente.</p>
                          <Button className="w-full mt-4" onClick={closePayModal}>Fechar</Button>
                        </div>
                      )}

                      {payStep === "choose" && (
                        <button onClick={closePayModal} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">Cancelar</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {/* === MENSAGENS === */}
        {activeTab === "mensagens" && (
          <>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" /> Conversas
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: 480 }}>
              {/* Contact list */}
              <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
                <div className="p-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground">Contatos</p>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-border">
                  {/* Doctors */}
                  {settings.doctors.map((d) => {
                    const dp = getChatPresence(d);
                    const doctorMsgs = myMessages.filter((m) => m.doctorName === d);
                    const unread = doctorMsgs.filter((m) => !m.read && m.sender === "doctor").length;
                    const lastMsg = doctorMsgs.sort((a, b) => b.date.localeCompare(a.date))[0];
                    return (
                      <button
                        key={d}
                        onClick={() => { setChatContact(d); setMsgDoctor(d); }}
                        className={`w-full text-left p-3 flex items-center gap-3 transition-colors ${chatContact === d ? "bg-primary/10" : "hover:bg-secondary"}`}
                      >
                        <div className="relative shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                            {d.charAt(0)}
                          </div>
                          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${dp?.isOnline ? "bg-emerald-500" : "bg-destructive/60"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{d}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {lastMsg ? lastMsg.content.slice(0, 40) : "Iniciar conversa"}
                          </p>
                        </div>
                        {unread > 0 && (
                          <span className="bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center shrink-0">{unread}</span>
                        )}
                      </button>
                    );
                  })}

                  {/* Suporte */}
                  {(() => {
                    const lastSupportMsg = mySupportMessages[mySupportMessages.length - 1];
                    return (
                      <button
                        onClick={() => setChatContact("suporte")}
                        className={`w-full text-left p-3 flex items-center gap-3 transition-colors ${chatContact === "suporte" ? "bg-primary/10" : "hover:bg-secondary"}`}
                      >
                        <div className="relative shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-primary" />
                          </div>
                          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${getChatPresence("admin-support")?.isOnline ? "bg-emerald-500" : "bg-destructive/60"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">Suporte</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {lastSupportMsg ? lastSupportMsg.content.slice(0, 40) : "Falar com o suporte"}
                          </p>
                        </div>
                        {unreadSupportMessages > 0 && (
                          <span className="bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center shrink-0">{unreadSupportMessages}</span>
                        )}
                      </button>
                    );
                  })()}
                </div>
              </div>

              {/* Chat area */}
              <div className="lg:col-span-2 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
                {!chatContact ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Selecione uma conversa para começar</p>
                    </div>
                  </div>
                ) : chatContact === "suporte" ? (
                  /* Support chat */
                  <>
                    <div className="p-3 border-b border-border flex items-center gap-3 shrink-0">
                      <div className="relative shrink-0">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${getChatPresence("admin-support")?.isOnline ? "bg-emerald-500" : "bg-destructive/60"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Suporte</p>
                        <PresenceDot isOnline={getChatPresence("admin-support")?.isOnline || false} />
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {mySupportMessages.length === 0 ? (
                        <div className="text-center py-8">
                          <Shield className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">Envie uma mensagem para o suporte</p>
                        </div>
                      ) : (
                        mySupportMessages.map((msg) => {
                          const isMe = msg.sender === "patient";
                          return (
                            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                                {msg.type === "image" && msg.fileUrl && (
                                  <img src={msg.fileUrl} alt="Imagem" className="rounded-lg max-w-full mb-1 max-h-48 object-cover" />
                                )}
                                {msg.type === "file" && msg.fileUrl && (
                                  <a href={msg.fileUrl} download={msg.fileName} className="flex items-center gap-1 underline text-xs mb-1">📎 {msg.fileName}</a>
                                )}
                                {msg.content && <p>{msg.content}</p>}
                                <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                                  {format(new Date(msg.timestamp), "dd/MM HH:mm")}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="p-3 border-t border-border shrink-0">
                      <div className="flex gap-2 items-center">
                        <EmojiPicker onSelect={(emoji) => setMsgText((prev) => prev + emoji)} />
                        <input
                          value={msgText}
                          onChange={(e) => setMsgText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (!msgText.trim() || !account) return;
                              let ticket = mySupportTicket;
                              if (!ticket) {
                                ticket = supportCreateTicket({
                                  patientAccountId: account.id,
                                  patientName: account.name,
                                  patientAvatar: account.avatar,
                                });
                              }
                              supportAddMessage({
                                ticketId: ticket.id,
                                sender: "patient",
                                senderName: account.name,
                                senderAvatar: account.avatar,
                                content: msgText.trim(),
                                type: "text",
                              });
                              setMsgText("");
                              setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
                            }
                          }}
                          placeholder="Mensagem para o suporte..."
                          className="flex-1 border border-input bg-background rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                        <Button size="sm" onClick={() => {
                          if (!msgText.trim() || !account) return;
                          let ticket = mySupportTicket;
                          if (!ticket) {
                            ticket = supportCreateTicket({
                              patientAccountId: account.id,
                              patientName: account.name,
                              patientAvatar: account.avatar,
                            });
                          }
                          supportAddMessage({
                            ticketId: ticket.id,
                            sender: "patient",
                            senderName: account.name,
                            senderAvatar: account.avatar,
                            content: msgText.trim(),
                            type: "text",
                          });
                          setMsgText("");
                          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
                        }}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Doctor chat */
                  (() => {
                    const doctorMsgs = myMessages
                      .filter((m) => m.doctorName === chatContact)
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    const dp = getChatPresence(chatContact);
                    return (
                      <>
                        <div className="p-3 border-b border-border flex items-center gap-3 shrink-0">
                          <div className="relative shrink-0">
                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                              {chatContact.charAt(0)}
                            </div>
                            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${dp?.isOnline ? "bg-emerald-500" : "bg-destructive/60"}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{chatContact}</p>
                            <PresenceLabel
                              isOnline={dp?.isOnline || false}
                              lastSeen={dp?.lastSeen}
                            />
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                          {doctorMsgs.length === 0 ? (
                            <div className="text-center py-8">
                              <MessageCircle className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                              <p className="text-xs text-muted-foreground">Nenhuma mensagem com este profissional. Envie a primeira!</p>
                            </div>
                          ) : (
                            doctorMsgs.map((msg) => {
                              if (!msg.read && msg.sender === "doctor") markPatientMessageRead(msg.id);
                              const isMe = msg.sender === "patient";
                              return (
                                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                                    {!isMe && <p className="text-[10px] font-semibold mb-0.5 opacity-70">Dr(a). {msg.doctorName}</p>}
                                    {msg.imageUrl && <img src={msg.imageUrl} alt="Imagem" className="rounded-lg max-w-full mb-1 max-h-48 object-cover" />}
                                    {msg.content && <p>{msg.content}</p>}
                                    <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                                      {format(new Date(msg.date), "dd/MM HH:mm")}
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                          <div ref={chatEndRef} />
                        </div>

                        <div className="p-3 border-t border-border shrink-0">
                          <div className="flex gap-2 items-center">
                            <EmojiPicker onSelect={(emoji) => setMsgText((prev) => prev + emoji)} />
                            <input
                              value={msgText}
                              onChange={(e) => setMsgText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleSendMessage();
                                  setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
                                }
                              }}
                              placeholder={`Mensagem para ${chatContact}...`}
                              className="flex-1 border border-input bg-background rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />
                            <Button size="sm" onClick={() => {
                              handleSendMessage();
                              setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
                            }}>
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    );
                  })()
                )}
              </div>
            </div>
          </>
        )}

        {/* === AVISOS === */}
        {activeTab === "avisos" && (
          <>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" /> Avisos da Clínica
              {unreadAnnouncements > 0 && (
                <span className="h-6 min-w-6 px-2 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                  {unreadAnnouncements} novo(s)
                </span>
              )}
            </h2>
            {patientAnnouncements.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum aviso no momento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...patientAnnouncements].reverse().map((a) => {
                  const isUnread = account && !a.readBy.includes(account.id);
                  return (
                    <div
                      key={a.id}
                      className={`bg-card border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${isUnread ? "border-primary/40 ring-1 ring-primary/20" : "border-border"}`}
                      onClick={() => {
                        if (isUnread && account) markPatientAnnouncementRead(a.id, account.id);
                        setExpandedAnnouncement(expandedAnnouncement === a.id ? null : a.id);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${isUnread ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                          <Megaphone className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">{a.title}</h3>
                            {isUnread && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">Novo</span>
                            )}
                            <ChevronRight className={`h-4 w-4 text-muted-foreground ml-auto transition-transform duration-200 ${expandedAnnouncement === a.id ? "rotate-90" : ""}`} />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {a.from} · {format(new Date(a.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>

                          {/* Preview quando fechado */}
                          {expandedAnnouncement !== a.id && (
                            <div className="mt-1.5 text-sm text-muted-foreground line-clamp-2" dangerouslySetInnerHTML={{ __html: a.content }} />
                          )}

                          {/* Expandido */}
                          {expandedAnnouncement === a.id && (
                            <div className="mt-3 animate-fade-in">
                              <div className="text-sm text-foreground prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: a.content }} />
                              {a.imageUrl && (
                                <img
                                  src={a.imageUrl}
                                  alt=""
                                  className="max-w-full rounded-lg mt-3 border border-border cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={(e) => { e.stopPropagation(); setZoomedImage(a.imageUrl!); }}
                                />
                              )}
                              {a.fileName && (
                                <a
                                  href={a.fileUrl}
                                  download={a.fileName}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-2 mt-3 text-xs text-primary hover:underline bg-primary/5 rounded-lg px-3 py-2"
                                >
                                  <Download className="h-4 w-4" />{a.fileName}
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* === PERFIL === */}
        {activeTab === "perfil" && (
          <>
            <h2 className="text-xl font-heading font-semibold text-foreground">Meu Perfil</h2>

            <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50">
              <div className="bg-gradient-to-r from-[hsl(260,60%,30%)] via-[hsl(260,55%,40%)] to-[hsl(280,50%,50%)] p-6 flex items-center gap-4">
                <div className="relative group shrink-0">
                  {account.avatar ? (
                    <img src={account.avatar} alt={account.name} className="h-20 w-20 rounded-full object-cover ring-3 ring-primary-foreground/30" />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground text-3xl font-bold">
                      {account.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <label className="absolute inset-0 rounded-full bg-foreground/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="h-6 w-6 text-primary-foreground" />
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-foreground">{account.name}</h3>
                  <p className="text-sm text-primary-foreground/70">{account.email}</p>
                  {linkedPatient ? (
                    <span className="text-xs bg-primary-foreground/20 text-primary-foreground px-2 py-0.5 rounded-full mt-1 inline-block">✓ Vinculado à clínica</span>
                  ) : (
                    <span className="text-xs bg-warning/30 text-primary-foreground px-2 py-0.5 rounded-full mt-1 inline-block">⚠ Não vinculado</span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Nome Completo</label>
                    <p className="text-sm font-medium text-foreground">{account.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">E-mail</label>
                    <p className="text-sm font-medium text-foreground">{account.email}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Telefone</label>
                    <p className="text-sm font-medium text-foreground">{account.phone || "—"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">CPF</label>
                    <p className="text-sm font-medium text-foreground">{account.cpf || "—"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Data de Nascimento</label>
                    <p className="text-sm font-medium text-foreground">{account.birthDate ? format(new Date(account.birthDate + "T00:00:00"), "dd/MM/yyyy") : "—"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Cadastro em</label>
                    <p className="text-sm font-medium text-foreground">{format(new Date(account.createdAt), "dd/MM/yyyy", { locale: ptBR })}</p>
                  </div>
                </div>

                {linkedPatient && (
                  <div className="border-t border-border pt-4 mt-4">
                    <h4 className="text-sm font-medium text-foreground mb-3">Dados na Clínica</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">Endereço</label>
                        <p className="text-sm font-medium text-foreground">{linkedPatient.address || "—"}</p>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Observações</label>
                        <p className="text-sm font-medium text-foreground">{linkedPatient.notes || "—"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Nota Fiscal */}
            {account && <InvoiceDataSection patientId={linkedPatient?.id || account.id} />}
          </>
        )}

        {/* === TUTORIAL === */}
        {activeTab === "tutorial" && (
          <PatientTutorialSection />
        )}
      </main>

      {/* Zoomed Image Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={() => setZoomedImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-2 right-2 z-10 bg-card/80 backdrop-blur-sm rounded-full p-2 text-foreground hover:bg-card transition-colors shadow-lg"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={zoomedImage}
              alt="Imagem ampliada"
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-foreground/30 z-50 flex items-center justify-center p-4" onClick={() => setCancelModal(null)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Desmarcar Consulta</h2>
              <button onClick={() => setCancelModal(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Motivo do cancelamento *</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Escreva o motivo pelo qual não poderá comparecer..."
                  rows={3}
                  className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Anexar atestado (opcional)</label>
                <p className="text-xs text-muted-foreground mb-2">Se possui atestado médico, anexe aqui (PDF, imagem, máx. 10MB).</p>
                <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-input rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{cancelFile ? cancelFile.name : "Selecionar arquivo..."}</span>
                  <input type="file" accept="image/*,.pdf" onChange={handleCancelFileUpload} className="hidden" />
                </label>
                {cancelFile && (
                  <button onClick={() => setCancelFile(null)} className="text-xs text-destructive mt-1 hover:underline">Remover arquivo</button>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setCancelModal(null)}>Voltar</Button>
                <Button variant="destructive" onClick={handleCancelAppointment}>Confirmar Cancelamento</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Chat Widget */}
      <SupportChatWidget
        patientAccountId={account.id}
        patientName={account.name}
        patientAvatar={account.avatar}
      />
    </div>
  );
}
