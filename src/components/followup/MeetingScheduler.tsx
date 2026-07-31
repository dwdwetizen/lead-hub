import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Lead, Reuniao } from "@/types/lead";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarCheck2, Info } from "lucide-react";
import { addDays } from "@/lib/date-utils";

const toInputDate = (d: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const initialForm = (lead?: Lead | null): Reuniao => ({
  data: toInputDate(addDays(new Date(), 1)),
  horario: "10:00",
  duracao: "45 min",
  pessoa: lead?.decisor ?? "",
  telefone: lead?.telefone ?? "",
  whatsapp: lead?.whatsapp ?? "",
  email: lead?.email ?? "",
  local: "Google Meet",
  observacoes: lead?.ultimaAnotacao ?? "",
});

export function MeetingScheduler({
  lead,
  open,
  onOpenChange,
  onConfirm,
}: {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: (lead: Lead, reuniao: Reuniao) => void | Promise<void>;
}) {
  const [form, setForm] = useState<Reuniao>(() => initialForm(lead));
  const [salvando, setSalvando] = useState(false);
  useEffect(() => {
    if (open) setForm(initialForm(lead));
  }, [lead, open]);

  if (!lead) return null;
  const currentLead = lead;
  const datasRapidas = [0, 1, 2, 3, 4].map((dias) => {
    const data = addDays(new Date(), dias);
    const label =
      dias === 0
        ? "Hoje"
        : dias === 1
          ? "Amanhã"
          : dias === 2
            ? "Depois de amanhã"
            : data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    return { label, value: toInputDate(data) };
  });

  const set = (k: keyof Reuniao, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function confirmar() {
    if (!form.data || !form.horario || !form.duracao.trim() || !form.pessoa.trim()) {
      toast.error("Preencha data, horário, duração e nome da pessoa");
      return;
    }
    if (!form.telefone.trim() && !form.whatsapp.trim() && !form.email.trim()) {
      toast.error("Informe ao menos um telefone, WhatsApp ou e-mail");
      return;
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error("Informe um e-mail válido");
      return;
    }
    if (!form.local.trim()) {
      toast.error("Informe o local ou link da reunião");
      return;
    }
    const inicio = new Date(`${form.data}T${form.horario}:00`);
    if (Number.isNaN(inicio.getTime()) || inicio.getTime() <= Date.now()) {
      toast.error("Escolha uma data e horário futuros");
      return;
    }

    setSalvando(true);
    try {
      await onConfirm(currentLead, {
        ...form,
        duracao: form.duracao.trim(),
        pessoa: form.pessoa.trim(),
        telefone: form.telefone.trim(),
        whatsapp: form.whatsapp.trim(),
        email: form.email.trim(),
        local: form.local.trim(),
        observacoes: form.observacoes?.trim(),
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-1.5rem)] gap-0 overflow-y-auto p-0 sm:max-w-[560px]">
        <DialogHeader className="border-b px-4 py-3 text-left">
          <DialogTitle>Marcar reunião</DialogTitle>
          <DialogDescription>{lead.empresa}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-4 py-3">
          <div>
            <Label className="text-[11px] text-muted-foreground">Escolha uma data</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {datasRapidas.map((opcao) => (
                <button
                  key={opcao.value}
                  type="button"
                  onClick={() => set("data", opcao.value)}
                  className={`min-h-9 rounded-md border px-2.5 text-[12px] font-medium transition-colors ${
                    form.data === opcao.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-surface hover:bg-secondary"
                  }`}
                >
                  {opcao.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Data">
              <Input
                type="date"
                min={toInputDate(new Date())}
                value={form.data}
                onChange={(e) => set("data", e.target.value)}
              />
            </Campo>
            <Campo label="Horário">
              <Input
                type="time"
                value={form.horario}
                onChange={(e) => set("horario", e.target.value)}
              />
            </Campo>
            <Campo label="Duração">
              <Input value={form.duracao} onChange={(e) => set("duracao", e.target.value)} />
            </Campo>
            <Campo label="Nome da pessoa">
              <Input value={form.pessoa} onChange={(e) => set("pessoa", e.target.value)} />
            </Campo>
            <Campo label="Telefone">
              <Input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} />
            </Campo>
            <Campo label="WhatsApp">
              <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
            </Campo>
            <Campo label="E-mail" full>
              <Input value={form.email} onChange={(e) => set("email", e.target.value)} />
            </Campo>
            <Campo label="Local ou link da reunião" full>
              <Input value={form.local} onChange={(e) => set("local", e.target.value)} />
            </Campo>
            <Campo label="Observações" full>
              <Textarea
                className="min-h-[70px] resize-none"
                placeholder="Informação importante do último follow-up"
                value={form.observacoes}
                onChange={(e) => set("observacoes", e.target.value)}
              />
            </Campo>
          </div>
          <p className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-[11px] leading-relaxed text-primary">
            <Info className="mt-[1px] size-3.5 shrink-0" />
            Os contatos do lead serão enviados com a reunião ao Google Agenda e o lead entrará no
            CRM.
          </p>
        </div>

        <DialogFooter className="flex-row gap-2 border-t bg-surface-2 px-4 py-3">
          <Button variant="outline" className="h-10 flex-1" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="h-10 flex-1" onClick={confirmar} disabled={salvando}>
            <CalendarCheck2 className="size-4" />{" "}
            {salvando ? "Confirmando..." : "Confirmar reunião"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Campo({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2 space-y-1" : "space-y-1"}>
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

