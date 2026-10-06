import {
  BrainCircuit,
  Calculator,
  UsersRound,
  Clock3,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const configMap = {
  IQ: {
    Icon: BrainCircuit,
    label: "Cognitive Ability",
    description:
      "Mengukur kemampuan logika, pola, analisis, dan penalaran.",
    accent: "purple",
  },
  DISC: {
    Icon: UsersRound,
    label: "Work Style",
    description:
      "Memahami kecenderungan perilaku dan gaya kerja profesional.",
    accent: "rose",
  },
  MATH: {
    Icon: Calculator,
    label: "Numerical Ability",
    description:
      "Mengukur kemampuan numerik dan matematika dasar.",
    accent: "blue",
  },
};

export default function TestCard({ test, onStart }) {
  const config = configMap[test.code] ?? configMap.IQ;
  const Icon = config.Icon;

  const completed = test.status === "COMPLETED";
  const inProgress = test.status === "IN_PROGRESS";
  const notAssigned = !test.assigned;

  return (
    <article
      className={`premium-test-card ${config.accent} ${
        completed ? "completed" : ""
      } ${notAssigned ? "disabled" : ""}`}
    >
      <div className="card-accent-line" />

      <div className="test-card-top">
        <div className={`premium-test-icon ${config.accent}`}>
          <Icon size={27} />
        </div>

        <div className="test-card-code">{test.code}</div>
      </div>

      <div className="test-card-category">{config.label}</div>

      <h3>{test.name}</h3>

      <p className="test-description">
        {config.description}
      </p>

      <div className="test-card-meta">
        {test.assigned ? (
          <>
            <Clock3 size={16} />
            <span>{test.duration_minutes} menit</span>
          </>
        ) : (
          <>
            <Lock size={16} />
            <span>Tidak ditugaskan</span>
          </>
        )}
      </div>

      <div className="test-card-footer">
        {completed ? (
          <div className="completed-state">
            <CheckCircle2 size={18} />
            <span>Selesai</span>
          </div>
        ) : notAssigned ? (
          <div className="locked-state">
            <Lock size={16} />
            <span>Tidak perlu dikerjakan</span>
          </div>
        ) : (
          <button className="premium-start-button" onClick={onStart}>
            <span>
              {inProgress ? "Lanjutkan Tes" : "Mulai Tes"}
            </span>

            {inProgress ? (
              <Sparkles size={17} />
            ) : (
              <ArrowRight size={18} />
            )}
          </button>
        )}
      </div>
    </article>
  );
}
