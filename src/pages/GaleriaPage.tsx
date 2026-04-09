import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { useGalleryStore } from "@/data/galleryStore";
import { useAuthStore } from "@/data/authStore";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2, X, Image, Edit3, Check } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GaleriaPage() {
  const user = useAuthStore((s) => s.user);
  const { photos, addPhoto, removePhoto, updateCaption } = useGalleryStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione apenas imagens.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreviewSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!previewSrc) return;
    addPhoto({
      src: previewSrc,
      caption: caption.trim(),
      uploadedBy: user?.username || "Admin",
    });
    setPreviewSrc(null);
    setCaption("");
    if (fileRef.current) fileRef.current.value = "";
    toast.success("Foto adicionada à galeria!");
  };

  const handleDelete = (id: string) => {
    removePhoto(id);
    toast.success("Foto removida da galeria.");
  };

  const handleSaveCaption = (id: string) => {
    updateCaption(id, editCaption);
    setEditingId(null);
    toast.success("Legenda atualizada.");
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Image className="h-6 w-6 text-primary" /> Galeria de Fotos
            </h1>
            <p className="text-sm text-muted-foreground">Fotos da clínica com pacientes — aparecerão no site</p>
          </div>
          <Button onClick={() => fileRef.current?.click()} className="gap-1.5">
            <ImagePlus className="h-4 w-4" /> Adicionar Foto
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Upload preview */}
        {previewSrc && (
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Nova Foto</h3>
              <button onClick={() => { setPreviewSrc(null); setCaption(""); }}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex gap-4 items-start">
              <img src={previewSrc} alt="Preview" className="h-40 w-40 object-cover rounded-xl border border-border" />
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Legenda (opcional)</label>
                  <input
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Ex: Sessão com a turma da manhã"
                    className="w-full px-3 py-2.5 bg-background border border-input rounded-xl text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <Button onClick={handleUpload}>
                  <ImagePlus className="h-4 w-4 mr-1" /> Publicar na Galeria
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Gallery grid */}
        {photos.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <Image className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Nenhuma foto na galeria</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Adicione fotos para mostrar no site da clínica</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative bg-card border border-border rounded-xl overflow-hidden">
                <img
                  src={photo.src}
                  alt={photo.caption || "Foto da galeria"}
                  className="w-full aspect-square object-cover cursor-pointer"
                  onClick={() => setZoomedPhoto(photo.id)}
                />
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all flex items-start justify-end p-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="h-8 w-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {/* Caption */}
                <div className="p-2.5">
                  {editingId === photo.id ? (
                    <div className="flex gap-1.5">
                      <input
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        className="flex-1 px-2 py-1 bg-background border border-input rounded text-xs outline-none focus:ring-1 focus:ring-ring"
                        autoFocus
                      />
                      <button onClick={() => handleSaveCaption(photo.id)} className="text-primary">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-muted-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground truncate">{photo.caption || "Sem legenda"}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {photo.uploadedBy} • {format(new Date(photo.uploadedAt), "dd/MM/yy", { locale: ptBR })}
                        </p>
                      </div>
                      <button
                        onClick={() => { setEditingId(photo.id); setEditCaption(photo.caption); }}
                        className="text-muted-foreground hover:text-primary shrink-0 mt-0.5"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Zoom modal */}
        {zoomedPhoto && (() => {
          const photo = photos.find((p) => p.id === zoomedPhoto);
          if (!photo) return null;
          return (
            <div className="fixed inset-0 bg-foreground/80 z-50 flex items-center justify-center p-4" onClick={() => setZoomedPhoto(null)}>
              <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <img src={photo.src} alt={photo.caption} className="max-w-full max-h-[80vh] rounded-2xl object-contain" />
                {photo.caption && (
                  <p className="text-center text-primary-foreground text-sm mt-3">{photo.caption}</p>
                )}
                <button onClick={() => setZoomedPhoto(null)} className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-card text-foreground flex items-center justify-center shadow-lg">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </DashboardLayout>
  );
}
