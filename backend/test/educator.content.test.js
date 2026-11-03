const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

process.env.SESSION_SECRET = "test-session-secret-that-is-long-enough-to-be-safe";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const { User } = require("../src/models/User");
const { LearningModule } = require("../src/models/LearningModule");
const { createSession } = require("../src/config/session");

let mongoServer;
let httpServer;
let baseUrl;

async function createTestUser({ name, email, role, isVerified = false }) {
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

async function requestApi(path, { method = "GET", cookie, csrfToken, body, headers = {} } = {}) {
  const isMultipart = headers["Content-Type"]?.includes("multipart/form-data");
  const response = await fetch(`${baseUrl}/api/v1/learning${path}`, {
    method,
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      ...(!isMultipart && body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(body ? (isMultipart ? { body } : { body: JSON.stringify(body) }) : {}),
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

test("POST /api/v1/learning/upload-video enforces RBAC, file validation and Cloudinary configuration checks", async () => {
  // 1. Unauthenticated request rejected
  const unauth = await requestApi("/upload-video", { method: "POST" });
  assert.equal(unauth.response.status, 401);

  // 2. Parent rejected
  const parent = await createTestUser({ name: "Priya Parent", email: "priya.parent@test.com", role: "parent" });
  const parentRes = await requestApi("/upload-video", {
    method: "POST",
    cookie: parent.cookie,
    csrfToken: parent.csrfToken,
  });
  assert.equal(parentRes.response.status, 403);
  assert.equal(parentRes.body.error.code, "FORBIDDEN");

  // 3. Unverified educator rejected
  const unverifiedEdu = await createTestUser({
    name: "Ravi Candidate",
    email: "ravi.unverified@test.com",
    role: "educator",
    isVerified: false,
  });
  const unverifiedRes = await requestApi("/upload-video", {
    method: "POST",
    cookie: unverifiedEdu.cookie,
    csrfToken: unverifiedEdu.csrfToken,
  });
  assert.equal(unverifiedRes.response.status, 403);
  assert.equal(unverifiedRes.body.error.code, "EXPERT_VERIFICATION_REQUIRED");

  // 4. Verified educator without file rejected (400 FILE_MISSING)
  const verifiedEdu = await createTestUser({
    name: "Meera Special Educator",
    email: "meera.verified@test.com",
    role: "educator",
    isVerified: true,
  });

  // Empty multipart payload
  const emptyForm = new FormData();
  const emptyRes = await fetch(`${baseUrl}/api/v1/learning/upload-video`, {
    method: "POST",
    headers: {
      Cookie: verifiedEdu.cookie,
      "X-CSRF-Token": verifiedEdu.csrfToken,
    },
    body: emptyForm,
  });
  const emptyBody = await emptyRes.json();
  assert.equal(emptyRes.status, 400);
  assert.equal(emptyBody.error.code, "FILE_MISSING");

  // 5. Invalid file type rejected
  const invalidForm = new FormData();
  const textBlob = new Blob(["not a video file"], { type: "text/plain" });
  invalidForm.append("video", textBlob, "notes.txt");

  const invalidRes = await fetch(`${baseUrl}/api/v1/learning/upload-video`, {
    method: "POST",
    headers: {
      Cookie: verifiedEdu.cookie,
      "X-CSRF-Token": verifiedEdu.csrfToken,
    },
    body: invalidForm,
  });
  const invalidBody = await invalidRes.json();
  assert.equal(invalidRes.status, 400);
  assert.equal(invalidBody.error.code, "INVALID_FILE_TYPE");

  // 6. Valid video file but Cloudinary not configured in test environment -> returns 503 CLOUDINARY_NOT_CONFIGURED
  const validForm = new FormData();
  const videoBlob = new Blob([new Uint8Array(1024)], { type: "video/mp4" });
  validForm.append("video", videoBlob, "demo-lesson.mp4");

  const env = require("../src/config/env");
  const originalConfigured = env.cloudinary.isConfigured;
  env.cloudinary.isConfigured = false;

  try {
    const validRes = await fetch(`${baseUrl}/api/v1/learning/upload-video`, {
      method: "POST",
      headers: {
        Cookie: verifiedEdu.cookie,
        "X-CSRF-Token": verifiedEdu.csrfToken,
      },
      body: validForm,
    });
    const validBody = await validRes.json();
    assert.equal(validRes.status, 503);
    assert.equal(validBody.error.code, "CLOUDINARY_NOT_CONFIGURED");
  } finally {
    env.cloudinary.isConfigured = originalConfigured;
  }
});

test("GET /api/v1/learning/my-modules returns only the authenticated expert's materials", async () => {
  const edu1 = await createTestUser({ name: "Educator One", email: "edu1@test.com", role: "educator", isVerified: true });
  const edu2 = await createTestUser({ name: "Educator Two", email: "edu2@test.com", role: "educator", isVerified: true });

  // Create module for edu1
  await requestApi("/modules", {
    method: "POST",
    cookie: edu1.cookie,
    csrfToken: edu1.csrfToken,
    body: {
      title: "Visual Timetables for Morning Routines",
      category: "Daily Routines",
      desc: "Step by step classroom routine guide for neurodivergent students.",
      videoUrl: "https://www.youtube.com/watch?v=abc123xyz89",
      format: "Guide",
      duration: "10 min",
    },
  });

  // Create module for edu2
  await requestApi("/modules", {
    method: "POST",
    cookie: edu2.cookie,
    csrfToken: edu2.csrfToken,
    body: {
      title: "Sensory Corner Setup",
      category: "Sensory Strategies",
      desc: "How to set up a safe, low-stimulation corner in school.",
      videoUrl: "https://www.youtube.com/watch?v=def456uvw01",
      format: "Checklist",
      duration: "8 min",
    },
  });

  // Edu1 queries my-modules
  const edu1Modules = await requestApi("/my-modules", {
    cookie: edu1.cookie,
  });
  assert.equal(edu1Modules.response.status, 200);
  assert.equal(edu1Modules.body.results, 1);
  assert.equal(edu1Modules.body.data.modules[0].title, "Visual Timetables for Morning Routines");
  // Check YouTube URL was normalized to embed
  assert.ok(edu1Modules.body.data.modules[0].videoUrl.includes("/embed/"));

  // Edu2 queries my-modules
  const edu2Modules = await requestApi("/my-modules", {
    cookie: edu2.cookie,
  });
  assert.equal(edu2Modules.response.status, 200);
  assert.equal(edu2Modules.body.results, 1);
  assert.equal(edu2Modules.body.data.modules[0].title, "Sensory Corner Setup");
});

test("PUT /api/v1/learning/modules/:id updates authored material and enforces ownership checks", async () => {
  const author = await createTestUser({ name: "Author Educator", email: "author@test.com", role: "educator", isVerified: true });
  const otherUser = await createTestUser({ name: "Intruder Educator", email: "intruder@test.com", role: "educator", isVerified: true });

  const createRes = await requestApi("/modules", {
    method: "POST",
    cookie: author.cookie,
    csrfToken: author.csrfToken,
    body: {
      title: "Inclusive Circle Time Strategies",
      category: "Classroom Support",
      desc: "Practical strategies to make morning circle time accessible.",
      videoUrl: "https://www.youtube.com/watch?v=mno789pqr12",
      format: "Video",
    },
  });
  assert.equal(createRes.response.status, 201);
  const moduleId = createRes.body.data.module._id;

  // Other user attempts to edit author's module -> 403 Forbidden
  const forbiddenEdit = await requestApi(`/modules/${moduleId}`, {
    method: "PUT",
    cookie: otherUser.cookie,
    csrfToken: otherUser.csrfToken,
    body: {
      title: "Malicious Edit Overwrite",
    },
  });
  assert.equal(forbiddenEdit.response.status, 403);
  assert.equal(forbiddenEdit.body.error.code, "FORBIDDEN");

  // Author edits their own module
  const validEdit = await requestApi(`/modules/${moduleId}`, {
    method: "PUT",
    cookie: author.cookie,
    csrfToken: author.csrfToken,
    body: {
      title: "Inclusive Circle Time Strategies (Updated)",
      desc: "Expanded and updated practical strategies for circle time with sensory adaptations.",
      duration: "18 min",
      takeaways: ["Offer flexible seating options.", "Use visual choice boards."],
    },
  });
  assert.equal(validEdit.response.status, 200);
  assert.equal(validEdit.body.data.module.title, "Inclusive Circle Time Strategies (Updated)");
  assert.equal(validEdit.body.data.module.duration, "18 min");
  assert.equal(validEdit.body.data.module.takeaways.length, 2);
});

test("DELETE /api/v1/learning/modules/:id safely deletes authored material and enforces ownership", async () => {
  const author = await createTestUser({ name: "Delete Tester", email: "delete.tester@test.com", role: "educator", isVerified: true });
  const otherUser = await createTestUser({ name: "Other Delete Tester", email: "other.delete@test.com", role: "educator", isVerified: true });

  const createRes = await requestApi("/modules", {
    method: "POST",
    cookie: author.cookie,
    csrfToken: author.csrfToken,
    body: {
      title: "Temporary Checklist to be Removed",
      category: "Classroom Support",
      desc: "A temporary checklist that should be completely deleted.",
      videoUrl: "https://www.youtube.com/embed/temp123",
      format: "Checklist",
    },
  });
  const moduleId = createRes.body.data.module._id;

  // Non-owner cannot delete
  const forbiddenDelete = await requestApi(`/modules/${moduleId}`, {
    method: "DELETE",
    cookie: otherUser.cookie,
    csrfToken: otherUser.csrfToken,
  });
  assert.equal(forbiddenDelete.response.status, 403);
  assert.equal(forbiddenDelete.body.error.code, "FORBIDDEN");

  // Owner can delete
  const validDelete = await requestApi(`/modules/${moduleId}`, {
    method: "DELETE",
    cookie: author.cookie,
    csrfToken: author.csrfToken,
  });
  assert.equal(validDelete.response.status, 200);
  assert.equal(validDelete.body.status, "success");

  // Verify it is no longer found
  const getDeleted = await requestApi(`/modules/${moduleId}`);
  assert.equal(getDeleted.response.status, 404);
  assert.equal(getDeleted.body.error.code, "MODULE_NOT_FOUND");
});
