import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { ClipboardCheck, ShieldCheck, ArrowUpRight, Layers3, CircleCheck, Command } from 'lucide-react';
import { loginUser } from '@/features/absensi/services/authService';
import { getSession, saveSession } from '@/lib/session';
import { errorMessage } from '@/lib/api';
import { ThemeToggle } from '../components/ThemeToggle';
import { LoginForm } from '../components/LoginForm';
import { Brand } from '@/components/Brand';
import type { LoginFormValues } from '../schemas/loginSchema';
import { roleHomePath } from '@/lib/roles';
import '../login.css';

function WorkspaceIllustration() {
  return (
    <div className="access-preview" aria-label="Ilustrasi alur kerja, bukan data aktual">
      <div className="access-preview-heading"><span><Layers3 size={15} /> Workspace overview</span><span className="access-preview-label">ILUSTRASI</span></div>
      <div className="access-preview-body">
        <div className="access-preview-title"><div><small>ALUR KERJA TIM</small><h3>Dari rencana, jadi karya.</h3></div><ArrowUpRight size={21} /></div>
        <div className="access-workflow">
          {[{ icon: ClipboardCheck, name: 'Mulai hari', detail: 'Catat kehadiran' }, { icon: Layers3, name: 'Bangun progres', detail: 'Kelola target tim' }, { icon: CircleCheck, name: 'Wujudkan hasil', detail: 'Tinjau pencapaian' }].map(({ icon: Icon, name, detail }, index) => (
            <div className="access-workflow-row" key={name}><span className="access-workflow-icon"><Icon size={18} /></span><div><strong>{name}</strong><p>{detail}</p></div><span className="access-step">0{index + 1}</span></div>
          ))}
        </div>
        <div className="access-preview-bottom"><span className="access-avatar-stack"><i>PM</i><i>DV</i><i>TM</i></span><span>Satu ruang untuk setiap peran.</span></div>
      </div>
    </div>
  );
}

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
      <header className="access-header"><Brand /><div className="flex items-center gap-4"><span className="access-header-label">YOUR TEAM. ONE WORKSPACE.</span><ThemeToggle /></div></header>
      {/* Main Content Stage */}
      <main className="access-main">
        <div className="access-frame">
          {/* Left Showcase Side (SalesOps Inspired) */}
          <section className="access-story" aria-labelledby="access-story-title">
            {/* Top Badge */}
            <div className="access-eyebrow"><span /> TEACHING FACTORY WORKSPACE</div>
            <h2 id="access-story-title">Tim yang hebat.<br />Progres yang <em>nyata.</em></h2>
            <p className="access-story-copy">Satukan kehadiran, target, dan proyek. Fokus pada hal yang paling penting: tumbuh bersama tim.</p>
            {/* Simulated Live Ops Preview Card */}
            <WorkspaceIllustration />
            {/* Bottom features list */}
            <div className="access-story-footer"><span>Terhubung. Terarah. Terukur.</span><span>01 / WORKSPACE</span></div>
          </section>
          {/* Right Form Side */}
          <section className="access-form-panel" aria-labelledby="login-title">
            <div className="access-form-inner">
              <div className="access-form-mark"><Command size={25} /></div>
              <p className="access-form-eyebrow">MULAI HARI PRODUKTIFMU</p>
              <h1 id="login-title">Selamat datang kembali<span>.</span></h1>
              <p className="access-form-description">Masuk ke workspace dan lanjutkan hal hebat yang sedang kamu kerjakan.</p>
              <LoginForm onSubmit={submit} errorMsg={error} />
              <details className="access-help"><summary>Butuh bantuan masuk?</summary><p>Hubungi administrator Teaching Factory untuk bantuan akun atau pengaturan ulang kata sandi.</p></details>
              <div className="access-security"><ShieldCheck size={17} /><span>Akses khusus anggota Teaching Factory</span></div>
            </div>
          </section>
        </div>
      </main>
      {/* Footer */}
      <footer className="access-footer"><span>© {new Date().getFullYear()} Teaching Factory</span><span>Built for teams, designed for progress.</span><span>by binarycodingspace</span></footer>
    </div>
  );
}
