import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  const dark = resolvedTheme === 'dark';

  async function toggleTheme() {
    if (running.current) return;
    const next = dark ? 'light' : 'dark';
    const apply = () => flushSync(() => setTheme(next));
    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      apply();
      return;
    }
    running.current = true;
    setBusy(true);
    try {
      const transition = document.startViewTransition(apply);
      await transition.ready;
      await document.documentElement.animate({
        clipPath: dark ? ['inset(0 100% 0 0)', 'inset(0 0 0 0)'] : ['inset(0 0 0 100%)', 'inset(0 0 0 0)'],
        transform: [dark ? 'translateX(-28px)' : 'translateX(28px)', 'translateX(0)'],
      }, { duration: 620, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' }).finished;
      await transition.finished;
    } catch {
      apply();
    } finally {
      running.current = false;
      setBusy(false);
    }
  }

  return <Button variant="outline" size="icon" type="button" disabled={busy} onClick={() => void toggleTheme()} aria-label={dark ? 'Aktifkan tema terang' : 'Aktifkan tema gelap'} title={dark ? 'Tema terang' : 'Tema gelap'}>
    {dark ? <Sun /> : <Moon />}
  </Button>;
}
