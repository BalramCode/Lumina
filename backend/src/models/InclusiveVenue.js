const mongoose = require("mongoose");

const INCLUSIVE_CATEGORIES = [
  "All",
  "Libraries",
  "Restaurants",
  "Salons",
  "Parks",
  "Shopping Spaces",
  "Community Centers",
  "Clinics",
  "Other",
];

const venueLocationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator(coords) {
          if (!Array.isArray(coords) || coords.length !== 2) return false;
          const [lng, lat] = coords;
          return (
            typeof lng === "number" &&
            typeof lat === "number" &&
            lng >= -180 &&
            lng <= 180 &&
            lat >= -90 &&
            lat <= 90
          );
        },
        message: "Venue coordinates must be [longitude, latitude] within valid ranges.",
      },
    },
  },
  { _id: false }
);

const inclusiveVenueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: true,
      enum: INCLUSIVE_CATEGORIES.filter((c) => c !== "All"),
    },
    location: {
      type: String, // City / Region name, e.g. "Bhubaneswar"
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 85,
    },
    rating: {
      type: Number,
      min: 1.0,
      max: 5.0,
      default: 4.5,
    },
    sensory: {
      type: [String],
      default: [],
    },
    access: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: "",
    },
    geo: {
      type: venueLocationSchema,
      required: false,
    },
    verified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

inclusiveVenueSchema.index({ geo: "2dsphere" });
inclusiveVenueSchema.index({ location: 1, category: 1 });
inclusiveVenueSchema.index({ category: 1 });

const InclusiveVenue = mongoose.model("InclusiveVenue", inclusiveVenueSchema);

module.exports = {
  InclusiveVenue,
  INCLUSIVE_CATEGORIES,
};
