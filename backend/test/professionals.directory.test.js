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

async function requestProfessionals(query = "", { method = "GET", cookie } = {}) {
  const response = await fetch(`${baseUrl}/api/v1/professionals${query}`, {
    method,
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
    },
  });

  const responseBody = response.status === 204 ? null : await response.json();
  return { response, body: responseBody };
}

let parentUser;
let therapistUser;

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  httpServer = app.listen(0);
  await new Promise((resolve) => httpServer.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${httpServer.address().port}`;

  parentUser = await createTestUser({
    name: "Parent Reviewer",
    email: "parent.reviewer@example.test",
    role: "parent",
  });

  therapistUser = await createTestUser({
    name: "Dr. Clinic Lead",
    email: "therapist.lead@example.test",
    role: "therapist",
    isVerified: true,
  });

  // Seed sample specialists with 2dsphere locations
  // Bhubaneswar: [85.8245, 20.2961]
  // Cuttack: [85.8828, 20.4625] (approx 20 km from Bhubaneswar)
  // Puri: [85.8312, 19.8135] (approx 55 km from Bhubaneswar)
  const pro1 = await createTestUser({ name: "Dr. Meera Das", email: "meera@example.test", role: "therapist", isVerified: true });
  const pro2 = await createTestUser({ name: "Dr. Arun Mishra", email: "arun@example.test", role: "therapist", isVerified: true });
  const pro3 = await createTestUser({ name: "Kavya Reddy", email: "kavya@example.test", role: "therapist", isVerified: true });
  const pro4 = await createTestUser({ name: "Dr. Somnath Puri", email: "somnath@example.test", role: "therapist", isVerified: false });

  await ProfessionalProfile.create([
    {
      userId: pro1.user._id,
      professionalType: "Speech Therapist",
      specialization: "Early language & AAC",
      bio: "Pediatric speech therapy specializing in non-speaking children and AAC devices.",
      city: "Bhubaneswar",
      languages: ["Odia", "English"],
      yearsExperience: 9,
      availability: "accepting_clients",
      rating: 4.9,
      reviewCount: 38,
      location: {
        type: "Point",
        coordinates: [85.8245, 20.2961],
        address: "Saheed Nagar, Bhubaneswar",
        district: "Khordha",
      },
    },
    {
      userId: pro2.user._id,
      professionalType: "Developmental Pediatrician",
      specialization: "Early diagnosis & autism assessments",
      bio: "Comprehensive neurodevelopmental evaluations and medical support pathways.",
      city: "Bhubaneswar",
      languages: ["Hindi", "English"],
      yearsExperience: 14,
      availability: "waitlist",
      rating: 4.8,
      reviewCount: 52,
      location: {
        type: "Point",
        coordinates: [85.815, 20.305],
        address: "Jayadev Vihar, Bhubaneswar",
        district: "Khordha",
      },
    },
    {
      userId: pro3.user._id,
      professionalType: "Occupational Therapist",
      specialization: "Sensory integration",
      bio: "Sensory processing assessments, sensory diet design, and fine motor therapy.",
      city: "Cuttack",
      languages: ["English", "Odia"],
      yearsExperience: 7,
      availability: "accepting_clients",
      rating: 4.7,
      reviewCount: 29,
      location: {
        type: "Point",
        coordinates: [85.8828, 20.4625],
        address: "Badambadi, Cuttack",
        district: "Cuttack",
      },
    },
    {
      userId: pro4.user._id,
      professionalType: "Occupational Therapist",
      specialization: "Pediatric sensory therapy",
      bio: "Independent clinic near Puri seaside offering sensory play and physical activity.",
      city: "Puri",
      languages: ["Odia", "Hindi"],
      yearsExperience: 5,
      availability: "accepting_clients",
      rating: 4.5,
      reviewCount: 12,
      location: {
        type: "Point",
        coordinates: [85.8312, 19.8135],
        address: "Grand Road, Puri",
        district: "Puri",
      },
    },
  ]);
});

after(async () => {
  await new Promise((resolve) => httpServer.close(resolve));
  await mongoose.disconnect();
  await mongoServer.stop();
});

test("GET /api/v1/professionals enforces authentication and parent role restriction", async () => {
  // 1. Unauthenticated request rejected with 401
  const unauth = await requestProfessionals();
  assert.equal(unauth.response.status, 401);
  assert.equal(unauth.body.error.code, "AUTHENTICATION_REQUIRED");

  // 2. Therapist browsing parent directory rejected with 403
  const therapistBrowse = await requestProfessionals("", { cookie: therapistUser.cookie });
  assert.equal(therapistBrowse.response.status, 403);
  assert.equal(therapistBrowse.body.error.code, "FORBIDDEN");

  // 3. Parent browsing parent directory allowed with 200
  const parentBrowse = await requestProfessionals("", { cookie: parentUser.cookie });
  assert.equal(parentBrowse.response.status, 200);
  assert.equal(parentBrowse.body.status, "success");
  assert.equal(parentBrowse.body.results, 4);
});

test("GET /api/v1/professionals supports filtering by professional type", async () => {
  const { response, body } = await requestProfessionals("?type=Speech Therapist", {
    cookie: parentUser.cookie,
  });
  assert.equal(response.status, 200);
  assert.equal(body.results, 1);
  assert.equal(body.data.profiles[0].name, "Dr. Meera Das");
  assert.equal(body.data.profiles[0].professionalType, "Speech Therapist");
});

test("GET /api/v1/professionals supports filtering by specialization keyword", async () => {
  const { response, body } = await requestProfessionals("?specialization=Sensory", {
    cookie: parentUser.cookie,
  });
  assert.equal(response.status, 200);
  assert.equal(body.results, 2);
  const names = body.data.profiles.map((p) => p.name);
  assert.ok(names.includes("Kavya Reddy"));
  assert.ok(names.includes("Dr. Somnath Puri"));
});

test("GET /api/v1/professionals supports filtering by location / city", async () => {
  const { response, body } = await requestProfessionals("?city=Cuttack", {
    cookie: parentUser.cookie,
  });
  assert.equal(response.status, 200);
  assert.equal(body.results, 1);
  assert.equal(body.data.profiles[0].city, "Cuttack");
  assert.equal(body.data.profiles[0].name, "Kavya Reddy");
});

test("GET /api/v1/professionals 2dsphere geospatial search finds nearby professionals within radius", async () => {
  // Bhubaneswar coordinates: lat 20.2961, lng 85.8245
  // Search within 10 km radius: should find Bhubaneswar professionals (Meera Das, Arun Mishra),
  // but NOT Cuttack (approx 20 km) or Puri (approx 55 km).
  const nearbyBhubaneswar = await requestProfessionals("?lat=20.2961&lng=85.8245&maxDist=10", {
    cookie: parentUser.cookie,
  });
  assert.equal(nearbyBhubaneswar.response.status, 200);
  assert.equal(nearbyBhubaneswar.body.results, 2);
  assert.ok(nearbyBhubaneswar.body.data.profiles[0].distance !== null);
  assert.ok(nearbyBhubaneswar.body.data.profiles[0].distance <= 10);
  assert.ok(nearbyBhubaneswar.body.data.profiles[1].distance <= 10);
  // Ensure closest is first
  assert.ok(nearbyBhubaneswar.body.data.profiles[0].distance <= nearbyBhubaneswar.body.data.profiles[1].distance);

  // Search within 25 km radius: should now include Cuttack (Kavya Reddy) as well
  const widerRadius = await requestProfessionals("?lat=20.2961&lng=85.8245&maxDist=25", {
    cookie: parentUser.cookie,
  });
  assert.equal(widerRadius.response.status, 200);
  assert.equal(widerRadius.body.results, 3);
  const names = widerRadius.body.data.profiles.map((p) => p.name);
  assert.ok(names.includes("Dr. Meera Das"));
  assert.ok(names.includes("Dr. Arun Mishra"));
  assert.ok(names.includes("Kavya Reddy"));
  assert.ok(!names.includes("Dr. Somnath Puri")); // Puri is ~55 km away, excluded

  // Search within 70 km radius: includes Puri as well
  const allRange = await requestProfessionals("?lat=20.2961&lng=85.8245&maxDist=70", {
    cookie: parentUser.cookie,
  });
  assert.equal(allRange.response.status, 200);
  assert.equal(allRange.body.results, 4);
});

test("GET /api/v1/professionals handles invalid coordinates and radius safely", async () => {
  // 1. Missing longitude when latitude is provided
  const missingLng = await requestProfessionals("?lat=20.2961", { cookie: parentUser.cookie });
  assert.equal(missingLng.response.status, 400);
  assert.equal(missingLng.body.error.code, "INVALID_COORDINATES");

  // 2. Non-numeric coordinates
  const nanCoords = await requestProfessionals("?lat=invalid&lng=85.8245", { cookie: parentUser.cookie });
  assert.equal(nanCoords.response.status, 400);
  assert.equal(nanCoords.body.error.code, "INVALID_COORDINATES");

  // 3. Latitude out of bounds (> 90)
  const outOfBoundsLat = await requestProfessionals("?lat=95.5&lng=85.8245", { cookie: parentUser.cookie });
  assert.equal(outOfBoundsLat.response.status, 400);
  assert.equal(outOfBoundsLat.body.error.code, "INVALID_COORDINATES");

  // 4. Longitude out of bounds (< -180)
  const outOfBoundsLng = await requestProfessionals("?lat=20.2961&lng=-195", { cookie: parentUser.cookie });
  assert.equal(outOfBoundsLng.response.status, 400);
  assert.equal(outOfBoundsLng.body.error.code, "INVALID_COORDINATES");

  // 5. Negative radius
  const negativeRadius = await requestProfessionals("?lat=20.2961&lng=85.8245&maxDist=-5", { cookie: parentUser.cookie });
  assert.equal(negativeRadius.response.status, 400);
  assert.equal(negativeRadius.body.error.code, "INVALID_RADIUS");
});

test("GET /api/v1/professionals returns empty list when no specialists match", async () => {
  const noMatch = await requestProfessionals("?type=Psychologist&city=Sambalpur", {
    cookie: parentUser.cookie,
  });
  assert.equal(noMatch.response.status, 200);
  assert.equal(noMatch.body.results, 0);
  assert.deepEqual(noMatch.body.data.profiles, []);
});

test("GET /api/v1/professionals protects sensitive user data", async () => {
  const { response, body } = await requestProfessionals("", { cookie: parentUser.cookie });
  assert.equal(response.status, 200);
  body.data.profiles.forEach((profile) => {
    assert.equal(profile.passwordHash, undefined);
    assert.equal(profile.email, undefined);
    assert.equal(profile.refreshTokenHash, undefined);
    assert.equal(profile.guardianConsent, undefined);
    assert.ok(profile.id);
    assert.ok(profile.name);
    assert.ok(profile.professionalType);
  });
});
