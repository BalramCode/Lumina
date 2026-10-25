const API_BASE_URL = (process.env.REACT_APP_BACKEND_URL || "http://localhost:5000")
  .replace(/\/$/, "");

export async function registerUser(registration) {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registration),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    // The UI presents a generic error for malformed or unexpected responses.
  }

  return { response, data };
}
