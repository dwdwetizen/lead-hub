import { cn } from "@/lib/utils";

export type FollowUpFiltro = "todos" | "atrasados" | "hoje" | "amanha" | "semana";

const filtros: { id: FollowUpFiltro; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "atrasados", label: "Atrasados" },
  { id: "hoje", label: "Hoje" },
  { id: "amanha", label: "Amanhã" },
  { id: "semana", label: "Esta semana" },
];

export function FollowUpFilters({
  value,
  onChange,
  counts,
}: {
  value: FollowUpFiltro;
  onChange: (v: FollowUpFiltro) => void;
  counts: Record<FollowUpFiltro, number>;
}) {
  return (
    <div className="no-scrollbar -mx-3 flex snap-x gap-1.5 overflow-x-auto px-3 pb-0.5 sm:mx-0 sm:px-0">
      {filtros.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={cn(
            "inline-flex min-h-9 shrink-0 snap-start items-center gap-1.5 rounded-md border px-2.5 text-[12px] font-medium transition-colors",
            value === f.id
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-surface hover:bg-secondary",
          )}
        >
          {f.label}
          <span
            className={cn(
              "rounded px-1 text-[10px] tabular-nums",
              value === f.id ? "bg-primary-foreground/20" : "bg-secondary text-muted-foreground",
            )}
          >
            {counts[f.id]}
          </span>
        </button>
      ))}
    </div>
  );
}

