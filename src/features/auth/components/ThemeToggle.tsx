import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === 'dark';
  const label = dark ? 'Aktifkan tema terang' : 'Aktifkan tema gelap';

  return (
    <Button variant="ghost" size="icon" type="button" onClick={() => setTheme(dark ? 'light' : 'dark')} aria-label={label} title={label}>
      {dark ? <Sun /> : <Moon />}
    </Button>
  );
}
