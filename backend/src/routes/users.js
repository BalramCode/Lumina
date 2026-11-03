const express = require("express");
const { User } = require("../models/User");
const { requireAuthentication, requireCsrf } = require("../middleware/authenticate");

const router = express.Router();

const ALLOWED_THEMES = ["light", "dark"];
const ALLOWED_LANGUAGES = ["en", "hi", "or"];

function validateProfileUpdate(body) {
  const errors = [];
  const { name, location, preferences } = body ?? {};

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
      errors.push("name must be between 2 and 100 characters");
    }
  }

  if (location !== undefined) {
    if (typeof location === "string") {
      if (location.trim().length > 100) {
        errors.push("location must not exceed 100 characters");
      }
    } else if (typeof location === "object" && location !== null && !Array.isArray(location)) {
      const { city, district, state } = location;
      if (city !== undefined && (typeof city !== "string" || city.trim().length > 100)) {
        errors.push("location.city must be a string up to 100 characters");
      }
      if (district !== undefined && (typeof district !== "string" || district.trim().length > 100)) {
        errors.push("location.district must be a string up to 100 characters");
      }
      if (state !== undefined && (typeof state !== "string" || state.trim().length > 100)) {
        errors.push("location.state must be a string up to 100 characters");
      }
    } else {
      errors.push("location must be a valid location string or object");
    }
  }

  if (preferences !== undefined) {
    if (typeof preferences !== "object" || preferences === null || Array.isArray(preferences)) {
      errors.push("preferences must be a valid object");
    } else {
      const { theme, lang, reduceMotion, largeText, quietNotifs, emailUpdates } = preferences;

      if (theme !== undefined && !ALLOWED_THEMES.includes(theme)) {
        errors.push(`preferences.theme must be one of: ${ALLOWED_THEMES.join(", ")}`);
      }
      if (lang !== undefined && !ALLOWED_LANGUAGES.includes(lang)) {
        errors.push(`preferences.lang must be one of: ${ALLOWED_LANGUAGES.join(", ")}`);
      }
      if (reduceMotion !== undefined && typeof reduceMotion !== "boolean") {
        errors.push("preferences.reduceMotion must be a boolean");
      }
      if (largeText !== undefined && typeof largeText !== "boolean") {
        errors.push("preferences.largeText must be a boolean");
      }
      if (quietNotifs !== undefined && typeof quietNotifs !== "boolean") {
        errors.push("preferences.quietNotifs must be a boolean");
      }
      if (emailUpdates !== undefined && typeof emailUpdates !== "boolean") {
        errors.push("preferences.emailUpdates must be a boolean");
      }
    }
  }

  return errors;
}

router.get("/me", requireAuthentication, async (req, res, next) => {
  try {
    const user = await User.findById(req.auth.user._id);
    if (!user || user.status !== "active") {
      return res.status(401).json({
        error: { code: "AUTHENTICATION_REQUIRED", message: "Authentication is required." },
      });
    }

    return res.status(200).json({
      status: "success",
      data: { user: user.toSafeObject() },
    });
  } catch (error) {
    return next(error);
  }
});

router.put("/profile", requireAuthentication, requireCsrf, async (req, res, next) => {
  const errors = validateProfileUpdate(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Profile details are invalid.",
        details: errors,
      },
    });
  }

  try {
    const user = await User.findById(req.auth.user._id);
    if (!user || user.status !== "active") {
      return res.status(401).json({
        error: { code: "AUTHENTICATION_REQUIRED", message: "Authentication is required." },
      });
    }

    if (req.body.name !== undefined) {
      user.name = req.body.name.trim();
    }

    if (req.body.location !== undefined) {
      if (typeof req.body.location === "string") {
        user.location = user.location || {};
        user.location.city = req.body.location.trim();
      } else if (typeof req.body.location === "object" && req.body.location !== null) {
        user.location = user.location || {};
        if (req.body.location.city !== undefined) user.location.city = req.body.location.city.trim();
        if (req.body.location.district !== undefined) user.location.district = req.body.location.district.trim();
        if (req.body.location.state !== undefined) user.location.state = req.body.location.state.trim();
      }
    }

    if (req.body.preferences !== undefined && typeof req.body.preferences === "object") {
      user.preferences = user.preferences || {};
      const { theme, lang, reduceMotion, largeText, quietNotifs, emailUpdates } = req.body.preferences;
      if (theme !== undefined) user.preferences.theme = theme;
      if (lang !== undefined) user.preferences.lang = lang;
      if (reduceMotion !== undefined) user.preferences.reduceMotion = reduceMotion;
      if (largeText !== undefined) user.preferences.largeText = largeText;
      if (quietNotifs !== undefined) user.preferences.quietNotifs = quietNotifs;
      if (emailUpdates !== undefined) user.preferences.emailUpdates = emailUpdates;
    }

    await user.save();

    return res.status(200).json({
      status: "success",
      data: { user: user.toSafeObject() },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
