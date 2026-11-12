const mongoose = require("mongoose");

const TIERS = ["platinum", "gold", "silver", "bronze"];

const sponsorSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    tier: { type: String, enum: TIERS, default: "bronze" },
    website: { type: String, trim: true, maxlength: 300, default: "" },
    contactEmail: { type: String, trim: true, lowercase: true, maxlength: 200, default: "" },
    boothNumber: { type: String, trim: true, maxlength: 20, default: "" },
    // Integration commitments: logo on main screen, keynote mention, booth, swag, etc.
    deliverables: { type: [String], default: [] },
  },
  { timestamps: true }
);

sponsorSchema.index({ event: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Sponsor", sponsorSchema);
module.exports.TIERS = TIERS;
