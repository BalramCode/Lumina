const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

process.env.SESSION_SECRET = "test-session-secret-that-is-long-enough-to-be-safe";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const { User } = require("../src/models/User");
const { LearningModule } = require("../src/models/LearningModule");
const { UserProgress } = require("../src/models/UserProgress");
const { seedLearningData, INITIAL_LEARNING_MODULES } = require("../src/config/seedLearning");
const { createSession } = require("../src/config/session");

let mongoServer;
let httpServer;
let baseUrl;

async function createTestUser({ name, email, role = "parent", isVerified = false }) {
  const user = await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash("safe-test-password", 12),
    role,
    isVerified,
    guardianConsent: true,
  });
  const session = await createSession(user._id);
  return { user, cookie: `lumina_session=${session.sessionToken}`, csrfToken: session.csrfToken };
}

async function requestApi(path, { method = "GET", cookie, csrfToken, body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
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

  await seedLearningData();
});

after(async () => {
  await new Promise((resolve) => httpServer.close(resolve));
  await mongoose.disconnect();
  await mongoServer.stop();
});

test("POST /api/v1/learning/modules/:id/complete enforces authentication and CSRF", async () => {
  // 1. Unauthenticated request
  const unauth = await requestApi("/api/v1/learning/modules/m1/complete", {
    method: "POST",
    body: { isCompleted: true },
  });
  assert.equal(unauth.response.status, 401);
  assert.equal(unauth.body.error.code, "AUTHENTICATION_REQUIRED");

  // 2. Authenticated but missing CSRF
  const userA = await createTestUser({
    name: "User Security Test",
    email: "security.user@example.test",
  });

  const missingCsrf = await requestApi("/api/v1/learning/modules/m1/complete", {
    method: "POST",
    cookie: userA.cookie,
    body: { isCompleted: true },
  });
  assert.equal(missingCsrf.response.status, 403);
  assert.equal(missingCsrf.body.error.code, "CSRF_VALIDATION_FAILED");
});

test("POST /api/v1/learning/modules/:id/complete marks module complete and persists progress in MongoDB", async () => {
  const user = await createTestUser({
    name: "Learner Parent",
    email: "learner.parent@example.test",
    role: "parent",
  });

  // Verify initial progress is 0
  const initialProg = await requestApi("/api/v1/learning/progress", {
    cookie: user.cookie,
  });
  assert.equal(initialProg.response.status, 200);
  assert.equal(initialProg.body.data.completedCount, 0);
  assert.equal(initialProg.body.data.progressPercent, 0);

  // Complete module m1 (Video)
  const completeM1 = await requestApi("/api/v1/learning/modules/m1/complete", {
    method: "POST",
    cookie: user.cookie,
    csrfToken: user.csrfToken,
    body: { isCompleted: true },
  });
  assert.equal(completeM1.response.status, 200);
  assert.equal(completeM1.body.status, "success");
  assert.equal(completeM1.body.data.slug, "m1");
  assert.equal(completeM1.body.data.isCompleted, true);
  assert.equal(completeM1.body.data.progressPercent, 100);
  assert.equal(completeM1.body.data.overallProgress.completedCount, 1);
  assert.ok(completeM1.body.data.overallProgress.totalModules >= 6);

  // Verify progress persisted in database
  const dbRecord = await UserProgress.findOne({ userId: user.user._id });
  assert.ok(dbRecord);
  assert.equal(dbRecord.isCompleted, true);
  assert.equal(dbRecord.progressPercent, 100);

  // Complete module m7 (Guide) using its slug
  const completeM7 = await requestApi("/api/v1/learning/modules/m7/complete", {
    method: "POST",
    cookie: user.cookie,
    csrfToken: user.csrfToken,
    body: { isCompleted: true },
  });
  assert.equal(completeM7.response.status, 200);
  assert.equal(completeM7.body.data.slug, "m7");
  assert.equal(completeM7.body.data.overallProgress.completedCount, 2);

  // Complete module m8 (Checklist)
  const completeM8 = await requestApi("/api/v1/learning/modules/m8/complete", {
    method: "POST",
    cookie: user.cookie,
    csrfToken: user.csrfToken,
    body: { isCompleted: true },
  });
  assert.equal(completeM8.response.status, 200);
  assert.equal(completeM8.body.data.slug, "m8");
  assert.equal(completeM8.body.data.overallProgress.completedCount, 3);

  // Verify GET /api/v1/learning/progress reflects completed modules
  const progressRes = await requestApi("/api/v1/learning/progress", {
    cookie: user.cookie,
  });
  assert.equal(progressRes.response.status, 200);
  assert.equal(progressRes.body.data.completedCount, 3);
  assert.ok(progressRes.body.data.completedSlugs.includes("m1"));
  assert.ok(progressRes.body.data.completedSlugs.includes("m7"));
  assert.ok(progressRes.body.data.completedSlugs.includes("m8"));
  const expectedPercent = Math.round((3 / progressRes.body.data.totalModules) * 100);
  assert.equal(progressRes.body.data.progressPercent, expectedPercent);

  // Verify GET /api/v1/learning/modules attaches isCompleted: true
  const modulesRes = await requestApi("/api/v1/learning/modules", {
    cookie: user.cookie,
  });
  assert.equal(modulesRes.response.status, 200);
  const m1Module = modulesRes.body.data.modules.find((m) => m.slug === "m1");
  const m2Module = modulesRes.body.data.modules.find((m) => m.slug === "m2");
  assert.equal(m1Module.isCompleted, true);
  assert.equal(m1Module.progress, 100);
  assert.equal(m2Module.isCompleted, false);
  assert.equal(m2Module.progress, 0);

  // Verify GET /api/v1/learning/modules/:id attaches isCompleted: true
  const singleModuleRes = await requestApi("/api/v1/learning/modules/m1", {
    cookie: user.cookie,
  });
  assert.equal(singleModuleRes.response.status, 200);
  assert.equal(singleModuleRes.body.data.module.isCompleted, true);
  assert.equal(singleModuleRes.body.data.module.progress, 100);

  // Verify GET /api/v1/dashboard/summary reflects the user's actual dynamic learningProgress
  const dashRes = await requestApi("/api/v1/dashboard/summary", {
    cookie: user.cookie,
  });
  assert.equal(dashRes.response.status, 200);
  assert.equal(dashRes.body.data.learningProgress.completedCount, 3);
  assert.equal(dashRes.body.data.learningProgress.progressPercent, expectedPercent);
});

test("user can toggle and unmark lesson completion", async () => {
  const user = await createTestUser({
    name: "Toggle User",
    email: "toggle.user@example.test",
    role: "parent",
  });

  // Mark m2 complete
  await requestApi("/api/v1/learning/modules/m2/complete", {
    method: "POST",
    cookie: user.cookie,
    csrfToken: user.csrfToken,
    body: { isCompleted: true },
  });

  const check1 = await requestApi("/api/v1/learning/progress", {
    cookie: user.cookie,
  });
  assert.equal(check1.body.data.completedCount, 1);

  // Unmark m2 (isCompleted: false)
  const uncomplete = await requestApi("/api/v1/learning/modules/m2/complete", {
    method: "POST",
    cookie: user.cookie,
    csrfToken: user.csrfToken,
    body: { isCompleted: false },
  });
  assert.equal(uncomplete.response.status, 200);
  assert.equal(uncomplete.body.data.isCompleted, false);
  assert.equal(uncomplete.body.data.progressPercent, 0);
  assert.equal(uncomplete.body.data.overallProgress.completedCount, 0);

  // Verify progress drops back to 0
  const check2 = await requestApi("/api/v1/learning/progress", {
    cookie: user.cookie,
  });
  assert.equal(check2.body.data.completedCount, 0);
  assert.equal(check2.body.data.progressPercent, 0);
});

test("user-level ownership: progress is isolated between different users", async () => {
  const userAlice = await createTestUser({
    name: "Alice",
    email: "alice@example.test",
    role: "parent",
  });
  const userBob = await createTestUser({
    name: "Bob",
    email: "bob@example.test",
    role: "parent",
  });

  // Alice completes m3
  await requestApi("/api/v1/learning/modules/m3/complete", {
    method: "POST",
    cookie: userAlice.cookie,
    csrfToken: userAlice.csrfToken,
    body: { isCompleted: true },
  });

  // Alice sees m3 completed
  const aliceProgress = await requestApi("/api/v1/learning/progress", {
    cookie: userAlice.cookie,
  });
  assert.equal(aliceProgress.body.data.completedCount, 1);
  assert.ok(aliceProgress.body.data.completedSlugs.includes("m3"));

  // Bob's progress is unaffected
  const bobProgress = await requestApi("/api/v1/learning/progress", {
    cookie: userBob.cookie,
  });
  assert.equal(bobProgress.body.data.completedCount, 0);
  assert.equal(bobProgress.body.data.completedSlugs.length, 0);

  // Bob's module list shows m3 as NOT completed
  const bobModules = await requestApi("/api/v1/learning/modules", {
    cookie: userBob.cookie,
  });
  const bobM3 = bobModules.body.data.modules.find((m) => m.slug === "m3");
  assert.equal(bobM3.isCompleted, false);
  assert.equal(bobM3.progress, 0);
});
