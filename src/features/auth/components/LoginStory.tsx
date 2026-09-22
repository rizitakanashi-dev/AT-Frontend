import { ArrowUpRight, ClipboardCheck, FolderKanban, Target } from 'lucide-react';

export function LoginStory() {
  return (
    <section className="access-story" aria-labelledby="access-story-title">
      <div className="access-eyebrow"><span /> RUANG KERJA TEACHING FACTORY</div>
      <div className="access-story-heading">
        <h2 id="access-story-title">Kerja terarah.<br />Tumbuh <span>bersama.</span></h2>
        <p>Satu tempat untuk kehadiran, proyek, dan setiap progres kecil yang berarti.</p>
      </div>
      <figure className="access-photo">
        <img src="/images/tefa-workspace.webp" alt="Ruang kolaborasi dengan laptop dan perangkat pengembangan" width="1200" height="1200" fetchPriority="high" />
        <figcaption><span>Tempat ide menjadi karya.</span><ArrowUpRight size={17} aria-hidden="true" /></figcaption>
      </figure>
      <div className="access-tools" aria-label="Fitur workspace">
        <span><ClipboardCheck size={15} aria-hidden="true" /> Kehadiran</span>
        <span><FolderKanban size={15} aria-hidden="true" /> Proyek</span>
        <span><Target size={15} aria-hidden="true" /> Target kerja</span>
      </div>
      <div className="access-story-footer"><span>BELAJAR. BERKARYA. BERTUMBUH.</span><span>01 — TF</span></div>
    </section>
  );
}
