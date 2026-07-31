import { useState } from "react";
import type { Lead, Reuniao } from "@/types/lead";
import { ResponsiveBottomSheet } from "@/components/shared/ResponsiveBottomSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarCheck2, Info } from "lucide-react";
import { addDays } from "@/lib/date-utils";

const toInputDate = (d: Date) => d.toISOString().slice(0, 10);

export function MeetingScheduler({
  lead,
  open,
  onOpenChange,
  onConfirm,
}: {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: (lead: Lead, reuniao: Reuniao) => void;
}) {
  const [form, setForm] = useState<Reuniao>({
    data: toInputDate(addDays(new Date(), 2)),
    horario: "10:00",
    duracao: "45 min",
    pessoa: "",
    telefone: "",
    whatsapp: "",
    email: "",
    local: "Google Meet",
    observacoes: "",
  });

  if (!lead) return null;

  const set = (k: keyof Reuniao, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <ResponsiveBottomSheet
      open={open}
      onOpenChange={(o) => {
        if (o && lead) {
          setForm((f) => ({
            ...f,
            pessoa: f.pessoa || lead.decisor,
            telefone: f.telefone || lead.telefone,
            whatsapp: f.whatsapp || lead.whatsapp,
            email: f.email || lead.email,
          }));
        }
        onOpenChange(o);
      }}
      title="Marcar reunião"
      description={lead.empresa}
      footer={
        <div className="flex gap-2">
          <Button variant="outline" className="h-10 flex-1" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="h-10 flex-1" onClick={() => onConfirm(lead, form)}>
            <CalendarCheck2 className="size-4" /> Confirmar reunião
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Data">
          <Input type="date" value={form.data} onChange={(e) => set("data", e.target.value)} />
        </Campo>
        <Campo label="Horário">
          <Input type="time" value={form.horario} onChange={(e) => set("horario", e.target.value)} />
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
            value={form.observacoes}
            onChange={(e) => set("observacoes", e.target.value)}
          />
        </Campo>
      </div>
      <p className="mt-3 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-[11px] leading-relaxed text-primary">
        <Info className="mt-[1px] size-3.5 shrink-0" />
        Após confirmar, a reunião será enviada ao Google Agenda e o lead entrará no CRM.
      </p>
    </ResponsiveBottomSheet>
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
