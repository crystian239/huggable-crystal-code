import { useState, useMemo, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useAdminStore } from "@/data/adminStore";
import { useClinicStore } from "@/data/clinicStore";
import { useSupportStore } from "@/data/supportStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Stethoscope, MessageCircle, Send, Headphones, Paperclip, Image, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import EmojiPicker from "@/components/EmojiPicker";

export default function AdminSuportePage() {
  const { doctors } = useAdminStore();
  const clinicStore = useClinicStore();
  const supportStore = useSupportStore();
  const [searchParams] = useSearchParams();
  const initialDoctor = searchParams.get("doctor");

  const [chatDoctor, setChatDoctor] = useState<string | null>(initialDoctor);
  const [chatMessage, setChatMessage] = useState("");
  const [msgImage, setMsgImage] = useState<{ url: string; name: string } | null>(null);
  const [msgFile, setMsgFile] = useState<{ url: string; name: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const doctorMessages = useMemo(() => {
    if (!chatDoctor) return [];
    return clinicStore.messages.filter(
      (m) => (m.from === "admin" && m.to === chatDoctor) || (m.from === chatDoctor && m.to === "admin")
    ).sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  }, [chatDoctor, clinicStore.messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [doctorMessages.length]);

  // Mark messages from selected doctor as read
  useEffect(() => {
    if (!chatDoctor) return;
    clinicStore.messages.forEach((m) => {
      if (m.from === chatDoctor && m.to === "admin" && !m.read) {
        clinicStore.markMessageRead(m.id);
      }
    });
  }, [chatDoctor, clinicStore.messages]);

  const supportTickets = supportStore.tickets || [];
  const openTickets = supportTickets.filter((t: any) => t.status === "open" || t.status === "pending").length;

  const handleSendChat = () => {
    if (!chatMessage.trim() && !msgFile && !msgImage) return;
    if (!chatDoctor) return;
    clinicStore.addMessage({
      from: "admin",
      to: chatDoctor,
      content: chatMessage.trim(),
      date: new Date().toISOString(),
      read: false,
      fileUrl: msgFile?.url,
      fileName: msgFile?.name,
      imageUrl: msgImage?.url,
    });
    setChatMessage("");
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
    const reader = new FileReader();
    reader.onload = () => setMsgFile({ url: reader.result as string, name: file.name });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">Chat com Médicos</h2>
          <p className="text-sm text-muted-foreground">Comunicação direta com a equipe médica</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
          {/* Doctor list */}
          <div className="bg-card rounded-2xl border border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="font-heading font-semibold text-foreground text-sm">Médicos</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {doctors.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhum médico cadastrado.</p>
              ) : (
                doctors.map((doc) => {
                  const unread = clinicStore.messages.filter((m) => m.from === doc.loginUsername && m.to === "admin" && !m.read).length;
                  return (
                    <button key={doc.id} onClick={() => setChatDoctor(doc.loginUsername)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left ${chatDoctor === doc.loginUsername ? "bg-primary/10 border border-primary/20" : "hover:bg-accent"}`}>
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Stethoscope className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">Dr(a). {doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.specialty}</p>
                      </div>
                      {unread > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-[1.25rem] flex items-center justify-center px-1 font-bold">{unread}</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
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
                    <p className="text-sm font-semibold text-foreground">Dr(a). {doctors.find((d) => d.loginUsername === chatDoctor)?.name || chatDoctor}</p>
                    <p className="text-xs text-muted-foreground">{doctors.find((d) => d.loginUsername === chatDoctor)?.specialty}</p>
                  </div>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                  {doctorMessages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-10">Nenhuma mensagem ainda. Inicie a conversa!</p>
                  ) : (
                    doctorMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.from === "admin" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${msg.from === "admin" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-accent text-foreground rounded-bl-md"}`}>
                          {msg.from !== "admin" && (
                            <p className="text-[10px] font-semibold mb-1 opacity-70">
                              Dr(a). {doctors.find((d) => d.loginUsername === msg.from)?.name || msg.from}
                            </p>
                          )}
                          {msg.content && <p>{msg.content}</p>}
                          {(msg as any).imageUrl && (
                            <img src={(msg as any).imageUrl} alt="imagem" className="max-w-full rounded-lg mt-2" />
                          )}
                          {(msg as any).fileUrl && (msg as any).fileName && (
                            <a href={(msg as any).fileUrl} download={(msg as any).fileName} className="flex items-center gap-2 mt-2 text-xs underline">
                              <Paperclip className="h-3 w-3" /> {(msg as any).fileName}
                            </a>
                          )}
                          {msg.date && <p className={`text-[10px] mt-1 ${msg.from === "admin" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{format(new Date(msg.date), "dd/MM HH:mm", { locale: ptBR })}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Attachments preview */}
                {(msgImage || msgFile) && (
                  <div className="px-4 py-2 border-t border-border/50 flex gap-2">
                    {msgImage && (
                      <div className="relative">
                        <img src={msgImage.url} alt="" className="h-16 w-16 object-cover rounded-lg" />
                        <button onClick={() => setMsgImage(null)} className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-primary-foreground flex items-center justify-center">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {msgFile && (
                      <div className="flex items-center gap-2 bg-accent rounded-lg px-3 py-2 text-xs">
                        <Paperclip className="h-3 w-3" /> {msgFile.name}
                        <button onClick={() => setMsgFile(null)} className="ml-1 text-destructive"><X className="h-3 w-3" /></button>
                      </div>
                    )}
                  </div>
                )}

                {/* Input with emoji, image, file */}
                <div className="p-3 border-t border-border flex items-center gap-2">
                  <EmojiPicker onSelect={(emoji) => setChatMessage((prev) => prev + emoji)} />
                  <label className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                    <Image className="h-5 w-5" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  <label className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                    <Paperclip className="h-5 w-5" />
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                  <input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendChat()}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 border border-input bg-background rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button onClick={handleSendChat} disabled={!chatMessage.trim() && !msgFile && !msgImage} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
