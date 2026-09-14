import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX } from 'lucide-react';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-950 text-white">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
        <ShieldX className="h-8 w-8 text-red-400" />
      </div>
      <h1 className="mt-6 text-2xl font-bold">Akses Ditolak</h1>
      <p className="mt-2 max-w-sm text-center text-sm text-slate-400">
        Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi
        administrator jika Anda yakin ini sebuah kesalahan.
      </p>
      <button
        onClick={() => navigate('/dashboard', { replace: true })}
        className="mt-8 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
      >
        Kembali ke Dashboard
      </button>
    </div>
  );
};

export default UnauthorizedPage;
