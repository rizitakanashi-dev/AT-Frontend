import React from 'react';

export const CodePreview: React.FC = () => (
  <div className="relative hidden flex-col justify-center bg-slate-100/50 p-12 lg:flex dark:bg-zinc-950">
    <div className="mx-auto max-w-lg">
      <h2 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Join the Future of Code
      </h2>
      <p className="mt-4 text-slate-600 dark:text-slate-400">
        Experience a high-performance development environment engineered for speed, clarity, and structural integrity.
      </p>

      <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center space-x-2 border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
          <span className="h-3 w-3 rounded-full bg-red-500 inline-block"></span>
          <span className="h-3 w-3 rounded-full bg-amber-500 inline-block"></span>
          <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block"></span>
        </div>
        <div className="p-6 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200">
          <p className="text-right text-slate-400">();</p>
          <p><span className="text-amber-600 dark:text-amber-400">const</span> <span className="text-emerald-500 dark:text-emerald-400">developer</span> = <span className="text-amber-600 dark:text-amber-400">new</span> BinaryCodingSpace</p>
          <br />
          <p><span className="text-amber-600 dark:text-amber-400">await</span> developer.<span className="text-emerald-500 dark:text-emerald-400">initialize</span>(&#123;</p>
          <p className="pl-6">focus: <span className="text-amber-600 dark:text-amber-400">true</span>,</p>
          <p className="pl-6">performance: <span className="text-emerald-600 dark:text-emerald-400">'maximum'</span></p>
          <p>&#125;);</p>
          <br />
          <p>developer.<span className="text-emerald-500 dark:text-emerald-400">deploy</span>();</p>
        </div>
      </div>
    </div>
  </div>
);
