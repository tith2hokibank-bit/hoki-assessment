import {
  BrainCircuit,
  Calculator,
  UsersRound,
  Clock3,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Ban,
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


export default function TestCard({
  test,
  onStart,
}) {

  const config =
    configMap[test?.code] ??
    configMap.IQ;


  const Icon =
    config.Icon;


  /* =========================================================
     NORMALIZE STATUS
  ========================================================= */

  const status =
    String(
      test?.status ||
      "NOT_STARTED"
    )
      .trim()
      .toUpperCase();


  const completed =
    status ===
    "COMPLETED";


  const inProgress =
    status ===
    "IN_PROGRESS";


  const cancelled =
    status ===
    "CANCELLED";


  const notAssigned =
    !test?.assigned;


  /* =========================================================
     SAFE START
  ========================================================= */

  const handleStart =
    () => {

      /*
        Jangan pernah mulai test
        yang sudah dibatalkan.
      */

      if (
        cancelled
      ) {

        return;
      }


      /*
        Completed tidak boleh
        dikerjakan ulang.
      */

      if (
        completed
      ) {

        return;
      }


      /*
        Tidak ditugaskan.
      */

      if (
        notAssigned
      ) {

        return;
      }


      /*
        Hanya NOT_STARTED dan
        IN_PROGRESS yang boleh masuk.
      */

      if (
        status !==
          "NOT_STARTED" &&
        status !==
          "IN_PROGRESS"
      ) {

        return;
      }


      if (
        typeof onStart ===
        "function"
      ) {

        onStart();

      }

    };


  return (

    <article

      className={`
        premium-test-card
        ${config.accent}
        ${completed ? "completed" : ""}
        ${cancelled ? "cancelled" : ""}
        ${
          notAssigned ||
          cancelled
            ? "disabled"
            : ""
        }
      `}

    >

      {/* =====================================================
          ACCENT
      ====================================================== */}

      <div
        className="card-accent-line"
      />


      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="test-card-top">

        <div
          className={`
            premium-test-icon
            ${config.accent}
          `}
        >

          <Icon
            size={27}
          />

        </div>


        <div className="test-card-code">

          {test?.code}

        </div>

      </div>


      {/* =====================================================
          CATEGORY
      ====================================================== */}

      <div className="test-card-category">

        {config.label}

      </div>


      {/* =====================================================
          NAME
      ====================================================== */}

      <h3>

        {test?.name}

      </h3>


      {/* =====================================================
          DESCRIPTION
      ====================================================== */}

      <p className="test-description">

        {config.description}

      </p>


      {/* =====================================================
          META
      ====================================================== */}

      <div className="test-card-meta">

        {cancelled ? (

          <>

            <Ban
              size={16}
            />

            <span>
              Dibatalkan oleh Human Capital
            </span>

          </>

        ) : notAssigned ? (

          <>

            <Lock
              size={16}
            />

            <span>
              Tidak ditugaskan
            </span>

          </>

        ) : (

          <>

            <Clock3
              size={16}
            />

            <span>

              {test?.duration_minutes}
              {" "}
              menit

            </span>

          </>

        )}

      </div>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <div className="test-card-footer">

        {/* =====================
            COMPLETED
        ====================== */}

        {completed ? (

          <div className="completed-state">

            <CheckCircle2
              size={18}
            />

            <span>
              Selesai
            </span>

          </div>


        /* =====================
           CANCELLED
        ====================== */

        ) : cancelled ? (

          <div className="cancelled-state">

            <Ban
              size={18}
            />

            <span>
              Tes Dibatalkan
            </span>

          </div>


        /* =====================
           NOT ASSIGNED
        ====================== */

        ) : notAssigned ? (

          <div className="locked-state">

            <Lock
              size={16}
            />

            <span>
              Tidak perlu dikerjakan
            </span>

          </div>


        /* =====================
           ACTIVE
        ====================== */

        ) : (

          <button

            type="button"

            className="premium-start-button"

            onClick={
              handleStart
            }

          >

            <span>

              {
                inProgress
                  ? "Lanjutkan Tes"
                  : "Mulai Tes"
              }

            </span>


            {inProgress ? (

              <Sparkles
                size={17}
              />

            ) : (

              <ArrowRight
                size={18}
              />

            )}

          </button>

        )}

      </div>

    </article>

  );
}
