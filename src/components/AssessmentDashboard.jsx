import {
  Sparkles,
  ShieldCheck,
  Wifi,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import TestCard from "./TestCard";

export default function AssessmentDashboard({ overview, onStart }) {
  const candidate = overview?.candidate;

  const assignedTests = overview?.tests?.filter((t) => t.assigned) ?? [];
  const completedTests =
    assignedTests.filter((t) => t.status === "COMPLETED") ?? [];

  const assignedCount = assignedTests.length;
  const completedCount = completedTests.length;

  const progress =
    assignedCount > 0
      ? Math.round((completedCount / assignedCount) * 100)
      : 0;

  const allCompleted = overview?.status === "COMPLETED";

  return (
    <div className="page">
      <header className="premium-header">
        <div className="header-inner">
          <div className="brand">
            <img
              src="/Logo-HOKIbank.png"
              alt="HOKIbank"
              className="brand-logo-image"
            />

            <div className="brand-divider" />

            <div>
              <div className="brand-product">Talent Assessment</div>
              <div className="brand-caption">Recruitment Experience</div>
            </div>
          </div>

          <div className="header-badge">
            <ShieldCheck size={15} />
            Secure Assessment
          </div>
        </div>
      </header>

      <main className="premium-container">
        <section className="premium-hero">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />

          <div className="hero-copy">
            <div className="hero-kicker">
              <Sparkles size={16} />
              HOKIBANK RECRUITMENT
            </div>

            <h1>
              Tunjukkan potensi terbaik Anda.
            </h1>

            <p className="hero-lead">
              Halo <strong>{candidate?.name}</strong>, selamat datang di tahap
              assessment HOKIbank. Kerjakan setiap tes dengan tenang, fokus,
              dan percaya diri.
            </p>

            <div className="hero-encouragement">
              <span className="encouragement-dot" />
              Assessment ini membantu kami memahami cara berpikir, kemampuan
              numerik, dan gaya kerja Anda secara lebih utuh.
            </div>
          </div>

          <div className="hero-side">
            <div className="candidate-panel">
              <div className="candidate-panel-label">KANDIDAT</div>
              <div className="candidate-name">{candidate?.name}</div>
              <div className="candidate-position">
                {candidate?.position}
              </div>

              <div className="candidate-separator" />

              <div className="progress-topline">
                <span>Progress Assessment</span>
                <strong>{progress}%</strong>
              </div>

              <div className="hero-progress-track">
                <div
                  className="hero-progress-value"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="progress-caption">
                {completedCount} dari {assignedCount} tes selesai
              </div>
            </div>
          </div>
        </section>

        {allCompleted ? (
          <section className="completion-panel">
            <div className="completion-icon">
              <CheckCircle2 size={28} />
            </div>

            <div>
              <div className="completion-title">
                Seluruh assessment telah selesai
              </div>

              <p>
                Terima kasih telah memberikan usaha terbaik Anda. Seluruh
                jawaban telah tersimpan dan akan ditinjau oleh Human Capital
                HOKIbank.
              </p>
            </div>
          </section>
        ) : (
          <section className="motivation-strip">
            <div className="motivation-icon">
              <Sparkles size={19} />
            </div>

            <div>
              <strong>Anda sudah siap. Kerjakan satu per satu.</strong>
              <span>
                Fokus pada setiap pertanyaan dan jangan terburu-buru.
              </span>
            </div>
          </section>
        )}

        <section className="assessment-section">
          <div className="section-heading-row">
            <div>
              <div className="section-overline">YOUR ASSESSMENT</div>
              <h2>Assessment Anda</h2>
              <p>
                Selesaikan tes yang telah ditugaskan oleh Human Capital
                HOKIbank.
              </p>
            </div>

            <div className="section-progress-pill">
              {completedCount}/{assignedCount} selesai
            </div>
          </div>

          <div className="test-grid">
            {overview?.tests?.map((test) => (
              <TestCard
                key={test.code}
                test={test}
                onStart={() => onStart(test.code)}
              />
            ))}
          </div>
        </section>

        <section className="tips-panel">
          <div className="tips-heading">
            <div>
              <div className="section-overline">BEFORE YOU START</div>
              <h3>Persiapkan diri sebelum memulai</h3>
            </div>
          </div>

          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-icon">
                <Wifi size={20} />
              </div>
              <div>
                <strong>Koneksi stabil</strong>
                <span>
                  Gunakan jaringan internet yang stabil selama assessment.
                </span>
              </div>
            </div>

            <div className="tip-card">
              <div className="tip-icon">
                <Clock3 size={20} />
              </div>
              <div>
                <strong>Siapkan waktu</strong>
                <span>
                  Timer berjalan setelah tes dimulai dan tidak dapat di-reset.
                </span>
              </div>
            </div>

            <div className="tip-card">
              <div className="tip-icon">
                <ShieldCheck size={20} />
              </div>
              <div>
                <strong>Kerjakan mandiri</strong>
                <span>
                  Pilih jawaban yang paling sesuai dengan kemampuan Anda.
                </span>
              </div>
            </div>
          </div>
        </section>

        <footer className="candidate-footer">
          <span>HOKIbank Talent Assessment</span>
          <span>•</span>
          <span>Human Capital</span>
        </footer>
      </main>
    </div>
  );
}
