const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

process.env.SESSION_SECRET = "test-session-secret-that-is-long-enough-to-be-safe";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const { User } = require("../src/models/User");
const { LearningModule } = require("../src/models/LearningModule");
const { GovScheme } = require("../src/models/GovScheme");
const { seedLearningData, INITIAL_LEARNING_MODULES } = require("../src/config/seedLearning");
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

async function requestLearning(path, { method = "GET", cookie, csrfToken, body } = {}) {
  const response = await fetch(`${baseUrl}/api/v1/learning${path}`, {
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

test("seed process is idempotent and prevents duplicate learning modules and schemes", async () => {
  const initialModuleCount = await LearningModule.countDocuments();
  const initialSchemeCount = await GovScheme.countDocuments();

  assert.equal(initialModuleCount, INITIAL_LEARNING_MODULES.length);
  assert.equal(initialSchemeCount, 4);

  // Run seed second time
  const reSeedResult = await seedLearningData();
  assert.equal(reSeedResult.seededModules, 0);
  assert.equal(reSeedResult.seededSchemes, 0);

  const finalModuleCount = await LearningModule.countDocuments();
  const finalSchemeCount = await GovScheme.countDocuments();

  assert.equal(finalModuleCount, INITIAL_LEARNING_MODULES.length);
  assert.equal(finalSchemeCount, 4);
});

test("GET /api/v1/learning/modules returns published modules and supports category and language filtering", async () => {
  const { response, body } = await requestLearning("/modules");
  assert.equal(response.status, 200);
  assert.equal(body.status, "success");
  assert.equal(body.results, INITIAL_LEARNING_MODULES.length);
  assert.equal(body.data.modules.length, INITIAL_LEARNING_MODULES.length);

  // Test category filtering
  const sensoryRes = await requestLearning("/modules?category=Sensory");
  assert.equal(sensoryRes.response.status, 200);
  assert.equal(sensoryRes.body.results, 1);
  assert.equal(sensoryRes.body.data.modules[0].category, "Sensory");
  assert.equal(sensoryRes.body.data.modules[0].title, "Sensory Differences");

  // Test language filtering
  const langRes = await requestLearning("/modules?lang=en");
  assert.equal(langRes.response.status, 200);
  assert.equal(langRes.body.results, INITIAL_LEARNING_MODULES.length);
});

test("GET /api/v1/learning/modules/:id retrieves a module by slug and by ObjectId", async () => {
  const { response, body } = await requestLearning("/modules/m1");
  assert.equal(response.status, 200);
  assert.equal(body.status, "success");
  assert.equal(body.data.module.slug, "m1");
  assert.equal(body.data.module.title, "Understanding Autism");

  const byMongoId = await requestLearning(`/modules/${body.data.module._id}`);
  assert.equal(byMongoId.response.status, 200);
  assert.equal(byMongoId.body.data.module.title, "Understanding Autism");

  const notFound = await requestLearning("/modules/non-existent-module");
  assert.equal(notFound.response.status, 404);
  assert.equal(notFound.body.error.code, "MODULE_NOT_FOUND");
});

test("GET /api/v1/learning/schemes returns government schemes and filters by tag", async () => {
  const { response, body } = await requestLearning("/schemes");
  assert.equal(response.status, 200);
  assert.equal(body.status, "success");
  assert.equal(body.results, 4);
  assert.equal(body.data.schemes[0].title, "UDID Card");

  const tagFiltered = await requestLearning("/schemes?tag=Education");
  assert.equal(tagFiltered.response.status, 200);
  assert.equal(tagFiltered.body.results, 1);
  assert.equal(tagFiltered.body.data.schemes[0].schemeId, "edu");
});

test("POST /api/v1/learning/modules blocks unauthenticated users and parents from publishing", async () => {
  const unauthenticated = await requestLearning("/modules", {
    method: "POST",
    body: { title: "New Lesson" },
  });
  assert.equal(unauthenticated.response.status, 401);
  assert.equal(unauthenticated.body.error.code, "AUTHENTICATION_REQUIRED");

  const parent = await createTestUser({
    name: "Parent User",
    email: "parent.learner@example.test",
    role: "parent",
  });

  const parentPublish = await requestLearning("/modules", {
    method: "POST",
    cookie: parent.cookie,
    csrfToken: parent.csrfToken,
    body: {
      title: "Parent's Guide",
      category: "Parenting",
      desc: "Guides and notes written from home perspective.",
      videoUrl: "https://www.youtube.com/embed/test",
    },
  });
  assert.equal(parentPublish.response.status, 403);
  assert.equal(parentPublish.body.error.code, "FORBIDDEN");
});

test("POST /api/v1/learning/modules blocks unverified professionals and allows verified experts only", async () => {
  const unverifiedTherapist = await createTestUser({
    name: "Dr. Candidate",
    email: "unverified.therapist@example.test",
    role: "therapist",
    isVerified: false,
  });

  const unverifiedPublish = await requestLearning("/modules", {
    method: "POST",
    cookie: unverifiedTherapist.cookie,
    csrfToken: unverifiedTherapist.csrfToken,
    body: {
      title: "Speech Articulation at Home",
      category: "Communication",
      desc: "Practical speech therapy exercises for non-speaking children.",
      videoUrl: "https://www.youtube.com/embed/speech123",
    },
  });
  assert.equal(unverifiedPublish.response.status, 403);
  assert.equal(unverifiedPublish.body.error.code, "EXPERT_VERIFICATION_REQUIRED");

  // Create verified therapist
  const verifiedTherapist = await createTestUser({
    name: "Dr. Shanti Mishra",
    email: "shanti.verified@example.test",
    role: "therapist",
    isVerified: true,
  });

  const verifiedPublish = await requestLearning("/modules", {
    method: "POST",
    cookie: verifiedTherapist.cookie,
    csrfToken: verifiedTherapist.csrfToken,
    body: {
      title: "Sensory Diets for Classrooms",
      category: "Sensory",
      desc: "Clinical sensory diet framework designed for home and special classrooms.",
      videoUrl: "https://www.youtube.com/embed/sensory123",
      duration: "14 min",
      difficulty: "Intermediate",
      takeaways: ["Tailor sensory breaks to individual needs.", "Schedule regular calming intervals."],
    },
  });

  assert.equal(verifiedPublish.response.status, 201);
  assert.equal(verifiedPublish.body.status, "success");
  assert.equal(verifiedPublish.body.data.module.title, "Sensory Diets for Classrooms");
  assert.equal(verifiedPublish.body.data.module.publishedBy, "Dr. Shanti Mishra");
  assert.equal(verifiedPublish.body.data.module.category, "Sensory");

  // Verify the published module is immediately retrievable via public API
  const publicFetch = await requestLearning(`/modules/${verifiedPublish.body.data.module.slug}`);
  assert.equal(publicFetch.response.status, 200);
  assert.equal(publicFetch.body.data.module.title, "Sensory Diets for Classrooms");
  assert.equal(publicFetch.body.data.module.isOfficial, false);
  assert.equal(publicFetch.body.data.module.isEducatorContribution, true);
  assert.equal(publicFetch.body.data.module.isVerifiedAuthor, true);
  assert.equal(publicFetch.body.data.module.author.name, "Dr. Shanti Mishra");
  assert.equal(publicFetch.body.data.module.author.isVerified, true);
});

test("GET /api/v1/learning/modules supports content-source distinction and filtering", async () => {
  // Test All materials
  const allRes = await requestLearning("/modules");
  assert.equal(allRes.response.status, 200);
  assert.ok(allRes.body.data.modules.length >= 7);

  // Test Foundation filter
  const foundationRes = await requestLearning("/modules?source=foundation");
  assert.equal(foundationRes.response.status, 200);
  assert.equal(foundationRes.body.results, INITIAL_LEARNING_MODULES.length);
  foundationRes.body.data.modules.forEach((m) => {
    assert.equal(m.isOfficial, true);
    assert.equal(m.isEducatorContribution, false);
    assert.equal(m.authorId, null);
    assert.ok(m.publishedBy);
  });

  // Test Educator filter
  const educatorRes = await requestLearning("/modules?source=educator");
  assert.equal(educatorRes.response.status, 200);
  assert.ok(educatorRes.body.results >= 1);
  educatorRes.body.data.modules.forEach((m) => {
    assert.equal(m.isOfficial, false);
    assert.equal(m.isEducatorContribution, true);
    assert.ok(m.authorId);
    assert.equal(typeof m.isVerifiedAuthor, "boolean");
  });

  // Combined source + category filter
  const combinedRes = await requestLearning("/modules?source=foundation&category=Sensory");
  assert.equal(combinedRes.response.status, 200);
  assert.equal(combinedRes.body.results, 1);
  assert.equal(combinedRes.body.data.modules[0].title, "Sensory Differences");
  assert.equal(combinedRes.body.data.modules[0].isOfficial, true);
});

