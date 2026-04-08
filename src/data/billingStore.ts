import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MonthlyCharge {
  id: string;
  patientId: string;
  month: string; // "2026-04"
  amount: number;
  description: string;
  dueDate: string; // "2026-04-10"
  status: "pendente" | "pago" | "atrasado";
  method?: "pix" | "cartao" | "dinheiro";
  paidAt?: string; // ISO datetime
  paidAmount?: number;
  createdAt: string;
  notifiedUpcoming?: boolean;
  notifiedOverdue?: boolean;
}

export interface BillingNotification {
  id: string;
  patientId: string;
  type: "cobranca_gerada" | "vencimento_proximo" | "pagamento_atrasado" | "pagamento_confirmado";
  message: string;
  chargeId: string;
  date: string;
  read: boolean;
  readByAdmin?: boolean;
}

export interface PatientBillingConfig {
  patientId: string;
  monthlyAmount: number;
  dueDay: number; // day of month (1-28)
  active: boolean;
}

export interface PatientInvoiceData {
  patientId: string;
  wantsInvoice: boolean;
  cpf: string;
  cep: string;
  address: string;
}

interface BillingStore {
  charges: MonthlyCharge[];
  billingNotifications: BillingNotification[];
  patientConfigs: PatientBillingConfig[];
  invoiceData: PatientInvoiceData[];
  lastAutoGenDate: string; // last date auto-gen ran

  // Config
  setPatientConfig: (config: PatientBillingConfig) => void;
  getPatientConfig: (patientId: string) => PatientBillingConfig | undefined;

  // Charges
  addCharge: (c: Omit<MonthlyCharge, "id" | "createdAt">) => string;
  updateCharge: (id: string, c: Partial<MonthlyCharge>) => void;
  deleteCharge: (id: string) => void;
  markAsPaid: (id: string, method: "pix" | "cartao" | "dinheiro", paidAmount?: number) => void;
  markAsUnpaid: (id: string) => void;

  // Notifications
  addBillingNotification: (n: Omit<BillingNotification, "id">) => string;
  markBillingNotificationRead: (id: string) => void;
  markBillingNotificationReadByAdmin: (id: string) => void;
  markAllAdminNotificationsRead: () => void;

  // Invoice data
  setInvoiceData: (data: PatientInvoiceData) => void;
  getInvoiceData: (patientId: string) => PatientInvoiceData | undefined;

  // Auto-generation
  generateMonthlyCharges: (patients: { id: string; name: string }[]) => void;
  checkAndNotify: () => void;
}

const uid = () => crypto.randomUUID();

export const useBillingStore = create<BillingStore>()(
  persist(
    (set, get) => ({
      charges: [],
      billingNotifications: [],
      patientConfigs: [],
      invoiceData: [],
      lastAutoGenDate: "",

      setPatientConfig: (config) =>
        set((s) => {
          const existing = s.patientConfigs.findIndex((c) => c.patientId === config.patientId);
          if (existing >= 0) {
            const updated = [...s.patientConfigs];
            updated[existing] = config;
            return { patientConfigs: updated };
          }
          return { patientConfigs: [...s.patientConfigs, config] };
        }),

      getPatientConfig: (patientId) => get().patientConfigs.find((c) => c.patientId === patientId),

      setInvoiceData: (data) =>
        set((s) => {
          const existing = s.invoiceData.findIndex((d) => d.patientId === data.patientId);
          if (existing >= 0) {
            const updated = [...s.invoiceData];
            updated[existing] = data;
            return { invoiceData: updated };
          }
          return { invoiceData: [...s.invoiceData, data] };
        }),

      getInvoiceData: (patientId) => get().invoiceData.find((d) => d.patientId === patientId),

      addCharge: (c) => {
        const id = uid();
        set((s) => ({ charges: [...s.charges, { ...c, id, createdAt: new Date().toISOString() }] }));
        return id;
      },

      updateCharge: (id, c) =>
        set((s) => ({ charges: s.charges.map((x) => (x.id === id ? { ...x, ...c } : x)) })),

      deleteCharge: (id) =>
        set((s) => ({
          charges: s.charges.filter((x) => x.id !== id),
          billingNotifications: s.billingNotifications.filter((n) => n.chargeId !== id),
        })),

      markAsPaid: (id, method, paidAmount) =>
        set((s) => ({
          charges: s.charges.map((x) =>
            x.id === id
              ? { ...x, status: "pago" as const, method, paidAt: new Date().toISOString(), paidAmount: paidAmount ?? x.amount }
              : x
          ),
        })),

      markAsUnpaid: (id) =>
        set((s) => ({
          charges: s.charges.map((x) =>
            x.id === id ? { ...x, status: "pendente" as const, method: undefined, paidAt: undefined, paidAmount: undefined } : x
          ),
        })),

      addBillingNotification: (n) => {
        const id = uid();
        set((s) => ({ billingNotifications: [...s.billingNotifications, { ...n, id }] }));
        return id;
      },

      markBillingNotificationRead: (id) =>
        set((s) => ({ billingNotifications: s.billingNotifications.map((x) => (x.id === id ? { ...x, read: true } : x)) })),

      markBillingNotificationReadByAdmin: (id) =>
        set((s) => ({ billingNotifications: s.billingNotifications.map((x) => (x.id === id ? { ...x, readByAdmin: true } : x)) })),

      markAllAdminNotificationsRead: () =>
        set((s) => ({ billingNotifications: s.billingNotifications.map((x) => ({ ...x, readByAdmin: true })) })),

      generateMonthlyCharges: (patients) => {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const today = now.toISOString().split("T")[0];

        // Only run once per day
        if (get().lastAutoGenDate === today) return;

        const configs = get().patientConfigs.filter((c) => c.active);
        const existingCharges = get().charges;

        configs.forEach((config) => {
          // Check if charge already exists for this month
          const exists = existingCharges.some(
            (c) => c.patientId === config.patientId && c.month === currentMonth
          );
          if (exists) return;

          const patient = patients.find((p) => p.id === config.patientId);
          if (!patient) return;

          const dueDate = `${currentMonth}-${String(config.dueDay).padStart(2, "0")}`;
          const chargeId = get().addCharge({
            patientId: config.patientId,
            month: currentMonth,
            amount: config.monthlyAmount,
            description: `Mensalidade ${currentMonth.replace("-", "/")}`,
            dueDate,
            status: "pendente",
          });

          get().addBillingNotification({
            patientId: config.patientId,
            type: "cobranca_gerada",
            message: `Nova cobrança de R$ ${config.monthlyAmount.toFixed(2)} gerada para ${currentMonth.replace("-", "/")}. Vencimento: ${dueDate.split("-").reverse().join("/")}`,
            chargeId,
            date: new Date().toISOString(),
            read: false,
          });
        });

        set({ lastAutoGenDate: today });
      },

      checkAndNotify: () => {
        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const charges = get().charges.filter((c) => c.status === "pendente");

        charges.forEach((charge) => {
          const dueDate = new Date(charge.dueDate + "T00:00:00");
          const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          // Notify 3 days before due
          if (diffDays <= 3 && diffDays > 0 && !charge.notifiedUpcoming) {
            get().addBillingNotification({
              patientId: charge.patientId,
              type: "vencimento_proximo",
              message: `Seu pagamento de R$ ${charge.amount.toFixed(2)} vence em ${diffDays} dia(s) (${charge.dueDate.split("-").reverse().join("/")}).`,
              chargeId: charge.id,
              date: new Date().toISOString(),
              read: false,
            });
            get().updateCharge(charge.id, { notifiedUpcoming: true });
          }

          // Mark as overdue and notify
          if (charge.dueDate < today && !charge.notifiedOverdue) {
            get().updateCharge(charge.id, { status: "atrasado", notifiedOverdue: true });
            get().addBillingNotification({
              patientId: charge.patientId,
              type: "pagamento_atrasado",
              message: `Pagamento de R$ ${charge.amount.toFixed(2)} está atrasado! Vencimento era ${charge.dueDate.split("-").reverse().join("/")}.`,
              chargeId: charge.id,
              date: new Date().toISOString(),
              read: false,
            });
          }
        });
      },
    }),
    { name: "billing-storage" }
  )
);
