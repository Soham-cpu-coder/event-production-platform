const Sponsor = require("../models/Sponsor");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { getManagedEvent } = require("./eventController");

exports.list = asyncHandler(async (req, res) => {
  const sponsors = await Sponsor.find({ event: req.params.eventId }).sort({ tier: 1, name: 1 });
  res.json({ success: true, items: sponsors });
});

exports.create = asyncHandler(async (req, res) => {
  const event = await getManagedEvent(req.params.eventId, req.user);
  const sponsor = await Sponsor.create({ ...req.body, event: event.id });
  res.status(201).json({ success: true, sponsor });
});

exports.update = asyncHandler(async (req, res) => {
  const event = await getManagedEvent(req.params.eventId, req.user);
  const sponsor = await Sponsor.findOne({ _id: req.params.id, event: event.id });
  if (!sponsor) throw new ApiError(404, "Sponsor not found");
  sponsor.set(req.body);
  await sponsor.save();
  res.json({ success: true, sponsor });
});

exports.remove = asyncHandler(async (req, res) => {
  const event = await getManagedEvent(req.params.eventId, req.user);
  const sponsor = await Sponsor.findOneAndDelete({ _id: req.params.id, event: event.id });
  if (!sponsor) throw new ApiError(404, "Sponsor not found");
  res.json({ success: true, message: "Sponsor deleted" });
});
