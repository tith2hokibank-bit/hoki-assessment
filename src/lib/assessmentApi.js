const API_URL = import.meta.env.VITE_ASSESSMENT_API;

async function request(payload) {
  if (!API_URL) {
    throw new Error("VITE_ASSESSMENT_API belum dikonfigurasi.");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Respons API tidak valid.");
  }

  if (!response.ok || !result.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Terjadi kesalahan pada assessment."
    );
  }

  return result.data;
}

export function getOverview(token) {
  return request({
    action: "overview",
    token,
  });
}

export function startTest(token, testCode) {
  return request({
    action: "start",
    token,
    test_code: testCode,
  });
}

export function getSession(token, sessionId) {
  return request({
    action: "session",
    token,
    session_id: sessionId,
  });
}

export function saveAnswer({
  token,
  sessionId,
  sessionQuestionId,
  selectedOption,
  leastOption = null,
  timeSpentSeconds = null,
}) {
  return request({
    action: "save",
    token,
    session_id: sessionId,
    session_question_id: sessionQuestionId,
    selected_option: selectedOption,
    least_option: leastOption,
    time_spent_seconds: timeSpentSeconds,
  });
}

export function submitTest(token, sessionId) {
  return request({
    action: "submit",
    token,
    session_id: sessionId,
  });
}
