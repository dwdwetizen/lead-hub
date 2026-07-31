import { Building2, Mail, MapPin, MessageCircle, Phone, User } from "lucide-react";
import type { Lead } from "@/types/lead";
import { ResponsiveBottomSheet } from "@/components/shared/ResponsiveBottomSheet";
import { AudioSummary } from "@/components/shared/AudioSummary";
import { HistoryTimeline } from "@/components/shared/HistoryTimeline";
import { UrgencyBadge } from "@/components/shared/UrgencyBadge";
import { OriginBadge, StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/date-utils";
import { etapaLabel } from "@/services/leadService";
import type { ReactNode } from "react";

export function LeadDetailsPanel({
  lead,
  open,
  onOpenChange,
  footer,
}: {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  footer?: ReactNode;
}) {
  if (!lead) return null;

  return (
    <ResponsiveBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={lead.empresa}
      description={`${lead.segmento} • ${lead.cidade}`}
      footer={footer}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <OriginBadge origem={lead.origem} />
          <StatusBadge status={lead.resultado} />
          {lead.etapa && (
            <span className="rounded-md border border-primary/25 bg-primary/8 px-1.5 py-0.5 text-[11px] font-medium text-primary">
              {etapaLabel(lead.etapa)}
            </span>
          )}
          <UrgencyBadge date={lead.proximaAcao} />
        </div>

        <Secao titulo="Empresa">
          <Linha icon={Building2} label="Segmento" value={lead.segmento} />
          <Linha icon={MapPin} label="Endereço" value={`${lead.endereco} • ${lead.cidade}`} />
          <Linha icon={Phone} label="Telefone" value={lead.telefone || "—"} />
          <Linha icon={MessageCircle} label="WhatsApp" value={lead.whatsapp || "—"} />
          <Linha icon={Mail} label="E-mail" value={lead.email || "—"} />
        </Secao>

        <Secao titulo="Decisor e responsável">
          <Linha icon={User} label="Decisor" value={lead.decisor || "A identificar"} />
          <Linha icon={User} label="Atendente" value={lead.contato || "—"} />
          <Linha icon={User} label="Responsável" value={lead.responsavel} />
        </Secao>

        <Secao titulo="Próxima ação">
          <div className="rounded-lg border bg-surface-2 p-2.5">
            <p className="text-xs font-medium">{lead.proximaAcaoLabel ?? "Nenhuma ação agendada"}</p>
            <p className="text-[11px] text-muted-foreground">{formatDateTime(lead.proximaAcao)}</p>
          </div>
        </Secao>

        {(lead.reuniao || lead.valorEstimado > 0) && (
          <Secao titulo="Negócio">
            {lead.valorEstimado > 0 && (
              <Linha icon={Building2} label="Valor estimado" value={formatCurrency(lead.valorEstimado)} />
            )}
            {lead.reuniao && (
              <>
                <Linha
                  icon={User}
                  label="Reunião"
                  value={`${lead.reuniao.data} às ${lead.reuniao.horario} (${lead.reuniao.duracao})`}
                />
                <Linha icon={MapPin} label="Local" value={lead.reuniao.local} />
              </>
            )}
          </Secao>
        )}

        <Secao titulo="Observações">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {lead.ultimaAnotacao || lead.observacoes || "Sem observações registradas."}
          </p>
        </Secao>

        <Secao titulo="Resumo da prospecção e IA">
          <AudioSummary resumo={lead.resumoIA} />
        </Secao>

        <Secao titulo="Histórico completo">
          <HistoryTimeline itens={lead.historico} />
        </Secao>
      </div>
    </ResponsiveBottomSheet>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {titulo}
      </h3>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function Linha({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <p className="flex items-start gap-1.5 text-xs">
      <Icon className="mt-[2px] size-3 shrink-0 text-muted-foreground" />
      <span className="font-medium">{label}:</span>
      <span className="min-w-0 flex-1 break-words text-muted-foreground">{value}</span>
    </p>
  );
}
