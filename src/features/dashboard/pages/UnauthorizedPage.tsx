import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { roleHomePath } from '../../../lib/roles';
import { USER_KEY } from '../../absensi/services/authService';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  const goHome = () => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      const role = raw ? JSON.parse(raw).role : '';
      navigate(roleHomePath(role), { replace: true });
    } catch {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center" style={{ backgroundColor: '#121316', color: '#FFFFFF' }}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: 'rgba(255,77,77,0.12)' }}>
        <ShieldX className="h-8 w-8" style={{ color: '#FF6B6B' }} />
      </div>
      <h1 className="mt-6 text-2xl font-bold">Akses Ditolak</h1>
      <p className="mt-2 max-w-sm text-center text-sm" style={{ color: '#8A8F99' }}>
        Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi
        administrator jika Anda yakin ini sebuah kesalahan.
      </p>
      <button
        onClick={goHome}
        className="mt-8 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors"
        style={{ backgroundColor: '#10B981', color: '#121316' }}
      >
        Kembali ke Beranda
      </button>
    </div>
  );
};

export default UnauthorizedPage;