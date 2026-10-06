import { useEffect, useMemo, useState } from "react";
import { getOverview, startTest } from "./lib/assessmentApi";
import AssessmentDashboard from "./components/AssessmentDashboard";
import TestRunner from "./components/TestRunner";

function App() {
  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("token");
  }, []);

  const [overview, setOverview] = useState(null);
  const [activeTest, setActiveTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOverview() {
    if (!token) {
      setError("Link assessment tidak valid atau token tidak ditemukan.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await getOverview(token);
      setOverview(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOverview();
  }, [token]);

  async function handleStart(testCode) {
    try {
      setLoading(true);
      const session = await startTest(token, testCode);

      if (session.status === "COMPLETED") {
        await loadOverview();
        return;
      }

      if (!session.session_id) {
        throw new Error("Session test tidak ditemukan.");
      }

      setActiveTest({
        testCode,
        sessionId: session.session_id,
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleted() {
    setActiveTest(null);
    await loadOverview();
  }

  if (loading && !activeTest) {
    return (
      <div className="screen-center">
        <div className="loader" />
        <p>Memuat assessment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="screen-center">
        <div className="error-box">
          <div className="error-icon">!</div>
          <h2>Assessment tidak dapat dibuka</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (activeTest) {
    return (
      <TestRunner
        token={token}
        testCode={activeTest.testCode}
        sessionId={activeTest.sessionId}
        onCompleted={handleCompleted}
      />
    );
  }

  return (
    <AssessmentDashboard
      overview={overview}
      onStart={handleStart}
    />
  );
}

export default App;
