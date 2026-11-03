const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

process.env.SESSION_SECRET = "test-session-secret-that-is-long-enough-to-be-safe";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const { User } = require("../src/models/User");
const { ProfessionalProfile } = require("../src/models/ProfessionalProfile");
const { Consultation } = require("../src/models/Consultation");
const { createSession } = require("../src/config/session");

let mongoServer;
let httpServer;
let baseUrl;

async function createTestUser({ name, email, role, isVerified = false, city = "Bhubaneswar" }) {
  const user = await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash("safe-test-password", 12),
    role,
    isVerified,
    guardianConsent: true,
    location: { city },
  });
  const session = await createSession(user._id);
  return { user, cookie: `lumina_session=${session.sessionToken}`, csrfToken: session.csrfToken };
}

function getFutureDate(daysAhead = 3) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

let parent1;
let parent2;
let therapist1;
let therapist2;
let therapistProfile1;
let futureDate1;
let futureDate2;

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  httpServer = app.listen(0);
  await new Promise((resolve) => httpServer.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${httpServer.address().port}`;

  futureDate1 = getFutureDate(5);
  futureDate2 = getFutureDate(7);

  parent1 = await createTestUser({
    name: "Aarti Sharma",
    email: "aarti.sharma@example.test",
    role: "parent",
  });

  parent2 = await createTestUser({
    name: "Sunil Panda",
    email: "sunil.panda@example.test",
    role: "parent",
  });

  therapist1 = await createTestUser({
    name: "Dr. Meera Das",
    email: "meera.das@example.test",
    role: "therapist",
    isVerified: true,
  });

  therapistProfile1 = await ProfessionalProfile.create({
    userId: therapist1.user._id,
    professionalType: "Speech Therapist",
    specialization: "Early AAC",
    bio: "Pediatric speech therapist.",
    city: "Bhubaneswar",
    languages: ["Odia", "English"],
    yearsExperience: 9,
    availability: "accepting_clients",
    rating: 4.9,
    reviewCount: 38,
  });

  therapist2 = await createTestUser({
    name: "Dr. Unverified",
    email: "unverified@example.test",
    role: "therapist",
    isVerified: false,
  });
});

after(async () => {
  await new Promise((resolve) => httpServer.close(resolve));
  await mongoose.disconnect();
  await mongoServer.stop();
});

test("GET /api/v1/consultations/availability returns open slots and rejects invalid/past dates", async () => {
  // 1. Missing params
  const res1 = await fetch(`${baseUrl}/api/v1/consultations/availability`, {
    headers: { Cookie: parent1.cookie },
  });
  assert.equal(res1.status, 400);

  // 2. Past date rejected
  const res2 = await fetch(
    `${baseUrl}/api/v1/consultations/availability?professionalId=${therapist1.user._id}&date=2020-01-01`,
    { headers: { Cookie: parent1.cookie } }
  );
  assert.equal(res2.status, 400);
  const data2 = await res2.json();
  assert.equal(data2.error.code, "DATE_IN_PAST");

  // 3. Valid future date
  const res3 = await fetch(
    `${baseUrl}/api/v1/consultations/availability?professionalId=${therapist1.user._id}&date=${futureDate1}`,
    { headers: { Cookie: parent1.cookie } }
  );
  assert.equal(res3.status, 200);
  const data3 = await res3.json();
  assert.equal(data3.status, "success");
  assert.ok(Array.isArray(data3.data.availableSlots));
  assert.ok(data3.data.availableSlots.includes("10:00 AM"));
  assert.equal(data3.data.bookedSlots.length, 0);
});

test("POST /api/v1/consultations books appointment, enforces authentication, role, and CSRF", async () => {
  // 1. Unauthenticated blocked
  const resNoAuth = await fetch(`${baseUrl}/api/v1/consultations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      professionalId: therapist1.user._id,
      date: futureDate1,
      timeSlot: "10:00 AM",
    }),
  });
  assert.equal(resNoAuth.status, 401);

  // 2. CSRF required
  const resNoCsrf = await fetch(`${baseUrl}/api/v1/consultations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: parent1.cookie,
    },
    body: JSON.stringify({
      professionalId: therapist1.user._id,
      date: futureDate1,
      timeSlot: "10:00 AM",
    }),
  });
  assert.equal(resNoCsrf.status, 403);

  // 3. Therapist cannot book consultations (must be parent or admin)
  const resTherapistBook = await fetch(`${baseUrl}/api/v1/consultations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: therapist1.cookie,
      "X-CSRF-Token": therapist1.csrfToken,
    },
    body: JSON.stringify({
      professionalId: therapist1.user._id,
      date: futureDate1,
      timeSlot: "10:00 AM",
    }),
  });
  assert.equal(resTherapistBook.status, 403);

  // 4. Cannot book unverified specialist
  const resUnverified = await fetch(`${baseUrl}/api/v1/consultations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: parent1.cookie,
      "X-CSRF-Token": parent1.csrfToken,
    },
    body: JSON.stringify({
      professionalId: therapist2.user._id,
      date: futureDate1,
      timeSlot: "10:00 AM",
    }),
  });
  assert.equal(resUnverified.status, 400);
  const dataUnverified = await resUnverified.json();
  assert.equal(dataUnverified.error.code, "PROFESSIONAL_NOT_VERIFIED");

  // 5. Successful booking by parent
  const resSuccess = await fetch(`${baseUrl}/api/v1/consultations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: parent1.cookie,
      "X-CSRF-Token": parent1.csrfToken,
    },
    body: JSON.stringify({
      professionalId: therapist1.user._id,
      date: futureDate1,
      timeSlot: "10:00 AM",
      childName: "Rohan",
      notes: "First speech therapy evaluation",
    }),
  });

  assert.equal(resSuccess.status, 201);
  const dataSuccess = await resSuccess.json();
  assert.equal(dataSuccess.status, "success");
  assert.equal(dataSuccess.data.consultation.date, futureDate1);
  assert.equal(dataSuccess.data.consultation.timeSlot, "10:00 AM");
  assert.equal(dataSuccess.data.consultation.status, "confirmed");
  assert.equal(dataSuccess.data.consultation.childName, "Rohan");
  assert.equal(dataSuccess.data.consultation.professional.name, "Dr. Meera Das");
});

test("POST /api/v1/consultations prevents double bookings and overlapping time slots", async () => {
  // Parent 2 attempts to book the exact same slot that Parent 1 just booked
  const resDouble = await fetch(`${baseUrl}/api/v1/consultations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: parent2.cookie,
      "X-CSRF-Token": parent2.csrfToken,
    },
    body: JSON.stringify({
      professionalId: therapist1.user._id,
      date: futureDate1,
      timeSlot: "10:00 AM",
      childName: "Sneha",
    }),
  });

  assert.equal(resDouble.status, 409);
  const dataDouble = await resDouble.json();
  assert.equal(dataDouble.error.code, "SLOT_ALREADY_BOOKED");

  // Availability endpoint reflects that 10:00 AM is now booked
  const resAvail = await fetch(
    `${baseUrl}/api/v1/consultations/availability?professionalId=${therapist1.user._id}&date=${futureDate1}`,
    { headers: { Cookie: parent1.cookie } }
  );
  const dataAvail = await resAvail.json();
  assert.ok(dataAvail.data.bookedSlots.includes("10:00 AM"));
  assert.ok(!dataAvail.data.availableSlots.includes("10:00 AM"));
});

test("POST /api/v1/consultations prevents duplicate active booking by the same parent", async () => {
  // Parent 1 attempts to re-book the same slot
  const resDuplicate = await fetch(`${baseUrl}/api/v1/consultations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: parent1.cookie,
      "X-CSRF-Token": parent1.csrfToken,
    },
    body: JSON.stringify({
      professionalId: therapist1.user._id,
      date: futureDate1,
      timeSlot: "10:00 AM",
    }),
  });

  assert.equal(resDuplicate.status, 409);
});

test("GET /api/v1/consultations returns scoped bookings for parents and therapists", async () => {
  // Parent 1 sees their booking
  const resP1 = await fetch(`${baseUrl}/api/v1/consultations`, {
    headers: { Cookie: parent1.cookie },
  });
  assert.equal(resP1.status, 200);
  const dataP1 = await resP1.json();
  assert.ok(dataP1.data.consultations.length >= 1);
  assert.equal(dataP1.data.consultations[0].parent.name, "Aarti Sharma");

  // Parent 2 sees 0 bookings
  const resP2 = await fetch(`${baseUrl}/api/v1/consultations`, {
    headers: { Cookie: parent2.cookie },
  });
  assert.equal(resP2.status, 200);
  const dataP2 = await resP2.json();
  assert.equal(dataP2.data.consultations.length, 0);

  // Therapist 1 sees the consultation booked with them
  const resT1 = await fetch(`${baseUrl}/api/v1/consultations`, {
    headers: { Cookie: therapist1.cookie },
  });
  assert.equal(resT1.status, 200);
  const dataT1 = await resT1.json();
  assert.ok(dataT1.data.consultations.length >= 1);
  assert.equal(dataT1.data.consultations[0].professional.name, "Dr. Meera Das");
});

test("PUT /api/v1/consultations/:id/cancel allows cancellation and frees up slot for re-booking", async () => {
  // Find Parent 1's booking
  const activeBooking = await Consultation.findOne({
    parent: parent1.user._id,
    date: futureDate1,
    timeSlot: "10:00 AM",
  });
  assert.ok(activeBooking);

  // 1. Parent 2 cannot cancel Parent 1's booking (ownership check)
  const resForbidden = await fetch(`${baseUrl}/api/v1/consultations/${activeBooking._id}/cancel`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: parent2.cookie,
      "X-CSRF-Token": parent2.csrfToken,
    },
    body: JSON.stringify({ reason: "Unauthorized attempt" }),
  });
  assert.equal(resForbidden.status, 403);

  // 2. Parent 1 cancels their own booking
  const resCancel = await fetch(`${baseUrl}/api/v1/consultations/${activeBooking._id}/cancel`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: parent1.cookie,
      "X-CSRF-Token": parent1.csrfToken,
    },
    body: JSON.stringify({ reason: "Schedule conflict" }),
  });
  assert.equal(resCancel.status, 200);
  const dataCancel = await resCancel.json();
  assert.equal(dataCancel.data.consultation.status, "cancelled");

  // 3. Cancelling already-cancelled booking rejected
  const resCancelAgain = await fetch(`${baseUrl}/api/v1/consultations/${activeBooking._id}/cancel`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: parent1.cookie,
      "X-CSRF-Token": parent1.csrfToken,
    },
  });
  assert.equal(resCancelAgain.status, 400);

  // 4. Now that it is cancelled, the slot is free and Parent 2 CAN book it!
  const resRebook = await fetch(`${baseUrl}/api/v1/consultations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: parent2.cookie,
      "X-CSRF-Token": parent2.csrfToken,
    },
    body: JSON.stringify({
      professionalId: therapist1.user._id,
      date: futureDate1,
      timeSlot: "10:00 AM",
      childName: "Sneha",
    }),
  });
  assert.equal(resRebook.status, 201);
});

test("PUT /api/v1/consultations/:id/status allows specialist to manage status and validates transitions", async () => {
  // Find Parent 2's new booking
  const booking = await Consultation.findOne({
    parent: parent2.user._id,
    date: futureDate1,
    timeSlot: "10:00 AM",
  });
  assert.ok(booking);

  // 1. Parent cannot call /status to alter booking status
  const resParentStatus = await fetch(`${baseUrl}/api/v1/consultations/${booking._id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: parent2.cookie,
      "X-CSRF-Token": parent2.csrfToken,
    },
    body: JSON.stringify({ status: "completed" }),
  });
  assert.equal(resParentStatus.status, 403);

  // 2. Specialist marks consultation completed
  const resComplete = await fetch(`${baseUrl}/api/v1/consultations/${booking._id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: therapist1.cookie,
      "X-CSRF-Token": therapist1.csrfToken,
    },
    body: JSON.stringify({ status: "completed" }),
  });
  assert.equal(resComplete.status, 200);
  const dataComplete = await resComplete.json();
  assert.equal(dataComplete.data.consultation.status, "completed");

  // 3. Cannot transition from 'completed' to 'cancelled' (invalid transition)
  const resInvalid = await fetch(`${baseUrl}/api/v1/consultations/${booking._id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: therapist1.cookie,
      "X-CSRF-Token": therapist1.csrfToken,
    },
    body: JSON.stringify({ status: "cancelled" }),
  });
  assert.equal(resInvalid.status, 400);
  const dataInvalid = await resInvalid.json();
  assert.equal(dataInvalid.error.code, "INVALID_STATUS_TRANSITION");
});

test("Consultation endpoints protect sensitive private data", async () => {
  const res = await fetch(`${baseUrl}/api/v1/consultations`, {
    headers: { Cookie: parent2.cookie },
  });
  const data = await res.json();
  assert.equal(res.status, 200);
  const c = data.data.consultations[0];
  assert.ok(c);
  assert.equal(c.parent.passwordHash, undefined);
  assert.equal(c.professional.passwordHash, undefined);
  assert.equal(c.parent.guardianConsent, undefined);
});
