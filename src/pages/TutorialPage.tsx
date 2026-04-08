import { useState } from "react";
import { DashboardLayout } from "@/components/clinic/DashboardLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BookOpen, Users, Calendar, DollarSign, ClipboardList, FileText, MessageCircle,
  Video, Headphones, FileCheck, ListChecks, Receipt, Megaphone, Cake, Settings,
  ChevronDown, ChevronRight, Sparkles, Heart, Shield, Eye, LogIn, Bell,
  Smartphone, Star, CheckCircle2, Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ElementType;
  tips?: string[];
}

interface TutorialSection {
  title: string;
  icon: React.ElementType;
  color: string;
  steps: TutorialStep[];
}

const doctorSections: TutorialSection[] = [
  {
    title: "Login e Acesso",
    icon: LogIn,
    color: "text-primary",
    steps: [
      {
        title: "Acessando o sistema",
        description: "Na tela de login, insira seu e-mail e senha cadastrados. O sistema possui proteção contra tentativas excessivas de login e expiração de sessão por inatividade para sua segurança.",
        icon: Shield,
        tips: ["Use uma senha forte com letras, números e caracteres especiais", "Sua sessão expira automaticamente após inatividade prolongada"]
      }
    ]
  },
  {
    title: "Dashboard",
    icon: Star,
    color: "text-magic-gold",
    steps: [
      {
        title: "Visão geral do painel",
        description: "O Dashboard é sua página inicial. Nele você encontra um resumo completo: total de pacientes, consultas do dia, receita do mês, consultas pendentes e gráficos de evolução financeira.",
        icon: Eye,
        tips: ["Acompanhe os gráficos de receita para entender a saúde financeira da clínica", "Os cards superiores mostram métricas rápidas do seu dia"]
      }
    ]
  },
  {
    title: "Pacientes",
    icon: Users,
    color: "text-magic-blue",
    steps: [
      {
        title: "Cadastrar novo paciente",
        description: "Clique em 'Novo Paciente' para abrir o formulário. Preencha nome, e-mail, telefone, CPF, data de nascimento, endereço e convênio. Todos os dados são armazenados com segurança.",
        icon: Users,
        tips: ["O CPF é validado automaticamente", "A data de nascimento é usada para alertas de aniversário"]
      },
      {
        title: "Buscar e gerenciar pacientes",
        description: "Use a barra de busca para encontrar pacientes por nome, e-mail, telefone ou CPF. Você pode editar ou excluir registros a qualquer momento.",
        icon: Eye,
        tips: ["A busca funciona em tempo real conforme você digita"]
      }
    ]
  },
  {
    title: "Agenda",
    icon: Calendar,
    color: "text-magic-lavender",
    steps: [
      {
        title: "Criar agendamento",
        description: "Na página de Agenda, clique em 'Novo Agendamento'. Selecione o paciente, data, horário, tipo de consulta e adicione observações se necessário.",
        icon: Calendar,
        tips: ["Tipos disponíveis: Consulta, Retorno, Teleconsulta, Avaliação, Procedimento", "Você pode cancelar ou reagendar a qualquer momento"]
      },
      {
        title: "Visualizar compromissos",
        description: "A agenda mostra todos os compromissos do dia selecionado. Use o calendário lateral para navegar entre os dias. Cada consulta mostra status, horário e tipo.",
        icon: Eye,
        tips: ["Consultas canceladas aparecem riscadas", "O paciente pode confirmar ou cancelar pelo portal"]
      }
    ]
  },
  {
    title: "Financeiro",
    icon: DollarSign,
    color: "text-success",
    steps: [
      {
        title: "Registrar transação",
        description: "Adicione receitas e despesas com descrição, valor, data, categoria e forma de pagamento. As categorias incluem: Consulta, Procedimento, Convênio, Aluguel, Material, Salário e Outros.",
        icon: DollarSign,
        tips: ["Use filtros por período, tipo e categoria para análises detalhadas", "O gráfico mensal ajuda a visualizar tendências"]
      }
    ]
  },
  {
    title: "Prontuários",
    icon: ClipboardList,
    color: "text-magic-rose",
    steps: [
      {
        title: "Criar prontuário",
        description: "Selecione um paciente e crie prontuários com anamnese completa, evoluções clínicas e anotações. Cada entrada é registrada com data e hora automaticamente.",
        icon: ClipboardList,
        tips: ["A anamnese inclui: queixa principal, histórico, alergias, medicamentos e mais", "As evoluções podem ser adicionadas a cada consulta"]
      }
    ]
  },
  {
    title: "Recibos",
    icon: FileText,
    color: "text-info",
    steps: [
      {
        title: "Gerar recibo",
        description: "Crie recibos profissionais selecionando o paciente, valor, descrição do serviço e forma de pagamento. Os recibos podem ser impressos diretamente.",
        icon: FileText,
        tips: ["O recibo usa os dados da clínica configurados em Configurações", "Clique em 'Imprimir' para gerar uma versão formatada"]
      }
    ]
  },
  {
    title: "Mensagens",
    icon: MessageCircle,
    color: "text-primary",
    steps: [
      {
        title: "Conversas com Doutores",
        description: "Na aba 'Conversas', troque mensagens com os doutores da clínica. Selecione o doutor na lista lateral e envie mensagens, imagens, arquivos e emojis. Mensagens não lidas aparecem com badge no menu.",
        icon: MessageCircle,
        tips: ["Indicador de presença (online/offline) aparece ao lado de cada doutor", "Suporte a emojis, imagens e arquivos anexados"]
      },
      {
        title: "Avisos / Mural",
        description: "Na aba 'Avisos / Mural', publique comunicados para pacientes. Use o editor rico para formatar textos, anexar imagens e arquivos. Os avisos aparecem no Portal do Paciente.",
        icon: Megaphone,
        tips: ["Selecione quais doutores receberão cópia do aviso", "Imagens e arquivos podem ser anexados ao aviso"]
      }
    ]
  },
  {
    title: "Suporte Pacientes",
    icon: Headphones,
    color: "text-info",
    steps: [
      {
        title: "Gerenciar chats de suporte",
        description: "Na página 'Suporte Pacientes', veja todos os chamados abertos por pacientes. Assuma um chamado clicando em 'Assumir' — uma mensagem automática é enviada ao paciente: 'Crystian Suporte assumiu o ticket, como posso te ajudar?'.",
        icon: Headphones,
        tips: ["Filtre por status: Todos, Abertos, Ativos, Fechados", "A busca permite localizar pacientes rapidamente"]
      },
      {
        title: "Iniciar chat com paciente",
        description: "Clique no botão 'Novo Chat' para abrir uma conversa com qualquer paciente cadastrado. Se já existe um chat com aquele paciente, ele é reaberto automaticamente sem duplicar.",
        icon: MessageCircle,
        tips: ["Cada paciente aparece apenas uma vez na lista", "Use a lixeirinha para ocultar chats — as mensagens ficam salvas e o chat reaparece se o paciente enviar nova mensagem"]
      },
      {
        title: "Enviar mensagens e arquivos",
        description: "No chat, envie texto, imagens e arquivos. O nome exibido ao paciente será 'Crystian Suporte'. Use emojis para tornar a conversa mais amigável.",
        icon: Send,
        tips: ["Arquivos de até 10MB são suportados", "Todo o histórico de conversas fica salvo mesmo após ocultar o chat"]
      }
    ]
  },
  {
    title: "Teleconsulta",
    icon: Video,
    color: "text-magic-blue",
    steps: [
      {
        title: "Iniciar teleconsulta",
        description: "Crie uma sala de teleconsulta selecionando o paciente. Um link é gerado automaticamente para compartilhar. A videochamada funciona diretamente no navegador.",
        icon: Video,
        tips: ["Compartilhe o link da sala com o paciente", "Verifique câmera e microfone antes de iniciar"]
      }
    ]
  },
  {
    title: "Atestados",
    icon: FileCheck,
    color: "text-magic-gold",
    steps: [
      {
        title: "Emitir atestado",
        description: "Selecione o paciente, defina o período de afastamento, CID (opcional) e observações. O atestado é gerado com os dados profissionais do médico e pode ser impresso.",
        icon: FileCheck,
        tips: ["O CID é opcional mas recomendado", "Atestados ficam registrados no histórico do paciente"]
      }
    ]
  },
  {
    title: "Atividades",
    icon: ListChecks,
    color: "text-magic-lavender",
    steps: [
      {
        title: "Gerenciar tarefas",
        description: "Crie e organize suas tarefas diárias. Defina título, prioridade (baixa, média, alta) e marque como concluídas ao finalizar.",
        icon: ListChecks,
        tips: ["Tarefas de alta prioridade são destacadas em vermelho", "Use filtros para ver apenas tarefas pendentes"]
      }
    ]
  },
  {
    title: "Notas Fiscais",
    icon: Receipt,
    color: "text-success",
    steps: [
      {
        title: "Gerar nota fiscal",
        description: "Crie notas fiscais com dados do paciente, descrição do serviço, valor e impostos. As notas podem ser impressas ou salvas.",
        icon: Receipt,
        tips: ["Configure os dados fiscais da clínica em Configurações"]
      }
    ]
  },
  {
    title: "Avisos para Pacientes",
    icon: Megaphone,
    color: "text-magic-rose",
    steps: [
      {
        title: "Criar aviso",
        description: "Publique avisos que aparecem no Portal do Paciente. Adicione título, conteúdo formatado com editor rico e anexe imagens. Os pacientes podem expandir os avisos para ler mais e ampliar imagens.",
        icon: Megaphone,
        tips: ["Use o editor rico para formatar textos com negrito, listas, etc.", "Imagens anexadas podem ser ampliadas pelos pacientes"]
      }
    ]
  },
  {
    title: "Aniversários",
    icon: Cake,
    color: "text-magic-gold",
    steps: [
      {
        title: "Acompanhar aniversários",
        description: "Veja automaticamente quais pacientes fazem aniversário no mês atual. Aniversariantes do dia aparecem destacados e também nas notificações do sino.",
        icon: Cake,
        tips: ["Envie uma mensagem especial pelo sistema de Mensagens"]
      }
    ]
  },
  {
    title: "Configurações",
    icon: Settings,
    color: "text-muted-foreground",
    steps: [
      {
        title: "Personalizar clínica",
        description: "Configure nome da clínica, nome do médico, CRP/CRM, telefone, e-mail, endereço, CNPJ e logotipo. Os campos de telefone, CNPJ e CRP são formatados automaticamente enquanto digita.",
        icon: Settings,
        tips: ["Telefone: (00) 00000-0000", "CNPJ: 00.000.000/0000-00", "CRP: CRP 00/00000", "Essas informações aparecem nos recibos, atestados e notas fiscais"]
      }
    ]
  }
];

const patientSections: TutorialSection[] = [
  {
    title: "Acessando o Portal",
    icon: LogIn,
    color: "text-primary",
    steps: [
      {
        title: "Como acessar",
        description: "O Portal do Paciente é acessível através do link fornecido pela clínica. Insira seu CPF para acessar suas informações, consultas e mensagens.",
        icon: Shield,
        tips: ["Use o CPF cadastrado na clínica", "O acesso é seguro e seus dados são protegidos"]
      }
    ]
  },
  {
    title: "Minhas Consultas",
    icon: Calendar,
    color: "text-magic-lavender",
    steps: [
      {
        title: "Ver agendamentos",
        description: "Na aba 'Consultas', veja todas as suas consultas agendadas com data, horário, tipo e status. Consultas futuras e passadas ficam organizadas cronologicamente.",
        icon: Calendar,
        tips: ["Consultas confirmadas aparecem em verde", "Consultas canceladas aparecem riscadas"]
      },
      {
        title: "Confirmar ou cancelar consulta",
        description: "Para cada consulta agendada, você pode confirmar sua presença clicando em 'Confirmar' ou cancelar clicando em 'Cancelar'. O médico recebe uma notificação automática.",
        icon: CheckCircle2,
        tips: ["Confirme com antecedência para ajudar a organização da clínica", "Ao cancelar, o horário fica disponível para outros pacientes"]
      }
    ]
  },
  {
    title: "Mensagens",
    icon: MessageCircle,
    color: "text-magic-blue",
    steps: [
      {
        title: "Conversar com Doutores",
        description: "Na aba 'Mensagens', selecione um doutor na lista de contatos para iniciar uma conversa. Envie texto, emojis e veja o status online/offline de cada profissional.",
        icon: MessageCircle,
        tips: ["Mensagens não lidas aparecem com badge na aba", "O indicador verde mostra quando o doutor está online"]
      },
      {
        title: "Conversar com o Suporte",
        description: "Na mesma aba 'Mensagens', clique em 'Suporte' na lista de contatos para falar com a equipe de suporte. Você também pode usar o balãozinho de chat flutuante no canto inferior direito.",
        icon: Headphones,
        tips: ["As mensagens do suporte aparecem tanto no balãozinho quanto na aba de mensagens", "Todo o histórico fica salvo automaticamente"]
      }
    ]
  },
  {
    title: "Avisos da Clínica",
    icon: Megaphone,
    color: "text-magic-rose",
    steps: [
      {
        title: "Ver avisos",
        description: "Na aba 'Avisos', veja comunicados importantes da clínica. Clique em um aviso para expandir e ler o conteúdo completo. Se houver imagens, clique nelas para ampliar.",
        icon: Megaphone,
        tips: ["Avisos podem conter imagens que podem ser ampliadas com um clique", "Fique atento a avisos sobre horários especiais ou mudanças"]
      }
    ]
  },
  {
    title: "Atividades",
    icon: ListChecks,
    color: "text-magic-lavender",
    steps: [
      {
        title: "Ver atividades atribuídas",
        description: "Na aba 'Atividades', veja as tarefas que o doutor atribuiu para você (exercícios, leituras, etc). Marque como concluídas e envie fotos ou arquivos quando solicitado.",
        icon: ListChecks,
        tips: ["Atividades pendentes aparecem com badge na aba", "Envie fotos ou arquivos conforme orientação do profissional"]
      }
    ]
  },
  {
    title: "Financeiro",
    icon: DollarSign,
    color: "text-success",
    steps: [
      {
        title: "Acompanhar pagamentos",
        description: "Na aba 'Financeiro', veja cobranças pendentes, pagamentos realizados e configure dados para nota fiscal (CPF e CEP formatados automaticamente).",
        icon: DollarSign,
        tips: ["CPF: 000.000.000-00", "CEP: 00000-000", "Ative a opção de nota fiscal para receber automaticamente"]
      }
    ]
  },
  {
    title: "Meus Dados e Senha",
    icon: Shield,
    color: "text-magic-gold",
    steps: [
      {
        title: "Visualizar e atualizar perfil",
        description: "Na aba 'Perfil', veja suas informações cadastrais. Você pode trocar sua senha informando a senha atual e a nova senha (mínimo 6 caracteres).",
        icon: Users,
        tips: ["Para atualizar outros dados, entre em contato com a clínica", "Telefone no cadastro é formatado automaticamente: (00) 00000-0000"]
      }
    ]
  }
];

function AccordionSection({ section, index }: { section: TutorialSection; index: number }) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 md:p-5 text-left hover:bg-accent/30 transition-colors"
      >
        <div className={`h-10 w-10 rounded-xl bg-accent/50 flex items-center justify-center shrink-0 ${section.color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-foreground">{section.title}</h3>
          <p className="text-xs text-muted-foreground">{section.steps.length} passo(s)</p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-4">
              {section.steps.map((step, si) => {
                const StepIcon = step.icon;
                return (
                  <div key={si} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-lg magic-gradient text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                        {si + 1}
                      </div>
                      {si < section.steps.length - 1 && <div className="w-0.5 flex-1 bg-border/50 mt-1" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                      {step.tips && step.tips.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {step.tips.map((tip, ti) => (
                            <div key={ti} className="flex items-start gap-2 text-xs text-muted-foreground bg-accent/30 rounded-lg px-3 py-2">
                              <Sparkles className="h-3.5 w-3.5 text-magic-gold shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function TutorialPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/50 text-sm text-accent-foreground mb-2">
            <BookOpen className="h-4 w-4" />
            Central de Ajuda
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
            Tutorial do Sistema <Sparkles className="inline h-6 w-6 text-magic-gold" />
          </h1>
          <p className="text-muted-foreground">Aprenda passo a passo como usar cada funcionalidade</p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="doctor" className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-12 rounded-2xl bg-muted/50 p-1">
            <TabsTrigger value="doctor" className="rounded-xl data-[state=active]:magic-gradient data-[state=active]:text-primary-foreground font-medium flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Para o Médico
            </TabsTrigger>
            <TabsTrigger value="patient" className="rounded-xl data-[state=active]:magic-gradient data-[state=active]:text-primary-foreground font-medium flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Para o Paciente
            </TabsTrigger>
          </TabsList>

          <TabsContent value="doctor" className="mt-6 space-y-3">
            <div className="glass-card rounded-2xl p-4 mb-4 border-l-4 border-primary">
              <p className="text-sm text-foreground font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-magic-gold" />
                Guia completo para médicos e profissionais
              </p>
              <p className="text-xs text-muted-foreground mt-1">Clique em cada seção para expandir o passo a passo detalhado.</p>
            </div>
            {doctorSections.map((section, i) => (
              <AccordionSection key={i} section={section} index={i} />
            ))}
          </TabsContent>

          <TabsContent value="patient" className="mt-6 space-y-3">
            <div className="glass-card rounded-2xl p-4 mb-4 border-l-4 border-magic-rose">
              <p className="text-sm text-foreground font-medium flex items-center gap-2">
                <Heart className="h-4 w-4 text-magic-rose" />
                Guia completo para pacientes
              </p>
              <p className="text-xs text-muted-foreground mt-1">Aprenda a usar o Portal do Paciente de forma simples e rápida.</p>
            </div>
            {patientSections.map((section, i) => (
              <AccordionSection key={i} section={section} index={i} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
