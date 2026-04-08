import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import EmojiPicker from "@/components/EmojiPicker";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useClinicStore } from "@/data/clinicStore";
import { useTeleconsultaStore } from "@/data/teleconsultaStore";
import { useAuthStore } from "@/data/authStore";
import { useAdminStore } from "@/data/adminStore";
import { useChatPresenceStore } from "@/data/chatPresenceStore";
import { PresenceBadge, PresenceLabel } from "@/components/PresenceIndicator";
import { Button } from "@/components/ui/button";
import { Send, Megaphone, Paperclip, Trash2, X, FileText, Download, Bell, Users, Image, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MensagensPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [searchParams] = useSearchParams();
  const messages = useClinicStore((s) => s.messages);
  const announcements = useClinicStore((s) => s.announcements);
  const doctors = useClinicStore((s) => s.settings.doctors);
  const addMessage = useClinicStore((s) => s.addMessage);
  const markMessageRead = useClinicStore((s) => s.markMessageRead);
  const addAnnouncement = useClinicStore((s) => s.addAnnouncement);
  const deleteAnnouncement = useClinicStore((s) => s.deleteAnnouncement);
  const { patientAccounts, patientMessages, addPatientMessage, markPatientMessageRead } = useTeleconsultaStore();
  const clinicPatients = useClinicStore((s) => s.patients);
  const [tab, setTab] = useState<"messages" | "announcements">("messages");
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0] || "");
  const [msgContent, setMsgContent] = useState("");
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annFile, setAnnFile] = useState<{ url: string; name: string } | null>(null);
  const [annTargetDoctors, setAnnTargetDoctors] = useState<string[]>([]);
  const [msgFile, setMsgFile] = useState<{ url: string; name: string } | null>(null);
  const [msgImage, setMsgImage] = useState<{ url: string; name: string } | null>(null);

  // Auto-select "admin" when navigating with ?to=admin (doctor chat with admin)
  useEffect(() => {
    const toParam = searchParams.get("to");
    if (toParam === "admin") {
      setSelectedDoctor("admin");
      setTab("messages");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedDoctor || !doctors.includes(selectedDoctor)) {
      // Don't override if "admin" was set via query param
      if (selectedDoctor !== "admin") {
        setSelectedDoctor(doctors[0] || "");
      }
    }
  }, [doctors, selectedDoctor]);

  const isDoctor = currentUser?.role === "doctor";
  const myIdentity = isDoctor ? currentUser.username : "admin";
  const { setOnline, setOffline, getPresence } = useChatPresenceStore();

  // Set current user online
  useEffect(() => {
    if (myIdentity) {
      setOnline(myIdentity, myIdentity, isDoctor ? "doctor" : "admin");
      return () => { setOffline(myIdentity); };
    }
  }, [myIdentity, isDoctor, setOnline, setOffline]);

  const doctorMessages = messages
    .filter((m) => {
      if (isDoctor) {
        // Doctor chatting with admin
        return (m.from === myIdentity && m.to === "admin") || (m.from === "admin" && m.to === myIdentity);
      }
      // Admin chatting with selected doctor
      return (m.from === selectedDoctor && m.to === "admin") || (m.from === "admin" && m.to === selectedDoctor);
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleSendMessage = () => {
    if (!msgContent.trim() && !msgFile && !msgImage) return;
    addMessage({
      from: myIdentity,
      to: isDoctor ? "admin" : selectedDoctor,
      content: msgContent.trim(),
      date: new Date().toISOString(),
      read: false,
      fileUrl: msgFile?.url,
      fileName: msgFile?.name,
      imageUrl: msgImage?.url,
    });
    setMsgContent("");
    setMsgFile(null);
    setMsgImage(null);
    toast.success("Mensagem enviada!");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "msg") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (target === "msg") setMsgImage({ url: reader.result as string, name: file.name });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "msg" | "ann") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "msg") setMsgFile({ url, name: file.name });
    else setAnnFile({ url, name: file.name });
  };

  const handlePostAnnouncement = () => {
    if (!annTitle.trim() || !annContent.trim()) {
      toast.error("Título e conteúdo são obrigatórios.");
      return;
    }
    addAnnouncement({
      title: annTitle.trim(),
      content: annContent.trim(),
      from: "admin",
      date: new Date().toISOString(),
      fileUrl: annFile?.url,
      fileName: annFile?.name,
      targetDoctors: annTargetDoctors,
    });
    setAnnTitle("");
    setAnnContent("");
    setAnnFile(null);
    setAnnTargetDoctors([]);
    setAnnFile(null);
    setShowAnnouncementForm(false);
    toast.success("Aviso publicado!");
  };

  // Simulate receiving a doctor reply
  const simulateDoctorReply = () => {
    addMessage({
      from: selectedDoctor,
      to: "admin",
      content: "Olá! Recebi sua mensagem. Vou verificar e retorno em breve.",
      date: new Date().toISOString(),
      read: false,
    });
    toast.info(`Nova mensagem de ${selectedDoctor}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Mensagens & Avisos</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          <button
            onClick={() => setTab("messages")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${tab === "messages" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Send className="h-4 w-4 inline mr-2" />Conversas
          </button>
          <button
            onClick={() => setTab("announcements")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${tab === "announcements" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Megaphone className="h-4 w-4 inline mr-2" />Avisos / Mural
          </button>
        </div>

        {tab === "messages" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Doctor list */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-3 border-b border-border">
                <p className="text-sm font-medium text-foreground">Doutores</p>
              </div>
              <div className="divide-y divide-border">
                {doctors.map((doc) => {
                  const unread = messages.filter((m) => m.from === doc && m.to === "admin" && !m.read).length;
                  return (
                    <button
                      key={doc}
                      onClick={() => {
                        setSelectedDoctor(doc);
                        messages.filter((m) => m.from === doc && m.to === "admin" && !m.read).forEach((m) => markMessageRead(m.id));
                      }}
                      className={`w-full text-left p-3 flex items-center gap-3 transition-colors ${selectedDoctor === doc ? "bg-primary/10" : "hover:bg-secondary"}`}
                    >
                      <div className="relative shrink-0">
                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                          {doc[0]}
                        </div>
                        <PresenceBadge isOnline={getPresence(doc)?.isOnline || false} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{doc}</p>
                        <PresenceLabel
                          isOnline={getPresence(doc)?.isOnline || false}
                          lastSeen={getPresence(doc)?.lastSeen}
                        />
                      </div>
                      {unread > 0 && (
                        <span className="bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">{unread}</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="p-3 border-t border-border">
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={simulateDoctorReply}>
                  Simular resposta do Dr.
                </Button>
              </div>
            </div>

            {/* Chat area */}
            <div className="lg:col-span-3 bg-card border border-border rounded-xl flex flex-col" style={{ minHeight: 400 }}>
              <div className="p-3 border-b border-border flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                    {selectedDoctor[0]}
                  </div>
                  <PresenceBadge isOnline={getPresence(selectedDoctor)?.isOnline || false} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{selectedDoctor}</p>
                  <PresenceLabel
                    isOnline={getPresence(selectedDoctor)?.isOnline || false}
                    lastSeen={getPresence(selectedDoctor)?.lastSeen}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {doctorMessages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhuma mensagem ainda. Inicie a conversa!</p>
                )}
                {doctorMessages.map((m) => (
                  <div key={m.id} className={`flex ${m.from === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-xl px-4 py-2.5 ${m.from === "admin" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                      {m.imageUrl && (
                        <img src={m.imageUrl} alt="Imagem" className="rounded-lg max-w-full mb-1 max-h-48 object-cover cursor-pointer" onClick={() => window.open(m.imageUrl, '_blank')} />
                      )}
                      {m.content && <p className="text-sm">{m.content}</p>}
                      {m.fileName && !m.imageUrl && (
                        <a href={m.fileUrl} download={m.fileName} className="flex items-center gap-2 mt-1 text-xs underline">
                          <Paperclip className="h-3 w-3" />{m.fileName}
                        </a>
                      )}
                      <p className={`text-[10px] mt-1 ${m.from === "admin" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {format(new Date(m.date), "dd/MM HH:mm")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border">
                {msgImage && (
                  <div className="flex items-center gap-2 mb-2 bg-secondary rounded-lg px-3 py-2 text-xs">
                    <img src={msgImage.url} alt="" className="h-10 w-10 rounded object-cover" />
                    <span className="flex-1 truncate text-foreground">{msgImage.name}</span>
                    <button onClick={() => setMsgImage(null)}><X className="h-3 w-3 text-muted-foreground" /></button>
                  </div>
                )}
                {msgFile && (
                  <div className="flex items-center gap-2 mb-2 bg-secondary rounded-lg px-3 py-2 text-xs">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="flex-1 truncate text-foreground">{msgFile.name}</span>
                    <button onClick={() => setMsgFile(null)}><X className="h-3 w-3 text-muted-foreground" /></button>
                  </div>
                )}
                <div className="flex gap-2 items-center">
                  <label className="p-2 text-muted-foreground hover:text-foreground cursor-pointer hover:bg-secondary rounded-lg transition-colors">
                    <Image className="h-5 w-5" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "msg")} />
                  </label>
                  <label className="p-2 text-muted-foreground hover:text-foreground cursor-pointer hover:bg-secondary rounded-lg transition-colors">
                    <Paperclip className="h-5 w-5" />
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, "msg")} />
                  </label>
                  <EmojiPicker onSelect={(emoji) => setMsgContent((prev) => prev + emoji)} />
                  <input
                    value={msgContent}
                    onChange={(e) => setMsgContent(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button size="sm" onClick={handleSendMessage}><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          </div>
        )}


        {tab === "announcements" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setShowAnnouncementForm(true)}>
                <Megaphone className="h-4 w-4 mr-1" /> Novo Aviso
              </Button>
            </div>

            {showAnnouncementForm && (
              <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4" onClick={() => setShowAnnouncementForm(false)}>
                <div className="bg-card border border-border rounded-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">Novo Aviso</h2>
                    <button onClick={() => setShowAnnouncementForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Título *</label>
                      <input value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Título do aviso" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Conteúdo *</label>
                      <textarea value={annContent} onChange={(e) => setAnnContent(e.target.value)} rows={4} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" placeholder="Escreva o aviso..." />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Destinatários *</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setAnnTargetDoctors([])}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${annTargetDoctors.length === 0 ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
                        >
                          <Users className="h-3 w-3 inline mr-1" />Todos
                        </button>
                        {doctors.map((doc) => (
                          <button
                            key={doc}
                            type="button"
                            onClick={() => {
                              setAnnTargetDoctors((prev) =>
                                prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
                              );
                            }}
                            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${annTargetDoctors.includes(doc) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
                          >
                            {doc}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Anexar arquivo</label>
                      {annFile ? (
                        <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 text-xs">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="flex-1 truncate text-foreground">{annFile.name}</span>
                          <button onClick={() => setAnnFile(null)}><X className="h-3 w-3 text-muted-foreground" /></button>
                        </div>
                      ) : (
                        <label className="flex items-center gap-2 border border-dashed border-border rounded-lg px-3 py-3 cursor-pointer hover:bg-secondary transition-colors">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Clique para anexar</span>
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, "ann")} />
                        </label>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handlePostAnnouncement} className="flex-1">Publicar</Button>
                      <Button variant="outline" onClick={() => setShowAnnouncementForm(false)} className="flex-1">Cancelar</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {announcements.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <Megaphone className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum aviso publicado ainda.</p>
                </div>
              ) : (
                [...announcements].reverse().map((a) => (
                  <div key={a.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-warning/10 text-warning flex items-center justify-center shrink-0">
                          <Bell className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{a.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {a.from} · {format(new Date(a.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                          <span className="inline-flex items-center gap-1 mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            <Users className="h-3 w-3" />
                            {!a.targetDoctors || a.targetDoctors.length === 0 ? "Todos" : a.targetDoctors.join(", ")}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => { deleteAnnouncement(a.id); toast.success("Aviso removido."); }} className="text-muted-foreground hover:text-destructive p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-foreground mt-3 whitespace-pre-wrap">{a.content}</p>
                    {a.fileName && (
                      <a href={a.fileUrl} download={a.fileName} className="inline-flex items-center gap-2 mt-3 text-xs text-primary hover:underline bg-primary/5 rounded-lg px-3 py-2">
                        <Download className="h-4 w-4" />{a.fileName}
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Patient messages sub-component for admin/doctor to respond
function PatientMessagesSection({
  patientAccounts,
  clinicPatients,
  patientMessages,
  addPatientMessage,
  markPatientMessageRead,
  doctors,
  currentUser,
}: {
  patientAccounts: import("@/data/teleconsultaStore").PatientAccount[];
  clinicPatients: import("@/data/clinicStore").Patient[];
  patientMessages: import("@/data/teleconsultaStore").PatientMessage[];
  addPatientMessage: (m: Omit<import("@/data/teleconsultaStore").PatientMessage, "id">) => string;
  markPatientMessageRead: (id: string) => void;
  doctors: string[];
  currentUser: { username: string; role: string } | null;
}) {
  const adminDoctors = useAdminStore((s) => s.doctors);
  const appointments = useClinicStore((s) => s.appointments);
  const isAdmin = currentUser?.role === "admin";
  const doctorProfile = adminDoctors.find((d) => d.loginUsername === currentUser?.username);
  const myDoctorName = doctorProfile?.name || "";
  const [selectedPatientId, setSelectedPatientId] = useState(patientAccounts[0]?.id || "");
  const [replyText, setReplyText] = useState("");
  const [replyFile, setReplyFile] = useState<{ url: string; name: string } | null>(null);
  const [replyImage, setReplyImage] = useState<{ url: string; name: string } | null>(null);
  const [showAgendaPatients, setShowAgendaPatients] = useState(false);
  const [replyDoctor, setReplyDoctor] = useState(isAdmin ? (doctors[0] || "") : myDoctorName);

  // Patients from doctor's agenda (unique)
  const agendaPatientIds = useMemo(() => {
    const myAppts = isAdmin
      ? appointments
      : appointments.filter((a) => a.doctorName === myDoctorName);
    const ids = [...new Set(myAppts.map((a) => a.patientId))];
    return ids;
  }, [appointments, isAdmin, myDoctorName]);

  // For doctors: show patients with existing conversations OR from their agenda
  const visiblePatientAccounts = useMemo(() => {
    if (isAdmin) return patientAccounts;
    const withConversation = patientAccounts.filter((acc) =>
      patientMessages.some(
        (m) => (m.patientAccountId === acc.id || m.patientId === acc.patientId) && m.doctorName === myDoctorName
      )
    );
    // Also include patients from agenda that have portal accounts
    const fromAgenda = patientAccounts.filter((acc) =>
      agendaPatientIds.includes(acc.patientId) && !withConversation.some((w) => w.id === acc.id)
    );
    return [...withConversation, ...fromAgenda];
  }, [isAdmin, patientAccounts, patientMessages, myDoctorName, agendaPatientIds]);

  const selectedAccount = patientAccounts.find((a) => a.id === selectedPatientId);
  const conversation = patientMessages
    .filter((m) => {
      const matchesPatient = m.patientAccountId === selectedPatientId || (selectedAccount && m.patientId === selectedAccount.patientId);
      if (!matchesPatient) return false;
      if (!isAdmin) return m.doctorName === myDoctorName;
      return true;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setReplyImage({ url: reader.result as string, name: file.name });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setReplyFile({ url: reader.result as string, name: file.name });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleReply = () => {
    if (!replyText.trim() && !replyFile && !replyImage) return;
    if (!selectedAccount || !replyDoctor) return;

    const msgType = replyImage ? "image" : replyFile ? "file" : "text";
    addPatientMessage({
      patientAccountId: selectedAccount.id,
      patientId: selectedAccount.patientId,
      doctorName: replyDoctor,
      sender: "doctor",
      content: replyText.trim(),
      date: new Date().toISOString(),
      read: false,
      type: msgType,
      imageUrl: replyImage?.url,
      fileUrl: replyFile?.url,
      fileName: replyFile?.name,
    });
    setReplyText("");
    setReplyFile(null);
    setReplyImage(null);
    toast.success("Resposta enviada ao paciente!");
  };

  // Agenda patients that have portal accounts but are NOT yet in visiblePatientAccounts
  const agendaPatientsNotInList = useMemo(() => {
    if (isAdmin) return [];
    return patientAccounts.filter(
      (acc) => agendaPatientIds.includes(acc.patientId) && !visiblePatientAccounts.some((v) => v.id === acc.id)
    );
  }, [isAdmin, patientAccounts, agendaPatientIds, visiblePatientAccounts]);

  // All agenda patients (clinic patients) for the doctor - even those without portal account
  const agendaClinicPatients = useMemo(() => {
    if (isAdmin) return [];
    return clinicPatients.filter(
      (p) => agendaPatientIds.includes(p.id) && !visiblePatientAccounts.some((v) => v.patientId === p.id)
    );
  }, [isAdmin, clinicPatients, agendaPatientIds, visiblePatientAccounts]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Patient list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Pacientes ({visiblePatientAccounts.length})</p>
          {!isAdmin && (
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setShowAgendaPatients(!showAgendaPatients)}>
              <Calendar className="h-3 w-3 mr-1" /> Agenda
            </Button>
          )}
        </div>

        {/* Agenda patient picker for doctors */}
        {!isAdmin && showAgendaPatients && (
          <div className="p-2 border-b border-border bg-secondary/30">
            <p className="text-[10px] font-medium text-muted-foreground mb-1.5 px-1">Escolha um paciente da sua agenda:</p>
            <div className="max-h-40 overflow-y-auto space-y-0.5">
              {agendaClinicPatients.length === 0 && agendaPatientsNotInList.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-2">Todos os pacientes da agenda já estão na lista.</p>
              ) : (
                <>
                  {agendaPatientsNotInList.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => {
                        setSelectedPatientId(acc.id);
                        setShowAgendaPatients(false);
                      }}
                      className="w-full text-left px-2 py-1.5 flex items-center gap-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-medium shrink-0">
                        {acc.name[0]}
                      </div>
                      <span className="text-xs text-foreground truncate">{acc.name}</span>
                      <span className="text-[10px] text-emerald-600 ml-auto">Portal ✓</span>
                    </button>
                  ))}
                  {agendaClinicPatients.map((p) => (
                    <div
                      key={p.id}
                      className="w-full text-left px-2 py-1.5 flex items-center gap-2 rounded-lg opacity-50"
                    >
                      <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-medium shrink-0">
                        {p.name[0]}
                      </div>
                      <span className="text-xs text-muted-foreground truncate">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">Sem portal</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        <div className="divide-y divide-border max-h-96 overflow-y-auto">
          {visiblePatientAccounts.length === 0 ? (
            <p className="text-xs text-muted-foreground p-4 text-center">{isAdmin ? "Nenhum paciente cadastrado no portal." : "Nenhum paciente da sua agenda com conta no portal. Clique em 'Agenda' acima."}</p>
          ) : (
            visiblePatientAccounts.map((acc) => {
              const unread = patientMessages.filter((m) => m.patientAccountId === acc.id && m.sender === "patient" && !m.read).length;
              const linked = clinicPatients.find((p) => p.id === acc.patientId);
              const isFromAgenda = agendaPatientIds.includes(acc.patientId);
              return (
                  <button
                    key={acc.id}
                    onClick={() => {
                      setSelectedPatientId(acc.id);
                      patientMessages.filter((m) => m.patientAccountId === acc.id && m.sender === "patient" && !m.read).forEach((m) => markPatientMessageRead(m.id));
                    }}
                    className={`w-full text-left p-3 flex items-center gap-3 transition-colors ${selectedPatientId === acc.id ? "bg-primary/10" : "hover:bg-secondary"}`}
                  >
                    <div className="relative shrink-0">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                        {acc.name[0]}
                      </div>
                      <PresenceBadge isOnline={useChatPresenceStore.getState().isUserOnline(acc.id)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{acc.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {linked ? "Vinculado ✓" : "Não vinculado"}
                        {isFromAgenda && !isAdmin && " · 📅 Agenda"}
                      </p>
                    </div>
                  {unread > 0 && (
                    <span className="bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">{unread}</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat */}
      <div className="lg:col-span-3 bg-card border border-border rounded-xl flex flex-col" style={{ minHeight: 400 }}>
        {selectedAccount ? (
          <>
            <div className="p-3 border-b border-border flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                  {selectedAccount.name[0]}
                </div>
                <PresenceBadge isOnline={useChatPresenceStore.getState().isUserOnline(selectedAccount.id)} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{selectedAccount.name}</p>
                <PresenceLabel
                  isOnline={useChatPresenceStore.getState().isUserOnline(selectedAccount.id)}
                  lastSeen={useChatPresenceStore.getState().getLastSeen(selectedAccount.id)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {conversation.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma mensagem com este paciente. Envie a primeira!</p>
              )}
              {conversation.map((m) => (
                <div key={m.id} className={`flex ${m.sender === "doctor" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-xl px-4 py-2.5 ${m.sender === "doctor" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                    {m.sender === "doctor" && <p className="text-[10px] font-medium mb-0.5 opacity-70">Dr(a). {m.doctorName}</p>}
                    {m.sender === "patient" && <p className="text-[10px] font-medium mb-0.5 opacity-70">{selectedAccount?.name || "Paciente"}</p>}
                    {m.imageUrl && (
                      <img src={m.imageUrl} alt="Imagem" className="rounded-lg max-w-full mb-1 max-h-48 object-cover cursor-pointer" onClick={() => window.open(m.imageUrl, '_blank')} />
                    )}
                    {m.type === "file" && m.fileUrl && (
                      <a href={m.fileUrl} download={m.fileName} className="flex items-center gap-1 underline text-xs mb-1">
                        📎 {m.fileName}
                      </a>
                    )}
                    {m.content && <p className="text-sm">{m.content}</p>}
                    <p className={`text-[10px] mt-1 ${m.sender === "doctor" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {format(new Date(m.date), "dd/MM HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-border space-y-2">
              {isAdmin ? (
                <select value={replyDoctor} onChange={(e) => setReplyDoctor(e.target.value)} className="w-full border border-input bg-background rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring">
                  {doctors.map((d) => <option key={d} value={d}>{d}</option>)}
                  <option value="Crystian Suporte">Crystian Suporte</option>
                </select>
              ) : (
                <div className="text-xs text-muted-foreground px-1">
                  Respondendo como: <strong className="text-foreground">Dr(a). {myDoctorName}</strong>
                </div>
              )}
              {replyImage && (
                <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 text-xs">
                  <img src={replyImage.url} alt="" className="h-10 w-10 rounded object-cover" />
                  <span className="flex-1 truncate text-foreground">{replyImage.name}</span>
                  <button onClick={() => setReplyImage(null)}><X className="h-3 w-3 text-muted-foreground" /></button>
                </div>
              )}
              {replyFile && (
                <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 text-xs">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="flex-1 truncate text-foreground">{replyFile.name}</span>
                  <button onClick={() => setReplyFile(null)}><X className="h-3 w-3 text-muted-foreground" /></button>
                </div>
              )}
              <div className="flex gap-2 items-center">
                <label className="p-2 text-muted-foreground hover:text-foreground cursor-pointer hover:bg-secondary rounded-lg transition-colors">
                  <Image className="h-5 w-5" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <label className="p-2 text-muted-foreground hover:text-foreground cursor-pointer hover:bg-secondary rounded-lg transition-colors">
                  <Paperclip className="h-5 w-5" />
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
                <EmojiPicker onSelect={(emoji) => setReplyText((prev) => prev + emoji)} />
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReply()}
                  placeholder="Responder ao paciente..."
                  className="flex-1 border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <Button size="sm" onClick={handleReply}><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Selecione um paciente para ver as mensagens.</p>
          </div>
        )}
      </div>
    </div>
  );
}

