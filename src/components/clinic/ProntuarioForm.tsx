import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface ProntuarioData {
  dadosPessoais: {
    escolaridade: string;
    profissao: string;
    estadoCivil: string;
    religiao: string;
    encaminhadoPor: string;
  };
  motivoConsulta: string;
  diagnosticoPrevio: string;
  tratamentosAnteriores: string;
  sintomasAtuais: {
    insonia: boolean;
    ansiedade: boolean;
    depressao: boolean;
    irritabilidade: boolean;
    faltaConcentracao: boolean;
    alteracaoApetite: boolean;
    isolamentoSocial: boolean;
    pensamentosSuicidas: boolean;
    autolesao: boolean;
    compulsao: boolean;
    fobias: boolean;
    panico: boolean;
    outros: string;
  };
  avaliacaoPsicologica: string;
  objetivosTerapeuticos: string;
  abordagemUtilizada: string;
  frequenciaSessoes: string;
  observacoesIniciais: string;
  contratoTerapeutico: {
    horarioDefinido: boolean;
    valorAcordado: boolean;
    sigiloExplicado: boolean;
    regrasDefinidas: boolean;
  };
}

const defaultProntuario: ProntuarioData = {
  dadosPessoais: { escolaridade: "", profissao: "", estadoCivil: "", religiao: "", encaminhadoPor: "" },
  motivoConsulta: "",
  diagnosticoPrevio: "",
  tratamentosAnteriores: "",
  sintomasAtuais: { insonia: false, ansiedade: false, depressao: false, irritabilidade: false, faltaConcentracao: false, alteracaoApetite: false, isolamentoSocial: false, pensamentosSuicidas: false, autolesao: false, compulsao: false, fobias: false, panico: false, outros: "" },
  avaliacaoPsicologica: "",
  objetivosTerapeuticos: "",
  abordagemUtilizada: "",
  frequenciaSessoes: "",
  observacoesIniciais: "",
  contratoTerapeutico: { horarioDefinido: false, valorAcordado: false, sigiloExplicado: false, regrasDefinidas: false },
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

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-foreground mb-1 block">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}

export default function ProntuarioForm({ value, onChange }: Props) {
  const [data, setData] = useState<ProntuarioData>(() => {
    try { return { ...defaultProntuario, ...JSON.parse(value) }; } catch { return defaultProntuario; }
  });

  const updateAndEmit = (patch: Partial<ProntuarioData>) => {
    setData((d) => {
      const next = { ...d, ...patch };
      onChange(JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="space-y-1">
      <SectionTitle>1. Dados Complementares</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Escolaridade" value={data.dadosPessoais.escolaridade} onChange={(v) => updateAndEmit({ dadosPessoais: { ...data.dadosPessoais, escolaridade: v } })} />
        <InputField label="Profissão" value={data.dadosPessoais.profissao} onChange={(v) => updateAndEmit({ dadosPessoais: { ...data.dadosPessoais, profissao: v } })} />
        <InputField label="Estado Civil" value={data.dadosPessoais.estadoCivil} onChange={(v) => updateAndEmit({ dadosPessoais: { ...data.dadosPessoais, estadoCivil: v } })} />
        <InputField label="Religião" value={data.dadosPessoais.religiao} onChange={(v) => updateAndEmit({ dadosPessoais: { ...data.dadosPessoais, religiao: v } })} />
      </div>
      <InputField label="Encaminhado por" value={data.dadosPessoais.encaminhadoPor} onChange={(v) => updateAndEmit({ dadosPessoais: { ...data.dadosPessoais, encaminhadoPor: v } })} placeholder="Nome do profissional ou instituição" />

      <SectionTitle>2. Motivo da Consulta</SectionTitle>
      <TextArea value={data.motivoConsulta} onChange={(v) => updateAndEmit({ motivoConsulta: v })} placeholder="Motivo que levou o paciente a buscar atendimento..." rows={3} />

      <SectionTitle>3. Diagnóstico Prévio</SectionTitle>
      <TextArea value={data.diagnosticoPrevio} onChange={(v) => updateAndEmit({ diagnosticoPrevio: v })} placeholder="CID, diagnósticos anteriores..." rows={2} />

      <SectionTitle>4. Tratamentos Anteriores</SectionTitle>
      <TextArea value={data.tratamentosAnteriores} onChange={(v) => updateAndEmit({ tratamentosAnteriores: v })} placeholder="Psicoterapia anterior, internações, medicação..." rows={3} />

      <SectionTitle>5. Sintomas Atuais</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
        {([
          ["insonia", "Insônia"], ["ansiedade", "Ansiedade"], ["depressao", "Depressão"],
          ["irritabilidade", "Irritabilidade"], ["faltaConcentracao", "Falta de Concentração"], ["alteracaoApetite", "Alteração de Apetite"],
          ["isolamentoSocial", "Isolamento Social"], ["pensamentosSuicidas", "Pensamentos Suicidas"], ["autolesao", "Autolesão"],
          ["compulsao", "Compulsão"], ["fobias", "Fobias"], ["panico", "Pânico"],
        ] as const).map(([key, label]) => (
          <CheckItem key={key} id={`sa-${key}`} label={label} checked={data.sintomasAtuais[key]} onCheckedChange={(v) => updateAndEmit({ sintomasAtuais: { ...data.sintomasAtuais, [key]: v } })} />
        ))}
      </div>
      <TextArea label="Outros sintomas" value={data.sintomasAtuais.outros} onChange={(v) => updateAndEmit({ sintomasAtuais: { ...data.sintomasAtuais, outros: v } })} rows={2} />

      <SectionTitle>6. Avaliação Psicológica</SectionTitle>
      <TextArea value={data.avaliacaoPsicologica} onChange={(v) => updateAndEmit({ avaliacaoPsicologica: v })} placeholder="Impressões clínicas, comportamento, afeto, cognição..." rows={4} />

      <SectionTitle>7. Objetivos Terapêuticos</SectionTitle>
      <TextArea value={data.objetivosTerapeuticos} onChange={(v) => updateAndEmit({ objetivosTerapeuticos: v })} placeholder="Metas do tratamento..." rows={3} />

      <SectionTitle>8. Abordagem Utilizada</SectionTitle>
      <TextArea value={data.abordagemUtilizada} onChange={(v) => updateAndEmit({ abordagemUtilizada: v })} placeholder="TCC, Psicanálise, Humanista, Sistêmica..." rows={2} />

      <SectionTitle>9. Frequência das Sessões</SectionTitle>
      <TextArea value={data.frequenciaSessoes} onChange={(v) => updateAndEmit({ frequenciaSessoes: v })} placeholder="Semanal, quinzenal, mensal..." rows={1} />

      <SectionTitle>10. Contrato Terapêutico</SectionTitle>
      <div className="grid grid-cols-2 gap-2 mb-2">
        {([
          ["horarioDefinido", "Horário definido"], ["valorAcordado", "Valor acordado"],
          ["sigiloExplicado", "Sigilo explicado"], ["regrasDefinidas", "Regras de cancelamento"],
        ] as const).map(([key, label]) => (
          <CheckItem key={key} id={`ct-${key}`} label={label} checked={data.contratoTerapeutico[key]} onCheckedChange={(v) => updateAndEmit({ contratoTerapeutico: { ...data.contratoTerapeutico, [key]: v } })} />
        ))}
      </div>

      <SectionTitle>11. Observações Iniciais</SectionTitle>
      <TextArea value={data.observacoesIniciais} onChange={(v) => updateAndEmit({ observacoesIniciais: v })} placeholder="Observações relevantes do primeiro contato..." rows={3} />
    </div>
  );
}
