import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Archive, CalendarPlus, RotateCcw, ThumbsDown } from "lucide-react";
import { AppShell, SearchInput } from "@/components/layout/AppShell";
import { FollowUpFilters, type FollowUpFiltro } from "@/components/followup/FollowUpFilters";
import { FollowUpRow } from "@/components/followup/FollowUpRow";
import { MeetingScheduler } from "@/components/followup/MeetingScheduler";
import { LeadDetailsPanel } from "@/components/shared/LeadDetailsPanel";
import { ReturnDatePopover } from "@/components/shared/ReturnDatePopover";
import { ArchiveConfirmation } from "@/components/shared/ArchiveConfirmation";
import { Button } from "@/components/ui/button";
import { diffDays } from "@/lib/date-utils";
import type { Lead, Reuniao } from "@/types/lead";
import {
  agendarRetorno,
  arquivarLead,
  marcarReuniao,
  registrarNaoAtendeu,
  registrarSemInteresse,
  useLeads,
  usePerfil,
  usuario,
} from "@/services/leadService";

export const Route = createFileRoute("/follow-up")({
  head: () => ({
    meta: [
      { title: "Follow-up | LocalWay OS" },
      {
        name: "description",
        content:
          "Retornos agendados com contagem regressiva, resumo de IA da ligação e agendamento de reuniões.",
      },
      { property: "og:title", content: "Follow-up | LocalWay OS" },
      {
        property: "og:description",
        content: "Acompanhe retornos agendados e transforme conversas em reuniões.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FollowUpPage,
});

function FollowUpPage() {
  const leads = useLeads();
  const perfil = usePerfil();
  const [filtro, setFiltro] = useState<FollowUpFiltro>("todos");
  const [busca, setBusca] = useState("");
  const [detalheId, setDetalheId] = useState<string | null>(null);
  const [reuniaoLead, setReuniaoLead] = useState<Lead | null>(null);
  const detalhe = leads.find((lead) => lead.id === detalheId) ?? null;

  const base = useMemo(
    () =>
      leads
        .filter((l) => l.modulo === "followup")
        .filter((l) => perfil === "gestao" || l.responsavel === usuario.nome),
    [leads, perfil],
  );

  const matchFiltro = (l: Lead, f: FollowUpFiltro) => {
    const d = diffDays(l.proximaAcao);
    if (f === "todos") return true;
    if (d === null) return false;
    if (f === "atrasados") return d < 0;
    if (f === "hoje") return d === 0;
    if (f === "amanha") return d === 1;
    return d >= 0 && d <= 7;
  };

  const counts = {
    todos: base.length,
    atrasados: base.filter((l) => matchFiltro(l, "atrasados")).length,
    hoje: base.filter((l) => matchFiltro(l, "hoje")).length,
    amanha: base.filter((l) => matchFiltro(l, "amanha")).length,
    semana: base.filter((l) => matchFiltro(l, "semana")).length,
  } as Record<FollowUpFiltro, number>;

  const q = busca.trim().toLowerCase();
  const lista = base
    .filter((l) => matchFiltro(l, filtro))
    .filter(
      (l) =>
        !q || [l.empresa, l.decisor, l.telefone, l.whatsapp].join(" ").toLowerCase().includes(q),
    )
    .sort((a, b) => (diffDays(a.proximaAcao) ?? 99) - (diffDays(b.proximaAcao) ?? 99));

  async function confirmarReuniao(lead: Lead, reuniao: Reuniao) {
    await marcarReuniao(lead.id, reuniao);
    setReuniaoLead(null);
    toast.success("Reunião marcada e enviada ao CRM", {
      description: "Convite simulado no Google Agenda.",
    });
  }

  return (
    <AppShell title="Follow-up" subtitle="Retornos agendados e próximos contatos">
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <FollowUpFilters value={filtro} onChange={setFiltro} counts={counts} />
          <div className="sm:ml-auto sm:w-64">
            <SearchInput
              value={busca}
              onChange={setBusca}
              placeholder="Empresa, decisor ou telefone"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border bg-surface">
          {lista.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">
              Nenhum retorno neste filtro.
            </p>
          ) : (
            lista.map((lead) => (
              <FollowUpRow
                key={lead.id}
                lead={lead}
                ativo={detalhe?.id === lead.id}
                onOpen={(lead) => setDetalheId(lead.id)}
                onReuniao={setReuniaoLead}
                onNaoAtendeu={async (l) => {
                  await registrarNaoAtendeu(l.id);
                  toast.success("Tentativa registrada", {
                    description: "Novo retorno agendado para amanhã.",
                  });
                }}
                onRetornar={
                  <ReturnDatePopover
                    confirmLabel="Retornar depois"
                    onConfirm={async (data, obs) => {
                      await agendarRetorno(lead.id, data, obs);
                      toast.success("Retorno reagendado");
                    }}
                    trigger={
                      <button className="inline-flex min-h-9 items-center gap-1.5 rounded-md border bg-surface px-2.5 text-[12px] font-medium hover:bg-secondary">
                        <RotateCcw className="size-3.5" /> Retornar depois
                      </button>
                    }
                  />
                }
                onAdicionarFollowUp={
                  <ReturnDatePopover
                    hint="Use após falar com o decisor para agendar o próximo contato."
                    confirmLabel="Adicionar follow-up"
                    onConfirm={async (data, obs) => {
                      await agendarRetorno(lead.id, data, obs);
                      toast.success("Novo follow-up adicionado");
                    }}
                    trigger={
                      <button className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-primary/30 bg-primary/8 px-2.5 text-[12px] font-medium text-primary hover:bg-primary/15">
                        <CalendarPlus className="size-3.5" /> Adicionar follow-up
                      </button>
                    }
                  />
                }
                onSemInteresse={async (l, nota) => {
                  await registrarSemInteresse(l.id, nota);
                  toast("Sem interesse registrado");
                }}
                onArquivar={async (l) => {
                  await arquivarLead(l.id);
                  toast.success("Lead arquivado");
                }}
              />
            ))
          )}
        </div>
      </div>

      <LeadDetailsPanel
        lead={detalhe}
        open={!!detalhe}
        onOpenChange={(o) => !o && setDetalheId(null)}
        footer={
          detalhe && (
            <div className="flex flex-wrap gap-2">
              <Button
                className="h-10 flex-1"
                onClick={() => {
                  setReuniaoLead(detalhe);
                  setDetalheId(null);
                }}
              >
                Reunião marcada
              </Button>
              <ArchiveConfirmation
                title="Registrar sem interesse?"
                description="O histórico será mantido."
                withNote
                onConfirm={async (nota) => {
                  await registrarSemInteresse(detalhe.id, nota);
                  setDetalheId(null);
                  toast("Sem interesse registrado");
                }}
                trigger={
                  <Button variant="outline" className="h-10">
                    <ThumbsDown className="size-4" /> Sem interesse
                  </Button>
                }
              />
              <ArchiveConfirmation
                title="Arquivar este lead?"
                description="Ele poderá ser restaurado na aba Arquivados."
                confirmLabel="Arquivar"
                onConfirm={async () => {
                  await arquivarLead(detalhe.id);
                  setDetalheId(null);
                  toast.success("Lead arquivado");
                }}
                trigger={
                  <Button variant="outline" className="h-10">
                    <Archive className="size-4" /> Arquivar
                  </Button>
                }
              />
            </div>
          )
        }
      />

      <MeetingScheduler
        lead={reuniaoLead}
        open={!!reuniaoLead}
        onOpenChange={(o) => !o && setReuniaoLead(null)}
        onConfirm={confirmarReuniao}
      />
    </AppShell>
  );
}

