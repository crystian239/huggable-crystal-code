import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useTeleconsultaStore } from "@/data/teleconsultaStore";
import { useClinicStore } from "@/data/clinicStore";
import { Send, Paperclip, Image, X, Video, VideoOff, Mic, MicOff, PhoneOff, MessageCircle, Users, Monitor, MonitorOff } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function VideoCallPage() {
  const { roomName } = useParams<{ roomName: string }>();
  const { rooms, chatMessages, addChatMessage, updateRoom, endCall } = useTeleconsultaStore();
  const patients = useClinicStore((s) => s.patients);
  const settings = useClinicStore((s) => s.settings);

  const room = useMemo(() => rooms.find((r) => r.roomName === roomName), [rooms, roomName]);
  const messages = useMemo(() => chatMessages.filter((m) => m.roomId === room?.id).sort((a, b) => a.timestamp.localeCompare(b.timestamp)), [chatMessages, room?.id]);
  const patient = useMemo(() => room ? patients.find((p) => p.id === room.patientId) : null, [room, patients]);

  const [chatOpen, setChatOpen] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderRole, setSenderRole] = useState<"doctor" | "patient">("doctor");
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [showIdentify, setShowIdentify] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!room) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-8 text-center max-w-md">
          <Video className="h-12 w-12 text-[hsl(var(--muted-foreground))] mx-auto mb-3 opacity-30" />
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-1">Sala não encontrada</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">O link da videochamada é inválido ou a sala foi encerrada.</p>
        </div>
      </div>
    );
  }

  const handleSend = () => {
    if (!messageText.trim() || !senderName) return;
    addChatMessage({
      roomId: room.id,
      sender: senderName,
      senderRole,
      content: messageText.trim(),
      type: "text",
    });
    setMessageText("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !senderName) return;
    const isImage = file.type.startsWith("image/");
    const url = URL.createObjectURL(file);
    addChatMessage({
      roomId: room.id,
      sender: senderName,
      senderRole,
      content: isImage ? "📷 Imagem enviada" : `📎 ${file.name}`,
      type: isImage ? "image" : "file",
      fileName: file.name,
      fileUrl: url,
    });
    toast.success("Arquivo enviado!");
    e.target.value = "";
  };

  const handleEndCall = () => {
    updateRoom(room.id, { status: "finalizada" });
    endCall();
    toast.success("Chamada encerrada.");
    // Try to close the tab (works if opened via window.open), otherwise redirect
    try { window.close(); } catch {}
    setTimeout(() => {
      // If window.close didn't work, redirect based on role
      if (senderRole === "doctor") {
        window.location.href = "/teleconsulta";
      } else {
        window.location.href = "/portal-paciente";
      }
    }, 500);
  };

  // Identify modal
  if (showIdentify) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-4">
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 w-full max-w-sm shadow-lg">
          <div className="text-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Video className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Teleconsulta</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Identifique-se para entrar na sala</p>
            {patient && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Paciente: <strong>{patient.name}</strong></p>}
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-1 block">Seu nome</label>
              <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Digite seu nome" className="w-full border border-[hsl(var(--input))] bg-[hsl(var(--background))] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
            </div>
            <div>
              <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-1 block">Você é</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setSenderRole("doctor")} className={`py-2.5 text-sm rounded-lg border transition-colors ${senderRole === "doctor" ? "bg-primary text-primary-foreground border-primary" : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]"}`}>
                  👨‍⚕️ Profissional
                </button>
                <button onClick={() => setSenderRole("patient")} className={`py-2.5 text-sm rounded-lg border transition-colors ${senderRole === "patient" ? "bg-primary text-primary-foreground border-primary" : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]"}`}>
                  🧑 Paciente
                </button>
              </div>
            </div>
            <button onClick={() => { if (senderName.trim()) { setShowIdentify(false); if (room.status === "aguardando") updateRoom(room.id, { status: "em_andamento" }); } else toast.error("Digite seu nome"); }} className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">
              Entrar na Sala
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[hsl(222,47%,8%)]">
      {/* Top bar */}
      <div className="h-14 bg-[hsl(222,47%,11%)] border-b border-white/10 flex items-center px-4 gap-3 shrink-0">
        <Video className="h-5 w-5 text-emerald-400" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">Teleconsulta — {patient?.name || "Paciente"}</p>
          <p className="text-xs text-white/50">Dr(a): {room.doctorName} • Sala: {room.roomName}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Ao vivo
          </span>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video area */}
        <div className="flex-1 flex flex-col">
          {/* Jitsi iframe */}
          <div className="flex-1 relative bg-[hsl(222,47%,6%)]">
            <iframe
              src={`https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.startWithAudioMuted=${!micOn}&config.startWithVideoMuted=${!videoOn}&interfaceConfig.TOOLBAR_BUTTONS=[]&interfaceConfig.FILM_STRIP_MAX_HEIGHT=0`}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="absolute inset-0 w-full h-full border-0"
              title="Videochamada"
            />
          </div>

          {/* Controls */}
          <div className="h-16 bg-[hsl(222,47%,11%)] border-t border-white/10 flex items-center justify-center gap-3">
            <button onClick={() => setMicOn(!micOn)} className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${micOn ? "bg-white/10 text-white hover:bg-white/20" : "bg-red-500 text-white"}`}>
              {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>
            <button onClick={() => setVideoOn(!videoOn)} className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${videoOn ? "bg-white/10 text-white hover:bg-white/20" : "bg-red-500 text-white"}`}>
              {videoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>
            <button onClick={() => setChatOpen(!chatOpen)} className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${chatOpen ? "bg-primary text-white" : "bg-white/10 text-white hover:bg-white/20"}`}>
              <MessageCircle className="h-5 w-5" />
            </button>
            <button onClick={handleEndCall} className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors">
              <PhoneOff className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Chat sidebar */}
        {chatOpen && (
          <div className="w-80 lg:w-96 bg-[hsl(222,47%,11%)] border-l border-white/10 flex flex-col shrink-0">
            <div className="h-12 flex items-center justify-between px-4 border-b border-white/10">
              <span className="text-sm font-medium text-white flex items-center gap-2">
                <MessageCircle className="h-4 w-4" /> Chat da Consulta
              </span>
              <button onClick={() => setChatOpen(false)} className="text-white/50 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 && (
                <p className="text-xs text-white/30 text-center py-8">Nenhuma mensagem ainda. Inicie a conversa!</p>
              )}
              {messages.map((msg) => {
                const isMe = msg.sender === senderName;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <span className={`text-[10px] mb-0.5 ${isMe ? "text-primary/60" : "text-white/40"}`}>
                      {msg.senderRole === "doctor" ? "👨‍⚕️" : "🧑"} {msg.sender}
                    </span>
                    <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-white/10 text-white rounded-bl-sm"}`}>
                      {msg.type === "image" && msg.fileUrl && (
                        <img src={msg.fileUrl} alt="Imagem" className="rounded-lg max-w-full mb-1 max-h-40 object-cover" />
                      )}
                      {msg.type === "file" && msg.fileUrl && (
                        <a href={msg.fileUrl} download={msg.fileName} className="flex items-center gap-2 underline text-xs mb-1">
                          📎 {msg.fileName}
                        </a>
                      )}
                      <p>{msg.content}</p>
                    </div>
                    <span className="text-[9px] text-white/30 mt-0.5">{format(new Date(msg.timestamp), "HH:mm")}</span>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-1 bg-white/5 rounded-xl px-3 border border-white/10">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 bg-transparent text-white text-sm py-2.5 outline-none placeholder:text-white/30"
                  />
                  <label className="cursor-pointer text-white/40 hover:text-white/70 transition-colors">
                    <Image className="h-4 w-4" />
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <label className="cursor-pointer text-white/40 hover:text-white/70 transition-colors">
                    <Paperclip className="h-4 w-4" />
                    <input type="file" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                <button onClick={handleSend} className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity shrink-0">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
