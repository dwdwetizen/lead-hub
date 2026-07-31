import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { AppShell, SearchInput } from "@/components/layout/AppShell";
import { CompactLeadRow } from "@/components/prospeccao/CompactLeadRow";
import { LeadDetailsPanel } from "@/components/shared/LeadDetailsPanel";
import { ResponsiveBottomSheet } from "@/components/shared/ResponsiveBottomSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Lead } from "@/types/lead";
import {
  agendarRetorno,
  arquivarLead,
  criarLead,
  gerarLeadsOnline,
  registrarNaoAtendeu,
  registrarSemInteresse,
  restaurarLead,
  useLeads,
  usePerfil,
  usuario,
  type NovoLeadInput,
} from "@/services/leadService";

export const Route = createFileRoute("/prospeccao")({
  head: () => ({
    meta: [
      { title: "Prospecção | LocalWay OS" },
      {
        name: "description",
        content:
          "Prospecção presencial e online de empresas locais com urgência automática, retorno agendado e arquivamento.",
      },
      { property: "og:title", content: "Prospecção | LocalWay OS" },
      {
        property: "og:description",
        content: "Gerencie leads presenciais e online em uma lista compacta e rápida.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProspeccaoPage,
});

type Aba = "presencial" | "online" | "arquivados";

const vazio: NovoLeadInput = {
  empresa: "",
  segmento: "",
  cidade: "",
  endereco: "",
  telefone: "",
  whatsapp: "",
  contato: "",
  decisor: "",
  email: "",
  observacoes: "",
};

function ProspeccaoPage() {
  const leads = useLeads();
  const perfil = usePerfil();
  const [aba, setAba] = useState<Aba>("presencial");
  const [busca, setBusca] = useState("");
  const [cadastroAberto, setCadastroAberto] = useState(false);
  const [form, setForm] = useState<NovoLeadInput>(vazio);
  const [detalhe, setDetalhe] = useState<Lead | null>(null);
  const [gerando, setGerando] = useState(false);
  const [online, setOnline] = useState({ segmento: "", local: "", quantidade: 5 });

  const visiveis = useMemo(
    () => (perfil === "gestao" ? leads : leads.filter((l) => l.responsavel === usuario.nome)),
    [leads, perfil],
  );

  const filtrar = (lista: Lead[]) => {
    const q = busca.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((l) =>
      [l.empresa, l.decisor, l.contato, l.telefone, l.whatsapp, l.segmento]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  };

  const presenciais = filtrar(
    visiveis.filter((l) => l.modulo === "prospeccao" && l.origem === "presencial"),
  );
  const onlines = filtrar(visiveis.filter((l) => l.modulo === "prospeccao" && l.origem === "online"));
  const arquivados = filtrar(visiveis.filter((l) => l.modulo === "arquivado"));

  const abas: { id: Aba; label: string; count: number }[] = [
    { id: "presencial", label: "Presencial", count: presenciais.length },
    { id: "online", label: "Online", count: onlines.length },
    { id: "arquivados", label: "Arquivados", count: arquivados.length },
  ];

  const handlers = {
    onNaoAtendeu: async (lead: Lead) => {
      await registrarNaoAtendeu(lead.id);
      toast.success("Nova tentativa agendada para amanhã", { description: lead.empresa });
    },
    onRetornar: async (lead: Lead, data: string, obs?: string) => {
      await agendarRetorno(lead.id, data, obs);
      toast.success("Retorno agendado — lead enviado ao Follow-up", { description: lead.empresa });
    },
    onSemInteresse: async (lead: Lead, obs?: string) => {
      await registrarSemInteresse(lead.id, obs);
      toast("Resultado registrado: sem interesse", { description: lead.empresa });
    },
    onArquivar: async (lead: Lead) => {
      await arquivarLead(lead.id);
      toast.success("Lead arquivado", { description: "Disponível na aba Arquivados." });
    },
    onOpen: (lead: Lead) => setDetalhe(lead),
  };

  async function salvarLead() {
    if (!form.empresa.trim()) {
      toast.error("Informe o nome da empresa");
      return;
    }
    await criarLead(form);
    setForm(vazio);
    setCadastroAberto(false);
    setAba("presencial");
    toast.success("Lead cadastrado com sucesso");
  }

  async function gerar() {
    if (!online.segmento.trim() || !online.local.trim()) {
      toast.error("Informe segmento e cidade ou bairro");
      return;
    }
    setGerando(true);
    const novos = await gerarLeadsOnline(online);
    setGerando(false);
    toast.success(`${novos.length} empresas encontradas`, {
      description: "Pronto para receber dados reais do Google Places.",
    });
  }

  const lista = aba === "presencial" ? presenciais : aba === "online" ? onlines : arquivados;

  return (
    <AppShell
      title="Prospecção"
      subtitle="Leads presenciais e online em andamento"
      actions={
        <Button size="sm" className="h-9" onClick={() => setCadastroAberto(true)}>
          <Plus className="size-4" /> <span className="hidden sm:inline">Cadastrar lead</span>
        </Button>
      }
    >
      <div className="space-y-3">
        <div className="no-scrollbar -mx-3 flex gap-1.5 overflow-x-auto px-3 sm:mx-0 sm:px-0">
          {abas.map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={cn(
                "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md border px-3 text-[12px] font-medium transition-colors",
                aba === a.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface hover:bg-secondary",
              )}
            >
              {a.label}
              <span
                className={cn(
                  "rounded px-1 text-[10px] tabular-nums",
                  aba === a.id ? "bg-primary-foreground/20" : "bg-secondary text-muted-foreground",
                )}
              >
                {a.count}
              </span>
            </button>
          ))}
          <div className="ml-auto hidden w-64 sm:block">
            <SearchInput value={busca} onChange={setBusca} placeholder="Buscar empresa, contato..." />
          </div>
        </div>
        <div className="sm:hidden">
          <SearchInput value={busca} onChange={setBusca} placeholder="Buscar empresa, contato..." />
        </div>

        {aba === "online" && (
          <div className="grid gap-2 rounded-lg border bg-surface p-3 sm:grid-cols-[1fr_1fr_120px_auto]">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Segmento</Label>
              <Input
                value={online.segmento}
                onChange={(e) => setOnline((o) => ({ ...o, segmento: e.target.value }))}
                placeholder="Ex.: Pizzaria"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Cidade ou bairro</Label>
              <Input
                value={online.local}
                onChange={(e) => setOnline((o) => ({ ...o, local: e.target.value }))}
                placeholder="Ex.: Cambuí, Campinas"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Quantidade</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={online.quantidade}
                onChange={(e) =>
                  setOnline((o) => ({ ...o, quantidade: Math.min(10, Number(e.target.value) || 1) }))
                }
              />
            </div>
            <div className="flex items-end">
              <Button className="h-9 w-full sm:w-auto" onClick={gerar} disabled={gerando}>
                {gerando ? "Buscando..." : "Gerar leads"}
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border bg-surface">
          {lista.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">
              {aba === "arquivados"
                ? "Nenhum lead arquivado."
                : "Nenhum lead encontrado com os filtros atuais."}
            </p>
          ) : (
            lista.map((lead) =>
              aba === "arquivados" ? (
                <CompactLeadRow
                  key={lead.id}
                  lead={lead}
                  onOpen={handlers.onOpen}
                  onRestaurar={async (l) => {
                    await restaurarLead(l.id);
                    toast.success("Lead restaurado");
                  }}
                />
              ) : (
                <CompactLeadRow key={lead.id} lead={lead} {...handlers} />
              ),
            )
          )}
        </div>
      </div>

      <ResponsiveBottomSheet
        open={cadastroAberto}
        onOpenChange={setCadastroAberto}
        title="Cadastrar lead"
        description="Prospecção presencial"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" className="h-10 flex-1" onClick={() => setCadastroAberto(false)}>
              Cancelar
            </Button>
            <Button className="h-10 flex-1" onClick={salvarLead}>
              Salvar lead
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["empresa", "Empresa", true],
              ["segmento", "Segmento", false],
              ["cidade", "Cidade", false],
              ["endereco", "Endereço", true],
              ["telefone", "Telefone", false],
              ["whatsapp", "WhatsApp", false],
              ["contato", "Funcionário ou atendente", true],
              ["decisor", "Nome do decisor", true],
              ["email", "E-mail", true],
            ] as [keyof NovoLeadInput, string, boolean][]
          ).map(([campo, label, full]) => (
            <div key={campo} className={full ? "col-span-2 space-y-1" : "space-y-1"}>
              <Label className="text-[11px] text-muted-foreground">{label}</Label>
              <Input
                value={form[campo]}
                onChange={(e) => setForm((f) => ({ ...f, [campo]: e.target.value }))}
              />
            </div>
          ))}
          <div className="col-span-2 space-y-1">
            <Label className="text-[11px] text-muted-foreground">Observações</Label>
            <Textarea
              className="min-h-[70px] resize-none"
              value={form.observacoes}
              onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
            />
          </div>
        </div>
      </ResponsiveBottomSheet>

      <LeadDetailsPanel
        lead={detalhe}
        open={!!detalhe}
        onOpenChange={(o) => !o && setDetalhe(null)}
      />
    </AppShell>
  );
}
