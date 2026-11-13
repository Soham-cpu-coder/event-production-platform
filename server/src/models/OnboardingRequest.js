const mongoose = require("mongoose");

const EVENT_TYPES = [
  "conference",
  "product-launch",
  "summit",
  "townhall",
  "exhibition",
  "other",
];

const VENUE_STATUSES = ["booked", "shortlisted", "need-help"];

const SERVICES = [
  "staging",
  "audio-visual",
  "keynote-management",
  "sponsor-integration",
  "streaming",
  "registration",
];

const BUDGET_RANGES = [
  "under-50k",
  "50k-100k",
  "100k-250k",
  "250k-500k",
  "500k-plus",
];

const STATUSES = ["new", "contacted", "in-review", "onboarded", "declined"];

const onboardingRequestSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    contactName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },
    eventType: {
      type: String,
      required: true,
      enum: EVENT_TYPES,
    },
    expectedAttendees: {
      type: Number,
      required: true,
      min: 1,
      max: 1000000,
    },
    preferredStartDate: {
      type: Date,
    },
    durationDays: {
      type: Number,
      min: 1,
      max: 30,
    },
    venueStatus: {
      type: String,
      required: true,
      enum: VENUE_STATUSES,
    },
    services: {
      type: [String],
      enum: SERVICES,
      default: [],
    },
    budgetRange: {
      type: String,
      enum: BUDGET_RANGES,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    status: {
      type: String,
      enum: STATUSES,
      default: "new",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OnboardingRequest", onboardingRequestSchema);
module.exports.EVENT_TYPES = EVENT_TYPES;
module.exports.VENUE_STATUSES = VENUE_STATUSES;
module.exports.SERVICES = SERVICES;
module.exports.BUDGET_RANGES = BUDGET_RANGES;
module.exports.STATUSES = STATUSES;
