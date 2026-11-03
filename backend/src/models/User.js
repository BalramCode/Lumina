const mongoose = require("mongoose");

const USER_ROLES = ["parent", "therapist", "educator", "mentor"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: USER_ROLES,
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    guardianConsent: {
      type: Boolean,
      required: true,
    },
    location: {
      city: { type: String, trim: true, maxlength: 100, default: "" },
      district: { type: String, trim: true, maxlength: 100, default: "" },
      state: { type: String, trim: true, maxlength: 100, default: "" },
    },
    preferences: {
      theme: { type: String, enum: ["light", "dark"], default: "light" },
      lang: { type: String, enum: ["en", "hi", "or"], default: "en" },
      reduceMotion: { type: Boolean, default: false },
      largeText: { type: Boolean, default: false },
      quietNotifs: { type: Boolean, default: false },
      emailUpdates: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    status: this.status,
    isVerified: Boolean(this.isVerified),
    location: {
      city: this.location?.city || "",
      district: this.location?.district || "",
      state: this.location?.state || "",
    },
    preferences: {
      theme: this.preferences?.theme || "light",
      lang: this.preferences?.lang || "en",
      reduceMotion: Boolean(this.preferences?.reduceMotion),
      largeText: Boolean(this.preferences?.largeText),
      quietNotifs: Boolean(this.preferences?.quietNotifs),
      emailUpdates: Boolean(this.preferences?.emailUpdates),
    },
    createdAt: this.createdAt,
  };
};

const User = mongoose.model("User", userSchema);

module.exports = { User, USER_ROLES };
