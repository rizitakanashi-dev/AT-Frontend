import React from 'react';
import { Clock, FolderKanban, CheckCircle2, TrendingUp } from 'lucide-react';

export const CodePreview: React.FC = () => (
  <div className="relative hidden flex-col justify-center p-12 lg:flex" style={{ backgroundColor: '#18191C' }}>
    <div className="mx-auto max-w-lg">
      <h2 className="text-4xl font-extrabold tracking-tight">binarycodingspace</h2>
      <p className="mt-4 text-sm" style={{ color: '#8A8F99' }}>
        Kelola kehadiran, target kerja, dan performa tim dalam satu papan.
      </p>

      {/* Mock dashboard preview */}
      <div className="mt-10 overflow-hidden rounded-2xl" style={{ backgroundColor: '#1E2024', border: '1px solid #2D3036' }}>
        <div className="flex items-center gap-3 px-4 py-3 text-xs" style={{ color: '#8A8F99', borderBottom: '1px solid #2D3036' }}>
          <span className="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold" style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10B981' }}>A</span>
          binarycodingspace, hari ini
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-3 gap-3 p-5">
          <div className="rounded-xl p-3" style={{ backgroundColor: '#25282E' }}>
            <Clock className="h-4 w-4 mb-1.5" style={{ color: '#10B981' }} />
            <p className="text-lg font-bold">08:12</p>
            <p className="text-[10px]" style={{ color: '#8A8F99' }}>Jam Masuk</p>
          </div>
          <div className="rounded-xl p-3" style={{ backgroundColor: '#25282E' }}>
            <FolderKanban className="h-4 w-4 mb-1.5" style={{ color: '#20E6B7' }} />
            <p className="text-lg font-bold">3</p>
            <p className="text-[10px]" style={{ color: '#8A8F99' }}>Project</p>
          </div>
          <div className="rounded-xl p-3" style={{ backgroundColor: '#25282E' }}>
            <CheckCircle2 className="h-4 w-4 mb-1.5" style={{ color: '#FF9F43' }} />
            <p className="text-lg font-bold">98%</p>
            <p className="text-[10px]" style={{ color: '#8A8F99' }}>Kehadiran</p>
          </div>
        </div>

        {/* Work log preview */}
        <div className="border-t px-5 py-4" style={{ borderColor: '#2D3036' }}>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium" style={{ color: '#8A8F99' }}>Aktivitas hari ini</p>
            <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]" style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
              <TrendingUp className="h-3 w-3" /> On Track
            </span>
          </div>
          <div className="space-y-2.5">
            {['Develop dashboard UI', 'Refactor API controllers', 'Testing integrasi'].map((task, i) => (
              <div key={task} className="flex items-center gap-3 text-xs">
                <span className="text-[10px]" style={{ color: '#10B981' }}>{i === 0 ? '08:12' : i === 1 ? '10:45' : '13:20'}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: '#25282E' }}>
                  <div className="h-full rounded-full" style={{ width: `${[95, 60, 30][i]}%`, backgroundColor: i === 2 ? '#FF9F43' : '#10B981' }} />
                </div>
                <span style={{ color: '#8A8F99' }}>{task}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);