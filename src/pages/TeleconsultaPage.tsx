import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useClinicStore } from "@/data/clinicStore";
import { useTeleconsultaStore } from "@/data/teleconsultaStore";
import { useAdminStore } from "@/data/adminStore";
import { Button } from "@/components/ui/button";
import { Video, Plus, X, Copy, Trash2, ExternalLink, Phone, PhoneCall, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TeleconsultaPage() {
  const patients = useClinicStore((s) => s.patients);
  const settings = useClinicStore((s) => s.settings);
  const { rooms, createRoom, updateRoom, deleteRoom, chatMessages, startCall, endCall } = useTeleconsultaStore();
  const adminDoctors = useAdminStore((s) => s.doctors);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patientId: "", doctorName: settings.doctors[0] || settings.doctorName, scheduledAt: "" });

  const sortedRooms = useMemo(() =>
    [...rooms].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [rooms]
  );

  const handleCreate = () => {
    if (!form.patientId || !form.doctorName) {
      toast.error("Selecione paciente e profissional.");
      return;
    }
    const room = createRoom({
      patientId: form.patientId,
      doctorName: form.doctorName,
      status: "aguardando",
      scheduledAt: form.scheduledAt || undefined,
    });
    toast.success("Sala criada! Link copiado.");
    navigator.clipboard.writeText(room.link);
    setShowForm(false);
    setForm({ patientId: "", doctorName: settings.doctors[0] || settings.doctorName, scheduledAt: "" });
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  const statusColors: Record<string, string> = {
    aguardando: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    em_andamento: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    finalizada: "bg-muted text-muted-foreground",
  };

  const statusLabels: Record<string, string> = {
    aguardando: "Aguardando",
    em_andamento: "Em andamento",
    finalizada: "Finalizada",
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Video className="h-6 w-6 text-primary" /> Teleconsulta
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Videochamadas com pacientes</p>
          </div>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> Nova Sala
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Aguardando", count: rooms.filter((r) => r.status === "aguardando").length, color: "text-yellow-600" },
            { label: "Em andamento", count: rooms.filter((r) => r.status === "em_andamento").length, color: "text-emerald-600" },
            { label: "Finalizadas", count: rooms.filter((r) => r.status === "finalizada").length, color: "text-muted-foreground" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Rooms list */}
        <div className="space-y-3">
          {sortedRooms.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <Video className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma sala criada ainda.</p>
            </div>
          ) : (
            sortedRooms.map((room) => {
              const patient = patients.find((p) => p.id === room.patientId);
              const msgCount = chatMessages.filter((m) => m.roomId === room.id).length;
              return (
                <div key={room.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Video className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-foreground">{patient?.name || "Paciente"}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[room.status]}`}>
                          {statusLabels[room.status]}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Dr(a): {room.doctorName}</span>
                        <span>Criada: {format(new Date(room.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                        {room.scheduledAt && <span>Agendada: {format(new Date(room.scheduledAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>}
                        {msgCount > 0 && <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {msgCount} msgs</span>}
                      </div>

                      {/* Link */}
                      <div className="mt-2 flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-1.5">
                        <span className="text-xs text-muted-foreground truncate flex-1">{room.link}</span>
                        <button onClick={() => copyLink(room.link)} className="text-primary hover:text-primary/80 shrink-0">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                      <div className="flex flex-col gap-1 shrink-0">
                        {room.status !== "finalizada" && (
                          <button
                            onClick={() => {
                              const doctor = adminDoctors.find((d) => d.name === room.doctorName);
                              startCall(room.id, room.doctorName, room.patientId, doctor?.specialty);
                              updateRoom(room.id, { status: "em_andamento" });
                              toast.success("Chamando paciente...");
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 bg-success text-success-foreground rounded-lg text-xs font-medium hover:bg-success/90 transition-colors"
                            title="Ligar para o paciente"
                          >
                            <PhoneCall className="h-4 w-4" /> Ligar
                          </button>
                        )}
                        <a href={`/teleconsulta/sala/${room.roomName}`} target="_blank" rel="noopener noreferrer" className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Entrar na sala">
                          <Phone className="h-4 w-4" />
                        </a>
                      {room.status === "em_andamento" && (
                        <button onClick={() => { updateRoom(room.id, { status: "finalizada" }); endCall(); }} className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors" title="Finalizar">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => { deleteRoom(room.id); toast.success("Sala removida!"); }} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Create room modal */}
        {showForm && (
          <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-card border border-border rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Nova Sala de Teleconsulta</h2>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Paciente *</label>
                  <select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Selecione</option>
                    {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Profissional *</label>
                  <select value={form.doctorName} onChange={(e) => setForm({ ...form, doctorName: e.target.value })} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                    {settings.doctors.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Data/Hora agendada</label>
                  <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <Button onClick={handleCreate} className="w-full">
                  <Video className="h-4 w-4 mr-2" /> Criar Sala e Copiar Link
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
