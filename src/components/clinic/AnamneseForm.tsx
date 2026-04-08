import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface AnamneseData {
  queixaPrincipal: string;
  historiaDoencaAtual: string;
  antecedentesPessoais: {
    hipertensao: boolean;
    diabetes: boolean;
    cardiopatia: boolean;
    asma: boolean;
    depressao: boolean;
    ansiedade: boolean;
    epilepsia: boolean;
    avc: boolean;
    cancer: boolean;
    tireoide: boolean;
    outros: string;
  };
  antecedentesFamiliares: {
    hipertensao: boolean;
    diabetes: boolean;
    cardiopatia: boolean;
    cancer: boolean;
    depressao: boolean;
    alzheimer: boolean;
    outros: string;
  };
  medicamentosEmUso: string;
  alergias: string;
  cirurgiasAnteriores: string;
  habitosDeVida: {
    tabagismo: boolean;
    etilismo: boolean;
    atividadeFisica: boolean;
    drogas: boolean;
    sonoAdequado: boolean;
    alimentacaoAdequada: boolean;
    observacoes: string;
  };
  historiaSocial: string;
  exameFisico: string;
  estadoEmocional: {
    ansioso: boolean;
    deprimido: boolean;
    irritado: boolean;
    apatico: boolean;
    agitado: boolean;
    calmo: boolean;
    colaborativo: boolean;
    resistente: boolean;
    outros: string;
  };
  hipoteseDiagnostica: string;
  condutaTerapeutica: string;
  observacoesGerais: string;
}

const defaultAnamnese: AnamneseData = {
  queixaPrincipal: "",
  historiaDoencaAtual: "",
  antecedentesPessoais: { hipertensao: false, diabetes: false, cardiopatia: false, asma: false, depressao: false, ansiedade: false, epilepsia: false, avc: false, cancer: false, tireoide: false, outros: "" },
  antecedentesFamiliares: { hipertensao: false, diabetes: false, cardiopatia: false, cancer: false, depressao: false, alzheimer: false, outros: "" },
  medicamentosEmUso: "",
  alergias: "",
  cirurgiasAnteriores: "",
  habitosDeVida: { tabagismo: false, etilismo: false, atividadeFisica: false, drogas: false, sonoAdequado: false, alimentacaoAdequada: false, observacoes: "" },
  historiaSocial: "",
  exameFisico: "",
  estadoEmocional: { ansioso: false, deprimido: false, irritado: false, apatico: false, agitado: false, calmo: false, colaborativo: false, resistente: false, outros: "" },
  hipoteseDiagnostica: "",
  condutaTerapeutica: "",
  observacoesGerais: "",
};

interface Props {
  value: string;
  onChange: (val: string) => void;
}

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

export default function AnamneseForm({ value, onChange }: Props) {
  const [data, setData] = useState<AnamneseData>(() => {
    try { return { ...defaultAnamnese, ...JSON.parse(value) }; } catch { return defaultAnamnese; }
  });

  const updateAndEmit = (patch: Partial<AnamneseData>) => {
    setData((d) => {
      const next = { ...d, ...patch };
      onChange(JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="space-y-1">
      <SectionTitle>1. Queixa Principal</SectionTitle>
      <TextArea value={data.queixaPrincipal} onChange={(v) => updateAndEmit({ queixaPrincipal: v })} placeholder="O que trouxe o paciente à consulta?" rows={2} />

      <SectionTitle>2. História da Doença Atual (HDA)</SectionTitle>
      <TextArea value={data.historiaDoencaAtual} onChange={(v) => updateAndEmit({ historiaDoencaAtual: v })} placeholder="Início, duração, intensidade, fatores de melhora/piora..." rows={4} />

      <SectionTitle>3. Antecedentes Pessoais</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
        {([
          ["hipertensao", "Hipertensão"], ["diabetes", "Diabetes"], ["cardiopatia", "Cardiopatia"],
          ["asma", "Asma/DPOC"], ["depressao", "Depressão"], ["ansiedade", "Ansiedade"],
          ["epilepsia", "Epilepsia"], ["avc", "AVC"], ["cancer", "Câncer"], ["tireoide", "Tireoide"],
        ] as const).map(([key, label]) => (
          <CheckItem key={key} id={`ap-${key}`} label={label} checked={data.antecedentesPessoais[key]} onCheckedChange={(v) => updateAndEmit({ antecedentesPessoais: { ...data.antecedentesPessoais, [key]: v } })} />
        ))}
      </div>
      <TextArea label="Outros antecedentes" value={data.antecedentesPessoais.outros} onChange={(v) => updateAndEmit({ antecedentesPessoais: { ...data.antecedentesPessoais, outros: v } })} rows={2} />

      <SectionTitle>4. Antecedentes Familiares</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
        {([
          ["hipertensao", "Hipertensão"], ["diabetes", "Diabetes"], ["cardiopatia", "Cardiopatia"],
          ["cancer", "Câncer"], ["depressao", "Depressão"], ["alzheimer", "Alzheimer"],
        ] as const).map(([key, label]) => (
          <CheckItem key={key} id={`af-${key}`} label={label} checked={data.antecedentesFamiliares[key]} onCheckedChange={(v) => updateAndEmit({ antecedentesFamiliares: { ...data.antecedentesFamiliares, [key]: v } })} />
        ))}
      </div>
      <TextArea label="Outros" value={data.antecedentesFamiliares.outros} onChange={(v) => updateAndEmit({ antecedentesFamiliares: { ...data.antecedentesFamiliares, outros: v } })} rows={2} />

      <SectionTitle>5. Medicamentos em Uso</SectionTitle>
      <TextArea value={data.medicamentosEmUso} onChange={(v) => updateAndEmit({ medicamentosEmUso: v })} placeholder="Liste os medicamentos, dosagens e frequência..." rows={3} />

      <SectionTitle>6. Alergias</SectionTitle>
      <TextArea value={data.alergias} onChange={(v) => updateAndEmit({ alergias: v })} placeholder="Medicamentos, alimentos, substâncias..." rows={2} />

      <SectionTitle>7. Cirurgias Anteriores</SectionTitle>
      <TextArea value={data.cirurgiasAnteriores} onChange={(v) => updateAndEmit({ cirurgiasAnteriores: v })} placeholder="Procedimentos cirúrgicos realizados e datas..." rows={2} />

      <SectionTitle>8. Hábitos de Vida</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
        {([
          ["tabagismo", "Tabagismo"], ["etilismo", "Etilismo"], ["atividadeFisica", "Atividade Física"],
          ["drogas", "Uso de Drogas"], ["sonoAdequado", "Sono Adequado"], ["alimentacaoAdequada", "Alimentação Adequada"],
        ] as const).map(([key, label]) => (
          <CheckItem key={key} id={`hv-${key}`} label={label} checked={data.habitosDeVida[key]} onCheckedChange={(v) => updateAndEmit({ habitosDeVida: { ...data.habitosDeVida, [key]: v } })} />
        ))}
      </div>
      <TextArea label="Observações" value={data.habitosDeVida.observacoes} onChange={(v) => updateAndEmit({ habitosDeVida: { ...data.habitosDeVida, observacoes: v } })} rows={2} />

      <SectionTitle>9. História Social</SectionTitle>
      <TextArea value={data.historiaSocial} onChange={(v) => updateAndEmit({ historiaSocial: v })} placeholder="Profissão, estado civil, moradia, relações familiares..." rows={3} />

      <SectionTitle>10. Estado Emocional</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
        {([
          ["ansioso", "Ansioso"], ["deprimido", "Deprimido"], ["irritado", "Irritado"],
          ["apatico", "Apático"], ["agitado", "Agitado"], ["calmo", "Calmo"],
          ["colaborativo", "Colaborativo"], ["resistente", "Resistente"],
        ] as const).map(([key, label]) => (
          <CheckItem key={key} id={`ee-${key}`} label={label} checked={data.estadoEmocional[key]} onCheckedChange={(v) => updateAndEmit({ estadoEmocional: { ...data.estadoEmocional, [key]: v } })} />
        ))}
      </div>
      <TextArea label="Outros" value={data.estadoEmocional.outros} onChange={(v) => updateAndEmit({ estadoEmocional: { ...data.estadoEmocional, outros: v } })} rows={2} />

      <SectionTitle>11. Exame Físico / Observações Clínicas</SectionTitle>
      <TextArea value={data.exameFisico} onChange={(v) => updateAndEmit({ exameFisico: v })} placeholder="Aparência geral, sinais vitais, observações relevantes..." rows={3} />

      <SectionTitle>12. Hipótese Diagnóstica</SectionTitle>
      <TextArea value={data.hipoteseDiagnostica} onChange={(v) => updateAndEmit({ hipoteseDiagnostica: v })} placeholder="CID, hipóteses diagnósticas..." rows={2} />

      <SectionTitle>13. Conduta Terapêutica</SectionTitle>
      <TextArea value={data.condutaTerapeutica} onChange={(v) => updateAndEmit({ condutaTerapeutica: v })} placeholder="Plano de tratamento, encaminhamentos, orientações..." rows={3} />

      <SectionTitle>14. Observações Gerais</SectionTitle>
      <TextArea value={data.observacoesGerais} onChange={(v) => updateAndEmit({ observacoesGerais: v })} placeholder="Anotações adicionais..." rows={3} />
    </div>
  );
}
