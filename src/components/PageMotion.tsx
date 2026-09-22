import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { animate, createScope } from 'animejs';

export function PageMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const scope = createScope({
      root,
      mediaQueries: { reducedMotion: '(prefers-reduced-motion: reduce)' },
    }).add((self) => {
      if (!self || self.matches.reducedMotion || !root.current) return;
      // One animation owner: nested CSS stagger effects competed with Anime.js.
      animate(root.current, {
        opacity: [0.6, 1],
        translateY: [5, 0],
        duration: 220,
        ease: 'out(3)',
        onComplete: (animation) => animation.revert(),
      });
    });
    return () => scope.revert();
  }, []);

  return <div ref={root}>{children}</div>;
}
