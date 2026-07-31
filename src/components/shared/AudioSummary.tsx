import { AudioLines, Brain, ListChecks, MessageSquareWarning, Target } from "lucide-react";
import type { ResumoIA } from "@/types/lead";

/**
 * Bloco independente com transcrição de áudio + resumo gerado por IA.
 * Hoje alimentado por dados simulados; futuramente pelo Grok.
 */
export function AudioSummary({ resumo }: { resumo?: ResumoIA }) {
  if (!resumo) {
    return (
      <div className="rounded-lg border border-dashed bg-surface-2 px-3 py-4 text-center">
        <AudioLines className="mx-auto size-4 text-muted-foreground" />
        <p className="mt-1.5 text-xs font-medium">Nenhum áudio registrado</p>
        <p className="text-[11px] text-muted-foreground">
          Grave a próxima ligação para gerar transcrição e resumo automático.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-surface-2 p-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
            <AudioLines className="size-3.5 text-primary" /> Áudio da ligação
          </span>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {resumo.duracaoAudio}
          </span>
        </div>
        <div className="mt-2 flex h-6 items-end gap-[2px]">
          {Array.from({ length: 48 }).map((_, i) => (
            <span
              key={i}
              className="w-full rounded-sm bg-primary/35"
              style={{ height: `${20 + Math.abs(Math.sin(i * 1.7)) * 80}%` }}
            />
          ))}
        </div>
        <p className="thin-scrollbar mt-2 max-h-24 overflow-y-auto whitespace-pre-line text-[11px] leading-relaxed text-muted-foreground">
          {resumo.transcricao}
        </p>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Brain className="size-3.5" /> Resumo da IA
        </span>
        <p className="mt-1 text-xs leading-relaxed">{resumo.resumo}</p>
      </div>

      <Bloco icon={<Target className="size-3.5 text-danger" />} titulo="Dores identificadas" itens={resumo.dores} />
      <Bloco
        icon={<MessageSquareWarning className="size-3.5 text-warning-foreground" />}
        titulo="Objeções"
        itens={resumo.objecoes}
      />
      <Bloco
        icon={<ListChecks className="size-3.5 text-success" />}
        titulo="Próximos passos"
        itens={resumo.proximosPassos}
      />

      <div className="rounded-lg border bg-surface p-3">
        <p className="text-xs font-semibold">Roteiro recomendado para a ligação</p>
        <ol className="mt-1.5 space-y-1">
          {resumo.roteiro.map((r, i) => (
            <li key={r} className="flex gap-2 text-[11px] leading-relaxed text-muted-foreground">
              <span className="mt-[1px] flex size-4 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground">
                {i + 1}
              </span>
              {r}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Bloco({
  icon,
  titulo,
  itens,
}: {
  icon: React.ReactNode;
  titulo: string;
  itens: string[];
}) {
  if (!itens.length) return null;
  return (
    <div className="rounded-lg border bg-surface p-3">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
        {icon} {titulo}
      </span>
      <ul className="mt-1.5 space-y-1">
        {itens.map((i) => (
          <li key={i} className="flex gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-border" />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
