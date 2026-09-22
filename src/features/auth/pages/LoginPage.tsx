import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import { LoginStory } from '../components/LoginStory';
import { loginUser } from '@/features/absensi/services/authService';
import { getSession, saveSession } from '@/lib/session';
import { errorMessage } from '@/lib/api';
import { ThemeToggle } from '../components/ThemeToggle';
import { LoginForm } from '../components/LoginForm';
import { Brand } from '@/components/Brand';
import type { LoginFormValues } from '../schemas/loginSchema';
import { roleHomePath } from '@/lib/roles';
import '../login.css';


export default function LoginPage() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const session = getSession();
  if (session) return <Navigate to={roleHomePath(session.role)} replace />;

  async function submit(values: LoginFormValues) {
    setError('');
    try {
      const data = await loginUser(values);
      saveSession(data);
      await mutate(() => true, undefined, { revalidate: false });
      navigate(roleHomePath(data.role), { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="access-page">
      {/* Header */}
      <header className="access-header"><Brand /><div className="flex items-center gap-5"><span className="access-header-label">WORKSPACE / AKSES ANGGOTA</span><ThemeToggle /></div></header>
      {/* Main Content Stage */}
      <main className="access-main">
        <div className="access-frame">
          <LoginStory />
          {/* Right Form Side */}
          <section className="access-form-panel" aria-labelledby="login-title">
            <div className="access-form-inner">
              <p className="access-form-eyebrow"><span /> SELAMAT DATANG DI TEFA</p>
              <h1 id="login-title">Lanjutkan <br />progresmu.</h1>
              <p className="access-form-description">Masuk dengan akun yang telah diberikan oleh administrator Teaching Factory.</p>
              <LoginForm onSubmit={submit} errorMsg={error} />
              <details className="access-help"><summary>Butuh bantuan masuk?<ChevronDown size={14} aria-hidden="true" /></summary><p>Hubungi administrator Teaching Factory untuk bantuan akun atau pengaturan ulang kata sandi.</p></details>
              <div className="access-security"><ShieldCheck size={16} aria-hidden="true" /><span>Workspace khusus anggota Teaching Factory</span></div>
            </div>
          </section>
        </div>
      </main>
      {/* Footer */}
      <footer className="access-footer"><span>© {new Date().getFullYear()} Teaching Factory</span><span>Dirancang untuk kerja yang lebih baik.</span><span>by <strong>binarycodingspace</strong></span></footer>
    </div>
  );
}
