import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  Building2,
  Globe2,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Save,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Lead } from "@/types/lead";
import { ResponsiveBottomSheet } from "@/components/shared/ResponsiveBottomSheet";
import { HistoryTimeline } from "@/components/shared/HistoryTimeline";
import { UrgencyBadge } from "@/components/shared/UrgencyBadge";
import { OriginBadge, StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDateTime } from "@/lib/date-utils";
import { atualizarLead, etapaLabel } from "@/services/leadService";

interface LeadForm {
  empresa: string;
  segmento: string;
  cidade: string;
  endereco: string;
  telefone: string;
  whatsapp: string;
  contato: string;
  decisor: string;
  email: string;
  site: string;
  instagram: string;
  avaliacaoGoogle: string;
  totalAvaliacoes: string;
  totalFotos: string;
  posicionamentoGoogle: string;
  responsavel: string;
  valorEstimado: string;
  proximaAcao: string;
  proximaAcaoLabel: string;
  observacoes: string;
}

const emptyForm: LeadForm = {
  empresa: "",
  segmento: "",
  cidade: "",
  endereco: "",
  telefone: "",
  whatsapp: "",
  contato: "",
  decisor: "",
  email: "",
  site: "",
  instagram: "",
  avaliacaoGoogle: "",
  totalAvaliacoes: "",
  totalFotos: "",
  posicionamentoGoogle: "",
  responsavel: "",
  valorEstimado: "",
  proximaAcao: "",
  proximaAcaoLabel: "",
  observacoes: "",
};

function toDateTimeLocal(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function toOptionalNumber(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return undefined;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : undefined;
}

function toForm(lead: Lead): LeadForm {
  return {
    empresa: lead.empresa,
    segmento: lead.segmento,
    cidade: lead.cidade,
    endereco: lead.endereco,
    telefone: lead.telefone,
    whatsapp: lead.whatsapp,
    contato: lead.contato,
    decisor: lead.decisor,
    email: lead.email,
    site: lead.site ?? "",
    instagram: lead.instagram ?? "",
    avaliacaoGoogle: lead.avaliacaoGoogle?.toString() ?? "",
    totalAvaliacoes: lead.totalAvaliacoes?.toString() ?? "",
    totalFotos: lead.totalFotos?.toString() ?? "",
    posicionamentoGoogle: lead.posicionamentoGoogle?.toString() ?? "",
    responsavel: lead.responsavel,
    valorEstimado: String(lead.valorEstimado || ""),
    proximaAcao: toDateTimeLocal(lead.proximaAcao),
    proximaAcaoLabel: lead.proximaAcaoLabel ?? "",
    observacoes: lead.observacoes || lead.ultimaAnotacao || "",
  };
}

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
  const [displayedLead, setDisplayedLead] = useState<Lead | null>(lead);
  const [form, setForm] = useState<LeadForm>(() => (lead ? toForm(lead) : emptyForm));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayedLead(lead);
    if (lead) setForm(toForm(lead));
    setEditing(false);
  }, [lead, open]);

  const currentLead = displayedLead ?? lead;
  if (!currentLead) return null;

  const updateField = (field: keyof LeadForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const cancelEditing = () => {
    setForm(toForm(currentLead));
    setEditing(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.empresa.trim()) {
      toast.error("Informe o nome da empresa");
      return;
    }

    setSaving(true);
    try {
      const updated = await atualizarLead(currentLead.id, {
        empresa: form.empresa.trim(),
        segmento: form.segmento.trim(),
        cidade: form.cidade.trim(),
        endereco: form.endereco.trim(),
        telefone: form.telefone.trim(),
        whatsapp: form.whatsapp.trim(),
        contato: form.contato.trim(),
        decisor: form.decisor.trim(),
        email: form.email.trim(),
        site: form.site.trim() || undefined,
        instagram: form.instagram.trim() || undefined,
        avaliacaoGoogle: toOptionalNumber(form.avaliacaoGoogle),
        totalAvaliacoes: toOptionalNumber(form.totalAvaliacoes),
        totalFotos: toOptionalNumber(form.totalFotos),
        posicionamentoGoogle: toOptionalNumber(form.posicionamentoGoogle),
        responsavel: form.responsavel.trim(),
        valorEstimado: Number(form.valorEstimado.replace(",", ".")) || 0,
        proximaAcao: form.proximaAcao ? new Date(form.proximaAcao).toISOString() : undefined,
        proximaAcaoLabel: form.proximaAcaoLabel.trim() || undefined,
        observacoes: form.observacoes.trim(),
      });

      setDisplayedLead(updated);
      setForm(toForm(updated));
      setEditing(false);
      toast.success("Lead atualizado com sucesso");
    } catch {
      toast.error("Não foi possível atualizar o lead");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={
        <span className="flex items-center justify-between gap-2">
          <span className="min-w-0 truncate">{currentLead.empresa}</span>
          {!editing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mr-6 h-7 shrink-0 px-2 text-xs font-normal text-muted-foreground"
              onClick={() => setEditing(true)}
            >
              <Pencil className="size-3" />
              Editar
            </Button>
          )}
        </span>
      }
      description={`${currentLead.segmento} • ${currentLead.cidade}`}
      footer={footer}
    >
      {editing ? (
        <LeadEditForm
          form={form}
          saving={saving}
          onChange={updateField}
          onCancel={cancelEditing}
          onSubmit={handleSubmit}
        />
      ) : (
        <LeadDetails lead={currentLead} />
      )}
    </ResponsiveBottomSheet>
  );
}

function LeadEditForm({
  form,
  saving,
  onChange,
  onCancel,
  onSubmit,
}: {
  form: LeadForm;
  saving: boolean;
  onChange: (field: keyof LeadForm, value: string) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Secao titulo="Empresa">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Campo
            id="lead-empresa"
            label="Empresa"
            value={form.empresa}
            onChange={(value) => onChange("empresa", value)}
            required
          />
          <Campo
            id="lead-segmento"
            label="Segmento"
            value={form.segmento}
            onChange={(value) => onChange("segmento", value)}
          />
          <Campo
            id="lead-cidade"
            label="Cidade"
            value={form.cidade}
            onChange={(value) => onChange("cidade", value)}
          />
          <Campo
            id="lead-endereco"
            label="Endereço"
            value={form.endereco}
            onChange={(value) => onChange("endereco", value)}
          />
          <Campo
            id="lead-telefone"
            label="Telefone"
            type="tel"
            value={form.telefone}
            onChange={(value) => onChange("telefone", value)}
          />
          <Campo
            id="lead-whatsapp"
            label="WhatsApp"
            type="tel"
            value={form.whatsapp}
            onChange={(value) => onChange("whatsapp", value)}
          />
          <Campo
            id="lead-email"
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(value) => onChange("email", value)}
          />
        </div>
      </Secao>

      <Secao titulo="Decisor e responsável">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Campo
            id="lead-decisor"
            label="Decisor"
            value={form.decisor}
            onChange={(value) => onChange("decisor", value)}
          />
          <Campo
            id="lead-contato"
            label="Atendente"
            value={form.contato}
            onChange={(value) => onChange("contato", value)}
          />
          <Campo
            id="lead-responsavel"
            label="Responsável"
            value={form.responsavel}
            onChange={(value) => onChange("responsavel", value)}
          />
        </div>
      </Secao>

      <Secao titulo="Presença online">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Campo
            id="lead-site"
            label="Site"
            value={form.site}
            onChange={(value) => onChange("site", value)}
            placeholder="https://empresa.com.br"
          />
          <Campo
            id="lead-instagram"
            label="Instagram"
            value={form.instagram}
            onChange={(value) => onChange("instagram", value)}
            placeholder="@empresa"
          />
          <Campo
            id="lead-avaliacao-google"
            label="Nota no Google"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={form.avaliacaoGoogle}
            onChange={(value) => onChange("avaliacaoGoogle", value)}
          />
          <Campo
            id="lead-total-avaliacoes"
            label="Quantidade de avaliações"
            type="number"
            min="0"
            value={form.totalAvaliacoes}
            onChange={(value) => onChange("totalAvaliacoes", value)}
          />
          <Campo
            id="lead-total-fotos"
            label="Quantidade de fotos"
            type="number"
            min="0"
            value={form.totalFotos}
            onChange={(value) => onChange("totalFotos", value)}
          />
          <Campo
            id="lead-posicionamento-google"
            label="Posição no mapa"
            type="number"
            min="1"
            value={form.posicionamentoGoogle}
            onChange={(value) => onChange("posicionamentoGoogle", value)}
          />
        </div>
      </Secao>

      <Secao titulo="Próxima ação">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Campo
            id="lead-proxima-acao"
            label="Data e horário"
            type="datetime-local"
            value={form.proximaAcao}
            onChange={(value) => onChange("proximaAcao", value)}
          />
          <Campo
            id="lead-proxima-acao-label"
            label="Rótulo"
            value={form.proximaAcaoLabel}
            onChange={(value) => onChange("proximaAcaoLabel", value)}
            placeholder="Ex.: Retorno agendado"
          />
        </div>
      </Secao>

      <Secao titulo="Negócio">
        <Campo
          id="lead-valor-estimado"
          label="Valor estimado"
          type="number"
          min="0"
          step="0.01"
          value={form.valorEstimado}
          onChange={(value) => onChange("valorEstimado", value)}
        />
      </Secao>

      <Secao titulo="Observações">
        <div className="space-y-1.5">
          <Label htmlFor="lead-observacoes" className="text-xs">
            Observações
          </Label>
          <Textarea
            id="lead-observacoes"
            value={form.observacoes}
            onChange={(event) => onChange("observacoes", event.target.value)}
            className="min-h-24 resize-y text-xs"
          />
        </div>
      </Secao>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={saving}>
          <X className="size-3.5" />
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={saving}>
          <Save className="size-3.5" />
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}

function Campo({
  id,
  label,
  value,
  onChange,
  type = "text",
  ...props
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
} & Omit<React.ComponentProps<typeof Input>, "id" | "type" | "value" | "onChange">) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 text-xs"
        {...props}
      />
    </div>
  );
}

function LeadDetails({ lead }: { lead: Lead }) {
  return (
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
        {lead.site && <Linha icon={Globe2} label="Site" value={lead.site} />}
        {lead.instagram && <Linha icon={Instagram} label="Instagram" value={lead.instagram} />}
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
            <Linha
              icon={Building2}
              label="Valor estimado"
              value={formatCurrency(lead.valorEstimado)}
            />
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
          {lead.observacoes || lead.ultimaAnotacao || "Sem observações registradas."}
        </p>
      </Secao>

      <Secao titulo="Histórico completo">
        <HistoryTimeline itens={lead.historico} />
      </Secao>
    </div>
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

