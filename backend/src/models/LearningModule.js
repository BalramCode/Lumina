const mongoose = require("mongoose");

const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const FORMAT_TYPES = ["Video", "Audio", "Reading", "Guide", "Checklist", "Post"];
const ALLOWED_LANG_CODES = ["en", "hi", "or"];

const learningModuleSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
      index: true,
    },
    desc: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 500,
    },
    duration: {
      type: String,
      trim: true,
      default: "15 min",
    },
    difficulty: {
      type: String,
      enum: DIFFICULTY_LEVELS,
      default: "Beginner",
    },
    language: {
      type: String,
      trim: true,
      default: "English",
    },
    langCode: {
      type: String,
      enum: ALLOWED_LANG_CODES,
      default: "en",
      index: true,
    },
    format: {
      type: String,
      enum: FORMAT_TYPES,
      default: "Video",
    },
    videoSourceType: {
      type: String,
      enum: ["upload", "external", "none"],
      default: "external",
    },
    videoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    cloudinaryPublicId: {
      type: String,
      default: null,
      trim: true,
    },
    cloudinaryAssetId: {
      type: String,
      default: null,
      trim: true,
    },
    sourceOrg: {
      type: String,
      trim: true,
      default: "Project Lumina",
    },
    tagline: {
      type: String,
      trim: true,
      default: "",
    },
    about: {
      type: String,
      trim: true,
      default: "",
    },
    takeaways: {
      type: [String],
      default: [],
    },
    isDiagnostic: {
      type: Boolean,
      default: false,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    publishedBy: {
      type: String,
      trim: true,
      default: "Lumina Editorial",
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

learningModuleSchema.methods.toSafeObject = function toSafeObject() {
  const isAuthorPopulated =
    this.authorId &&
    typeof this.authorId === "object" &&
    (this.authorId._id || this.authorId.name !== undefined);

  let authorIdStr = null;
  let authorObj = null;

  if (isAuthorPopulated) {
    authorIdStr = this.authorId._id ? this.authorId._id.toString() : null;
    authorObj = {
      id: authorIdStr,
      name: this.authorId.name || "",
      role: this.authorId.role || "",
      isVerified: Boolean(this.authorId.isVerified),
    };
  } else if (this.authorId) {
    authorIdStr = this.authorId.toString();
  }

  const isOfficial = !authorIdStr;
  const isEducatorContribution = Boolean(authorIdStr);
  const isVerifiedAuthor = Boolean(authorObj?.isVerified);

  return {
    id: this.slug || this._id.toString(),
    _id: this._id.toString(),
    slug: this.slug,
    title: this.title,
    category: this.category,
    desc: this.desc,
    duration: this.duration,
    difficulty: this.difficulty,
    language: this.language,
    langCode: this.langCode,
    format: this.format,
    videoSourceType: this.videoSourceType || "external",
    videoUrl: this.videoUrl,
    cloudinaryPublicId: this.cloudinaryPublicId || null,
    cloudinaryAssetId: this.cloudinaryAssetId || null,
    sourceOrg: this.sourceOrg,
    tagline: this.tagline,
    about: this.about,
    takeaways: this.takeaways,
    isDiagnostic: Boolean(this.isDiagnostic),
    authorId: authorIdStr,
    author: authorObj,
    isOfficial,
    isEducatorContribution,
    isVerifiedAuthor,
    publishedBy: this.publishedBy,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const LearningModule = mongoose.model("LearningModule", learningModuleSchema);

module.exports = {
  LearningModule,
  DIFFICULTY_LEVELS,
  FORMAT_TYPES,
  ALLOWED_LANG_CODES,
};

