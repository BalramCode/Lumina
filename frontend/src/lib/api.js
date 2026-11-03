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

export function getProfessionalDirectory(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.type && params.type !== "All") searchParams.set("type", params.type);
  if (params.specialization && params.specialization.trim()) searchParams.set("specialization", params.specialization.trim());
  if (params.city && params.city !== "All") searchParams.set("city", params.city);
  if (params.location && params.location !== "All") searchParams.set("location", params.location);
  if (params.lang && params.lang !== "All") searchParams.set("lang", params.lang);
  if (params.availability && params.availability !== "All") searchParams.set("availability", params.availability);
  if (params.lat !== undefined && params.lat !== null && params.lat !== "") searchParams.set("lat", params.lat);
  if (params.lng !== undefined && params.lng !== null && params.lng !== "") searchParams.set("lng", params.lng);
  if (params.maxDist !== undefined && params.maxDist !== null && params.maxDist !== "") searchParams.set("maxDist", params.maxDist);

  const query = searchParams.toString();
  return directoryRequest(query ? `?${query}` : "");
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

export async function getUserProfile() {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
    credentials: "include",
  });
  let data = null;
  try { data = await response.json(); } catch {}
  return { response, data };
}

export async function updateUserProfile(profile, csrfToken) {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    },
    credentials: "include",
    body: JSON.stringify(profile),
  });
  let data = null;
  try { data = await response.json(); } catch {}
  return { response, data };
}

export async function getDashboardSummary() {
  const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/summary`, {
    credentials: "include",
  });
  let data = null;
  try { data = await response.json(); } catch {}
  return { response, data };
}

export async function getLearningModules(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.category) searchParams.set("category", params.category);
  if (params.lang) searchParams.set("lang", params.lang);
  if (params.format) searchParams.set("format", params.format);

  const query = searchParams.toString();
  const url = `${API_BASE_URL}/api/v1/learning/modules${query ? `?${query}` : ""}`;

  const response = await fetch(url, { credentials: "include" });
  let data = null;
  try { data = await response.json(); } catch {}
  return { response, data };
}

export async function getLearningModule(id) {
  const response = await fetch(`${API_BASE_URL}/api/v1/learning/modules/${encodeURIComponent(id)}`, {
    credentials: "include",
  });
  let data = null;
  try { data = await response.json(); } catch {}
  return { response, data };
}

export async function completeLearningModule(id, completionData = {}, csrfToken = "") {
  const response = await fetch(`${API_BASE_URL}/api/v1/learning/modules/${encodeURIComponent(id)}/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    },
    credentials: "include",
    body: JSON.stringify(completionData),
  });
  let data = null;
  try { data = await response.json(); } catch {}
  return { response, data };
}

export async function getLearningProgress() {
  const response = await fetch(`${API_BASE_URL}/api/v1/learning/progress`, {
    credentials: "include",
  });
  let data = null;
  try { data = await response.json(); } catch {}
  return { response, data };
}

export async function getGovernmentSchemes(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.tag) searchParams.set("tag", params.tag);

  const query = searchParams.toString();
  const url = `${API_BASE_URL}/api/v1/learning/schemes${query ? `?${query}` : ""}`;

  const response = await fetch(url, { credentials: "include" });
  let data = null;
  try { data = await response.json(); } catch {}
  return { response, data };
}

export async function publishLearningModule(moduleData, csrfToken) {
  const response = await fetch(`${API_BASE_URL}/api/v1/learning/modules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    },
    credentials: "include",
    body: JSON.stringify(moduleData),
  });
  let data = null;
  try { data = await response.json(); } catch {}
  return { response, data };
}

export async function getMyLearningModules() {
  const response = await fetch(`${API_BASE_URL}/api/v1/learning/my-modules`, {
    credentials: "include",
  });
  let data = null;
  try { data = await response.json(); } catch {}
  return { response, data };
}

export async function updateLearningModule(id, moduleData, csrfToken) {
  const response = await fetch(`${API_BASE_URL}/api/v1/learning/modules/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    },
    credentials: "include",
    body: JSON.stringify(moduleData),
  });
  let data = null;
  try { data = await response.json(); } catch {}
  return { response, data };
}

export async function deleteLearningModule(id, csrfToken) {
  const response = await fetch(`${API_BASE_URL}/api/v1/learning/modules/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    },
    credentials: "include",
  });
  let data = null;
  try { data = await response.json(); } catch {}
  return { response, data };
}

export function uploadLearningVideo(file, csrfToken, onProgress) {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/api/v1/learning/upload-video`);
    xhr.withCredentials = true;

    if (csrfToken) {
      xhr.setRequestHeader("X-CSRF-Token", csrfToken);
    }

    if (xhr.upload && typeof onProgress === "function") {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = null;
      }
      resolve({
        response: { ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status },
        data,
      });
    };

    xhr.onerror = () => {
      resolve({
        response: { ok: false, status: 0 },
        data: {
          error: {
            code: "NETWORK_ERROR",
            message: "Network error occurred while uploading video.",
          },
        },
      });
    };

    const formData = new FormData();
    formData.append("video", file);
    xhr.send(formData);
  });
}

export async function getConsultationAvailability(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.professionalId) searchParams.set("professionalId", params.professionalId);
  if (params.date) searchParams.set("date", params.date);

  const query = searchParams.toString();
  const url = `${API_BASE_URL}/api/v1/consultations/availability${query ? `?${query}` : ""}`;

  const response = await fetch(url, { credentials: "include" });
  let data = null;
  try {
    data = await response.json();
  } catch {}
  return { response, data };
}

export async function createConsultation(bookingData, csrfToken = "") {
  const response = await fetch(`${API_BASE_URL}/api/v1/consultations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    },
    credentials: "include",
    body: JSON.stringify(bookingData),
  });
  let data = null;
  try {
    data = await response.json();
  } catch {}
  return { response, data };
}

export async function getMyConsultations(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set("status", params.status);
  if (params.date) searchParams.set("date", params.date);

  const query = searchParams.toString();
  const url = `${API_BASE_URL}/api/v1/consultations${query ? `?${query}` : ""}`;

  const response = await fetch(url, { credentials: "include" });
  let data = null;
  try {
    data = await response.json();
  } catch {}
  return { response, data };
}

export async function getConsultation(id) {
  const response = await fetch(`${API_BASE_URL}/api/v1/consultations/${encodeURIComponent(id)}`, {
    credentials: "include",
  });
  let data = null;
  try {
    data = await response.json();
  } catch {}
  return { response, data };
}

export async function cancelConsultation(id, reason = "", csrfToken = "") {
  const response = await fetch(`${API_BASE_URL}/api/v1/consultations/${encodeURIComponent(id)}/cancel`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    },
    credentials: "include",
    body: JSON.stringify({ reason }),
  });
  let data = null;
  try {
    data = await response.json();
  } catch {}
  return { response, data };
}

export async function updateConsultationStatus(id, status, reason = "", csrfToken = "") {
  const response = await fetch(`${API_BASE_URL}/api/v1/consultations/${encodeURIComponent(id)}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    },
    credentials: "include",
    body: JSON.stringify({ status, reason }),
  });
  let data = null;
  try {
    data = await response.json();
  } catch {}
  return { response, data };
}

export async function getInclusiveVenues(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.category && params.category !== "All") searchParams.set("category", params.category);
  if (params.location) searchParams.set("location", params.location);
  if (params.city) searchParams.set("city", params.city);
  if (params.sensory) searchParams.set("sensory", params.sensory);
  if (params.access) searchParams.set("access", params.access);
  if (params.lat !== undefined && params.lng !== undefined) {
    searchParams.set("lat", params.lat);
    searchParams.set("lng", params.lng);
    if (params.maxDist !== undefined) searchParams.set("maxDist", params.maxDist);
  }

  const query = searchParams.toString();
  const url = `${API_BASE_URL}/api/v1/venues${query ? `?${query}` : ""}`;

  const response = await fetch(url, { credentials: "include" });
  let data = null;
  try {
    data = await response.json();
  } catch {}
  return { response, data };
}

export async function getInclusiveVenue(id) {
  const response = await fetch(`${API_BASE_URL}/api/v1/venues/${encodeURIComponent(id)}`, {
    credentials: "include",
  });
  let data = null;
  try {
    data = await response.json();
  } catch {}
  return { response, data };
}

