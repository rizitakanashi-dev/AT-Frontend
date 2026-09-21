import { PanelsTopLeft } from 'lucide-react';

export function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="brand-lockup flex items-center gap-3">
      <div className="brand-mark relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
        <PanelsTopLeft className="size-4.5" strokeWidth={2} />
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-sans text-[15px] font-bold tracking-tight text-white">Absensi</span>
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[11px] font-semibold tracking-wider text-emerald-400 uppercase ring-1 ring-emerald-500/30">Tefa</span>
          </div>
          <span className="text-[11px] font-medium text-zinc-400">Teaching Factory</span>
        </div>
      )}
    </div>
  );
}
