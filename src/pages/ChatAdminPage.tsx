import { useState, useMemo, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useClinicStore } from "@/data/clinicStore";
import { useAuthStore } from "@/data/authStore";
import { useAdminStore } from "@/data/adminStore";
import { useChatPresenceStore } from "@/data/chatPresenceStore";
import { PresenceLabel } from "@/components/PresenceIndicator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Send, Shield, Paperclip, Image, X } from "lucide-react";
import EmojiPicker from "@/components/EmojiPicker";

export default function ChatAdminPage() {
  const currentUser = useAuthStore((s) => s.user);
  const messages = useClinicStore((s) => s.messages);
  const addMessage = useClinicStore((s) => s.addMessage);
  const markMessageRead = useClinicStore((s) => s.markMessageRead);
  const doctors = useAdminStore((s) => s.doctors);
  const [msgContent, setMsgContent] = useState("");
  const [msgImage, setMsgImage] = useState<{ url: string; name: string } | null>(null);
  const [msgFile, setMsgFile] = useState<{ url: string; name: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const myUsername = currentUser?.username || "";
  const { setOnline, setOffline, getPresence } = useChatPresenceStore();

  // Find doctor profile to show name
  const doctorProfile = doctors.find((d) => d.loginUsername === myUsername);
  const displayName = doctorProfile ? `Dr(a). ${doctorProfile.name}` : myUsername;

  // Set doctor online
  useEffect(() => {
    if (myUsername) {
      setOnline(myUsername, displayName, "doctor");
      return () => { setOffline(myUsername); };
    }
  }, [myUsername, displayName, setOnline, setOffline]);

  const adminPresence = getPresence("admin");

  const chatMessages = useMemo(() =>
    messages
      .filter((m) => (m.from === myUsername && m.to === "admin") || (m.from === "admin" && m.to === myUsername))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [messages, myUsername]
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages.length]);

  const handleSend = () => {
    if (!msgContent.trim() && !msgFile && !msgImage) return;
    addMessage({
      from: myUsername,
      to: "admin",
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setMsgImage({ url: reader.result as string, name: file.name });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMsgFile({ url, name: file.name });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="bg-card rounded-t-2xl border border-border p-4 flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-primary" />
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${adminPresence?.isOnline ? "bg-emerald-500" : "bg-destructive/60"}`} />
          </div>
          <div>
            <h2 className="font-heading font-bold text-foreground text-sm">Chat com Administrador</h2>
            <PresenceLabel
              isOnline={adminPresence?.isOnline || false}
              isTyping={adminPresence?.isTyping || false}
              lastSeen={adminPresence?.lastSeen}
            />
            <p className="text-[10px] text-muted-foreground mt-0.5">Enviando como: <strong className="text-foreground">{displayName}</strong></p>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-card border-x border-border p-4 space-y-3">
          {chatMessages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center py-16">
              <div>
                <Shield className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda.</p>
                <p className="text-xs text-muted-foreground mt-1">Envie uma mensagem para o administrador.</p>
              </div>
            </div>
          ) : (
            chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === myUsername ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.from === myUsername
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-accent text-foreground rounded-bl-md"
                }`}>
                  {msg.from !== myUsername && (
                    <p className="text-[10px] font-semibold mb-1 opacity-70">Administrador</p>
                  )}
                  {msg.content && <p>{msg.content}</p>}
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="imagem" className="max-w-full rounded-lg mt-2" />
                  )}
                  {msg.fileUrl && msg.fileName && (
                    <a href={msg.fileUrl} download={msg.fileName} className="flex items-center gap-2 mt-2 text-xs underline">
                      <Paperclip className="h-3 w-3" /> {msg.fileName}
                    </a>
                  )}
                  {msg.date && (
                    <p className={`text-[10px] mt-1 ${msg.from === myUsername ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {format(new Date(msg.date), "dd/MM HH:mm", { locale: ptBR })}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Attachments preview */}
        {(msgImage || msgFile) && (
          <div className="bg-card border-x border-border px-4 py-2 flex gap-2">
            {msgImage && (
              <div className="relative">
                <img src={msgImage.url} alt="" className="h-16 w-16 object-cover rounded-lg" />
                <button onClick={() => setMsgImage(null)} className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-primary-foreground flex items-center justify-center">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {msgFile && (
              <div className="flex items-center gap-2 bg-accent rounded-lg px-3 py-2 text-xs relative">
                <Paperclip className="h-3 w-3" /> {msgFile.name}
                <button onClick={() => setMsgFile(null)} className="ml-1 text-destructive"><X className="h-3 w-3" /></button>
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <div className="bg-card rounded-b-2xl border border-border p-3 flex items-center gap-2">
          <EmojiPicker onSelect={(emoji) => setMsgContent((prev) => prev + emoji)} />
          <label className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
            <Image className="h-5 w-5" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          <label className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
            <Paperclip className="h-5 w-5" />
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
          <input
            value={msgContent}
            onChange={(e) => setMsgContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Digite sua mensagem para o admin..."
            className="flex-1 border border-input bg-background rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <Button onClick={handleSend} disabled={!msgContent.trim() && !msgFile && !msgImage} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
