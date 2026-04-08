import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Patient {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  birthDate: string;
  address: string;
  notes: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorName: string;
  date: string;
  time: string;
  dayOfWeek: string;
  frequency: "semanal" | "mensal" | "anual" | "unica";
  status: "agendado" | "concluido" | "cancelado" | "faltou";
  notes: string;
  sessionValue?: number;
}

export interface Payment {
  id: string;
  patientId: string;
  appointmentId?: string;
  amount: number;
  method: "pix" | "cartao" | "dinheiro";
  status: "pago" | "pendente";
  date: string;
  description: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  type: "prontuario" | "evolucao" | "anamnese";
  content: string;
  doctorName: string;
  date: string;
}

export interface ClinicNotification {
  id: string;
  type: "confirmacao" | "cancelamento" | "atestado";
  patientId: string;
  patientName: string;
  appointmentId: string;
  message: string;
  date: string;
  read: boolean;
}

export interface Atestado {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  fileData?: string;
  fileName?: string;
  sentAt: string;
}

export interface PatientActivity {
  id: string;
  patientId: string;
  doctorName: string;
  title: string;
  description: string;
  type: "texto" | "anexo" | "foto" | "link";
  fileData?: string;
  fileName?: string;
  linkUrl?: string;
  date: string;
  completed: boolean;
}

export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  date: string;
  read: boolean;
  fileUrl?: string;
  fileName?: string;
  imageUrl?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  from: string;
  date: string;
  fileUrl?: string;
  fileName?: string;
  targetDoctors: string[]; // empty = todos
}

export interface PatientAnnouncement {
  id: string;
  title: string;
  content: string; // rich HTML content
  from: string;
  date: string;
  fileUrl?: string;
  fileName?: string;
  imageUrl?: string;
  imageName?: string;
  readBy: string[]; // patient account IDs who read it
}

export interface ClinicSettings {
  name: string;
  logo: string;
  phone: string;
  email: string;
  address: string;
  cnpj: string;
  crp: string;
  doctorName: string;
  doctors: string[];
}

interface ClinicStore {
  patients: Patient[];
  appointments: Appointment[];
  payments: Payment[];
  records: MedicalRecord[];
  messages: Message[];
  announcements: Announcement[];
  notifications: ClinicNotification[];
  atestados: Atestado[];
  activities: PatientActivity[];
  patientAnnouncements: PatientAnnouncement[];
  settings: ClinicSettings;

  addPatient: (p: Omit<Patient, "id" | "createdAt">) => string;
  updatePatient: (id: string, p: Partial<Patient>) => void;
  deletePatient: (id: string) => void;

  addAppointment: (a: Omit<Appointment, "id">) => string;
  updateAppointment: (id: string, a: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;

  addPayment: (p: Omit<Payment, "id">) => string;
  updatePayment: (id: string, p: Partial<Payment>) => void;

  addRecord: (r: Omit<MedicalRecord, "id">) => string;
  updateRecord: (id: string, r: Partial<MedicalRecord>) => void;
  deleteRecord: (id: string) => void;

  addMessage: (m: Omit<Message, "id">) => string;
  markMessageRead: (id: string) => void;
  addAnnouncement: (a: Omit<Announcement, "id">) => string;
  deleteAnnouncement: (id: string) => void;

  addNotification: (n: Omit<ClinicNotification, "id">) => string;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  addAtestado: (a: Omit<Atestado, "id">) => string;

  addActivity: (a: Omit<PatientActivity, "id">) => string;
  updateActivity: (id: string, a: Partial<PatientActivity>) => void;
  deleteActivity: (id: string) => void;

  addPatientAnnouncement: (a: Omit<PatientAnnouncement, "id" | "readBy">) => string;
  updatePatientAnnouncement: (id: string, a: Partial<PatientAnnouncement>) => void;
  deletePatientAnnouncement: (id: string) => void;
  markPatientAnnouncementRead: (id: string, patientAccountId: string) => void;

  updateSettings: (s: Partial<ClinicSettings>) => void;
  unreadCount: () => number;
  unreadNotificationCount: () => number;
  getBirthdaysThisMonth: () => (Patient & { age: number })[];
}

const uid = () => crypto.randomUUID();

export const useClinicStore = create<ClinicStore>()(
  persist(
    (set, get) => ({
      patients: [],
      appointments: [],
      payments: [],
      records: [],
      messages: [],
      announcements: [],
      notifications: [],
      atestados: [],
      activities: [],
      patientAnnouncements: [],
      settings: {
        name: "Clínica Magia Da Linguagem",
        logo: "",
        phone: "(00) 00000-0000",
        email: "contato@clinica.com",
        address: "Rua Exemplo, 123",
        cnpj: "",
        crp: "",
        doctorName: "Dra. Nome",
        doctors: ["Dra. Nome"],
      },

      addPatient: (p) => {
        const id = uid();
        set((s) => ({ patients: [...s.patients, { ...p, id, createdAt: new Date().toISOString() }] }));
        return id;
      },
      updatePatient: (id, p) =>
        set((s) => ({ patients: s.patients.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
      deletePatient: (id) =>
        set((s) => ({
          patients: s.patients.filter((x) => x.id !== id),
          appointments: s.appointments.filter((x) => x.patientId !== id),
          payments: s.payments.filter((x) => x.patientId !== id),
          records: s.records.filter((x) => x.patientId !== id),
        })),

      addAppointment: (a) => {
        const id = uid();
        set((s) => ({ appointments: [...s.appointments, { ...a, id }] }));
        return id;
      },
      updateAppointment: (id, a) =>
        set((s) => ({ appointments: s.appointments.map((x) => (x.id === id ? { ...x, ...a } : x)) })),
      deleteAppointment: (id) =>
        set((s) => ({ appointments: s.appointments.filter((x) => x.id !== id) })),

      addPayment: (p) => {
        const id = uid();
        set((s) => ({ payments: [...s.payments, { ...p, id }] }));
        return id;
      },
      updatePayment: (id, p) =>
        set((s) => ({ payments: s.payments.map((x) => (x.id === id ? { ...x, ...p } : x)) })),

      addRecord: (r) => {
        const id = uid();
        set((s) => ({ records: [...s.records, { ...r, id }] }));
        return id;
      },
      updateRecord: (id, r) =>
        set((s) => ({ records: s.records.map((x) => (x.id === id ? { ...x, ...r } : x)) })),
      deleteRecord: (id) =>
        set((s) => ({ records: s.records.filter((x) => x.id !== id) })),

      addMessage: (m) => {
        const id = uid();
        set((s) => ({ messages: [...s.messages, { ...m, id }] }));
        return id;
      },
      markMessageRead: (id) =>
        set((s) => ({ messages: s.messages.map((x) => (x.id === id ? { ...x, read: true } : x)) })),

      addAnnouncement: (a) => {
        const id = uid();
        set((s) => ({ announcements: [...s.announcements, { ...a, id }] }));
        return id;
      },
      deleteAnnouncement: (id) =>
        set((s) => ({ announcements: s.announcements.filter((x) => x.id !== id) })),

      addNotification: (n) => {
        const id = uid();
        set((s) => ({ notifications: [...s.notifications, { ...n, id }] }));
        return id;
      },
      markNotificationRead: (id) =>
        set((s) => ({ notifications: s.notifications.map((x) => (x.id === id ? { ...x, read: true } : x)) })),
      markAllNotificationsRead: () =>
        set((s) => ({ notifications: s.notifications.map((x) => ({ ...x, read: true })) })),

      addAtestado: (a) => {
        const id = uid();
        set((s) => ({ atestados: [...s.atestados, { ...a, id }] }));
        return id;
      },

      addActivity: (a) => {
        const id = uid();
        set((s) => ({ activities: [...s.activities, { ...a, id }] }));
        return id;
      },
      updateActivity: (id, a) =>
        set((s) => ({ activities: s.activities.map((x) => (x.id === id ? { ...x, ...a } : x)) })),
      deleteActivity: (id) =>
        set((s) => ({ activities: s.activities.filter((x) => x.id !== id) })),

      addPatientAnnouncement: (a) => {
        const id = uid();
        set((s) => ({ patientAnnouncements: [...s.patientAnnouncements, { ...a, id, readBy: [] }] }));
        return id;
      },
      updatePatientAnnouncement: (id, a) =>
        set((s) => ({ patientAnnouncements: s.patientAnnouncements.map((x) => (x.id === id ? { ...x, ...a } : x)) })),
      deletePatientAnnouncement: (id) =>
        set((s) => ({ patientAnnouncements: s.patientAnnouncements.filter((x) => x.id !== id) })),
      markPatientAnnouncementRead: (id, patientAccountId) =>
        set((s) => ({
          patientAnnouncements: s.patientAnnouncements.map((x) =>
            x.id === id && !x.readBy.includes(patientAccountId)
              ? { ...x, readBy: [...x.readBy, patientAccountId] }
              : x
          ),
        })),

      updateSettings: (s) =>
        set((state) => {
          const normalizedClinicName = s.name
            ?.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();

          return {
            settings: {
              ...state.settings,
              ...s,
              ...(normalizedClinicName === "clinica bem estar" || normalizedClinicName === "minha clinica"
                ? { name: "Clínica Magia Da Linguagem" }
                : {}),
            },
          };
        }),

      unreadCount: () => get().messages.filter((m) => !m.read && m.to === "admin").length,
      unreadNotificationCount: () => get().notifications.filter((n) => !n.read).length,

      getBirthdaysThisMonth: () => {
        const now = new Date();
        const month = now.getMonth();
        return get()
          .patients.filter((p) => {
            if (!p.birthDate) return false;
            const d = new Date(p.birthDate + "T00:00:00");
            return d.getMonth() === month;
          })
          .map((p) => {
            const birth = new Date(p.birthDate + "T00:00:00");
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
            return { ...p, age: age + 1 };
          })
          .sort((a, b) => new Date(a.birthDate + "T00:00:00").getDate() - new Date(b.birthDate + "T00:00:00").getDate());
      },
    }),
    {
      name: "clinic-storage",
      onRehydrateStorage: () => (state) => {
        const normalizedClinicName = state?.settings?.name
          ?.normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();

        if (normalizedClinicName === "clinica bem estar" || normalizedClinicName === "minha clinica") {
          state?.updateSettings({ name: "Clínica Magia Da Linguagem" });
        }
      },
    }
  )
);
