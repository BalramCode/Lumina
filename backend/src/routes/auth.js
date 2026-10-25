const express = require("express");
const bcrypt = require("bcryptjs");
const { User, USER_ROLES } = require("../models/User");

const router = express.Router();
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_BYTES = 72;
const BCRYPT_SALT_ROUNDS = 12;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegistration(body) {
  const errors = [];
  const { name, email, password, role, guardianConsent } = body ?? {};

  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
    errors.push("name must be between 2 and 100 characters");
  }

  if (typeof email !== "string" || !emailPattern.test(email.trim()) || email.trim().length > 254) {
    errors.push("email must be a valid email address");
  }

  if (
    typeof password !== "string" ||
    password.length < PASSWORD_MIN_LENGTH ||
    Buffer.byteLength(password, "utf8") > PASSWORD_MAX_BYTES
  ) {
    errors.push(
      `password must be at least ${PASSWORD_MIN_LENGTH} characters and no more than ${PASSWORD_MAX_BYTES} bytes`,
    );
  }

  if (typeof role !== "string" || !USER_ROLES.includes(role)) {
    errors.push(`role must be one of: ${USER_ROLES.join(", ")}`);
  }

  if (guardianConsent !== true) {
    errors.push("guardianConsent must be true");
  }

  return errors;
}

router.post("/register", async (req, res, next) => {
  const errors = validateRegistration(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Registration details are invalid.",
        details: errors,
      },
    });
  }

  const name = req.body.name.trim();
  const email = req.body.email.trim().toLowerCase();

  try {
    const passwordHash = await bcrypt.hash(req.body.password, BCRYPT_SALT_ROUNDS);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: req.body.role,
      guardianConsent: true,
    });

    return res.status(201).json({
      status: "success",
      data: {
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        error: {
          code: "EMAIL_ALREADY_REGISTERED",
          message: "An account with this email already exists.",
        },
      });
    }

    return next(error);
  }
});

module.exports = router;
