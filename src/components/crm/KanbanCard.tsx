import type { Lead } from "@/types/lead";
import { UrgencyBadge } from "@/components/shared/UrgencyBadge";
import { OriginBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate, diffDays } from "@/lib/date-utils";
import { Phone, User } from "lucide-react";

export function KanbanCard({
  lead,
  draggable,
  onOpen,
  onDragStart,
}: {
  lead: Lead;
  draggable: boolean;
  onOpen: (lead: Lead) => void;
  onDragStart?: (lead: Lead) => void;
}) {
  const diasNaEtapa = lead.etapaDesde ? Math.abs(diffDays(lead.etapaDesde) ?? 0) : 0;
  return (
    <div
      draggable={draggable}
      onDragStart={() => onDragStart?.(lead)}
      onClick={() => onOpen(lead)}
      className={`rounded-lg border bg-surface p-2.5 shadow-[var(--shadow-row)] transition-colors hover:border-primary/40 ${
        draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 truncate text-[13px] font-semibold">{lead.empresa}</p>
        <span className="shrink-0 text-[12px] font-semibold tabular-nums text-primary">
          {formatCurrency(lead.valorEstimado)}
        </span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <User className="size-3" /> {lead.responsavel}
        </span>
        <span className="inline-flex items-center gap-1">
          <Phone className="size-3" /> {lead.telefone || lead.whatsapp}
        </span>
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">
        Reunião: {lead.reuniao ? `${lead.reuniao.data} ${lead.reuniao.horario}` : formatDate(lead.proximaAcao)}
      </div>
      <p className="mt-1 line-clamp-1 text-[11px] font-medium">
        {lead.proximaAcaoLabel ?? "Sem próxima ação"}
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <UrgencyBadge date={lead.proximaAcao} compact />
        <OriginBadge origem={lead.origem} />
        <span className="ml-auto text-[10px] text-muted-foreground">{diasNaEtapa}d na etapa</span>
      </div>
    </div>
  );
}
