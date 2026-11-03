const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

process.env.SESSION_SECRET = "test-session-secret-that-is-long-enough-to-be-safe";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const { InclusiveVenue } = require("../src/models/InclusiveVenue");
const { seedVenuesData, INITIAL_VENUES } = require("../src/config/seedVenues");

let mongoServer;
let httpServer;
let baseUrl;

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  httpServer = app.listen(0);
  await new Promise((resolve) => httpServer.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${httpServer.address().port}`;

  await seedVenuesData();
});

after(async () => {
  await new Promise((resolve) => httpServer.close(resolve));
  await mongoose.disconnect();
  await mongoServer.stop();
});

test("GET /api/v1/venues returns seeded inclusive venues", async () => {
  const res = await fetch(`${baseUrl}/api/v1/venues`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, "success");
  assert.equal(data.count, INITIAL_VENUES.length);
  assert.ok(Array.isArray(data.data.venues));
  assert.ok(data.data.venues.some((v) => v.name === "Sishu Bhawan Library"));
});

test("GET /api/v1/venues filters by category", async () => {
  const res = await fetch(`${baseUrl}/api/v1/venues?category=Libraries`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.data.venues.length >= 1);
  assert.ok(data.data.venues.every((v) => v.category === "Libraries"));
});

test("GET /api/v1/venues filters by location / city", async () => {
  const res = await fetch(`${baseUrl}/api/v1/venues?city=Bhubaneswar`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.data.venues.length >= 1);
  assert.ok(data.data.venues.every((v) => v.location === "Bhubaneswar"));
});

test("GET /api/v1/venues 2dsphere proximity search finds nearby venues with calculated distance", async () => {
  // Bhubaneswar coordinates
  const res = await fetch(`${baseUrl}/api/v1/venues?lat=20.2961&lng=85.8245&maxDist=20`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.data.venues.length >= 1);
  // Venues returned should have distance property in km
  assert.ok(data.data.venues.every((v) => typeof v.distance === "number"));
  // Closest venue should appear first
  assert.ok(data.data.venues[0].distance <= data.data.venues[data.data.venues.length - 1].distance);
});

test("GET /api/v1/venues handles invalid coordinates and radius safely", async () => {
  const resBadCoord = await fetch(`${baseUrl}/api/v1/venues?lat=999&lng=85.8245`);
  assert.equal(resBadCoord.status, 400);
  const dataBadCoord = await resBadCoord.json();
  assert.equal(dataBadCoord.error.code, "INVALID_COORDINATES");

  const resBadRadius = await fetch(`${baseUrl}/api/v1/venues?lat=20.29&lng=85.82&maxDist=-10`);
  assert.equal(resBadRadius.status, 400);
  const dataBadRadius = await resBadRadius.json();
  assert.equal(dataBadRadius.error.code, "INVALID_RADIUS");
});

test("GET /api/v1/venues/:id retrieves venue details by ObjectId", async () => {
  const allRes = await fetch(`${baseUrl}/api/v1/venues`);
  const allData = await allRes.json();
  const firstVenue = allData.data.venues[0];

  const res = await fetch(`${baseUrl}/api/v1/venues/${firstVenue.id}`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.data.venue.name, firstVenue.name);
  assert.equal(data.data.venue.score, firstVenue.score);
});
