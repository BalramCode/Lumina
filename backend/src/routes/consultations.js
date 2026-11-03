const express = require("express");
const mongoose = require("mongoose");
const {
  Consultation,
  BOOKING_STATUS,
  ALLOWED_TIME_SLOTS,
  VALID_STATUS_TRANSITIONS,
  normalizeTimeSlot,
} = require("../models/Consultation");
const { User } = require("../models/User");
const { ProfessionalProfile } = require("../models/ProfessionalProfile");
const {
  requireAuthentication,
  requireCsrf,
  requireRole,
} = require("../middleware/authenticate");

const router = express.Router();

function isValidDateString(str) {
  if (typeof str !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return false;
  }
  const dateObj = new Date(`${str}T00:00:00Z`);
  if (Number.isNaN(dateObj.getTime())) {
    return false;
  }
  return dateObj.toISOString().slice(0, 10) === str;
}

function resolveDateString(str) {
  if (isValidDateString(str)) return str;
  if (typeof str !== "string") return null;

  // Handle formats like "Mon 16", "Tue 17", etc.
  const match = str.trim().match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{1,2})$/i);
  if (match) {
    const dayNum = parseInt(match[2], 10);
    const now = new Date();
    let target = new Date(now.getFullYear(), now.getMonth(), dayNum);
    if (target < now) {
      target = new Date(now.getFullYear(), now.getMonth() + 1, dayNum);
    }
    return target.toISOString().slice(0, 10);
  }
  return null;
}

function isDateInPast(str) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  return str < todayStr;
}

async function resolveProfessional(id) {
  if (!id) return null;

  let proUser = null;
  let proProfile = null;

  // Support legacy mock IDs from mockData.js (e.g. cp1 -> Dr. Meera Das)
  const legacyMap = {
    cp1: "Dr. Meera Das",
    cp2: "Kavya Reddy",
    cp3: "Ravi Patnaik",
    cp4: "Dr. Arun Mishra",
  };

  if (legacyMap[id]) {
    proUser = await User.findOne({ name: legacyMap[id] });
    if (proUser) {
      proProfile = await ProfessionalProfile.findOne({ userId: proUser._id });
      return { proUser, proProfile };
    }
  }

  if (mongoose.isValidObjectId(id)) {
    proUser = await User.findById(id);

    if (proUser) {
      proProfile = await ProfessionalProfile.findOne({ userId: proUser._id });
    } else {
      proProfile = await ProfessionalProfile.findById(id).populate("userId");
      if (proProfile && proProfile.userId) {
        proUser = proProfile.userId;
      }
    }
  }

  if (!proUser) {
    return null;
  }

  return { proUser, proProfile };
}

function toConsultationObject(doc, viewer = null) {
  const isProfessional =
    viewer &&
    (viewer._id.toString() === doc.professional?._id?.toString() ||
      viewer._id.toString() === doc.professional?.toString());
  const isAdmin = viewer && viewer.role === "admin";

  const proUser = doc.professional?.name ? doc.professional : null;
  const proProfile = doc.professionalProfile || null;
  const parentUser = doc.parent?.name ? doc.parent : null;

  return {
    id: doc._id.toString(),
    parent: parentUser
      ? {
          id: parentUser._id.toString(),
          name: parentUser.name,
          role: parentUser.role,
          ...(isProfessional || isAdmin ? { email: parentUser.email } : {}),
        }
      : { id: doc.parent?.toString() },
    professional: {
      id: (proUser?._id || doc.professional?._id || doc.professional)?.toString(),
      name: proUser?.name || "Specialist",
      role: proUser?.role || "therapist",
      isVerified: Boolean(proUser?.isVerified),
      professionalType: proProfile?.professionalType || "Specialist",
      city: proProfile?.city || "",
      rating: proProfile?.rating || 4.9,
    },
    date: doc.date,
    timeSlot: doc.timeSlot,
    status: doc.status,
    childName: doc.childName || "",
    notes: doc.notes || "",
    cancelledBy: doc.cancelledBy ? doc.cancelledBy.toString() : null,
    cancellationReason: doc.cancellationReason || null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// 1. Availability check
router.get("/availability", requireAuthentication, async (req, res, next) => {
  try {
    const professionalId = req.query.professionalId || req.query.professional;
    const date = req.query.date;

    if (!professionalId) {
      return res.status(400).json({
        error: {
          code: "MISSING_PROFESSIONAL_ID",
          message: "professionalId query parameter is required.",
        },
      });
    }

    if (!date) {
      return res.status(400).json({
        error: {
          code: "MISSING_DATE",
          message: "date query parameter (YYYY-MM-DD) is required.",
        },
      });
    }

    const resolvedDate = resolveDateString(date);
    if (!resolvedDate) {
      return res.status(400).json({
        error: {
          code: "INVALID_DATE_FORMAT",
          message: "date must be in valid YYYY-MM-DD format.",
        },
      });
    }

    if (isDateInPast(resolvedDate)) {
      return res.status(400).json({
        error: {
          code: "DATE_IN_PAST",
          message: "Availability cannot be checked for past dates.",
        },
      });
    }

    const resolved = await resolveProfessional(professionalId);
    if (!resolved) {
      return res.status(404).json({
        error: {
          code: "PROFESSIONAL_NOT_FOUND",
          message: "Specialist not found.",
        },
      });
    }

    const { proUser, proProfile } = resolved;

    // Check active bookings on this date
    const activeBookings = await Consultation.find({
      professional: proUser._id,
      date: resolvedDate,
      status: { $in: ["pending", "confirmed"] },
    }).select("timeSlot");

    const bookedSlots = activeBookings.map((b) => b.timeSlot);
    const availableSlots =
      proProfile && proProfile.availability === "not_accepting"
        ? []
        : ALLOWED_TIME_SLOTS.filter((slot) => !bookedSlots.includes(slot));

    return res.status(200).json({
      status: "success",
      data: {
        professional: {
          id: proUser._id.toString(),
          name: proUser.name,
          professionalType: proProfile?.professionalType || "Specialist",
          city: proProfile?.city || "",
          availability: proProfile?.availability || "accepting_clients",
        },
        date: resolvedDate,
        allSlots: ALLOWED_TIME_SLOTS,
        bookedSlots,
        availableSlots,
      },
    });
  } catch (error) {
    return next(error);
  }
});

// 2. Create Consultation Booking
router.post(
  "/",
  requireAuthentication,
  requireCsrf,
  requireRole("parent", "admin"),
  async (req, res, next) => {
    try {
      const { professionalId, date, timeSlot, childName, notes } = req.body || {};

      if (!professionalId || !date || !timeSlot) {
        return res.status(400).json({
          error: {
            code: "MISSING_REQUIRED_FIELDS",
            message: "professionalId, date, and timeSlot are required.",
          },
        });
      }

      const resolvedDate = resolveDateString(date);
      if (!resolvedDate) {
        return res.status(400).json({
          error: {
            code: "INVALID_BOOKING_DATE",
            message: "date must be in valid YYYY-MM-DD format.",
          },
        });
      }

      if (isDateInPast(resolvedDate)) {
        return res.status(400).json({
          error: {
            code: "DATE_IN_PAST",
            message: "Cannot book consultations in the past.",
          },
        });
      }

      const normalizedSlot = normalizeTimeSlot(timeSlot);
      if (!normalizedSlot || !ALLOWED_TIME_SLOTS.includes(normalizedSlot)) {
        return res.status(400).json({
          error: {
            code: "INVALID_TIME_SLOT",
            message: `timeSlot must be one of the recognized slots: ${ALLOWED_TIME_SLOTS.join(", ")}`,
          },
        });
      }

      const resolved = await resolveProfessional(professionalId);
      if (!resolved) {
        return res.status(404).json({
          error: {
            code: "PROFESSIONAL_NOT_FOUND",
            message: "The requested professional was not found.",
          },
        });
      }

      const { proUser, proProfile } = resolved;

      if (!proUser.isVerified) {
        return res.status(400).json({
          error: {
            code: "PROFESSIONAL_NOT_VERIFIED",
            message: "Consultations can only be scheduled with verified professionals.",
          },
        });
      }

      if (proProfile && proProfile.availability === "not_accepting") {
        return res.status(400).json({
          error: {
            code: "PROFESSIONAL_UNAVAILABLE",
            message: "This professional is currently not accepting client consultations.",
          },
        });
      }

      // Check if slot already booked by any parent
      const existingSlotBooking = await Consultation.findOne({
        professional: proUser._id,
        date: resolvedDate,
        timeSlot: normalizedSlot,
        status: { $in: ["pending", "confirmed"] },
      });

      if (existingSlotBooking) {
        return res.status(409).json({
          error: {
            code: "SLOT_ALREADY_BOOKED",
            message: "This time slot has already been booked. Please choose another time.",
          },
        });
      }

      // Check if this parent already has a booking at this exact time with this specialist
      const existingParentBooking = await Consultation.findOne({
        parent: req.auth.user._id,
        professional: proUser._id,
        date: resolvedDate,
        timeSlot: normalizedSlot,
        status: { $in: ["pending", "confirmed"] },
      });

      if (existingParentBooking) {
        return res.status(409).json({
          error: {
            code: "DUPLICATE_BOOKING",
            message: "You already have an active consultation booked for this date and time.",
          },
        });
      }

      try {
        const consultation = await Consultation.create({
          parent: req.auth.user._id,
          professional: proUser._id,
          professionalProfile: proProfile?._id || null,
          date: resolvedDate,
          timeSlot: normalizedSlot,
          status: "confirmed",
          childName: typeof childName === "string" ? childName.trim().slice(0, 120) : "",
          notes: typeof notes === "string" ? notes.trim().slice(0, 1000) : "",
        });

        const populated = await Consultation.findById(consultation._id)
          .populate("parent", "name email role")
          .populate("professional", "name role isVerified")
          .populate("professionalProfile", "professionalType city rating");

        return res.status(201).json({
          status: "success",
          data: {
            consultation: toConsultationObject(populated, req.auth.user),
          },
        });
      } catch (err) {
        if (err.code === 11000) {
          return res.status(409).json({
            error: {
              code: "SLOT_ALREADY_BOOKED",
              message: "This time slot has just been booked. Please choose another time.",
            },
          });
        }
        throw err;
      }
    } catch (error) {
      return next(error);
    }
  }
);

// 3. List Consultations
router.get("/", requireAuthentication, async (req, res, next) => {
  try {
    const user = req.auth.user;
    const filter = {};

    if (user.role === "parent") {
      filter.parent = user._id;
    } else if (["therapist", "educator", "mentor"].includes(user.role)) {
      filter.professional = user._id;
    } else if (user.role === "admin") {
      if (req.query.parentId && mongoose.isValidObjectId(req.query.parentId)) {
        filter.parent = req.query.parentId;
      }
      if (req.query.professionalId && mongoose.isValidObjectId(req.query.professionalId)) {
        filter.professional = req.query.professionalId;
      }
    }

    if (req.query.status && BOOKING_STATUS.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    if (req.query.date && isValidDateString(req.query.date)) {
      filter.date = req.query.date;
    }

    const docs = await Consultation.find(filter)
      .sort({ date: 1, timeSlot: 1, createdAt: -1 })
      .populate("parent", "name email role")
      .populate("professional", "name role isVerified")
      .populate("professionalProfile", "professionalType city rating");

    const consultations = docs.map((doc) => toConsultationObject(doc, user));

    return res.status(200).json({
      status: "success",
      data: {
        consultations,
      },
    });
  } catch (error) {
    return next(error);
  }
});

// 4. Get Single Consultation
router.get("/:id", requireAuthentication, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        error: {
          code: "BOOKING_NOT_FOUND",
          message: "Consultation not found.",
        },
      });
    }

    const doc = await Consultation.findById(id)
      .populate("parent", "name email role")
      .populate("professional", "name role isVerified")
      .populate("professionalProfile", "professionalType city rating");

    if (!doc) {
      return res.status(404).json({
        error: {
          code: "BOOKING_NOT_FOUND",
          message: "Consultation not found.",
        },
      });
    }

    const userId = req.auth.user._id.toString();
    const isParent = doc.parent?._id?.toString() === userId;
    const isProfessional = doc.professional?._id?.toString() === userId;
    const isAdmin = req.auth.user.role === "admin";

    if (!isParent && !isProfessional && !isAdmin) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to view this consultation.",
        },
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        consultation: toConsultationObject(doc, req.auth.user),
      },
    });
  } catch (error) {
    return next(error);
  }
});

// 5. Cancel Consultation (Parents, Professionals, or Admin)
const handleCancel = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        error: {
          code: "BOOKING_NOT_FOUND",
          message: "Consultation not found.",
        },
      });
    }

    const booking = await Consultation.findById(id);
    if (!booking) {
      return res.status(404).json({
        error: {
          code: "BOOKING_NOT_FOUND",
          message: "Consultation not found.",
        },
      });
    }

    const userId = req.auth.user._id.toString();
    const isParent = booking.parent.toString() === userId;
    const isProfessional = booking.professional.toString() === userId;
    const isAdmin = req.auth.user.role === "admin";

    if (!isParent && !isProfessional && !isAdmin) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to cancel this consultation.",
        },
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        error: {
          code: "ALREADY_CANCELLED",
          message: "This consultation has already been cancelled.",
        },
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        error: {
          code: "CANNOT_CANCEL_COMPLETED",
          message: "Completed consultations cannot be cancelled.",
        },
      });
    }

    booking.status = "cancelled";
    booking.cancelledBy = req.auth.user._id;
    booking.cancellationReason =
      typeof req.body?.reason === "string"
        ? req.body.reason.trim().slice(0, 500)
        : isParent
        ? "Cancelled by parent"
        : "Cancelled by specialist";

    await booking.save();

    const populated = await Consultation.findById(booking._id)
      .populate("parent", "name email role")
      .populate("professional", "name role isVerified")
      .populate("professionalProfile", "professionalType city rating");

    return res.status(200).json({
      status: "success",
      data: {
        consultation: toConsultationObject(populated, req.auth.user),
      },
    });
  } catch (error) {
    return next(error);
  }
};

router.put("/:id/cancel", requireAuthentication, requireCsrf, handleCancel);
router.patch("/:id/cancel", requireAuthentication, requireCsrf, handleCancel);

// 6. Manage Consultation Status (Specialists or Admin)
const handleStatusUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        error: {
          code: "BOOKING_NOT_FOUND",
          message: "Consultation not found.",
        },
      });
    }

    if (!status || !BOOKING_STATUS.includes(status)) {
      return res.status(400).json({
        error: {
          code: "INVALID_STATUS",
          message: `Status must be one of: ${BOOKING_STATUS.join(", ")}`,
        },
      });
    }

    const booking = await Consultation.findById(id);
    if (!booking) {
      return res.status(404).json({
        error: {
          code: "BOOKING_NOT_FOUND",
          message: "Consultation not found.",
        },
      });
    }

    const userId = req.auth.user._id.toString();
    const isProfessional = booking.professional.toString() === userId;
    const isAdmin = req.auth.user.role === "admin";

    if (!isProfessional && !isAdmin) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Only the assigned specialist or an administrator can update consultation status.",
        },
      });
    }

    const allowedTransitions = VALID_STATUS_TRANSITIONS[booking.status] || [];
    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        error: {
          code: "INVALID_STATUS_TRANSITION",
          message: `Cannot transition consultation status from '${booking.status}' to '${status}'.`,
        },
      });
    }

    booking.status = status;
    if (status === "cancelled") {
      booking.cancelledBy = req.auth.user._id;
      booking.cancellationReason =
        typeof reason === "string" ? reason.trim().slice(0, 500) : "Cancelled by specialist";
    }

    await booking.save();

    const populated = await Consultation.findById(booking._id)
      .populate("parent", "name email role")
      .populate("professional", "name role isVerified")
      .populate("professionalProfile", "professionalType city rating");

    return res.status(200).json({
      status: "success",
      data: {
        consultation: toConsultationObject(populated, req.auth.user),
      },
    });
  } catch (error) {
    return next(error);
  }
};

router.put("/:id/status", requireAuthentication, requireCsrf, handleStatusUpdate);
router.patch("/:id/status", requireAuthentication, requireCsrf, handleStatusUpdate);

module.exports = router;
