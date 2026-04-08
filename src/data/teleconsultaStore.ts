import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface VideoRoom {
  id: string;
  roomName: string;
  patientId: string;
  doctorName: string;
  status: "aguardando" | "em_andamento" | "finalizada";
  createdAt: string;
  scheduledAt?: string;
  link: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  sender: string;
  senderRole: "doctor" | "patient";
  content: string;
  type: "text" | "file" | "image";
  fileName?: string;
  fileUrl?: string;
  timestamp: string;
}

export interface PatientAccount {
  id: string;
  patientId: string; // links to clinic patient
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  password: string;
  avatar: string;
  createdAt: string;
}

export interface PatientMessage {
  id: string;
  patientAccountId: string;
  patientId: string;
  doctorName: string;
  sender: "patient" | "doctor";
  content: string;
  date: string;
  read: boolean;
  type?: "text" | "image" | "file";
  fileUrl?: string;
  fileName?: string;
  imageUrl?: string;
}

export interface ActiveCall {
  id: string;
  roomId: string;
  patientId: string;
  doctorName: string;
  doctorSpecialty?: string;
  startedAt: string;
  status: "ringing" | "answered" | "ended" | "declined";
}

interface TeleconsultaStore {
  rooms: VideoRoom[];
  chatMessages: ChatMessage[];
  patientAccounts: PatientAccount[];
  patientMessages: PatientMessage[];
  activeCall: ActiveCall | null;

  createRoom: (r: Omit<VideoRoom, "id" | "createdAt" | "link" | "roomName">) => VideoRoom;
  updateRoom: (id: string, r: Partial<VideoRoom>) => void;
  deleteRoom: (id: string) => void;

  addChatMessage: (m: Omit<ChatMessage, "id" | "timestamp">) => string;

  registerPatient: (p: Omit<PatientAccount, "id" | "createdAt">) => string;
  getPatientByEmail: (email: string) => PatientAccount | undefined;
  getPatientByCpf: (cpf: string) => PatientAccount | undefined;
  updatePatientAccount: (id: string, p: Partial<PatientAccount>) => void;
  removePatientAccount: (id: string) => void;

  addPatientMessage: (m: Omit<PatientMessage, "id">) => string;
  markPatientMessageRead: (id: string) => void;

  startCall: (roomId: string, doctorName: string, patientId: string, doctorSpecialty?: string) => void;
  answerCall: () => void;
  declineCall: () => void;
  endCall: () => void;
}

const uid = () => crypto.randomUUID();

export const useTeleconsultaStore = create<TeleconsultaStore>()(
  persist(
    (set, get) => ({
      rooms: [],
      chatMessages: [],
      patientAccounts: [],
      patientMessages: [],
      activeCall: null,

      createRoom: (r) => {
        const id = uid();
        const roomName = `sala-${id.slice(0, 8)}`;
        const link = `${window.location.origin}/teleconsulta/sala/${roomName}`;
        const room: VideoRoom = { ...r, id, roomName, link, createdAt: new Date().toISOString() };
        set((s) => ({ rooms: [...s.rooms, room] }));
        return room;
      },
      updateRoom: (id, r) =>
        set((s) => ({ rooms: s.rooms.map((x) => (x.id === id ? { ...x, ...r } : x)) })),
      deleteRoom: (id) =>
        set((s) => ({
          rooms: s.rooms.filter((x) => x.id !== id),
          chatMessages: s.chatMessages.filter((m) => m.roomId !== id),
        })),

      addChatMessage: (m) => {
        const id = uid();
        set((s) => ({ chatMessages: [...s.chatMessages, { ...m, id, timestamp: new Date().toISOString() }] }));
        return id;
      },

      registerPatient: (p) => {
        const id = uid();
        set((s) => ({ patientAccounts: [...s.patientAccounts, { ...p, id, createdAt: new Date().toISOString() }] }));
        return id;
      },
      getPatientByEmail: (email) => get().patientAccounts.find((p) => p.email === email),
      getPatientByCpf: (cpf) => {
        const clean = cpf.replace(/\D/g, "");
        return get().patientAccounts.find((p) => p.cpf.replace(/\D/g, "") === clean);
      },
      updatePatientAccount: (id, p) =>
        set((s) => ({ patientAccounts: s.patientAccounts.map((x) => (x.id === id ? { ...x, ...p } : x)) })),

      addPatientMessage: (m) => {
        const id = uid();
        set((s) => ({ patientMessages: [...s.patientMessages, { ...m, id }] }));
        return id;
      },
      markPatientMessageRead: (id) =>
        set((s) => ({ patientMessages: s.patientMessages.map((x) => (x.id === id ? { ...x, read: true } : x)) })),

      startCall: (roomId, doctorName, patientId, doctorSpecialty) => {
        const call: ActiveCall = {
          id: uid(),
          roomId,
          patientId,
          doctorName,
          doctorSpecialty,
          startedAt: new Date().toISOString(),
          status: "ringing",
        };
        set({ activeCall: call });
        // Auto-update room status
        set((s) => ({ rooms: s.rooms.map((r) => r.id === roomId ? { ...r, status: "em_andamento" as const } : r) }));
      },
      answerCall: () => set((s) => ({ activeCall: s.activeCall ? { ...s.activeCall, status: "answered" as const } : null })),
      declineCall: () => set((s) => ({ activeCall: s.activeCall ? { ...s.activeCall, status: "declined" as const } : null })),
      endCall: () => set({ activeCall: null }),
    }),
    { name: "teleconsulta-storage" }
  )
);
