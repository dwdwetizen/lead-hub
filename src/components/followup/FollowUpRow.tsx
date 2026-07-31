import { AudioLines, CalendarPlus, MessageCircle, Phone, RotateCcw } from "lucide-react";
import type { Lead } from "@/types/lead";
import { UrgencyBadge } from "@/components/shared/UrgencyBadge";
import { OriginBadge } from "@/components/shared/StatusBadge";
import { ArchiveConfirmation } from "@/components/shared/ArchiveConfirmation";
import { formatDateTime } from "@/lib/date-utils";

export function FollowUpRow({
  lead,
  ativo,
  onOpen,
  onRegistrarContato,
  onRetornar,
  onReuniao,
}: {
  lead: Lead;
  ativo?: boolean;
  onOpen: (lead: Lead) => void;
  onRegistrarContato: (lead: Lead, nota: string) => void;
  onRetornar: React.ReactNode;
  onReuniao: (lead: Lead) => void;
}) {
  return (
    <div
      className={`border-b last:border-b-0 transition-colors ${ativo ? "bg-accent/50" : "hover:bg-surface-2"}`}
    >
      <button
        type="button"
        onClick={() => onOpen(lead)}
        className="flex w-full flex-col gap-1 px-3 py-2 text-left sm:flex-row sm:items-center sm:gap-3"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-sm font-semibold">{lead.empresa}</span>
            <OriginBadge origem={lead.origem} />
            {lead.resumoIA && (
              <span className="inline-flex items-center gap-1 rounded-md border border-primary/25 bg-primary/8 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                <AudioLines className="size-3" /> Áudio + IA
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            <span>{lead.decisor}</span>
            <span className="inline-flex items-center gap-1">
              <Phone className="size-3" /> {lead.telefone}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="size-3" /> {lead.whatsapp}
            </span>
          </div>
          {lead.ultimaAnotacao && (
            <p className="mt-0.5 line-clamp-1 text-[11px] italic text-muted-foreground">
              “{lead.ultimaAnotacao}”
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-[11px] font-medium tabular-nums">
              {formatDateTime(lead.proximaAcao)}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {lead.proximaAcaoLabel ?? "—"}
            </span>
          </div>
          <UrgencyBadge date={lead.proximaAcao} compact />
        </div>
      </button>

      <div className="flex flex-wrap items-center gap-1.5 px-3 pb-2">
        <ArchiveConfirmation
          title="Registrar contato?"
          description="Adicione uma anotação sobre o que foi conversado."
          confirmLabel="Registrar contato"
          withNote
          noteRequired
          notePlaceholder="Resumo do contato"
          onConfirm={(nota) => onRegistrarContato(lead, nota!)}
          trigger={
            <button
              type="button"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-md border bg-surface px-2.5 text-[12px] font-medium hover:bg-secondary"
            >
              <Phone className="size-3.5" /> Registrar contato
            </button>
          }
        />
        {onRetornar}
        <button
          type="button"
          onClick={() => onReuniao(lead)}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-primary/30 bg-primary/8 px-2.5 text-[12px] font-medium text-primary hover:bg-primary/15"
        >
          <CalendarPlus className="size-3.5" /> Reunião marcada
        </button>
      </div>
    </div>
  );
}

export function RetornarButtonLabel() {
  return (
    <>
      <RotateCcw className="size-3.5" /> Retornar novamente
    </>
  );
}

