const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const { User } = require("../src/models/User");

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
