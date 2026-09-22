import { PanelsTopLeft } from 'lucide-react';

export function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="brand-lockup flex items-center gap-3">
      <div className="brand-mark">
        <PanelsTopLeft className="size-[18px]" strokeWidth={1.8} aria-hidden="true" />
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="brand-name">Absensi Tefa<span className="text-primary">.</span></span>
          <span className="brand-caption">Teaching Factory</span>
        </div>
      )}
    </div>
  );
}
