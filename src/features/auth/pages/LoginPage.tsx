import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, TOKEN_KEY, USER_KEY, clearSession } from '../../absensi/services/authService';
import { ThemeToggle } from '../components/ThemeToggle';
import { LoginForm } from '../components/LoginForm';
import { CodePreview } from '../components/CodePreview';
import { LoginFormValues } from '../schemas/loginSchema';
import { roleHomePath } from '../../../lib/roles';

const LoginPage: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState<string>('');
  const navigate = useNavigate();

  // Redirect otomatis jika pengguna sudah memiliki session token
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);

    if (token && user) {
      try {
        const userData = JSON.parse(user);
        if (userData.role) {
          navigate(roleHomePath(userData.role), { replace: true });
        }
      } catch {
        clearSession();
      }
    }
  }, [navigate]);

  const handleLogin = async (values: LoginFormValues) => {
    setErrorMsg('');
    try {
      const loginResponse = await loginUser({ nama: values.nama, password: values.password });
      localStorage.setItem(TOKEN_KEY, loginResponse.token);
      localStorage.setItem(USER_KEY, JSON.stringify(loginResponse));
      navigate(roleHomePath(loginResponse.role), { replace: true });
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setErrorMsg(axiosErr?.response?.data?.message ?? 'Nama atau password salah. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#121316', color: '#FFFFFF' }}>
      <header className="flex items-center justify-between border-b px-8 py-4" style={{ borderColor: '#2D3036' }}>
        <span className="text-lg font-bold">binarycodingspace</span>
        <ThemeToggle />
      </header>

      <main className="grid min-h-[calc(100vh-65px)] grid-cols-1 items-center gap-8 px-8 py-12 sm:px-16 lg:grid-cols-2 lg:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Masuk ke Akun</h1>
            <p className="mt-2 text-sm" style={{ color: '#8A8F99' }}>
              Catat kehadiran dan aktivitas kerjamu.
            </p>
          </div>

          <div className="stem-surface p-8">
            <LoginForm onSubmit={handleLogin} errorMsg={errorMsg} />
          </div>
        </div>

        <CodePreview />
      </main>
    </div>
  );
};

export default LoginPage;