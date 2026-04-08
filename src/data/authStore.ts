import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthUser {
  id: string;
  username: string;
  cpf?: string;
  role: "admin" | "doctor" | "receptionist";
}

interface AuthStore {
  user: AuthUser | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  users: Array<{ id: string; username: string; cpf?: string; passwordHash: string; role: "admin" | "doctor" | "receptionist" }>;
  login: (identifier: string, password: string) => boolean;
  logout: () => void;
  changePassword: (username: string, oldPassword: string, newPassword: string) => boolean;
  resetPassword: (identifier: string, newPassword: string) => boolean;
  findUserByIdentifier: (identifier: string) => { id: string; username: string; cpf?: string; role: string } | null;
  addUser: (username: string, password: string, role: "admin" | "doctor" | "receptionist", cpf?: string) => boolean;
}

function hashPasswordSync(password: string): string {
  let hash = 0;
  const str = password + "ezmax-salt-2026";
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(36) + str.length.toString(36);
}

const ADMIN_CPF = "147.344.727-50";
const DEFAULT_ADMIN_HASH = hashPasswordSync("admin123");

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      sessionToken: null,
      isAuthenticated: false,
      users: [
        { id: "1", username: "Crystian", cpf: ADMIN_CPF, passwordHash: DEFAULT_ADMIN_HASH, role: "admin" as const },
      ],

      login: (identifier: string, password: string) => {
        const users = get().users;
        const hash = hashPasswordSync(password);
        // Match by username OR CPF
        const normalizedId = identifier.toLowerCase().trim();
        const found = users.find(
          (u) =>
            (u.username.toLowerCase() === normalizedId ||
             (u.cpf && u.cpf.replace(/\D/g, "") === normalizedId.replace(/\D/g, ""))) &&
            u.passwordHash === hash
        );
        if (found) {
          const token = crypto.randomUUID();
          set({
            user: { id: found.id, username: found.username, cpf: found.cpf, role: found.role },
            sessionToken: token,
            isAuthenticated: true,
          });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ user: null, sessionToken: null, isAuthenticated: false });
      },

      changePassword: (username: string, oldPassword: string, newPassword: string) => {
        const users = get().users;
        const oldHash = hashPasswordSync(oldPassword);
        const idx = users.findIndex(
          (u) => u.username.toLowerCase() === username.toLowerCase() && u.passwordHash === oldHash
        );
        if (idx === -1) return false;
        const newHash = hashPasswordSync(newPassword);
        const updated = [...users];
        updated[idx] = { ...updated[idx], passwordHash: newHash };
        set({ users: updated });
        return true;
      },

      resetPassword: (identifier: string, newPassword: string) => {
        const users = get().users;
        const normalizedId = identifier.toLowerCase().trim();
        const idx = users.findIndex(
          (u) =>
            u.username.toLowerCase() === normalizedId ||
            (u.cpf && u.cpf.replace(/\D/g, "") === normalizedId.replace(/\D/g, ""))
        );
        if (idx === -1) return false;
        const newHash = hashPasswordSync(newPassword);
        const updated = [...users];
        updated[idx] = { ...updated[idx], passwordHash: newHash };
        set({ users: updated });
        return true;
      },

      findUserByIdentifier: (identifier: string) => {
        const users = get().users;
        const normalizedId = identifier.toLowerCase().trim();
        return users.find(
          (u) =>
            u.username.toLowerCase() === normalizedId ||
            (u.cpf && u.cpf.replace(/\D/g, "") === normalizedId.replace(/\D/g, ""))
        ) || null;
      },

      addUser: (username: string, password: string, role: "admin" | "doctor" | "receptionist", cpf?: string) => {
        const users = get().users;
        if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) return false;
        const hash = hashPasswordSync(password);
        set({
          users: [...users, { id: crypto.randomUUID(), username, cpf, passwordHash: hash, role }],
        });
        return true;
      },
    }),
    {
      name: "clinic-auth-store",
      partialize: (state) => ({
        users: state.users,
        user: state.user,
        sessionToken: state.sessionToken,
        isAuthenticated: state.isAuthenticated,
      }),
      merge: (persistedState: any, currentState) => {
        const state = { ...currentState, ...(persistedState || {}) };
        // Ensure admin user always has CPF
        if (state.users) {
          state.users = state.users.map((u: any) => {
            if (u.username === "admin" && u.role === "admin" && !u.cpf) {
              return { ...u, cpf: ADMIN_CPF };
            }
            return u;
          });
        }
        return state;
      },
    }
  )
);

export const SUPER_ADMIN_CPF = ADMIN_CPF;
