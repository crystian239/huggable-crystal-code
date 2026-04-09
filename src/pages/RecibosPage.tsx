import { useEffect, useState, useMemo, useRef } from "react";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useClinicStore } from "@/data/clinicStore";
import { Button } from "@/components/ui/button";
import { FileText, Printer, ChevronLeft, ChevronRight, Users, Download } from "lucide-react";
import clinicLogo from "@/assets/clinic-logo.png";
import { format, getDaysInMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function countWeekdayInMonth(year: number, month: number, dayOfWeek: number) {
  let count = 0;
  const daysInMonth = getDaysInMonth(new Date(year, month));
  for (let d = 1; d <= daysInMonth; d++) {
    if (new Date(year, month, d).getDay() === dayOfWeek) count++;
  }
  return count;
}

export default function RecibosPage() {
  const patients = useClinicStore((s) => s.patients);
  const appointments = useClinicStore((s) => s.appointments);
  const settings = useClinicStore((s) => s.settings);
  const addPatient = useClinicStore((s) => s.addPatient);
  const addAppointment = useClinicStore((s) => s.addAppointment);
  const updateSettings = useClinicStore((s) => s.updateSettings);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [simLoaded, setSimLoaded] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const loadSimulation = () => {
    // Update clinic settings
    updateSettings({
      name: "Clínica Magia Da Linguagem",
      phone: "(11) 99999-8888",
      email: "contato@magiadaLinguagem.com",
      address: "Taguatinga Shopping, Sala 204 - Brasília/DF",
      cnpj: "12.345.678/0001-90",
      crp: "CRP 06/123456",
      doctorName: "Dra. Maria Silva",
      doctors: ["Dra. Maria Silva", "Dr. João Santos"],
    });

    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    // Sample patients with appointments this month
    const samplePatients = [
      { name: "Ana Carolina Souza", cpf: "123.456.789-00", phone: "(11) 91234-5678", email: "ana@email.com", birthDate: `${y}-${String(m + 1).padStart(2, "0")}-15`, address: "Rua A, 100", notes: "" },
      { name: "Pedro Henrique Lima", cpf: "987.654.321-00", phone: "(11) 98765-4321", email: "pedro@email.com", birthDate: "1995-03-22", address: "Rua B, 200", notes: "" },
      { name: "Juliana Costa Ferreira", cpf: "456.789.123-00", phone: "(11) 94567-8901", email: "juliana@email.com", birthDate: "1988-07-10", address: "Rua C, 300", notes: "" },
    ];

    const weekdays = [4, 3, 2]; // Thu, Wed, Tue
    const values = [150, 200, 180];

    samplePatients.forEach((p, i) => {
      const pid = addPatient(p);
      // Create a weekly appointment on a weekday this month
      const firstDay = new Date(y, m, 1);
      let d = firstDay;
      while (d.getDay() !== weekdays[i]) d = new Date(y, m, d.getDate() + 1);
      
      addAppointment({
        patientId: pid,
        date: `${y}-${String(m + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
        time: `${9 + i}:00`,
        dayOfWeek: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][weekdays[i]],
        frequency: "semanal",
        status: "agendado",
        notes: "",
        sessionValue: values[i],
        doctorName: settings.doctors[0] || settings.doctorName,
      });
    });

    setSimLoaded(true);
  };

  // For each patient, calculate sessions in the month and total value
  const patientReceipts = useMemo(() => {
    return patients.map((patient) => {
      // Find appointments for this patient in the selected month
      const monthAppts = appointments.filter((a) => {
        if (a.patientId !== patient.id) return false;
        if (a.status === "cancelado") return false;
        const d = new Date(a.date + "T00:00:00");
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      });

      // For weekly patients, count how many of that weekday exist in the month
      // Use the first appointment's sessionValue as the per-session price
      let sessionCount = 0;
      let sessionValue = 0;

      if (monthAppts.length > 0) {
        sessionValue = monthAppts[0].sessionValue || 0;
        
        // Check if patient has weekly frequency
        const weeklyAppt = monthAppts.find((a) => a.frequency === "semanal");
        if (weeklyAppt) {
          // Count how many times that weekday appears in the month
          const apptDate = new Date(weeklyAppt.date + "T00:00:00");
          const dayOfWeek = apptDate.getDay();
          sessionCount = countWeekdayInMonth(selectedYear, selectedMonth, dayOfWeek);
        } else {
          sessionCount = monthAppts.length;
        }
      }

      const totalValue = sessionCount * sessionValue;

      return {
        patient,
        sessionCount,
        sessionValue,
        totalValue,
        dayOfWeek: monthAppts[0]?.dayOfWeek || "",
      };
    }).filter((r) => r.sessionCount > 0);
  }, [patients, appointments, selectedMonth, selectedYear]);

  const selectedReceipt = patientReceipts.find((r) => r.patient.id === selectedPatientId);

  useEffect(() => {
    if (patientReceipts.length === 0) {
      if (selectedPatientId !== null) setSelectedPatientId(null);
      return;
    }

    const hasSelectedPatient = patientReceipts.some((receipt) => receipt.patient.id === selectedPatientId);
    if (!hasSelectedPatient) {
      setSelectedPatientId(patientReceipts[0].patient.id);
    }
  }, [patientReceipts, selectedPatientId]);

  const getReceiptHTML = () => {
    if (!receiptRef.current || !selectedReceipt) return "";
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Recibo - ${selectedReceipt.patient.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; color: #333; background: white; }
  .receipt { max-width: 800px; margin: 0 auto; }
  .header-bar { background: #1e3a5f; color: white; padding: 24px 32px; display: flex; align-items: center; gap: 16px; }
  .header-bar img { width: 56px; height: 56px; border-radius: 8px; object-fit: contain; background: rgba(255,255,255,0.15); padding: 4px; }
  .header-bar h1 { font-size: 22px; font-weight: bold; margin: 0; }
  .header-bar p { font-size: 12px; opacity: 0.8; margin: 0; }
  @media print { body { padding: 0; } .receipt { max-width: 100%; } }
</style></head><body>
${receiptRef.current.innerHTML}
</body></html>`;
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(getReceiptHTML());
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); };
  };

  const handleDownload = () => {
    if (!receiptRef.current || !selectedReceipt) return;
    const html = getReceiptHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Recibo_${selectedReceipt.patient.name.replace(/\s+/g, "_")}_${MONTH_NAMES[selectedMonth]}_${selectedYear}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const prevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(selectedYear - 1); }
    else setSelectedMonth(selectedMonth - 1);
  };
  const nextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(selectedYear + 1); }
    else setSelectedMonth(selectedMonth + 1);
  };

  const receiptNumber = selectedReceipt
    ? `${selectedYear}${String(selectedMonth + 1).padStart(2, "0")}${format(new Date(), "ddHHmm")}`
    : "";

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-foreground">Recibos</h1>
          {patientReceipts.length === 0 && !simLoaded && (
            <Button size="sm" onClick={loadSimulation} className="ml-2">
              <Users className="h-4 w-4 mr-1" /> Carregar Simulação
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between bg-card border border-border rounded-xl p-3 no-print">
          <button onClick={prevMonth} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="font-semibold text-foreground">
            {MONTH_NAMES[selectedMonth]} de {selectedYear}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient list */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground text-sm">Pacientes do Mês</h2>
              <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{patientReceipts.length}</span>
            </div>
            {patientReceipts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Nenhum paciente com consulta neste mês.</p>
            ) : (
              <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
                {patientReceipts.map((r) => (
                  <button
                    key={r.patient.id}
                    onClick={() => setSelectedPatientId(r.patient.id)}
                    className={`w-full text-left flex items-center gap-3 p-4 transition-colors ${selectedPatientId === r.patient.id ? "bg-primary/5" : "hover:bg-secondary/50"}`}
                  >
                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium shrink-0">
                      {r.patient.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.patient.name}</p>
                      <p className="text-xs text-muted-foreground">{r.sessionCount}x sessões • R$ {r.totalValue.toFixed(2)}</p>
                    </div>
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Receipt preview */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border no-print">
              <h2 className="font-semibold text-foreground text-sm">Pré-visualização do Recibo</h2>
              {selectedReceipt && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-1" /> Baixar
                  </Button>
                  <Button size="sm" variant="outline" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-1" /> Imprimir PDF
                  </Button>
                </div>
              )}
            </div>

            {!selectedReceipt ? (
              <p className="text-sm text-muted-foreground py-16 text-center">Selecione um paciente para gerar o recibo automático.</p>
            ) : (
              <div className="p-4 overflow-auto">
                <div ref={receiptRef}>
                  <div className="receipt" style={{ maxWidth: 700, margin: "0 auto", fontFamily: "Arial, sans-serif", color: "#333" }}>
                    {/* Blue header bar */}
                    <div style={{ background: "#1e3a5f", color: "white", padding: "20px 28px", display: "flex", alignItems: "center", gap: "16px", borderRadius: "8px 8px 0 0" }}>
                      <img
                        src={settings.logo || clinicLogo}
                        alt="Logo"
                        style={{ width: 52, height: 52, borderRadius: 8, objectFit: "contain", background: "rgba(255,255,255,0.15)", padding: 4 }}
                      />
                      <div>
                        <h1 style={{ fontSize: 20, fontWeight: "bold", margin: 0 }}>{settings.name}</h1>
                        <p style={{ fontSize: 12, opacity: 0.8, margin: 0 }}>{settings.address}</p>
                      </div>
                    </div>

                    {/* Receipt number & date */}
                    <div style={{ textAlign: "right", padding: "14px 28px", fontSize: 12, color: "#666" }}>
                      <p><strong style={{ color: "#333" }}>RECIBO Nº</strong> {receiptNumber}</p>
                      <p><strong style={{ color: "#333" }}>DATA DE EMISSÃO:</strong> {format(new Date(), "dd/MM/yyyy")}</p>
                    </div>

                    {/* Service receipt title */}
                    <div style={{ padding: "0 28px", marginBottom: 16 }}>
                      <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 12, borderBottom: "2px solid #1e3a5f", paddingBottom: 6 }}>
                        RECIBO DE PRESTAÇÃO DE SERVIÇOS
                      </h2>
                      <div style={{ border: "1px solid #ddd", borderRadius: 6, padding: "14px 18px" }}>
                        <div style={{ display: "flex", gap: 12, marginBottom: 6 }}>
                          <span style={{ fontWeight: "bold", fontSize: 13, minWidth: 100 }}>PACIENTE:</span>
                          <span style={{ fontSize: 13 }}>{selectedReceipt.patient.name.toUpperCase()}</span>
                        </div>
                        <div style={{ display: "flex", gap: 12 }}>
                          <span style={{ fontWeight: "bold", fontSize: 13, minWidth: 100 }}>SERVIÇO:</span>
                          <span style={{ fontSize: 13 }}>Atendimento Especializado</span>
                        </div>
                      </div>
                    </div>

                    {/* Detail */}
                    <div style={{ padding: "0 28px", marginBottom: 20 }}>
                      <h3 style={{ fontSize: 15, fontWeight: "bold", marginBottom: 8, borderBottom: "1px solid #cc0000", paddingBottom: 4 }}>
                        DETALHAMENTO DO ATENDIMENTO
                      </h3>
                      <p style={{ fontSize: 13, marginBottom: 6 }}>Paciente: {selectedReceipt.patient.name.toUpperCase()}</p>
                      <p style={{ fontSize: 13, marginBottom: 12 }}>
                        Atendimentos realizados no mês de: <strong>{MONTH_NAMES[selectedMonth]}</strong>
                      </p>
                      <p style={{ fontSize: 14, fontWeight: "bold" }}>
                        {String(selectedReceipt.sessionCount).padStart(2, "0")}X &nbsp; R$ {selectedReceipt.sessionValue.toFixed(2)} &nbsp; = &nbsp; R$ {selectedReceipt.totalValue.toFixed(2)}
                      </p>
                    </div>

                    {/* Total */}
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 24, padding: "14px 28px", borderTop: "2px solid #ddd", marginTop: 30 }}>
                      <span style={{ fontSize: 18, fontWeight: "bold", color: "#1e3a5f" }}>VALOR TOTAL</span>
                      <span style={{ fontSize: 22, fontWeight: "bold" }}>R$ {selectedReceipt.totalValue.toFixed(2)}</span>
                    </div>

                    {/* Signature */}
                    <div style={{ textAlign: "center", marginTop: 70, paddingBottom: 30 }}>
                      <div style={{ borderTop: "1px solid #333", width: 280, margin: "0 auto 8px", paddingTop: 6 }}>
                        <p style={{ fontWeight: "bold", fontSize: 13 }}>{settings.doctorName}</p>
                        {settings.crp && <p style={{ fontSize: 12, color: "#666" }}>{settings.crp}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
