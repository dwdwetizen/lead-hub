import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  BarChart3,
  Flame,
  LayoutDashboard,
  Menu,
  PhoneCall,
  Search,
  Target,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { colaboradores } from "@/mocks/leads";
import { setPerfil, usePerfil, usuario } from "@/services/leadService";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/prospeccao", label: "Prospecção", icon: Target },
  { to: "/follow-up", label: "Follow-up", icon: PhoneCall },
  { to: "/crm", label: "CRM", icon: Users },
  { to: "/mapa-de-calor", label: "Mapa de Calor", icon: Flame },
  { to: "/volume-de-busca", label: "Volume de Busca", icon: BarChart3 },
];

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const perfil = usePerfil();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const menu = (
    <nav className="flex flex-col gap-0.5 p-2">
      {nav.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex min-h-11 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className={cn("size-4", active && "text-sidebar-primary")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-56 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <Brand />
        {menu}
        <div className="mt-auto border-t border-sidebar-border p-3">
          <PerfilSwitch perfil={perfil} />
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-sidebar">
            <div className="flex items-center justify-between pr-2">
              <Brand />
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="flex size-11 items-center justify-center text-sidebar-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            {menu}
            <div className="mt-auto border-t border-sidebar-border p-3">
              <PerfilSwitch perfil={perfil} />
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-56">
        <header className="sticky top-0 z-30 flex min-h-14 items-center gap-2 border-b bg-surface/85 px-3 backdrop-blur sm:px-4">
          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            className="flex size-10 items-center justify-center rounded-md hover:bg-secondary lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-semibold leading-tight">{title}</h1>
            {subtitle && (
              <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5">{actions}</div>
          <div className="ml-1 hidden size-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground sm:flex">
            {usuario.iniciais}
          </div>
        </header>
        <main className="min-w-0 flex-1 px-3 py-3 sm:px-4 sm:py-4">{children}</main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex h-14 items-center gap-2 px-4">
      <div className="flex size-7 items-center justify-center rounded-md bg-sidebar-primary text-[12px] font-bold text-sidebar-primary-foreground">
        LW
      </div>
      <div className="leading-tight">
        <p className="text-[13px] font-semibold text-sidebar-accent-foreground">LocalWay OS</p>
        <p className="text-[10px] text-sidebar-foreground/60">Operação comercial local</p>
      </div>
    </div>
  );
}

function PerfilSwitch({ perfil }: { perfil: "gestao" | "colaborador" }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-sidebar-foreground/50">
        Perfil de acesso
      </p>
      <div className="grid grid-cols-2 gap-1 rounded-md bg-sidebar-accent/50 p-1">
        {(["gestao", "colaborador"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPerfil(p)}
            className={cn(
              "min-h-8 rounded px-1 text-[11px] font-medium transition-colors",
              perfil === p
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground",
            )}
          >
            {p === "gestao" ? "Gestão" : "Colaborador"}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-[10px] text-sidebar-foreground/55">
        {perfil === "gestao"
          ? `Vendo ${colaboradores.length} colaboradores`
          : `Vendo apenas ${usuario.nome}`}
      </p>
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-input bg-surface pl-8 pr-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25"
      />
    </div>
  );
}

export { Button };
