import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LiveSession {
  id: string;
  doctorName: string;
  doctorId: string; // CPF of the doctor
  title: string;
  description: string;
  status: "ao_vivo" | "agendada" | "encerrada";
  audience: "todos_pacientes" | "todos_doutores" | "doutores_especificos";
  specificDoctorIds?: string[]; // CPFs of specific doctors
  startedAt?: string;
  endedAt?: string;
  scheduledAt?: string; // ISO datetime for scheduled lives
  createdAt: string;
  chatMessages: LiveChatMessage[];
}

export interface LiveChatMessage {
  id: string;
  liveId: string;
  senderName: string;
  senderRole: "doctor" | "patient";
  message: string;
  timestamp: string;
}

export interface LiveNotification {
  id: string;
  liveId: string;
  type: "live_started" | "live_scheduled" | "live_ended";
  message: string;
  doctorName: string;
  date: string;
  read: boolean;
  targetType: "patients" | "doctors";
  targetIds?: string[]; // specific doctor CPFs, or empty = all
}

interface LiveStore {
  sessions: LiveSession[];
  notifications: LiveNotification[];

  // Sessions
  createSession: (s: Omit<LiveSession, "id" | "createdAt" | "chatMessages">) => string;
  updateSession: (id: string, updates: Partial<LiveSession>) => void;
  startLive: (id: string) => void;
  endLive: (id: string) => void;
  deleteSession: (id: string) => void;

  // Chat
  addChatMessage: (liveId: string, msg: Omit<LiveChatMessage, "id" | "timestamp">) => void;

  // Notifications
  addNotification: (n: Omit<LiveNotification, "id">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (targetType: "patients" | "doctors") => void;

  // Queries
  getActiveLives: () => LiveSession[];
  getScheduledLives: () => LiveSession[];
}

const uid = () => crypto.randomUUID();

export const useLiveStore = create<LiveStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      notifications: [],

      createSession: (s) => {
        const id = uid();
        set((state) => ({
          sessions: [...state.sessions, { ...s, id, createdAt: new Date().toISOString(), chatMessages: [] }],
        }));
        return id;
      },

      updateSession: (id, updates) =>
        set((state) => ({
          sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),

      startLive: (id) => {
        const session = get().sessions.find((s) => s.id === id);
        if (!session) return;
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, status: "ao_vivo" as const, startedAt: new Date().toISOString() } : s
          ),
        }));
        // Notify patients
        if (session.audience === "todos_pacientes") {
          get().addNotification({
            liveId: id,
            type: "live_started",
            message: `🔴 ${session.doctorName} está AO VIVO: "${session.title}"`,
            doctorName: session.doctorName,
            date: new Date().toISOString(),
            read: false,
            targetType: "patients",
          });
        }
        // Notify doctors
        if (session.audience === "todos_doutores" || session.audience === "doutores_especificos") {
          get().addNotification({
            liveId: id,
            type: "live_started",
            message: `🔴 ${session.doctorName} está AO VIVO: "${session.title}"`,
            doctorName: session.doctorName,
            date: new Date().toISOString(),
            read: false,
            targetType: "doctors",
            targetIds: session.audience === "doutores_especificos" ? session.specificDoctorIds : undefined,
          });
        }
      },

      endLive: (id) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, status: "encerrada" as const, endedAt: new Date().toISOString() } : s
          ),
        })),

      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
          notifications: state.notifications.filter((n) => n.liveId !== id),
        })),

      addChatMessage: (liveId, msg) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === liveId
              ? { ...s, chatMessages: [...s.chatMessages, { ...msg, id: uid(), timestamp: new Date().toISOString() }] }
              : s
          ),
        })),

      addNotification: (n) =>
        set((state) => ({
          notifications: [...state.notifications, { ...n, id: uid() }],
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      markAllNotificationsRead: (targetType) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.targetType === targetType ? { ...n, read: true } : n
          ),
        })),

      getActiveLives: () => get().sessions.filter((s) => s.status === "ao_vivo"),
      getScheduledLives: () => get().sessions.filter((s) => s.status === "agendada"),
    }),
    { name: "live-storage" }
  )
);
