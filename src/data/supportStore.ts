import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SupportTicket {
  id: string;
  patientAccountId: string;
  patientName: string;
  patientAvatar: string;
  status: "aberto" | "em_atendimento" | "fechado";
  assignedTo: string; // admin/doctor name
  assignedAvatar: string;
  createdAt: string;
  closedAt?: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  sender: "patient" | "support";
  senderName: string;
  senderAvatar: string;
  content: string;
  type: "text" | "image" | "file";
  fileName?: string;
  fileUrl?: string;
  timestamp: string;
}

export interface SupportPresence {
  odokId: string; // either ticketId or global
  userId: string;
  userName: string;
  isOnline: boolean;
  lastSeen: string;
  isTyping: boolean;
}

interface SupportStore {
  tickets: SupportTicket[];
  messages: SupportMessage[];
  presences: SupportPresence[];
  hiddenTicketIds: string[];

  createTicket: (t: Omit<SupportTicket, "id" | "createdAt" | "status" | "assignedTo" | "assignedAvatar">) => SupportTicket;
  assignTicket: (id: string, name: string, avatar: string) => void;
  closeTicket: (id: string) => void;
  reopenTicket: (id: string) => void;
  hideTicket: (id: string) => void;
  unhideTicket: (id: string) => void;

  addMessage: (m: Omit<SupportMessage, "id" | "timestamp">) => string;

  setPresence: (userId: string, userName: string, isOnline: boolean) => void;
  setTyping: (userId: string, isTyping: boolean) => void;
  getPresence: (userId: string) => SupportPresence | undefined;
}

const uid = () => crypto.randomUUID();

export const useSupportStore = create<SupportStore>()(
  persist(
    (set, get) => ({
      tickets: [],
      messages: [],
      presences: [],
      hiddenTicketIds: [],

      createTicket: (t) => {
        const id = uid();
        const ticket: SupportTicket = {
          ...t,
          id,
          status: "aberto",
          assignedTo: "",
          assignedAvatar: "",
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ tickets: [...s.tickets, ticket] }));
        return ticket;
      },

      assignTicket: (id, name, avatar) =>
        set((s) => ({
          tickets: s.tickets.map((t) =>
            t.id === id ? { ...t, status: "em_atendimento" as const, assignedTo: name, assignedAvatar: avatar } : t
          ),
        })),

      closeTicket: (id) =>
        set((s) => ({
          tickets: s.tickets.map((t) =>
            t.id === id ? { ...t, status: "fechado" as const, closedAt: new Date().toISOString() } : t
          ),
        })),

      reopenTicket: (id) =>
        set((s) => ({
          tickets: s.tickets.map((t) =>
            t.id === id ? { ...t, status: "em_atendimento" as const, closedAt: undefined } : t
          ),
          hiddenTicketIds: s.hiddenTicketIds.filter((hid) => hid !== id),
        })),

      hideTicket: (id) =>
        set((s) => ({
          hiddenTicketIds: [...s.hiddenTicketIds, id],
        })),

      unhideTicket: (id) =>
        set((s) => ({
          hiddenTicketIds: s.hiddenTicketIds.filter((hid) => hid !== id),
        })),

      addMessage: (m) => {
        const id = uid();
        set((s) => {
          // Auto-unhide ticket when patient sends a new message
          const newHidden = m.sender === "patient"
            ? s.hiddenTicketIds.filter((hid) => hid !== m.ticketId)
            : s.hiddenTicketIds;
          return {
            messages: [...s.messages, { ...m, id, timestamp: new Date().toISOString() }],
            hiddenTicketIds: newHidden,
          };
        });
        return id;
      },

      setPresence: (userId, userName, isOnline) =>
        set((s) => {
          const existing = s.presences.find((p) => p.userId === userId);
          if (existing) {
            return {
              presences: s.presences.map((p) =>
                p.userId === userId
                  ? { ...p, isOnline, lastSeen: new Date().toISOString(), userName }
                  : p
              ),
            };
          }
          return {
            presences: [
              ...s.presences,
              {
                odokId: "global",
                userId,
                userName,
                isOnline,
                lastSeen: new Date().toISOString(),
                isTyping: false,
              },
            ],
          };
        }),

      setTyping: (userId, isTyping) =>
        set((s) => ({
          presences: s.presences.map((p) =>
            p.userId === userId ? { ...p, isTyping } : p
          ),
        })),

      getPresence: (userId) => get().presences.find((p) => p.userId === userId),
    }),
    { name: "support-storage" }
  )
);
