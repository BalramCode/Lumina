const express = require("express");
const { AVAILABILITY, CITY_COORDINATES, ProfessionalProfile } = require("../models/ProfessionalProfile");
const { requireAuthentication, requireCsrf, requireRole } = require("../middleware/authenticate");

const router = express.Router();

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

function validateProfile(body) {
  const errors = [];
  const { professionalType, bio, city, languages, yearsExperience, availability, specialization, latitude, longitude } = body ?? {};

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
  if (specialization !== undefined && (typeof specialization !== "string" || specialization.trim().length > 120)) {
    errors.push("specialization must not exceed 120 characters");
  }
  if (latitude !== undefined && (typeof latitude !== "number" || isNaN(latitude) || latitude < -90 || latitude > 90)) {
    errors.push("latitude must be a number between -90 and 90");
  }
  if (longitude !== undefined && (typeof longitude !== "number" || isNaN(longitude) || longitude < -180 || longitude > 180)) {
    errors.push("longitude must be a number between -180 and 180");
  }
  return errors;
}

function normalizedProfile(body) {
  const city = body.city.trim();
  let location = undefined;

  if (body.location?.coordinates && Array.isArray(body.location.coordinates) && body.location.coordinates.length === 2) {
    const lng = Number(body.location.coordinates[0]);
    const lat = Number(body.location.coordinates[1]);
    if (!isNaN(lng) && !isNaN(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
      location = {
        type: "Point",
        coordinates: [lng, lat],
        address: body.location.address?.trim() || city,
        district: body.location.district?.trim() || city,
      };
    }
  } else if (body.latitude !== undefined && body.longitude !== undefined) {
    const lat = Number(body.latitude);
    const lng = Number(body.longitude);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      location = {
        type: "Point",
        coordinates: [lng, lat],
        address: body.address?.trim() || city,
        district: body.district?.trim() || city,
      };
    }
  } else if (city && CITY_COORDINATES[city.toLowerCase()]) {
    const coords = CITY_COORDINATES[city.toLowerCase()];
    location = {
      type: "Point",
      coordinates: coords,
      address: body.address?.trim() || city,
      district: body.district?.trim() || city,
    };
  }

  const result = {
    professionalType: body.professionalType.trim(),
    bio: body.bio.trim(),
    city,
    languages: [...new Set(body.languages.map((language) => language.trim()))],
    yearsExperience: body.yearsExperience,
    availability: body.availability,
  };

  if (body.specialization !== undefined) {
    result.specialization = typeof body.specialization === "string" ? body.specialization.trim() : "";
  }
  if (location) {
    result.location = location;
  }

  return result;
}

function toProfileObject(profile, distance = null) {
  const owner = profile.userId;
  return {
    id: profile._id.toString(),
    name: owner?.name || "Professional",
    professionalType: profile.professionalType,
    specialization: profile.specialization || "",
    bio: profile.bio,
    city: profile.city,
    languages: profile.languages,
    yearsExperience: profile.yearsExperience,
    availability: profile.availability,
    rating: profile.rating || 4.9,
    reviewCount: profile.reviewCount || 0,
    isVerified: Boolean(owner?.isVerified),
    location: profile.location?.address || profile.city,
    coordinates: profile.location?.coordinates || null,
    distance: typeof distance === "number" ? distance : null,
    updatedAt: profile.updatedAt,
  };
}

router.get("/me", requireAuthentication, requireRole("therapist"), async (req, res, next) => {
  try {
    const profile = await ProfessionalProfile.findOne({ userId: req.auth.user._id }).populate("userId", "name role isVerified");
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
    await profile.populate("userId", "name role isVerified");
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
    ).populate("userId", "name role isVerified");
    if (!profile) {
      return res.status(404).json({ error: { code: "PROFILE_NOT_FOUND", message: "Professional profile not found." } });
    }
    return res.status(200).json({ status: "success", data: { profile: toProfileObject(profile) } });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", requireAuthentication, requireRole("parent", "admin"), async (req, res, next) => {
  try {
    const profile = await ProfessionalProfile.findById(req.params.id).populate("userId", "name role isVerified");
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

router.get("/", requireAuthentication, requireRole("parent", "admin"), async (req, res, next) => {
  try {
    const {
      type,
      professionalType,
      specialization,
      spec,
      city,
      location,
      lang,
      language,
      availability,
      lat,
      latitude,
      lng,
      longitude,
      maxDist,
      radius,
    } = req.query;

    const rawLat = lat !== undefined ? lat : latitude;
    const rawLng = lng !== undefined ? lng : longitude;

    let isGeoQuery = false;
    let parsedLat = null;
    let parsedLng = null;
    let radiusKm = 15; // default 15 km

    if (rawLat !== undefined || rawLng !== undefined) {
      if (rawLat === undefined || rawLng === undefined || String(rawLat).trim() === "" || String(rawLng).trim() === "") {
        return res.status(400).json({
          error: {
            code: "INVALID_COORDINATES",
            message: "Both latitude and longitude are required for nearby professional searches.",
          },
        });
      }

      parsedLat = Number(rawLat);
      parsedLng = Number(rawLng);

      if (
        isNaN(parsedLat) ||
        isNaN(parsedLng) ||
        parsedLat < -90 ||
        parsedLat > 90 ||
        parsedLng < -180 ||
        parsedLng > 180
      ) {
        return res.status(400).json({
          error: {
            code: "INVALID_COORDINATES",
            message: "Latitude must be between -90 and 90, and longitude between -180 and 180.",
          },
        });
      }

      const rawDist = maxDist !== undefined ? maxDist : radius;
      if (rawDist !== undefined) {
        const parsedDist = Number(rawDist);
        if (isNaN(parsedDist) || parsedDist <= 0 || parsedDist > 500) {
          return res.status(400).json({
            error: {
              code: "INVALID_RADIUS",
              message: "Search radius must be a positive number up to 500 km.",
            },
          });
        }
        radiusKm = parsedDist;
      }

      isGeoQuery = true;
    }

    const filter = {};

    const effectiveType = type || professionalType;
    if (effectiveType && effectiveType.trim().toLowerCase() !== "all") {
      filter.professionalType = new RegExp(`^${effectiveType.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    }

    const effectiveSpec = specialization || spec;
    if (effectiveSpec && effectiveSpec.trim().toLowerCase() !== "all") {
      const escapedSpec = effectiveSpec.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { specialization: new RegExp(escapedSpec, "i") },
        { bio: new RegExp(escapedSpec, "i") },
      ];
    }

    const effectiveLocation = location || city;
    if (effectiveLocation && effectiveLocation.trim().toLowerCase() !== "all") {
      const escapedLoc = effectiveLocation.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const locCondition = [
        { city: new RegExp(`^${escapedLoc}$`, "i") },
        { "location.district": new RegExp(`^${escapedLoc}$`, "i") },
        { "location.address": new RegExp(escapedLoc, "i") },
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: locCondition }];
        delete filter.$or;
      } else {
        filter.$or = locCondition;
      }
    }

    const effectiveLang = lang || language;
    if (effectiveLang && effectiveLang.trim().toLowerCase() !== "all") {
      filter.languages = new RegExp(`^${effectiveLang.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    }

    if (availability && availability.trim().toLowerCase() !== "all") {
      filter.availability = availability.trim();
    }

    if (isGeoQuery) {
      const maxDistanceMeters = radiusKm * 1000;
      filter.location = {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [parsedLng, parsedLat],
          },
          $maxDistance: maxDistanceMeters,
        },
      };
    }

    let query = ProfessionalProfile.find(filter);
    if (!isGeoQuery) {
      query = query.sort({ updatedAt: -1 });
    }

    const profiles = await query.populate("userId", "name role isVerified");

    const safeProfiles = profiles.map((p) => {
      let distance = null;
      if (
        isGeoQuery &&
        p.location?.coordinates &&
        Array.isArray(p.location.coordinates) &&
        p.location.coordinates.length === 2
      ) {
        distance = calculateDistanceKm(parsedLat, parsedLng, p.location.coordinates[1], p.location.coordinates[0]);
      }
      return toProfileObject(p, distance);
    });

    return res.status(200).json({
      status: "success",
      count: safeProfiles.length,
      results: safeProfiles.length,
      data: {
        profiles: safeProfiles,
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
