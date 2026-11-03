const mongoose = require("mongoose");

const AVAILABILITY = ["accepting_clients", "waitlist", "not_accepting"];

const CITY_COORDINATES = {
  bhubaneswar: [85.8245, 20.2961],
  cuttack: [85.8828, 20.4625],
  puri: [85.8312, 19.8135],
  rourkela: [84.8536, 22.2604],
  sambalpur: [83.9812, 21.4669],
  berhampur: [84.7941, 19.3150],
  balasore: [86.9324, 21.4934],
  delhi: [77.1025, 28.7041],
  mumbai: [72.8777, 19.0760],
  bangalore: [77.5946, 12.9716],
  bengaluru: [77.5946, 12.9716],
  kolkata: [88.3639, 22.5726],
  hyderabad: [78.4867, 17.3850],
  chennai: [80.2707, 13.0827],
};

const locationSchema = new mongoose.Schema(
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
          return (
            Array.isArray(coords) &&
            coords.length === 2 &&
            typeof coords[0] === "number" &&
            typeof coords[1] === "number" &&
            !isNaN(coords[0]) &&
            !isNaN(coords[1]) &&
            coords[0] >= -180 &&
            coords[0] <= 180 &&
            coords[1] >= -90 &&
            coords[1] <= 90
          );
        },
        message: "coordinates must be [longitude, latitude] with valid geographic coordinates",
      },
    },
    address: { type: String, trim: true, default: "" },
    district: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const professionalProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    professionalType: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    specialization: { type: String, trim: true, default: "", maxlength: 120 },
    bio: { type: String, required: true, trim: true, minlength: 20, maxlength: 1000 },
    city: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    languages: {
      type: [String],
      required: true,
      validate: {
        validator: (languages) => Array.isArray(languages) && languages.length >= 1 && languages.length <= 10,
        message: "languages must contain between 1 and 10 entries",
      },
    },
    yearsExperience: { type: Number, required: true, min: 0, max: 60 },
    availability: { type: String, required: true, enum: AVAILABILITY },
    rating: { type: Number, default: 4.9, min: 1.0, max: 5.0 },
    reviewCount: { type: Number, default: 0, min: 0 },
    location: {
      type: locationSchema,
      required: false,
    },
  },
  { timestamps: true },
);

professionalProfileSchema.pre("save", function () {
  if (this.location && (!this.location.coordinates || this.location.coordinates.length !== 2)) {
    this.location = undefined;
  }
});

professionalProfileSchema.index({ location: "2dsphere" });
professionalProfileSchema.index({ city: 1, professionalType: 1 });
professionalProfileSchema.index({ professionalType: 1 });
professionalProfileSchema.index({ languages: 1 });

const ProfessionalProfile = mongoose.model("ProfessionalProfile", professionalProfileSchema);

module.exports = { AVAILABILITY, CITY_COORDINATES, ProfessionalProfile };
