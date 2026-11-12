const mongoose = require("mongoose");

const SESSION_TYPES = ["keynote", "talk", "workshop", "panel", "break", "networking"];

const sessionSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    type: { type: String, enum: SESSION_TYPES, default: "talk" },
    stage: { type: String, required: true, trim: true, maxlength: 80 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    speaker: {
      name: { type: String, trim: true, maxlength: 100, default: "" },
      title: { type: String, trim: true, maxlength: 100, default: "" },
      company: { type: String, trim: true, maxlength: 100, default: "" },
      bio: { type: String, trim: true, maxlength: 1000, default: "" },
    },
    avNotes: { type: String, trim: true, maxlength: 1000, default: "" },
  },
  { timestamps: true }
);

sessionSchema.index({ event: 1, stage: 1, startTime: 1 });

module.exports = mongoose.model("Session", sessionSchema);
module.exports.SESSION_TYPES = SESSION_TYPES;
