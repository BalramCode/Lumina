const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

process.env.SESSION_SECRET = "test-session-secret-that-is-long-enough-to-be-safe";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const { User } = require("../src/models/User");
const { Session } = require("../src/models/Session");
const authRouter = require("../src/routes/auth");
const { createSession } = require("../src/config/session");

let mongoServer;
let httpServer;
let baseUrl;

async function requestRegistration(body) {
  const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return { response, body: await response.json() };
}

async function requestLogin(body) {
  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return { response, body: await response.json() };
}

function readCookie(response, name) {
  const setCookie = response.headers.get("set-cookie") || "";
  const match = setCookie.match(new RegExp(`${name}=([^;]+)`));
  return match ? `${name}=${match[1]}` : "";
}

async function requestSession(cookie = "", origin) {
  const response = await fetch(`${baseUrl}/api/v1/auth/session`, {
    headers: { ...(cookie ? { Cookie: cookie } : {}), ...(origin ? { Origin: origin } : {}) },
  });
  return { response, body: await response.json() };
}

async function requestProfessional(path, { method = "GET", cookie, csrfToken, body } = {}) {
  const response = await fetch(`${baseUrl}/api/v1/professionals${path}`, {
    method,
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const responseBody = response.status === 204 ? null : await response.json();
  return { response, body: responseBody };
}

async function createAuthenticatedTestUser({ name, email, role }) {
  const user = await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash("safe-test-password", 12),
    role,
    guardianConsent: true,
  });
  const session = await createSession(user._id);
  return { user, cookie: `lumina_session=${session.sessionToken}`, csrfToken: session.csrfToken };
}

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  httpServer = app.listen(0);
  await new Promise((resolve) => httpServer.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${httpServer.address().port}`;
});

after(async () => {
  await new Promise((resolve) => httpServer.close(resolve));
  await mongoose.disconnect();
  await mongoServer.stop();
});

test("registers a user with a hashed password and a safe response", async () => {
  const password = "safe-test-password";
  const email = "parent@example.test";
  const { response, body } = await requestRegistration({
    name: "Parent User",
    email,
    password,
    role: "parent",
    guardianConsent: true,
  });

  assert.equal(response.status, 201);
  assert.equal(body.status, "success");
  assert.equal(body.data.user.email, email);
  assert.equal(body.data.user.password, undefined);
  assert.equal(body.data.user.passwordHash, undefined);

  const savedUser = await User.findOne({ email }).select("+passwordHash");
  assert.ok(savedUser);
  assert.notEqual(savedUser.passwordHash, password);
  assert.equal(await bcrypt.compare(password, savedUser.passwordHash), true);
});

test("rejects duplicate email addresses", async () => {
  const { response, body } = await requestRegistration({
    name: "Another Parent",
    email: "PARENT@example.test",
    password: "another-safe-password",
    role: "parent",
    guardianConsent: true,
  });

  assert.equal(response.status, 409);
  assert.equal(body.error.code, "EMAIL_ALREADY_REGISTERED");
});

test("logs in with a registered user's normalized email and safe response", async () => {
  const { response, body } = await requestLogin({
    email: " PARENT@EXAMPLE.TEST ",
    password: "safe-test-password",
  });

  assert.equal(response.status, 200);
  assert.equal(body.status, "success");
  assert.equal(body.data.user.email, "parent@example.test");
  assert.equal(body.data.user.password, undefined);
  assert.equal(body.data.user.passwordHash, undefined);
  assert.match(readCookie(response, "lumina_session"), /^lumina_session=/);
  assert.match(body.data.csrfToken, /^[A-Za-z0-9_-]+$/);
  assert.equal(await Session.countDocuments(), 1);
});

test("requires a server-side session and returns the safe authenticated user", async () => {
  const noSession = await requestSession();
  assert.equal(noSession.response.status, 401);
  assert.equal(noSession.body.error.code, "AUTHENTICATION_REQUIRED");

  const login = await requestLogin({ email: "parent@example.test", password: "safe-test-password" });
  const cookie = readCookie(login.response, "lumina_session");
  const authenticated = await requestSession(cookie, "http://localhost:3000");

  assert.equal(authenticated.response.status, 200);
  assert.equal(authenticated.body.data.user.role, "parent");
  assert.equal(authenticated.body.data.user.passwordHash, undefined);
  assert.equal(authenticated.response.headers.get("access-control-allow-origin"), "http://localhost:3000");
  assert.equal(authenticated.response.headers.get("access-control-allow-credentials"), "true");
});

test("logs out by invalidating the server session and requires CSRF verification", async () => {
  const login = await requestLogin({ email: "parent@example.test", password: "safe-test-password" });
  const sessionCookie = readCookie(login.response, "lumina_session");
  const cookie = sessionCookie;

  const missingCsrf = await fetch(`${baseUrl}/api/v1/auth/logout`, {
    method: "POST",
    headers: { Cookie: cookie },
  });
  assert.equal(missingCsrf.status, 403);

  const session = await requestSession(cookie);
  const csrfToken = session.body.data.csrfToken;
  const logout = await fetch(`${baseUrl}/api/v1/auth/logout`, {
    method: "POST",
    headers: { Cookie: cookie, "X-CSRF-Token": csrfToken, Origin: "http://localhost:3000" },
  });
  assert.equal(logout.status, 204);
  assert.equal(logout.headers.get("access-control-allow-origin"), "http://localhost:3000");

  const invalidated = await requestSession(sessionCookie);
  assert.equal(invalidated.response.status, 401);
});

test("permits credentialed CORS preflight for the configured frontend origin", async () => {
  const response = await fetch(`${baseUrl}/api/v1/auth/logout`, {
    method: "OPTIONS",
    headers: {
      Origin: "http://localhost:3000",
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "X-CSRF-Token",
    },
  });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:3000");
  assert.equal(response.headers.get("access-control-allow-credentials"), "true");
});

test("returns the same generic error for unknown email and incorrect password", async () => {
  const incorrectPassword = await requestLogin({
    email: "parent@example.test",
    password: "incorrect-password",
  });
  const unknownEmail = await requestLogin({
    email: "unknown@example.test",
    password: "safe-test-password",
  });

  assert.equal(incorrectPassword.response.status, 401);
  assert.equal(unknownEmail.response.status, 401);
  assert.deepEqual(incorrectPassword.body, unknownEmail.body);
  assert.equal(incorrectPassword.body.error.code, "INVALID_CREDENTIALS");
});

test("rejects missing and malformed login fields", async () => {
  const missing = await requestLogin({});
  const malformed = await requestLogin({ email: "not-an-email", password: "safe-test-password" });

  assert.equal(missing.response.status, 400);
  assert.equal(malformed.response.status, 400);
  assert.equal(missing.body.error.code, "VALIDATION_ERROR");
  assert.equal(malformed.body.error.code, "VALIDATION_ERROR");
});

test("limits repeated login attempts", async () => {
  authRouter.resetLoginRateLimitForTests();

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const result = await requestLogin({
      email: "unknown@example.test",
      password: "safe-test-password",
    });
    assert.equal(result.response.status, 401);
  }

  const limited = await requestLogin({
    email: "unknown@example.test",
    password: "safe-test-password",
  });
  assert.equal(limited.response.status, 429);
  assert.equal(limited.body.error.code, "AUTH_RATE_LIMITED");
  assert.ok(limited.response.headers.get("retry-after"));
  authRouter.resetLoginRateLimitForTests();
});

test("enforces professional directory roles, ownership, validation, and CRUD", async () => {
  const therapist = await createAuthenticatedTestUser({
    name: "Therapist Owner",
    email: "therapist-owner@example.test",
    role: "therapist",
  });
  const otherTherapist = await createAuthenticatedTestUser({
    name: "Other Therapist",
    email: "other-therapist@example.test",
    role: "therapist",
  });
  const parent = await createAuthenticatedTestUser({
    name: "Directory Parent",
    email: "directory-parent@example.test",
    role: "parent",
  });
  const profile = {
    professionalType: "Occupational Therapist",
    bio: "Supporting autistic children and their families with practical occupational therapy.",
    city: "Bhubaneswar",
    languages: ["English", "Odia"],
    yearsExperience: 8,
    availability: "accepting_clients",
  };

  const unauthenticated = await requestProfessional("/");
  assert.equal(unauthenticated.response.status, 401);

  const parentCreate = await requestProfessional("/me", {
    method: "POST", cookie: parent.cookie, csrfToken: parent.csrfToken, body: profile,
  });
  assert.equal(parentCreate.response.status, 403);

  const invalid = await requestProfessional("/me", {
    method: "POST", cookie: therapist.cookie, csrfToken: therapist.csrfToken, body: { ...profile, bio: "short" },
  });
  assert.equal(invalid.response.status, 400);
  assert.equal(invalid.body.error.code, "VALIDATION_ERROR");

  const created = await requestProfessional("/me", {
    method: "POST", cookie: therapist.cookie, csrfToken: therapist.csrfToken, body: profile,
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.body.data.profile.name, "Therapist Owner");
  assert.equal(created.body.data.profile.professionalType, profile.professionalType);

  const duplicate = await requestProfessional("/me", {
    method: "POST", cookie: therapist.cookie, csrfToken: therapist.csrfToken, body: profile,
  });
  assert.equal(duplicate.response.status, 409);

  const otherTherapistProfile = await requestProfessional("/me", { cookie: otherTherapist.cookie });
  assert.equal(otherTherapistProfile.response.status, 404);

  const updated = await requestProfessional("/me", {
    method: "PUT", cookie: therapist.cookie, csrfToken: therapist.csrfToken,
    body: { ...profile, city: "Cuttack", availability: "waitlist" },
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.data.profile.city, "Cuttack");
  assert.equal(updated.body.data.profile.availability, "waitlist");

  const therapistBrowse = await requestProfessional("/", { cookie: therapist.cookie });
  assert.equal(therapistBrowse.response.status, 403);

  const directory = await requestProfessional("/", { cookie: parent.cookie });
  assert.equal(directory.response.status, 200);
  assert.equal(directory.body.data.profiles.length, 1);
  const detail = await requestProfessional(`/${created.body.data.profile.id}`, { cookie: parent.cookie });
  assert.equal(detail.response.status, 200);
  assert.equal(detail.body.data.profile.name, "Therapist Owner");
  assert.equal(detail.body.data.profile.bio, profile.bio);
});

test("rejects missing and invalid registration fields", async () => {
  const missing = await requestRegistration({});
  assert.equal(missing.response.status, 400);
  assert.equal(missing.body.error.code, "VALIDATION_ERROR");

  const invalid = await requestRegistration({
    name: "A",
    email: "not-an-email",
    password: "short",
    role: "admin",
    guardianConsent: false,
  });
  assert.equal(invalid.response.status, 400);
  assert.equal(invalid.body.error.code, "VALIDATION_ERROR");
  assert.match(invalid.body.error.details.join(" "), /role must be one of/);
});

test("returns a safe response for database failures", async () => {
  const originalCreate = User.create;
  User.create = async () => {
    throw new Error("simulated database failure");
  };

  try {
    const { response, body } = await requestRegistration({
      name: "Database Error Test",
      email: "database-error@example.test",
      password: "safe-test-password",
      role: "mentor",
      guardianConsent: true,
    });

    assert.equal(response.status, 500);
    assert.equal(body.error.code, "INTERNAL_SERVER_ERROR");
    assert.doesNotMatch(JSON.stringify(body), /simulated database failure/);
  } finally {
    User.create = originalCreate;
  }
});

test("keeps the health endpoint available while the test database is connected", async () => {
  const response = await fetch(`${baseUrl}/api/v1/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.database.status, "connected");
});
