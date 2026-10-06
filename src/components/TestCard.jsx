import {
  Brain,
  Calculator,
  Users,
  Clock,
  CheckCircle2,
  Lock,
  Play,
} from "lucide-react";

const iconMap = {
  IQ: Brain,
  DISC: Users,
  MATH: Calculator,
};

const descriptionMap = {
  IQ: "Mengukur kemampuan logika, pola, analisis, dan penalaran.",
  DISC: "Memahami kecenderungan perilaku dan gaya kerja.",
  MATH: "Mengukur kemampuan numerik dan matematika dasar.",
};

export default function TestCard({ test, onStart }) {
  const Icon = iconMap[test.code] || Brain;
  const completed = test.status === "COMPLETED";
  const inProgress = test.status === "IN_PROGRESS";
  const notAssigned = !test.assigned;

  return (
    <div
      className={`test-card ${completed ? "completed" : ""} ${
        notAssigned ? "disabled" : ""
      }`}
    >
      <div className="test-card-top">
        <div className="test-icon">
          <Icon size={28} />
        </div>
        <span className="test-code">{test.code}</span>
      </div>

      <h3>{test.name}</h3>
      <p className="test-description">{descriptionMap[test.code]}</p>

      {test.assigned && (
        <div className="duration">
          <Clock size={16} />
          <span>{test.duration_minutes} menit</span>
        </div>
      )}

      {notAssigned && (
        <div className="test-status muted">
          <Lock size={16} />
          Tidak ditugaskan
        </div>
      )}

      {completed && (
        <div className="test-status success">
          <CheckCircle2 size={17} />
          Selesai
        </div>
      )}

      {test.assigned && !completed && (
        <button className="start-button" onClick={onStart}>
          <Play size={17} />
          {inProgress ? "Lanjutkan Tes" : "Mulai Tes"}
        </button>
      )}
    </div>
  );
}
