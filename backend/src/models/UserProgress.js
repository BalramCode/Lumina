const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearningModule",
      required: true,
      index: true,
    },
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

userProgressSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    moduleId: this.moduleId.toString(),
    progressPercent: this.progressPercent,
    isCompleted: Boolean(this.isCompleted),
    completedAt: this.completedAt,
    updatedAt: this.updatedAt,
  };
};

const UserProgress = mongoose.model("UserProgress", userProgressSchema);

module.exports = { UserProgress };
