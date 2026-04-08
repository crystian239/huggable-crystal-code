import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChatPresence {
  userId: string;
  userName: string;
  isOnline: boolean;
  lastSeen: string;
  isTyping: boolean;
  context: "admin" | "doctor" | "patient" | "support";
}

interface ChatPresenceStore {
  presences: ChatPresence[];

  setOnline: (userId: string, userName: string, context: ChatPresence["context"]) => void;
  setOffline: (userId: string) => void;
  setTyping: (userId: string, isTyping: boolean) => void;
  getPresence: (userId: string) => ChatPresence | undefined;
  isUserOnline: (userId: string) => boolean;
  getLastSeen: (userId: string) => string | undefined;
}

export const useChatPresenceStore = create<ChatPresenceStore>()(
  persist(
    (set, get) => ({
      presences: [],

      setOnline: (userId, userName, context) =>
        set((s) => {
          const idx = s.presences.findIndex((p) => p.userId === userId);
          const now = new Date().toISOString();
          if (idx >= 0) {
            const updated = [...s.presences];
            updated[idx] = { ...updated[idx], isOnline: true, lastSeen: now, userName, context };
            return { presences: updated };
          }
          return {
            presences: [...s.presences, { userId, userName, isOnline: true, lastSeen: now, isTyping: false, context }],
          };
        }),

      setOffline: (userId) =>
        set((s) => ({
          presences: s.presences.map((p) =>
            p.userId === userId ? { ...p, isOnline: false, lastSeen: new Date().toISOString(), isTyping: false } : p
          ),
        })),

      setTyping: (userId, isTyping) =>
        set((s) => ({
          presences: s.presences.map((p) => (p.userId === userId ? { ...p, isTyping } : p)),
        })),

      getPresence: (userId) => get().presences.find((p) => p.userId === userId),
      isUserOnline: (userId) => get().presences.find((p) => p.userId === userId)?.isOnline || false,
      getLastSeen: (userId) => get().presences.find((p) => p.userId === userId)?.lastSeen,
    }),
    { name: "chat-presence-storage" }
  )
);
