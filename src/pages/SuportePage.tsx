import { useState, useMemo, useRef, useEffect } from "react";
import EmojiPicker from "@/components/EmojiPicker";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useSupportStore } from "@/data/supportStore";
import { useAuthStore } from "@/data/authStore";
import { useTeleconsultaStore } from "@/data/teleconsultaStore";

import {
  MessageCircle, Send, Paperclip, Image, X, CheckCircle2,
  Clock, User, Search, RotateCcw, Trash2, Plus, UserPlus,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function SuportePage() {
  const {
    tickets, messages, assignTicket, closeTicket, reopenTicket, createTicket,
    addMessage, setPresence, setTyping, presences, hiddenTicketIds, hideTicket, unhideTicket,
  } = useSupportStore();
  

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<"todos" | "aberto" | "em_atendimento" | "fechado">("todos");
  const [search, setSearch] = useState("");
  const [typingTimeout, setTypingTimeoutState] = useState<ReturnType<typeof setTimeout> | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");

  const patientAccounts = useTeleconsultaStore((s) => s.patientAccounts);
  const authUser = useAuthStore((s) => s.user);
  const rawName = authUser?.username === "admin" ? "Crystian" : (authUser?.username || "Crystian");
  const adminName = rawName + " Suporte";
  const adminId = "admin-support";

  // Set admin online
  useEffect(() => {
    setPresence(adminId, adminName, true);
    return () => { setPresence(adminId, adminName, false); };
  }, [adminId, adminName, setPresence]);

  const filteredTickets = useMemo(() => {
    // Deduplicate: show only the latest ticket per patient
    const latestByPatient = new Map<string, typeof tickets[0]>();
    for (const t of tickets) {
      const existing = latestByPatient.get(t.patientAccountId);
      if (!existing || t.createdAt > existing.createdAt) {
        latestByPatient.set(t.patientAccountId, t);
      }
    }
    let list = [...latestByPatient.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    // Hide tickets the admin dismissed (but not when filtering specifically)
    if (filter === "todos") {
      list = list.filter((t) => !hiddenTicketIds.includes(t.id));
    }
    if (filter !== "todos") list = list.filter((t) => t.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.patientName.toLowerCase().includes(q));
    }
    return list;
  }, [tickets, filter, search, hiddenTicketIds]);

  const selectedTicket = useMemo(
    () => tickets.find((t) => t.id === selectedTicketId),
    [tickets, selectedTicketId]
  );

  const ticketMessages = useMemo(
    () => {
      if (!selectedTicket) return [];
      // Show ALL messages from this patient (across all their tickets)
      const patientTicketIds = tickets.filter((t) => t.patientAccountId === selectedTicket.patientAccountId).map((t) => t.id);
      return messages.filter((m) => patientTicketIds.includes(m.ticketId)).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    },
    [messages, selectedTicket, tickets]
  );

  const patientPresence = useMemo(() => {
    if (!selectedTicket) return null;
    return presences.find((p) => p.userId === selectedTicket.patientAccountId);
  }, [presences, selectedTicket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticketMessages]);

  const handleAssign = (ticketId: string) => {
    assignTicket(ticketId, adminName, "");
    addMessage({
      ticketId,
      sender: "support",
      senderName: adminName,
      senderAvatar: "",
      content: `${adminName} assumiu o ticket, como posso te ajudar?`,
      type: "text",
    });
    toast.success("Chamado assumido!");
  };

  const handleSend = () => {
    if (!text.trim() || !selectedTicket) return;
    addMessage({
      ticketId: selectedTicket.id,
      sender: "support",
      senderName: adminName,
      senderAvatar: "",
      content: text.trim(),
      type: "text",
    });
    setText("");
    setTyping(adminId, false);
  };

  const handleTyping = (value: string) => {
    setText(value);
    setTyping(adminId, true);
    if (typingTimeout) clearTimeout(typingTimeout);
    const t = setTimeout(() => setTyping(adminId, false), 2000);
    setTypingTimeoutState(t);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isImage: boolean) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTicket) return;
    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => {
        addMessage({
          ticketId: selectedTicket.id,
          sender: "support",
          senderName: adminName,
          senderAvatar: "",
          content: "",
          type: "image",
          fileName: file.name,
          fileUrl: reader.result as string,
        });
        toast.success("Imagem enviada!");
      };
      reader.readAsDataURL(file);
    } else {
      const url = URL.createObjectURL(file);
      addMessage({
        ticketId: selectedTicket.id,
        sender: "support",
        senderName: adminName,
        senderAvatar: "",
        content: `📎 ${file.name}`,
        type: "file",
        fileName: file.name,
        fileUrl: url,
      });
      toast.success("Arquivo enviado!");
    }
    e.target.value = "";
  };

  const statusConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    aberto: { label: "Aberto", cls: "bg-warning/10 text-warning", icon: <Clock className="h-3 w-3" /> },
    em_atendimento: { label: "Em atendimento", cls: "bg-primary/10 text-primary", icon: <MessageCircle className="h-3 w-3" /> },
    fechado: { label: "Fechado", cls: "bg-muted text-muted-foreground", icon: <CheckCircle2 className="h-3 w-3" /> },
  };

  const openCount = tickets.filter((t) => t.status === "aberto").length;
  const activeCount = tickets.filter((t) => t.status === "em_atendimento").length;

  const handleStartChatWithPatient = (account: { id: string; name: string; avatar: string }) => {
    // Check if patient already has a ticket
    const existing = tickets.find((t) => t.patientAccountId === account.id && t.status !== "fechado");
    if (existing) {
      // Unhide if hidden
      if (hiddenTicketIds.includes(existing.id)) unhideTicket(existing.id);
      setSelectedTicketId(existing.id);
    } else {
      // Check for closed ticket to unhide
      const closed = tickets.find((t) => t.patientAccountId === account.id);
      if (closed && hiddenTicketIds.includes(closed.id)) {
        unhideTicket(closed.id);
        reopenTicket(closed.id);
        setSelectedTicketId(closed.id);
      } else {
        const ticket = createTicket({
          patientAccountId: account.id,
          patientName: account.name,
          patientAvatar: account.avatar,
        });
        assignTicket(ticket.id, adminName, "");
        setSelectedTicketId(ticket.id);
      }
    }
    setShowPatientPicker(false);
    setPatientSearch("");
  };

  const filteredPatientAccounts = useMemo(() => {
    if (!patientSearch.trim()) return patientAccounts;
    const q = patientSearch.toLowerCase();
    return patientAccounts.filter((a) => a.name.toLowerCase().includes(q));
  }, [patientAccounts, patientSearch]);

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-7rem)] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Suporte</h1>
            <p className="text-sm text-muted-foreground">
              {openCount} aberto(s) · {activeCount} em atendimento
            </p>
          </div>
          <button
            onClick={() => setShowPatientPicker(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <UserPlus className="h-4 w-4" /> Novo Chat
          </button>
        </div>

        {/* Patient Picker Modal */}
        {showPatientPicker && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setShowPatientPicker(false)}>
            <div className="bg-card border border-border rounded-2xl w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">Iniciar chat com paciente</h3>
                <button onClick={() => setShowPatientPicker(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="Buscar paciente..."
                    className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {filteredPatientAccounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhum paciente encontrado.</p>
                ) : (
                  filteredPatientAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => handleStartChatWithPatient({ id: acc.id, name: acc.name, avatar: acc.avatar })}
                      className="w-full text-left p-3 flex items-center gap-3 hover:bg-secondary/50 transition-colors"
                    >
                      {acc.avatar ? (
                        <img src={acc.avatar} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                          {acc.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{acc.name}</p>
                        <p className="text-xs text-muted-foreground">{acc.email || acc.cpf}</p>
                      </div>
                      {tickets.some((t) => t.patientAccountId === acc.id && t.status !== "fechado") && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Chat ativo</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Ticket list */}
          <div className="w-80 lg:w-96 bg-card border border-border rounded-xl flex flex-col overflow-hidden shrink-0">
            {/* Filters */}
            <div className="p-3 border-b border-border space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar paciente..."
                  className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex gap-1">
                {(["todos", "aberto", "em_atendimento", "fechado"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {f === "todos" ? "Todos" : f === "aberto" ? "Abertos" : f === "em_atendimento" ? "Ativos" : "Fechados"}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {filteredTickets.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum chamado encontrado.</p>
              )}
              {filteredTickets.map((ticket) => {
                const lastMsg = messages
                  .filter((m) => m.ticketId === ticket.id)
                  .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
                const s = statusConfig[ticket.status];
                const isSelected = selectedTicketId === ticket.id;
                const pPresence = presences.find((p) => p.userId === ticket.patientAccountId);

                return (
                  <div
                    key={ticket.id}
                    className={`relative group w-full text-left p-3 hover:bg-secondary/50 transition-colors cursor-pointer ${isSelected ? "bg-secondary" : ""}`}
                    onClick={() => setSelectedTicketId(ticket.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        {ticket.patientAvatar ? (
                          <img src={ticket.patientAvatar} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                            {ticket.patientName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {pPresence?.isOnline ? (
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />
                        ) : (
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-destructive/60 border-2 border-card" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{ticket.patientName}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1 shrink-0 ${s.cls}`}>
                            {s.icon} {s.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {lastMsg ? lastMsg.content : "Novo chamado"}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                          {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          hideTicket(ticket.id);
                          if (selectedTicketId === ticket.id) setSelectedTicketId(null);
                          toast.success("Chat ocultado. As mensagens ficam salvas.");
                        }}
                        title="Ocultar chat (mensagens ficam salvas)"
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
            {!selectedTicket ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Selecione um chamado para responder</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-border flex items-center gap-3 shrink-0">
                  <div className="relative shrink-0">
                    {selectedTicket.patientAvatar ? (
                      <img src={selectedTicket.patientAvatar} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                        {selectedTicket.patientName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {patientPresence?.isOnline ? (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />
                    ) : (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-destructive/60 border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{selectedTicket.patientName}</p>
                    <div className="flex items-center gap-1.5">
                      {patientPresence?.isOnline ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[11px] text-muted-foreground">
                            {patientPresence.isTyping ? "Digitando..." : "Online"}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-destructive/60" />
                          <span className="text-[11px] text-muted-foreground">
                            {patientPresence?.lastSeen
                              ? `Visto ${formatDistanceToNow(new Date(patientPresence.lastSeen), { addSuffix: true, locale: ptBR })}`
                              : "Offline"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedTicket.status === "aberto" && (
                      <button
                        onClick={() => handleAssign(selectedTicket.id)}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90"
                      >
                        Assumir
                      </button>
                    )}
                    {selectedTicket.status === "em_atendimento" && (
                      <button
                        onClick={() => { closeTicket(selectedTicket.id); toast.success("Chamado fechado!"); }}
                        className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs font-medium hover:bg-secondary"
                      >
                        <CheckCircle2 className="h-3 w-3 inline mr-1" /> Fechar
                      </button>
                    )}
                    {selectedTicket.status === "fechado" && (
                      <button
                        onClick={() => { reopenTicket(selectedTicket.id); toast.success("Chamado reaberto!"); }}
                        className="px-3 py-1.5 bg-warning/10 text-warning rounded-lg text-xs font-medium hover:bg-warning/20"
                      >
                        <RotateCcw className="h-3 w-3 inline mr-1" /> Reabrir
                      </button>
                    )}
                    <button onClick={() => setSelectedTicketId(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50">
                  {/* Assigned info */}
                  {selectedTicket.assignedTo && (
                    <div className="text-center">
                      <span className="text-[10px] bg-muted text-muted-foreground px-3 py-1 rounded-full">
                        {selectedTicket.assignedTo} assumiu o atendimento
                      </span>
                    </div>
                  )}

                  {ticketMessages.map((msg) => {
                    const isMe = msg.sender === "support";
                    return (
                      <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                        <div className="shrink-0">
                          {msg.senderAvatar ? (
                            <img src={msg.senderAvatar} className="h-7 w-7 rounded-full object-cover" />
                          ) : (
                            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                              {msg.senderName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className={`max-w-[70%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <span className="text-[10px] text-muted-foreground mb-0.5">{msg.senderName}</span>
                          <div className={`rounded-2xl px-3 py-2 text-sm ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                            {msg.type === "image" && msg.fileUrl && (
                              <img src={msg.fileUrl} alt="Imagem" className="rounded-lg max-w-full mb-1 max-h-48 object-cover cursor-pointer" onClick={() => window.open(msg.fileUrl, '_blank')} />
                            )}
                            {msg.type === "file" && msg.fileUrl && (
                              <a href={msg.fileUrl} download={msg.fileName} className="flex items-center gap-1 underline text-xs mb-1">
                                📎 {msg.fileName}
                              </a>
                            )}
                            {msg.type !== "image" && <p>{msg.content}</p>}
                          </div>
                          <span className="text-[9px] text-muted-foreground/60 mt-0.5">
                            {format(new Date(msg.timestamp), "HH:mm")}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing indicator */}
                  {patientPresence?.isTyping && (
                    <div className="flex gap-2 items-end">
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                        {selectedTicket.patientName.charAt(0).toUpperCase()}
                      </div>
                      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                {selectedTicket.status !== "fechado" && (
                  <div className="p-3 border-t border-border shrink-0">
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-1 bg-background border border-input rounded-xl px-3">
                        <input
                          type="text"
                          value={text}
                          onChange={(e) => handleTyping(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSend()}
                          placeholder="Responder..."
                          className="flex-1 bg-transparent text-sm py-2.5 outline-none text-foreground placeholder:text-muted-foreground"
                        />
                        <button onClick={() => imageInputRef.current?.click()} className="text-muted-foreground hover:text-foreground">
                          <Image className="h-4 w-4" />
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="text-muted-foreground hover:text-foreground">
                          <Paperclip className="h-4 w-4" />
                        </button>
                        <EmojiPicker onSelect={(emoji) => setText((prev) => prev + emoji)} />
                        <input ref={imageInputRef} type="file" accept="image/*" onChange={(e) => handleFileUpload(e, true)} className="hidden" />
                        <input ref={fileInputRef} type="file" onChange={(e) => handleFileUpload(e, false)} className="hidden" />
                      </div>
                      <button onClick={handleSend} className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground hover:opacity-90 shrink-0">
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
