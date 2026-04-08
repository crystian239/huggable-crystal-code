import { useState, useRef, useEffect, useMemo } from "react";
import { useSupportStore } from "@/data/supportStore";
import { MessageCircle, X, Send, Paperclip, Image, Minimize2 } from "lucide-react";
import EmojiPicker from "@/components/EmojiPicker";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface Props {
  patientAccountId: string;
  patientName: string;
  patientAvatar: string;
}

export default function SupportChatWidget({ patientAccountId, patientName, patientAvatar }: Props) {
  const {
    tickets, messages, createTicket, addMessage,
    setPresence, setTyping, presences,
  } = useSupportStore();

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [typingTimeout, setTypingTimeoutState] = useState<ReturnType<typeof setTimeout> | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Find or create active ticket
  const activeTicket = useMemo(
    () => tickets.find((t) => t.patientAccountId === patientAccountId && t.status !== "fechado"),
    [tickets, patientAccountId]
  );

  const ticketMessages = useMemo(
    () => activeTicket
      ? messages.filter((m) => m.ticketId === activeTicket.id).sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      : [],
    [messages, activeTicket]
  );

  // Presence
  useEffect(() => {
    if (open) {
      setPresence(patientAccountId, patientName, true);
      return () => { setPresence(patientAccountId, patientName, false); };
    }
  }, [open, patientAccountId, patientName, setPresence]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticketMessages]);

  const supportPresence = useMemo(() => {
    if (!activeTicket?.assignedTo) return null;
    return presences.find((p) => p.userName === activeTicket.assignedTo);
  }, [presences, activeTicket]);

  const unreadCount = useMemo(() => {
    if (!activeTicket) return 0;
    return messages.filter(
      (m) => m.ticketId === activeTicket.id && m.sender === "support"
    ).length; // simplified - in real app you'd track read status
  }, [messages, activeTicket]);

  const handleOpen = () => {
    setOpen(true);
    if (!activeTicket) {
      createTicket({
        patientAccountId,
        patientName,
        patientAvatar,
      });
    }
  };

  const handleSend = () => {
    if (!text.trim() || !activeTicket) return;
    addMessage({
      ticketId: activeTicket.id,
      sender: "patient",
      senderName: patientName,
      senderAvatar: patientAvatar,
      content: text.trim(),
      type: "text",
    });
    setText("");
    setTyping(patientAccountId, false);
  };

  const handleTyping = (value: string) => {
    setText(value);
    setTyping(patientAccountId, true);
    if (typingTimeout) clearTimeout(typingTimeout);
    const t = setTimeout(() => setTyping(patientAccountId, false), 2000);
    setTypingTimeoutState(t);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isImage: boolean) => {
    const file = e.target.files?.[0];
    if (!file || !activeTicket) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo deve ter no máximo 10MB.");
      return;
    }
    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => {
        addMessage({
          ticketId: activeTicket.id,
          sender: "patient",
          senderName: patientName,
          senderAvatar: patientAvatar,
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
        ticketId: activeTicket.id,
        sender: "patient",
        senderName: patientName,
        senderAvatar: patientAvatar,
        content: `📎 ${file.name}`,
        type: "file",
        fileName: file.name,
        fileUrl: url,
      });
      toast.success("Arquivo enviado!");
    }
    e.target.value = "";
  };

  // Floating button
  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform flex items-center justify-center animate-fade-in"
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-6rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3 shrink-0">
        <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center text-sm font-bold shrink-0">
          {activeTicket?.assignedTo ? (
            activeTicket.assignedAvatar ? (
              <img src={activeTicket.assignedAvatar} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              activeTicket.assignedTo.charAt(0).toUpperCase()
            )
          ) : (
            <MessageCircle className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">
            {activeTicket?.assignedTo || "Suporte"}
          </p>
          <div className="flex items-center gap-1.5">
            {supportPresence?.isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] opacity-80">
                  {supportPresence.isTyping ? "Digitando..." : "Online"}
                </span>
              </>
            ) : supportPresence?.lastSeen ? (
              <span className="text-[11px] opacity-60">
                Visto por último {formatDistanceToNow(new Date(supportPresence.lastSeen), { addSuffix: true, locale: ptBR })}
              </span>
            ) : (
              <span className="text-[11px] opacity-60">Aguardando atendente...</span>
            )}
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground">
          <Minimize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-background">
        {ticketMessages.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Olá! Como podemos ajudar?</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">Envie sua mensagem abaixo.</p>
          </div>
        )}
        {ticketMessages.map((msg) => {
          const isMe = msg.sender === "patient";
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
              {/* Avatar */}
              <div className="shrink-0">
                {msg.senderAvatar ? (
                  <img src={msg.senderAvatar} className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                    {msg.senderName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className={`max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
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
        {supportPresence?.isTyping && (
          <div className="flex gap-2 items-end">
            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
              {activeTicket?.assignedTo?.charAt(0)?.toUpperCase() || "S"}
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
      <div className="p-3 border-t border-border bg-card shrink-0">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-1 bg-background border border-input rounded-xl px-3">
            <input
              type="text"
              value={text}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-transparent text-sm py-2.5 outline-none text-foreground placeholder:text-muted-foreground"
            />
            <button onClick={() => imageInputRef.current?.click()} className="text-muted-foreground hover:text-foreground transition-colors">
              <Image className="h-4 w-4" />
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="text-muted-foreground hover:text-foreground transition-colors">
              <Paperclip className="h-4 w-4" />
            </button>
            <EmojiPicker onSelect={(emoji) => setText((prev) => prev + emoji)} />
            <input ref={imageInputRef} type="file" accept="image/*" onChange={(e) => handleFileUpload(e, true)} className="hidden" />
            <input ref={fileInputRef} type="file" onChange={(e) => handleFileUpload(e, false)} className="hidden" />
          </div>
          <button onClick={handleSend} className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity shrink-0">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
