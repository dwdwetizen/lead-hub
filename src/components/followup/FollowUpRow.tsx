import {
  Archive,
  BarChart3,
  CalendarPlus,
  Camera,
  Globe2,
  Instagram,
  MapPinned,
  MessageCircle,
  Phone,
  PhoneOff,
  RotateCcw,
  Star,
  ThumbsDown,
} from "lucide-react";
import type { Lead } from "@/types/lead";
import { UrgencyBadge } from "@/components/shared/UrgencyBadge";
import { OriginBadge } from "@/components/shared/StatusBadge";
import { ArchiveConfirmation } from "@/components/shared/ArchiveConfirmation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDateTime } from "@/lib/date-utils";

export function FollowUpRow({
  lead,
  ativo,
  onOpen,
  onNaoAtendeu,
  onRetornar,
  onAdicionarFollowUp,
  onReuniao,
  onSemInteresse,
  onArquivar,
}: {
  lead: Lead;
  ativo?: boolean;
  onOpen: (lead: Lead) => void;
  onNaoAtendeu: (lead: Lead) => void;
  onRetornar: React.ReactNode;
  onAdicionarFollowUp: React.ReactNode;
  onReuniao: (lead: Lead) => void;
  onSemInteresse: (lead: Lead, nota?: string) => void;
  onArquivar: (lead: Lead) => void;
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
        {lead.telefone && (
          <a
            href={`tel:${lead.telefone.replace(/[^\d+]/g, "")}`}
            aria-label={`Ligar para ${lead.empresa}`}
            title="Ligar"
            className="inline-flex size-9 items-center justify-center rounded-md border bg-surface text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Phone className="size-3.5" />
          </a>
        )}
        {lead.whatsapp && (
          <a
            href={whatsappUrl(lead.whatsapp)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Abrir WhatsApp de ${lead.empresa}`}
            title="Abrir WhatsApp"
            className="inline-flex size-9 items-center justify-center rounded-md border border-success/30 bg-success/8 text-success transition-colors hover:bg-success/15"
          >
            <MessageCircle className="size-3.5" />
          </a>
        )}
        <a
          href={mapsUrl(lead)}
          target="_blank"
          rel="noreferrer"
          aria-label={`Abrir ${lead.empresa} no Google Maps`}
          title="Abrir Google Maps"
          className="inline-flex size-9 items-center justify-center rounded-md border border-primary/30 bg-primary/8 text-primary transition-colors hover:bg-primary/15"
        >
          <MapPinned className="size-3.5" />
        </a>
        {lead.site && (
          <a
            href={externalUrl(lead.site)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Abrir site de ${lead.empresa}`}
            title="Abrir site"
            className="inline-flex size-9 items-center justify-center rounded-md border bg-surface text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Globe2 className="size-3.5" />
          </a>
        )}
        {lead.instagram && (
          <a
            href={instagramUrl(lead.instagram)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Abrir Instagram de ${lead.empresa}`}
            title="Abrir Instagram"
            className="inline-flex size-9 items-center justify-center rounded-md border bg-surface text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Instagram className="size-3.5" />
          </a>
        )}
        <CompanySituation lead={lead} />
        <button
          type="button"
          onClick={() => onNaoAtendeu(lead)}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-md border bg-surface px-2.5 text-[12px] font-medium hover:bg-secondary"
        >
          <PhoneOff className="size-3.5" /> Não atendeu
        </button>
        {onRetornar}
        {onAdicionarFollowUp}
        <button
          type="button"
          onClick={() => onReuniao(lead)}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-primary/30 bg-primary/8 px-2.5 text-[12px] font-medium text-primary hover:bg-primary/15"
        >
          <CalendarPlus className="size-3.5" /> Reunião marcada
        </button>
        <ArchiveConfirmation
          title="Registrar sem interesse?"
          description="O resultado ficará salvo no histórico do lead."
          confirmLabel="Registrar"
          withNote
          onConfirm={(nota) => onSemInteresse(lead, nota)}
          trigger={
            <button
              type="button"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-md border bg-surface px-2.5 text-[12px] font-medium hover:bg-secondary"
            >
              <ThumbsDown className="size-3.5" /> Sem interesse
            </button>
          }
        />
        <ArchiveConfirmation
          title="Arquivar este lead?"
          description="Ele poderá ser restaurado na aba Arquivados."
          confirmLabel="Arquivar"
          onConfirm={() => onArquivar(lead)}
          trigger={
            <button
              type="button"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-md border bg-surface px-2.5 text-[12px] font-medium text-muted-foreground hover:bg-secondary"
            >
              <Archive className="size-3.5" /> Arquivar
            </button>
          }
        />
        <button
          type="button"
          onClick={() => onOpen(lead)}
          className="ml-auto inline-flex min-h-9 items-center rounded-md px-2.5 text-[12px] font-medium text-primary hover:bg-primary/8"
        >
          Ver detalhes
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

function whatsappUrl(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  return `https://wa.me/${digits}`;
}

function mapsUrl(lead: Lead) {
  if (lead.googleMapsUrl) return externalUrl(lead.googleMapsUrl);
  const query = [lead.empresa, lead.endereco, lead.cidade].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function externalUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function instagramUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://www.instagram.com/${value.replace(/^@/, "")}`;
}

function CompanySituation({ lead }: { lead: Lead }) {
  const avaliacao =
    lead.avaliacaoGoogle ??
    Number(
      lead.observacoes.match(/Avaliação Google:\s*(\d+(?:[.,]\d+)?)/i)?.[1]?.replace(",", "."),
    );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Ver situação da empresa"
          aria-label={`Ver situação de ${lead.empresa}`}
          className="inline-flex size-9 items-center justify-center rounded-md border bg-surface text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <BarChart3 className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 space-y-3 p-3">
        <div>
          <p className="text-xs font-semibold">Situação no Google</p>
          <p className="truncate text-[11px] text-muted-foreground">{lead.empresa}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <SituationItem
            icon={Star}
            label="Nota"
            value={Number.isFinite(avaliacao) ? `${avaliacao.toFixed(1)} ★` : "Não informada"}
          />
          <SituationItem
            icon={MessageCircle}
            label="Avaliações"
            value={lead.totalAvaliacoes?.toLocaleString("pt-BR") ?? "Não informado"}
          />
          <SituationItem
            icon={Camera}
            label="Fotos"
            value={lead.totalFotos?.toLocaleString("pt-BR") ?? "Não informado"}
          />
          <SituationItem
            icon={MapPinned}
            label="Posição"
            value={
              lead.posicionamentoGoogle ? `${lead.posicionamentoGoogle}º no mapa` : "Não informada"
            }
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SituationItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border bg-surface-2 p-2">
      <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <Icon className="size-3" /> {label}
      </p>
      <p className="mt-0.5 text-[11px] font-semibold">{value}</p>
    </div>
  );
}

