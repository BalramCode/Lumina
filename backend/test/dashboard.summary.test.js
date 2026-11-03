const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

process.env.SESSION_SECRET = "test-session-secret-that-is-long-enough-to-be-safe";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const { User } = require("../src/models/User");
const { ProfessionalProfile } = require("../src/models/ProfessionalProfile");
const { createSession } = require("../src/config/session");

let mongoServer;
let httpServer;
let baseUrl;

async function createAuthenticatedTestUser({ name, email, role, location }) {
  const user = await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash("safe-test-password", 12),
    role,
    guardianConsent: true,
    location,
  });
  const session = await createSession(user._id);
  return { user, cookie: `lumina_session=${session.sessionToken}`, csrfToken: session.csrfToken };
}

async function requestDashboardSummary(cookie = "") {
  const response = await fetch(`${baseUrl}/api/v1/dashboard/summary`, {
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
    },
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

test("GET /api/v1/dashboard/summary requires authentication", async () => {
  const { response, body } = await requestDashboardSummary();
  assert.equal(response.status, 401);
  assert.equal(body.error.code, "AUTHENTICATION_REQUIRED");
});

test("GET /api/v1/dashboard/summary returns parent summary with accurate professional metrics", async () => {
  const parent = await createAuthenticatedTestUser({
    name: "Meera Das",
    email: "meera.parent@example.test",
    role: "parent",
    location: { city: "Bhubaneswar" },
  });

  const therapist1 = await createAuthenticatedTestUser({
    name: "Dr. Alok Nayak",
    email: "alok.nayak@example.test",
    role: "therapist",
    location: { city: "Bhubaneswar" },
  });

  const therapist2 = await createAuthenticatedTestUser({
    name: "Pooja Ray",
    email: "pooja.ray@example.test",
    role: "therapist",
    location: { city: "Cuttack" },
  });

  await ProfessionalProfile.create([
    {
      userId: therapist1.user._id,
      professionalType: "Speech Therapist",
      bio: "Speech therapist with extensive pediatric communication experience.",
      city: "Bhubaneswar",
      languages: ["English", "Odia"],
      yearsExperience: 7,
      availability: "accepting_clients",
    },
    {
      userId: therapist2.user._id,
      professionalType: "Occupational Therapist",
      bio: "Focusing on sensory integration and fine motor independence.",
      city: "Cuttack",
      languages: ["English"],
      yearsExperience: 4,
      availability: "waitlist",
    },
  ]);

  const { response, body } = await requestDashboardSummary(parent.cookie);

  assert.equal(response.status, 200);
  assert.equal(body.status, "success");
  assert.equal(body.data.role, "parent");
  assert.equal(body.data.metrics.totalProfessionals, 2);
  assert.equal(body.data.metrics.acceptingClients, 1);
  assert.equal(body.data.metrics.inMyCity, 1);
  assert.equal(body.data.userCity, "Bhubaneswar");
  assert.equal(body.data.recentProfessionals.length, 2);
  const returnedNames = body.data.recentProfessionals.map((p) => p.name);
  assert.ok(returnedNames.includes("Dr. Alok Nayak"));
  assert.ok(returnedNames.includes("Pooja Ray"));
});

test("GET /api/v1/dashboard/summary returns therapist summary with profile status", async () => {
  const therapistWithoutProfile = await createAuthenticatedTestUser({
    name: "New Therapist",
    email: "new.therapist@example.test",
    role: "therapist",
    location: { city: "Bhubaneswar" },
  });

  const res1 = await requestDashboardSummary(therapistWithoutProfile.cookie);
  assert.equal(res1.response.status, 200);
  assert.equal(res1.body.data.role, "therapist");
  assert.equal(res1.body.data.hasProfile, false);
  assert.equal(res1.body.data.profile, null);
  assert.equal(res1.body.data.metrics.directorySize, 2);

  // Now create profile for this therapist
  await ProfessionalProfile.create({
    userId: therapistWithoutProfile.user._id,
    professionalType: "Clinical Psychologist",
    bio: "Neurodiversity-affirming psychology practice for children and teens.",
    city: "Bhubaneswar",
    languages: ["English", "Hindi"],
    yearsExperience: 9,
    availability: "accepting_clients",
  });

  const res2 = await requestDashboardSummary(therapistWithoutProfile.cookie);
  assert.equal(res2.response.status, 200);
  assert.equal(res2.body.data.hasProfile, true);
  assert.equal(res2.body.data.profile.professionalType, "Clinical Psychologist");
  assert.equal(res2.body.data.profile.availability, "accepting_clients");
  assert.equal(res2.body.data.metrics.directorySize, 3);
  assert.equal(res2.body.data.metrics.colleaguesInCity, 1); // therapist1 is also in Bhubaneswar
});

test("GET /api/v1/dashboard/summary returns educator community overview", async () => {
  const educator = await createAuthenticatedTestUser({
    name: "Binod Mohanty",
    email: "binod.educator@example.test",
    role: "educator",
  });

  const { response, body } = await requestDashboardSummary(educator.cookie);

  assert.equal(response.status, 200);
  assert.equal(body.status, "success");
  assert.equal(body.data.role, "educator");
  assert.equal(body.data.metrics.totalEducators >= 1, true);
  assert.equal(body.data.metrics.totalProfessionals >= 2, true);
  assert.equal(body.data.metrics.totalCommunityMembers >= 4, true);
});

test("GET /api/v1/dashboard/summary returns mentor community overview", async () => {
  const mentor = await createAuthenticatedTestUser({
    name: "Sunita Patnaik",
    email: "sunita.mentor@example.test",
    role: "mentor",
  });

  const { response, body } = await requestDashboardSummary(mentor.cookie);

  assert.equal(response.status, 200);
  assert.equal(body.status, "success");
  assert.equal(body.data.role, "mentor");
  assert.equal(body.data.metrics.totalMentors >= 1, true);
  assert.equal(body.data.metrics.totalParents >= 1, true);
  assert.equal(body.data.metrics.totalCommunityMembers >= 5, true);
});
