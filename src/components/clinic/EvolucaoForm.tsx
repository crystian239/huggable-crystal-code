import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface EvolucaoData {
  sessaoNumero: string;
  apresentacao: {
    orientado: boolean;
    cooperativo: boolean;
    agitado: boolean;
    sonolento: boolean;
    ansioso: boolean;
    choroso: boolean;
    irritado: boolean;
    calmo: boolean;
    comunicativo: boolean;
    resistente: boolean;
    outros: string;
  };
  temaAbordado: string;
  tecnicasUtilizadas: {
    escutaAtiva: boolean;
    reestruturacaoCognitiva: boolean;
    psicoeducacao: boolean;
    relaxamento: boolean;
    rolePlay: boolean;
    dessensibilizacao: boolean;
    interpretacao: boolean;
    confrontacao: boolean;
    tarefaDeCasa: boolean;
    outros: string;
  };
  observacoesClinicas: string;
  evolucaoPercebida: {
    melhora: boolean;
    estavel: boolean;
    piora: boolean;
    observacao: string;
  };
  encaminhamentos: string;
  planejamentoProximaSessao: string;
  observacoesGerais: string;
}

const defaultEvolucao: EvolucaoData = {
  sessaoNumero: "",
  apresentacao: { orientado: false, cooperativo: false, agitado: false, sonolento: false, ansioso: false, choroso: false, irritado: false, calmo: false, comunicativo: false, resistente: false, outros: "" },
  temaAbordado: "",
  tecnicasUtilizadas: { escutaAtiva: false, reestruturacaoCognitiva: false, psicoeducacao: false, relaxamento: false, rolePlay: false, dessensibilizacao: false, interpretacao: false, confrontacao: false, tarefaDeCasa: false, outros: "" },
  observacoesClinicas: "",
  evolucaoPercebida: { melhora: false, estavel: false, piora: false, observacao: "" },
  encaminhamentos: "",
  planejamentoProximaSessao: "",
  observacoesGerais: "",
};

interface Props { value: string; onChange: (val: string) => void; }

function CheckItem({ id, label, checked, onCheckedChange }: { id: string; label: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onCheckedChange(!!v)} />
      <Label htmlFor={id} className="text-sm cursor-pointer">{label}</Label>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-primary border-b border-border pb-1 mt-4 mb-2">{children}</h3>;
}

function TextArea({ label, value, onChange, rows = 3, placeholder }: { label?: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <div>
      {label && <label className="text-xs font-medium text-foreground mb-1 block">{label}</label>}
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" />
    </div>
  );
}

export default function EvolucaoForm({ value, onChange }: Props) {
  const [data, setData] = useState<EvolucaoData>(() => {
    try { return { ...defaultEvolucao, ...JSON.parse(value) }; } catch { return defaultEvolucao; }
  });

  const updateAndEmit = (patch: Partial<EvolucaoData>) => {
    setData((d) => {
      const next = { ...d, ...patch };
      onChange(JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="space-y-1">
      <SectionTitle>1. Número da Sessão</SectionTitle>
      <input type="text" value={data.sessaoNumero} onChange={(e) => updateAndEmit({ sessaoNumero: e.target.value })} placeholder="Ex: 12" className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />

      <SectionTitle>2. Apresentação do Paciente</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
        {([
          ["orientado", "Orientado"], ["cooperativo", "Cooperativo"], ["agitado", "Agitado"],
          ["sonolento", "Sonolento"], ["ansioso", "Ansioso"], ["choroso", "Choroso"],
          ["irritado", "Irritado"], ["calmo", "Calmo"], ["comunicativo", "Comunicativo"],
          ["resistente", "Resistente"],
        ] as const).map(([key, label]) => (
          <CheckItem key={key} id={`ap-${key}`} label={label} checked={data.apresentacao[key]} onCheckedChange={(v) => updateAndEmit({ apresentacao: { ...data.apresentacao, [key]: v } })} />
        ))}
      </div>
      <TextArea label="Outros" value={data.apresentacao.outros} onChange={(v) => updateAndEmit({ apresentacao: { ...data.apresentacao, outros: v } })} rows={2} />

      <SectionTitle>3. Tema Abordado na Sessão</SectionTitle>
      <TextArea value={data.temaAbordado} onChange={(v) => updateAndEmit({ temaAbordado: v })} placeholder="Principais temas discutidos durante a sessão..." rows={4} />

      <SectionTitle>4. Técnicas Utilizadas</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
        {([
          ["escutaAtiva", "Escuta Ativa"], ["reestruturacaoCognitiva", "Reestruturação Cognitiva"], ["psicoeducacao", "Psicoeducação"],
          ["relaxamento", "Relaxamento"], ["rolePlay", "Role Play"], ["dessensibilizacao", "Dessensibilização"],
          ["interpretacao", "Interpretação"], ["confrontacao", "Confrontação"], ["tarefaDeCasa", "Tarefa de Casa"],
        ] as const).map(([key, label]) => (
          <CheckItem key={key} id={`tc-${key}`} label={label} checked={data.tecnicasUtilizadas[key]} onCheckedChange={(v) => updateAndEmit({ tecnicasUtilizadas: { ...data.tecnicasUtilizadas, [key]: v } })} />
        ))}
      </div>
      <TextArea label="Outras técnicas" value={data.tecnicasUtilizadas.outros} onChange={(v) => updateAndEmit({ tecnicasUtilizadas: { ...data.tecnicasUtilizadas, outros: v } })} rows={2} />

      <SectionTitle>5. Observações Clínicas</SectionTitle>
      <TextArea value={data.observacoesClinicas} onChange={(v) => updateAndEmit({ observacoesClinicas: v })} placeholder="Comportamento, falas relevantes, reações emocionais..." rows={4} />

      <SectionTitle>6. Evolução Percebida</SectionTitle>
      <div className="flex gap-4 mb-2">
        {([
          ["melhora", "Melhora"], ["estavel", "Estável"], ["piora", "Piora"],
        ] as const).map(([key, label]) => (
          <CheckItem key={key} id={`ev-${key}`} label={label} checked={data.evolucaoPercebida[key]} onCheckedChange={(v) => updateAndEmit({ evolucaoPercebida: { ...data.evolucaoPercebida, [key]: v } })} />
        ))}
      </div>
      <TextArea label="Observação" value={data.evolucaoPercebida.observacao} onChange={(v) => updateAndEmit({ evolucaoPercebida: { ...data.evolucaoPercebida, observacao: v } })} rows={2} />

      <SectionTitle>7. Encaminhamentos</SectionTitle>
      <TextArea value={data.encaminhamentos} onChange={(v) => updateAndEmit({ encaminhamentos: v })} placeholder="Psiquiatria, exames, outros profissionais..." rows={2} />

      <SectionTitle>8. Planejamento Próxima Sessão</SectionTitle>
      <TextArea value={data.planejamentoProximaSessao} onChange={(v) => updateAndEmit({ planejamentoProximaSessao: v })} placeholder="Temas a abordar, técnicas planejadas..." rows={3} />

      <SectionTitle>9. Observações Gerais</SectionTitle>
      <TextArea value={data.observacoesGerais} onChange={(v) => updateAndEmit({ observacoesGerais: v })} placeholder="Anotações adicionais..." rows={3} />
    </div>
  );
}
