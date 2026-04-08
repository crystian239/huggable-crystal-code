import { useRef, useCallback } from "react";
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Type, Palette, Image, Paperclip, Smile } from "lucide-react";
import EmojiPicker from "./EmojiPicker";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onFileUpload?: (file: File) => void;
  onImageUpload?: (file: File) => void;
}

export default function RichTextEditor({ value, onChange, placeholder, onFileUpload, onImageUpload }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  const exec = useCallback((cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleEmoji = (emoji: string) => {
    editorRef.current?.focus();
    document.execCommand("insertText", false, emoji);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleFontSize = (size: string) => {
    exec("fontSize", size);
  };

  const handleColor = (color: string) => {
    exec("foreColor", color);
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (onImageUpload) {
      onImageUpload(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        exec("insertImage", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) onFileUpload(file);
    if (e.target) e.target.value = "";
  };

  const ToolBtn = ({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title: string }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`h-7 w-7 flex items-center justify-center rounded transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-input rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-input bg-secondary/30">
        <ToolBtn onClick={() => exec("bold")} title="Negrito"><Bold className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec("italic")} title="Itálico"><Italic className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec("underline")} title="Sublinhado"><Underline className="h-3.5 w-3.5" /></ToolBtn>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolBtn onClick={() => exec("insertUnorderedList")} title="Lista"><List className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec("insertOrderedList")} title="Lista numerada"><ListOrdered className="h-3.5 w-3.5" /></ToolBtn>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolBtn onClick={() => exec("justifyLeft")} title="Alinhar esquerda"><AlignLeft className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec("justifyCenter")} title="Centralizar"><AlignCenter className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec("justifyRight")} title="Alinhar direita"><AlignRight className="h-3.5 w-3.5" /></ToolBtn>
        <div className="w-px h-5 bg-border mx-1" />
        <select
          onChange={(e) => handleFontSize(e.target.value)}
          className="h-7 text-xs bg-transparent border border-input rounded px-1 text-foreground outline-none"
          defaultValue="3"
          title="Tamanho da fonte"
        >
          <option value="1">Pequeno</option>
          <option value="3">Normal</option>
          <option value="5">Grande</option>
          <option value="7">Muito grande</option>
        </select>
        <div className="relative">
          <input
            type="color"
            onChange={(e) => handleColor(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-7 h-7"
            title="Cor do texto"
          />
          <div className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer">
            <Palette className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolBtn onClick={() => imgRef.current?.click()} title="Inserir imagem"><Image className="h-3.5 w-3.5" /></ToolBtn>
        {onFileUpload && (
          <ToolBtn onClick={() => fileRef.current?.click()} title="Anexar arquivo"><Paperclip className="h-3.5 w-3.5" /></ToolBtn>
        )}
        <EmojiPicker onSelect={handleEmoji} />
        <input ref={imgRef} type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
        {onFileUpload && <input ref={fileRef} type="file" onChange={handleFileAttach} className="hidden" />}
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder || "Escreva aqui..."}
        className="min-h-[180px] max-h-[400px] overflow-y-auto px-4 py-3 text-sm text-foreground outline-none focus:ring-0 [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}
