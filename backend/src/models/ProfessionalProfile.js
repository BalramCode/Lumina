const mongoose = require("mongoose");

const AVAILABILITY = ["accepting_clients", "waitlist", "not_accepting"];

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
  },
  { timestamps: true },
);

professionalProfileSchema.index({ city: 1, professionalType: 1 });

const ProfessionalProfile = mongoose.model("ProfessionalProfile", professionalProfileSchema);

module.exports = { AVAILABILITY, ProfessionalProfile };
