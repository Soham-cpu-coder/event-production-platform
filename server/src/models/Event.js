const mongoose = require("mongoose");

const stageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    capacity: { type: Number, min: 0, default: 0 },
    // Production notes: lighting, LED walls, mics, streaming, translation booths, etc.
    avRequirements: { type: String, trim: true, maxlength: 1000, default: "" },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, trim: true, maxlength: 4000, default: "" },
    venue: { type: String, required: true, trim: true, maxlength: 200 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["draft", "published", "completed"], default: "draft", index: true },
    stages: { type: [stageSchema], default: [] },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

eventSchema.pre("validate", function checkDates(next) {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate("endDate", "endDate must be on or after startDate");
  }
  next();
});

module.exports = mongoose.model("Event", eventSchema);
