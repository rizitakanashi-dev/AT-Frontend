import { PanelsTopLeft } from 'lucide-react';

export function Brand() {
  return <div className="brand-lockup flex items-center gap-3"><span className="brand-mark flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><PanelsTopLeft className="size-5" strokeWidth={1.8} /></span><div><p className="font-sans text-base font-semibold tracking-tight">Absensi<span className="text-primary"> Tefa</span></p><p className="text-sm text-muted-foreground">Teaching Factory</p></div></div>;
}
