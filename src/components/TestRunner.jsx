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
  AlertTriangle,
  Ban,
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
  const [cancelled, setCancelled] = useState(false);
  const [cancelMessage, setCancelMessage] = useState(
    "Tes ini telah dibatalkan oleh Human Capital HOKIbank."
  );
  const questionStart = useRef(Date.now());
  const autoSubmitStarted = useRef(false);

  function normalizeStatus(value) {
    return String(value ?? "")
      .trim()
      .toUpperCase();
  }

  function getAssignmentStatus(data) {
    return normalizeStatus(
      data?.assignment_status ??
        data?.assignment?.status ??
        data?.test_status ??
        data?.assessment_status ??
        ""
    );
  }

  function isCancelledResponse(data) {
    const assignmentStatus =
      getAssignmentStatus(data);

    const sessionStatus =
      normalizeStatus(
        data?.status
      );

    return (
      assignmentStatus === "CANCELLED" ||
      sessionStatus === "CANCELLED"
    );
  }

  function markCancelled(message) {
    setCancelled(true);
    setSession(null);
    setLoadError("");
    setCancelMessage(
      message ||
        "Tes ini telah dibatalkan oleh Human Capital HOKIbank."
    );
  }

  async function checkStillActive() {
    try {
      const data =
        await getSession(
          token,
          sessionId
        );

      if (
        isCancelledResponse(
          data
        )
      ) {
        markCancelled(
          data?.message
        );

        return {
          active: false,
          cancelled: true,
          data,
        };
      }

      if (
        normalizeStatus(
          data?.status
        ) !== "IN_PROGRESS"
      ) {
        return {
          active: false,
          cancelled: false,
          data,
        };
      }

      return {
        active: true,
        cancelled: false,
        data,
      };
    } catch (err) {
      /*
        Jangan langsung menganggap cancelled
        hanya karena koneksi gagal.
        Error asli tetap ditangani oleh proses pemanggil.
      */
      throw err;
    }
  }

  async function loadSession() {
    try {
      const data =
        await getSession(
          token,
          sessionId
        );

      if (
        isCancelledResponse(
          data
        )
      ) {
        markCancelled(
          data?.message
        );
        return;
      }

      if (
        normalizeStatus(
          data?.status
        ) !== "IN_PROGRESS"
      ) {
        onCompleted();
        return;
      }

      setCancelled(false);
      setSession(data);
      setRemaining(
        data.remaining_seconds ?? 0
      );
      setLoadError("");
    } catch (err) {
      setLoadError(
        err.message
      );
    }
  }

  useEffect(() => {
    setCancelled(false);
    autoSubmitStarted.current = false;
    loadSession();
  }, [sessionId]);

  /*
    Re-check server selama tes berjalan.
    Ini membuat kandidat yang sedang mengerjakan
    segera dihentikan setelah HC membatalkan tes.

    Backend tetap wajib melakukan validasi CANCELLED
    pada save/submit; polling ini hanya proteksi UX.
  */
  useEffect(() => {
    if (
      !session ||
      cancelled
    ) {
      return;
    }

    const interval =
      setInterval(
        async () => {
          try {
            const result =
              await checkStillActive();

            if (
              !result.active &&
              !result.cancelled
            ) {
              onCompleted();
            }
          } catch (err) {
            console.warn(
              "Session re-check failed:",
              err
            );
          }
        },
        10000
      );

    return () =>
      clearInterval(
        interval
      );
  }, [
    sessionId,
    session,
    cancelled,
  ]);

  useEffect(() => {
    if (!session || cancelled) return;

    const timer = setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  useEffect(() => {
    if (
      !session ||
      cancelled ||
      remaining > 0 ||
      autoSubmitStarted.current
    ) return;

    autoSubmitStarted.current = true;
    handleSubmit(true);
  }, [remaining, session]);

  const answeredCount = useMemo(() => {
    if (!session?.questions) return 0;

    return session.questions.filter((q) => {
      if (!q.selected_option) return false;

      if (
        q.response_mode === "MOST_LEAST" &&
        !q.least_option
      ) {
        return false;
      }

      return true;
    }).length;
  }, [session]);

  async function persistAnswer(selected, least = null) {
    if (
      !session ||
      cancelled
    ) return;

    const question = session.questions[currentIndex];

    const seconds = Math.max(
      0,
      Math.round(
        (Date.now() - questionStart.current) / 1000
      )
    );

    setSaving(true);

    try {
      await saveAnswer({
        token,
        sessionId,
        sessionQuestionId:
          question.session_question_id,
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
      const message =
        String(
          err?.message || ""
        );

      if (
        message
          .toUpperCase()
          .includes(
            "CANCEL"
          )
      ) {
        markCancelled(
          "Tes ini telah dibatalkan oleh Human Capital HOKIbank."
        );
      } else {
        alert(
          "Jawaban gagal disimpan: " +
            message
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(automatic = false) {
    if (submitting) return;

    if (!automatic) {
      const unanswered =
        session?.questions?.length -
        answeredCount;

      if (unanswered > 0) {
        const proceed =
          window.confirm(
            `${unanswered} soal belum lengkap. Tetap submit?`
          );

        if (!proceed) return;
      }

      const confirmSubmit =
        window.confirm(
          "Setelah disubmit, jawaban tidak dapat diubah. Lanjutkan?"
        );

      if (!confirmSubmit) return;
    }

    setSubmitting(true);

    try {
      const current =
        await checkStillActive();

      if (
        !current.active
      ) {
        setSubmitting(false);

        if (
          !current.cancelled
        ) {
          onCompleted();
        }

        return;
      }

      await submitTest(
        token,
        sessionId
      );

      onCompleted();
    } catch (err) {
      const message =
        String(
          err?.message || ""
        );

      if (
        message
          .toUpperCase()
          .includes(
            "CANCEL"
          )
      ) {
        markCancelled(
          "Tes ini telah dibatalkan oleh Human Capital HOKIbank."
        );
      } else {
        alert(
          message
        );
      }

      setSubmitting(false);
    }
  }

  function goTo(index) {
    setCurrentIndex(index);
    questionStart.current = Date.now();
  }

  if (cancelled) {
    return (
      <div className="screen-center">
        <div className="error-box">
          <div className="error-icon">
            <Ban size={30} />
          </div>

          <h2>
            Tes telah dibatalkan
          </h2>

          <p>
            {cancelMessage}
          </p>

          <button
            className="premium-start-button full"
            onClick={onCompleted}
          >
            Kembali ke Assessment
          </button>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="screen-center">
        <div className="error-box">
          <div className="error-icon">!</div>
          <h2>Test tidak dapat dimuat</h2>
          <p>{loadError}</p>
          <button
            className="premium-start-button full"
            onClick={loadSession}
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="screen-center">
        <div className="loader-orbit">
          <div className="loader-dot" />
        </div>
        <p>Menyiapkan soal...</p>
      </div>
    );
  }

  const question =
    session.questions[currentIndex];

  const minutes =
    Math.floor(remaining / 60);

  const seconds =
    remaining % 60;

  const progress =
    Math.round(
      ((currentIndex + 1) /
        session.questions.length) *
        100
    );

  return (
    <div className="runner-page">
      <header className="runner-header">
        <div className="runner-header-inner">
          <div className="runner-brand">
            <img
              src="/Logo-HOKIbank.png"
              alt="HOKIbank"
              className="runner-logo"
            />

            <div className="brand-divider" />

            <div>
              <strong>{testCode} Assessment</strong>
              <span>HOKIbank Talent Assessment</span>
            </div>
          </div>

          <div
            className={`runner-timer ${
              remaining < 300
                ? "warning"
                : ""
            }`}
          >
            <Clock3 size={18} />
            <span>
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </span>
          </div>
        </div>
      </header>

      <main className="runner-container">
        <div className="runner-summary">
          <div>
            <span className="runner-eyebrow">
              PROGRESS TEST
            </span>

            <h1>
              Soal {currentIndex + 1}
              <span>
                {" "}
                / {session.questions.length}
              </span>
            </h1>
          </div>

          <div className="answered-chip">
            <CheckCircle2 size={16} />
            {answeredCount} terjawab
          </div>
        </div>

        <div className="runner-progress-track">
          <div
            className="runner-progress-value"
            style={{ width: `${progress}%` }}
          />
        </div>

        {remaining < 300 && (
          <div className="time-warning">
            <AlertTriangle size={17} />
            Waktu tersisa kurang dari 5 menit. Tetap tenang dan
            selesaikan soal yang tersisa.
          </div>
        )}

        <section className="premium-question-card">
          <div className="question-card-header">
            <div className="question-badge">
              PERTANYAAN {currentIndex + 1}
            </div>

            {saving && (
              <div className="saving-indicator">
                Menyimpan...
              </div>
            )}
          </div>

          {question.prompt_image_path && (
            <img
              className="question-image"
              src={question.prompt_image_path}
              alt="Soal"
            />
          )}

          <h2>{question.prompt_text}</h2>

          {question.response_mode ===
          "MOST_LEAST" ? (
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
              onAnswer={(answer) =>
                persistAnswer(answer)
              }
            />
          )}
        </section>

        <section className="question-navigator-panel">
          <div className="navigator-header">
            <strong>Navigasi Soal</strong>
            <span>
              Hijau = sudah dijawab
            </span>
          </div>

          <div className="question-jump">
            {session.questions.map((q, idx) => {
              const answered =
                q.selected_option &&
                (q.response_mode !==
                  "MOST_LEAST" ||
                  q.least_option);

              return (
                <button
                  key={q.session_question_id}
                  className={`question-dot ${
                    idx === currentIndex
                      ? "current"
                      : ""
                  } ${
                    answered
                      ? "answered"
                      : ""
                  }`}
                  onClick={() => goTo(idx)}
                  title={`Soal ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </section>

        <div className="runner-navigation">
          <button
            className="runner-secondary-button"
            disabled={currentIndex === 0}
            onClick={() =>
              goTo(currentIndex - 1)
            }
          >
            <ArrowLeft size={17} />
            Sebelumnya
          </button>

          {currentIndex <
          session.questions.length - 1 ? (
            <button
              className="runner-primary-button"
              onClick={() =>
                goTo(currentIndex + 1)
              }
            >
              Selanjutnya
              <ArrowRight size={17} />
            </button>
          ) : (
            <button
              className="runner-submit-button"
              disabled={submitting}
              onClick={() =>
                handleSubmit(false)
              }
            >
              {submitting
                ? "Menyimpan..."
                : "Selesai & Submit"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function SingleChoiceQuestion({
  question,
  onAnswer,
  saving,
}) {
  return (
    <div className="premium-options">
      {question.options.map((option) => {
        const active =
          question.selected_option ===
          option.code;

        return (
          <button
            key={option.code}
            disabled={saving}
            className={`premium-option ${
              active ? "active" : ""
            }`}
            onClick={() =>
              onAnswer(option.code)
            }
          >
            <span className="premium-option-code">
              {option.code}
            </span>

            <span className="premium-option-text">
              {option.text}
            </span>

            <span className="premium-option-check">
              {active ? "✓" : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function DiscQuestion({
  question,
  onAnswer,
  saving,
}) {
  const [most, setMost] = useState(
    question.selected_option ?? null
  );

  const [least, setLeast] = useState(
    question.least_option ?? null
  );

  async function chooseMost(code) {
    const newLeast =
      least === code ? null : least;

    setMost(code);
    setLeast(newLeast);

    if (newLeast) {
      await onAnswer(code, newLeast);
    }
  }

  async function chooseLeast(code) {
    const newMost =
      most === code ? null : most;

    setLeast(code);
    setMost(newMost);

    if (newMost) {
      await onAnswer(newMost, code);
    }
  }

  return (
    <div className="premium-disc">
      <div className="disc-instruction">
        Pilih satu pernyataan yang
        <strong> PALING </strong>
        menggambarkan Anda dan satu yang
        <strong> PALING TIDAK </strong>
        menggambarkan Anda.
      </div>

      <div className="disc-table">
        <div className="disc-heading">
          <span>Pernyataan</span>
          <span>PALING</span>
          <span>PALING TIDAK</span>
        </div>

        {question.options.map((option) => (
          <div
            key={option.code}
            className="disc-row"
          >
            <div className="disc-statement">
              <span className="disc-letter">
                {option.code}
              </span>

              <span>
                {option.text}
              </span>
            </div>

            <label className="radio-cell">
              <input
                type="radio"
                name={`most-${question.session_question_id}`}
                checked={
                  most === option.code
                }
                disabled={saving}
                onChange={() =>
                  chooseMost(option.code)
                }
              />
            </label>

            <label className="radio-cell">
              <input
                type="radio"
                name={`least-${question.session_question_id}`}
                checked={
                  least === option.code
                }
                disabled={saving}
                onChange={() =>
                  chooseLeast(option.code)
                }
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
