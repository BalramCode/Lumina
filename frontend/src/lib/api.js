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

export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });
  let data = null;
  try { data = await response.json(); } catch { /* Safe fallback for malformed responses. */ }
  return { response, data };
}

export async function getCurrentSession() {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/session`, { credentials: "include" });
  let data = null;
  try { data = await response.json(); } catch { /* Missing session is treated as unauthenticated. */ }
  return { response, data };
}

export async function logoutUser(csrfToken) {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
    method: "POST",
    headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
    credentials: "include",
  });
  return { response };
}

async function directoryRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}/api/v1/professionals${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.csrfToken ? { "X-CSRF-Token": options.csrfToken } : {}),
    },
  });
  let data = null;
  try { data = await response.json(); } catch { /* A 204 or malformed response has no JSON payload. */ }
  return { response, data };
}

export function getProfessionalDirectory() {
  return directoryRequest("");
}

export function getProfessionalProfile(id) {
  return directoryRequest(`/${encodeURIComponent(id)}`);
}

export function getMyProfessionalProfile() {
  return directoryRequest("/me");
}

export function createProfessionalProfile(profile, csrfToken) {
  return directoryRequest("/me", { method: "POST", csrfToken, body: JSON.stringify(profile) });
}

export function updateProfessionalProfile(profile, csrfToken) {
  return directoryRequest("/me", { method: "PUT", csrfToken, body: JSON.stringify(profile) });
}
