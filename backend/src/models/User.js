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
    guardianConsent: {
      type: Boolean,
      required: true,
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
    createdAt: this.createdAt,
  };
};

const User = mongoose.model("User", userSchema);

module.exports = { User, USER_ROLES };
