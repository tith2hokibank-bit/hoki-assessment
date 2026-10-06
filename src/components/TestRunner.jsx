import { useEffect, useMemo, useRef, useState } from "react";
import {
  getSession,
  saveAnswer,
  submitTest,
} from "../lib/assessmentApi";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  CheckCircle2,
} from "lucide-react";

export default function TestRunner({
  token,
  sessionId,
  testCode,
  onCompleted,
}) {
  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const questionStart = useRef(Date.now());
  const autoSubmitStarted = useRef(false);

  async function loadSession() {
    try {
      const data = await getSession(token, sessionId);

      if (data.status !== "IN_PROGRESS") {
        onCompleted();
        return;
      }

      setSession(data);
      setRemaining(data.remaining_seconds ?? 0);
      setLoadError("");
    } catch (err) {
      setLoadError(err.message);
    }
  }

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  useEffect(() => {
    if (!session) return;

    const timer = setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  useEffect(() => {
    if (!session || remaining > 0 || autoSubmitStarted.current) return;
    autoSubmitStarted.current = true;
    handleSubmit(true);
  }, [remaining, session]);

  const answeredCount = useMemo(() => {
    if (!session?.questions) return 0;
    return session.questions.filter((q) => {
      if (!q.selected_option) return false;
      if (q.response_mode === "MOST_LEAST" && !q.least_option) return false;
      return true;
    }).length;
  }, [session]);

  async function persistAnswer(selected, least = null) {
    if (!session) return;

    const question = session.questions[currentIndex];
    const seconds = Math.max(
      0,
      Math.round((Date.now() - questionStart.current) / 1000)
    );

    setSaving(true);

    try {
      await saveAnswer({
        token,
        sessionId,
        sessionQuestionId: question.session_question_id,
        selectedOption: selected,
        leastOption: least,
        timeSpentSeconds: seconds,
      });

      setSession((current) => ({
        ...current,
        questions: current.questions.map((q, index) =>
          index === currentIndex
            ? {
                ...q,
                selected_option: selected,
                least_option: least,
              }
            : q
        ),
      }));
    } catch (err) {
      alert("Jawaban gagal disimpan: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(automatic = false) {
    if (submitting) return;

    if (!automatic) {
      const unanswered =
        session?.questions?.length - answeredCount;

      if (unanswered > 0) {
        const proceed = window.confirm(
          `${unanswered} soal belum lengkap. Tetap submit?`
        );
        if (!proceed) return;
      }

      const confirmSubmit = window.confirm(
        "Setelah disubmit, jawaban tidak dapat diubah. Lanjutkan?"
      );
      if (!confirmSubmit) return;
    }

    setSubmitting(true);

    try {
      await submitTest(token, sessionId);
      onCompleted();
    } catch (err) {
      alert(err.message);
      setSubmitting(false);
    }
  }

  function goTo(index) {
    setCurrentIndex(index);
    questionStart.current = Date.now();
  }

  if (loadError) {
    return (
      <div className="screen-center">
        <div className="error-box">
          <div className="error-icon">!</div>
          <h2>Test tidak dapat dimuat</h2>
          <p>{loadError}</p>
          <button className="start-button" onClick={loadSession}>
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="screen-center">
        <div className="loader" />
        <p>Memuat soal...</p>
      </div>
    );
  }

  const question = session.questions[currentIndex];
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="test-page">
      <header className="test-header">
        <div className="test-brand">
          <div className="brand-logo small">H</div>
          <div>
            <strong>HOKIbank</strong>
            <span>{testCode} Assessment</span>
          </div>
        </div>

        <div className={`timer ${remaining < 300 ? "warning" : ""}`}>
          <Clock3 size={18} />
          {String(minutes).padStart(2, "0")}:
          {String(seconds).padStart(2, "0")}
        </div>
      </header>

      <main className="test-container">
        <div className="test-progress">
          <span>
            Soal <strong>{currentIndex + 1}</strong> dari{" "}
            <strong>{session.questions.length}</strong>
          </span>
          <span>
            <CheckCircle2 size={16} />
            {answeredCount} terjawab
          </span>
        </div>

        <div className="progress-bar">
          <div
            style={{
              width: `${
                ((currentIndex + 1) / session.questions.length) * 100
              }%`,
            }}
          />
        </div>

        <section className="question-card">
          <p className="question-number">PERTANYAAN {currentIndex + 1}</p>

          {question.prompt_image_path && (
            <img
              className="question-image"
              src={question.prompt_image_path}
              alt="Soal"
            />
          )}

          <h2>{question.prompt_text}</h2>

          {question.response_mode === "MOST_LEAST" ? (
            <DiscQuestion
              key={question.session_question_id}
              question={question}
              saving={saving}
              onAnswer={persistAnswer}
            />
          ) : (
            <SingleChoiceQuestion
              question={question}
              saving={saving}
              onAnswer={(answer) => persistAnswer(answer)}
            />
          )}
        </section>

        <div className="question-jump">
          {session.questions.map((q, idx) => {
            const answered =
              q.selected_option &&
              (q.response_mode !== "MOST_LEAST" || q.least_option);

            return (
              <button
                key={q.session_question_id}
                className={`question-dot ${
                  idx === currentIndex ? "current" : ""
                } ${answered ? "answered" : ""}`}
                onClick={() => goTo(idx)}
                title={`Soal ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="navigation">
          <button
            className="secondary-button"
            disabled={currentIndex === 0}
            onClick={() => goTo(currentIndex - 1)}
          >
            <ArrowLeft size={17} />
            Sebelumnya
          </button>

          {currentIndex < session.questions.length - 1 ? (
            <button
              className="primary-button"
              onClick={() => goTo(currentIndex + 1)}
            >
              Selanjutnya
              <ArrowRight size={17} />
            </button>
          ) : (
            <button
              className="submit-button"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
            >
              {submitting ? "Menyimpan..." : "Selesai & Submit"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function SingleChoiceQuestion({ question, onAnswer, saving }) {
  return (
    <div className="options">
      {question.options.map((option) => {
        const active = question.selected_option === option.code;

        return (
          <button
            key={option.code}
            disabled={saving}
            className={`option ${active ? "active" : ""}`}
            onClick={() => onAnswer(option.code)}
          >
            <span className="option-code">{option.code}</span>
            <span className="option-text">{option.text}</span>
          </button>
        );
      })}
    </div>
  );
}

function DiscQuestion({ question, onAnswer, saving }) {
  const [most, setMost] = useState(question.selected_option ?? null);
  const [least, setLeast] = useState(question.least_option ?? null);

  async function chooseMost(code) {
    const newLeast = least === code ? null : least;
    setMost(code);
    setLeast(newLeast);

    if (newLeast) {
      await onAnswer(code, newLeast);
    }
  }

  async function chooseLeast(code) {
    const newMost = most === code ? null : most;
    setLeast(code);
    setMost(newMost);

    if (newMost) {
      await onAnswer(newMost, code);
    }
  }

  return (
    <div className="disc-options">
      <div className="disc-heading">
        <span>Pernyataan</span>
        <span>PALING</span>
        <span>PALING TIDAK</span>
      </div>

      {question.options.map((option) => (
        <div key={option.code} className="disc-row">
          <div className="disc-statement">
            <strong>{option.code}.</strong> {option.text}
          </div>

          <label className="radio-cell">
            <input
              type="radio"
              name={`most-${question.session_question_id}`}
              checked={most === option.code}
              disabled={saving}
              onChange={() => chooseMost(option.code)}
            />
          </label>

          <label className="radio-cell">
            <input
              type="radio"
              name={`least-${question.session_question_id}`}
              checked={least === option.code}
              disabled={saving}
              onChange={() => chooseLeast(option.code)}
            />
          </label>
        </div>
      ))}
    </div>
  );
}
