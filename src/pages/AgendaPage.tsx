import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useClinicStore } from "@/data/clinicStore";
import { useAuthStore } from "@/data/authStore";
import { useAdminStore } from "@/data/adminStore";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Printer, X, Calendar as CalIcon, User } from "lucide-react";
import { format, addDays, subDays, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, isSameMonth, isSameDay, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const FREQUENCIES = [
  { value: "unica" as const, label: "Única" },
  { value: "semanal" as const, label: "Semanal" },
  { value: "mensal" as const, label: "Mensal" },
  { value: "anual" as const, label: "Anual" },
];

const HOURS = Array.from({ length: 28 }, (_, i) => {
  const h = Math.floor(i / 2) + 6;
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

const BLOCK_COLORS = [
  "bg-red-500", "bg-green-600", "bg-blue-500", "bg-yellow-500",
  "bg-purple-500", "bg-pink-500", "bg-teal-500", "bg-orange-500",
  "bg-indigo-500", "bg-cyan-600",
];

function getColor(index: number) {
  return BLOCK_COLORS[index % BLOCK_COLORS.length];
}

function timeToSlot(time: string) {
  const [h, m] = time.split(":").map(Number);
  return (h - 6) * 2 + (m >= 30 ? 1 : 0);
}

export default function AgendaPage() {
  const patients = useClinicStore((s) => s.patients);
  const appointments = useClinicStore((s) => s.appointments);
  const addAppointment = useClinicStore((s) => s.addAppointment);
  const updateAppointment = useClinicStore((s) => s.updateAppointment);
  const deleteAppointment = useClinicStore((s) => s.deleteAppointment);
  const settings = useClinicStore((s) => s.settings);
  const currentUser = useAuthStore((s) => s.user);
  const adminDoctors = useAdminStore((s) => s.doctors);
  const isAdmin = currentUser?.role === "admin";
  // For doctors: find their doctorName from adminStore (linked by loginUsername)
  const doctorProfile = adminDoctors.find((d) => d.loginUsername === currentUser?.username);
  const myDoctorName = doctorProfile?.name || "";
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  // Doctors can only see their own agenda; admin can filter
  const [selectedDoctor, setSelectedDoctor] = useState(isAdmin ? "todos" : myDoctorName);
  const [form, setForm] = useState({
    patientId: "", date: format(new Date(), "yyyy-MM-dd"), time: "08:00",
    dayOfWeek: "", frequency: "unica" as "unica" | "semanal" | "mensal" | "anual", doctorName: isAdmin ? (settings.doctors[0] || settings.doctorName) : myDoctorName,
    notes: "", status: "agendado" as const, sessionValue: "",
  });
  const [calMonth, setCalMonth] = useState(new Date());

  const dateStr = format(currentDate, "yyyy-MM-dd");
  const dayAppointments = useMemo(() => {
    let filtered = appointments.filter((a) => a.date === dateStr && a.status !== "cancelado");
    if (!isAdmin) {
      // Doctor only sees their own appointments
      filtered = filtered.filter((a) => a.doctorName === myDoctorName);
    } else if (selectedDoctor !== "todos") {
      filtered = filtered.filter((a) => a.doctorName === selectedDoctor);
    }
    return filtered.sort((a, b) => a.time.localeCompare(b.time));
  },
    [appointments, dateStr, selectedDoctor, isAdmin, myDoctorName]
  );

  const handleSave = () => {
    if (!form.patientId || !form.date || !form.time || !form.doctorName) {
      toast.error("Preencha paciente, profissional, data e horário.");
      return;
    }
    addAppointment({
      ...form,
      sessionValue: form.sessionValue ? parseFloat(form.sessionValue) : 0,
      dayOfWeek: format(parseISO(form.date), "EEEE", { locale: ptBR }),
    });
    toast.success("Consulta agendada!");
    setShowForm(false);
    setForm({ patientId: "", date: format(new Date(), "yyyy-MM-dd"), time: "08:00", dayOfWeek: "", frequency: "unica", doctorName: isAdmin ? (settings.doctors[0] || settings.doctorName) : myDoctorName, notes: "", status: "agendado", sessionValue: "" });
  };

  const handlePrint = () => window.print();

  const markStatus = (id: string, status: "concluido" | "cancelado" | "faltou") => {
    updateAppointment(id, { status });
    toast.success("Status atualizado!");
  };

  const goToday = () => setCurrentDate(new Date());

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between no-print">
          <h1 className="text-2xl font-semibold text-foreground">Agenda</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={goToday}><CalIcon className="h-4 w-4 mr-1" /> Hoje</Button>
            <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-4 w-4 mr-1" /> Imprimir</Button>
            <Button size="sm" onClick={() => { setForm((f) => ({ ...f, date: dateStr })); setShowForm(true); }}><Plus className="h-4 w-4 mr-1" /> Agendar</Button>
          </div>
        </div>

        {/* Doctor filter - only visible for admin */}
        {isAdmin && (
          <div className="flex flex-wrap gap-2 no-print">
            <button
              onClick={() => setSelectedDoctor("todos")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-colors ${selectedDoctor === "todos" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
            >
              <User className="h-3.5 w-3.5" /> Todos
            </button>
            {settings.doctors.map((doc) => (
              <button
                key={doc}
                onClick={() => setSelectedDoctor(doc)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-colors ${selectedDoctor === doc ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
              >
                <User className="h-3.5 w-3.5" /> {doc}
              </button>
            ))}
          </div>
        )}
        {!isAdmin && myDoctorName && (
          <div className="bg-primary/10 text-primary rounded-xl px-4 py-2 text-sm font-medium no-print">
            📋 Sua agenda — {myDoctorName}
          </div>
        )}

        {/* Day navigation */}
        <div className="flex items-center justify-between bg-card border border-border rounded-xl p-3 no-print">
          <button onClick={() => setCurrentDate(subDays(currentDate, 1))} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <h2 className="font-semibold text-foreground capitalize">
              {format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{selectedDoctor === "todos" ? "Todos os profissionais" : selectedDoctor}</p>
          </div>
          <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Main layout: Timeline + Calendar sidebar */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Timeline */}
          <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden">
            <div className="relative">
              {HOURS.map((hour, idx) => {
                const isHour = hour.endsWith(":00");
                const appts = dayAppointments.filter((a) => {
                  const aSlot = timeToSlot(a.time);
                  return aSlot === idx;
                });

                return (
                  <div key={hour} className={`flex border-b border-border/50 ${isHour ? "border-border" : ""}`} style={{ minHeight: 48 }}>
                    <div className="w-16 sm:w-20 shrink-0 flex items-start justify-end pr-2 pt-1 border-r border-border bg-secondary/30">
                      {isHour && (
                        <span className="text-xs font-medium text-muted-foreground">{hour}</span>
                      )}
                    </div>
                    <div className="flex-1 relative">
                      {appts.length > 0 ? (
                        appts.map((a) => {
                          const patient = patients.find((p) => p.id === a.patientId);
                          const colorIdx = patients.findIndex((p) => p.id === a.patientId);
                          const bgColor = a.status === "concluido"
                            ? "bg-green-600"
                            : a.status === "faltou"
                            ? "bg-yellow-500"
                            : getColor(colorIdx);

                          return (
                            <div
                              key={a.id}
                              className={`${bgColor} text-white px-3 py-1.5 flex items-center gap-3 cursor-pointer group w-full`}
                              style={{ minHeight: 44 }}
                            >
                              <span className="text-xs font-bold whitespace-nowrap">{a.time} - {
                                (() => {
                                  const [h, m] = a.time.split(":").map(Number);
                                  const end = new Date(2000, 0, 1, h, m + 50);
                                  return format(end, "HH:mm");
                                })()
                              }</span>
                              <span className="text-sm font-semibold truncate">
                                {patient?.name || "Paciente"}
                              </span>
                              <span className="text-xs opacity-80 hidden sm:inline">
                                | Consulta | {patient?.phone || ""} | R$ {(a.sessionValue || 0).toFixed(2)} | {a.doctorName || settings.doctorName}
                              </span>
                              <div className="hidden group-hover:flex items-center gap-1 ml-auto shrink-0">
                                <button onClick={(e) => { e.stopPropagation(); markStatus(a.id, "concluido"); }} className="bg-white/20 hover:bg-white/30 text-white text-[10px] px-2 py-1 rounded font-medium">✓ OK</button>
                                <button onClick={(e) => { e.stopPropagation(); markStatus(a.id, "faltou"); }} className="bg-white/20 hover:bg-white/30 text-white text-[10px] px-2 py-1 rounded font-medium">Faltou</button>
                                <button onClick={(e) => { e.stopPropagation(); markStatus(a.id, "cancelado"); }} className="bg-white/20 hover:bg-white/30 text-white text-[10px] px-2 py-1 rounded font-medium">Cancelar</button>
                                <button onClick={(e) => { e.stopPropagation(); deleteAppointment(a.id); toast.success("Removido!"); }} className="bg-white/20 hover:bg-white/30 text-white text-[10px] px-2 py-1 rounded font-medium">🗑</button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="h-full w-full hover:bg-secondary/30 transition-colors" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calendar Sidebar */}
          <div className="lg:w-72 shrink-0 space-y-4 no-print">
            {/* Mini Calendar */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <CalIcon className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm text-foreground">Calendário</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => setCalMonth(subMonths(calMonth, 1))} className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium text-foreground capitalize">
                  {format(calMonth, "MMMM yyyy", { locale: ptBR })}
                </span>
                <button onClick={() => setCalMonth(addMonths(calMonth, 1))} className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {["Do", "Se", "Te", "Qu", "Qu", "Se", "Sa"].map((d, i) => (
                  <div key={i} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-0.5">
                {(() => {
                  const monthStart = startOfMonth(calMonth);
                  const monthEnd = endOfMonth(calMonth);
                  const calStart = startOfWeek(monthStart, { locale: ptBR });
                  const calEnd = endOfWeek(monthEnd, { locale: ptBR });
                  const days = eachDayOfInterval({ start: calStart, end: calEnd });

                  return days.map((day) => {
                    const dayStr = format(day, "yyyy-MM-dd");
                    const isCurrentMonth = isSameMonth(day, calMonth);
                    const isSelected = isSameDay(day, currentDate);
                    const isToday = isSameDay(day, new Date());
                    const hasAppts = appointments.some((a) => a.date === dayStr && a.status !== "cancelado");
                    const apptCount = appointments.filter((a) => a.date === dayStr && a.status !== "cancelado").length;

                    // Color based on appointment density
                    let dotColor = "";
                    if (hasAppts) {
                      if (apptCount >= 8) dotColor = "bg-red-500";
                      else if (apptCount >= 5) dotColor = "bg-orange-500";
                      else if (apptCount >= 3) dotColor = "bg-yellow-500";
                      else dotColor = "bg-emerald-500";
                    }

                    return (
                      <button
                        key={dayStr}
                        onClick={() => { setCurrentDate(day); }}
                        className={`relative flex flex-col items-center justify-center p-1 rounded text-xs transition-colors
                          ${!isCurrentMonth ? "text-muted-foreground/40" : "text-foreground"}
                          ${isSelected ? "bg-primary text-primary-foreground font-bold" : ""}
                          ${isToday && !isSelected ? "border border-primary font-bold" : ""}
                          ${!isSelected ? "hover:bg-secondary" : ""}
                        `}
                      >
                        <span>{format(day, "d")}</span>
                        {hasAppts && !isSelected && (
                          <span className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        )}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Availability Legend */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-foreground">ℹ Disponibilidade da agenda</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="flex flex-col items-center gap-1">
                  <span className="w-6 h-6 rounded bg-emerald-500" />
                  <span className="text-[10px] text-muted-foreground">1-2</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="w-6 h-6 rounded bg-yellow-500" />
                  <span className="text-[10px] text-muted-foreground">3-4</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="w-6 h-6 rounded bg-orange-500" />
                  <span className="text-[10px] text-muted-foreground">5-7</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="w-6 h-6 rounded bg-red-500" />
                  <span className="text-[10px] text-muted-foreground">8+</span>
                </div>
              </div>
            </div>

            {/* Today's summary */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Resumo do dia</h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p><span className="font-medium text-foreground">{dayAppointments.length}</span> consultas agendadas</p>
                <p><span className="font-medium text-foreground">{dayAppointments.filter(a => a.status === "concluido").length}</span> concluídas</p>
                <p><span className="font-medium text-foreground">{dayAppointments.filter(a => a.status === "faltou").length}</span> faltas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground no-print">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500" /> Agendado</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-600" /> Concluído</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-500" /> Faltou</span>
          <span className="text-muted-foreground/50">Passe o mouse sobre a consulta para ações</span>
        </div>

        {/* New appointment modal */}
        {showForm && (
          <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-card border border-border rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Nova Consulta</h2>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Paciente *</label>
                  <select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Selecione um paciente</option>
                    {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Profissional *</label>
                  <select value={form.doctorName} onChange={(e) => setForm({ ...form, doctorName: e.target.value })} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Selecione o profissional</option>
                    {settings.doctors.map((doc) => <option key={doc} value={doc}>{doc}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Data *</label>
                    <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Horário *</label>
                    <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Frequência</label>
                  <div className="grid grid-cols-4 gap-2">
                    {FREQUENCIES.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setForm({ ...form, frequency: f.value })}
                        className={`py-2 text-xs rounded-lg border transition-colors ${form.frequency === f.value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Valor da Sessão (R$)</label>
                  <input type="number" step="0.01" value={form.sessionValue} onChange={(e) => setForm({ ...form, sessionValue: e.target.value })} placeholder="0.00" className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Observações</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
                <Button onClick={handleSave} className="w-full">Agendar Consulta</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
