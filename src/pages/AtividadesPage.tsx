import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useClinicStore } from "@/data/clinicStore";
import { Button } from "@/components/ui/button";
import {
  Plus, X, FileText, Link as LinkIcon, Image, Type, Trash2, Search, User
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function AtividadesPage() {
  const patients = useClinicStore((s) => s.patients);
  const activities = useClinicStore((s) => s.activities);
  const settings = useClinicStore((s) => s.settings);
  const addActivity = useClinicStore((s) => s.addActivity);
  const deleteActivity = useClinicStore((s) => s.deleteActivity);

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPatient, setFilterPatient] = useState("");
  const [form, setForm] = useState({
    patientId: "",
    doctorName: settings.doctors[0] || settings.doctorName,
    title: "",
    description: "",
    type: "texto" as "texto" | "anexo" | "foto" | "link",
    linkUrl: "",
    fileData: "",
    fileName: "",
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...activities]
      .filter((a) => {
        if (filterPatient && a.patientId !== filterPatient) return false;
        const patient = patients.find((p) => p.id === a.patientId);
        return (
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          (patient?.name || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [activities, search, filterPatient, patients]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo deve ter no máximo 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({
        ...f,
        fileData: reader.result as string,
        fileName: file.name,
        type: file.type.startsWith("image/") ? "foto" : "anexo",
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.patientId || !form.title.trim()) {
      toast.error("Selecione o paciente e preencha o título.");
      return;
    }
    if (form.type === "link" && !form.linkUrl.trim()) {
      toast.error("Preencha a URL do link.");
      return;
    }
    addActivity({
      patientId: form.patientId,
      doctorName: form.doctorName,
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      fileData: form.fileData || undefined,
      fileName: form.fileName || undefined,
      linkUrl: form.linkUrl.trim() || undefined,
      date: new Date().toISOString(),
      completed: false,
    });
    toast.success("Atividade adicionada!");
    setShowForm(false);
    setForm({
      patientId: "",
      doctorName: settings.doctors[0] || settings.doctorName,
      title: "",
      description: "",
      type: "texto",
      linkUrl: "",
      fileData: "",
      fileName: "",
    });
  };

  const typeIcons: Record<string, React.ReactNode> = {
    texto: <Type className="h-4 w-4" />,
    anexo: <FileText className="h-4 w-4" />,
    foto: <Image className="h-4 w-4" />,
    link: <LinkIcon className="h-4 w-4" />,
  };

  const typeLabels: Record<string, string> = {
    texto: "Texto",
    anexo: "Anexo",
    foto: "Foto",
    link: "Link",
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Atividades para Pacientes</h1>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> Nova Atividade
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar atividade..."
              className="w-full pl-9 pr-3 py-2 border border-input bg-background rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={filterPatient}
            onChange={(e) => setFilterPatient(e.target.value)}
            className="border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todos os pacientes</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma atividade encontrada.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => {
              const patient = patients.find((p) => p.id === a.patientId);
              return (
                <div key={a.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      {typeIcons[a.type]}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm">{a.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{typeLabels[a.type]}</span>
                        {a.completed && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Concluída</span>}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" /> {patient?.name || "Paciente removido"} • Dr(a): {a.doctorName} • {format(new Date(a.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                      {a.description && <p className="text-sm text-foreground mt-1">{a.description}</p>}
                      {a.type === "link" && a.linkUrl && (
                        <a href={a.linkUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline break-all">{a.linkUrl}</a>
                      )}
                      {a.type === "foto" && a.fileData && (
                        <img src={a.fileData} alt={a.title} className="max-w-xs rounded-lg mt-1 border border-border" />
                      )}
                      {a.type === "anexo" && a.fileName && (
                        <div className="flex items-center gap-2 mt-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{a.fileName}</span>
                          {a.fileData && (
                            <a href={a.fileData} download={a.fileName} className="text-xs text-primary underline">Baixar</a>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => { deleteActivity(a.id); toast.success("Atividade removida!"); }}
                      className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Activity Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Nova Atividade</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Paciente *</label>
                <select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Selecione...</option>
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Profissional</label>
                <select value={form.doctorName} onChange={(e) => setForm({ ...form, doctorName: e.target.value })} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                  {settings.doctors.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Título *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Exercício de respiração" className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Descrição / Instruções</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descreva a atividade..." rows={3} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>

              {/* Type selector */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Tipo de conteúdo</label>
                <div className="flex gap-2">
                  {(["texto", "anexo", "foto", "link"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setForm({ ...form, type: t, fileData: "", fileName: "", linkUrl: "" })}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-colors ${
                        form.type === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {typeIcons[t]} {typeLabels[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional fields */}
              {form.type === "link" && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">URL do link *</label>
                  <input type="url" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="https://..." className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
              )}

              {(form.type === "anexo" || form.type === "foto") && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    {form.type === "foto" ? "Selecionar imagem" : "Selecionar arquivo"} *
                  </label>
                  <input
                    type="file"
                    accept={form.type === "foto" ? "image/*" : "*"}
                    onChange={handleFileUpload}
                    className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm"
                  />
                  {form.fileName && <p className="text-xs text-muted-foreground mt-1">📎 {form.fileName}</p>}
                  {form.type === "foto" && form.fileData && (
                    <img src={form.fileData} alt="preview" className="max-w-[200px] rounded-lg mt-2 border border-border" />
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end p-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Salvar Atividade</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
