const crypto = require("crypto");
const env = require("./env");
const { Session } = require("../models/Session");

const SESSION_COOKIE_NAME = "lumina_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token) {
  return crypto.createHmac("sha256", env.sessionSecret).update(token).digest("hex");
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS,
  };
}

async function createSession(userId) {
  const sessionToken = crypto.randomBytes(32).toString("base64url");
  const csrfToken = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await Session.create({
    userId,
    tokenHash: hashToken(sessionToken),
    csrfTokenHash: hashToken(csrfToken),
    expiresAt,
  });

  return { sessionToken, csrfToken };
}

async function rotateCsrfToken(session) {
  const csrfToken = crypto.randomBytes(32).toString("base64url");
  session.csrfTokenHash = hashToken(csrfToken);
  await session.save();
  return csrfToken;
}

function setSessionCookies(res, session) {
  res.cookie(SESSION_COOKIE_NAME, session.sessionToken, sessionCookieOptions());
}

function clearSessionCookies(res) {
  const { maxAge: _maxAge, ...options } = sessionCookieOptions();
  res.clearCookie(SESSION_COOKIE_NAME, options);
}

function parseCookies(req, _res, next) {
  const rawCookies = req.headers.cookie;
  req.cookies = {};

  if (rawCookies) {
    for (const item of rawCookies.split(";")) {
      const separator = item.indexOf("=");
      if (separator > 0) {
        const name = item.slice(0, separator).trim();
        try {
          req.cookies[name] = decodeURIComponent(item.slice(separator + 1).trim());
        } catch {
          // Ignore malformed cookie values and treat the request as unauthenticated.
        }
      }
    }
  }

  next();
}

module.exports = {
  SESSION_COOKIE_NAME,
  clearSessionCookies,
  createSession,
  hashToken,
  parseCookies,
  setSessionCookies,
  rotateCsrfToken,
};
