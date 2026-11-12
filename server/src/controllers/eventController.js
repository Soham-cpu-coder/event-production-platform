const Event = require("../models/Event");
const Session = require("../models/Session");
const Sponsor = require("../models/Sponsor");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const canManage = (user, event) =>
  user && (user.role === "admin" || String(event.organizer) === String(user.id));

// Loads an event and enforces ownership. Used by event, session and sponsor controllers.
async function getManagedEvent(eventId, user) {
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, "Event not found");
  if (!canManage(user, event)) throw new ApiError(403, "You can only manage your own events");
  return event;
}

exports.getManagedEvent = getManagedEvent;

exports.list = asyncHandler(async (req, res) => {
  const { status, mine, page, limit } = req.query;
  const filter = {};

  if (mine === "true") {
    if (!req.user) throw new ApiError(401, "Authentication required");
    filter.organizer = req.user.id;
    if (status) filter.status = status;
  } else {
    // Public listing only ever exposes published events.
    filter.status = "published";
  }

  const [items, total] = await Promise.all([
    Event.find(filter)
      .sort({ startDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("organizer", "name"),
    Event.countDocuments(filter),
  ]);

  res.json({ success: true, items, page, limit, total, pages: Math.ceil(total / limit) });
});

exports.get = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate("organizer", "name");
  if (!event) throw new ApiError(404, "Event not found");
  if (event.status !== "published" && !canManage(req.user, { organizer: event.organizer._id })) {
    throw new ApiError(404, "Event not found");
  }

  const [sessions, sponsors] = await Promise.all([
    Session.find({ event: event.id }).sort({ startTime: 1 }),
    Sponsor.find({ event: event.id }).sort({ tier: 1, name: 1 }),
  ]);
  res.json({ success: true, event, sessions, sponsors });
});

exports.create = asyncHandler(async (req, res) => {
  const event = await Event.create({ ...req.body, organizer: req.user.id });
  res.status(201).json({ success: true, event });
});

exports.update = asyncHandler(async (req, res) => {
  const event = await getManagedEvent(req.params.id, req.user);
  event.set(req.body);
  await event.save();
  res.json({ success: true, event });
});

exports.remove = asyncHandler(async (req, res) => {
  const event = await getManagedEvent(req.params.id, req.user);
  await Promise.all([Session.deleteMany({ event: event.id }), Sponsor.deleteMany({ event: event.id })]);
  await event.deleteOne();
  res.json({ success: true, message: "Event deleted" });
});
