import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  crp: string;
  phone: string;
  email: string;
  status: "ativo" | "inativo";
  createdAt: string;
  loginUsername: string;
}

export interface PendingRegistration {
  id: string;
  patientAccountId: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate: string;
  requestedAt: string;
  status: "pendente" | "aprovado" | "rejeitado";
  reviewedAt?: string;
  reviewNote?: string;
}

export interface AdminLog {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  date: string;
}

interface AdminStore {
  doctors: DoctorProfile[];
  pendingRegistrations: PendingRegistration[];
  logs: AdminLog[];

  addDoctor: (d: Omit<DoctorProfile, "id" | "createdAt">) => string;
  updateDoctor: (id: string, d: Partial<DoctorProfile>) => void;
  deleteDoctor: (id: string) => void;

  addPendingRegistration: (p: Omit<PendingRegistration, "id" | "requestedAt" | "status">) => string;
  approveRegistration: (id: string, note?: string) => void;
  rejectRegistration: (id: string, note?: string) => void;

  addLog: (l: Omit<AdminLog, "id" | "date">) => void;
}

const uid = () => crypto.randomUUID();

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      doctors: [],
      pendingRegistrations: [],
      logs: [],

      addDoctor: (d) => {
        const id = uid();
        set((s) => ({
          doctors: [...s.doctors, { ...d, id, createdAt: new Date().toISOString() }],
        }));
        return id;
      },
      updateDoctor: (id, d) =>
        set((s) => ({ doctors: s.doctors.map((x) => (x.id === id ? { ...x, ...d } : x)) })),
      deleteDoctor: (id) =>
        set((s) => ({ doctors: s.doctors.filter((x) => x.id !== id) })),

      addPendingRegistration: (p) => {
        const id = uid();
        set((s) => ({
          pendingRegistrations: [
            ...s.pendingRegistrations,
            { ...p, id, requestedAt: new Date().toISOString(), status: "pendente" as const },
          ],
        }));
        return id;
      },
      approveRegistration: (id, note) =>
        set((s) => ({
          pendingRegistrations: s.pendingRegistrations.map((x) =>
            x.id === id ? { ...x, status: "aprovado" as const, reviewedAt: new Date().toISOString(), reviewNote: note } : x
          ),
        })),
      rejectRegistration: (id, note) =>
        set((s) => ({
          pendingRegistrations: s.pendingRegistrations.map((x) =>
            x.id === id ? { ...x, status: "rejeitado" as const, reviewedAt: new Date().toISOString(), reviewNote: note } : x
          ),
        })),

      addLog: (l) =>
        set((s) => ({
          logs: [...s.logs, { ...l, id: uid(), date: new Date().toISOString() }],
        })),
    }),
    { name: "admin-storage" }
  )
);
