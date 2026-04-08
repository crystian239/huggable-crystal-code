import { useState } from "react";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useClinicStore } from "@/data/clinicStore";
import { Button } from "@/components/ui/button";
import { Megaphone, Plus, Trash2, X, FileText, Download, Edit, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import RichTextEditor from "@/components/RichTextEditor";

export default function AvisosPage() {
  const patientAnnouncements = useClinicStore((s) => s.patientAnnouncements);
  const addPatientAnnouncement = useClinicStore((s) => s.addPatientAnnouncement);
  const updatePatientAnnouncement = useClinicStore((s) => s.updatePatientAnnouncement);
  const deletePatientAnnouncement = useClinicStore((s) => s.deletePatientAnnouncement);
  const settings = useClinicStore((s) => s.settings);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<{ url: string; name: string } | null>(null);
  const [image, setImage] = useState<{ url: string; name: string } | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setFile(null);
    setImage(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (id: string) => {
    const ann = patientAnnouncements.find((a) => a.id === id);
    if (!ann) return;
    setEditingId(id);
    setTitle(ann.title);
    setContent(ann.content);
    setFile(ann.fileUrl ? { url: ann.fileUrl, name: ann.fileName || "" } : null);
    setImage(ann.imageUrl ? { url: ann.imageUrl, name: ann.imageName || "" } : null);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Título e conteúdo são obrigatórios.");
      return;
    }
    const data = {
      title: title.trim(),
      content,
      from: settings.doctorName,
      date: new Date().toISOString(),
      fileUrl: file?.url,
      fileName: file?.name,
      imageUrl: image?.url,
      imageName: image?.name,
    };
    if (editingId) {
      updatePatientAnnouncement(editingId, data);
      toast.success("Aviso atualizado!");
    } else {
      addPatientAnnouncement(data);
      toast.success("Aviso publicado para os pacientes!");
    }
    resetForm();
  };

  const handleFileUpload = (f: File) => {
    const url = URL.createObjectURL(f);
    setFile({ url, name: f.name });
  };

  const handleImageUpload = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImage({ url: reader.result as string, name: f.name });
    };
    reader.readAsDataURL(f);
  };

  const previewAnn = previewId ? patientAnnouncements.find((a) => a.id === previewId) : null;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" /> Avisos para Pacientes
          </h1>
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Novo Aviso
          </Button>
        </div>

        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4" onClick={resetForm}>
            <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">{editingId ? "Editar Aviso" : "Novo Aviso"}</h2>
                <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Título *</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Título do aviso"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Conteúdo *</label>
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Escreva o aviso para os pacientes..."
                    onFileUpload={handleFileUpload}
                    onImageUpload={handleImageUpload}
                  />
                </div>
                {file && (
                  <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 text-xs">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="flex-1 truncate text-foreground">{file.name}</span>
                    <button onClick={() => setFile(null)}><X className="h-3 w-3 text-muted-foreground" /></button>
                  </div>
                )}
                {image && (
                  <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 text-xs">
                    <img src={image.url} alt="" className="h-10 w-10 rounded object-cover" />
                    <span className="flex-1 truncate text-foreground">{image.name}</span>
                    <button onClick={() => setImage(null)}><X className="h-3 w-3 text-muted-foreground" /></button>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSubmit} className="flex-1">{editingId ? "Salvar" : "Publicar"}</Button>
                  <Button variant="outline" onClick={resetForm} className="flex-1">Cancelar</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview modal */}
        {previewAnn && (
          <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4" onClick={() => setPreviewId(null)}>
            <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">{previewAnn.title}</h2>
                <button onClick={() => setPreviewId(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-3">
                  {previewAnn.from} · {format(new Date(previewAnn.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  {" · "}Lido por {previewAnn.readBy.length} paciente(s)
                </p>
                <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: previewAnn.content }} />
                {previewAnn.imageUrl && (
                  <img src={previewAnn.imageUrl} alt="" className="max-w-full rounded-lg mt-3 border border-border" />
                )}
                {previewAnn.fileName && (
                  <a href={previewAnn.fileUrl} download={previewAnn.fileName} className="inline-flex items-center gap-2 mt-3 text-xs text-primary hover:underline bg-primary/5 rounded-lg px-3 py-2">
                    <Download className="h-4 w-4" />{previewAnn.fileName}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* List */}
        {patientAnnouncements.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Megaphone className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum aviso publicado para pacientes.</p>
            <p className="text-xs text-muted-foreground mt-1">Crie um aviso e ele aparecerá automaticamente no portal do paciente.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...patientAnnouncements].reverse().map((a) => (
              <div key={a.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Megaphone className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{a.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {a.from} · {format(new Date(a.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        Lido por {a.readBy.length} paciente(s)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPreviewId(a.id)} className="text-muted-foreground hover:text-primary p-1" title="Visualizar">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleEdit(a.id)} className="text-muted-foreground hover:text-primary p-1" title="Editar">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => { deletePatientAnnouncement(a.id); toast.success("Aviso removido."); }} className="text-muted-foreground hover:text-destructive p-1" title="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-sm text-foreground line-clamp-2" dangerouslySetInnerHTML={{ __html: a.content }} />
                {a.fileName && (
                  <span className="inline-flex items-center gap-1 mt-2 text-[10px] text-primary"><FileText className="h-3 w-3" />{a.fileName}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
