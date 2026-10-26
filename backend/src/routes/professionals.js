const express = require("express");
const { AVAILABILITY, ProfessionalProfile } = require("../models/ProfessionalProfile");
const { requireAuthentication, requireCsrf, requireRole } = require("../middleware/authenticate");

const router = express.Router();

function validateProfile(body) {
  const errors = [];
  const { professionalType, bio, city, languages, yearsExperience, availability } = body ?? {};

  if (typeof professionalType !== "string" || professionalType.trim().length < 2 || professionalType.trim().length > 80) {
    errors.push("professionalType must be between 2 and 80 characters");
  }
  if (typeof bio !== "string" || bio.trim().length < 20 || bio.trim().length > 1000) {
    errors.push("bio must be between 20 and 1000 characters");
  }
  if (typeof city !== "string" || city.trim().length < 2 || city.trim().length > 100) {
    errors.push("city must be between 2 and 100 characters");
  }
  if (!Array.isArray(languages) || languages.length < 1 || languages.length > 10 || languages.some((language) => typeof language !== "string" || language.trim().length < 2 || language.trim().length > 30)) {
    errors.push("languages must contain between 1 and 10 valid entries");
  }
  if (!Number.isInteger(yearsExperience) || yearsExperience < 0 || yearsExperience > 60) {
    errors.push("yearsExperience must be a whole number between 0 and 60");
  }
  if (!AVAILABILITY.includes(availability)) {
    errors.push(`availability must be one of: ${AVAILABILITY.join(", ")}`);
  }
  return errors;
}

function normalizedProfile(body) {
  return {
    professionalType: body.professionalType.trim(),
    bio: body.bio.trim(),
    city: body.city.trim(),
    languages: [...new Set(body.languages.map((language) => language.trim()))],
    yearsExperience: body.yearsExperience,
    availability: body.availability,
  };
}

function toProfileObject(profile) {
  const owner = profile.userId;
  return {
    id: profile._id.toString(),
    name: owner?.name,
    professionalType: profile.professionalType,
    bio: profile.bio,
    city: profile.city,
    languages: profile.languages,
    yearsExperience: profile.yearsExperience,
    availability: profile.availability,
    updatedAt: profile.updatedAt,
  };
}

router.get("/me", requireAuthentication, requireRole("therapist"), async (req, res, next) => {
  try {
    const profile = await ProfessionalProfile.findOne({ userId: req.auth.user._id }).populate("userId", "name");
    if (!profile) {
      return res.status(404).json({ error: { code: "PROFILE_NOT_FOUND", message: "Professional profile not found." } });
    }
    return res.status(200).json({ status: "success", data: { profile: toProfileObject(profile) } });
  } catch (error) {
    return next(error);
  }
});

router.post("/me", requireAuthentication, requireRole("therapist"), requireCsrf, async (req, res, next) => {
  const errors = validateProfile(req.body);
  if (errors.length) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Profile details are invalid.", details: errors } });
  }

  try {
    const profile = await ProfessionalProfile.create({ userId: req.auth.user._id, ...normalizedProfile(req.body) });
    await profile.populate("userId", "name");
    return res.status(201).json({ status: "success", data: { profile: toProfileObject(profile) } });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: { code: "PROFILE_ALREADY_EXISTS", message: "A professional profile already exists for this account." } });
    }
    return next(error);
  }
});

router.put("/me", requireAuthentication, requireRole("therapist"), requireCsrf, async (req, res, next) => {
  const errors = validateProfile(req.body);
  if (errors.length) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Profile details are invalid.", details: errors } });
  }

  try {
    const profile = await ProfessionalProfile.findOneAndUpdate(
      { userId: req.auth.user._id },
      normalizedProfile(req.body),
      { returnDocument: "after", runValidators: true },
    ).populate("userId", "name");
    if (!profile) {
      return res.status(404).json({ error: { code: "PROFILE_NOT_FOUND", message: "Professional profile not found." } });
    }
    return res.status(200).json({ status: "success", data: { profile: toProfileObject(profile) } });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", requireAuthentication, requireRole("parent"), async (req, res, next) => {
  try {
    const profile = await ProfessionalProfile.findById(req.params.id).populate("userId", "name");
    if (!profile) {
      return res.status(404).json({ error: { code: "PROFILE_NOT_FOUND", message: "Professional profile not found." } });
    }
    return res.status(200).json({ status: "success", data: { profile: toProfileObject(profile) } });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ error: { code: "PROFILE_NOT_FOUND", message: "Professional profile not found." } });
    }
    return next(error);
  }
});

router.get("/", requireAuthentication, requireRole("parent"), async (_req, res, next) => {
  try {
    const profiles = await ProfessionalProfile.find().sort({ updatedAt: -1 }).populate("userId", "name");
    return res.status(200).json({ status: "success", data: { profiles: profiles.map(toProfileObject) } });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
