import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LiveSession {
  id: string;
  doctorName: string;
  doctorId: string;
  title: string;
  description: string;
  status: "ao_vivo" | "agendada" | "encerrada";
  audience: "todos_pacientes" | "todos_doutores" | "doutores_especificos";
  specificDoctorIds?: string[];
  startedAt?: string;
  endedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  chatMessages: LiveChatMessage[];
  viewers: LiveViewer[];
  joinRequests: LiveJoinRequest[];
  emojiReactions: LiveEmojiReaction[];
}

export interface LiveChatMessage {
  id: string;
  liveId: string;
  senderName: string;
  senderRole: "doctor" | "patient";
  message: string;
  timestamp: string;
  type?: "message" | "system"; // system = join/leave msgs
}

export interface LiveViewer {
  id: string;
  name: string;
  role: "doctor" | "patient";
  joinedAt: string;
}

export interface LiveJoinRequest {
  id: string;
  name: string;
  role: "doctor" | "patient";
  status: "pending" | "accepted" | "rejected";
  requestedAt: string;
}

export interface LiveEmojiReaction {
  id: string;
  emoji: string;
  senderName: string;
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
  targetIds?: string[];
}

interface LiveStore {
  sessions: LiveSession[];
  notifications: LiveNotification[];

  createSession: (s: Omit<LiveSession, "id" | "createdAt" | "chatMessages" | "viewers" | "joinRequests" | "emojiReactions">) => string;
  updateSession: (id: string, updates: Partial<LiveSession>) => void;
  startLive: (id: string) => void;
  endLive: (id: string) => void;
  deleteSession: (id: string) => void;

  addChatMessage: (liveId: string, msg: Omit<LiveChatMessage, "id" | "timestamp">) => void;

  // Viewers
  addViewer: (liveId: string, viewer: Omit<LiveViewer, "id" | "joinedAt">) => void;
  removeViewer: (liveId: string, viewerName: string) => void;

  // Join requests
  requestToJoin: (liveId: string, req: { name: string; role: "doctor" | "patient" }) => void;
  respondJoinRequest: (liveId: string, requestId: string, accepted: boolean) => void;

  // Emoji
  addEmojiReaction: (liveId: string, emoji: string, senderName: string) => void;

  // Notifications
  addNotification: (n: Omit<LiveNotification, "id">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (targetType: "patients" | "doctors") => void;

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
          sessions: [...state.sessions, { ...s, id, createdAt: new Date().toISOString(), chatMessages: [], viewers: [], joinRequests: [], emojiReactions: [] }],
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
        if (session.audience === "todos_pacientes") {
          get().addNotification({
            liveId: id, type: "live_started",
            message: `🔴 ${session.doctorName} está AO VIVO: "${session.title}"`,
            doctorName: session.doctorName, date: new Date().toISOString(),
            read: false, targetType: "patients",
          });
        }
        if (session.audience === "todos_doutores" || session.audience === "doutores_especificos") {
          get().addNotification({
            liveId: id, type: "live_started",
            message: `🔴 ${session.doctorName} está AO VIVO: "${session.title}"`,
            doctorName: session.doctorName, date: new Date().toISOString(),
            read: false, targetType: "doctors",
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

      addViewer: (liveId, viewer) =>
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== liveId) return s;
            if (s.viewers.some((v) => v.name === viewer.name)) return s;
            const newViewer = { ...viewer, id: uid(), joinedAt: new Date().toISOString() };
            const systemMsg: LiveChatMessage = {
              id: uid(), liveId, senderName: "Sistema", senderRole: "doctor",
              message: `${viewer.name} entrou na live`, timestamp: new Date().toISOString(), type: "system",
            };
            return { ...s, viewers: [...s.viewers, newViewer], chatMessages: [...s.chatMessages, systemMsg] };
          }),
        })),

      removeViewer: (liveId, viewerName) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === liveId ? { ...s, viewers: s.viewers.filter((v) => v.name !== viewerName) } : s
          ),
        })),

      requestToJoin: (liveId, req) =>
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== liveId) return s;
            if (s.joinRequests.some((r) => r.name === req.name && r.status === "pending")) return s;
            return { ...s, joinRequests: [...s.joinRequests, { ...req, id: uid(), status: "pending", requestedAt: new Date().toISOString() }] };
          }),
        })),

      respondJoinRequest: (liveId, requestId, accepted) =>
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== liveId) return s;
            const updatedRequests = s.joinRequests.map((r) =>
              r.id === requestId ? { ...r, status: (accepted ? "accepted" : "rejected") as "accepted" | "rejected" } : r
            );
            let updatedMessages = s.chatMessages;
            if (accepted) {
              const req = s.joinRequests.find((r) => r.id === requestId);
              if (req) {
                updatedMessages = [...s.chatMessages, {
                  id: uid(), liveId, senderName: "Sistema", senderRole: "doctor" as const,
                  message: `${req.name} foi aceito(a) na live!`, timestamp: new Date().toISOString(), type: "system" as const,
                }];
              }
            }
            return { ...s, joinRequests: updatedRequests, chatMessages: updatedMessages };
          }),
        })),

      addEmojiReaction: (liveId, emoji, senderName) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === liveId
              ? { ...s, emojiReactions: [...s.emojiReactions, { id: uid(), emoji, senderName, timestamp: new Date().toISOString() }] }
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
