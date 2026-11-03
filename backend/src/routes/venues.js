const express = require("express");
const mongoose = require("mongoose");
const { InclusiveVenue, INCLUSIVE_CATEGORIES } = require("../models/InclusiveVenue");

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
  return Math.round(R * c * 10) / 10;
}

function toVenueObject(venue, distance = null) {
  return {
    id: venue._id.toString(),
    name: venue.name,
    category: venue.category,
    location: venue.location,
    address: venue.address || venue.location,
    score: venue.score,
    rating: venue.rating,
    sensory: Array.isArray(venue.sensory) ? venue.sensory : [],
    access: Array.isArray(venue.access) ? venue.access : [],
    description: venue.description || "",
    coordinates: venue.geo?.coordinates || null,
    distance: typeof distance === "number" ? distance : null,
    verified: Boolean(venue.verified),
    createdAt: venue.createdAt,
    updatedAt: venue.updatedAt,
  };
}

router.get("/", async (req, res, next) => {
  try {
    const { category, location, city, sensory, access, lat, lng, radius, maxDist } = req.query;

    const filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    const locQuery = location || city;
    if (locQuery && locQuery.trim() !== "" && locQuery !== "All") {
      filter.location = new RegExp(
        `^${locQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        "i"
      );
    }

    if (sensory && sensory.trim() !== "") {
      filter.sensory = sensory.trim();
    }

    if (access && access.trim() !== "") {
      filter.access = access.trim();
    }

    let isGeoQuery = false;
    let parsedLat = null;
    let parsedLng = null;
    let radiusKm = 25;

    if (lat !== undefined || lng !== undefined) {
      if (lat === undefined || lng === undefined || String(lat).trim() === "" || String(lng).trim() === "") {
        return res.status(400).json({
          error: {
            code: "INVALID_COORDINATES",
            message: "Both latitude and longitude are required for nearby venue searches.",
          },
        });
      }

      parsedLat = Number(lat);
      parsedLng = Number(lng);

      if (
        Number.isNaN(parsedLat) ||
        Number.isNaN(parsedLng) ||
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

      const distParam = maxDist !== undefined ? maxDist : radius;
      if (distParam !== undefined) {
        const parsedDist = Number(distParam);
        if (Number.isNaN(parsedDist) || parsedDist <= 0 || parsedDist > 500) {
          return res.status(400).json({
            error: {
              code: "INVALID_RADIUS",
              message: "Search radius must be a positive number up to 500 km.",
            },
          });
        }
        radiusKm = parsedDist;
      }

      filter.geo = {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [parsedLng, parsedLat],
          },
          $maxDistance: radiusKm * 1000,
        },
      };
      isGeoQuery = true;
    }

    let query = InclusiveVenue.find(filter);
    if (!isGeoQuery) {
      query = query.sort({ score: -1, rating: -1 });
    }

    const venues = await query;

    const safeVenues = venues.map((v) => {
      let distance = null;
      if (
        isGeoQuery &&
        v.geo?.coordinates &&
        Array.isArray(v.geo.coordinates) &&
        v.geo.coordinates.length === 2
      ) {
        distance = calculateDistanceKm(parsedLat, parsedLng, v.geo.coordinates[1], v.geo.coordinates[0]);
      }
      return toVenueObject(v, distance);
    });

    return res.status(200).json({
      status: "success",
      count: safeVenues.length,
      data: {
        venues: safeVenues,
        categories: INCLUSIVE_CATEGORIES,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        error: {
          code: "VENUE_NOT_FOUND",
          message: "Inclusive venue not found.",
        },
      });
    }

    const venue = await InclusiveVenue.findById(id);
    if (!venue) {
      return res.status(404).json({
        error: {
          code: "VENUE_NOT_FOUND",
          message: "Inclusive venue not found.",
        },
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        venue: toVenueObject(venue),
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
