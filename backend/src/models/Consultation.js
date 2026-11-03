const mongoose = require("mongoose");

const BOOKING_STATUS = ["pending", "confirmed", "cancelled", "completed"];

const ALLOWED_TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
];

const VALID_STATUS_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  cancelled: [],
  completed: [],
};

function normalizeTimeSlot(slot) {
  if (typeof slot !== "string") return null;
  const trimmed = slot.trim().toUpperCase();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return null;
  const hour = match[1].padStart(2, "0");
  const min = match[2];
  const ampm = match[3];
  return `${hour}:${min} ${ampm}`;
}

const consultationSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    professionalProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProfessionalProfile",
      default: null,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: BOOKING_STATUS,
      default: "confirmed",
      index: true,
    },
    childName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent overlapping / duplicate active bookings for the same professional, date, and slot
consultationSchema.index(
  { professional: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "confirmed"] } },
  }
);

consultationSchema.index({ parent: 1, date: 1 });

const Consultation = mongoose.model("Consultation", consultationSchema);

module.exports = {
  Consultation,
  BOOKING_STATUS,
  ALLOWED_TIME_SLOTS,
  VALID_STATUS_TRANSITIONS,
  normalizeTimeSlot,
};
