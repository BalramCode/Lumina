const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { LearningModule, DIFFICULTY_LEVELS, FORMAT_TYPES, ALLOWED_LANG_CODES } = require("../models/LearningModule");
const { GovScheme } = require("../models/GovScheme");
const { User } = require("../models/User");
const { UserProgress } = require("../models/UserProgress");
const { requireAuthentication, requireCsrf, optionalAuthentication } = require("../middleware/authenticate");
const { uploadStreamToCloudinary, deleteCloudinaryAsset } = require("../config/cloudinary");
const env = require("../config/env");

const router = express.Router();

const LANG_CODE_MAP = {
  en: ["en", "english"],
  hi: ["hi", "hindi"],
  or: ["or", "odia", "oriya"],
};

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max
  },
  fileFilter: (req, file, cb) => {
    const isVideo =
      (file.mimetype && file.mimetype.startsWith("video/")) ||
      /\.(mp4|webm|mov|mkv|ogg|avi|m4v)$/i.test(file.originalname);

    if (!isVideo) {
      const err = new Error("Invalid file format. Please upload a video file (.mp4, .webm, .mov, .mkv).");
      err.code = "INVALID_FILE_TYPE";
      return cb(err, false);
    }
    cb(null, true);
  },
});

function handleVideoUpload(req, res, next) {
  upload.single("video")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: {
            code: "FILE_TOO_LARGE",
            message: "Video file exceeds the 100MB size limit.",
          },
        });
      }
      if (err.code === "INVALID_FILE_TYPE") {
        return res.status(400).json({
          error: {
            code: "INVALID_FILE_TYPE",
            message: err.message,
          },
        });
      }
      return res.status(400).json({
        error: {
          code: "UPLOAD_ERROR",
          message: err.message || "Failed to process video upload.",
        },
      });
    }
    next();
  });
}

function normalizeVideoUrl(url) {
  if (typeof url !== "string") return "";
  const trimmed = url.trim();

  // YouTube watch / share link -> embed link
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  // Vimeo watch link -> embed link
  const vimeoMatch = trimmed.match(
    /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/i
  );
  if (vimeoMatch && vimeoMatch[3]) {
    return `https://player.vimeo.com/video/${vimeoMatch[3]}`;
  }

  return trimmed;
}

function validateModuleData(body, isUpdate = false) {
  const errors = [];
  const {
    title,
    category,
    desc,
    videoUrl,
    videoSourceType,
    duration,
    difficulty,
    langCode,
    format,
    takeaways,
  } = body ?? {};

  if (!isUpdate || title !== undefined) {
    if (typeof title !== "string" || title.trim().length < 3 || title.trim().length > 150) {
      errors.push("title must be between 3 and 150 characters");
    }
  }

  if (!isUpdate || category !== undefined) {
    if (typeof category !== "string" || category.trim().length < 2 || category.trim().length > 60) {
      errors.push("category must be between 2 and 60 characters");
    }
  }

  if (!isUpdate || desc !== undefined) {
    if (typeof desc !== "string" || desc.trim().length < 10 || desc.trim().length > 500) {
      errors.push("desc must be between 10 and 500 characters");
    }
  }

  if (format !== undefined && !FORMAT_TYPES.includes(format)) {
    errors.push(`format must be one of: ${FORMAT_TYPES.join(", ")}`);
  }

  const effectiveFormat = format || (isUpdate ? undefined : "Video");

  if (effectiveFormat === "Video" || (videoSourceType && videoSourceType !== "none")) {
    if (!isUpdate || videoUrl !== undefined) {
      if (typeof videoUrl !== "string" || !/^https?:\/\/.+/.test(videoUrl.trim())) {
        errors.push("A valid HTTP or HTTPS videoUrl is required for video materials");
      }
    }
  }

  if (duration !== undefined && (typeof duration !== "string" || duration.trim().length > 30)) {
    errors.push("duration must not exceed 30 characters");
  }

  if (difficulty !== undefined && !DIFFICULTY_LEVELS.includes(difficulty)) {
    errors.push(`difficulty must be one of: ${DIFFICULTY_LEVELS.join(", ")}`);
  }

  if (langCode !== undefined && !ALLOWED_LANG_CODES.includes(langCode)) {
    errors.push(`langCode must be one of: ${ALLOWED_LANG_CODES.join(", ")}`);
  }

  if (videoSourceType !== undefined && !["upload", "external", "none"].includes(videoSourceType)) {
    errors.push("videoSourceType must be 'upload', 'external', or 'none'");
  }

  if (
    takeaways !== undefined &&
    (!Array.isArray(takeaways) || takeaways.some((t) => typeof t !== "string" || t.trim().length === 0))
  ) {
    errors.push("takeaways must be an array of non-empty strings");
  }

  return errors;
}

function generateSlug(title) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  const suffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${suffix}`;
}

function verifyExpertPermission(user) {
  if (!user) {
    return {
      error: {
        status: 401,
        code: "UNAUTHORIZED",
        message: "Authentication required.",
      },
    };
  }

  if (user.role === "parent") {
    return {
      error: {
        status: 403,
        code: "FORBIDDEN",
        message: "Parents and unauthorized users cannot publish or manage learning resources.",
      },
    };
  }

  const isVerifiedExpert = user.isVerified === true || user.role === "admin";
  if (!isVerifiedExpert) {
    return {
      error: {
        status: 403,
        code: "EXPERT_VERIFICATION_REQUIRED",
        message:
          "Expert verification is required to publish or manage learning resources. Your credentials must be verified before publishing.",
      },
    };
  }

  return { success: true };
}

// -------------------------------------------------------------
// POST /api/v1/learning/upload-video (Direct Cloudinary upload)
// -------------------------------------------------------------
router.post(
  "/upload-video",
  requireAuthentication,
  requireCsrf,
  handleVideoUpload,
  async (req, res, next) => {
    const authCheck = verifyExpertPermission(req.auth.user);
    if (authCheck.error) {
      return res.status(authCheck.error.status).json({ error: authCheck.error });
    }

    if (!req.file) {
      return res.status(400).json({
        error: {
          code: "FILE_MISSING",
          message: "Please select a video file to upload.",
        },
      });
    }

    if (!env.cloudinary.isConfigured) {
      return res.status(503).json({
        error: {
          code: "CLOUDINARY_NOT_CONFIGURED",
          message:
            "Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing or incomplete in backend/.env.",
        },
      });
    }

    try {
      const result = await uploadStreamToCloudinary(req.file.buffer);
      const durationStr = result.duration
        ? `${Math.max(1, Math.round(result.duration / 60))} min`
        : "15 min";

      return res.status(200).json({
        status: "success",
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          assetId: result.asset_id,
          format: result.format,
          duration: durationStr,
          bytes: result.bytes,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

// -------------------------------------------------------------
// GET /api/v1/learning/my-modules (Author's published materials)
// -------------------------------------------------------------
router.get("/my-modules", requireAuthentication, async (req, res, next) => {
  try {
    const authCheck = verifyExpertPermission(req.auth.user);
    if (authCheck.error) {
      return res.status(authCheck.error.status).json({ error: authCheck.error });
    }

    const modules = await LearningModule.find({ authorId: req.auth.user._id })
      .populate("authorId", "name role isVerified")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      results: modules.length,
      data: {
        modules: modules.map((m) => m.toSafeObject()),
      },
    });
  } catch (error) {
    return next(error);
  }
});

// -------------------------------------------------------------
// GET /api/v1/learning/progress (Current user's learning progress summary)
// -------------------------------------------------------------
router.get("/progress", requireAuthentication, async (req, res, next) => {
  try {
    const [totalModules, userProgressDocs] = await Promise.all([
      LearningModule.countDocuments({ isPublished: true }),
      UserProgress.find({ userId: req.auth.user._id }).populate("moduleId", "slug title category duration format"),
    ]);

    const completedDocs = userProgressDocs.filter((p) => p.isCompleted);
    const completedCount = completedDocs.length;
    const progressPercent = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
    const completedModuleIds = completedDocs.map((p) => p.moduleId?._id?.toString() || p.moduleId?.toString());
    const completedSlugs = completedDocs.map((p) => p.moduleId?.slug).filter(Boolean);

    return res.status(200).json({
      status: "success",
      data: {
        totalModules,
        completedCount,
        progressPercent,
        completedModuleIds,
        completedSlugs,
        items: userProgressDocs.map((p) => ({
          id: p._id.toString(),
          moduleId: p.moduleId?._id?.toString() || p.moduleId?.toString(),
          slug: p.moduleId?.slug || null,
          title: p.moduleId?.title || null,
          category: p.moduleId?.category || null,
          format: p.moduleId?.format || null,
          isCompleted: Boolean(p.isCompleted),
          progressPercent: p.progressPercent,
          completedAt: p.completedAt,
        })),
      },
    });
  } catch (error) {
    return next(error);
  }
});

// -------------------------------------------------------------
// GET /api/v1/learning/modules (Public list with optional user progress)
// -------------------------------------------------------------
router.get("/modules", optionalAuthentication, async (req, res, next) => {
  try {
    const { category, lang, format, source } = req.query;
    const filter = { isPublished: true };

    if (source && source.trim().toLowerCase() !== "all") {
      const normalizedSource = source.trim().toLowerCase();
      if (normalizedSource === "foundation" || normalizedSource === "official") {
        filter.authorId = null;
      } else if (normalizedSource === "educator" || normalizedSource === "contributions") {
        filter.authorId = { $ne: null };
      }
    }

    if (category && category.trim().toLowerCase() !== "all") {
      filter.category = new RegExp(`^${category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    }

    if (format && format.trim().toLowerCase() !== "all") {
      filter.format = new RegExp(`^${format.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    }

    if (lang && lang.trim().toLowerCase() !== "all") {
      const normalizedLang = lang.trim().toLowerCase();
      const mapped = LANG_CODE_MAP[normalizedLang] || [normalizedLang];
      filter.$or = [
        { langCode: { $in: mapped } },
        { language: new RegExp(`^(${mapped.join("|")})$`, "i") },
      ];
    }

    const modules = await LearningModule.find(filter)
      .populate("authorId", "name role isVerified")
      .sort({ createdAt: -1 });

    const progressMap = new Map();
    if (req.auth?.user) {
      const userProgressDocs = await UserProgress.find({
        userId: req.auth.user._id,
        moduleId: { $in: modules.map((m) => m._id) },
      });
      userProgressDocs.forEach((p) => {
        progressMap.set(p.moduleId.toString(), p);
      });
    }

    const safeModules = modules.map((m) => {
      const safe = m.toSafeObject();
      const prog = progressMap.get(m._id.toString());
      return {
        ...safe,
        progress: prog ? prog.progressPercent : 0,
        isCompleted: prog ? Boolean(prog.isCompleted) : false,
        completedAt: prog?.completedAt || null,
      };
    });

    return res.status(200).json({
      status: "success",
      results: safeModules.length,
      data: {
        modules: safeModules,
      },
    });
  } catch (error) {
    return next(error);
  }
});

// -------------------------------------------------------------
// POST /api/v1/learning/modules/:id/complete (Mark complete / update completion status)
// -------------------------------------------------------------
router.post("/modules/:id/complete", requireAuthentication, requireCsrf, async (req, res, next) => {
  try {
    const rawId = req.params.id?.trim();
    if (!rawId) {
      return res.status(400).json({
        error: {
          code: "INVALID_MODULE_ID",
          message: "Module ID or slug is required.",
        },
      });
    }

    const isObjectId = mongoose.isValidObjectId(rawId);
    const query = isObjectId
      ? { $or: [{ _id: rawId }, { slug: rawId.toLowerCase() }] }
      : { slug: rawId.toLowerCase() };

    const moduleDoc = await LearningModule.findOne(query);
    if (!moduleDoc || !moduleDoc.isPublished) {
      return res.status(404).json({
        error: {
          code: "MODULE_NOT_FOUND",
          message: "The requested learning module was not found.",
        },
      });
    }

    const isCompleted = req.body?.isCompleted !== undefined ? Boolean(req.body.isCompleted) : true;
    const progressPercent =
      typeof req.body?.progressPercent === "number"
        ? Math.min(100, Math.max(0, req.body.progressPercent))
        : isCompleted
        ? 100
        : 0;
    const completedAt = isCompleted ? new Date() : null;

    const progressRecord = await UserProgress.findOneAndUpdate(
      { userId: req.auth.user._id, moduleId: moduleDoc._id },
      {
        $set: {
          isCompleted,
          progressPercent,
          completedAt,
        },
      },
      { returnDocument: "after", upsert: true, runValidators: true }
    );

    const [totalModules, userCompletedCount] = await Promise.all([
      LearningModule.countDocuments({ isPublished: true }),
      UserProgress.countDocuments({ userId: req.auth.user._id, isCompleted: true }),
    ]);
    const overallProgressPercent = totalModules > 0 ? Math.round((userCompletedCount / totalModules) * 100) : 0;

    return res.status(200).json({
      status: "success",
      data: {
        moduleId: moduleDoc._id.toString(),
        slug: moduleDoc.slug,
        isCompleted: progressRecord.isCompleted,
        completed: progressRecord.isCompleted,
        progressPercent: progressRecord.progressPercent,
        completedAt: progressRecord.completedAt,
        overallProgress: {
          totalModules,
          completedCount: userCompletedCount,
          progressPercent: overallProgressPercent,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
});

// -------------------------------------------------------------
// GET /api/v1/learning/modules/:id (Public single module with optional user progress)
// -------------------------------------------------------------
router.get("/modules/:id", optionalAuthentication, async (req, res, next) => {
  try {
    const rawId = req.params.id.trim();
    const isObjectId = mongoose.isValidObjectId(rawId);

    const query = isObjectId
      ? { $or: [{ _id: rawId }, { slug: rawId.toLowerCase() }] }
      : { slug: rawId.toLowerCase() };

    const moduleDoc = await LearningModule.findOne(query).populate("authorId", "name role isVerified");

    if (!moduleDoc || !moduleDoc.isPublished) {
      return res.status(404).json({
        error: {
          code: "MODULE_NOT_FOUND",
          message: "The requested learning module was not found.",
        },
      });
    }

    let progressInfo = { progress: 0, isCompleted: false, completedAt: null };
    if (req.auth?.user) {
      const prog = await UserProgress.findOne({
        userId: req.auth.user._id,
        moduleId: moduleDoc._id,
      });
      if (prog) {
        progressInfo = {
          progress: prog.progressPercent,
          isCompleted: Boolean(prog.isCompleted),
          completedAt: prog.completedAt || null,
        };
      }
    }

    return res.status(200).json({
      status: "success",
      data: {
        module: {
          ...moduleDoc.toSafeObject(),
          ...progressInfo,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
});

// -------------------------------------------------------------
// POST /api/v1/learning/modules (Verified experts only)
// -------------------------------------------------------------
router.post("/modules", requireAuthentication, requireCsrf, async (req, res, next) => {
  const user = req.auth.user;
  const authCheck = verifyExpertPermission(user);
  if (authCheck.error) {
    return res.status(authCheck.error.status).json({ error: authCheck.error });
  }

  const errors = validateModuleData(req.body, false);
  if (errors.length > 0) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Learning module details are invalid.",
        details: errors,
      },
    });
  }

  try {
    const slug = generateSlug(req.body.title);
    const videoSourceType = req.body.videoSourceType || (req.body.cloudinaryPublicId ? "upload" : "external");
    const rawVideoUrl = req.body.videoUrl?.trim() || "";
    const videoUrl = videoSourceType === "external" ? normalizeVideoUrl(rawVideoUrl) : rawVideoUrl;

    const newModule = await LearningModule.create({
      slug,
      title: req.body.title.trim(),
      category: req.body.category.trim(),
      desc: req.body.desc.trim(),
      videoUrl,
      videoSourceType,
      cloudinaryPublicId: req.body.cloudinaryPublicId?.trim() || null,
      cloudinaryAssetId: req.body.cloudinaryAssetId?.trim() || null,
      duration: req.body.duration?.trim() || "15 min",
      difficulty: req.body.difficulty || "Beginner",
      language: req.body.language?.trim() || "English",
      langCode: req.body.langCode || "en",
      format: req.body.format || "Video",
      sourceOrg: req.body.sourceOrg?.trim() || user.name,
      tagline: req.body.tagline?.trim() || "",
      about: req.body.about?.trim() || "",
      takeaways: Array.isArray(req.body.takeaways) ? req.body.takeaways.map((t) => t.trim()) : [],
      isDiagnostic: Boolean(req.body.isDiagnostic),
      authorId: user._id,
      publishedBy: user.name,
      isPublished: true,
    });

    await newModule.populate("authorId", "name role isVerified");

    return res.status(201).json({
      status: "success",
      data: {
        module: newModule.toSafeObject(),
      },
    });
  } catch (error) {
    return next(error);
  }
});

// -------------------------------------------------------------
// PUT /api/v1/learning/modules/:id (Update authored material)
// -------------------------------------------------------------
router.put("/modules/:id", requireAuthentication, requireCsrf, async (req, res, next) => {
  const user = req.auth.user;
  const authCheck = verifyExpertPermission(user);
  if (authCheck.error) {
    return res.status(authCheck.error.status).json({ error: authCheck.error });
  }

  const rawId = req.params.id.trim();
  const isObjectId = mongoose.isValidObjectId(rawId);
  const query = isObjectId ? { $or: [{ _id: rawId }, { slug: rawId.toLowerCase() }] } : { slug: rawId.toLowerCase() };

  try {
    const moduleDoc = await LearningModule.findOne(query);
    if (!moduleDoc) {
      return res.status(404).json({
        error: {
          code: "MODULE_NOT_FOUND",
          message: "The requested learning module was not found.",
        },
      });
    }

    const isOwner = moduleDoc.authorId && moduleDoc.authorId.toString() === user._id.toString();
    const isAdmin = user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "You can only edit your own learning materials.",
        },
      });
    }

    const errors = validateModuleData(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Learning module details are invalid.",
          details: errors,
        },
      });
    }

    // If new Cloudinary asset provided and different from existing one, remove old one
    if (
      req.body.cloudinaryPublicId !== undefined &&
      moduleDoc.cloudinaryPublicId &&
      req.body.cloudinaryPublicId !== moduleDoc.cloudinaryPublicId
    ) {
      await deleteCloudinaryAsset(moduleDoc.cloudinaryPublicId);
    }

    if (req.body.title !== undefined) moduleDoc.title = req.body.title.trim();
    if (req.body.category !== undefined) moduleDoc.category = req.body.category.trim();
    if (req.body.desc !== undefined) moduleDoc.desc = req.body.desc.trim();
    if (req.body.format !== undefined) moduleDoc.format = req.body.format;
    if (req.body.videoSourceType !== undefined) moduleDoc.videoSourceType = req.body.videoSourceType;

    if (req.body.videoUrl !== undefined) {
      const source = req.body.videoSourceType || moduleDoc.videoSourceType;
      const rawUrl = req.body.videoUrl.trim();
      moduleDoc.videoUrl = source === "external" ? normalizeVideoUrl(rawUrl) : rawUrl;
    }

    if (req.body.cloudinaryPublicId !== undefined) {
      moduleDoc.cloudinaryPublicId = req.body.cloudinaryPublicId?.trim() || null;
    }
    if (req.body.cloudinaryAssetId !== undefined) {
      moduleDoc.cloudinaryAssetId = req.body.cloudinaryAssetId?.trim() || null;
    }

    if (req.body.duration !== undefined) moduleDoc.duration = req.body.duration.trim();
    if (req.body.difficulty !== undefined) moduleDoc.difficulty = req.body.difficulty;
    if (req.body.language !== undefined) moduleDoc.language = req.body.language.trim();
    if (req.body.langCode !== undefined) moduleDoc.langCode = req.body.langCode;
    if (req.body.sourceOrg !== undefined) moduleDoc.sourceOrg = req.body.sourceOrg.trim();
    if (req.body.tagline !== undefined) moduleDoc.tagline = req.body.tagline.trim();
    if (req.body.about !== undefined) moduleDoc.about = req.body.about.trim();
    if (req.body.takeaways !== undefined) moduleDoc.takeaways = req.body.takeaways.map((t) => t.trim());
    if (req.body.isDiagnostic !== undefined) moduleDoc.isDiagnostic = Boolean(req.body.isDiagnostic);

    await moduleDoc.save();
    await moduleDoc.populate("authorId", "name role isVerified");

    return res.status(200).json({
      status: "success",
      data: {
        module: moduleDoc.toSafeObject(),
      },
    });
  } catch (error) {
    return next(error);
  }
});

// -------------------------------------------------------------
// DELETE /api/v1/learning/modules/:id (Delete authored material)
// -------------------------------------------------------------
router.delete("/modules/:id", requireAuthentication, requireCsrf, async (req, res, next) => {
  const user = req.auth.user;
  const authCheck = verifyExpertPermission(user);
  if (authCheck.error) {
    return res.status(authCheck.error.status).json({ error: authCheck.error });
  }

  const rawId = req.params.id.trim();
  const isObjectId = mongoose.isValidObjectId(rawId);
  const query = isObjectId ? { $or: [{ _id: rawId }, { slug: rawId.toLowerCase() }] } : { slug: rawId.toLowerCase() };

  try {
    const moduleDoc = await LearningModule.findOne(query);
    if (!moduleDoc) {
      return res.status(404).json({
        error: {
          code: "MODULE_NOT_FOUND",
          message: "The requested learning module was not found.",
        },
      });
    }

    const isOwner = moduleDoc.authorId && moduleDoc.authorId.toString() === user._id.toString();
    const isAdmin = user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "You can only delete your own learning materials.",
        },
      });
    }

    if (moduleDoc.cloudinaryPublicId) {
      await deleteCloudinaryAsset(moduleDoc.cloudinaryPublicId);
    }

    await LearningModule.deleteOne({ _id: moduleDoc._id });

    return res.status(200).json({
      status: "success",
      message: "Learning material deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
});

// -------------------------------------------------------------
// GET /api/v1/learning/schemes (Public government schemes)
// -------------------------------------------------------------
router.get("/schemes", async (req, res, next) => {
  try {
    const { tag } = req.query;
    const filter = {};

    if (tag) {
      filter.tag = new RegExp(`^${tag.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    }

    const schemes = await GovScheme.find(filter).sort({ order: 1 });

    return res.status(200).json({
      status: "success",
      results: schemes.length,
      data: {
        schemes: schemes.map((s) => s.toSafeObject()),
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
