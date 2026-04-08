import { useState } from "react";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useClinicStore } from "@/data/clinicStore";
import { Button } from "@/components/ui/button";
import { Plus, X, Search, FileText, ClipboardList, FileHeart, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import AnamneseForm from "@/components/clinic/AnamneseForm";
import ProntuarioForm from "@/components/clinic/ProntuarioForm";
import EvolucaoForm from "@/components/clinic/EvolucaoForm";

const RECORD_TYPES = [
  { value: "prontuario" as const, label: "Prontuário", icon: ClipboardList, color: "bg-primary/10 text-primary" },
  { value: "evolucao" as const, label: "Evolução", icon: FileText, color: "bg-info/10 text-info" },
  { value: "anamnese" as const, label: "Anamnese", icon: FileHeart, color: "bg-accent text-accent-foreground" },
];

export default function ProntuariosPage() {
  const patients = useClinicStore((s) => s.patients);
  const records = useClinicStore((s) => s.records);
  const addRecord = useClinicStore((s) => s.addRecord);
  const updateRecord = useClinicStore((s) => s.updateRecord);
  const deleteRecord = useClinicStore((s) => s.deleteRecord);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedType, setSelectedType] = useState<"" | "prontuario" | "evolucao" | "anamnese">("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ patientId: "", type: "prontuario" as "prontuario" | "evolucao" | "anamnese", content: "", doctorName: "", date: format(new Date(), "yyyy-MM-dd") });

  const filtered = records
    .filter((r) => (!selectedPatient || r.patientId === selectedPatient) && (!selectedType || r.type === selectedType))
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleSave = () => {
    if (!form.patientId || !form.content) { toast.error("Preencha paciente e conteúdo."); return; }
    if (editing) {
      updateRecord(editing, form);
      toast.success("Registro atualizado!");
    } else {
      addRecord(form);
      toast.success("Registro adicionado!");
    }
    setShowForm(false);
    setEditing(null);
    setForm({ patientId: "", type: "prontuario" as "prontuario" | "evolucao" | "anamnese", content: "", doctorName: "", date: format(new Date(), "yyyy-MM-dd") });
  };

  const handleEdit = (r: typeof records[0]) => {
    setForm({ patientId: r.patientId, type: r.type, content: r.content, doctorName: r.doctorName, date: r.date });
    setEditing(r.id);
    setShowForm(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Prontuários</h1>
          <Button size="sm" onClick={() => { setEditing(null); setForm({ patientId: "", type: "prontuario", content: "", doctorName: "", date: format(new Date(), "yyyy-MM-dd") }); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Novo Registro
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} className="border border-input bg-card rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="">Todos os pacientes</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={() => setSelectedType("")} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${!selectedType ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}>Todos</button>
            {RECORD_TYPES.map((t) => (
              <button key={t.value} onClick={() => setSelectedType(t.value)} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${selectedType === t.value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Records list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>
            </div>
          ) : (
            filtered.map((r) => {
              const patient = patients.find((p) => p.id === r.patientId);
              const typeInfo = RECORD_TYPES.find((t) => t.value === r.type)!;
              return (
                <div key={r.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${typeInfo.color}`}>
                      <typeInfo.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">{patient?.name || "Paciente"}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.color}`}>{typeInfo.label}</span>
                        <span className="text-xs text-muted-foreground">{r.date}</span>
                        {r.doctorName && <span className="text-xs text-muted-foreground">• {r.doctorName}</span>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap line-clamp-3">{(() => {
                        try {
                          const parsed = JSON.parse(r.content);
                          if (r.type === "anamnese") return `Queixa: ${parsed.queixaPrincipal || "—"} | HDA: ${parsed.historiaDoencaAtual || "—"}`;
                          if (r.type === "prontuario") return `Motivo: ${parsed.motivoConsulta || "—"} | Avaliação: ${parsed.avaliacaoPsicologica || "—"}`;
                          return `Sessão ${parsed.sessaoNumero || "—"} | Tema: ${parsed.temaAbordado || "—"}`;
                        } catch { return r.content; }
                      })()}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => handleEdit(r)} className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-secondary"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => { deleteRecord(r.id); toast.success("Excluído!"); }} className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-secondary"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">{editing ? "Editar Registro" : "Novo Registro"}</h2>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Paciente *</label>
                  <select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Selecione</option>
                    {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Tipo</label>
                  <div className="grid grid-cols-3 gap-2">
                    {RECORD_TYPES.map((t) => (
                      <button key={t.value} type="button" onClick={() => setForm({ ...form, type: t.value })} className={`py-2 text-xs rounded-lg border transition-colors ${form.type === t.value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}>{t.label}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Profissional</label>
                    <input type="text" value={form.doctorName} onChange={(e) => setForm({ ...form, doctorName: e.target.value })} placeholder="Nome da Dra./Dr." className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Data</label>
                    <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Conteúdo *</label>
                  {form.type === "anamnese" ? (
                    <AnamneseForm value={form.content} onChange={(v) => setForm({ ...form, content: v })} />
                  ) : form.type === "prontuario" ? (
                    <ProntuarioForm value={form.content} onChange={(v) => setForm({ ...form, content: v })} />
                  ) : (
                    <EvolucaoForm value={form.content} onChange={(v) => setForm({ ...form, content: v })} />
                  )}
                </div>
                <Button onClick={handleSave} className="w-full">Salvar</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
