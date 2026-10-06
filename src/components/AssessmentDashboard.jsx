import TestCard from "./TestCard";

export default function AssessmentDashboard({ overview, onStart }) {
  const candidate = overview?.candidate;
  const allCompleted = overview?.status === "COMPLETED";

  return (
    <div className="page">
      <header className="header">
        <div className="brand">
          <div className="brand-logo">H</div>
          <div>
            <div className="brand-name">HOKIbank</div>
            <div className="brand-subtitle">Talent Assessment</div>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div className="eyebrow">HOKIBANK RECRUITMENT</div>
          <h1>Candidate Assessment</h1>
          <p className="welcome-text">
            Selamat datang, <strong>{candidate?.name}</strong>
          </p>

          <div className="candidate-box">
            <div>
              <span>Posisi yang dilamar</span>
              <strong>{candidate?.position}</strong>
            </div>
            <div>
              <span>Status Assessment</span>
              <strong>{overview?.status}</strong>
            </div>
          </div>
        </section>

        {allCompleted && (
          <div className="complete-banner">
            <div className="complete-icon">✓</div>
            <div>
              <strong>Assessment telah selesai</strong>
              <p>
                Terima kasih telah menyelesaikan seluruh assessment yang diberikan.
              </p>
            </div>
          </div>
        )}

        <section className="test-section">
          <div className="section-title">
            <h2>Assessment Anda</h2>
            <p>
              Selesaikan assessment yang ditugaskan oleh Human Capital HOKIbank.
            </p>
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

        <section className="instruction-box">
          <h3>Petunjuk Pengerjaan</h3>
          <p>Pastikan koneksi internet stabil sebelum memulai assessment.</p>
          <p>Waktu mulai berjalan setelah tombol Mulai Tes ditekan.</p>
          <p>Refresh halaman tidak akan mengembalikan waktu ke awal.</p>
          <p>Kerjakan secara mandiri dan pilih jawaban yang paling tepat.</p>
        </section>
      </main>
    </div>
  );
}
