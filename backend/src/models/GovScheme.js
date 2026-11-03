const mongoose = require("mongoose");

const govSchemeSchema = new mongoose.Schema(
  {
    schemeId: {
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
      minlength: 2,
      maxlength: 100,
    },
    desc: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 500,
    },
    tag: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

govSchemeSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this.schemeId,
    _id: this._id.toString(),
    schemeId: this.schemeId,
    title: this.title,
    desc: this.desc,
    tag: this.tag,
    order: this.order,
  };
};

const GovScheme = mongoose.model("GovScheme", govSchemeSchema);

module.exports = { GovScheme };
