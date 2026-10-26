const crypto = require("crypto");
const { User } = require("../models/User");
const { Session } = require("../models/Session");
const { SESSION_COOKIE_NAME, hashToken } = require("../config/session");

function unauthenticated(res) {
  return res.status(401).json({
    error: {
      code: "AUTHENTICATION_REQUIRED",
      message: "Authentication is required.",
    },
  });
}

async function requireAuthentication(req, res, next) {
  const sessionToken = req.cookies?.[SESSION_COOKIE_NAME];
  if (!sessionToken) {
    return unauthenticated(res);
  }

  try {
    const session = await Session.findOne({
      tokenHash: hashToken(sessionToken),
      expiresAt: { $gt: new Date() },
    }).select("+csrfTokenHash");

    if (!session) {
      return unauthenticated(res);
    }

    const user = await User.findById(session.userId);
    if (!user || user.status !== "active") {
      await Session.deleteOne({ _id: session._id });
      return unauthenticated(res);
    }

    req.auth = { session, user };
    return next();
  } catch (error) {
    return next(error);
  }
}

function requireCsrf(req, res, next) {
  const csrfToken = req.get("X-CSRF-Token");
  const expectedHash = req.auth.session.csrfTokenHash;

  if (!csrfToken) {
    return res.status(403).json({
      error: { code: "CSRF_VALIDATION_FAILED", message: "Request could not be verified." },
    });
  }

  const actualHash = hashToken(csrfToken);
  if (!crypto.timingSafeEqual(Buffer.from(actualHash), Buffer.from(expectedHash))) {
    return res.status(403).json({
      error: { code: "CSRF_VALIDATION_FAILED", message: "Request could not be verified." },
    });
  }

  return next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.user.role)) {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "You do not have access to this resource." },
      });
    }
    return next();
  };
}

module.exports = { requireAuthentication, requireCsrf, requireRole };
