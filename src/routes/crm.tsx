import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Eye, KanbanSquare, List } from "lucide-react";
import { AppShell, SearchInput } from "@/components/layout/AppShell";
import { KanbanCard } from "@/components/crm/KanbanCard";
import { LeadDetailsPanel } from "@/components/shared/LeadDetailsPanel";
import { ArchiveConfirmation } from "@/components/shared/ArchiveConfirmation";
import { UrgencyBadge } from "@/components/shared/UrgencyBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency, diffDays } from "@/lib/date-utils";
import type { EtapaCRM, Lead } from "@/types/lead";
import {
  ETAPAS,
  etapaLabel,
  moverEtapa,
  registrarPagamento,
  useLocalWayState,
  usePerfil,
  usuario,
} from "@/services/leadService";

export const Route = createFileRoute("/crm")({
  head: () => ({
    meta: [
      { title: "CRM | LocalWay OS" },
      {
        name: "description",
        content:
          "Pipeline Kanban de vendas locais: reuniões, propostas, negociação e vendas pagas com métricas em tempo real.",
      },
      { property: "og:title", content: "CRM | LocalWay OS" },
      { property: "og:description", content: "Pipeline compacto com Kanban, lista e métricas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CrmPage,
});

function CrmPage() {
  const { leads, colaboradores } = useLocalWayState();
  const perfil = usePerfil();
  const podeMover = perfil === "gestao";
  const [visao, setVisao] = useState<"kanban" | "lista">("kanban");
  const [busca, setBusca] = useState("");
  const [colaborador, setColaborador] = useState("todos");
  const [periodo, setPeriodo] = useState("todos");
  const [etapaFiltro, setEtapaFiltro] = useState<"todas" | EtapaCRM>("todas");
  const [detalheId, setDetalheId] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState<Lead | null>(null);
  const [pagamento, setPagamento] = useState<Lead | null>(null);
  const [etapaMobile, setEtapaMobile] = useState<EtapaCRM>("reuniao_marcada");
  const detalhe = leads.find((lead) => lead.id === detalheId) ?? null;

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return leads
      .filter((l) => l.modulo === "crm")
      .filter((l) => (perfil === "gestao" ? true : l.responsavel === usuario.nome))
      .filter((l) => colaborador === "todos" || l.responsavel === colaborador)
      .filter((l) => etapaFiltro === "todas" || l.etapa === etapaFiltro)
      .filter((l) => {
        if (periodo === "todos") return true;
        const d = diffDays(l.etapaDesde);
        const dias = d === null ? 999 : Math.abs(d);
        return periodo === "7" ? dias <= 7 : dias <= 30;
      })
      .filter(
        (l) => !q || [l.empresa, l.decisor, l.responsavel].join(" ").toLowerCase().includes(q),
      );
  }, [leads, perfil, colaborador, etapaFiltro, periodo, busca]);

  const ativos = lista.filter((l) => l.etapa !== "pago" && l.etapa !== "perdido");
  const pagos = lista.filter((l) => l.etapa === "pago");
  const ticket = pagos.length
    ? pagos.reduce((s, l) => s + l.valorEstimado, 0) / pagos.length
    : ativos.length
      ? ativos.reduce((s, l) => s + l.valorEstimado, 0) / ativos.length
      : 0;

  async function soltar(etapa: EtapaCRM) {
    if (!arrastando || !podeMover) return;
    const lead = arrastando;
    setArrastando(null);
    if (lead.etapa === etapa) return;
    if (etapa === "pago") {
      setPagamento(lead);
      return;
    }
    await moverEtapa(lead.id, etapa);
    toast.success(`${lead.empresa} → ${etapaLabel(etapa)}`);
  }

  async function moverDoPainel(lead: Lead, etapa: EtapaCRM) {
    if (!podeMover || lead.etapa === etapa) return;
    if (etapa === "pago") {
      setDetalheId(null);
      setPagamento(lead);
      return;
    }
    await moverEtapa(lead.id, etapa);
    toast.success(`${lead.empresa} → ${etapaLabel(etapa)}`);
  }

  return (
    <AppShell
      title="CRM"
      subtitle="Pipeline comercial"
      actions={
        <div className="flex items-center gap-1 rounded-md border bg-surface p-0.5">
          {(["kanban", "lista"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVisao(v)}
              className={cn(
                "inline-flex min-h-8 items-center gap-1 rounded px-2 text-[12px] font-medium",
                visao === v ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {v === "kanban" ? (
                <KanbanSquare className="size-3.5" />
              ) : (
                <List className="size-3.5" />
              )}
              <span className="hidden sm:inline">{v === "kanban" ? "Kanban" : "Lista"}</span>
            </button>
          ))}
        </div>
      }
    >
      <div className="space-y-3">
        {!podeMover && (
          <p className="inline-flex items-center gap-1.5 rounded-md border border-warning/40 bg-warning/10 px-2.5 py-1.5 text-[11px] font-medium text-warning-foreground">
            <Eye className="size-3.5" /> Modo de acompanhamento — você visualiza apenas seus leads e
            não move etapas.
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric label="Negócios ativos" value={String(ativos.length)} />
          <Metric
            label="Valor em pipeline"
            value={formatCurrency(ativos.reduce((s, l) => s + l.valorEstimado, 0))}
          />
          <Metric label="Ticket médio" value={formatCurrency(Math.round(ticket))} />
          <Metric label="Vendas pagas" value={`${pagos.length}`} tone="success" />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="sm:w-64">
            <SearchInput
              value={busca}
              onChange={setBusca}
              placeholder="Buscar empresa ou decisor"
            />
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            <Select value={colaborador} onChange={setColaborador} disabled={!podeMover}>
              <option value="todos">Todos os colaboradores</option>
              {colaboradores.map((c) => (
                <option key={c.id} value={c.nome}>
                  {c.nome} • {c.vendasConvertidas} vendas
                </option>
              ))}
            </Select>
            <Select value={periodo} onChange={setPeriodo}>
              <option value="todos">Todo o período</option>
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
            </Select>
            <Select value={etapaFiltro} onChange={(v) => setEtapaFiltro(v as EtapaCRM | "todas")}>
              <option value="todas">Todas as etapas</option>
              {ETAPAS.map((e) => (
                <option key={e} value={e}>
                  {etapaLabel(e)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {visao === "kanban" ? (
          <>
            <div className="no-scrollbar -mx-3 flex gap-1.5 overflow-x-auto px-3 md:hidden">
              {ETAPAS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEtapaMobile(e)}
                  className={cn(
                    "min-h-9 shrink-0 rounded-md border px-2.5 text-[12px] font-medium",
                    etapaMobile === e
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface",
                  )}
                >
                  {etapaLabel(e)} ({lista.filter((l) => l.etapa === e).length})
                </button>
              ))}
            </div>

            <div className="md:hidden">
              <Coluna
                etapa={etapaMobile}
                leads={lista.filter((l) => l.etapa === etapaMobile)}
                podeMover={false}
                onOpen={(lead) => setDetalheId(lead.id)}
              />
            </div>

            <div className="thin-scrollbar hidden gap-2 overflow-x-auto pb-2 md:flex">
              {ETAPAS.map((etapa) => (
                <div
                  key={etapa}
                  onDragOver={(e) => podeMover && e.preventDefault()}
                  onDrop={() => soltar(etapa)}
                  className="w-[248px] shrink-0"
                >
                  <Coluna
                    etapa={etapa}
                    leads={lista.filter((l) => l.etapa === etapa)}
                    podeMover={podeMover}
                    onOpen={(lead) => setDetalheId(lead.id)}
                    onDragStart={setArrastando}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-surface">
            {lista.map((l) => (
              <button
                key={l.id}
                onClick={() => setDetalheId(l.id)}
                className="flex w-full flex-col gap-1 border-b px-3 py-2 text-left last:border-b-0 hover:bg-surface-2 sm:flex-row sm:items-center sm:gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{l.empresa}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {l.responsavel} • {etapaLabel(l.etapa!)} • {l.telefone}
                  </p>
                </div>
                <span className="text-[12px] font-semibold tabular-nums text-primary">
                  {formatCurrency(l.valorEstimado)}
                </span>
                <UrgencyBadge date={l.proximaAcao} compact />
              </button>
            ))}
            {lista.length === 0 && (
              <p className="px-3 py-8 text-center text-xs text-muted-foreground">
                Nenhum negócio nos filtros atuais.
              </p>
            )}
          </div>
        )}
      </div>

      {pagamento && (
        <ArchiveConfirmation
          key={pagamento.id}
          title="Confirmar venda paga?"
          description={`${pagamento.empresa} será movido para Pago, a movimentação entra no histórico e as vendas do colaborador são atualizadas.`}
          confirmLabel="Confirmar pagamento"
          onConfirm={async () => {
            await registrarPagamento(pagamento.id);
            toast.success("Venda registrada como paga");
            setPagamento(null);
          }}
          trigger={<button className="hidden" ref={(el) => el?.click()} />}
        />
      )}

      <LeadDetailsPanel
        lead={detalhe}
        open={!!detalhe}
        onOpenChange={(o) => !o && setDetalheId(null)}
        footer={
          detalhe &&
          podeMover && (
            <div className="flex items-center gap-2 md:hidden">
              <span className="shrink-0 text-xs font-medium text-muted-foreground">Mover para</span>
              <Select
                value={detalhe.etapa ?? "reuniao_marcada"}
                onChange={(etapa) => void moverDoPainel(detalhe, etapa as EtapaCRM)}
              >
                {ETAPAS.map((etapa) => (
                  <option key={etapa} value={etapa}>
                    {etapaLabel(etapa)}
                  </option>
                ))}
              </Select>
            </div>
          )
        }
      />
    </AppShell>
  );
}

function Coluna({
  etapa,
  leads,
  podeMover,
  onOpen,
  onDragStart,
}: {
  etapa: EtapaCRM;
  leads: Lead[];
  podeMover: boolean;
  onOpen: (l: Lead) => void;
  onDragStart?: (l: Lead) => void;
}) {
  return (
    <div className="flex h-full flex-col rounded-lg border bg-surface-2">
      <div className="flex items-center justify-between border-b px-2.5 py-1.5">
        <span className="text-[12px] font-semibold">{etapaLabel(etapa)}</span>
        <span className="rounded bg-secondary px-1 text-[10px] tabular-nums text-muted-foreground">
          {leads.length}
        </span>
      </div>
      <div className="thin-scrollbar flex max-h-[62vh] flex-col gap-2 overflow-y-auto p-2">
        {leads.map((l) => (
          <KanbanCard
            key={l.id}
            lead={l}
            draggable={podeMover}
            onOpen={onOpen}
            onDragStart={onDragStart}
          />
        ))}
        {leads.length === 0 && (
          <p className="py-4 text-center text-[11px] text-muted-foreground">Nenhum negócio</p>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <div className="rounded-lg border bg-surface px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("text-lg font-semibold tabular-nums", tone === "success" && "text-success")}>
        {value}
      </p>
    </div>
  );
}

function Select({
  value,
  onChange,
  children,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 shrink-0 rounded-md border border-input bg-surface px-2 text-[12px] outline-none disabled:opacity-50"
    >
      {children}
    </select>
  );
}

