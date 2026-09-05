import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { ThemeToggle } from '../components/ThemeToggle';
import { LoginForm } from '../components/LoginForm';
import { CodePreview } from '../components/CodePreview';
import { LoginFormValues } from '../schemas/loginSchema';

const LoginPage: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState<string>('');
  const navigate = useNavigate();

  // Redirect otomatis jika pengguna sudah memiliki session token
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        const userData = JSON.parse(user);
        const role = userData.Role || userData.role;

        if (role === 'Admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/anggota/dashboard', { replace: true });
        }
      } catch (e) {
        // Hapus session jika JSON corrupt
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [navigate]);

  const handleLogin = async (values: LoginFormValues) => {
    setErrorMsg('');
    try {
      const data = await loginUser({ nama: values.nama, password: values.password });
      
      // Mengantisipasi format CamelCase atau PascalCase dari .NET
      const token = data.Token || data.token;
      const role = data.Role || data.role;

      if (!token) {
        setErrorMsg('Response dari server tidak valid.');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data));

      if (role === 'Admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/anggota/dashboard', { replace: true });
      }
    } catch (error: any) {
      // Menangkap pesan error dari backend Minimal API atau masalah jaringan
      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else if (error.response?.status === 401) {
        setErrorMsg('Nama atau Password salah!');
      } else {
        setErrorMsg('Gagal terhubung ke server. Coba lagi nanti.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-white">
      <header className="flex items-center justify-between border-b border-dashed border-slate-200 dark:border-slate-800 px-8 py-4">
        <span className="text-xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
          binarycodingspace
        </span>
        <ThemeToggle />
      </header>

      <main className="grid min-h-[calc(100vh-65px)] grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-center px-8 py-12 sm:px-16 lg:px-24">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Sign In</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Access your coding workspace.
            </p>
          </div>

          <LoginForm onSubmit={handleLogin} errorMsg={errorMsg} />
        </div>

        <CodePreview />
      </main>
    </div>
  );
};

export default LoginPage;
