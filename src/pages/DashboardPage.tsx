import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useClinicStore } from "@/data/clinicStore";
import { useAuthStore } from "@/data/authStore";
import { useAdminStore } from "@/data/adminStore";
import { Users, Calendar, DollarSign, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const patients = useClinicStore((s) => s.patients);
  const appointments = useClinicStore((s) => s.appointments);
  const payments = useClinicStore((s) => s.payments);
  const currentUser = useAuthStore((s) => s.user);
  const adminDoctors = useAdminStore((s) => s.doctors);
  const isAdmin = currentUser?.role === "admin";
  const doctorProfile = adminDoctors.find((d) => d.loginUsername === currentUser?.username);
  const myDoctorName = doctorProfile?.name || "";

  const today = format(new Date(), "yyyy-MM-dd");
  // Filter by doctor when logged in as doctor
  const myAppointments = isAdmin ? appointments : appointments.filter((a) => a.doctorName === myDoctorName);
  const todayAppointments = myAppointments.filter((a) => a.date === today && a.status === "agendado");
  const totalReceived = payments.filter((p) => p.status === "pago").reduce((acc, p) => acc + p.amount, 0);
  const pendingPayments = payments.filter((p) => p.status === "pendente");
  const pendingTotal = pendingPayments.reduce((acc, p) => acc + p.amount, 0);

  const stats = [
    { label: "Pacientes", value: patients.length, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Consultas Hoje", value: todayAppointments.length, icon: Calendar, color: "bg-info/10 text-info" },
    { label: "Recebido", value: `R$ ${totalReceived.toFixed(2)}`, icon: TrendingUp, color: "bg-success/10 text-success" },
    { label: "Pendente", value: `R$ ${pendingTotal.toFixed(2)}`, icon: AlertCircle, color: "bg-warning/10 text-warning" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="animate-slide-up">
           <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-magic-gold" /> Dashboard
            {!isAdmin && myDoctorName && <span className="text-base font-normal text-muted-foreground ml-2">— {myDoctorName}</span>}
          </h1>
          <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {stats.map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-4 magic-shadow hover:scale-[1.03] hover-glow transition-all duration-300 cursor-default">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.color} transition-transform duration-300 group-hover:scale-110`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's appointments */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Consultas de Hoje</h2>
              <Link to="/agenda" className="text-xs text-primary hover:underline">Ver agenda</Link>
            </div>
            {todayAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma consulta agendada para hoje.</p>
            ) : (
              <div className="space-y-3">
                {todayAppointments.slice(0, 5).map((a) => {
                  const patient = patients.find((p) => p.id === a.patientId);
                  return (
                    <div key={a.id} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                        {patient?.name?.[0] || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{patient?.name || "Paciente"}</p>
                        <p className="text-xs text-muted-foreground">{a.time}</p>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{a.frequency}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending payments */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Pagamentos Pendentes</h2>
              <Link to="/financeiro" className="text-xs text-primary hover:underline">Ver todos</Link>
            </div>
            {pendingPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhum pagamento pendente.</p>
            ) : (
              <div className="space-y-3">
                {pendingPayments.slice(0, 5).map((p) => {
                  const patient = patients.find((pt) => pt.id === p.patientId);
                  return (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <DollarSign className="h-4 w-4 text-warning shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{patient?.name || "Paciente"}</p>
                          <p className="text-xs text-muted-foreground">{p.description}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-warning whitespace-nowrap ml-2">R$ {p.amount.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
