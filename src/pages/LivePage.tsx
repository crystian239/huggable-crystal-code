import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useLiveStore } from "@/data/liveStore";
import { useAuthStore } from "@/data/authStore";
import { useClinicStore } from "@/data/clinicStore";
import { Button } from "@/components/ui/button";
import EmojiPicker from "@/components/EmojiPicker";
import {
  Radio, Video, Calendar, Clock, Users, Send, Trash2, Play, Square, Plus, X,
  MessageCircle, Sparkles, Eye, Hand, Check, XCircle, Smile, RotateCcw, Shield, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { playLiveStartSound, playNotificationSound, playJoinRequestSound, playMessageSound } from "@/lib/notificationSounds";

const EMOJI_LIST = ["❤️", "👏", "🔥", "😂", "😍", "👍", "🎉", "💯", "😮", "🙏"];

export default function LivePage() {
  const user = useAuthStore((s) => s.user);
  const allUsers = useAuthStore((s) => s.users);
  const settings = useClinicStore((s) => s.settings);
  const store = useLiveStore();
  const {
    sessions, notifications, createSession, startLive, endLive, deleteSession,
    addChatMessage, addModeratedMessage, markAllNotificationsRead, addNotification,
    addViewer, removeViewer, requestToJoin, respondJoinRequest, addEmojiReaction,
    toggleReplay,
  } = store;

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState<"todos_pacientes" | "todos_doutores" | "doutores_especificos">("todos_pacientes");
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [viewingLive, setViewingLive] = useState<string | null>(null);
  const [showViewers, setShowViewers] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const [showFilteredMsgs, setShowFilteredMsgs] = useState(false);
  const [showReplayModal, setShowReplayModal] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef(0);
  const prevJoinReqCountRef = useRef(0);

  const doctorName = user?.username || "Doutor";
  const doctorId = user?.cpf || user?.id || "";
  const isDoctor = user?.role === "doctor" || user?.role === "admin";

  const doctors = useMemo(() => allUsers.filter((u) => u.role === "doctor" && u.id !== user?.id), [allUsers, user]);

  const activeLives = useMemo(() => sessions.filter((s) => s.status === "ao_vivo"), [sessions]);
  const scheduledLives = useMemo(() => sessions.filter((s) => s.status === "agendada").sort((a, b) => (a.scheduledAt || "").localeCompare(b.scheduledAt || "")), [sessions]);
  const pastLives = useMemo(() => sessions.filter((s) => s.status === "encerrada").sort((a, b) => (b.endedAt || "").localeCompare(a.endedAt || "")), [sessions]);

  const myDoctorNotifs = useMemo(() =>
    notifications.filter((n) => n.targetType === "doctors" && !n.read && (!n.targetIds || n.targetIds.includes(doctorId))),
    [notifications, doctorId]
  );

  const currentLive = viewingLive ? sessions.find((s) => s.id === viewingLive) : null;

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentLive?.chatMessages.length]);

  // Sound on new message
  useEffect(() => {
    if (!currentLive) return;
    const count = currentLive.chatMessages.filter((m) => m.type !== "system").length;
    if (prevMsgCountRef.current > 0 && count > prevMsgCountRef.current) {
      playMessageSound();
    }
    prevMsgCountRef.current = count;
  }, [currentLive?.chatMessages.length]);

  // Sound on new join request (doctor only)
  useEffect(() => {
    if (!currentLive || currentLive.doctorId !== doctorId) return;
    const pending = currentLive.joinRequests.filter((r) => r.status === "pending").length;
    if (prevJoinReqCountRef.current > 0 && pending > prevJoinReqCountRef.current) {
      playJoinRequestSound();
      toast("🖐 Nova solicitação para participar da live!");
    }
    prevJoinReqCountRef.current = pending;
  }, [currentLive?.joinRequests.length]);

  // Sound on live notification
  useEffect(() => {
    if (myDoctorNotifs.length > 0) {
      playNotificationSound();
    }
  }, [myDoctorNotifs.length]);

  // Auto-refresh every 2s for real-time feel
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  // Join live as viewer
  const handleJoinAsViewer = useCallback((liveId: string) => {
    addViewer(liveId, { name: doctorName, role: isDoctor ? "doctor" : "patient" });
    setViewingLive(liveId);
    playLiveStartSound();
  }, [addViewer, doctorName, isDoctor]);

  // Floating emoji animation
  const handleEmojiReaction = useCallback((liveId: string, emoji: string) => {
    addEmojiReaction(liveId, emoji, doctorName);
    const id = crypto.randomUUID();
    const x = 20 + Math.random() * 60;
    setFloatingEmojis((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => setFloatingEmojis((prev) => prev.filter((e) => e.id !== id)), 2000);
  }, [addEmojiReaction, doctorName]);

  const handleCreate = () => {
    if (!title.trim()) { toast.error("Digite um título para a live."); return; }
    const scheduledAt = isScheduled && scheduleDate && scheduleTime
      ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString() : undefined;

    const id = createSession({
      doctorName, doctorId,
      title: title.trim(), description: description.trim(),
      status: isScheduled ? "agendada" : "ao_vivo",
      audience,
      specificDoctorIds: audience === "doutores_especificos" ? selectedDoctors : undefined,
      scheduledAt, startedAt: isScheduled ? undefined : new Date().toISOString(),
    });

    if (isScheduled) {
      const dateLabel = scheduleDate && scheduleTime
        ? format(new Date(`${scheduleDate}T${scheduleTime}`), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "";
      addNotification({
        liveId: id, type: "live_scheduled",
        message: `📅 ${doctorName} agendou uma LIVE: "${title.trim()}" para ${dateLabel}`,
        doctorName, date: new Date().toISOString(), read: false,
        targetType: audience === "todos_pacientes" ? "patients" : "doctors",
        targetIds: audience === "doutores_especificos" ? selectedDoctors : undefined,
      });
      toast.success("Live agendada com sucesso!");
    } else {
      startLive(id);
      addViewer(id, { name: doctorName, role: "doctor" });
      playLiveStartSound();
      toast.success("Live iniciada! Todos foram notificados.");
      setViewingLive(id);
    }
    setTitle(""); setDescription(""); setAudience("todos_pacientes");
    setSelectedDoctors([]); setScheduleDate(""); setScheduleTime("");
    setIsScheduled(false); setShowCreate(false);
  };

  const handleStartScheduled = (id: string) => {
    startLive(id);
    addViewer(id, { name: doctorName, role: "doctor" });
    setViewingLive(id);
    playLiveStartSound();
    toast.success("Live iniciada!");
  };

  const handleEndLive = (id: string) => {
    endLive(id);
    setViewingLive(null);
    setShowReplayModal(id);
    toast.success("Live encerrada.");
  };

  const handleLeaveLive = (liveId: string) => {
    removeViewer(liveId, doctorName);
    setViewingLive(null);
  };

  const handleSendChat = (liveId: string) => {
    if (!chatMsg.trim()) return;
    const result = addModeratedMessage(liveId, { liveId, senderName: doctorName, senderRole: isDoctor ? "doctor" : "patient", message: chatMsg.trim() });
    if (!result.sent && result.warning) {
      toast.warning("Mensagem bloqueada pelo moderador.");
    }
    setChatMsg("");
  };

  const handleRequestJoin = (liveId: string) => {
    requestToJoin(liveId, { name: doctorName, role: isDoctor ? "doctor" : "patient" });
    toast.success("Solicitação enviada ao doutor!");
  };

  // ============== LIVE VIEW ==============
  if (currentLive && currentLive.status === "ao_vivo") {
    const isOwner = currentLive.doctorId === doctorId;
    const pendingRequests = currentLive.joinRequests.filter((r) => r.status === "pending");
    const viewerCount = currentLive.viewers.length;

    return (
      <DashboardLayout>
        <div className="space-y-4 relative">
          {/* Floating emojis */}
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {floatingEmojis.map((fe) => (
              <span
                key={fe.id}
                className="absolute text-3xl animate-bounce"
                style={{
                  left: `${fe.x}%`,
                  bottom: "20%",
                  animation: "floatUp 2s ease-out forwards",
                }}
              >
                {fe.emoji}
              </span>
            ))}
          </div>

          {/* Top bar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Radio className="h-6 w-6 text-destructive" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-ping" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">{currentLive.title}</h1>
                <p className="text-xs text-muted-foreground">Ao vivo • {currentLive.doctorName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Viewer count */}
              <button
                onClick={() => isOwner && setShowViewers(!showViewers)}
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  isOwner ? "cursor-pointer hover:bg-secondary border-border" : "cursor-default border-transparent"
                } bg-secondary/50`}
                title={isOwner ? "Ver quem está assistindo" : `${viewerCount} assistindo`}
              >
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{viewerCount}</span>
              </button>

              {isOwner ? (
                <Button variant="destructive" size="sm" onClick={() => handleEndLive(currentLive.id)}>
                  <Square className="h-4 w-4 mr-1" /> Encerrar
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => handleLeaveLive(currentLive.id)}>
                  Sair da Live
                </Button>
              )}
            </div>
          </div>

          {/* Viewers popover */}
          {showViewers && isOwner && (
            <div className="bg-card border border-border rounded-xl p-4 shadow-lg">
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Espectadores ({viewerCount})
              </h3>
              {currentLive.viewers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum espectador.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {currentLive.viewers.map((v) => (
                    <div key={v.id} className="flex items-center gap-2 text-sm px-2 py-1 rounded-lg bg-secondary/50">
                      <span>{v.role === "doctor" ? "👨‍⚕️" : "🧑"}</span>
                      <span className="text-foreground">{v.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {format(new Date(v.joinedAt), "HH:mm")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Join requests (doctor only) */}
          {isOwner && pendingRequests.length > 0 && (
            <div className="bg-accent/30 border border-accent/50 rounded-xl p-3 space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Hand className="h-4 w-4 text-accent-foreground" /> Solicitações para participar ({pendingRequests.length})
              </h3>
              {pendingRequests.map((req) => (
                <div key={req.id} className="flex items-center gap-3 bg-card rounded-lg px-3 py-2">
                  <span className="text-sm flex-1">{req.role === "doctor" ? "👨‍⚕️" : "🧑"} {req.name}</span>
                  <Button size="sm" variant="default" className="h-7 text-xs gap-1"
                    onClick={() => { respondJoinRequest(currentLive.id, req.id, true); toast.success(`${req.name} aceito(a)!`); }}>
                    <Check className="h-3 w-3" /> Aceitar
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1"
                    onClick={() => respondJoinRequest(currentLive.id, req.id, false)}>
                    <XCircle className="h-3 w-3" /> Recusar
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Video placeholder */}
          <div className="bg-foreground/95 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
            <div className="text-center text-primary-foreground/80">
              <Video className="h-16 w-16 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">{isOwner ? "Sua câmera está transmitindo" : `Assistindo ${currentLive.doctorName}`}</p>
              <p className="text-sm opacity-60">{viewerCount} pessoa{viewerCount !== 1 ? "s" : ""} assistindo</p>
            </div>
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-destructive/90 text-destructive-foreground px-3 py-1.5 rounded-full text-xs font-bold">
              <span className="h-2 w-2 bg-destructive-foreground rounded-full animate-pulse" />
              AO VIVO
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-foreground/50 text-background px-2.5 py-1 rounded-full text-xs">
              <Eye className="h-3 w-3" /> {viewerCount}
            </div>
          </div>

          {/* Emoji bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowEmojis(!showEmojis)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary">
              <Smile className="h-4 w-4" /> Reagir
            </button>
            {showEmojis && EMOJI_LIST.map((emoji) => (
              <button key={emoji} onClick={() => handleEmojiReaction(currentLive.id, emoji)}
                className="text-xl hover:scale-125 transition-transform active:scale-90 p-1">
                {emoji}
              </button>
            ))}
            {!isOwner && !currentLive.joinRequests.some((r) => r.name === doctorName) && (
              <Button size="sm" variant="outline" className="ml-auto gap-1" onClick={() => handleRequestJoin(currentLive.id)}>
                <Hand className="h-3.5 w-3.5" /> Participar da Live
              </Button>
            )}
            {!isOwner && currentLive.joinRequests.some((r) => r.name === doctorName && r.status === "pending") && (
              <span className="ml-auto text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">⏳ Aguardando aprovação</span>
            )}
            {!isOwner && currentLive.joinRequests.some((r) => r.name === doctorName && r.status === "accepted") && (
              <span className="ml-auto text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">✅ Participando</span>
            )}
          </div>

          {/* Chat */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-3 border-b border-border/50 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Chat da Live</span>
              <span className="text-xs text-muted-foreground">({currentLive.chatMessages.length})</span>
              {isOwner && (currentLive.filteredMessages?.length || 0) > 0 && (
                <button onClick={() => setShowFilteredMsgs(!showFilteredMsgs)}
                  className="ml-auto flex items-center gap-1 text-xs text-destructive hover:underline">
                  <Shield className="h-3 w-3" /> {currentLive.filteredMessages.length} bloqueada(s)
                </button>
              )}
            </div>

            {/* Filtered messages (doctor only) */}
            {showFilteredMsgs && isOwner && (currentLive.filteredMessages?.length || 0) > 0 && (
              <div className="p-3 bg-destructive/5 border-b border-destructive/20 space-y-2 max-h-32 overflow-y-auto">
                <p className="text-xs font-semibold text-destructive flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Mensagens filtradas:</p>
                {currentLive.filteredMessages.map((fm) => (
                  <div key={fm.id} className="text-xs bg-card rounded-lg px-2 py-1.5">
                    <span className="font-medium text-foreground">{fm.senderName}:</span>{" "}
                    <span className="text-muted-foreground line-through">{fm.originalMessage}</span>
                    <span className="text-destructive ml-2 text-[10px]">({fm.reason})</span>
                  </div>
                ))}
              </div>
            )}

            <div className="h-60 overflow-y-auto p-3 space-y-2">
              {currentLive.chatMessages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma mensagem ainda...</p>
              )}
              {currentLive.chatMessages.map((msg) => {
                if (msg.type === "system") {
                  return (
                    <div key={msg.id} className="text-center">
                      <span className="text-[11px] text-muted-foreground bg-secondary/70 px-3 py-1 rounded-full">
                        {msg.message}
                      </span>
                    </div>
                  );
                }
                if (msg.type === "bot") {
                  return (
                    <div key={msg.id} className="flex justify-start">
                      <div className="max-w-[85%] px-3 py-2 rounded-xl text-sm bg-accent/50 border border-accent/30 text-foreground">
                        <p className="text-[10px] font-bold opacity-70">🤖 {msg.senderName}</p>
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  );
                }
                const isMe = msg.senderName === doctorName;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                      msg.senderRole === "doctor"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}>
                      <p className="text-[10px] font-bold opacity-70">
                        {msg.senderRole === "doctor" ? "👨‍⚕️" : "🧑"} {msg.senderName}
                      </p>
                      <p>{msg.message}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-border/50 flex gap-2 items-center">
              <EmojiPicker onSelect={(emoji) => setChatMsg((prev) => prev + emoji)} />
              <input
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat(currentLive.id)}
                placeholder={isOwner ? "Mensagem ou /link /divulgar /aviso /msg..." : "Enviar mensagem..."}
                className="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <Button size="sm" onClick={() => handleSendChat(currentLive.id)}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {isOwner && (
              <div className="px-3 pb-2 text-[10px] text-muted-foreground">
                💡 Comandos: <code>/link URL</code> • <code>/divulgar texto</code> • <code>/aviso texto</code> • <code>/msg texto</code>
              </div>
            )}
          </div>

          {/* Replay modal after ending */}
          {showReplayModal && (
            <>
              <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50" onClick={() => setShowReplayModal(null)} />
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <RotateCcw className="h-5 w-5 text-primary" /> Disponibilizar Replay?
                  </h3>
                  <p className="text-sm text-muted-foreground">Deseja que os pacientes possam assistir o replay desta live?</p>
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setShowReplayModal(null)}>Não, por enquanto</Button>
                    <Button onClick={() => { toggleReplay(showReplayModal); setShowReplayModal(null); toast.success("Replay disponibilizado!"); }}>
                      Sim, disponibilizar
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // ============== MAIN LIST VIEW ==============
  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Radio className="h-6 w-6 text-primary" /> Lives
            </h1>
            <p className="text-sm text-muted-foreground">Transmita ao vivo para pacientes e colegas</p>
          </div>
          {isDoctor && (
            <Button onClick={() => setShowCreate(true)} className="gap-1.5">
              <Plus className="h-4 w-4" /> Nova Live
            </Button>
          )}
        </div>

        {/* Notifications */}
        {myDoctorNotifs.length > 0 && (
          <div className="space-y-2">
            {myDoctorNotifs.map((n) => (
              <div key={n.id} className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-3">
                <Radio className="h-4 w-4 text-primary shrink-0" />
                <p className="text-sm text-foreground flex-1">{n.message}</p>
              </div>
            ))}
            <button onClick={() => markAllNotificationsRead("doctors")} className="text-xs text-primary hover:underline">
              Marcar todas como lidas
            </button>
          </div>
        )}

        {/* Active lives */}
        {activeLives.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="h-2 w-2 bg-destructive rounded-full animate-pulse" />
              Ao Vivo Agora
            </h2>
            {activeLives.map((live) => (
              <div key={live.id} className="bg-card border-2 border-destructive/30 rounded-2xl p-4 flex items-center gap-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <Radio className="h-6 w-6 text-destructive" />
                  </div>
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-ping" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{live.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {live.doctorName} • <Eye className="inline h-3 w-3" /> {live.viewers.length} assistindo • {live.chatMessages.length} msgs
                  </p>
                </div>
                <div className="flex gap-2">
                  {live.doctorId === doctorId ? (
                    <>
                      <Button size="sm" onClick={() => { setViewingLive(live.id); }}>Voltar à Live</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleEndLive(live.id)}>
                        <Square className="h-3 w-3 mr-1" /> Encerrar
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleJoinAsViewer(live.id)}>
                      <Play className="h-3 w-3 mr-1" /> Assistir
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scheduled */}
        {scheduledLives.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Lives Agendadas
            </h2>
            {scheduledLives.map((live) => (
              <div key={live.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{live.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {live.doctorName} •{" "}
                    {live.scheduledAt && format(new Date(live.scheduledAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                  {live.description && <p className="text-xs text-muted-foreground mt-1">{live.description}</p>}
                </div>
                {live.doctorId === doctorId && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleStartScheduled(live.id)}>
                      <Play className="h-3 w-3 mr-1" /> Iniciar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteSession(live.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Past */}
        {pastLives.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Últimas Lives</h2>
            {pastLives.slice(0, 10).map((live) => (
              <div key={live.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Video className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{live.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {live.doctorName} • Encerrada{" "}
                    {live.endedAt && format(new Date(live.endedAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    {" "}• {live.chatMessages.length} msgs
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {live.doctorId === doctorId && (
                    <Button size="sm" variant={live.replayAvailable ? "default" : "outline"}
                      onClick={() => { toggleReplay(live.id); toast.success(live.replayAvailable ? "Replay removido" : "Replay disponibilizado!"); }}
                      className="gap-1 text-xs">
                      <RotateCcw className="h-3 w-3" />
                      {live.replayAvailable ? "Replay ✓" : "Liberar Replay"}
                    </Button>
                  )}
                  {!live.replayAvailable && live.doctorId !== doctorId && (
                    <span className="text-[10px] text-muted-foreground">Sem replay</span>
                  )}
                  {live.replayAvailable && live.doctorId !== doctorId && (
                    <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">Replay disponível</span>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => deleteSession(live.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeLives.length === 0 && scheduledLives.length === 0 && pastLives.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <Radio className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Nenhuma live ainda</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Clique em "Nova Live" para começar</p>
          </div>
        )}

        {/* Create modal */}
        {showCreate && (
          <>
            <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50" onClick={() => setShowCreate(false)} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-5 border-b border-border/50 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" /> Nova Live
                  </h2>
                  <button onClick={() => setShowCreate(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Título *</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Dicas de desenvolvimento infantil"
                      className="w-full px-3 py-2.5 bg-background border border-input rounded-xl text-sm outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Descrição</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                      placeholder="Breve descrição..."
                      className="w-full px-3 py-2.5 bg-background border border-input rounded-xl text-sm outline-none focus:ring-2 focus:ring-ring resize-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Público</label>
                    <div className="space-y-2">
                      {([
                        { id: "todos_pacientes", label: "Todos os pacientes", desc: "Todos os seus pacientes serão notificados" },
                        { id: "todos_doutores", label: "Todos os doutores", desc: "Todos os colegas doutores" },
                        { id: "doutores_especificos", label: "Doutores específicos", desc: "Escolha quais doutores" },
                      ] as const).map((opt) => (
                        <label key={opt.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                            audience === opt.id ? "bg-primary/5 border-primary/30" : "border-border hover:bg-secondary/50"
                          }`}>
                          <input type="radio" name="audience" checked={audience === opt.id}
                            onChange={() => setAudience(opt.id)} className="accent-primary" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{opt.label}</p>
                            <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  {audience === "doutores_especificos" && (
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">Selecione os doutores</label>
                      {doctors.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum outro doutor cadastrado.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {doctors.map((d) => (
                            <label key={d.id} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/50 cursor-pointer">
                              <input type="checkbox" checked={selectedDoctors.includes(d.cpf || d.id)}
                                onChange={(e) => {
                                  const key = d.cpf || d.id;
                                  setSelectedDoctors(e.target.checked ? [...selectedDoctors, key] : selectedDoctors.filter((x) => x !== key));
                                }} className="accent-primary" />
                              <span className="text-sm text-foreground">{d.username}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isScheduled} onChange={(e) => setIsScheduled(e.target.checked)} className="accent-primary" />
                    <span className="text-sm font-medium text-foreground">Agendar para depois</span>
                  </label>
                  {isScheduled && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">Data</label>
                        <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-input rounded-xl text-sm outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">Horário</label>
                        <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-input rounded-xl text-sm outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-5 border-t border-border/50 flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
                  <Button onClick={handleCreate}>
                    {isScheduled ? (<><Calendar className="h-4 w-4 mr-1" /> Agendar Live</>) : (<><Radio className="h-4 w-4 mr-1" /> Iniciar Live Agora</>)}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
