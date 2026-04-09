import { useEffect, useState } from "react";
import { useClinicStore } from "@/data/clinicStore";
import { useTeleconsultaStore } from "@/data/teleconsultaStore";
import { useAdminStore } from "@/data/adminStore";
import { useAuthStore } from "@/data/authStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SeedTestData() {
  const [seeded, setSeeded] = useState(false);
  const addPatient = useClinicStore((s) => s.addPatient);
  const addAppointment = useClinicStore((s) => s.addAppointment);
  const addPayment = useClinicStore((s) => s.addPayment);
  const addActivity = useClinicStore((s) => s.addActivity);
  const addAtestado = useClinicStore((s) => s.addAtestado);
  const addNotification = useClinicStore((s) => s.addNotification);
  const updateSettings = useClinicStore((s) => s.updateSettings);
  const patients = useClinicStore((s) => s.patients);
  const registerPatient = useTeleconsultaStore((s) => s.registerPatient);
  const createRoom = useTeleconsultaStore((s) => s.createRoom);
  const addDoctor = useAdminStore((s) => s.addDoctor);
  const doctors = useAdminStore((s) => s.doctors);
  const addUser = useAuthStore((s) => s.addUser);

  const handleSeed = () => {
    // Settings
    updateSettings({
      name: "Clínica Magia Da Linguagem",
      doctorName: "Dra. Ana Paula",
      doctors: ["Dra. Ana Paula", "Dr. Carlos"],
      phone: "(11) 99999-1234",
      email: "contato@magiadaLinguagem.com",
      address: "Taguatinga Shopping, Sala 204 - Brasília/DF",
    });

    // Patients
    const p1Id = addPatient({
      name: "Maria Silva",
      cpf: "529.982.247-25",
      phone: "(11) 98765-4321",
      email: "maria@email.com",
      birthDate: "1990-04-15",
      address: "Rua das Flores, 100 - São Paulo",
      notes: "Paciente desde 2023",
    });

    const p2Id = addPatient({
      name: "João Santos",
      cpf: "276.448.730-68",
      phone: "(11) 91234-5678",
      email: "joao@email.com",
      birthDate: "1985-04-20",
      address: "Av. Brasil, 500 - São Paulo",
      notes: "Alergia a dipirona",
    });

    const p3Id = addPatient({
      name: "Ana Costa",
      cpf: "839.435.452-10",
      phone: "(11) 94567-8901",
      email: "ana@email.com",
      birthDate: "1995-07-10",
      address: "Rua Augusta, 200 - São Paulo",
      notes: "",
    });

    // Appointments - future dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const fmt = (d: Date) => d.toISOString().split("T")[0];

    addAppointment({
      patientId: p1Id, doctorName: "Dra. Ana Paula", date: fmt(tomorrow), time: "09:00",
      dayOfWeek: "segunda-feira", frequency: "semanal", status: "agendado", notes: "", sessionValue: 200,
    });
    addAppointment({
      patientId: p1Id, doctorName: "Dra. Ana Paula", date: fmt(nextWeek), time: "09:00",
      dayOfWeek: "segunda-feira", frequency: "semanal", status: "agendado", notes: "", sessionValue: 200,
    });
    addAppointment({
      patientId: p2Id, doctorName: "Dr. Carlos", date: fmt(tomorrow), time: "10:00",
      dayOfWeek: "terça-feira", frequency: "unica", status: "agendado", notes: "", sessionValue: 250,
    });
    addAppointment({
      patientId: p3Id, doctorName: "Dra. Ana Paula", date: fmt(tomorrow), time: "14:00",
      dayOfWeek: "quarta-feira", frequency: "mensal", status: "agendado", notes: "", sessionValue: 180,
    });

    // Past appointments
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 3);
    addAppointment({
      patientId: p1Id, doctorName: "Dra. Ana Paula", date: fmt(pastDate), time: "09:00",
      dayOfWeek: "sexta-feira", frequency: "semanal", status: "concluido", notes: "", sessionValue: 200,
    });

    // Payments
    addPayment({
      patientId: p1Id, amount: 200, method: "pix", status: "pago",
      date: new Date().toISOString(), description: "Sessão 15/03",
    });
    addPayment({
      patientId: p1Id, amount: 200, method: "pix", status: "pendente",
      date: new Date().toISOString(), description: "Sessão próxima",
    });
    addPayment({
      patientId: p2Id, amount: 250, method: "cartao", status: "pendente",
      date: new Date().toISOString(), description: "Consulta inicial",
    });

    // Activities
    addActivity({
      patientId: p1Id, doctorName: "Dra. Ana Paula", title: "Exercício de respiração diafragmática",
      description: "Pratique o exercício de respiração 4-7-8 por 5 minutos, 3 vezes ao dia.\n\n1. Inspire pelo nariz por 4 segundos\n2. Segure por 7 segundos\n3. Expire pela boca por 8 segundos",
      type: "texto", date: new Date().toISOString(), completed: false,
    });
    addActivity({
      patientId: p1Id, doctorName: "Dra. Ana Paula", title: "Assistir vídeo sobre mindfulness",
      description: "Assista o vídeo abaixo e anote suas reflexões para discutirmos na próxima sessão.",
      type: "link", linkUrl: "https://www.youtube.com/watch?v=example",
      date: new Date().toISOString(), completed: false,
    });
    addActivity({
      patientId: p1Id, doctorName: "Dr. Carlos", title: "Diário de humor semanal",
      description: "Registre todos os dias como se sentiu pela manhã, tarde e noite. Use a escala de 1 a 10.",
      type: "texto", date: new Date(Date.now() - 86400000 * 2).toISOString(), completed: true,
    });
    addActivity({
      patientId: p2Id, doctorName: "Dr. Carlos", title: "Leitura recomendada",
      description: "Leia o capítulo 3 do livro 'O Poder do Agora' de Eckhart Tolle.",
      type: "texto", date: new Date().toISOString(), completed: false,
    });

    // Patient accounts (for portal login)
    registerPatient({
      patientId: p1Id, name: "Maria Silva", email: "maria@email.com",
      phone: "(11) 98765-4321", cpf: "529.982.247-25", birthDate: "1990-04-15",
      password: "123456", avatar: "",
    });
    registerPatient({
      patientId: p2Id, name: "João Santos", email: "joao@email.com",
      phone: "(11) 91234-5678", cpf: "276.448.730-68", birthDate: "1985-04-20",
      password: "123456", avatar: "",
    });

    // Atestados de teste
    const pastDate2 = new Date(today);
    pastDate2.setDate(today.getDate() - 5);
    const pastDate3 = new Date(today);
    pastDate3.setDate(today.getDate() - 1);

    addAtestado({
      patientId: p1Id,
      patientName: "Maria Silva",
      appointmentId: "test-1",
      appointmentDate: fmt(pastDate2),
      appointmentTime: "09:00",
      reason: "Consulta médica de emergência - precisei ir ao pronto-socorro por causa de uma crise de enxaqueca forte.",
      sentAt: new Date(pastDate2.getTime() + 3600000 * 2).toISOString(),
    });

    addAtestado({
      patientId: p2Id,
      patientName: "João Santos",
      appointmentId: "test-2",
      appointmentDate: fmt(pastDate3),
      appointmentTime: "10:00",
      reason: "Atestado médico - gripe com febre alta, repouso de 3 dias recomendado pelo médico.",
      fileName: "atestado_joao_gripe.pdf",
      sentAt: new Date(pastDate3.getTime() + 3600000).toISOString(),
    });

    addAtestado({
      patientId: p3Id,
      patientName: "Ana Costa",
      appointmentId: "test-3",
      appointmentDate: fmt(today),
      appointmentTime: "14:00",
      reason: "Problema pessoal - falecimento de familiar próximo, não conseguirei comparecer.",
      sentAt: new Date().toISOString(),
    });

    // Notifications de teste
    addNotification({
      type: "cancelamento",
      patientId: p1Id,
      patientName: "Maria Silva",
      appointmentId: "test-1",
      message: `Maria Silva cancelou a consulta de ${fmt(pastDate2)} às 09:00. Motivo: Consulta médica de emergência.`,
      date: new Date(pastDate2.getTime() + 3600000 * 2).toISOString(),
      read: false,
    });
    addNotification({
      type: "atestado",
      patientId: p2Id,
      patientName: "João Santos",
      appointmentId: "test-2",
      message: `João Santos enviou um atestado para a consulta de ${fmt(pastDate3)} às 10:00.`,
      date: new Date(pastDate3.getTime() + 3600000).toISOString(),
      read: false,
    });
    addNotification({
      type: "confirmacao",
      patientId: p3Id,
      patientName: "Ana Costa",
      appointmentId: "test-3",
      message: `Ana Costa confirmou presença na consulta de ${fmt(tomorrow)} às 14:00.`,
      date: new Date().toISOString(),
      read: false,
    });

    // Teleconsulta room
    createRoom({
      patientId: p1Id, doctorName: "Dra. Ana Paula", status: "aguardando",
    });

    // Seed doctors into admin store (for chat and management)
    if (doctors.length === 0) {
      addDoctor({
        name: "Ana Paula",
        specialty: "Fonoaudiologia",
        crp: "CRP 01/12345",
        phone: "(11) 99999-0001",
        email: "anapaula@clinica.com",
        status: "ativo",
        loginUsername: "ana.paula",
      });
      addDoctor({
        name: "Carlos Silva",
        specialty: "Psicologia",
        crp: "CRP 01/67890",
        phone: "(11) 99999-0002",
        email: "carlos@clinica.com",
        status: "ativo",
        loginUsername: "carlos.silva",
      });
      // Create login accounts for doctors
      addUser("ana.paula", "123456", "doctor");
      addUser("carlos.silva", "123456", "doctor");
    }

    setSeeded(true);
    toast.success("Dados de teste criados com sucesso! Use maria@email.com / 123456 para o portal do paciente.");
  };

  if (seeded || patients.length > 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] bg-card border border-border rounded-xl shadow-lg p-4 max-w-sm">
      <p className="text-sm font-medium text-foreground mb-2">🧪 Carregar dados de teste?</p>
      <p className="text-xs text-muted-foreground mb-3">Isso criará pacientes, consultas, pagamentos e atividades de exemplo.</p>
      <Button size="sm" onClick={handleSeed} className="w-full">Carregar Dados de Teste</Button>
    </div>
  );
}
