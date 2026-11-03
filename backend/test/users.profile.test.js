const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

process.env.SESSION_SECRET = "test-session-secret-that-is-long-enough-to-be-safe";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const { User } = require("../src/models/User");
const { createSession } = require("../src/config/session");

let mongoServer;
let httpServer;
let baseUrl;

async function createAuthenticatedTestUser({ name, email, role, location, preferences }) {
  const user = await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash("safe-test-password", 12),
    role,
    guardianConsent: true,
    location,
    preferences,
  });
  const session = await createSession(user._id);
  return { user, cookie: `lumina_session=${session.sessionToken}`, csrfToken: session.csrfToken };
}

async function requestProfile(path = "/me", { method = "GET", cookie, csrfToken, body } = {}) {
  const response = await fetch(`${baseUrl}/api/v1/users${path}`, {
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

test("GET /api/v1/users/me requires authentication", async () => {
  const { response, body } = await requestProfile("/me");
  assert.equal(response.status, 401);
  assert.equal(body.error.code, "AUTHENTICATION_REQUIRED");
});

test("GET /api/v1/users/me returns the authenticated user profile with default preferences and location", async () => {
  const testUser = await createAuthenticatedTestUser({
    name: "Aparna Sharma",
    email: "aparna@example.test",
    role: "parent",
  });

  const { response, body } = await requestProfile("/me", {
    cookie: testUser.cookie,
  });

  assert.equal(response.status, 200);
  assert.equal(body.status, "success");
  assert.equal(body.data.user.name, "Aparna Sharma");
  assert.equal(body.data.user.email, "aparna@example.test");
  assert.equal(body.data.user.role, "parent");
  assert.deepEqual(body.data.user.location, { city: "", district: "", state: "" });
  assert.equal(body.data.user.preferences.theme, "light");
  assert.equal(body.data.user.preferences.lang, "en");
  assert.equal(body.data.user.preferences.reduceMotion, false);
});

test("PUT /api/v1/users/profile requires CSRF verification", async () => {
  const testUser = await createAuthenticatedTestUser({
    name: "Dr. Alok Nayak",
    email: "alok@example.test",
    role: "therapist",
  });

  const { response, body } = await requestProfile("/profile", {
    method: "PUT",
    cookie: testUser.cookie,
    body: { name: "Dr. Alok K. Nayak" },
  });

  assert.equal(response.status, 403);
  assert.equal(body.error.code, "CSRF_VALIDATION_FAILED");
});

test("PUT /api/v1/users/profile updates display name, location, and accessibility preferences", async () => {
  const testUser = await createAuthenticatedTestUser({
    name: "Rajesh Pattnaik",
    email: "rajesh@example.test",
    role: "parent",
  });

  const { response, body } = await requestProfile("/profile", {
    method: "PUT",
    cookie: testUser.cookie,
    csrfToken: testUser.csrfToken,
    body: {
      name: "Rajesh K. Pattnaik",
      location: {
        city: "Bhubaneswar",
        district: "Khordha",
        state: "Odisha",
      },
      preferences: {
        theme: "dark",
        lang: "or",
        reduceMotion: true,
        largeText: true,
        quietNotifs: true,
        emailUpdates: false,
      },
    },
  });

  assert.equal(response.status, 200);
  assert.equal(body.status, "success");
  assert.equal(body.data.user.name, "Rajesh K. Pattnaik");
  assert.equal(body.data.user.location.city, "Bhubaneswar");
  assert.equal(body.data.user.location.district, "Khordha");
  assert.equal(body.data.user.location.state, "Odisha");
  assert.equal(body.data.user.preferences.theme, "dark");
  assert.equal(body.data.user.preferences.lang, "or");
  assert.equal(body.data.user.preferences.reduceMotion, true);
  assert.equal(body.data.user.preferences.largeText, true);
  assert.equal(body.data.user.preferences.quietNotifs, true);

  const updatedInDb = await User.findById(testUser.user._id);
  assert.equal(updatedInDb.name, "Rajesh K. Pattnaik");
  assert.equal(updatedInDb.location.city, "Bhubaneswar");
  assert.equal(updatedInDb.preferences.theme, "dark");
});

test("PUT /api/v1/users/profile accepts location as a single string and stores as city", async () => {
  const testUser = await createAuthenticatedTestUser({
    name: "Sunita Das",
    email: "sunita@example.test",
    role: "educator",
  });

  const { response, body } = await requestProfile("/profile", {
    method: "PUT",
    cookie: testUser.cookie,
    csrfToken: testUser.csrfToken,
    body: {
      location: "Cuttack, Odisha",
    },
  });

  assert.equal(response.status, 200);
  assert.equal(body.data.user.location.city, "Cuttack, Odisha");
});

test("PUT /api/v1/users/profile rejects invalid fields and malformed preferences", async () => {
  const testUser = await createAuthenticatedTestUser({
    name: "Valid User",
    email: "valid@example.test",
    role: "mentor",
  });

  const { response, body } = await requestProfile("/profile", {
    method: "PUT",
    cookie: testUser.cookie,
    csrfToken: testUser.csrfToken,
    body: {
      name: "X", // too short
      preferences: {
        theme: "neon", // invalid theme
        reduceMotion: "yes", // not a boolean
      },
    },
  });

  assert.equal(response.status, 400);
  assert.equal(body.error.code, "VALIDATION_ERROR");
  assert.ok(body.error.details.length >= 3);
});

test("PUT /api/v1/users/profile protects immutable account fields", async () => {
  const testUser = await createAuthenticatedTestUser({
    name: "Protected User",
    email: "protected@example.test",
    role: "parent",
  });

  const { response, body } = await requestProfile("/profile", {
    method: "PUT",
    cookie: testUser.cookie,
    csrfToken: testUser.csrfToken,
    body: {
      name: "Still Protected",
      role: "admin",
      email: "hacked@example.test",
      status: "suspended",
      passwordHash: "new-hash",
    },
  });

  assert.equal(response.status, 200);
  assert.equal(body.data.user.role, "parent");
  assert.equal(body.data.user.email, "protected@example.test");
  assert.equal(body.data.user.status, "active");

  const fromDb = await User.findById(testUser.user._id);
  assert.equal(fromDb.role, "parent");
  assert.equal(fromDb.email, "protected@example.test");
});
